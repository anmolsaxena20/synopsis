import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import LandingPage from './LandingPage'

function InputField({ label, type = 'text', placeholder, value, onChange, error }) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className="space-y-1.5 animate-fade-up">
      <label className="block text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <input
          type={isPassword && showPassword ? 'text' : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 placeholder-slate-400 transition-colors duration-150 outline-none ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
              : 'border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10'
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-700 transition-colors p-1"
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}

export default function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({
    companyName: '', name: '', email: '', password: '', confirmPassword: '',
  })

  function validateLogin() {
    const e = {}
    if (!loginForm.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(loginForm.email)) e.email = 'Enter a valid email'
    if (!loginForm.password) e.password = 'Password is required'
    return e
  }

  function validateRegister() {
    const e = {}
    if (!registerForm.companyName) e.companyName = 'Company name is required'
    if (!registerForm.name) e.name = 'Your name is required'
    if (!registerForm.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(registerForm.email)) e.email = 'Enter a valid email'
    if (!registerForm.password) e.password = 'Password is required'
    else if (registerForm.password.length < 8) e.password = 'Minimum 8 characters'
    if (registerForm.confirmPassword !== registerForm.password) e.confirmPassword = "Passwords don't match"
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setApiError('')
    const errs = mode === 'login' ? validateLogin() : validateRegister()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)

    try {
      if (mode === 'login') {
        const res = await api.post('/auth/login', {
          email: loginForm.email,
          password: loginForm.password,
        })
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        navigate('/app/dashboard')
      } else {
        const res = await api.post('/auth/register', {
          companyName: registerForm.companyName,
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password,
        })
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        navigate('/app/dashboard')
      }
    } catch (err) {
      setApiError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function switchMode(m) {
    setMode(m)
    setErrors({})
    setApiError('')
  }

  function handleBack() {
    if (window.history.length > 1) navigate(-1)
    else navigate('/')
  }

  const trustPoints = [
    'Workspace-level role controls',
    'Encrypted at rest and in transit',
    'No model training on your contracts',
    'Searchable cross-team contract history',
  ]

  return (
    <div className="min-h-screen relative selection:bg-blue-100 selection:text-blue-900">
      <div className="absolute inset-0 auth-landing auth-bg-enter pointer-events-none overflow-hidden">
        <LandingPage />
      </div>
      <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px] auth-overlay-enter" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-10 auth-overlay-enter">
        <div className="w-full max-w-6xl grid lg:grid-cols-[1fr_420px] border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-2xl auth-modal auth-modal-enter">
        <div className="px-6 sm:px-10 lg:px-12 py-8 lg:py-10">
          <div className="flex items-center justify-between mb-7">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-8 h-8 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2.5 mb-7 cursor-pointer w-fit">
            <svg width="30" height="30" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="7" fill="#2563EB" />
              <path d="M7 9h14M7 14h10M7 19h7" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <circle cx="20" cy="19" r="3" fill="#60A5FA" />
            </svg>
            <span className="font-bold text-slate-900 text-lg tracking-tight">ContractScan</span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full">AI</span>
          </div>

          <div className="mb-6 animate-fade-up delay-100">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {mode === 'login' ? 'Sign in to your workspace' : 'Create your workspace account'}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {mode === 'login'
                ? 'Access contract history, risk dashboards, and team workflows.'
                : 'Start reviewing vendor contracts with a structured legal risk workflow.'}
            </p>
          </div>

          <div className="mb-6 animate-fade-up delay-100">
            <div className="inline-flex items-center bg-slate-100 border border-slate-200 rounded-lg p-1">
              {['login', 'register'].map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`px-5 py-2 rounded-md text-sm font-semibold transition-all duration-150 ${
                    mode === m ? 'bg-white border border-slate-200 text-blue-700' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>
          </div>

          {apiError && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm font-medium text-red-700 animate-fade-up">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4 animate-fade-up delay-200">
              {mode === 'register' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Company Name"
                    placeholder="Acme Corporation"
                    value={registerForm.companyName}
                    onChange={(e) => setRegisterForm((f) => ({ ...f, companyName: e.target.value }))}
                    error={errors.companyName}
                  />
                  <InputField
                    label="Full Name"
                    placeholder="Arpit Sharma"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm((f) => ({ ...f, name: e.target.value }))}
                    error={errors.name}
                  />
                </div>
              )}

              <InputField
                label="Work Email"
                type="email"
                placeholder="you@company.com"
                value={mode === 'login' ? loginForm.email : registerForm.email}
                onChange={(e) => (
                  mode === 'login'
                    ? setLoginForm((f) => ({ ...f, email: e.target.value }))
                    : setRegisterForm((f) => ({ ...f, email: e.target.value }))
                )}
                error={errors.email}
              />

              <InputField
                label="Password"
                type="password"
                placeholder={mode === 'register' ? 'Minimum 8 characters' : 'Enter your password'}
                value={mode === 'login' ? loginForm.password : registerForm.password}
                onChange={(e) => (
                  mode === 'login'
                    ? setLoginForm((f) => ({ ...f, password: e.target.value }))
                    : setRegisterForm((f) => ({ ...f, password: e.target.value }))
                )}
                error={errors.password}
              />

              {mode === 'register' && (
                <InputField
                  label="Confirm Password"
                  type="password"
                  placeholder="Repeat your password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  error={errors.confirmPassword}
                />
              )}
            </div>

            {mode === 'login' && (
              <div className="flex justify-end animate-fade-up delay-300">
                <button type="button" className="text-sm text-blue-700 hover:text-blue-800 font-medium transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            <div className="pt-1 animate-fade-up delay-300">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg text-sm font-semibold text-white transition-colors duration-150 ${
                  loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2.5">
                    <svg className="animate-spin w-4.5 h-4.5 text-white/90" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                      <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </div>
          </form>

          <p className="mt-7 text-sm text-slate-500 animate-fade-up delay-300">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="text-blue-700 font-semibold hover:text-blue-800 transition-colors"
            >
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>

        <div className="hidden lg:flex bg-slate-900 text-slate-100 p-10 border-l border-slate-800 flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-slate-400 font-semibold mb-4">
              Legal Operations Platform
            </p>
            <h2 className="text-2xl font-semibold leading-tight">
              Enterprise-grade contract risk workflow for procurement teams.
            </h2>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              Review vendor terms faster, keep your legal position consistent, and maintain shared institutional context across every contract decision.
            </p>
          </div>

          <div className="space-y-3">
            {trustPoints.map((item) => (
              <div key={item} className="flex items-start gap-2.5 border border-slate-700 rounded-lg px-3.5 py-3 bg-slate-800/45">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                <p className="text-sm text-slate-200">{item}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400 border-t border-slate-800 pt-5">
            Trusted by procurement and legal teams at growth-stage companies.
          </p>
        </div>
      </div>
      </div>

      <style>{`
        .auth-landing > * {
          transform: scale(1.02);
          transform-origin: center top;
          filter: saturate(0.9);
        }
        .auth-bg-enter {
          animation: authBgEnter 260ms ease-out forwards;
        }
        .auth-overlay-enter {
          animation: authOverlayEnter 260ms ease-out forwards;
        }
        .auth-modal-enter {
          animation: authModalEnter 320ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .auth-modal {
          max-height: min(880px, calc(100vh - 32px));
          overflow: auto;
        }
        @keyframes authBgEnter {
          from { opacity: 0; transform: scale(1.01); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes authOverlayEnter {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes authModalEnter {
          from { opacity: 0; transform: translateY(10px) scale(0.985); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fadeUp 0.42s ease-out forwards;
          opacity: 0;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        @media (max-width: 1023px) {
          .auth-modal {
            max-height: calc(100vh - 20px);
          }
        }
      `}</style>
    </div>
  )
}
