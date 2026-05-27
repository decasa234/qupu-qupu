import { useEffect, useState } from 'react'

interface Props {
  startedAt: string
  durationMin: number
  onExpire: () => void
}

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

  return (
    <div className="rounded-full bg-qupu-cream px-3 py-1 font-bold text-qupu-brand-blue">
      {minutes}:{String(seconds).padStart(2, '0')}
    </div>
  )
}
