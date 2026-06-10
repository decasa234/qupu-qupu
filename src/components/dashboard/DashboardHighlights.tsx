// src/components/dashboard/DashboardHighlights.tsx
//
// Home-screen "interesting stuff" block, mobile-first for the AppShell phone
// frame. Three stacked cards:
//   1. Daily goal ring   — today's activity target with an animated conic
//      fill. The unit is "aktivitas" (video quizzes + WMI answers + chapter
//      tests all count), so the copy must stay activity-neutral.
//   2. Streak week strip  — last 7 days from the heatmap, today highlighted.
//   3. Recent badges row  — newest earned badges, links to the Badge tab.
// All derived from the existing dashboard view model; no new API.
import { Link } from 'react-router-dom'
import type { DashboardViewModel } from '../../lib/dashboardData'

const RAMP = ['#FFF2DF', '#FFE6C2', '#FFC988', '#F0853A', '#D66B23']
const DAY_LETTERS = ['S', 'S', 'R', 'K', 'J', 'S', 'M'] // Sen–Min, display only

interface Props {
  vm: DashboardViewModel
}

export default function DashboardHighlights({ vm }: Props) {
  return (
    <section className="space-y-4">
      <div className="px-1">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-qupu-brand-orange">
          Progresmu
        </p>
        <h2 className="font-display text-xl font-black leading-none text-qupu-brand-blue">
          Lihat sejauh mana kamu!
        </h2>
      </div>

      <DailyGoalCard vm={vm} />
      <StreakWeekCard vm={vm} />
      <RecentBadgesCard vm={vm} />
    </section>
  )
}

function DailyGoalCard({ vm }: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(vm.dailyGoalPct)))
  const target = Math.max(1, vm.dailyGoalQuizzes)
  const done = Math.min(target, Math.round((pct / 100) * target))
  const remaining = Math.max(0, target - done)
  const complete = pct >= 100

  return (
    <div className="flex items-center gap-4 rounded-[1.75rem] bg-[#FFF8F0] p-4 shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
      <div
        className="animate-goal-fill relative flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full"
        style={{
          // conic ring fill; --goal-deg animates 0 → target on mount
          background: `conic-gradient(${complete ? '#58A700' : '#f0853a'} var(--goal-deg, ${pct * 3.6}deg), #FFE3CC 0deg)`,
          // @ts-expect-error — custom prop consumed by the keyframe
          '--goal-deg': `${pct * 3.6}deg`,
        }}
      >
        <div className="flex h-[58px] w-[58px] flex-col items-center justify-center rounded-full bg-white">
          <span className="font-display text-lg font-black leading-none text-qupu-brand-blue">
            {done}/{target}
          </span>
          <span className="text-[8px] font-black uppercase tracking-[0.04em] text-qupu-muted">
            aktivitas
          </span>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-qupu-brand-orange">
          Target hari ini
        </div>
        <h3 className="mt-0.5 font-display text-base font-black leading-tight text-qupu-brand-blue">
          {complete
            ? 'Target tercapai!'
            : remaining === 1
              ? 'Tinggal 1 aktivitas lagi!'
              : `Ayo, ${remaining} aktivitas lagi!`}
        </h3>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#FFE3CC]">
          <div
            className={`h-full rounded-full transition-[width] duration-700 ${complete ? 'bg-[#58A700]' : 'bg-qupu-brand-orange'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function StreakWeekCard({ vm }: Props) {
  // Last 7 cells of the 28-day heatmap = this week, ending at today.
  const start = Math.max(0, vm.todayIdx - 6)
  const week = vm.heatmap.slice(start, vm.todayIdx + 1)
  // Pad to 7 from the left if the heatmap is shorter than expected.
  while (week.length < 7) week.unshift(0)
  const todayPos = week.length - 1

  return (
    <div className="rounded-[1.75rem] bg-qupu-brand-blue p-4 text-white shadow-[0_5px_0_0_#0E1430]">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-qupu-brand-yellow">
            Minggu ini
          </div>
          <h3 className="mt-0.5 font-display text-base font-black leading-none">
            {vm.streak} hari berturut
          </h3>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-qupu-brand-orange text-base text-white shadow-[0_3px_0_0_#B8541A]">
          <i className="fa-solid fa-fire" aria-hidden="true" />
        </span>
      </div>

      <div className="mt-3 flex justify-between gap-1.5">
        {week.map((value, i) => {
          const intensity = Math.max(0, Math.min(4, Math.round(value)))
          const active = intensity > 0
          const isToday = i === todayPos
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={`flex aspect-square w-full max-w-[34px] items-center justify-center rounded-[0.7rem] ${
                  isToday ? 'ring-2 ring-qupu-brand-yellow ring-offset-1 ring-offset-qupu-brand-blue' : ''
                }`}
                style={{ backgroundColor: active ? RAMP[intensity] : 'rgba(255,255,255,0.12)' }}
              >
                {active && (
                  <i className="fa-solid fa-fire text-[11px] text-white/90" aria-hidden="true" />
                )}
              </div>
              <span className="text-[9px] font-black text-white/55">{DAY_LETTERS[i]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RecentBadgesCard({ vm }: Props) {
  const earned = vm.badges.filter((b) => b.earned)
  // Show the most recent few; the catalog is ordered oldest→newest tiers, so
  // take from the end for "latest unlocked".
  const recent = earned.slice(-4).reverse()

  return (
    <Link
      to="/badges"
      className="block rounded-[1.75rem] bg-[#FFF8F0] p-4 shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5 active:shadow-[0_2px_0_0_#FFD3B1]"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-qupu-brand-orange">
            Badge terbaru
          </div>
          <h3 className="mt-0.5 font-display text-base font-black leading-none text-qupu-brand-blue">
            {earned.length} badge terkumpul
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-qupu-brand-blue px-3 py-1 text-[10px] font-black text-white">
          Semua
          <i className="fa-solid fa-arrow-right text-[9px]" aria-hidden="true" />
        </span>
      </div>

      {recent.length > 0 ? (
        <div className="mt-3 flex gap-2.5">
          {recent.map((badge) => (
            <span
              key={badge.id}
              title={badge.name}
              className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl text-lg text-white shadow-[0_3px_0_0_rgba(0,0,0,0.12)]"
              style={{ backgroundColor: badge.colorHex }}
            >
              <i className={badge.icon} aria-hidden="true" />
              <span className="badge-shine pointer-events-none absolute inset-0" />
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs font-semibold text-qupu-muted">
          Belum ada badge. Selesaikan quiz untuk membukanya!
        </p>
      )}
    </Link>
  )
}
