import { Link } from 'react-router-dom'
import type { AttemptAction, DashboardAttempt } from '../../lib/dashboardData'

interface Props {
  attempts: DashboardAttempt[]
  childName: string
}

const ACTION_LABELS: Record<AttemptAction, string> = {
  review:    'Diskusikan',
  celebrate: 'Rayakan',
  continue:  'Lanjutkan',
}

const ACTION_STYLES: Record<AttemptAction, string> = {
  review:    'bg-qupu-brand-orange text-white shadow-[0_3px_0_0_#B8541A]',
  celebrate: 'bg-emerald-500 text-white shadow-[0_3px_0_0_#047857]',
  continue:  'bg-qupu-brand-blue text-white shadow-subscribe',
}

export default function DashboardAttempts({ attempts, childName }: Props) {
  if (attempts.length === 0) {
    return (
      <article className="flex h-full flex-col rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1]">
        <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
          Aktivitas Terakhir
        </div>
        <h2 className="mt-1 font-display text-2xl font-bold text-qupu-brand-blue sm:text-3xl">
          Belum ada quiz
        </h2>
        <p className="mt-3 text-sm font-medium text-qupu-muted">
          Buka halaman Video dan pilih quiz untuk {childName}.
        </p>
      </article>
    )
  }

  return (
    <article className="flex h-full flex-col rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1]">
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
            Aktivitas Terakhir
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold text-qupu-brand-blue sm:text-3xl">
            Quiz terbaru
          </h2>
        </div>
        <Link
          to="/report"
          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-qupu-shell px-4 py-2 font-display text-sm font-bold text-qupu-brand-blue transition-transform hover:-translate-y-0.5"
        >
          Semua
          <span aria-hidden="true">→</span>
        </Link>
      </header>

      <ul className="mt-5 grid gap-2">
        {attempts.map((a) => {
          const scoreColor =
            a.score >= 80 ? 'text-emerald-600' : a.score >= 65 ? 'text-qupu-brand-orange' : 'text-rose-600'
          return (
            <li
              key={a.id}
              className="grid grid-cols-[2.25rem_1fr_auto_auto] items-center gap-3 rounded-[1.25rem] bg-qupu-shell px-3 py-2.5"
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-[0.75rem] font-display text-sm font-extrabold text-white"
                style={{ backgroundColor: a.subjectColorHex }}
                aria-hidden="true"
              >
                {a.subjectName.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <Link
                  to={`/videos/${a.videoSlug}`}
                  className="block truncate font-display text-sm font-extrabold text-qupu-brand-blue hover:text-qupu-brand-orange"
                >
                  {a.videoTitle}
                </Link>
                <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-qupu-muted">
                  {a.subjectName} · {a.whenLabel}
                </div>
              </div>
              <span className={`whitespace-nowrap font-display text-base font-extrabold ${scoreColor}`}>
                {a.score}%
              </span>
              <Link
                to={`/videos/${a.videoSlug}`}
                className={`inline-flex whitespace-nowrap items-center justify-center rounded-full px-3 py-1.5 font-display text-xs font-extrabold transition-transform hover:-translate-y-0.5 ${ACTION_STYLES[a.action]}`}
              >
                {ACTION_LABELS[a.action]}
              </Link>
            </li>
          )
        })}
      </ul>
    </article>
  )
}
