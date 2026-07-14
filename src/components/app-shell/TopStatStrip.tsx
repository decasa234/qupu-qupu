// src/components/app-shell/TopStatStrip.tsx
//
// Sticky chrome at the top of every <AppShell> route. Reads stats from
// useGamificationStats; renders three pills. Populated by Dashboard.tsx and
// refreshed by purchase / score-submit events elsewhere — and SELF-HYDRATES
// (P1.10) when nothing has filled the store yet, so a cold deep link
// straight into the garden/drill/shop never shows zeroed pills. Coins link
// to the shop, level links to the profile (where XP detail + tiering live).
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchGamificationSummary } from '../../lib/gamificationApi'
import { useGamificationStats } from '../../hooks/useGamificationStats'
import { useAuthStore } from '../../store/authStore'
import ModeBadge from './ModeBadge'

// Module-level guard: StrictMode double-effects (or a future second consumer)
// must not fire concurrent hydration fetches for the same child.
let hydratingChildId: string | null = null

export default function TopStatStrip() {
  const stats = useGamificationStats((s) => s.stats)
  const activeChildId = useAuthStore((s) => s.activeChildId)

  // Self-hydration: stats === null means no surface has fetched yet (cold
  // mount or post-child-switch reset). Fetch the summary once; failures are
  // silent — the strip keeps neutral zeros and the next surface fetch
  // (dashboard) repopulates. The deps stay unchanged on failure, so this
  // never retry-loops.
  useEffect(() => {
    if (stats !== null || !activeChildId) return
    if (hydratingChildId === activeChildId) return
    hydratingChildId = activeChildId
    fetchGamificationSummary(activeChildId)
      .then((summary) => {
        // Seed only if still empty — a surface fetch that landed in the
        // meantime is at least as fresh; don't clobber it.
        const store = useGamificationStats.getState()
        if (store.stats === null) {
          store.setStats(activeChildId, {
            streak: summary.streak,
            streakShields: summary.streakShields ?? 0,
            coinBalance: summary.coinBalance,
            level: summary.level,
            tierName: summary.tierName,
            xp: summary.xpIntoCurrent,
            xpToNext: summary.xpToNext,
          })
        }
      })
      .catch(() => {
        /* silent — zeros remain until another surface fetches */
      })
      .finally(() => {
        if (hydratingChildId === activeChildId) hydratingChildId = null
      })
  }, [stats, activeChildId])
  const streak = stats?.streak ?? 0
  const shields = stats?.streakShields ?? 0
  const coins = stats?.coinBalance ?? 0
  const level = stats?.level ?? 1

  return (
    <div
      data-app-topbar
      className="sticky top-0 z-30 mx-auto w-full border-b-[3px] border-[#C46123] bg-qupu-brand-orange lg:max-w-[28.75rem] lg:rounded-b-[1.75rem] lg:border-x-[3px]"
    >
      <div className="mx-auto flex w-full max-w-lg items-center gap-2 px-3 py-2">
        {/* Gamemode selector — opens a dropdown (WMI / Video). Main is still the full chooser. */}
        <ModeBadge />

        <div className="flex flex-1 items-center justify-around">
          <Link
            to="/streak"
            className="flex items-center gap-1.5 rounded-full px-2 py-0.5 transition-transform active:translate-y-0.5"
            aria-label={`${streak} hari streak${shields > 0 ? `, ${shields} pelindung streak` : ''} — lihat riwayat`}
          >
            <i className="fa-solid fa-fire text-base text-qupu-brand-yellow" aria-hidden="true" />
            <span className="font-display text-sm font-extrabold text-white">{streak}</span>
            {shields > 0 && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-white/20 px-1.5 py-0.5 font-display text-[0.625rem] font-extrabold text-white">
                <i className="fa-solid fa-shield-halved text-[0.5625rem] text-qupu-brand-yellow" aria-hidden="true" />
                {shields}
              </span>
            )}
          </Link>
          <Pill icon="fa-solid fa-coins" value={coins} to="/shop" label={`${coins} koin — buka toko`} />
          <Pill icon="fa-solid fa-star" value={`Lv ${level}`} to="/profil" label={`Level ${level} — lihat profil`} />
        </div>
      </div>
    </div>
  )
}

function Pill({
  icon,
  value,
  to,
  label,
}: {
  icon: string
  value: number | string
  to?: string
  label?: string
}) {
  const content = (
    <>
      <i className={`${icon} text-base text-qupu-brand-yellow`} aria-hidden="true" />
      <span>{value}</span>
    </>
  )
  const className = 'flex items-center gap-1.5 font-display text-sm font-extrabold text-white'

  if (to) {
    return (
      <Link
        to={to}
        aria-label={label}
        className={`${className} rounded-full px-2 py-0.5 transition-transform active:translate-y-0.5`}
      >
        {content}
      </Link>
    )
  }
  return (
    <div className={className} aria-label={label}>
      {content}
    </div>
  )
}
