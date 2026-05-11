import { Link } from 'react-router-dom'
import type { DashboardInsight } from '../../lib/dashboardData'

interface Props {
  items: DashboardInsight[]
}

const ACCENT: Record<DashboardInsight['type'], { border: string; bg: string }> = {
  focus:  { border: 'border-qupu-brand-orange/40', bg: 'bg-qupu-shell' },
  strong: { border: 'border-emerald-300/60',        bg: 'bg-white' },
  tip:    { border: 'border-qupu-brand-blue/20',    bg: 'bg-white' },
}

export default function DashboardInsights({ items }: Props) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      {items.map((insight) => {
        const tone = ACCENT[insight.type]
        return (
          <article
            key={insight.type}
            className={`flex flex-col rounded-[2rem] border-[3px] ${tone.border} ${tone.bg} p-6 shadow-[5px_6px_0_0_#FFD3B1]`}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-2xl shadow-soft" aria-hidden="true">
                {insight.icon}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
                {insight.kicker}
              </span>
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-qupu-brand-blue sm:text-xl">
              {insight.title}
            </h3>
            <p className="mt-2 flex-1 text-sm font-medium leading-relaxed text-qupu-muted">
              {insight.body}
            </p>
            <Link
              to={insight.href}
              className="mt-5 inline-flex w-fit items-center justify-center gap-2 whitespace-nowrap rounded-full bg-qupu-brand-blue px-5 py-2 font-display text-sm font-extrabold text-white shadow-subscribe transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
            >
              {insight.cta}
              <span aria-hidden="true">→</span>
            </Link>
          </article>
        )
      })}
    </section>
  )
}
