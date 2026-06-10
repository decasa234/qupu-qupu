// src/components/me/ChildrenManager.tsx
//
// "Profil Anak" card on the Me page — the only in-app surface where a
// multi-child parent can switch the active child (the member shell has no
// navbar, so the old ChildSwitcher dropdown is unreachable here). Shows the
// active child with an age-group chip, the other children as tappable avatar
// chips (tap → setActiveChild; AppShell's stat-strip machinery rehydrates),
// and a dashed "Tambah Anak" chip opening the existing ChildModal flow —
// same onCreated wiring as ChildSwitcher (addChild + setActiveChild).
import { useEffect, useState } from 'react'
import { getCachedPublic } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import { avatarIconClass, DEFAULT_AVATAR_COLOR } from '../../lib/avatars'
import ChildModal from '../ChildModal'
import type { AgeGroupOption, Child } from '../../types'

export default function ChildrenManager() {
  const { children, activeChildId, setActiveChild, addChild } = useAuthStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [ageGroups, setAgeGroups] = useState<AgeGroupOption[] | null>(null)

  const activeChild = children.find((child) => child.id === activeChildId) ?? null
  const otherChildren = children.filter((child) => child.id !== activeChildId)

  // Age-group names for the chip next to the active child. getCachedPublic
  // caches for 60s and AppShell fetches the same URL on every member mount,
  // so this is normally a free cache hit.
  useEffect(() => {
    let cancelled = false
    getCachedPublic<{ data?: { ageGroups?: AgeGroupOption[] } }>('/public/meta')
      .then((meta) => {
        if (!cancelled) setAgeGroups(meta.data?.ageGroups ?? [])
      })
      .catch(() => {
        /* chip simply stays hidden */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const activeAgeGroupName =
    (activeChild?.ageGroupId &&
      ageGroups?.find((group) => group.id === activeChild.ageGroupId)?.name) ||
    null

  const handleCreated = (child: Child) => {
    addChild(child)
    setActiveChild(child.id)
  }

  return (
    <section className="rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-5 shadow-[5px_6px_0_0_#FFD3B1]">
      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
        Profil Anak
      </div>

      {activeChild ? (
        <div className="mt-3 flex items-center gap-4">
          <span
            className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[1.4rem] text-3xl text-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.15)]"
            style={{ backgroundColor: activeChild.avatarColor ?? DEFAULT_AVATAR_COLOR }}
          >
            <i className={avatarIconClass(activeChild.avatarIcon)} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-lg font-extrabold text-qupu-brand-blue">
              {activeChild.name}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-qupu-brand-orange/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-qupu-brand-orange">
                <i className="fa-solid fa-circle-check" aria-hidden="true" />
                Aktif
              </span>
              {activeAgeGroupName && (
                <span className="inline-flex items-center rounded-full bg-qupu-shell px-2.5 py-0.5 text-[10px] font-bold text-qupu-muted ring-1 ring-[#FFE3CC]">
                  {activeAgeGroupName}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm font-medium text-qupu-muted">
          Belum ada profil anak yang aktif.
        </p>
      )}

      <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
        {otherChildren.map((child) => (
          <button
            key={child.id}
            type="button"
            onClick={() => setActiveChild(child.id)}
            aria-label={`Ganti ke profil ${child.name}`}
            className="flex w-16 flex-shrink-0 flex-col items-center gap-1.5 transition-transform active:translate-y-0.5"
          >
            <span
              className="flex h-12 w-12 items-center justify-center rounded-full text-xl text-white ring-2 ring-[#FFE3CC]"
              style={{ backgroundColor: child.avatarColor ?? DEFAULT_AVATAR_COLOR }}
            >
              <i className={avatarIconClass(child.avatarIcon)} aria-hidden="true" />
            </span>
            <span className="w-full truncate text-center text-[11px] font-bold text-qupu-brand-blue">
              {child.name}
            </span>
          </button>
        ))}

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex w-16 flex-shrink-0 flex-col items-center gap-1.5 transition-transform active:translate-y-0.5"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-qupu-brand-orange/60 bg-qupu-shell text-lg text-qupu-brand-orange">
            <i className="fa-solid fa-plus" aria-hidden="true" />
          </span>
          <span className="w-full text-center text-[11px] font-bold leading-tight text-qupu-brand-orange">
            Tambah Anak
          </span>
        </button>
      </div>

      {otherChildren.length > 0 && (
        <p className="mt-1 text-[11px] font-semibold text-qupu-muted">
          Ketuk avatar untuk ganti anak yang aktif.
        </p>
      )}

      <ChildModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={handleCreated} />
    </section>
  )
}
