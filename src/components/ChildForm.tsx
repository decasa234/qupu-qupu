// src/components/ChildForm.tsx
import { useEffect, useState } from 'react'
import api from '../lib/api'
import { toIndonesianErrorMessage } from '../lib/errorMessage'
import type { AgeGroupOption, Child } from '../types'

const AVATAR_PRESETS = ['#FB923C', '#F472B6', '#60A5FA', '#34D399', '#A78BFA', '#F59E0B']

interface ChildFormProps {
  submitLabel: string
  onCreated: (child: Child) => void
  onError?: (message: string) => void
  initialName?: string
  initialAgeGroupId?: string
}

export default function ChildForm({
  submitLabel,
  onCreated,
  onError,
  initialName = '',
  initialAgeGroupId = '',
}: ChildFormProps) {
  const [name, setName] = useState(initialName)
  const [ageGroupId, setAgeGroupId] = useState(initialAgeGroupId)
  const [avatarColor, setAvatarColor] = useState(AVATAR_PRESETS[0])
  const [dailyGoal, setDailyGoal] = useState(3)
  const [ageGroups, setAgeGroups] = useState<AgeGroupOption[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    void api
      .get('/public/meta')
      .then((response) => {
        const groups: AgeGroupOption[] = response.data.data.ageGroups ?? []
        setAgeGroups(groups)
      })
      .catch((fetchError) => {
        console.error('Failed to load age groups:', fetchError)
      })
  }, [])

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
        dailyGoalQuizzes: dailyGoal,
      })
      const child = response.data.data.child as Child
      onCreated(child)
    } catch (submitError: unknown) {
      const nextError = toIndonesianErrorMessage(submitError, 'Gagal menambahkan anak.')
      setError(nextError)
      onError?.(nextError)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">Nama anak</span>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Contoh: Aira"
          maxLength={80}
          className="mt-2 w-full rounded-full border-2 border-qupu-peach bg-qupu-shell px-5 py-3 text-qupu-ink outline-none transition-colors focus:border-qupu-brand-orange"
        />
      </label>

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">
          Kelompok usia (opsional)
        </span>
        <select
          value={ageGroupId}
          onChange={(event) => setAgeGroupId(event.target.value)}
          className="mt-2 w-full rounded-full border-2 border-qupu-peach bg-qupu-shell px-5 py-3 text-qupu-ink outline-none transition-colors focus:border-qupu-brand-orange"
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
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">Warna avatar</span>
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

      <div>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">
          Target quiz harian
        </span>
        <p className="mt-1 text-xs text-qupu-muted">
          Berapa quiz per hari yang ingin Bunda jadikan target untuk anak ini?
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[1, 2, 3, 5, 7, 10].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setDailyGoal(value)}
              aria-pressed={dailyGoal === value}
              className={`min-w-[3rem] rounded-full px-4 py-2 font-display text-sm font-extrabold transition-colors ${
                dailyGoal === value
                  ? 'bg-qupu-brand-blue text-white shadow-subscribe'
                  : 'bg-qupu-shell text-qupu-brand-blue/70 hover:text-qupu-brand-blue'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-[1.25rem] bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>
      )}

      <button
        type="submit"
        disabled={saving || !name.trim()}
        className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
          <i className="fa-solid fa-circle-check text-base text-qupu-brand-orange" aria-hidden="true" />
        </span>
        {saving ? 'Menyimpan...' : submitLabel}
      </button>
    </form>
  )
}
