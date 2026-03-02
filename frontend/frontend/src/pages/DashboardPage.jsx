import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { RadialBarChart, RadialBar, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../api/axios'

const RISK_COLORS = {
  CRITICAL: { bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500'    },
  HIGH:     { bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500'  },
  MEDIUM:   { bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500'   },
  LOW:      { bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500'  },
}

function RiskBadge({ level }) {
  const c = RISK_COLORS[level] || RISK_COLORS.LOW
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {level}
    </span>
  )
}

function SkeletonBlock({ className }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
}

function ClauseDrawer({ clause, onClose }) {
  if (!clause) return null
  const c = RISK_COLORS[clause.riskLevel] || RISK_COLORS.LOW

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-20 transition-opacity duration-200"
        onClick={onClose}
      />
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-30 flex flex-col"
        style={{ animation: 'slideIn 0.25s ease-out' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-400 mb-1">Clause Detail</p>
            <h3 className="text-base font-bold text-gray-900">{clause.clauseType}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all duration-150"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <div className="flex items-center gap-3">
            <RiskBadge level={clause.riskLevel} />
            <span className="text-sm text-gray-400">Risk Score: <span className="font-semibold text-gray-700">{clause.riskScore ?? '—'}</span></span>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Extracted Text</p>
            <div className={`p-4 rounded-xl text-sm text-gray-700 leading-relaxed border ${c.bg} ${c.border}`}>
              "{clause.extractedText}"
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Why This Is Risky</p>
            <p className="text-sm text-gray-700 leading-relaxed">{clause.explanation}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Negotiation Recommendation</p>
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800 leading-relaxed">
              {clause.negotiationRecommendation}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100">
          <button
            onClick={() => navigator.clipboard.writeText(clause.negotiationRecommendation)}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 transition-all duration-150"
          >
            Copy Negotiation Language
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}

function getRiskColor(score) {
  if (score >= 66) return '#ef4444'
  if (score >= 31) return '#f59e0b'
  return '#22c55e'
}

export default function DashboardPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const contractId = searchParams.get('id')

  const [contract, setContract] = useState(null)
  const [loading, setLoading] = useState(true)
  const [polling, setPolling] = useState(false)
  const [selectedClause, setSelectedClause] = useState(null)
  const [filterRisk, setFilterRisk] = useState('ALL')
  const [sortBy, setSortBy] = useState('riskScore')

  useEffect(() => {
    if (!contractId) { setLoading(false); return }
    fetchContract()
  }, [contractId])

  async function fetchContract() {
    try {
      const res = await api.get(`/contracts/${contractId}`)
      setContract(res.data)
      if (res.data.status === 'PROCESSING' || res.data.status === 'PENDING') {
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
      const res = await api.get(`/contracts/${contractId}`)
      setContract(res.data)
      if (res.data.status === 'DONE' || res.data.status === 'ERROR') {
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
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">No contract selected</h2>
        <p className="text-sm text-gray-500 mb-6">Upload a contract or select one from your history to see its analysis.</p>
        <button
          onClick={() => navigate('/upload')}
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all duration-150"
        >
          Upload Contract
        </button>
      </div>
    )
  }

  if (loading || polling) {
    return (
      <div className="space-y-6">
        <SkeletonBlock className="h-8 w-64" />
        <div className="grid grid-cols-3 gap-4">
          <SkeletonBlock className="h-48 col-span-1" />
          <SkeletonBlock className="h-48 col-span-2" />
        </div>
        <SkeletonBlock className="h-64" />
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
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Analysis failed</h2>
        <p className="text-sm text-gray-500 mb-6">{contract?.errorMessage || 'Something went wrong during analysis.'}</p>
        <button
          onClick={() => navigate('/upload')}
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all duration-150"
        >
          Try Again
        </button>
      </div>
    )
  }

  const gaugeData = [{ value: contract.overallRiskScore, fill: getRiskColor(contract.overallRiskScore) }]

  const dimensionData = [
    { name: 'Liability',    score: contract.liabilityScore      ?? 0 },
    { name: 'Renewal',      score: contract.renewalRiskScore    ?? 0 },
    { name: 'IP Ownership', score: contract.ipOwnershipScore    ?? 0 },
    { name: 'Termination',  score: contract.terminationScore    ?? 0 },
    { name: 'Payment',      score: contract.paymentExposureScore ?? 0 },
  ]

  const filteredClauses = (contract.clauses || [])
    .filter(c => filterRisk === 'ALL' || c.riskLevel === filterRisk)
    .sort((a, b) => {
      const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
      if (sortBy === 'riskScore') return (b.riskScore ?? 0) - (a.riskScore ?? 0)
      return order[a.riskLevel] - order[b.riskLevel]
    })

  return (
    <div className="space-y-6" style={{ animation: 'fadeIn 0.3s ease-out' }}>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{contract.title || contract.fileName}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {contract.vendorName && <span className="font-medium text-gray-700">{contract.vendorName} · </span>}
            Analyzed {new Date(contract.analyzedAt || contract.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => navigate('/history')}
          className="text-sm text-blue-600 font-medium hover:underline transition-colors"
        >
          ← Back to History
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col items-center">
          <p className="text-sm font-semibold text-gray-500 mb-4">Overall Risk Score</p>
          <div className="relative w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%" cy="50%"
                innerRadius="70%" outerRadius="100%"
                startAngle={180} endAngle={-180}
                data={gaugeData}
                barSize={12}
              >
                <RadialBar dataKey="value" cornerRadius={6} background={{ fill: '#f3f4f6' }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold" style={{ color: getRiskColor(contract.overallRiskScore) }}>
                {contract.overallRiskScore}
              </span>
              <span className="text-xs text-gray-400">/ 100</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            <RiskBadge level={
              contract.overallRiskScore >= 66 ? 'CRITICAL' :
              contract.overallRiskScore >= 31 ? 'HIGH' : 'LOW'
            } />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Executive Summary</p>
            <p className="text-sm text-gray-700 leading-relaxed">{contract.executiveSummary}</p>
          </div>

          {contract.redFlags?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Red Flags</p>
              <div className="space-y-2">
                {contract.redFlags.map((flag, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-lg">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p className="text-sm text-red-700">{flag}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Dimension Scores</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={dimensionData} layout="vertical" margin={{ left: 16, right: 16 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#374151' }} axisLine={false} tickLine={false} width={90} />
            <Tooltip
              cursor={{ fill: '#f9fafb' }}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
            <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={16}>
              {dimensionData.map((entry, i) => (
                <Cell key={i} fill={getRiskColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm font-bold text-gray-900">
            Clause Breakdown
            <span className="ml-2 text-xs font-normal text-gray-400">{filteredClauses.length} clauses</span>
          </p>
          <div className="flex items-center gap-3">
            <select
              value={filterRisk}
              onChange={e => setFilterRisk(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 outline-none focus:border-blue-400 transition-all duration-150 bg-white"
            >
              <option value="ALL">All Risks</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 outline-none focus:border-blue-400 transition-all duration-150 bg-white"
            >
              <option value="riskScore">Sort by Score</option>
              <option value="riskLevel">Sort by Level</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {filteredClauses.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-400">No clauses found for this filter.</div>
          ) : (
            filteredClauses.map((clause) => (
              <div
                key={clause.id}
                onClick={() => setSelectedClause(clause)}
                className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-all duration-150 group"
              >
                <RiskBadge level={clause.riskLevel} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{clause.clauseType}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{clause.extractedText}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 group-hover:text-blue-500 transition-colors">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            ))
          )}
        </div>
      </div>

      <ClauseDrawer clause={selectedClause} onClose={() => setSelectedClause(null)} />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}