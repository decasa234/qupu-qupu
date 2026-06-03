// src/components/report/RaporLatihan.tsx
//
// "Latihan WMI" section of the learning report — tracks concept-drill progress
// alongside the video-quiz stats. Print-friendly (no interactivity).
import type { WmiConceptProgressSummary } from '../../types/wmi'

const STATUS_META = {
  mastered: { label: 'Dikuasai', color: '#58A700', bg: '#E3F4D7' },
  in_progress: { label: 'Proses', color: '#B8541A', bg: '#FFE9C4' },
  not_started: { label: 'Belum', color: '#64748B', bg: '#E2E8F0' },
} as const

export default function RaporLatihan({ summary }: { summary: WmiConceptProgressSummary }) {
  const overallPct = Math.round(summary.overallProgress * 100)
  const accuracy =
    summary.totalAttempts > 0
      ? Math.round((summary.totalCorrect / summary.totalAttempts) * 100)
      : 0

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Konsep dikuasai" value={`${summary.mastered}/${summary.totalConcepts}`} />
        <Stat label="Jawaban benar" value={String(summary.totalCorrect)} />
        <Stat label="Akurasi" value={`${accuracy}%`} />
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.1em] text-qupu-muted">
          <span>Penguasaan konsep</span>
          <span>{overallPct}%</span>
        </div>
        <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-qupu-cream">
          <div className="h-full rounded-full bg-qupu-brand-orange" style={{ width: `${overallPct}%` }} />
        </div>
      </div>

      <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
        {summary.concepts.map((concept) => {
          const meta = STATUS_META[concept.status]
          return (
            <div
              key={concept.slug}
              className="flex items-center justify-between gap-2 rounded-lg border border-qupu-peach/60 px-2.5 py-1.5"
            >
              <span className="min-w-0 flex-1 truncate text-xs font-semibold text-qupu-brand-blue">
                {concept.nameId}
              </span>
              <span className="text-[10px] font-bold text-qupu-muted">
                {concept.correct}/{summary.masteryTarget}
              </span>
              <span
                className="flex-shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.06em]"
                style={{ color: meta.color, backgroundColor: meta.bg }}
              >
                {meta.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-qupu-shell px-2.5 py-2 text-center">
      <div className="font-display text-lg font-black leading-none text-qupu-brand-blue">{value}</div>
      <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.08em] text-qupu-muted">
        {label}
      </div>
    </div>
  )
}
