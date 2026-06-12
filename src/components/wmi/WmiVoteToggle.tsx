// src/components/wmi/WmiVoteToggle.tsx
//
// Collapsed-by-default presentation for WmiVoteButtons: a small flag icon
// button sits in the corner of the answer-feedback panel; tapping it reveals
// the vote row inline. The host renders this inside (or right after) the
// feedback panel, which unmounts between questions — so the collapsed state
// resets automatically when the question advances.
import { useState } from 'react'
import WmiVoteButtons from './WmiVoteButtons'

interface Props {
  onVote: (vote: 1 | -1) => Promise<void>
  /** Position classes for the collapsed flag button. The nearest positioned
   *  ancestor must be the feedback panel (or a `relative` wrapper around it). */
  buttonClassName?: string
}

export default function WmiVoteToggle({ onVote, buttonClassName = 'absolute right-3 top-3' }: Props) {
  const [open, setOpen] = useState(false)

  if (open) return <WmiVoteButtons onVote={onVote} />

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Nilai soal ini"
      className={`${buttonClassName} flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-xs text-qupu-muted ring-1 ring-black/10 transition-transform active:translate-y-0.5`}
    >
      <i className="fa-solid fa-flag" aria-hidden="true" />
    </button>
  )
}
