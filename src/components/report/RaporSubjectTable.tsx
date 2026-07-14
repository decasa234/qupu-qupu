import type { SubjectStat } from '../../types'
import { predikatLabel } from '../../lib/predikat'

export default function RaporSubjectTable({ stats }: { stats: SubjectStat[] }) {
  return (
    <>
      {/* Mobile: stacked cards (the 5-col table is unreadable in a phone frame).
          Hidden from print so the print layout always uses the table below. */}
      <div className="mt-2 space-y-2 sm:hidden print:hidden">
        {stats.map((s) => {
          const chip = predikatLabel(s.predikat)
          return (
            <div
              key={s.id}
              className="rounded-[1.25rem] border border-qupu-brand-blue/10 bg-qupu-shell p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-3 w-3 flex-shrink-0 rounded"
                    style={{ backgroundColor: s.colorHex }}
                  />
                  <span className="truncate font-display text-sm font-extrabold text-qupu-brand-blue">
                    {s.name}
                  </span>
                </div>
                <span
                  className={`flex-shrink-0 rounded px-2 py-0.5 text-[0.5625rem] font-extrabold uppercase tracking-[0.06em] ${chip.bgClass} ${chip.textClass}`}
                >
                  {chip.label}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <Stat label="Skor" value={s.averageBestScore === null ? '—' : `${s.averageBestScore}%`} />
                <Stat label="Video" value={`${s.videosAttempted}/${s.totalVideosAvailable}`} />
                <Stat label="Badge" value={`${s.badgesEarned}×`} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop + print: the original 5-column table. */}
      <div className="mt-2 hidden overflow-hidden rounded-lg border border-qupu-brand-blue/10 sm:block print:block">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr_1.1fr] bg-qupu-brand-blue px-3 py-2 text-[0.625rem] font-extrabold uppercase tracking-[0.08em] text-white">
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
                  className={`inline-block rounded px-2 py-0.5 text-[0.5625rem] font-extrabold uppercase tracking-[0.06em] ${chip.bgClass} ${chip.textClass}`}
                >
                  {chip.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white px-1.5 py-1.5">
      <div className="text-[0.5rem] font-extrabold uppercase tracking-[0.1em] text-qupu-muted">
        {label}
      </div>
      <div className="font-display text-sm font-extrabold text-qupu-brand-blue">{value}</div>
    </div>
  )
}
