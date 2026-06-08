// src/components/onboarding/WhoStep.tsx
import { useState } from 'react'
import type { AgeGroupOption } from '../../types'

interface WhoStepProps {
  ageGroups: AgeGroupOption[]
  onSubmit: (childName: string, group: AgeGroupOption) => void
}

export default function WhoStep({ ageGroups, onSubmit }: WhoStepProps) {
  const [name, setName] = useState('')
  const [selectedId, setSelectedId] = useState<string>('')

  const selected = ageGroups.find((g) => g.id === selectedId) ?? null

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <img src="/hero-mascot.png" alt="" className="mx-auto h-28 w-auto" />
        <h1 className="mt-3 font-display text-2xl font-black text-qupu-ink">
          Siapa yang mau belajar?
        </h1>
        <p className="mt-1 text-sm font-semibold text-qupu-muted">
          Isi nama anak (opsional) dan pilih kelasnya.
        </p>
      </div>

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">
          Nama anak (opsional)
        </span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Aira"
          maxLength={80}
          className="mt-2 w-full rounded-full border-2 border-qupu-peach bg-qupu-shell px-5 py-3 text-qupu-ink outline-none transition-colors focus:border-qupu-brand-orange"
        />
      </label>

      <div>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">
          Kelas anak
        </span>
        <div className="mt-2 grid grid-cols-1 gap-2">
          {ageGroups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => setSelectedId(group.id)}
              aria-pressed={selectedId === group.id}
              className={`flex items-center justify-between rounded-2xl border-2 px-5 py-3 text-left font-display text-base font-extrabold transition-colors ${
                selectedId === group.id
                  ? 'border-qupu-brand-blue bg-qupu-brand-blue text-white shadow-subscribe'
                  : 'border-qupu-peach bg-qupu-shell text-qupu-brand-blue hover:border-qupu-brand-blue'
              }`}
            >
              {group.name}
              {selectedId === group.id && (
                <i className="fa-solid fa-circle-check" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!selected}
        onClick={() => selected && onSubmit(name.trim(), selected)}
        className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Mulai
        <i className="fa-solid fa-arrow-right" aria-hidden="true" />
      </button>
    </div>
  )
}
