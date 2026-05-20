import GoalRing from './primitives/GoalRing'
import type { DashboardViewModel } from '../../lib/dashboardData'

interface Props {
  vm: DashboardViewModel
}

export default function DashboardHero({ vm }: Props) {
  // xp = XP earned past the current tier threshold.
  // xpToNext = XP REMAINING to reach the next tier (0 at max level).
  // levelSpan = total XP from current tier start to next tier start.
  // QA-003: previously the label and bar used `xp / xpToNext` which
  // mixed semantics — 95 earned + 55 remaining displayed as "95 / 55"
  // and pushed the bar past 100% before the level was done.
  const atMaxLevel = vm.xpToNext === 0
  const levelSpan = Math.max(1, vm.xp + vm.xpToNext)
  const xpPct = atMaxLevel ? 100 : Math.min(100, Math.round((vm.xp / levelSpan) * 100))
  const xpLabel = atMaxLevel ? `${vm.xp} XP · MAX` : `${vm.xp} / ${levelSpan} XP`
  const onFire = vm.streak >= 3

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-6 shadow-[6px_8px_0_0_#FFD3B1] sm:p-8 lg:p-10">
      <i className="fa-solid fa-star pointer-events-none absolute left-5 top-5 text-xl text-qupu-brand-yellow drop-shadow-sm" aria-hidden="true" />
      <i className="fa-solid fa-star pointer-events-none absolute right-7 top-3 text-base text-qupu-brand-yellow/80" aria-hidden="true" />
      <i className="fa-solid fa-star pointer-events-none absolute left-6 bottom-5 text-sm text-qupu-brand-yellow/70" aria-hidden="true" />
      <i className="fa-solid fa-star pointer-events-none absolute right-5 bottom-7 text-lg text-qupu-brand-yellow" aria-hidden="true" />

      <div className="grid gap-8 lg:grid-cols-[auto_1.2fr_auto] lg:items-center">
        {/* Mascot column */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <img
              src="/hero-mascot.png"
              alt=""
              draggable={false}
              aria-hidden="true"
              className="pointer-events-none h-32 w-auto select-none drop-shadow-[0_10px_24px_rgba(120,60,0,0.25)] sm:h-40"
            />
            <span className="absolute -bottom-2 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-qupu-brand-blue px-3 py-1 font-display text-xs font-extrabold text-white shadow-subscribe">
              <i className="fa-solid fa-star text-qupu-brand-yellow" aria-hidden="true" />
              Level {vm.level}
              {vm.tierName ? ` · ${vm.tierName}` : ''}
            </span>
          </div>
        </div>

        {/* Narrative column */}
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
            Anak Bunda{vm.child.ageLabel ? ` · ${vm.child.ageLabel}` : ''}
          </div>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-qupu-brand-blue sm:text-4xl">
            {onFire ? `${vm.child.name} sedang on fire! 🔥` : `Yuk lanjutkan belajar bareng ${vm.child.name}`}
          </h1>
          <p className="mt-3 text-sm font-medium text-qupu-muted sm:text-base">
            Streak <strong className="text-qupu-brand-blue">{vm.streak} hari</strong>
            {onFire ? ' — pertahankan!' : ' — belajar 5 menit lagi untuk tambah streak.'}
            {' '}Aktivitas hari ini: <strong className="text-qupu-brand-blue">{vm.screenTimeMin} menit</strong>.
          </p>

          <div className="mt-5 flex items-center gap-3">
            <span className="whitespace-nowrap rounded-full bg-qupu-shell px-3 py-1 text-xs font-bold text-qupu-brand-blue">
              {xpLabel}
            </span>
            <div className="relative h-3 flex-1 overflow-hidden rounded-full border-2 border-qupu-peach bg-white">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-qupu-brand-orange transition-[width] duration-500"
                style={{ width: `${xpPct}%` }}
              />
            </div>
            <span className="whitespace-nowrap font-display text-sm font-extrabold text-qupu-brand-blue">
              {xpPct}%
            </span>
          </div>
        </div>

        {/* Mini stats column */}
        <div className="grid grid-cols-3 gap-3 lg:grid-cols-1 lg:gap-4">
          <div className="rounded-[1.25rem] bg-qupu-shell px-4 py-3 text-center">
            <div className="font-display text-3xl font-extrabold text-qupu-brand-blue">
              <span className="text-2xl" aria-hidden="true">🔥</span> {vm.streak}
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-qupu-muted">Streak</div>
          </div>
          <div className="rounded-[1.25rem] bg-qupu-shell px-4 py-3 text-center">
            <GoalRing pct={vm.dailyGoalPct} />
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-qupu-muted">Target hari</div>
          </div>
          <div className="rounded-[1.25rem] bg-qupu-shell px-4 py-3 text-center">
            <div className="font-display text-3xl font-extrabold text-qupu-brand-blue">
              <span className="text-2xl" aria-hidden="true">⏱</span> {vm.screenTimeMin}m
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-qupu-muted">Hari ini</div>
          </div>
        </div>
      </div>
    </section>
  )
}
