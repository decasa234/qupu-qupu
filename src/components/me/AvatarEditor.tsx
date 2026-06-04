// src/components/me/AvatarEditor.tsx
//
// Lets the parent pick the active child's avatar (a cute animal Font Awesome
// icon) and color from the Profil page. Saves optimistically via
// PATCH /me/children/:id and reverts on failure.
import { useState } from 'react'
import api from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import {
  AVATAR_COLORS,
  AVATAR_OPTIONS,
  DEFAULT_AVATAR_COLOR,
  DEFAULT_AVATAR_SLUG,
  avatarIconClass,
} from '../../lib/avatars'
import type { Child } from '../../types'

export default function AvatarEditor({ child }: { child: Child }) {
  const updateChildInStore = useAuthStore((state) => state.updateChildInStore)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const currentIcon = child.avatarIcon ?? DEFAULT_AVATAR_SLUG
  const currentColor = child.avatarColor ?? DEFAULT_AVATAR_COLOR

  async function patch(updates: { avatarIcon?: string; avatarColor?: string }) {
    const previous = child
    updateChildInStore({ ...child, ...updates }) // optimistic
    setSaving(true)
    setError('')
    try {
      const res = await api.patch(`/me/children/${child.id}`, updates)
      updateChildInStore(res.data.data.child as Child)
    } catch {
      updateChildInStore(previous) // revert
      setError('Gagal menyimpan avatar. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-[2rem] border-[3px] border-qupu-brand-orange/40 bg-white p-5 shadow-[5px_6px_0_0_#FFD3B1]">
      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
        Avatar anak
      </div>

      <div className="mt-3 flex items-center gap-4">
        <span
          className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-[1.6rem] text-4xl text-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.15)]"
          style={{ backgroundColor: currentColor }}
        >
          <i className={avatarIconClass(currentIcon)} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-lg font-extrabold text-qupu-brand-blue">{child.name}</h2>
          <p className="text-xs font-semibold text-qupu-muted">Pilih hewan &amp; warna kesukaanmu.</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-7">
        {AVATAR_OPTIONS.map((option) => {
          const active = currentIcon === option.slug
          return (
            <button
              key={option.slug}
              type="button"
              onClick={() => patch({ avatarIcon: option.slug })}
              aria-label={option.label}
              aria-pressed={active}
              title={option.label}
              className={`flex aspect-square items-center justify-center rounded-[1rem] text-lg transition-transform active:translate-y-0.5 ${
                active
                  ? 'bg-qupu-brand-blue text-white shadow-[0_3px_0_0_#0E1430]'
                  : 'bg-qupu-shell text-qupu-brand-blue ring-2 ring-[#FFE3CC]'
              }`}
            >
              <i className={option.icon} aria-hidden="true" />
            </button>
          )
        })}
      </div>

      <div className="mt-4">
        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-qupu-muted">Warna</div>
        <div className="mt-2 flex flex-wrap gap-2.5">
          {AVATAR_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => patch({ avatarColor: color })}
              aria-label={`Warna ${color}`}
              aria-pressed={currentColor === color}
              className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-110 ${
                currentColor === color ? 'border-qupu-brand-blue' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {error ? (
        <p className="mt-3 text-xs font-semibold text-red-600">{error}</p>
      ) : saving ? (
        <p className="mt-3 text-[11px] font-semibold text-qupu-muted">Menyimpan...</p>
      ) : null}
    </section>
  )
}
