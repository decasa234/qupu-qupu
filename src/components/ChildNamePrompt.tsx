import { useState } from 'react'
import { X } from 'lucide-react'
import api from '../lib/api'
import { toIndonesianErrorMessage } from '../lib/errorMessage'
import PillField from './PillField'
import { useAuthStore } from '../store/authStore'
import type { Child } from '../types'

interface ChildNamePromptProps {
  open: boolean
  onCreated: (child: Child) => void
  onClose?: () => void
}

export default function ChildNamePrompt({ open, onCreated, onClose }: ChildNamePromptProps) {
  const { addChild } = useAuthStore()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError('')
    try {
      const response = await api.post('/me/children', { name: name.trim() })
      const child = response.data.data.child as Child
      addChild(child)
      onCreated(child)
    } catch (requestError: unknown) {
      setError(toIndonesianErrorMessage(requestError, 'Gagal menambah profil anak.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-qupu-brand-blue/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-6 shadow-[6px_8px_0_0_#FFD3B1] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
              Profil Anak
            </div>
            <h2 className="mt-1 font-display text-2xl font-extrabold text-qupu-brand-blue">
              Beri nama profil anak
            </h2>
            <p className="mt-2 text-sm font-semibold text-qupu-muted">
              Skor akan tersimpan di profil ini. Detail lain bisa diisi nanti di dashboard.
            </p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="rounded-full bg-qupu-cream p-2 text-qupu-muted transition-colors hover:text-qupu-brand-blue"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <PillField
            label="Nama anak"
            icon="fa-solid fa-child"
            value={name}
            onChange={setName}
            placeholder="Andi"
            required
          />

          {error && (
            <div className="rounded-[1.25rem] bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
              <i className="fa-solid fa-floppy-disk text-base text-qupu-brand-orange" aria-hidden="true" />
            </span>
            {loading ? 'Menyimpan...' : 'Simpan profil anak'}
          </button>
        </form>
      </div>
    </div>
  )
}
