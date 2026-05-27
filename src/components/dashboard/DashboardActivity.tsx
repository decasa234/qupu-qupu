import Heatmap, { HeatmapLegend } from './primitives/Heatmap'
import type { DashboardViewModel } from '../../lib/dashboardData'

interface Props {
  vm: DashboardViewModel
}

export default function DashboardActivity({ vm }: Props) {
  return (
    <article className="flex h-full flex-col rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1]">
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
            Aktivitas Belajar
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold text-qupu-brand-blue sm:text-3xl">
            4 minggu terakhir
          </h2>
        </div>
        <span className="whitespace-nowrap rounded-full bg-qupu-shell px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-qupu-muted">
          28 hari
        </span>
      </header>

      <div className="mt-5 grid gap-5 lg:grid-cols-[auto_1fr]">
        <div>
          <Heatmap data={vm.heatmap} todayIdx={vm.todayIdx} />
          <HeatmapLegend />
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <div className="rounded-[1.25rem] bg-gradient-to-br from-qupu-brand-orange to-[#D66B23] p-4 text-white shadow-[3px_4px_0_0_#FFD3B1]">
            <div className="text-3xl" aria-hidden="true"><i className="fa-solid fa-fire" /></div>
            <div className="mt-2 font-display text-4xl font-extrabold leading-none">{vm.streak}</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/85">
              Hari berturut
            </div>
            <div className="mt-2 text-[11px] font-medium text-white/80">
              Terpanjang: {vm.longestStreak} hari
            </div>
          </div>
          <div className="rounded-[1.25rem] bg-qupu-shell p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-qupu-muted">
              Waktu favorit
            </div>
            <div className="mt-1 font-display text-base font-extrabold text-qupu-brand-blue">
              {vm.favTime}
            </div>
            <div className="mt-2 text-[11px] font-medium text-qupu-muted">
              Saat anak paling fokus belajar.
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
