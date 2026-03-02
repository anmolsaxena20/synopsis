import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Legend
} from 'recharts'
import api from '../api/axios'

const RISK = {
  CRITICAL: { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500',    hex: '#ef4444', light: '#fef2f2' },
  HIGH:     { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500',  hex: '#f59e0b', light: '#fffbeb' },
  MEDIUM:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500',   hex: '#3b82f6', light: '#eff6ff' },
  LOW:      { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500',  hex: '#22c55e', light: '#f0fdf4' },
}

function getRiskLevel(score) {
  if (score >= 66) return 'CRITICAL'
  if (score >= 31) return 'HIGH'
  return 'LOW'
}

function normalizeRiskLevel(value) {
  const raw = String(value || '').trim().toUpperCase()
  if (raw.includes('CRIT')) return 'CRITICAL'
  if (raw.includes('HIGH')) return 'HIGH'
  if (raw.includes('MED')) return 'MEDIUM'
  if (raw.includes('LOW')) return 'LOW'
  return 'LOW'
}

function getRiskColor(score) {
  if (score >= 66) return '#ef4444'
  if (score >= 31) return '#f59e0b'
  return '#22c55e'
}

function RiskBadge({ level }) {
  const c = RISK[level] || RISK.LOW
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {level}
    </span>
  )
}

function ScoreRing({ score, size = 160 }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const pct = Math.min(score || 0, 100) / 100
  const color = getRiskColor(score)
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
      <circle
        cx="60" cy="60" r={r} fill="none"
        stroke={color} strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        transform="rotate(-90 60 60)"
        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
      />
      <text x="60" y="55" textAnchor="middle" fontSize="22" fontWeight="800" fill={color}>{score}</text>
      <text x="60" y="70" textAnchor="middle" fontSize="10" fill="#9ca3af">/ 100</text>
    </svg>
  )
}

function StatCard({ label, value, sub, color = 'text-gray-900' }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function ClauseDrawer({ clause, onClose }) {
  if (!clause) return null
  const level = normalizeRiskLevel(clause.riskLevel)
  const c = RISK[level] || RISK.LOW
  return (
    <>
      <div className="fixed inset-0 bg-black/25 z-20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-30 flex flex-col" style={{ animation: 'slideIn 0.25s ease-out' }}>
        <div className={`px-6 py-5 border-b border-gray-100 ${c.bg}`}>
          <div className="flex items-start justify-between">
            <div>
              <RiskBadge level={level} />
              <h3 className="text-lg font-bold text-gray-900 mt-2">{clause.clauseType}</h3>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/60 text-gray-400 hover:text-gray-700 transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Extracted Text</p>
            <div className={`p-4 rounded-xl text-sm text-gray-700 leading-relaxed border ${c.bg} ${c.border} italic`}>
              "{clause.extractedText}"
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Why This Is Risky</p>
            <p className="text-sm text-gray-700 leading-relaxed">{clause.explanation}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Negotiation Recommendation</p>
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800 leading-relaxed">
              {clause.negotiationRecommendation}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={() => { navigator.clipboard.writeText(clause.negotiationRecommendation) }}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 transition-all"
          >
            Copy Negotiation Language
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all">
            Close
          </button>
        </div>
      </div>
      <style>{`@keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>
    </>
  )
}

function SkeletonBlock({ className }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-md text-xs">
        <p className="font-semibold text-gray-900">{payload[0].name}</p>
        <p className="text-gray-500">{payload[0].value} clause{payload[0].value !== 1 ? 's' : ''}</p>
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const contractId = searchParams.get('id')
  const emptyDonePollsRef = useRef(0)
  const MAX_EMPTY_DONE_POLLS = 10

  const [contract, setContract] = useState(null)
  const [loading, setLoading] = useState(true)
  const [polling, setPolling] = useState(false)
  const [selectedClause, setSelectedClause] = useState(null)
  const [filterRisk, setFilterRisk] = useState('ALL')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!contractId) { setLoading(false); return }
    emptyDonePollsRef.current = 0
    fetchContract()
  }, [contractId])

  function hasClauseData(data) {
    return Array.isArray(data?.clauses) && data.clauses.length > 0
  }

  async function fetchContract() {
    try {
      const res = await api.get(`/contracts/${contractId}`)
      setContract(res.data)
      if (res.data.status === 'PROCESSING' || res.data.status === 'PENDING') {
        setPolling(true)
      } else if (res.data.status === 'DONE' && !hasClauseData(res.data)) {
        // Sometimes DONE arrives before clause rows are persisted; keep polling briefly.
        setPolling(true)
      } else {
        setPolling(false)
        setLoading(false)
      }
    } catch {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!polling) return
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/contracts/${contractId}`)
        setContract(res.data)

        if (res.data.status === 'PROCESSING' || res.data.status === 'PENDING') return

        if (res.data.status === 'DONE' && !hasClauseData(res.data)) {
          emptyDonePollsRef.current += 1
          if (emptyDonePollsRef.current < MAX_EMPTY_DONE_POLLS) return
        }

        if (res.data.status === 'DONE' || res.data.status === 'ERROR') {
          setPolling(false)
          setLoading(false)
          clearInterval(interval)
        }
      } catch {
        setPolling(false)
        setLoading(false)
        clearInterval(interval)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [polling, contractId])

  if (!contractId) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-5">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No contract selected</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">Go to Contract History and click any analyzed contract, or upload a new one.</p>
        <div className="flex gap-3">
          <button onClick={() => navigate('/app/upload')} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all">Upload Contract</button>
          <button onClick={() => navigate('/app/history')} className="px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-all">View History</button>
        </div>
      </div>
    )
  }

  if (loading || polling) {
    return (
      <div className="space-y-5">
        <SkeletonBlock className="h-8 w-72" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-3 gap-5">
          <SkeletonBlock className="h-64" />
          <SkeletonBlock className="h-64 col-span-2" />
        </div>
        <SkeletonBlock className="h-72" />
        {polling && (
          <div className="flex items-center gap-3 text-sm text-blue-600 font-medium">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#2563eb" strokeOpacity="0.3" strokeWidth="3"/>
              <path d="M12 2a10 10 0 0110 10" stroke="#2563eb" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            AI is analyzing your contract — this takes about 30–60 seconds...
          </div>
        )}
      </div>
    )
  }

  if (!contract || contract.status === 'ERROR') {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-5">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Analysis failed</h2>
        <p className="text-sm text-gray-500 mb-6">{contract?.errorMessage || 'Something went wrong during analysis.'}</p>
        <button onClick={() => navigate('/app/upload')} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all">Try Again</button>
      </div>
    )
  }

  const clauses = contract.clauses || []
  const riskLevel = getRiskLevel(contract.overallRiskScore)

  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }
  clauses.forEach(c => {
    const level = normalizeRiskLevel(c.riskLevel)
    if (counts[level] !== undefined) counts[level]++
  })

  const pieData = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: k, value: v, color: RISK[k].hex }))

  const barData = clauses.map(c => ({
    name: c.clauseType.length > 14 ? c.clauseType.slice(0, 14) + '…' : c.clauseType,
    fullName: c.clauseType,
    risk: normalizeRiskLevel(c.riskLevel),
    fill: RISK[normalizeRiskLevel(c.riskLevel)]?.hex || '#9ca3af',
  }))

  const filtered = clauses.filter(c => filterRisk === 'ALL' || normalizeRiskLevel(c.riskLevel) === filterRisk)

  return (
    <div className="space-y-5" style={{ animation: 'fadeIn 0.3s ease-out' }}>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{contract.fileName}</h1>
            <RiskBadge level={riskLevel} />
          </div>
          <p className="text-sm text-gray-400">
            Analyzed {new Date(contract.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            {' · '}{clauses.length} clauses identified
          </p>
        </div>
        <button onClick={() => navigate('/app/history')} className="text-sm text-blue-600 font-medium hover:underline">← Back to History</button>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Overall Risk" value={contract.overallRiskScore} sub={riskLevel} color={`font-extrabold`} />
        <StatCard label="Critical Clauses" value={counts.CRITICAL} sub="Need immediate attention" color="text-red-600" />
        <StatCard label="High Risk Clauses" value={counts.HIGH} sub="Require negotiation" color="text-amber-600" />
        <StatCard label="Total Clauses" value={clauses.length} sub={`${counts.MEDIUM} medium · ${counts.LOW} low`} color="text-blue-600" />
      </div>

      {/* Risk Gauge + Executive Summary + Red Flags */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Gauge */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Risk Score</p>
          <ScoreRing score={contract.overallRiskScore} size={160} />
          <div className="mt-4">
            <RiskBadge level={riskLevel} />
          </div>
          <div className="mt-5 w-full grid grid-cols-4 gap-1">
            {Object.entries(counts).map(([level, count]) => (
              <div key={level} className="text-center">
                <div className="text-base font-bold" style={{ color: RISK[level].hex }}>{count}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{level.slice(0,4)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Executive Summary + Red Flags */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Executive Summary</p>
            <p className="text-sm text-gray-700 leading-relaxed">{contract.executiveSummary}</p>
          </div>

          {contract.redFlags?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                🚩 Red Flags ({contract.redFlags.length})
              </p>
              <div className="space-y-2">
                {contract.redFlags.map((flag, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p className="text-sm text-red-700">{flag}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Donut — risk distribution */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Risk Distribution</p>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={3}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-xs text-gray-600 font-medium">{d.name}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-900">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No clause data available</p>
          )}
        </div>

        {/* Bar — clause risk levels */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Clause Risk Overview</p>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData} margin={{ left: -20, right: 8 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={(_, __, props) => [props.payload.risk, 'Risk Level']}
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey={() => 1} radius={[4, 4, 0, 0]} barSize={20}>
                  {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No clause data available</p>
          )}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {Object.entries(RISK).map(([level, c]) => (
              <div key={level} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: c.hex }} />
                <span className="text-xs text-gray-500">{level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Clause Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-bold text-gray-900">Clause Breakdown</p>
            <p className="text-xs text-gray-400 mt-0.5">{filtered.length} of {clauses.length} clauses shown</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(level => (
              <button
                key={level}
                onClick={() => setFilterRisk(level)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  filterRisk === level
                    ? level === 'ALL'
                      ? 'bg-gray-900 text-white'
                      : `text-white`
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                style={filterRisk === level && level !== 'ALL' ? { background: RISK[level]?.hex } : {}}
              >
                {level === 'ALL' ? 'All' : `${level} (${counts[level]})`}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-400">No clauses for this filter.</div>
          ) : (
            filtered.map((clause, i) => {
              const level = normalizeRiskLevel(clause.riskLevel)
              const c = RISK[level] || RISK.LOW
              return (
                <div
                  key={clause.id || i}
                  onClick={() => setSelectedClause(clause)}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-all duration-150 group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-1 h-full min-h-8 rounded-full flex-shrink-0 mt-1`} style={{ background: c.hex, width: 3, minHeight: 40 }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                        <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{clause.clauseType}</p>
                        <RiskBadge level={level} />
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{clause.extractedText}</p>
                      <p className="text-xs text-gray-400 mt-1.5 italic line-clamp-1">{clause.explanation}</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-1 group-hover:stroke-blue-400 transition-colors">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <ClauseDrawer clause={selectedClause} onClose={() => setSelectedClause(null)} />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
