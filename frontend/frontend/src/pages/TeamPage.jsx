import { useState, useEffect } from 'react'
import api from '../api/axios'

function RoleBadge({ role }) {
  const map = {
    ADMIN:   { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    MEMBER:  { bg: 'bg-gray-100',   text: 'text-gray-600',   border: 'border-gray-200'   },
    INVITED: { bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-200'  },
  }
  const s = map[role] || map.MEMBER
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
      {role}
    </span>
  )
}

function Avatar({ name, size = 'md' }) {
  const initials = name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
  const colors = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500']
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length]
  const sz = size === 'lg' ? 'w-12 h-12 text-sm' : 'w-9 h-9 text-xs'
  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="px-6 py-4 flex items-center gap-4">
      <div className="animate-pulse bg-gray-100 rounded-full w-9 h-9 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="animate-pulse bg-gray-100 rounded h-3.5 w-36" />
        <div className="animate-pulse bg-gray-100 rounded h-3 w-48" />
      </div>
      <div className="animate-pulse bg-gray-100 rounded-full h-7 w-16" />
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-xl font-extrabold text-gray-900">{value}</p>
      </div>
    </div>
  )
}

export default function TeamPage() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')
  const [search, setSearch] = useState('')

  const raw = localStorage.getItem('user')
  const currentUser = raw ? JSON.parse(raw) : {}

  useEffect(() => { fetchMembers() }, [])

  async function fetchMembers() {
    try {
      const res = await api.get('/team/members')
      setMembers(res.data)
    } catch (err) {
      setInviteError(err.response?.data?.error || 'Failed to load members.')
    } finally {
      setLoading(false)
    }
  }

  async function handleInvite(e) {
    e.preventDefault()
    setInviteError('')
    setInviteSuccess('')
    if (!inviteEmail.trim()) { setInviteError('Email is required.'); return }
    if (!/\S+@\S+\.\S+/.test(inviteEmail)) { setInviteError('Enter a valid email address.'); return }
    setInviting(true)
    try {
      await api.post('/team/invite', { email: inviteEmail.trim() })
      setInviteSuccess(`Invite created for ${inviteEmail}. Ask them to sign up using this email.`)
      setInviteEmail('')
      await fetchMembers()
    } catch (err) {
      setInviteError(err.response?.data?.error || 'Failed to send invite.')
    } finally {
      setInviting(false)
    }
  }

  const filtered = members.filter(m =>
    !search ||
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  )

  const admins = members.filter(m => m.role === 'ADMIN').length
  const invited = members.filter(m => m.role === 'INVITED').length

  return (
    <div className="space-y-6 max-w-4xl" style={{ animation: 'fadeIn 0.3s ease-out' }}>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your workspace members and invitations.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-xs font-semibold text-blue-700">{currentUser.role} · Acme Corporation</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Members"
          value={members.length}
          color="bg-blue-50 text-blue-600"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
          }
        />
        <StatCard
          label="Admins"
          value={admins}
          color="bg-purple-50 text-purple-600"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          }
        />
        <StatCard
          label="Pending Invites"
          value={invited}
          color="bg-amber-50 text-amber-600"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          }
        />
      </div>

      {/* Invite Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Invite a teammate</h2>
            <p className="text-xs text-gray-400 mt-0.5">An invitation record will be created with INVITED status.</p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-100 rounded-lg">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.99 1.18 2 2 0 013 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
            </svg>
            <span className="text-xs font-semibold text-green-700">Email invite</span>
          </div>
        </div>
        <div className="px-6 py-5">
          <form onSubmit={handleInvite} className="flex gap-3">
            <div className="flex-1 relative">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={e => { setInviteEmail(e.target.value); setInviteError(''); setInviteSuccess('') }}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-150 bg-white text-gray-900 placeholder-gray-400"
              />
            </div>
            <button
              type="submit"
              disabled={inviting}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-150 flex-shrink-0 flex items-center gap-2 ${
                inviting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
              }`}
            >
              {inviting ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.3" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  Send Invite
                </>
              )}
            </button>
          </form>
          {inviteError && (
            <div className="mt-3 flex items-center gap-2 text-xs text-red-500">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {inviteError}
            </div>
          )}
          {inviteSuccess && (
            <div className="mt-3 flex items-center gap-2 text-xs text-green-600 font-medium">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {inviteSuccess}
            </div>
          )}
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Members</h2>
            <p className="text-xs text-gray-400 mt-0.5">{filtered.length} of {members.length} members</p>
          </div>
          <div className="relative">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 transition-all bg-white text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {loading ? (
            [...Array(3)].map((_, i) => <SkeletonRow key={i} />)
          ) : filtered.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-gray-400">
                {search ? 'No members match your search.' : 'No team members yet. Invite someone above.'}
              </p>
            </div>
          ) : (
            filtered.map(member => (
              <div key={member.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-all duration-150 group">
                <Avatar name={member.name} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900 truncate">{member.name}</p>
                    {member.id === currentUser.id && (
                      <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">you</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{member.email}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className="text-xs text-gray-400 hidden sm:block">
                    {new Date(member.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <RoleBadge role={member.role} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Workspace Info */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Workspace Details</h2>
        </div>
        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-400 font-medium mb-1">Your Role</p>
            <RoleBadge role={currentUser.role} />
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-400 font-medium mb-1">Plan</p>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">STARTER</span>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-400 font-medium mb-1">Members Limit</p>
            <p className="text-sm font-bold text-gray-900">Unlimited</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
