import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

const RISK_COLORS = {
  CRITICAL: { bg: 'bg-red-100',   text: 'text-red-700',   border: 'border-red-200',   dot: 'bg-red-500'   },
  HIGH:     { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  MEDIUM:   { bg: 'bg-blue-100',  text: 'text-blue-700',  border: 'border-blue-200',  dot: 'bg-blue-500'  },
  LOW:      { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
}

function getRiskLevel(score) {
  if (!score) return 'LOW'
  if (score >= 66) return 'CRITICAL'
  if (score >= 31) return 'HIGH'
  return 'LOW'
}

function RiskBadge({ score }) {
  const level = getRiskLevel(score)
  const c = RISK_COLORS[level]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {score ?? '—'}
    </span>
  )
}

function SkeletonRow() {
  return (
    <div className="px-6 py-4 flex items-center gap-4">
      <div className="animate-pulse bg-gray-100 rounded-lg h-4 w-48" />
      <div className="animate-pulse bg-gray-100 rounded-lg h-4 w-32 ml-auto" />
      <div className="animate-pulse bg-gray-100 rounded-full h-7 w-16" />
      <div className="animate-pulse bg-gray-100 rounded-lg h-4 w-4" />
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    DONE:       { bg: 'bg-green-100', text: 'text-green-700', label: 'Done'       },
    PROCESSING: { bg: 'bg-blue-100',  text: 'text-blue-700',  label: 'Processing' },
    PENDING:    { bg: 'bg-gray-100',  text: 'text-gray-600',  label: 'Pending'    },
    ERROR:      { bg: 'bg-red-100',   text: 'text-red-700',   label: 'Error'      },
  }
  const s = map[status] || map.PENDING
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  )
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [deleting, setDeleting] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    fetchContracts()
  }, [])

  async function fetchContracts() {
    try {
      const res = await api.get('/contracts')
      setContracts(res.data)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    setDeleting(id)
    try {
      await api.delete(`/contracts/${id}`)
      setContracts(prev => prev.filter(c => c.id !== id))
    } catch {
    } finally {
      setDeleting(null)
      setConfirmDelete(null)
    }
  }

  const filtered = contracts
    .filter(c => {
      const q = search.toLowerCase()
      const matchSearch = !q || c.fileName?.toLowerCase().includes(q) || c.vendorName?.toLowerCase().includes(q) || c.title?.toLowerCase().includes(q)
      const matchStatus = filterStatus === 'ALL' || c.status === filterStatus
      return matchSearch && matchStatus
    })

  return (
    <div className="space-y-6" style={{ animation: 'fadeIn 0.3s ease-out' }}>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contract History</h1>
          <p className="text-sm text-gray-500 mt-1">All contracts analyzed by your workspace.</p>
        </div>
        <button
          onClick={() => navigate('/upload')}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 active:scale-[0.98] transition-all duration-150"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Contract
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search by vendor or contract name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-150 bg-white text-gray-900 placeholder-gray-400"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 outline-none focus:border-blue-400 transition-all duration-150 bg-white"
          >
            <option value="ALL">All Status</option>
            <option value="DONE">Done</option>
            <option value="PROCESSING">Processing</option>
            <option value="ERROR">Error</option>
          </select>
        </div>

        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100">
          <p className="col-span-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Contract</p>
          <p className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Vendor</p>
          <p className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</p>
          <p className="col-span-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Score</p>
          <p className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</p>
          <p className="col-span-1" />
        </div>

        {loading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700">
              {search || filterStatus !== 'ALL' ? 'No contracts match your filters' : 'No contracts yet'}
            </p>
            <p className="text-xs text-gray-400 mt-1 mb-5">
              {search || filterStatus !== 'ALL' ? 'Try adjusting your search or filter.' : 'Upload your first contract to get started.'}
            </p>
            {!search && filterStatus === 'ALL' && (
              <button
                onClick={() => navigate('/upload')}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all duration-150"
              >
                Upload Contract
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(contract => (
              <div
                key={contract.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-all duration-150 group cursor-pointer"
                onClick={() => contract.status === 'DONE' && navigate(`/app/dashboard?id=${contract.id}`)}
              >
                <div className="col-span-4 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-150">
                    {contract.title || contract.fileName}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{contract.fileName}</p>
                </div>

                <div className="col-span-2">
                  <p className="text-sm text-gray-600 truncate">{contract.vendorName || '—'}</p>
                </div>

                <div className="col-span-2">
                  <p className="text-sm text-gray-500">
                    {new Date(contract.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                <div className="col-span-1">
                  {contract.status === 'DONE' ? (
                    <RiskBadge score={contract.overallRiskScore} />
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </div>

                <div className="col-span-2">
                  <StatusBadge status={contract.status} />
                </div>

                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={e => { e.stopPropagation(); setConfirmDelete(contract.id) }}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-150 opacity-0 group-hover:opacity-100"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4h6v2"/>
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
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4h6v2"/>
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Delete contract?</h3>
              <p className="text-sm text-gray-500 mb-6">This will permanently delete the contract and all its clause analysis. This cannot be undone.</p>
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
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-all duration-150"
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
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
