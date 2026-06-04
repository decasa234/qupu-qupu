// src/components/app-shell/BottomTabBar.tsx
//
// Sticky bottom nav for <AppShell>. Four tabs. Active state is matched by
// route prefix so deeper pages light their parent tab — e.g. all /latihan/wmi/*
// pages light Latihan, and /badges (now reached from Profil) lights Profil.
import { NavLink, useLocation } from 'react-router-dom'

interface TabDef {
  to: string
  label: string
  icon: string
  // Tab is active for any path under one of these prefixes (not just `to`).
  activePrefixes?: string[]
}

const TABS: TabDef[] = [
  { to: '/dashboard', label: 'Home',    icon: 'fa-solid fa-house' },
  { to: '/library',   label: 'Video',   icon: 'fa-solid fa-clapperboard', activePrefixes: ['/library'] },
  { to: '/latihan',   label: 'Main',    icon: 'fa-solid fa-gamepad', activePrefixes: ['/latihan'] },
  { to: '/me',        label: 'Profil',  icon: 'fa-solid fa-user', activePrefixes: ['/me', '/badges'] },
]

export default function BottomTabBar() {
  const { pathname } = useLocation()

  return (
    <nav
      className="sticky bottom-0 z-30 mx-auto w-full border-t-[3px] border-[#C46123] bg-qupu-brand-orange pt-2 lg:max-w-[460px] lg:rounded-t-[1.75rem] lg:border-x-[3px]"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}
    >
      <div className="mx-auto flex w-full max-w-lg justify-around">
        {TABS.map((tab) => {
          const prefixActive = (tab.activePrefixes ?? []).some(
            (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
          )
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 text-[10px] font-extrabold uppercase tracking-[0.12em] ${
                  isActive || prefixActive ? 'text-white' : 'text-white/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-base ${
                      isActive || prefixActive
                        ? 'bg-[#FFF8F0] text-qupu-brand-orange'
                        : 'text-white/80'
                    }`}
                    aria-hidden="true"
                  >
                    <i className={tab.icon} />
                  </span>
                  <span>{tab.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
