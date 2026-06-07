import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { ToastProvider } from './admin/Toast'

type NavLeaf = { to: string; label: string; icon: string }
type NavGroup = { group: string; children: NavLeaf[] }
type NavEntry = NavLeaf | NavGroup

const NAV: NavEntry[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'fa-solid fa-gauge' },
  { to: '/admin/videos', label: 'Videos', icon: 'fa-solid fa-film' },
  { to: '/admin/subjects', label: 'Subjects', icon: 'fa-solid fa-shapes' },
  { to: '/admin/age-groups', label: 'Age Groups', icon: 'fa-solid fa-children' },
  { to: '/admin/users', label: 'Users', icon: 'fa-solid fa-users' },
  { to: '/admin/analytics', label: 'Analytics', icon: 'fa-solid fa-chart-line' },
  {
    group: 'WMI',
    children: [
      { to: '/admin/wmi-concepts', label: 'Concepts', icon: 'fa-solid fa-flask' },
      { to: '/admin/wmi-drill', label: 'Drill', icon: 'fa-solid fa-file-pen' },
    ],
  },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    // AdminRoute also redirects once isAuthenticated flips false; navigating
    // explicitly avoids a flash of the guarded page in between.
    navigate('/login', { replace: true })
  }

  function navLinks(onNavigate?: () => void) {
    const leaf = (item: NavLeaf) => (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            isActive
              ? 'bg-qupu-brand-blue text-white'
              : 'text-admin-muted hover:bg-admin-sunk hover:text-admin-ink'
          }`
        }
      >
        <i className={`${item.icon} w-4 text-center text-sm`} aria-hidden="true" />
        {item.label}
      </NavLink>
    )
    return (
      <nav className="grid gap-0.5">
        {NAV.map((entry) =>
          'group' in entry ? (
            <div key={entry.group} className="mt-2">
              <div className="px-3 pb-1 pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-admin-faint">
                {entry.group}
              </div>
              <div className="grid gap-0.5">{entry.children.map(leaf)}</div>
            </div>
          ) : (
            leaf(entry)
          ),
        )}
      </nav>
    )
  }

  function accountBlock(onNavigate?: () => void) {
    return (
      <div className="border-t border-admin-line pt-3">
        {user?.email && (
          <div className="px-2 pb-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-admin-faint">
              Masuk sebagai
            </div>
            <div className="truncate text-xs font-semibold text-admin-ink" title={user.email}>
              {user.email}
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            onNavigate?.()
            handleLogout()
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-admin-muted transition-colors hover:bg-admin-sunk hover:text-red-600"
        >
          <i className="fa-solid fa-right-from-bracket w-4 text-center text-sm" aria-hidden="true" />
          Logout
        </button>
      </div>
    )
  }

  function wordmark() {
    return (
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-qupu-brand-orange">
          QUPU Admin
        </div>
        <div className="font-display text-base font-extrabold text-qupu-brand-blue">Control Panel</div>
      </div>
    )
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-admin-bg text-admin-ink">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-admin-line bg-admin-card/95 px-4 py-3 backdrop-blur lg:hidden">
          {wordmark()}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Buka menu"
            aria-expanded={menuOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-admin-edge bg-white text-admin-ink"
          >
            <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`} aria-hidden="true" />
          </button>
        </header>

        {/* Mobile slide-down nav */}
        {menuOpen && (
          <div className="border-b border-admin-line bg-admin-card px-4 py-3 lg:hidden">
            {navLinks(() => setMenuOpen(false))}
            <div className="mt-3">{accountBlock(() => setMenuOpen(false))}</div>
          </div>
        )}

        <div className="mx-auto grid min-w-0 max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:px-8">
          {/* Desktop sidebar */}
          <aside className="hidden self-start rounded-2xl border border-admin-line bg-admin-card p-3 shadow-admin-soft lg:sticky lg:top-6 lg:block">
            <div className="px-2 pb-3 pt-1">{wordmark()}</div>
            {navLinks()}
            <div className="mt-3">{accountBlock()}</div>
          </aside>

          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
