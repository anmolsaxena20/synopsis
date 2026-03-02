import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import contractHero from '../assets/contract-hero.png'

function Logo({ white = false }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="7" fill={white ? '#FFFFFF' : '#2563EB'} />
      <path d="M7 9h14M7 14h10M7 19h7" stroke={white ? '#0f172a' : 'white'} strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="19" r="3" fill="#60A5FA" />
    </svg>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const stats = [
    { value: '60s', label: 'Average analysis time' },
    { value: '17+', label: 'Clause types detected' },
    { value: '$299', label: 'Flat monthly price' },
    { value: '100%', label: 'Structured output' },
  ]

  const companyFeatures = [
    'Single shared workspace for the entire company',
    'All contracts stored and searchable in one place',
    'Team-wide contract history so anyone can view past analyses',
    'Role-based access control where Admins manage and Members view/upload',
    'Multi-member collaboration with unlimited teammate invites',
    'Contract library grows over time to build institutional knowledge',
    'Flat $299/month pricing with no per-analysis fees',
    'Reduces routine outside counsel spend ($300-$500/hour)',
    'Risk threshold visibility across vendor relationships',
    'Secure storage with encryption in transit and at rest',
    "Never trains on your company's contract data",
  ]

  const userFeatures = [
    'Upload any vendor PDF and get results in under 60 seconds',
    'Plain-English summaries with no legal background needed',
    'Instantly know if a contract is sign-ready or needs negotiation',
    'See exactly which clauses are risky and why',
    'Get specific negotiation language to send back to vendors',
    'Filter and sort clauses by risk level to prioritize quickly',
    'Copy redline recommendations to clipboard in one click',
    'Reopen past contract analyses without re-running AI',
    'Search contracts by vendor name or title instantly',
    'Works across SaaS agreements, services contracts, NDAs, and MSAs',
  ]

  const steps = [
    {
      step: '1',
      title: 'Upload Contract',
      desc: 'Upload any vendor PDF in a few seconds from your workspace.',
    },
    {
      step: '2',
      title: 'AI Risk Analysis',
      desc: 'ContractScan detects key clauses, scores risk, and summarizes findings.',
    },
    {
      step: '3',
      title: 'Negotiate Faster',
      desc: 'Use clear clause-by-clause recommendations with copy-ready language.',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      <header
        className={`sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-shadow duration-200 ${
          scrolled ? 'shadow-sm' : 'shadow-none'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-7">
            <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('/')}>
              <span className="transition-transform duration-200 group-hover:scale-[1.04]"><Logo /></span>
              <span className="font-bold text-[15px] tracking-tight">ContractScan</span>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100">AI</span>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              <a href="#features" className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-blue-600 transition-colors duration-150">
                Features
              </a>
              <a href="#pricing" className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-blue-600 transition-colors duration-150">
                Pricing
              </a>
              <a href="#how-it-works" className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-blue-600 transition-colors duration-150">
                How it Works
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/auth')}
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-150"
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-150"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative max-w-6xl mx-auto px-6 pt-16 pb-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-gray-50 to-gray-50 -z-10 pointer-events-none" />
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50/90 border border-blue-100 rounded-full px-3 py-1.5 mb-5 animate-fade-up">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                AI contract intelligence for procurement and legal
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-tight animate-fade-up delay-100">
                Know your contract risks{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  before you sign.
                </span>
              </h1>
              <p className="mt-5 text-base md:text-lg text-gray-600 leading-relaxed max-w-xl animate-fade-up delay-200">
                ContractScan analyzes vendor agreements in under a minute, flags risky clauses,
                and gives your team practical negotiation language.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 animate-fade-up delay-300">
                <button
                  onClick={() => navigate('/auth')}
                  className="px-6 py-3 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors duration-150"
                >
                  Start Free Trial
                </button>
                <a
                  href="#features"
                  className="px-6 py-3 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                >
                  Explore Features
                </a>
              </div>
            </div>

            <div className="relative pt-24 xl:pt-28">
              <img
                src={contractHero}
                alt="Contract hero visual"
                className="hidden lg:block absolute top-6 xl:top-8 right-2 xl:right-4 w-[430px] xl:w-[520px] max-w-none h-auto object-contain opacity-100 animate-fade-up delay-200 pointer-events-none select-none z-20"
              />
              <div className="bg-white/85 backdrop-blur-md rounded-2xl p-6 md:p-7 ring-1 ring-gray-900/5 shadow-[0_20px_50px_-12px_rgba(37,99,235,0.15)] animate-fade-up delay-300 hero-float">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Sample Analysis</p>
                  <h3 className="text-base font-bold text-gray-900 mt-1">Vendor Agreement Summary</h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                  High Risk
                </span>
              </div>
              <div className="space-y-3">
                {[
                  'Auto-renewal with a long notice period',
                  'Unlimited vendor liability carve-out',
                  'One-sided termination language',
                  'Payment terms favor vendor',
                ].map((line) => (
                  <div key={line} className="flex items-start gap-2.5 p-3 rounded-lg border border-gray-200 bg-gray-50">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{line}</p>
                  </div>
                ))}
              </div>
            </div>
            </div>
          </div>
        </section>

        <section className="border-y border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-6 py-9 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, idx) => (
              <div key={s.label} className="text-center animate-fade-up" style={{ animationDelay: `${idx * 80}ms` }}>
                <p className="text-3xl md:text-4xl font-extrabold text-blue-600 tracking-tight">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-16">
          <div className="mb-8 animate-fade-up">
            <h2 className="text-3xl font-extrabold tracking-tight">How it works</h2>
            <p className="mt-2 text-gray-600">From upload to negotiation-ready output in three steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {steps.map((item, idx) => (
              <div
                key={item.title}
                className="bg-white border border-gray-200 rounded-2xl p-5 animate-fade-up transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] hover:border-blue-200"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center mb-4">
                  {item.step}
                </div>
                <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="max-w-6xl mx-auto px-6 pb-16">
          <div className="mb-8 animate-fade-up">
            <h2 className="text-3xl font-extrabold tracking-tight">Features by who benefits</h2>
            <p className="mt-2 text-gray-600">Built for company-wide governance and day-to-day execution.</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 animate-fade-up transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] hover:border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 mb-1">For Companies</h3>
              <p className="text-sm text-gray-500 mb-5">Control, security, visibility, and predictable cost.</p>
              <div className="space-y-3">
                {companyFeatures.map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                    <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 animate-fade-up delay-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] hover:border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 mb-1">For Users</h3>
              <p className="text-sm text-gray-500 mb-5">Fast, clear, and actionable insights for each contract.</p>
              <div className="space-y-3">
                {userFeatures.map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                    <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="max-w-6xl mx-auto px-6 pb-16">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-10">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Pricing</p>
                <h2 className="text-3xl font-extrabold tracking-tight mt-2">Simple flat pricing for the full team</h2>
                <p className="mt-3 text-gray-600">
                  No per-analysis charges. No hidden usage tiers. One workspace plan for procurement and legal collaboration.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => navigate('/auth')}
                    className="px-6 py-3 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors duration-150"
                  >
                    Start Free Trial
                  </button>
                </div>
              </div>
              <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50">
                <p className="text-sm font-medium text-gray-500">Workspace Plan</p>
                <p className="text-4xl font-extrabold text-gray-900 mt-1">$299<span className="text-base font-semibold text-gray-500">/month</span></p>
                <div className="mt-5 space-y-2.5">
                  {[
                    'Unlimited teammates',
                    'Shared contract history and search',
                    'Clause-level risk analysis and recommendations',
                    'Encrypted storage and private data policy',
                  ].map((line) => (
                    <div key={line} className="flex items-start gap-2.5">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{line}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-900 rounded-[2rem] text-white p-8 md:p-12">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold tracking-[0.14em] uppercase text-blue-100">Final Call</p>
              <h2 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight">
                Review every contract with confidence.
              </h2>
              <p className="mt-3 text-blue-100 leading-relaxed">
                Bring legal-grade clarity to procurement decisions and move faster with less risk.
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="mt-7 px-6 py-3 rounded-full bg-white text-blue-700 text-sm font-semibold hover:bg-blue-50 transition-colors duration-150"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </section>
      </main>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-10 grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Logo white />
              <span className="text-sm font-bold text-white">ContractScan AI</span>
            </div>
            <p className="text-sm text-gray-400 max-w-md">
              AI-powered contract risk analysis for procurement and legal teams.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-white mb-3">Product</p>
            <div className="space-y-2">
              <a href="#features" className="block text-sm text-gray-400 hover:text-white transition-colors duration-150">Features</a>
              <a href="#how-it-works" className="block text-sm text-gray-400 hover:text-white transition-colors duration-150">How it Works</a>
              <a href="#pricing" className="block text-sm text-gray-400 hover:text-white transition-colors duration-150">Pricing</a>
              <button onClick={() => navigate('/auth')} className="block text-sm text-gray-400 hover:text-white transition-colors duration-150">
                Get Started
              </button>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-white mb-3">Legal & Trust</p>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-gray-400 hover:text-white transition-colors duration-150">Privacy Policy</a>
              <a href="#" className="block text-sm text-gray-400 hover:text-white transition-colors duration-150">Terms of Service</a>
              <a href="#" className="block text-sm text-gray-400 hover:text-white transition-colors duration-150">Security</a>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-white mb-3">Company</p>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-gray-400 hover:text-white transition-colors duration-150">About</a>
              <a href="mailto:hello@contractscan.ai" className="block text-sm text-gray-400 hover:text-white transition-colors duration-150">Contact</a>
              <p className="text-sm text-gray-400">Built at Hackathon 2026</p>
              <a href="#" className="block text-sm text-gray-400 hover:text-white transition-colors duration-150">GitHub</a>
              <a href="#" className="block text-sm text-gray-400 hover:text-white transition-colors duration-150">LinkedIn</a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-gray-600">(c) 2026 ContractScan AI</p>
            <p className="text-xs text-gray-600">Know risk before you sign</p>
          </div>
        </div>
      </footer>

      <style>{`
        html {
          scroll-behavior: smooth;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fadeUp 0.45s ease-out forwards;
          opacity: 0;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .hero-float {
          animation: float 3s ease-in-out infinite;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
      `}</style>
    </div>
  )
}
