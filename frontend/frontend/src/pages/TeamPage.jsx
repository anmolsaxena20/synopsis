

import { useState, useEffect } from 'react'
import api from '../api/axios'

function RoleBadge({ role }) {
  const map = {
    ADMIN:  { bg: 'bg-purple-100', text: 'text-purple-700' },
    MEMBER: { bg: 'bg-blue-50',   text: 'text-blue-700'   },
  }
  const s = map[role] || map.MEMBER
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.text} shadow-sm`}>
      {role}
    </span>
  )
}

function Avatar({ name }) {
  const initials = name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const colors = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500']
  const color = colors[name?.charCodeAt(0) % colors.length] || 'bg-blue-500'
  return (
    <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-200`}>
      {initials}
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="px-6 py-4 flex items-center gap-4">
      <div className="animate-pulse bg-blue-100 rounded-full w-9 h-9 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="animate-pulse bg-blue-100 rounded h-3.5 w-36" />
        <div className="animate-pulse bg-blue-100 rounded h-3 w-48" />
      </div>
      <div className="animate-pulse bg-blue-100 rounded-full h-7 w-16" />
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

  const raw = localStorage.getItem('user')
  const currentUser = raw ? JSON.parse(raw) : {}

  useEffect(() => {
    fetchMembers()
  }, [])

  async function fetchMembers() {
    try {
      const res = await api.get('/team/members')
      setMembers(res.data)
    } catch {
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
      setInviteSuccess(`Invitation sent to ${inviteEmail}`)
      setInviteEmail('')
      fetchMembers()
    } catch (err) {
      setInviteError(err.response?.data?.error || 'Failed to send invite.')
    } finally {
      setInviting(false)
    }
  }

  return (
    <div className="min-h-screen py-10 px-4 flex justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">

      <div className="space-y-6 max-w-3xl w-full" style={{ animation: 'fadeIn 0.35s ease-out' }}>

        <div>
          <h1 className="text-3xl font-bold text-blue-900">Team</h1>
          <p className="text-sm text-blue-700/70 mt-1">Manage your workspace members.</p>
        </div>

        {/* Invite Card */}
        <div className="backdrop-blur-xl bg-white/80 border border-blue-100 rounded-2xl shadow-xl shadow-blue-100/40 overflow-hidden">

          <div className="px-6 py-5 border-b border-blue-100">
            <h2 className="text-sm font-bold text-blue-900">Invite a teammate</h2>
            <p className="text-xs text-blue-500 mt-0.5">They will be added as a Member.</p>
          </div>

          <div className="px-6 py-5">

            <form onSubmit={handleInvite} className="flex gap-3">

              <input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={e => { setInviteEmail(e.target.value); setInviteError(''); setInviteSuccess('') }}
                className="flex-1 px-4 py-2.5 text-sm border border-blue-100 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition bg-white"
              />

              <button
                type="submit"
                disabled={inviting}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 shadow-md ${
                  inviting
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 active:scale-[0.97]'
                }`}
              >
                {inviting ? 'Sending...' : 'Send Invite'}
              </button>

            </form>

            {inviteError && (
              <p className="mt-2.5 text-xs text-red-500">{inviteError}</p>
            )}
            {inviteSuccess && (
              <p className="mt-2.5 text-xs text-green-600 font-medium">{inviteSuccess}</p>
            )}

          </div>
        </div>

        {/* Members */}
        <div className="backdrop-blur-xl bg-white/80 border border-blue-100 rounded-2xl shadow-xl shadow-blue-100/40 overflow-hidden">

          <div className="px-6 py-4 border-b border-blue-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-blue-900">Members</h2>
            <span className="text-xs text-blue-400">
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </span>
          </div>

          <div className="divide-y divide-blue-50">

            {loading ? (
              [...Array(3)].map((_, i) => <SkeletonRow key={i} />)
            ) : members.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-blue-400">No team members yet. Invite someone above.</p>
              </div>
            ) : (
              members.map(member => (
                <div
                  key={member.id}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-blue-50/60 transition-all duration-200"
                >
                  <Avatar name={member.name} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">{member.name}</p>
                      {member.id === currentUser.id && (
                        <span className="text-xs text-blue-400">(you)</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{member.email}</p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="text-xs text-gray-400 hidden sm:block">
                      Joined {new Date(member.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <RoleBadge role={member.role} />
                  </div>

                </div>
              ))
            )}

          </div>
        </div>

        {/* Workspace */}
        <div className="backdrop-blur-xl bg-white/80 border border-blue-100 rounded-2xl shadow-xl shadow-blue-100/40 overflow-hidden">

          <div className="px-6 py-4 border-b border-blue-100">
            <h2 className="text-sm font-bold text-blue-900">Workspace</h2>
          </div>

          <div className="px-6 py-5 space-y-4">

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Company</p>
              <p className="text-sm font-semibold text-gray-900">{currentUser.companyId || '—'}</p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Your Role</p>
              <RoleBadge role={currentUser.role} />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Plan</p>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                STARTER
              </span>
            </div>

          </div>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </div>
  )
}