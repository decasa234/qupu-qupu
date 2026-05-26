// src/components/app-shell/BottomTabBar.tsx
//
// Sticky bottom nav for <AppShell>. Five tabs. Active state is matched
// by route prefix so /badges and /badges/whatever both light up the Badge tab.
import { NavLink } from 'react-router-dom'

interface TabDef {
  to: string
  label: string
  icon: string
}

const TABS: TabDef[] = [
  { to: '/dashboard', label: 'Home',  icon: 'fa-solid fa-house' },
  { to: '/videos',    label: 'Video', icon: 'fa-solid fa-circle-play' },
  { to: '/shop',      label: 'Toko',  icon: 'fa-solid fa-bag-shopping' },
  { to: '/badges',    label: 'Badge', icon: 'fa-solid fa-medal' },
  { to: '/me',        label: 'Profil', icon: 'fa-solid fa-user' },
]

export default function BottomTabBar() {
  return (
    <nav
      className="sticky bottom-0 z-30 border-t-[3px] border-qupu-peach bg-white pt-2"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}
    >
      <div className="mx-auto flex w-full max-w-lg justify-around">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 text-[10px] font-extrabold uppercase tracking-[0.12em] ${
                isActive ? 'text-qupu-brand-orange' : 'text-qupu-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-base ${
                    isActive ? 'bg-qupu-peach text-qupu-brand-orange' : 'text-qupu-muted'
                  }`}
                  aria-hidden="true"
                >
                  <i className={tab.icon} />
                </span>
                <span>{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
