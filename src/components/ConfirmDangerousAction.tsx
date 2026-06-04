import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface ConfirmDangerousActionProps {
  open: boolean
  title: string
  description: string
  requiredText: string
  confirmLabel: string
  variant?: 'danger' | 'warn'
  onConfirm: () => void | Promise<void>
  onClose: () => void
}

export default function ConfirmDangerousAction({
  open,
  title,
  description,
  requiredText,
  confirmLabel,
  variant = 'danger',
  onConfirm,
  onClose,
}: ConfirmDangerousActionProps) {
  const [typed, setTyped] = useState('')
  const [working, setWorking] = useState(false)

  useEffect(() => {
    if (open) setTyped('')
  }, [open])

  if (!open) return null

  const matches = typed.trim() === requiredText
  const isDanger = variant === 'danger'

  const handleConfirm = async () => {
    if (!matches || working) return
    setWorking(true)
    try {
      await onConfirm()
    } finally {
      setWorking(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-admin-line bg-admin-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-extrabold text-admin-ink">{title}</h3>
            <p className="mt-1 text-sm text-admin-muted">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-admin-faint transition-colors hover:bg-admin-sunk hover:text-admin-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 rounded-lg bg-admin-sunk px-3 py-2 text-xs text-admin-muted">
          Ketik <span className="font-mono font-semibold text-admin-ink">{requiredText}</span> untuk konfirmasi.
        </div>

        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={requiredText}
          autoFocus
          className="mt-3 w-full rounded-lg border border-admin-edge bg-white px-3 py-2 font-mono text-sm text-admin-ink outline-none transition-colors focus:border-qupu-brand-blue focus:ring-2 focus:ring-qupu-brand-blue/25"
        />

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={working}
            className="flex-1 rounded-lg border border-admin-edge bg-white px-4 py-2 text-sm font-semibold text-admin-ink transition hover:bg-admin-sunk disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!matches || working}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
              isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {working ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
