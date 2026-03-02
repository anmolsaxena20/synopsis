import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axios'

function normalizeRiskLevel(value) {
  const raw = String(value || '').trim().toUpperCase()
  if (raw.includes('CRIT')) return 'CRITICAL'
  if (raw.includes('HIGH')) return 'HIGH'
  if (raw.includes('MED')) return 'MEDIUM'
  return 'LOW'
}

function getRiskTone(score) {
  if ((score ?? 0) >= 66) return { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', label: 'CRITICAL' }
  if ((score ?? 0) >= 31) return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', label: 'HIGH' }
  return { text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', label: 'LOW' }
}

function countByRisk(clauses = []) {
  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }
  clauses.forEach((c) => {
    const level = normalizeRiskLevel(c.riskLevel || c.risk_level)
    counts[level] += 1
  })
  return counts
}

function ContractCard({ contract }) {
  const tone = getRiskTone(contract.overallRiskScore)
  const counts = countByRisk(contract.clauses || [])
  const redFlags = contract.redFlags || []

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Contract</p>
        <h2 className="text-lg font-bold text-gray-900 mt-1 truncate">{contract.title || contract.fileName}</h2>
        <p className="text-sm text-gray-500 mt-0.5 truncate">{contract.vendorName || '-'}</p>
      </div>

      <div className={`rounded-xl border p-4 ${tone.bg} ${tone.border}`}>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Overall Risk Score</p>
        <div className="flex items-end gap-2 mt-1">
          <span className={`text-3xl font-bold ${tone.text}`}>{contract.overallRiskScore ?? '-'}</span>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${tone.bg} ${tone.border} ${tone.text}`}>{tone.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {Object.entries(counts).map(([k, v]) => (
          <div key={k} className="bg-gray-50 border border-gray-100 rounded-lg p-2 text-center">
            <p className="text-sm font-bold text-gray-900">{v}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{k}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Top Red Flags</p>
        {redFlags.length === 0 ? (
          <p className="text-sm text-gray-500">No red flags provided.</p>
        ) : (
          <div className="space-y-2">
            {redFlags.slice(0, 3).map((flag, idx) => (
              <p key={idx} className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-lg p-2.5">
                {flag}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ComparePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const ids = useMemo(() => {
    const raw = searchParams.get('ids') || ''
    return raw.split(',').map((v) => v.trim()).filter(Boolean).slice(0, 2)
  }, [searchParams])

  useEffect(() => {
    if (ids.length !== 2) {
      setError('Please select exactly two contracts to compare.')
      setLoading(false)
      return
    }

    const load = async () => {
      try {
        const [a, b] = await Promise.all([api.get(`/contracts/${ids[0]}`), api.get(`/contracts/${ids[1]}`)])
        setContracts([a.data, b.data])
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load contracts for comparison.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [ids])

  const summary = useMemo(() => {
    if (contracts.length !== 2) return null
    const [left, right] = contracts
    const delta = (right.overallRiskScore ?? 0) - (left.overallRiskScore ?? 0)
    const direction = delta > 0 ? 'higher risk' : delta < 0 ? 'lower risk' : 'same risk'
    const abs = Math.abs(delta)
    const leftClauses = left.clauses?.length || 0
    const rightClauses = right.clauses?.length || 0
    return { delta, direction, abs, leftClauses, rightClauses }
  }, [contracts])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-72 bg-gray-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || contracts.length !== 2) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Compare unavailable</h2>
        <p className="text-sm text-gray-500 mb-6">{error || 'Unable to compare selected contracts.'}</p>
        <button onClick={() => navigate('/app/history')} className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all">
          Back to History
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compare Contracts</h1>
          <p className="text-sm text-gray-500 mt-1">Side-by-side risk view for negotiation and revision tracking.</p>
        </div>
        <button onClick={() => navigate('/app/history')} className="text-sm text-blue-700 font-semibold hover:underline">
          Back to History
        </button>
      </div>

      {summary && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-700">
            Contract B has{' '}
            <span className="font-semibold text-gray-900">
              {summary.delta === 0 ? summary.direction : `${summary.abs} points ${summary.direction}`}
            </span>{' '}
            than Contract A.
            {' '}Clause count: A={summary.leftClauses}, B={summary.rightClauses}.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ContractCard contract={contracts[0]} />
        <ContractCard contract={contracts[1]} />
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
