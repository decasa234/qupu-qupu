// src/components/app-shell/TopStatStrip.tsx
//
// Sticky chrome at the top of every <AppShell> route. Reads stats from
// useGamificationStats; renders three pills. Populated by Dashboard.tsx and
// refreshed by purchase / score-submit events elsewhere — and SELF-HYDRATES
// (P1.10) when nothing has filled the store yet, so a cold deep link
// straight into the garden/drill/shop never shows zeroed pills. Coins link
// to the shop, level links to the profile (where XP detail + tiering live).
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchGamificationSummary } from '../../lib/gamificationApi'
import { useGamificationStats } from '../../hooks/useGamificationStats'
import { useAuthStore } from '../../store/authStore'
import { avatarIconClass, DEFAULT_AVATAR_COLOR, DEFAULT_AVATAR_SLUG } from '../../lib/avatars'
import ModeBadge from './ModeBadge'
import StreakPopup from './StreakPopup'
import ShopSheet from './ShopSheet'

// Module-level guard: StrictMode double-effects (or a future second consumer)
// must not fire concurrent hydration fetches for the same child.
let hydratingChildId: string | null = null

export default function TopStatStrip() {
  const stats = useGamificationStats((s) => s.stats)
  const activeChildId = useAuthStore((s) => s.activeChildId)
  const children = useAuthStore((s) => s.children)
  const activeChild = children.find((c) => c.id === activeChildId) ?? null

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

  // Streak pill → popup; coins pill → shop sheet (both stay on the page).
  const [streakOpen, setStreakOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)

  return (
    <div
      data-app-topbar
      className="sticky top-0 z-30 mx-auto w-full rounded-b-[1.375rem] border-b-[3px] border-[#C46123] bg-qupu-brand-orange shadow-[inset_0_3px_0_rgba(255,255,255,0.28)] lg:top-5 lg:mt-5 lg:max-w-[28.75rem] lg:rounded-[1.75rem] lg:border lg:border-white/65 lg:bg-qupu-brand-orange/80 lg:shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] lg:backdrop-blur-md"
    >
      <div className="mx-auto flex w-full max-w-lg items-center gap-2 px-3 pb-3 pt-2.5">
        {/* Gamemode selector — opens a dropdown (WMI / Video). Main is still the full chooser. */}
        <ModeBadge />

        <div className="flex flex-1 items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setStreakOpen(true)}
            className="flex h-[2.125rem] items-center gap-1.5 rounded-full bg-[#FFF8F0] px-3 font-display text-sm font-semibold text-qupu-brand-blue shadow-[0_2px_0_0_#C46123] tap-press active:translate-y-0.5 active:shadow-none"
            aria-label={`${streak} hari streak${shields > 0 ? `, ${shields} pelindung streak` : ''} — lihat streak`}
            aria-haspopup="dialog"
          >
            <i className="fa-solid fa-fire text-[0.9375rem] text-qupu-orange" aria-hidden="true" />
            {streak}
            {shields > 0 && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-qupu-brand-orange/15 px-1.5 py-0.5 font-display text-[0.625rem] font-extrabold text-qupu-brand-blue">
                <i className="fa-solid fa-shield-halved text-[0.5625rem] text-qupu-brand-orange" aria-hidden="true" />
                {shields}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setShopOpen(true)}
            aria-label={`${coins} koin — buka toko`}
            aria-haspopup="dialog"
            className="flex h-[2.125rem] items-center gap-1.5 rounded-full bg-[#FFF8F0] px-3 font-display text-sm font-semibold text-qupu-brand-blue shadow-[0_2px_0_0_#C46123] tap-press active:translate-y-0.5 active:shadow-none"
          >
            <i className="fa-solid fa-coins text-[0.9375rem] text-[#D9A406]" aria-hidden="true" />
            {coins}
          </button>
          <Link
            to="/profil"
            aria-label={`Level ${level} — lihat profil`}
            className="flex h-[2.125rem] items-center gap-1.5 rounded-full bg-[#FFF8F0] py-0 pl-1 pr-2.5 font-display text-[0.8125rem] font-semibold text-qupu-brand-blue shadow-[0_2px_0_0_#C46123] tap-press active:translate-y-0.5 active:shadow-none"
          >
            <span
              className="flex h-[1.625rem] w-[1.625rem] items-center justify-center rounded-full text-xs text-white"
              style={{ background: activeChild?.avatarColor ?? DEFAULT_AVATAR_COLOR }}
              aria-hidden="true"
            >
              <i className={avatarIconClass(activeChild?.avatarIcon ?? DEFAULT_AVATAR_SLUG)} />
            </span>
            Lv {level}
          </Link>
        </div>
      </div>

      {streakOpen && <StreakPopup onClose={() => setStreakOpen(false)} />}
      {shopOpen && <ShopSheet onClose={() => setShopOpen(false)} />}
    </div>
  )
}
