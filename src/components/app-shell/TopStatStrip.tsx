// src/components/app-shell/TopStatStrip.tsx
//
// Sticky chrome at the top of every <AppShell> route. Reads stats from
// useGamificationStats; renders three pills. No internal data fetch —
// the hook is populated by Dashboard.tsx and refreshed by purchase /
// score-submit events elsewhere. Coins link to the shop, level links to
// the profile (where XP detail + tiering live).
import { Link } from 'react-router-dom'
import { useGamificationStats } from '../../hooks/useGamificationStats'

export default function TopStatStrip() {
  const stats = useGamificationStats((s) => s.stats)
  const streak = stats?.streak ?? 0
  const coins = stats?.coinBalance ?? 0
  const level = stats?.level ?? 1

  return (
    <div className="sticky top-0 z-30 mx-auto w-full border-b-[3px] border-[#C46123] bg-qupu-brand-orange lg:max-w-[460px] lg:rounded-b-[1.75rem] lg:border-x-[3px]">
      <div className="mx-auto flex w-full max-w-lg items-center justify-around px-3 py-2">
        <Pill icon="fa-solid fa-fire" value={streak} label={`${streak} hari streak`} />
        <Pill icon="fa-solid fa-coins" value={coins} to="/shop" label={`${coins} koin — buka toko`} />
        <Pill icon="fa-solid fa-star" value={`Lv ${level}`} to="/me" label={`Level ${level} — lihat profil`} />
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
