import { useEffect, useState } from 'react'

interface Props {
  startedAt: string
  durationMin: number
  onExpire: () => void
}

const LOW_TIME_MS = 5 * 60 * 1000

export default function WmiExamTimer({ startedAt, durationMin, onExpire }: Props) {
  const [remainingMs, setRemainingMs] = useState(durationMin * 60 * 1000)

  useEffect(() => {
    const started = new Date(startedAt).getTime()
    const total = durationMin * 60 * 1000
    const tick = () => {
      const next = Math.max(0, started + total - Date.now())
      setRemainingMs(next)
      if (next === 0) onExpire()
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [durationMin, onExpire, startedAt])

  const minutes = Math.floor(remainingMs / 60000)
  const seconds = Math.floor((remainingMs % 60000) / 1000)
  const low = remainingMs < LOW_TIME_MS

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-display text-sm font-black tabular-nums shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] ${
        low ? 'text-rose-600' : 'text-qupu-brand-blue'
      }`}
    >
      <i className="fa-solid fa-stopwatch" aria-hidden="true" />
      {minutes}:{String(seconds).padStart(2, '0')}
    </div>
  )
}
