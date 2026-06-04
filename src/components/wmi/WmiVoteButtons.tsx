import { useState } from 'react'

interface WmiVoteButtonsProps {
  onVote: (vote: 1 | -1) => Promise<void>
}

export default function WmiVoteButtons({ onVote }: WmiVoteButtonsProps) {
  const [picked, setPicked] = useState<1 | -1 | null>(null)
  const [busy, setBusy] = useState(false)

  async function pick(v: 1 | -1) {
    if (busy || picked !== null) return
    setBusy(true)
    try {
      await onVote(v)
      setPicked(v)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-4 flex items-center justify-center gap-3">
      <span className="text-xs font-bold text-qupu-muted">Soal ini gimana?</span>
      <button
        type="button"
        onClick={() => pick(1)}
        disabled={busy || picked !== null}
        className={`flex h-10 w-10 items-center justify-center rounded-full text-base transition-transform active:translate-y-0.5 disabled:active:translate-y-0 ${
          picked === 1
            ? 'bg-emerald-500 text-white shadow-[0_3px_0_0_#0f7a52]'
            : 'bg-white text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]'
        } ${picked === -1 ? 'opacity-40' : ''}`}
        aria-label="Suka soal ini"
      >
        <i className="fa-solid fa-thumbs-up" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => pick(-1)}
        disabled={busy || picked !== null}
        className={`flex h-10 w-10 items-center justify-center rounded-full text-base transition-transform active:translate-y-0.5 disabled:active:translate-y-0 ${
          picked === -1
            ? 'bg-rose-500 text-white shadow-[0_3px_0_0_#9f1239]'
            : 'bg-white text-qupu-brand-blue shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]'
        } ${picked === 1 ? 'opacity-40' : ''}`}
        aria-label="Tidak suka soal ini"
      >
        <i className="fa-solid fa-thumbs-down" aria-hidden="true" />
      </button>
    </div>
  )
}
