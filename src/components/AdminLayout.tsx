import { NavLink, Outlet } from 'react-router-dom'

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'fa-solid fa-gauge' },
  { to: '/admin/videos', label: 'Videos', icon: 'fa-solid fa-film' },
  { to: '/admin/subjects', label: 'Subjects', icon: 'fa-solid fa-shapes' },
  { to: '/admin/age-groups', label: 'Age Groups', icon: 'fa-solid fa-children' },
  { to: '/admin/users', label: 'Users', icon: 'fa-solid fa-users' },
  { to: '/admin/analytics', label: 'Analytics', icon: 'fa-solid fa-chart-line' },
  { to: '/admin/wmi-concepts', label: 'WMI Concepts', icon: 'fa-solid fa-flask' },
]

export default function AdminLayout() {
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
      </aside>

      <main className="min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
