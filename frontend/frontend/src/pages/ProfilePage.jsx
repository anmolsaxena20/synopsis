

import { useState } from 'react'
import api from '../api/axios'

export default function ProfilePage() {
  const raw = localStorage.getItem('user')
  const user = raw ? JSON.parse(raw) : {}

  const [name, setName] = useState(user.name || '')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwError, setPwError] = useState('')

  const initials = user.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const colors = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500']
  const color = colors[user.name?.charCodeAt(0) % colors.length] || 'bg-blue-500'

  async function handleSaveName(e) {
    e.preventDefault()
    if (!name.trim()) { setSaveError('Name cannot be empty'); return }
    setSaveError('')
    setSaving(true)
    try {
      await api.patch('/team/profile', { name: name.trim() })
      const updated = { ...user, name: name.trim() }
      localStorage.setItem('user', JSON.stringify(updated))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError(err.response?.data?.error || 'Failed to update name.')
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setPwError('')
    if (!currentPassword) { setPwError('Current password is required'); return }
    if (!newPassword) { setPwError('New password is required'); return }
    if (newPassword.length < 8) { setPwError('Minimum 8 characters'); return }
    if (newPassword !== confirmPassword) { setPwError("Passwords don't match"); return }
    setPwLoading(true)
    try {
      await api.patch('/team/password', { currentPassword, newPassword })
      setPwSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPwSuccess(false), 3000)
    } catch (err) {
      setPwError(err.response?.data?.error || 'Failed to change password.')
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex justify-center py-10 px-4 bg-gradient-to-br from-blue-50 via-white to-blue-100">

      <div className="max-w-2xl w-full space-y-6" style={{ animation: 'fadeIn 0.4s ease-out' }}>

        <div>
          <h1 className="text-3xl font-bold text-blue-900">My Profile</h1>
          <p className="text-sm text-blue-700/70 mt-1">Manage your personal account settings.</p>
        </div>

        {/* Profile Card */}
        <div className="backdrop-blur-xl bg-white/80 border border-blue-100 rounded-2xl shadow-xl shadow-blue-100/40 overflow-hidden">
          <div className="px-6 py-5 border-b border-blue-100">
            <h2 className="text-sm font-bold text-blue-900">Profile Info</h2>
          </div>

          <div className="px-6 py-6">

            <div className="flex items-center gap-5 mb-7">
              <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-300/40`}>
                {initials}
              </div>

              <div>
                <p className="text-base font-bold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>

                <span className={`inline-block mt-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  user.role === 'ADMIN'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-50 text-blue-700'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveName} className="space-y-4">

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setSaveError('') }}
                  className="w-full px-4 py-2.5 text-sm border border-blue-100 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Work Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400">Email cannot be changed.</p>
              </div>

              {saveError && <p className="text-xs text-red-500">{saveError}</p>}
              {saveSuccess && <p className="text-xs text-green-600 font-medium">Name updated successfully!</p>}

              <button
                type="submit"
                disabled={saving}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 shadow-md ${
                  saving
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 active:scale-[0.97]'
                }`}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>

            </form>
          </div>
        </div>

        {/* Password */}
        <div className="backdrop-blur-xl bg-white/80 border border-blue-100 rounded-2xl shadow-xl shadow-blue-100/40 overflow-hidden">
          <div className="px-6 py-5 border-b border-blue-100">
            <h2 className="text-sm font-bold text-blue-900">Change Password</h2>
          </div>

          <div className="px-6 py-6">
            <form onSubmit={handleChangePassword} className="space-y-4">

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={e => { setCurrentPassword(e.target.value); setPwError('') }}
                  className="w-full px-4 py-2.5 text-sm border border-blue-100 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  placeholder="Min. 8 characters"
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setPwError('') }}
                  className="w-full px-4 py-2.5 text-sm border border-blue-100 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setPwError('') }}
                  className="w-full px-4 py-2.5 text-sm border border-blue-100 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                />
              </div>

              {pwError && <p className="text-xs text-red-500">{pwError}</p>}
              {pwSuccess && <p className="text-xs text-green-600 font-medium">Password changed successfully!</p>}

              <button
                type="submit"
                disabled={pwLoading}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 shadow-md ${
                  pwLoading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 active:scale-[0.97]'
                }`}
              >
                {pwLoading ? 'Updating...' : 'Change Password'}
              </button>

            </form>
          </div>
        </div>

        {/* Workspace */}
        <div className="backdrop-blur-xl bg-white/80 border border-blue-100 rounded-2xl shadow-xl shadow-blue-100/40 overflow-hidden">
          <div className="px-6 py-5 border-b border-blue-100">
            <h2 className="text-sm font-bold text-blue-900">Workspace</h2>
          </div>

          <div className="px-6 py-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Role</p>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                user.role === 'ADMIN'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-50 text-blue-700'
              }`}>
                {user.role}
              </span>
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