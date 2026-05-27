// src/components/app-shell/TopStatStrip.tsx
//
// Sticky chrome at the top of every <AppShell> route. Reads stats from
// useGamificationStats; renders three pills. No internal data fetch —
// the hook is populated by Dashboard.tsx and refreshed by purchase /
// score-submit events elsewhere.
import { useGamificationStats } from '../../hooks/useGamificationStats'

export default function TopStatStrip() {
  const stats = useGamificationStats((s) => s.stats)
  const streak = stats?.streak ?? 0
  const coins = stats?.coinBalance ?? 0
  const level = stats?.level ?? 1

  return (
    <div className="sticky top-0 z-30 border-b-[3px] border-qupu-peach bg-white">
      <div className="mx-auto flex w-full max-w-lg items-center justify-around px-3 py-2">
        <Pill icon="fa-solid fa-fire" color="text-qupu-brand-orange" value={streak} />
        <Pill icon="fa-solid fa-coins" color="text-qupu-brand-yellow" value={coins} />
        <Pill icon="fa-solid fa-star" color="text-qupu-brand-blue" value={`Lv ${level}`} />
      </div>
    </div>
  )
}

function Pill({ icon, color, value }: { icon: string; color: string; value: number | string }) {
  return (
    <div className="flex items-center gap-1.5 font-display text-sm font-extrabold text-qupu-brand-blue">
      <i className={`${icon} ${color} text-base`} aria-hidden="true" />
      <span>{value}</span>
    </div>
  )
}
