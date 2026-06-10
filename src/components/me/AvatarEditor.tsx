// src/components/me/AvatarEditor.tsx
//
// Lets the parent pick the active child's avatar (a cute animal Font Awesome
// icon) and color from the Profil page. Saves optimistically via
// PATCH /me/children/:id and reverts on failure.
//
// Level-gated entries (avatars.ts `minLevel`, Mythos P2.4) render dimmed
// with a lock + "Lv N" chip; tapping one shows a hint instead of selecting.
// The API re-checks the same gate, so a forged request can't bypass it.
import { useState } from 'react'
import api from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import { useGamificationStats } from '../../hooks/useGamificationStats'
import {
  AVATAR_COLOR_OPTIONS,
  AVATAR_OPTIONS,
  DEFAULT_AVATAR_COLOR,
  DEFAULT_AVATAR_SLUG,
  avatarIconClass,
  isAvatarUnlocked,
} from '../../lib/avatars'
import type { Child } from '../../types'

export default function AvatarEditor({ child }: { child: Child }) {
  const updateChildInStore = useAuthStore((state) => state.updateChildInStore)
  const { stats, statsChildId } = useGamificationStats()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [lockHint, setLockHint] = useState('')

  // Level of the child being edited. Store stats are stamped with the child
  // they belong to — when they're missing or belong to a sibling, fall back
  // to level 1 (most-locked) instead of guessing. Never crashes on null.
  const level = stats && statsChildId === child.id ? stats.level : 1

  const currentIcon = child.avatarIcon ?? DEFAULT_AVATAR_SLUG
  const currentColor = child.avatarColor ?? DEFAULT_AVATAR_COLOR

  async function patch(updates: { avatarIcon?: string; avatarColor?: string }) {
    const previous = child
    updateChildInStore({ ...child, ...updates }) // optimistic
    setSaving(true)
    setError('')
    setLockHint('')
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

  function showLockHint(minLevel: number) {
    setLockHint(`Capai Level ${minLevel} untuk membuka!`)
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
          const locked = !isAvatarUnlocked(option.minLevel, level)
          return (
            <button
              key={option.slug}
              type="button"
              onClick={() =>
                locked ? showLockHint(option.minLevel!) : patch({ avatarIcon: option.slug })
              }
              aria-label={
                locked ? `${option.label} — terkunci sampai Level ${option.minLevel}` : option.label
              }
              aria-pressed={active}
              aria-disabled={locked}
              title={
                locked ? `Capai Level ${option.minLevel} untuk membuka ${option.label}!` : option.label
              }
              className={`relative flex aspect-square items-center justify-center rounded-[1rem] text-lg transition-transform active:translate-y-0.5 ${
                active
                  ? 'bg-qupu-brand-blue text-white shadow-[0_3px_0_0_#0E1430]'
                  : locked
                    ? 'bg-qupu-shell text-qupu-brand-blue/30 opacity-70 ring-2 ring-[#FFE3CC]'
                    : 'bg-qupu-shell text-qupu-brand-blue ring-2 ring-[#FFE3CC]'
              }`}
            >
              <i className={option.icon} aria-hidden="true" />
              {locked && (
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-qupu-brand-blue px-1.5 py-px text-[8px] font-black leading-tight text-white">
                  <i className="fa-solid fa-lock" aria-hidden="true" /> Lv {option.minLevel}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-4">
        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-qupu-muted">Warna</div>
        <div className="mt-2 flex flex-wrap gap-2.5">
          {AVATAR_COLOR_OPTIONS.map(({ value: color, minLevel }) => {
            const locked = !isAvatarUnlocked(minLevel, level)
            return (
              <button
                key={color}
                type="button"
                onClick={() => (locked ? showLockHint(minLevel!) : patch({ avatarColor: color }))}
                aria-label={
                  locked
                    ? `Warna ${color} — terkunci sampai Level ${minLevel}`
                    : `Warna ${color}`
                }
                aria-pressed={currentColor === color}
                aria-disabled={locked}
                title={locked ? `Capai Level ${minLevel} untuk membuka!` : undefined}
                className={`relative h-9 w-9 rounded-full border-2 transition-transform ${
                  currentColor === color ? 'border-qupu-brand-blue' : 'border-transparent'
                } ${locked ? 'opacity-60' : 'hover:scale-110'}`}
                style={{ backgroundColor: color }}
              >
                {locked && (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white/90">
                    <i className="fa-solid fa-lock" aria-hidden="true" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {lockHint && (
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-qupu-shell px-3 py-1.5 text-[11px] font-bold text-qupu-brand-blue ring-1 ring-[#FFE3CC]">
          <i className="fa-solid fa-lock text-qupu-brand-orange" aria-hidden="true" />
          {lockHint}
        </p>
      )}

      {error ? (
        <p className="mt-3 text-xs font-semibold text-red-600">{error}</p>
      ) : saving ? (
        <p className="mt-3 text-[11px] font-semibold text-qupu-muted">Menyimpan...</p>
      ) : null}
    </section>
  )
}
