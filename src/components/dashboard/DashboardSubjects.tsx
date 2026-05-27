import { useState } from 'react'
import { Link } from 'react-router-dom'
import PeerPill from './primitives/PeerPill'
import BadgeCurve from '../BadgeCurve'
import type { DashboardSubject } from '../../lib/dashboardData'

interface Props {
  subjects: DashboardSubject[]
  childName: string
}

export default function DashboardSubjects({ subjects, childName }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)

  if (subjects.length === 0) {
    return (
      <article className="flex h-full flex-col rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1]">
        <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
          Penguasaan Mata Pelajaran
        </div>
        <h2 className="mt-1 font-display text-2xl font-bold text-qupu-brand-blue sm:text-3xl">
          Belum ada subject
        </h2>
        <p className="mt-3 text-sm font-medium text-qupu-muted">
          Selesaikan quiz pertama untuk melihat penguasaan {childName} per subject.
        </p>
      </article>
    )
  }

  return (
    <article className="flex h-full flex-col rounded-[2rem] border-[3px] border-qupu-brand-orange/40 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1]">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
            Penguasaan Mata Pelajaran
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold text-qupu-brand-blue sm:text-3xl">
            Performa {childName}
          </h2>
        </div>
        <Link
          to="/report"
          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-qupu-shell px-4 py-2 font-display text-sm font-bold text-qupu-brand-blue transition-transform hover:-translate-y-0.5"
        >
          Lihat rapor lengkap
          <span aria-hidden="true">→</span>
        </Link>
      </header>

      <div className="mt-5 grid gap-3">
        {subjects.map((s) => {
          // Subject badge: QUPU's BadgeCurve medallion tinted to the subject
          // colour, with a count pill of badges the child earned here. Greyed
          // when the child has earned none yet.
          const earnedBadge = s.badgesEarned > 0
          const subjectChip = (
            <span className="relative block w-full" aria-hidden="true">
              <BadgeCurve
                color={earnedBadge ? s.colorHex : '#CBD5E1'}
                ribbonColor={earnedBadge ? undefined : '#94A3B8'}
                className="block h-auto w-full"
              />
              {earnedBadge && (
                <span className="absolute right-0 top-0 inline-flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-qupu-brand-orange px-1 font-display text-[10px] font-extrabold text-white shadow-sm">
                  {s.badgesEarned}
                </span>
              )}
            </span>
          )

          // Not-started subjects have no real score — showing "0%" + a
          // -100% trend reads as a failing grade, which is wrong. Render
          // a neutral "Belum dimulai" row instead, no bar, no peer pill.
          if (!s.started) {
            return (
              <div
                key={s.id}
                className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 rounded-[1.25rem] bg-qupu-shell p-4"
              >
                {subjectChip}
                <strong className="truncate font-display text-base text-qupu-brand-blue">
                  {s.name}
                </strong>
                <span className="whitespace-nowrap rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-qupu-muted">
                  Belum dimulai
                </span>
              </div>
            )
          }

          const isOpen = openId === s.id
          const trendSymbol = s.trend > 0 ? '▲' : s.trend < 0 ? '▼' : '·'
          const trendClass = s.trend > 0 ? 'text-emerald-600' : s.trend < 0 ? 'text-rose-600' : 'text-qupu-muted'
          const trendPrefix = s.trend > 0 ? '+' : ''
          return (
            <div
              key={s.id}
              className="rounded-[1.25rem] bg-qupu-shell p-4 transition-colors hover:bg-qupu-peach/40"
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : s.id)}
                aria-expanded={isOpen}
                className="grid w-full grid-cols-[3rem_1fr_auto] items-center gap-3 text-left"
              >
                {subjectChip}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="truncate font-display text-base text-qupu-brand-blue">{s.name}</strong>
                    <PeerPill peer={s.peer} />
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.max(0, Math.min(100, s.mastery))}%`, backgroundColor: s.colorHex }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-xl font-extrabold text-qupu-brand-blue">{s.score}%</div>
                  <div className={`text-[10px] font-bold uppercase tracking-[0.14em] ${trendClass}`}>
                    <span aria-hidden="true">{trendSymbol}</span> {trendPrefix}{s.trend}%
                  </div>
                </div>
              </button>

              {isOpen && s.subtopics.length > 0 && (
                <ul className="mt-3 grid gap-1.5 rounded-[1rem] bg-white px-3 py-2">
                  {s.subtopics.map((sub, i) => {
                    const score = Math.round(sub.score)
                    const color = score >= 80 ? 'text-emerald-600' : score >= 65 ? 'text-qupu-brand-orange' : 'text-rose-600'
                    return (
                      <li key={i} className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate text-qupu-brand-blue">{sub.name}</span>
                        <span className={`font-display font-extrabold ${color}`}>{score}%</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </article>
  )
}
