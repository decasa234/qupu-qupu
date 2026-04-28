import type { SubjectStat } from '../../types'

function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function RaporVideoBreakdown({ stats }: { stats: SubjectStat[] }) {
  const withVideos = stats.filter((s) => s.videos.length > 0)
  if (withVideos.length === 0) return null
  return (
    <div className="mt-3 space-y-2">
      {withVideos.map((s) => (
        <details
          key={s.id}
          className="rounded-lg bg-qupu-shell p-3 [&[open]>summary>span:last-child]:rotate-90"
          open
        >
          <summary className="flex cursor-pointer items-center justify-between gap-2 text-[10px] font-extrabold uppercase tracking-[0.1em]">
            <span style={{ color: s.colorHex }}>{s.name}</span>
            <span className="text-qupu-muted transition-transform">▶</span>
          </summary>
          <ul className="mt-2 space-y-1 text-[11px] text-qupu-brand-blue">
            {s.videos.map((v) => (
              <li key={v.videoId}>
                • {v.videoTitle} — Skor terbaik <strong>{v.bestScore}%</strong> ·{' '}
                {v.badgeCount}× badge · {fmt(v.latestAttemptAt)}
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  )
}
