import type { ProgressSummary } from '../../types'

export default function RaporSummary({ summary }: { summary: ProgressSummary }) {
  const cells = [
    { label: 'Attempt', value: summary.attemptsCount },
    { label: 'Rata Skor', value: `${summary.averageScore}%` },
    { label: 'Video Selesai', value: summary.videosCompleted },
    { label: 'Total Badge', value: summary.badgesTotal },
  ]
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {cells.map((c) => (
        <div key={c.label} className="rounded-lg bg-qupu-shell px-3 py-2">
          <div className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-qupu-brand-orange">
            {c.label}
          </div>
          <div className="font-display text-xl font-extrabold text-qupu-brand-blue">{c.value}</div>
        </div>
      ))}
    </div>
  )
}
