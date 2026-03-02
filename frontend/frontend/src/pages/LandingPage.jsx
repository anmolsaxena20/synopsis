import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  const features = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      title: 'Analyze in 60 Seconds',
      desc: 'Upload any vendor PDF and get a full structured risk report before your next meeting.',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
      title: '17+ Clause Types Detected',
      desc: 'Auto-Renewal, Liability Cap, IP Ownership, Termination, Payment Terms and more — all flagged automatically.',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87"/>
          <path d="M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
      title: 'Built for Teams',
      desc: 'Invite your procurement and legal team. Every analysis is stored and searchable across your workspace.',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      ),
      title: 'Negotiation Language Included',
      desc: 'Every risky clause comes with a specific redline recommendation you can copy and send to the vendor.',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
      ),
      title: 'Risk Scoring Dashboard',
      desc: 'Visual risk gauge, dimension scores across 5 categories, and red flag alerts — all in one hero screen.',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
      title: 'Secure & Private',
      desc: 'Your contracts are encrypted in transit and at rest. We never train on your data.',
    },
  ]

  const stats = [
    { value: '60s', label: 'Average analysis time' },
    { value: '17+', label: 'Clause types detected' },
    { value: '$299', label: 'Per month flat pricing' },
    { value: '100%', label: 'Structured JSON output' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => navigate('/')}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="transition-transform duration-300 group-hover:scale-105">
              <rect width="28" height="28" rx="7" fill="#2563EB"/>
              <path d="M7 9h14M7 14h10M7 19h7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="20" cy="19" r="3" fill="#60A5FA"/>
            </svg>
            <span className="font-bold text-gray-900 text-[15px] tracking-tight">ContractScan</span>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">AI</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/auth')}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98]"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 py-28 text-center relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-gray-50 to-gray-50 opacity-70"></div>
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-blue-50/80 backdrop-blur-sm border border-blue-100/50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Powered by GPT-4o
          </div>
        </div>
        <h1 className="animate-fade-up delay-100 text-5xl md:text-6xl font-extrabold text-gray-900 leading-[1.15] tracking-tight mb-6 max-w-4xl mx-auto">
          Know your contract risks<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">before you sign.</span>
        </h1>
        <p className="animate-fade-up delay-200 text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          ContractScan AI analyzes vendor contracts in under 60 seconds — flagging risky clauses, scoring your exposure, and giving you negotiation language to push back.
        </p>
        <div className="animate-fade-up delay-300 flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => navigate('/auth')}
            className="px-8 py-4 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all duration-200 active:scale-[0.98] shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Start Analyzing Free
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="px-8 py-4 bg-white text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow"
          >
            See a Sample Report →
          </button>
        </div>
      </section>

      <section className="bg-white border-y border-gray-200 relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, idx) => (
            <div 
              key={s.label} 
              className="text-center animate-fade-up"
              style={{ animationDelay: `${(idx + 4) * 100}ms` }}
            >
              <p className="text-4xl font-extrabold text-blue-600 mb-2 tracking-tight">{s.value}</p>
              <p className="text-sm font-medium text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-28">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Everything your team needs</h2>
          <p className="text-gray-500 text-base md:text-lg max-w-xl mx-auto">
            No more $500/hour outside counsel for routine vendor agreements.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <div
              key={f.title}
              className="group bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:bg-blue-100">
                {f.icon}
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-28">
        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] px-10 py-16 text-center overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-indigo-900/20 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 animate-fade-up">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">Ready to scan your first contract?</h2>
            <p className="text-blue-100 text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              It takes 30 seconds to sign up and under 60 seconds to get your first risk report.
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="px-8 py-4 bg-white text-blue-700 text-sm font-bold rounded-xl hover:bg-gray-50 hover:shadow-lg transition-all duration-200 active:scale-[0.98] hover:-translate-y-0.5"
            >
              Get Started — It's Free
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="7" fill="#2563EB"/>
              <path d="M7 9h14M7 14h10M7 19h7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="20" cy="19" r="3" fill="#60A5FA"/>
            </svg>
            <span className="text-sm font-bold text-gray-900">ContractScan AI</span>
          </div>
          <p className="text-sm font-medium text-gray-400">© 2026 ContractScan AI. Built for the hackathon.</p>
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
      `}</style>
    </div>
  )
}