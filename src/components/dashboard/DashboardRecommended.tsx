import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import type { DashboardRecommendation } from '../../lib/dashboardData'

interface Props {
  items: DashboardRecommendation[]
  childName: string
}

// Matches the landing page's "Video Terbaru dari QUPU" card
// (src/pages/Home.tsx LandingVideoCard): real thumbnail, subject pill,
// play-button hover, title, subject + relative date footer.
function RecommendedCard({ rec }: { rec: DashboardRecommendation }) {
  const date = rec.publishedAt
    ? formatDistanceToNow(new Date(rec.publishedAt), { addSuffix: true, locale: idLocale })
    : ''

  return (
    <Link to={rec.href} className="group block cursor-pointer space-y-2.5">
      <div className="relative aspect-video overflow-hidden rounded-2xl border-[3px] border-qupu-brand-blue/15 bg-qupu-cream shadow-[4px_5px_0_0_#FFD3B1] transition-all duration-200 group-hover:-translate-y-1 group-hover:border-qupu-brand-orange">
        {rec.thumbnailUrl ? (
          <img
            src={rec.thumbnailUrl}
            alt={rec.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ backgroundColor: rec.subjectColorHex }}
            aria-hidden="true"
          >
            <i className="fa-solid fa-circle-play text-4xl text-white/85" />
          </div>
        )}
        <div
          className="absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm"
          style={{ backgroundColor: rec.subjectColorHex }}
        >
          {rec.subjectName}
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-qupu-brand-orange shadow-clay-orange">
            <i className="fa-solid fa-play text-base text-white" aria-hidden="true" />
          </div>
        </div>
      </div>
      <h3 className="line-clamp-2 font-display text-sm font-bold leading-tight text-qupu-brand-blue group-hover:text-qupu-brand-orange">
        {rec.title}
      </h3>
      <p className="flex items-center gap-2 text-xs">
        <span className="font-semibold" style={{ color: rec.subjectColorHex }}>
          {rec.subjectName}
        </span>
        {date && (
          <>
            <span className="text-qupu-muted/60">•</span>
            <span className="font-medium text-qupu-muted">{date}</span>
          </>
        )}
      </p>
    </Link>
  )
}

export default function DashboardRecommended({ items, childName }: Props) {
  if (items.length === 0) return null

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
            Rekomendasi Video
          </div>
          <h2 className="mt-1 font-display text-xl font-extrabold text-qupu-brand-blue sm:text-2xl">
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((rec) => (
          <RecommendedCard key={rec.id} rec={rec} />
        ))}
      </div>
    </section>
  )
}
