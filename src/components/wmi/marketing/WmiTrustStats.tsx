import { useEffect, useState } from 'react'
import { getCachedPublic } from '@/lib/api'

interface WmiStats {
  concepts: number
  papers: number
  videos: number
  gradeMin: number | null
  gradeMax: number | null
}

export default function WmiTrustStats() {
  const [stats, setStats] = useState<WmiStats | null>(null)

  useEffect(() => {
    let alive = true
    getCachedPublic<{ success: boolean; data: WmiStats }>('/public/wmi-stats')
      .then((res) => {
        if (alive) setStats(res.data)
      })
      .catch((error) => {
        console.error('Failed to load WMI stats:', error)
      })
    return () => {
      alive = false
    }
  }, [])

  // Graceful: render nothing while loading or if the endpoint failed.
  if (!stats) return null

  const grades =
    stats.gradeMin != null && stats.gradeMax != null
      ? `Kelas ${stats.gradeMin}–${stats.gradeMax}`
      : 'Kelas 0–3'

  const items = [
    { icon: 'fa-solid fa-lightbulb', value: `${stats.concepts}+`, label: 'Konsep interaktif' },
    { icon: 'fa-solid fa-file-lines', value: `${stats.papers}`, label: 'Soal ujian asli' },
    { icon: 'fa-brands fa-youtube', value: `${stats.videos}`, label: 'Video edukatif' },
    { icon: 'fa-solid fa-child-reaching', value: grades, label: 'Cakupan kelas' },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-[1.5rem] border-[3px] border-qupu-peach bg-white p-5 text-center shadow-[5px_6px_0_0_rgba(38,59,85,0.08)]"
        >
          <i className={`${it.icon} text-2xl text-qupu-brand-orange`} aria-hidden="true" />
          <div className="mt-2 font-display text-2xl font-extrabold text-qupu-brand-blue">{it.value}</div>
          <div className="mt-0.5 text-xs font-semibold text-qupu-muted">{it.label}</div>
        </div>
      ))}
    </div>
  )
}
