import type { SubjectStat } from '../../types'
import { predikatLabel } from '../../lib/predikat'

export default function RaporSubjectTable({ stats }: { stats: SubjectStat[] }) {
  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-qupu-brand-blue/10">
      <div className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr_1.1fr] bg-qupu-brand-blue px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-white">
        <div>Subject</div>
        <div>Coverage</div>
        <div>Rata Skor</div>
        <div>Badge</div>
        <div>Predikat</div>
      </div>
      {stats.map((s) => {
        const chip = predikatLabel(s.predikat)
        return (
          <div
            key={s.id}
            className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr_1.1fr] items-center border-b border-qupu-brand-blue/10 px-3 py-2 text-xs text-qupu-brand-blue last:border-b-0"
          >
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded" style={{ backgroundColor: s.colorHex }} />
              <span className="font-extrabold">{s.name}</span>
            </div>
            <div>{s.videosAttempted} / {s.totalVideosAvailable} video</div>
            <div className="font-extrabold">
              {s.averageBestScore === null ? '—' : `${s.averageBestScore}%`}
            </div>
            <div>{s.badgesEarned}×</div>
            <div>
              <span
                className={`inline-block rounded px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.06em] ${chip.bgClass} ${chip.textClass}`}
              >
                {chip.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
