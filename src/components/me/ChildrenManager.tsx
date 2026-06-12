// src/components/me/ChildrenManager.tsx
//
// "Profil Anak" card on the /parent dashboard — the only in-app surface
// where a multi-child parent can switch the active child (the member shell
// has no navbar, so the old ChildSwitcher dropdown is unreachable here).
// Shows the active child with an age-group chip plus a Kelas selector
// (TK / Kelas 1–6 → PATCH /me/children/:id grade; the active child's pick
// also re-pins the WMI garden via adoptChildGrade), the other children as
// tappable avatar chips (tap → setActiveChild; AppShell's stat-strip
// machinery rehydrates), and a dashed "Tambah Anak" chip opening the
// existing ChildModal flow — same onCreated wiring as ChildSwitcher
// (addChild + setActiveChild).
import { useEffect, useState } from 'react'
import api, { getCachedPublic } from '../../lib/api'
import { toIndonesianErrorMessage } from '../../lib/errorMessage'
import { useAuthStore } from '../../store/authStore'
import { useWmiStore } from '../../store/wmiStore'
import { avatarIconClass, DEFAULT_AVATAR_COLOR } from '../../lib/avatars'
import ChildModal from '../ChildModal'
import type { AgeGroupOption, Child } from '../../types'
import type { WmiGrade } from '../../types/wmi'

// School-grade options stored on children.grade (0 = TK, 1–6 = SD Kelas).
const GRADE_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 0, label: 'TK' },
  { value: 1, label: 'Kelas 1' },
  { value: 2, label: 'Kelas 2' },
  { value: 3, label: 'Kelas 3' },
  { value: 4, label: 'Kelas 4' },
  { value: 5, label: 'Kelas 5' },
  { value: 6, label: 'Kelas 6' },
]

// Mirrors clampToWmiGrade in src/lib/childGrade.ts (TK/Kelas 1 → 1,
// Kelas 3+ → 3) — the garden only has WMI grades 1–3.
function clampToWmiGrade(schoolGrade: number): WmiGrade {
  if (schoolGrade <= 1) return 1
  if (schoolGrade >= 3) return 3
  return 2
}

export default function ChildrenManager() {
  const { children, activeChildId, setActiveChild, addChild, updateChildInStore } = useAuthStore()
  const adoptChildGrade = useWmiStore((state) => state.adoptChildGrade)
  const [gradeSaving, setGradeSaving] = useState(false)
  const [gradeError, setGradeError] = useState('')
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

  async function handleGradeSelect(grade: number) {
    if (!activeChild || gradeSaving || activeChild.grade === grade) return
    // Pin the child id NOW — `activeChild` is captured at render time and can
    // go stale if the parent switches children while the PATCH is in flight.
    const childId = activeChild.id
    setGradeSaving(true)
    setGradeError('')
    try {
      const response = await api.patch(`/me/children/${childId}`, { grade })
      const updated = response.data.data.child as Child
      updateChildInStore(updated)
      // Re-pin the WMI garden grade only if the saved child is STILL the
      // active one (read the store imperatively — the closure may be stale).
      if (useAuthStore.getState().activeChildId === childId) {
        adoptChildGrade(childId, clampToWmiGrade(grade))
      }
    } catch (saveError) {
      setGradeError(toIndonesianErrorMessage(saveError, 'Gagal menyimpan kelas.'))
    } finally {
      setGradeSaving(false)
    }
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

      {activeChild && (
        <div className="mt-4">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">
            Kelas
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {GRADE_OPTIONS.map((option) => {
              const selected = activeChild.grade === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleGradeSelect(option.value)}
                  aria-pressed={selected}
                  disabled={gradeSaving}
                  className={`rounded-full px-3.5 py-1.5 font-display text-xs font-extrabold transition-colors disabled:opacity-60 ${
                    selected
                      ? 'bg-qupu-brand-blue text-white shadow-subscribe'
                      : 'bg-qupu-shell text-qupu-brand-blue/70 ring-1 ring-[#FFE3CC] hover:text-qupu-brand-blue'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
          {gradeError ? (
            <p className="mt-2 text-xs font-bold text-[#E11D48]" role="alert">
              {gradeError}
            </p>
          ) : (
            <p className="mt-2 text-[11px] font-semibold text-qupu-muted">
              Kelas menentukan level taman belajar anak.
            </p>
          )}
        </div>
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
