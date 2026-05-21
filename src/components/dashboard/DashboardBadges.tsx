import { Link } from 'react-router-dom'
import type { DashboardBadge } from '../../lib/dashboardData'

interface Props {
  badges: DashboardBadge[]
}

export default function DashboardBadges({ badges }: Props) {
  const earned = badges.filter((b) => b.earned).length

  return (
    <article className="flex h-full flex-col rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1]">
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
            Lencana
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold text-qupu-brand-blue sm:text-3xl">
            {earned} dari {badges.length} terkumpul
          </h2>
        </div>
        <Link
          to="/badges"
          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-qupu-shell px-4 py-2 font-display text-sm font-bold text-qupu-brand-blue transition-transform hover:-translate-y-0.5"
        >
          Semua
          <span aria-hidden="true">→</span>
        </Link>
      </header>

      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {badges.map((b) => (
          <li
            key={b.id}
            className={`flex flex-col items-center gap-2 rounded-[1.25rem] border-[3px] border-qupu-shell bg-white px-3 py-4 text-center shadow-[3px_4px_0_0_#FFD3B1] ${b.earned ? '' : 'opacity-40'}`}
          >
            <span
              className="flex h-12 w-12 items-center justify-center rounded-full text-2xl shadow-soft"
              style={{ backgroundColor: b.earned ? b.colorHex : '#E5E0D8' }}
              aria-hidden="true"
            >
              <i className={b.earned ? `${b.icon} text-white` : 'fa-solid fa-lock text-qupu-muted'} />
            </span>
            <strong className="font-display text-xs text-qupu-brand-blue">{b.name}</strong>
            <span className="text-[10px] font-medium text-qupu-muted">{b.description}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}
