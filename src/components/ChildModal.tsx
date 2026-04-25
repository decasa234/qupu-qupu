import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import api from '../lib/api'
import type { AgeGroupOption, Child } from '../types'

const AVATAR_PRESETS = ['#FB923C', '#F472B6', '#60A5FA', '#34D399', '#A78BFA', '#F59E0B']

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
  const [name, setName] = useState('')
  const [ageGroupId, setAgeGroupId] = useState('')
  const [avatarColor, setAvatarColor] = useState(AVATAR_PRESETS[0])
  const [ageGroups, setAgeGroups] = useState<AgeGroupOption[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setName('')
    setAgeGroupId('')
    setAvatarColor(AVATAR_PRESETS[0])
    setError('')

    void api
      .get('/public/meta')
      .then((response) => {
        const groups: AgeGroupOption[] = response.data.data.ageGroups ?? []
        setAgeGroups(groups)
      })
      .catch((fetchError) => {
        console.error('Failed to load age groups:', fetchError)
      })
  }, [open])

  if (!open) return null

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!name.trim()) {
      setError('Nama anak wajib diisi.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const response = await api.post('/me/children', {
        name: name.trim(),
        ageGroupId: ageGroupId || null,
        avatarColor,
      })
      const child = response.data.data.child as Child
      onCreated(child)
      onClose()
    } catch (submitError: unknown) {
      const nextError =
        typeof submitError === 'object' &&
        submitError !== null &&
        'response' in submitError &&
        typeof (submitError as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
          ? (submitError as { response?: { data?: { error?: string } } }).response?.data?.error
          : 'Gagal menambahkan anak.'
      setError(nextError)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-qupu-brand-blue/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-qupu-peach bg-white p-6 shadow-clay">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-orange">Profil Anak</div>
            <h2 className="mt-1 font-display text-2xl font-bold text-qupu-purple">{title}</h2>
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

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-qupu-muted">Nama anak</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Contoh: Aira"
              maxLength={80}
              className="mt-2 w-full rounded-[1.2rem] border border-qupu-peach bg-qupu-shell px-4 py-3 text-qupu-ink outline-none transition-colors focus:border-qupu-orange"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-qupu-muted">
              Kelompok usia (opsional)
            </span>
            <select
              value={ageGroupId}
              onChange={(event) => setAgeGroupId(event.target.value)}
              className="mt-2 w-full rounded-[1.2rem] border border-qupu-peach bg-qupu-shell px-4 py-3 text-qupu-ink outline-none transition-colors focus:border-qupu-orange"
            >
              <option value="">Pilih nanti</option>
              {ageGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </label>

          <div>
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-qupu-muted">Warna avatar</span>
            <div className="mt-2 flex flex-wrap gap-3">
              {AVATAR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAvatarColor(color)}
                  aria-label={`Pilih warna ${color}`}
                  className={`h-10 w-10 cursor-pointer rounded-full border-2 transition-transform hover:scale-110 ${
                    avatarColor === color ? 'border-qupu-brand-blue' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-[1.25rem] bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>
          )}

          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="inline-flex w-full items-center justify-center rounded-full bg-qupu-orange px-5 py-3 text-base font-bold text-white transition-colors hover:bg-qupu-orange-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Menyimpan...' : submitLabel}
          </button>
        </form>
      </div>
    </div>
  )
}
