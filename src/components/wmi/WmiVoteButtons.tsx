import { useState } from 'react'

interface WmiVoteButtonsProps {
  onVote: (vote: 1 | -1) => Promise<void>
}

export default function WmiVoteButtons({ onVote }: WmiVoteButtonsProps) {
  const [picked, setPicked] = useState<1 | -1 | null>(null)
  const [busy, setBusy] = useState(false)

  async function pick(v: 1 | -1) {
    if (busy) return
    setBusy(true)
    try {
      await onVote(v)
      setPicked(v)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-3 flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => pick(1)}
        disabled={busy}
        className={`rounded-full px-4 py-2 text-2xl ${picked === 1 ? 'bg-qupu-cream' : 'bg-gray-100'} disabled:opacity-50`}
        aria-label="Suka soal ini"
      >
        👍
      </button>
      <button
        type="button"
        onClick={() => pick(-1)}
        disabled={busy}
        className={`rounded-full px-4 py-2 text-2xl ${picked === -1 ? 'bg-qupu-cream' : 'bg-gray-100'} disabled:opacity-50`}
        aria-label="Tidak suka soal ini"
      >
        👎
      </button>
    </div>
  )
}
