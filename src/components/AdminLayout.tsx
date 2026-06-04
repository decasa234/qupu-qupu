import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'fa-solid fa-gauge' },
  { to: '/admin/videos', label: 'Videos', icon: 'fa-solid fa-film' },
  { to: '/admin/subjects', label: 'Subjects', icon: 'fa-solid fa-shapes' },
  { to: '/admin/age-groups', label: 'Age Groups', icon: 'fa-solid fa-children' },
  { to: '/admin/users', label: 'Users', icon: 'fa-solid fa-users' },
  { to: '/admin/analytics', label: 'Analytics', icon: 'fa-solid fa-chart-line' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  function handleLogout() {
    logout()
    // AdminRoute also redirects once isAuthenticated flips false; navigating
    // explicitly avoids a flash of the guarded page in between.
    navigate('/login', { replace: true })
  }

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="rounded-xl border border-slate-200 bg-white p-3 lg:sticky lg:top-24 lg:self-start">
        <div className="px-2 pb-3 pt-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            QUPU Admin
          </div>
          <div className="mt-0.5 font-display text-base font-extrabold text-slate-900">
            Control Panel
          </div>
        </div>
        <nav className="grid gap-0.5">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`
              }
            >
              <i className={`${item.icon} w-4 text-center text-sm`} aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-3 border-t border-slate-200 pt-3">
          {user?.email && (
            <div className="px-2 pb-2">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Masuk sebagai
              </div>
              <div className="truncate text-xs font-semibold text-slate-700" title={user.email}>
                {user.email}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-red-600"
          >
            <i className="fa-solid fa-right-from-bracket w-4 text-center text-sm" aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>

      <main className="min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
