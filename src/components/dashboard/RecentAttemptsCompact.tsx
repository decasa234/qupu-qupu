import { Link } from 'react-router-dom'
import type { RecentAttempt } from '../../types'
import { formatDateLabel } from '../../lib/youtube'

interface Props {
  attempts: RecentAttempt[]
  childName: string
}

export default function RecentAttemptsCompact({ attempts, childName }: Props) {
  const dedupedAttempts: RecentAttempt[] = []
  const seen = new Set<string>()
  for (const attempt of attempts) {
    if (seen.has(attempt.videoSlug)) continue
    seen.add(attempt.videoSlug)
    dedupedAttempts.push(attempt)
    if (dedupedAttempts.length >= 5) break
  }

  return (
    <div className="rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
            <i className="fa-solid fa-clock-rotate-left" aria-hidden="true" />
            Aktivitas terbaru
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold text-qupu-brand-blue sm:text-3xl">
            Recent attempts
          </h2>
        </div>
        <Link
          to="/badges"
          className="inline-flex items-center gap-2 rounded-full bg-qupu-cream px-4 py-2 font-display text-sm font-bold text-qupu-brand-blue transition-transform hover:-translate-y-0.5"
        >
          Trophy wall
          <i className="fa-solid fa-arrow-up-right-from-square text-xs" aria-hidden="true" />
        </Link>
      </div>

      {attempts.length === 0 ? (
        <p className="mt-5 text-sm font-medium text-qupu-muted">
          Belum ada attempt tersimpan untuk {childName}. Buka halaman Video dan pilih kuis.
        </p>
      ) : (
        <div className="mt-5 grid gap-3">
          {dedupedAttempts.map((attempt) => (
            <div
              key={attempt.id}
              className="flex flex-col gap-2 rounded-[1.25rem] bg-qupu-shell px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="font-bold text-qupu-brand-blue">{attempt.videoTitle}</div>
                <div className="text-xs font-medium text-qupu-muted">
                  {attempt.correctAnswers}/{attempt.totalQuestions} benar •{' '}
                  {formatDateLabel(attempt.createdAt)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white"
                  style={{ backgroundColor: attempt.subjectColorHex }}
                >
                  {attempt.subjectName}
                </span>
                <span className="rounded-full bg-white px-3 py-1 font-display text-sm font-extrabold text-qupu-brand-orange shadow-soft">
                  {attempt.scorePercentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
