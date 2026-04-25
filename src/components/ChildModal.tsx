// src/components/ChildModal.tsx
import { X } from 'lucide-react'
import ChildForm from './ChildForm'
import type { Child } from '../types'

interface Props {
  open: boolean
  onClose: () => void
  onCreated: (child: Child) => void
  title?: string
  submitLabel?: string
}

export default function ChildModal({
  open,
  onClose,
  onCreated,
  title = 'Tambah profil anak',
  submitLabel = 'Simpan profil',
}: Props) {
  if (!open) return null

  const handleCreated = (child: Child) => {
    onCreated(child)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-qupu-brand-blue/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-qupu-peach bg-white p-6 shadow-clay">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Profil Anak</div>
            <h2 className="mt-1 font-display text-2xl font-bold text-qupu-brand-blue">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-full bg-qupu-cream p-2 text-qupu-muted transition-colors hover:text-qupu-brand-blue"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5">
          <ChildForm submitLabel={submitLabel} onCreated={handleCreated} />
        </div>
      </div>
    </div>
  )
}
