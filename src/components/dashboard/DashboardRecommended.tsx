import { Link } from 'react-router-dom'
import type { DashboardRecommendation, RecommendedTag } from '../../lib/dashboardData'

interface Props {
  items: DashboardRecommendation[]
  childName: string
}

const TAG_STYLES: Record<RecommendedTag, string> = {
  FOKUS:     'bg-qupu-brand-orange text-white',
  TANTANGAN: 'bg-[#8A5BF0] text-white',
  LANJUTAN:  'bg-qupu-brand-blue text-white',
}

export default function DashboardRecommended({ items, childName }: Props) {
  if (items.length === 0) return null

  return (
    <article className="rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1]">
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
            Rekomendasi Video
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold text-qupu-brand-blue sm:text-3xl">
            Direkomendasikan untuk {childName}
          </h2>
        </div>
        <Link
          to="/videos"
          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-qupu-shell px-4 py-2 font-display text-sm font-bold text-qupu-brand-blue transition-transform hover:-translate-y-0.5"
        >
          Lihat semua
          <span aria-hidden="true">→</span>
        </Link>
      </header>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((rec) => (
          <Link
            key={rec.id}
            to={rec.href}
            className="group flex flex-col overflow-hidden rounded-[1.5rem] border-[3px] border-qupu-shell bg-white shadow-[3px_4px_0_0_#FFD3B1] transition-all duration-200 hover:-translate-y-1 hover:border-qupu-brand-orange"
          >
            <div
              className="relative flex aspect-video items-center justify-center text-white"
              style={{ backgroundColor: rec.subjectColorHex }}
            >
              <span className="font-display text-5xl font-extrabold opacity-90" aria-hidden="true">
                {rec.subjectInitial}
              </span>
              <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${TAG_STYLES[rec.tag]}`}>
                {rec.tag}
              </span>
              <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-clay-orange">
                  <i className="fa-solid fa-play text-lg text-qupu-brand-orange" aria-hidden="true" />
                </span>
              </span>
            </div>
            <div className="space-y-2 p-4">
              <h3 className="line-clamp-2 font-display text-base font-extrabold leading-tight text-qupu-brand-blue group-hover:text-qupu-brand-orange">
                {rec.title}
              </h3>
              <p className="text-xs font-medium text-qupu-muted">{rec.reason}</p>
            </div>
          </Link>
        ))}
      </div>
    </article>
  )
}
