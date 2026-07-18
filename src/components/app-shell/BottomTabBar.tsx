// src/components/app-shell/BottomTabBar.tsx
//
// Sticky bottom nav for <AppShell>. Three tabs. Exactly one tab is active at a
// time: each tab declares route prefixes, and the tab whose matched prefix is
// the LONGEST wins. Learning sessions launched from the path
// (/latihan/wmi/sesi|tes) light Belajar; arena surfaces (ujian/papers/exam,
// /wmi-arena, /video, /quiz) light Main. /dashboard (reached from Profil's
// "Statistik & Misi Harian") and /report light Profil.
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gamepad } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface TabDef {
  to: string
  label: string
  /** Font Awesome class — used unless `lucide` is set. */
  icon?: string
  /** Lucide icon component (Main uses lucide's gamepad per design). */
  lucide?: LucideIcon
  // Tab is active for any path under one of these prefixes. Defaults to [to].
  activePrefixes?: string[]
}

const TABS: TabDef[] = [
  {
    to: '/belajar',
    label: 'Home',
    icon: 'fa-solid fa-house',
    activePrefixes: ['/belajar', '/latihan/wmi/sesi', '/latihan/wmi/tes'],
  },
  {
    to: '/main',
    label: 'Main',
    lucide: Gamepad,
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
    activePrefixes: ['/profil', '/badges', '/shop', '/dashboard', '/report', '/streak'],
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
      className="sticky bottom-0 z-30 mx-auto w-full rounded-t-[2.25rem] border-t-[3px] border-[#C46123] bg-qupu-brand-orange pt-2 shadow-[inset_0_3px_0_rgba(255,255,255,0.28)] lg:bottom-5 lg:mb-5 lg:max-w-[28.75rem] lg:rounded-[2.25rem] lg:border lg:border-white/65 lg:bg-qupu-brand-orange/80 lg:pt-2.5 lg:shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] lg:backdrop-blur-md"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.625rem)' }}
    >
      <div className="mx-auto flex w-full max-w-lg items-center justify-around">
        {TABS.map((tab) => {
          const active = bestMatch > 0 && matchLength(tab, pathname) === bestMatch
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              aria-label={tab.label}
              className="flex items-center justify-center px-3.5 py-1"
            >
              <span className="relative flex h-[3.25rem] w-[3.25rem] items-center justify-center">
                {active && (
                  <motion.span
                    layoutId="tabHighlight"
                    className="absolute inset-0 rounded-full bg-white/25 ring-1 ring-white/50 backdrop-blur-sm"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`relative z-10 flex items-center justify-center text-[1.5rem] transition-[transform,color] duration-300 ease-out ${
                    active ? 'scale-100 text-white' : 'scale-90 text-white/65'
                  }`}
                  aria-hidden="true"
                >
                  {tab.lucide ? (
                    <tab.lucide className="h-7 w-7" strokeWidth={2.5} />
                  ) : (
                    <i className={tab.icon} />
                  )}
                </span>
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
