import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

const RISK_COLORS = {
  CRITICAL: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  HIGH: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  LOW: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
}

const STATUS_COLORS = {
  DONE: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Done' },
  PROCESSING: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Processing' },
  PENDING: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: 'Pending' },
  ERROR: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Error' },
}

function getRiskLevel(score) {
  if (score === null || score === undefined) return 'LOW'
  if (score >= 66) return 'CRITICAL'
  if (score >= 31) return 'HIGH'
  return 'LOW'
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function RiskBadge({ score }) {
  const level = getRiskLevel(score)
  const c = RISK_COLORS[level]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {score ?? '-'}
    </span>
  )
}

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.PENDING
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}>
      {s.label}
    </span>
  )
}

function StatCard({ label, value, hint }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="px-6 py-4 flex items-center gap-4">
      <div className="animate-pulse bg-gray-100 rounded-lg h-4 w-44" />
      <div className="animate-pulse bg-gray-100 rounded-lg h-4 w-28 ml-auto" />
      <div className="animate-pulse bg-gray-100 rounded-full h-7 w-16" />
      <div className="animate-pulse bg-gray-100 rounded-lg h-4 w-4" />
    </div>
  )
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [sortBy, setSortBy] = useState('NEWEST')
  const [selectedIds, setSelectedIds] = useState([])
  const [deleting, setDeleting] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const searchRef = useRef(null)

  useEffect(() => {
    fetchContracts()
  }, [])

  async function fetchContracts() {
    try {
      const res = await api.get('/contracts')
      setContracts(res.data)
    } catch (error) {
      console.error('Failed to fetch contracts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    setDeleting(id)
    try {
      await api.delete(`/contracts/${id}`)
      setContracts((prev) => prev.filter((c) => c.id !== id))
      setSelectedIds((prev) => prev.filter((x) => x !== id))
    } catch (error) {
      console.error('Failed to delete contract:', error)
    } finally {
      setDeleting(null)
      setConfirmDelete(null)
    }
  }

  const stats = useMemo(() => {
    const total = contracts.length
    const done = contracts.filter((c) => c.status === 'DONE').length
    const processing = contracts.filter((c) => c.status === 'PROCESSING' || c.status === 'PENDING').length
    const critical = contracts.filter((c) => c.status === 'DONE' && (c.overallRiskScore ?? 0) >= 66).length
    return { total, done, processing, critical }
  }, [contracts])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    const list = contracts.filter((c) => {
      const matchSearch =
        !q ||
        c.fileName?.toLowerCase().includes(q) ||
        c.vendorName?.toLowerCase().includes(q) ||
        c.title?.toLowerCase().includes(q)
      const matchStatus = filterStatus === 'ALL' || c.status === filterStatus
      return matchSearch && matchStatus
    })

    list.sort((a, b) => {
      if (sortBy === 'OLDEST') {
        return new Date(a.uploadedAt || 0).getTime() - new Date(b.uploadedAt || 0).getTime()
      }
      if (sortBy === 'RISK_HIGH') {
        return (b.overallRiskScore ?? -1) - (a.overallRiskScore ?? -1)
      }
      return new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime()
    })
    return list
  }, [contracts, search, filterStatus, sortBy])

  const hasActiveFilters = search.trim().length > 0 || filterStatus !== 'ALL' || sortBy !== 'NEWEST'

  function toggleSelect(contract) {
    if (contract.status !== 'DONE') return
    setSelectedIds((prev) => {
      const exists = prev.includes(contract.id)
      if (exists) return prev.filter((x) => x !== contract.id)
      if (prev.length >= 2) return [prev[1], contract.id]
      return [...prev, contract.id]
    })
  }

  return (
    <div className="space-y-5" style={{ animation: 'fadeIn 0.28s ease-out' }}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-2xl font-bold text-gray-900">Contract History</h1>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full">Workspace</span>
          </div>
          <p className="text-sm text-gray-500">Track every uploaded contract, status, and final risk score.</p>
        </div>

        <button
          onClick={() => navigate('/app/upload')}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 active:scale-[0.98] transition-all duration-150"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Contract
        </button>
      </div>

      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-blue-800 font-medium">
            {selectedIds.length} selected for comparison
            {selectedIds.length < 2 ? ' (select one more DONE contract)' : ''}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Clear
            </button>
            <button
              disabled={selectedIds.length !== 2}
              onClick={() => navigate(`/app/compare?ids=${selectedIds.join(',')}`)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                selectedIds.length === 2
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-200 text-blue-500 cursor-not-allowed'
              }`}
            >
              Compare Selected
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Contracts" value={stats.total} />
        <StatCard label="Completed" value={stats.done} hint="Ready for review" />
        <StatCard label="In Progress" value={stats.processing} hint="Pending or processing" />
        <StatCard label="Critical Risk" value={stats.critical} hint="Score 66 or above" />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-52">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search by title, vendor, or filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-150 bg-white text-gray-900 placeholder-gray-400"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 outline-none focus:border-blue-400 transition-all duration-150 bg-white"
          >
            <option value="ALL">All Status</option>
            <option value="DONE">Done</option>
            <option value="PROCESSING">Processing</option>
            <option value="PENDING">Pending</option>
            <option value="ERROR">Error</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 outline-none focus:border-blue-400 transition-all duration-150 bg-white"
          >
            <option value="NEWEST">Newest First</option>
            <option value="OLDEST">Oldest First</option>
            <option value="RISK_HIGH">Highest Risk</option>
          </select>

          <div className="text-xs font-medium text-gray-400 px-2 py-1 bg-gray-50 border border-gray-100 rounded-md">
            {filtered.length} shown
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearch('')
                setFilterStatus('ALL')
                setSortBy('NEWEST')
                searchRef.current?.focus()
              }}
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100">
          <p className="col-span-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Select</p>
          <p className="col-span-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Contract</p>
          <p className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Vendor</p>
          <p className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Uploaded</p>
          <p className="col-span-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Score</p>
          <p className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</p>
          <p className="col-span-1" />
        </div>

        {loading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(6)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700">
              {search || filterStatus !== 'ALL' ? 'No contracts match your filters' : 'No contracts yet'}
            </p>
            <p className="text-xs text-gray-400 mt-1 mb-5">
              {search || filterStatus !== 'ALL' ? 'Try a broader query or clear filters.' : 'Upload your first contract to start analysis.'}
            </p>
            {!search && filterStatus === 'ALL' && (
              <button
                onClick={() => navigate('/app/upload')}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all duration-150"
              >
                Upload Contract
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((contract) => (
              <div
                key={contract.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-5 md:px-6 py-4 items-center hover:bg-gray-50 transition-all duration-150 group cursor-pointer"
                onClick={() => contract.status === 'DONE' && navigate(`/app/dashboard?id=${contract.id}`)}
              >
                <div className="md:col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(contract.id)}
                    disabled={contract.status !== 'DONE'}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleSelect(contract)}
                    className="w-4 h-4 accent-blue-600 rounded border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    title={contract.status === 'DONE' ? 'Select for compare' : 'Only DONE contracts can be compared'}
                  />
                </div>

                <div className="md:col-span-3 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-150">
                    {contract.title || contract.fileName}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{contract.fileName}</p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 truncate">{contract.vendorName || '-'}</p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">{formatDate(contract.uploadedAt)}</p>
                </div>

                <div className="md:col-span-1">
                  {contract.status === 'DONE' ? <RiskBadge score={contract.overallRiskScore} /> : <span className="text-xs text-gray-300">-</span>}
                </div>

                <div className="md:col-span-2">
                  <StatusBadge status={contract.status} />
                </div>

                <div className="md:col-span-1 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setConfirmDelete(contract.id)
                    }}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-150 md:opacity-0 md:group-hover:opacity-100"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmDelete && (
        <>
          <div className="fixed inset-0 bg-black/20 z-20" onClick={() => setConfirmDelete(null)} />
          <div className="fixed inset-0 z-30 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-full max-w-sm" style={{ animation: 'fadeUp 0.2s ease-out' }}>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Delete contract?</h3>
              <p className="text-sm text-gray-500 mb-6">This permanently removes the contract and all clause analysis. This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all duration-150"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  disabled={deleting === confirmDelete}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:bg-red-300 transition-all duration-150"
                >
                  {deleting === confirmDelete ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
