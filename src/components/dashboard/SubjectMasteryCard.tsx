import { Link } from 'react-router-dom'
import type { SubjectStat } from '../../types'
import { predikatLabel } from '../../lib/predikat'

interface Props {
  stats: SubjectStat[]
  childName: string
}

export default function SubjectMasteryCard({ stats, childName }: Props) {
  const hasAny = stats.some((s) => s.totalVideosAvailable > 0)

  return (
    <div className="rounded-[2rem] border-[3px] border-qupu-brand-orange bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
            Subject mastery
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold text-qupu-brand-blue sm:text-3xl">
            Performa {childName} per subject
          </h2>
        </div>
        <Link
          to="/report"
          className="inline-flex items-center gap-2 rounded-full bg-qupu-brand-blue px-5 py-2.5 font-display text-sm font-extrabold text-white shadow-subscribe transition-transform hover:-translate-y-0.5"
        >
          Lihat rapor lengkap
          <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
        </Link>
      </div>

      {!hasAny ? (
        <p className="mt-5 text-sm font-medium text-qupu-muted">
          Belum ada subject yang tersedia untuk usia ini. Hubungi admin atau cek halaman Video.
        </p>
      ) : (
        <div className="mt-5 grid gap-4">
          {stats
            .filter((s) => s.totalVideosAvailable > 0)
            .map((s) => {
              const coverage =
                s.totalVideosAvailable === 0
                  ? 0
                  : Math.round((s.videosAttempted / s.totalVideosAvailable) * 100)
              const score = s.averageBestScore ?? 0
              const chip = predikatLabel(s.predikat)
              return (
                <div key={s.id} className="rounded-[1.25rem] bg-qupu-shell px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded"
                        style={{ backgroundColor: s.colorHex }}
                      />
                      <span className="font-display text-base font-extrabold text-qupu-brand-blue">
                        {s.name}
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${chip.bgClass} ${chip.textClass}`}
                    >
                      {chip.label}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <Bar
                      label={`Coverage ${s.videosAttempted}/${s.totalVideosAvailable}`}
                      value={coverage}
                      fillClass="bg-qupu-brand-blue"
                      trackClass="bg-qupu-brand-blue/15"
                    />
                    <Bar
                      label={
                        s.videosAttempted === 0
                          ? 'Skor —'
                          : `Skor rata-rata ${s.averageBestScore}%`
                      }
                      value={score}
                      fillClass="bg-qupu-brand-orange"
                      trackClass="bg-qupu-brand-orange/20"
                    />
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}

function Bar({
  label,
  value,
  fillClass,
  trackClass,
}: {
  label: string
  value: number
  fillClass: string
  trackClass: string
}) {
  return (
    <div>
      <div className="text-xs font-semibold text-qupu-muted">{label}</div>
      <div className={`mt-1 h-2 w-full rounded-full ${trackClass}`}>
        <div
          className={`h-full rounded-full ${fillClass}`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  )
}
