import { Link } from 'react-router-dom'
import { ArrowRight, PlayCircle } from 'lucide-react'
import type { VideoCard as VideoCardType } from '../types'

interface VideoCardProps {
  video: VideoCardType
}

export default function VideoCard({ video }: VideoCardProps) {
  return (
    <article className="group overflow-hidden rounded-[2rem] border border-qupu-peach bg-white shadow-soft transition-transform duration-200 hover:-translate-y-1">
      <Link to={`/videos/${video.slug}`} className="block cursor-pointer">
        <div className="relative aspect-video overflow-hidden bg-qupu-cream">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-qupu-purple">
            {video.ageGroup.name}
          </div>
          <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-qupu-purple px-3 py-2 text-sm font-bold text-white shadow-soft">
            <PlayCircle className="h-4 w-4" />
            Tonton
          </div>
        </div>
      </Link>

      <div className="space-y-4 p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-qupu-muted">
          <span
            className="rounded-full px-3 py-1 text-white"
            style={{ backgroundColor: video.subject.colorHex }}
          >
            {video.subject.name}
          </span>
          <span>{video.numberOfQuestions} soal</span>
          <span>{video.difficulty}</span>
        </div>

        <div>
          <h3 className="font-display text-2xl font-bold text-qupu-ink">{video.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-qupu-muted">{video.description}</p>
        </div>

        <div className="flex items-center justify-between rounded-[1.25rem] bg-qupu-cream px-4 py-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-qupu-muted">
              Badge
            </div>
            <div className="font-bold text-qupu-purple">{video.badgeFamily.name}</div>
          </div>
          <Link
            to={`/videos/${video.slug}`}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-qupu-orange shadow-soft transition-colors hover:bg-qupu-orange hover:text-white"
          >
            Detail
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  )
}
