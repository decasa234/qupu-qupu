// src/components/VideoCard.tsx
import { Link } from 'react-router-dom'
import BadgeCurve from './BadgeCurve'
import type { VideoCard as VideoCardType } from '../types'

interface VideoCardProps {
  video: VideoCardType
}

export default function VideoCard({ video }: VideoCardProps) {
  return (
    <article className="group overflow-hidden rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white shadow-[5px_6px_0_0_#FFD3B1] transition-all duration-200 hover:-translate-y-1 hover:border-qupu-brand-orange">
      <Link to={`/videos/${video.slug}`} className="block cursor-pointer">
        <div className="relative aspect-video overflow-hidden bg-qupu-cream">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div
            className="absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white shadow-sm"
            style={{ backgroundColor: video.subject.colorHex }}
          >
            {video.subject.name}
          </div>
          <div className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-qupu-brand-blue shadow-sm">
            {video.ageGroup.name}
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-qupu-brand-orange shadow-clay-orange">
              <i className="fa-solid fa-play text-lg text-white" aria-hidden="true" />
            </div>
          </div>
        </div>
      </Link>

      <div className="space-y-3 p-5">
        <h3 className="line-clamp-2 font-display text-lg font-extrabold leading-tight text-qupu-brand-blue group-hover:text-qupu-brand-orange">
          {video.title}
        </h3>
        {video.description && (
          <p className="line-clamp-2 text-xs font-medium leading-relaxed text-qupu-muted">
            {video.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-qupu-muted">
          <span>{video.numberOfQuestions} soal</span>
          <span className="text-qupu-muted/50">•</span>
          <span>{video.difficulty}</span>
        </div>

        <div className="flex items-center justify-between rounded-[1.25rem] bg-qupu-cream px-4 py-2.5">
          <div className="flex items-center gap-2">
            <BadgeCurve color={video.subject.colorHex} size={28} />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-qupu-muted">Badge</div>
              <div className="text-sm font-bold text-qupu-brand-blue">{video.subject.name}</div>
            </div>
          </div>
          <Link
            to={`/videos/${video.slug}`}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-qupu-brand-orange px-4 py-2 text-xs font-extrabold text-white transition-transform hover:-translate-y-0.5"
          >
            Detail
            <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  )
}
