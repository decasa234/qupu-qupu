// src/components/app-shell/BottomTabBar.tsx
//
// Sticky bottom nav for <AppShell>. Three tabs. Exactly one tab is active at a
// time: each tab declares route prefixes, and the tab whose matched prefix is
// the LONGEST wins. Learning sessions launched from the path
// (/latihan/wmi/sesi|tes) light Belajar; arena surfaces (ujian/papers/exam,
// /wmi-arena, /video, /quiz) light Main. /dashboard (reached from Profil's
// "Statistik & Misi Harian") and /report light Profil.
import { NavLink, useLocation } from 'react-router-dom'

interface TabDef {
  to: string
  label: string
  icon: string
  // Tab is active for any path under one of these prefixes. Defaults to [to].
  activePrefixes?: string[]
}

const TABS: TabDef[] = [
  {
    to: '/belajar',
    label: 'Belajar',
    icon: 'fa-solid fa-play',
    activePrefixes: ['/belajar', '/latihan/wmi/sesi', '/latihan/wmi/tes'],
  },
  {
    to: '/main',
    label: 'Main',
    icon: 'fa-solid fa-gamepad',
    activePrefixes: [
      '/main',
      '/wmi-arena',
      '/video',
      '/quiz',
      '/latihan/wmi/ujian',
      '/latihan/wmi/papers',
      '/latihan/wmi/exam',
    ],
  },
  {
    to: '/profil',
    label: 'Profil',
    icon: 'fa-solid fa-user',
    activePrefixes: ['/profil', '/badges', '/shop', '/dashboard', '/report'],
  },
]

// Longest matched prefix length for this tab on the given path (0 = no match).
function matchLength(tab: TabDef, pathname: string): number {
  return (tab.activePrefixes ?? [tab.to]).reduce((best, prefix) => {
    const hit = pathname === prefix || pathname.startsWith(`${prefix}/`)
    return hit && prefix.length > best ? prefix.length : best
  }, 0)
}

export default function BottomTabBar() {
  const { pathname } = useLocation()

  const bestMatch = Math.max(...TABS.map((tab) => matchLength(tab, pathname)))

  return (
    <nav
      className="sticky bottom-0 z-30 mx-auto w-full border-t-[3px] border-[#C46123] bg-qupu-brand-orange pt-2 lg:max-w-[460px] lg:rounded-t-[1.75rem] lg:border-x-[3px]"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}
    >
      <div className="mx-auto flex w-full max-w-lg justify-around">
        {TABS.map((tab) => {
          const active = bestMatch > 0 && matchLength(tab, pathname) === bestMatch
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={`flex flex-col items-center gap-0.5 px-3 text-[10px] font-extrabold uppercase tracking-[0.12em] ${
                active ? 'text-white' : 'text-white/70'
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-base ${
                  active ? 'bg-[#FFF8F0] text-qupu-brand-orange' : 'text-white/80'
                }`}
                aria-hidden="true"
              >
                <i className={tab.icon} />
              </span>
              <span>{tab.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
