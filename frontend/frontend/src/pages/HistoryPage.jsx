
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

const RISK_COLORS = {
  CRITICAL: { bg: 'bg-rose-50/70', text: 'text-rose-700', border: 'border-rose-200/70', dot: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.55)]' },
  HIGH:     { bg: 'bg-orange-50/70', text: 'text-orange-700', border: 'border-orange-200/70', dot: 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.55)]' },
  MEDIUM:   { bg: 'bg-indigo-50/70', text: 'text-indigo-700', border: 'border-indigo-200/70', dot: 'bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.55)]' },
  LOW:      { bg: 'bg-emerald-50/70', text: 'text-emerald-700', border: 'border-emerald-200/70', dot: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.55)]' },
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
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold border backdrop-blur-sm transition-all ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {score ?? '—'}
    </span>
  )
}

function SkeletonRow() {
  return (
    <div className="px-6 py-5 flex items-center gap-4 border-b border-blue-50">
      <div className="animate-pulse bg-blue-100 rounded-lg h-5 w-48" />
      <div className="animate-pulse bg-blue-100 rounded-lg h-5 w-32 ml-auto" />
      <div className="animate-pulse bg-blue-100 rounded-full h-8 w-16" />
      <div className="animate-pulse bg-blue-100 rounded-lg h-5 w-5" />
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    DONE:       { gradient: 'from-emerald-400 to-emerald-600', label: 'Done' },
    PROCESSING: { gradient: 'from-blue-500 to-indigo-600',   label: 'Processing' },
    PENDING:    { gradient: 'from-slate-400 to-slate-500',    label: 'Pending' },
    ERROR:      { gradient: 'from-rose-400 to-rose-600',      label: 'Error' },
  }
  const s = map[status] || map.PENDING
  return (
    <span className={`text-[10px] uppercase tracking-wider font-black px-2.5 py-1 rounded-md text-white shadow-sm bg-gradient-to-br ${s.gradient}`}>
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

  const filtered = contracts.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !q || c.fileName?.toLowerCase().includes(q) || c.vendorName?.toLowerCase().includes(q) || c.title?.toLowerCase().includes(q)
    const matchStatus = filterStatus === 'ALL' || c.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 px-6 py-10">
      <div className="space-y-8 max-w-7xl mx-auto pb-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Contract <span className="text-blue-600">History</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">Review and manage your analyzed legal documents.</p>
          </div>

          <button
            onClick={() => navigate('/app/upload')}
            className="group relative flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold rounded-2xl overflow-hidden transition-all hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-blue-200"
          >
            <svg className="relative z-10" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span className="relative z-10">New Contract</span>
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white/70 backdrop-blur-xl border border-blue-100 rounded-[2.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.08)] overflow-hidden">

          {/* Search */}
          <div className="px-8 py-6 border-b border-blue-100 flex items-center gap-4 flex-wrap bg-blue-50/40">
            <div className="relative flex-1 min-w-70">
              <input
                type="text"
                placeholder="Filter by vendor, title or filename..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-4 pr-4 py-3.5 text-sm font-medium border border-blue-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition bg-white shadow-inner"
              />
            </div>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="text-sm font-bold border border-blue-200 rounded-2xl px-5 py-3.5 text-slate-600 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition bg-white cursor-pointer shadow-sm"
            >
              <option value="ALL">All Status</option>
              <option value="DONE">Done</option>
              <option value="PROCESSING">Processing</option>
              <option value="ERROR">Error</option>
            </select>
          </div>

          {/* Rows */}
          <div className="divide-y divide-blue-50">
            {loading ? (
              [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
            ) : filtered.map(contract => (
              <div
                key={contract.id}
                onClick={() => contract.status === 'DONE' && navigate(`/app/dashboard?id=${contract.id}`)}
                className="grid grid-cols-12 gap-4 px-10 py-6 items-center hover:bg-blue-50/50 transition-all cursor-pointer group"
              >
                <div className="col-span-4">
                  <p className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                    {contract.title || contract.fileName}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-1">{contract.fileName}</p>
                </div>

                <div className="col-span-2 text-sm text-slate-600">
                  {contract.vendorName || '—'}
                </div>

                <div className="col-span-2 text-sm text-slate-500">
                  {new Date(contract.uploadedAt).toLocaleDateString('en-IN')}
                </div>

                <div className="col-span-2">
                  {contract.status === 'DONE'
                    ? <RiskBadge score={contract.overallRiskScore} />
                    : <span className="text-slate-200">—</span>}
                </div>

                <div className="col-span-2 flex items-center justify-between">
                  <StatusBadge status={contract.status} />

                  <button
                    onClick={e => { e.stopPropagation(); setConfirmDelete(contract.id) }}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delete Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-blue-900/30 backdrop-blur-md" onClick={() => setConfirmDelete(null)} />

            <div className="relative bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-md border border-blue-100">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Contract?</h3>
              <p className="text-slate-500 mb-6">This action cannot be undone.</p>

              <div className="flex gap-4">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleDelete(confirmDelete)}
                  disabled={deleting === confirmDelete}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 transition disabled:opacity-50"
                >
                  {deleting === confirmDelete ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}