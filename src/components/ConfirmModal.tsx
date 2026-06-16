// src/components/ConfirmModal.tsx
//
// Kid-facing confirmation dialog in the QUPU member style — the playful
// replacement for window.confirm() on member surfaces (the native dialog shows
// the bare "localhost:5173" chrome, which breaks the app feel). Mirrors
// StreakRecoveryModal's tokens (hard-shadow card, FA badge, branded buttons).
//
// UX: the SAFE choice (cancel) is the prominent filled button and is also what
// a backdrop tap / Escape resolves to, so a kid can't lose progress with a
// careless tap. The confirm action is the quieter, deliberate button below.
import { useEffect } from 'react'

interface ConfirmModalProps {
  open: boolean
  /** Font Awesome class for the badge icon. Defaults to a warning triangle. */
  icon?: string
  title: string
  message: string
  /** The deliberate (often destructive) action — the quieter button. */
  confirmLabel: string
  /** The safe choice — the prominent button + backdrop/Escape result. */
  cancelLabel?: string
  onConfirm: () => void
  onClose: () => void
}

export default function ConfirmModal({
  open,
  icon = 'fa-solid fa-triangle-exclamation',
  title,
  message,
  confirmLabel,
  cancelLabel = 'Batal',
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[1.75rem] bg-white p-6 text-center shadow-[0_6px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-qupu-brand-orange text-3xl text-white shadow-[inset_0_-4px_0_#C46123]">
          <i className={icon} aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-display text-2xl font-black leading-tight text-qupu-brand-blue">
          {title}
        </h2>
        <p className="mt-1 text-sm font-bold text-qupu-muted">{message}</p>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-full bg-qupu-brand-blue py-3 font-display text-[15px] font-black text-white shadow-[0_4px_0_0_#0E1430] transition-transform active:translate-y-0.5"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="mt-2.5 w-full rounded-full py-2.5 text-sm font-black text-[#C0392B] transition-colors hover:text-[#9B2D22]"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  )
}
