import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

function InputField({ label, type = 'text', placeholder, value, onChange, error }) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          type={isPassword && showPassword ? 'text' : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-2.5 text-sm rounded-lg border bg-white text-gray-900 placeholder-gray-400 transition-all duration-150 outline-none ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
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
        navigate('/dashboard')
      } else {
        const res = await api.post('/auth/register', {
          companyName: registerForm.companyName,
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password,
        })
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        navigate('/dashboard')
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

  const stats = [
    { value: '60s', label: 'Average analysis time' },
    { value: '17+', label: 'Clause types detected' },
    { value: '$299', label: 'Per month, all features' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex"
        style={{ minHeight: '580px', animation: 'fadeUp 0.3s ease-out' }}
      >
        <div className="flex-1 flex flex-col justify-center px-10 py-12">
          <div className="flex items-center gap-2.5 mb-8">
            <svg width="30" height="30" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="7" fill="#2563EB"/>
              <path d="M7 9h14M7 14h10M7 19h7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="20" cy="19" r="3" fill="#60A5FA"/>
            </svg>
            <span className="font-bold text-gray-900 text-lg tracking-tight">ContractScan</span>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">AI</span>
          </div>
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-sm text-gray-500">
              {mode === 'login'
                ? 'Sign in to your workspace to continue.'
                : 'Start analyzing contracts in under 60 seconds.'}
            </p>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6 w-fit">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`px-5 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>
          {apiError && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {apiError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <InputField
                  label="Company Name"
                  placeholder="Acme Corporation"
                  value={registerForm.companyName}
                  onChange={e => setRegisterForm(f => ({ ...f, companyName: e.target.value }))}
                  error={errors.companyName}
                />
                <InputField
                  label="Your Full Name"
                  placeholder="Arpit Sharma"
                  value={registerForm.name}
                  onChange={e => setRegisterForm(f => ({ ...f, name: e.target.value }))}
                  error={errors.name}
                />
              </>
            )}
            <InputField
              label="Work Email"
              type="email"
              placeholder="you@company.com"
              value={mode === 'login' ? loginForm.email : registerForm.email}
              onChange={e =>
                mode === 'login'
                  ? setLoginForm(f => ({ ...f, email: e.target.value }))
                  : setRegisterForm(f => ({ ...f, email: e.target.value }))
              }
              error={errors.email}
            />
            <InputField
              label="Password"
              type="password"
              placeholder={mode === 'register' ? 'Min. 8 characters' : 'Enter your password'}
              value={mode === 'login' ? loginForm.password : registerForm.password}
              onChange={e =>
                mode === 'login'
                  ? setLoginForm(f => ({ ...f, password: e.target.value }))
                  : setRegisterForm(f => ({ ...f, password: e.target.value }))
              }
              error={errors.password}
            />
            {mode === 'register' && (
              <InputField
                label="Confirm Password"
                type="password"
                placeholder="Repeat your password"
                value={registerForm.confirmPassword}
                onChange={e => setRegisterForm(f => ({ ...f, confirmPassword: e.target.value }))}
                error={errors.confirmPassword}
              />
            )}
            {mode === 'login' && (
              <div className="flex justify-end">
                <button type="button" className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  Forgot password?
                </button>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white transition-all duration-200 ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.3" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>
          <p className="mt-5 text-center text-xs text-gray-400">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="text-blue-600 font-medium hover:underline"
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
        <div className="hidden lg:flex w-80 bg-blue-600 flex-col justify-between p-10">
          <div>
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-8">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-3 leading-snug">
              Know your contract risks before you sign.
            </h2>
            <p className="text-sm text-blue-200 leading-relaxed">
              ContractScan AI analyzes vendor contracts in seconds — flagging risky clauses, scoring liability exposure, and giving your team actionable negotiation language.
            </p>
          </div>
          <div className="space-y-3">
            {stats.map(s => (
              <div key={s.label} className="flex items-center gap-4 bg-white/10 rounded-xl px-4 py-3">
                <span className="text-2xl font-bold text-white">{s.value}</span>
                <span className="text-xs text-blue-200">{s.label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-300">
            Trusted by procurement teams at growth-stage companies.
          </p>
        </div>
      </div>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}