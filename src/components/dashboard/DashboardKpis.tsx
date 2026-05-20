import Sparkline from './primitives/Sparkline'
import type { KpiTile } from '../../lib/dashboardData'

interface Props {
  tiles: KpiTile[]
}

export default function DashboardKpis({ tiles }: Props) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((tile) => {
        const direction = tile.trend > 0 ? 'up' : tile.trend < 0 ? 'down' : 'flat'
        const trendClass =
          direction === 'up'
            ? 'bg-emerald-100 text-emerald-700'
            : direction === 'down'
              ? 'bg-rose-100 text-rose-700'
              : 'bg-qupu-shell text-qupu-muted'
        const trendSymbol = direction === 'up' ? '▲' : direction === 'down' ? '▼' : '·'
        const trendPrefix = tile.trend > 0 ? '+' : ''
        return (
          <article
            key={tile.key}
            className="relative overflow-hidden rounded-[1.75rem] border-[3px] border-qupu-brand-blue/15 bg-white p-5 shadow-[5px_6px_0_0_#FFD3B1] transition-transform duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between gap-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-[0.75rem] text-white shadow-soft"
                style={{ backgroundColor: tile.iconBg }}
                aria-hidden="true"
              >
                <i className={`${tile.iconClass} text-base`} />
              </span>
              <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${trendClass}`}>
                <span aria-hidden="true">{trendSymbol}</span>
                {trendPrefix}
                {tile.trend}
                {tile.trendUnit === '%' ? '%' : ` ${tile.trendUnit}`}
              </span>
            </div>
            <div className="mt-4 font-display text-4xl font-extrabold leading-none text-qupu-brand-blue">
              {tile.value}
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-qupu-muted">
              {tile.label}
            </div>
            <div className="mt-3 -mb-1 h-8 opacity-80" style={{ color: tile.iconBg }}>
              <Sparkline data={tile.sparkline} color={tile.iconBg} />
            </div>
          </article>
        )
      })}
    </section>
  )
}
