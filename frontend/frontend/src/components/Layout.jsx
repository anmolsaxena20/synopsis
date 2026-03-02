import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

const Icons = {
  Logo: () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="7" fill="#2563EB"/>
      <path d="M7 9h14M7 14h10M7 19h7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="20" cy="19" r="3" fill="#60A5FA"/>
    </svg>
  ),
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Upload: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  History: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Compare: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3H5a2 2 0 00-2 2v14a2 2 0 002 2h5" />
      <path d="M14 3h5a2 2 0 012 2v14a2 2 0 01-2 2h-5" />
      <line x1="12" y1="3" x2="12" y2="21" />
    </svg>
  ),
  Team: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  Logout: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Bell: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  Menu: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
}

const NAV_ITEMS = [
  { label: 'Dashboard',        icon: Icons.Dashboard, to: '/app/dashboard' },
  { label: 'Upload Contract',  icon: Icons.Upload,    to: '/app/upload'    },
  { label: 'Contract History', icon: Icons.History,   to: '/app/history'   },
  { label: 'Compare',          icon: Icons.Compare,   to: '/app/compare'   },
  { label: 'Team',             icon: Icons.Team,      to: '/app/team'      },
]

function TopbarAvatar({ user, initials, onLogout }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-all duration-150"
      >
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
          {initials}
        </div>
        <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden"
            style={{ animation: 'fadeUp 0.15s ease-out' }}>
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
            </div>
            <div className="py-1">
              <button
                onClick={() => { setOpen(false); navigate('/app/profile') }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                My Profile
              </button>
              <button
                onClick={() => { setOpen(false); navigate('/app/team') }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
                Team
              </button>
            </div>
            <div className="border-t border-gray-100 py-1">
              <button
                onClick={() => { setOpen(false); onLogout() }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors duration-150"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function Layout() {
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const raw = localStorage.getItem('user')
  const user = raw ? JSON.parse(raw) : { name: 'User', email: '' }
  const initials = user.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside
        className="h-screen bg-white border-r border-gray-200 flex flex-col sticky top-0 transition-all duration-250"
        style={{ width: collapsed ? '72px' : '240px' }}
      >
        <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-100 overflow-hidden">
          <div className="flex-shrink-0"><Icons.Logo /></div>
          {!collapsed && (
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="font-bold text-gray-900 text-[15px] tracking-tight whitespace-nowrap">
                ContractScan
              </span>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                AI
              </span>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
         {NAV_ITEMS.map((item) => (
  <NavLink
    key={item.to}
    to={item.to}
    title={collapsed ? item.label : undefined}
    className={({ isActive }) => `
      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
      transition-all duration-150 group w-full
      ${isActive
        ? 'bg-blue-50 text-blue-700'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }
    `}
  >
    {({ isActive }) => (
      <>
        <span className={`flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
          <item.icon />
        </span>
        {!collapsed && (
          <span className="truncate">{item.label}</span>
        )}
        {isActive && !collapsed && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
        )}
      </>
    )}
  </NavLink>
))}
        </nav>

        <div className="border-t border-gray-100 p-3">
          {collapsed ? (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-150">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <Icons.Logout />
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <button
            onClick={() => setCollapsed(c => !c)}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-md hover:bg-gray-100 transition-all duration-150"
          >
            <Icons.Menu />
          </button>

          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-150">
              <Icons.Bell />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <TopbarAvatar user={user} initials={initials} onLogout={handleLogout} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
