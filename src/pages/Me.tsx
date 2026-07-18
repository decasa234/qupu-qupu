// src/pages/Me.tsx
//
// Profil tab — kid-only since Task 7. Account management, child profiles,
// and every parent setting moved to the PIN-locked /parent dashboard; this
// page keeps only the kid surfaces: avatar hero with an XP ring, a 3-stat
// icon row, a horizontal badge shelf, family cards, and the owned-items
// collection. Avatar editing hides behind the hero's pencil button.
// Declutter rule: icon + number + ≤3 words per element.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { useGamificationStats } from '../hooks/useGamificationStats'
import useDocumentTitle from '../hooks/useDocumentTitle'
import InventoryGrid from '../components/me/InventoryGrid'
import AvatarEditor from '../components/me/AvatarEditor'
import FamilyLeaderboard from '../components/me/FamilyLeaderboard'
import FamilyQuestCard from '../components/me/FamilyQuestCard'
import LevelDetail from '../components/me/LevelDetail'
import BadgeMedallion from '../components/badges/BadgeMedallion'
import {
  avatarIconClass,
  DEFAULT_AVATAR_COLOR,
  DEFAULT_AVATAR_SLUG,
} from '../lib/avatars'
import type { Child, SubjectBadgeGroup } from '../types'

export default function MePage() {
  useDocumentTitle('Profil')
  const { children, activeChildId } = useAuthStore()
  const activeChild = children.find((child) => child.id === activeChildId) ?? null
  const [editingAvatar, setEditingAvatar] = useState(false)

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-3.5 sm:max-w-lg">
      {activeChild && (
        <ProfileHero
          child={activeChild}
          editing={editingAvatar}
          onToggleEdit={() => setEditingAvatar((v) => !v)}
        />
      )}
      {activeChild && editingAvatar && <AvatarEditor child={activeChild} />}

      <StatRow />

      <BadgeShelf childId={activeChildId} />

      {activeChild && <LevelDetail childId={activeChild.id} />}

      {/* Family surfaces (P2.3) — both render nothing for accounts with
          fewer than 2 children. */}
      <FamilyLeaderboard />
      <FamilyQuestCard />

      <section id="koleksi" className="rounded-[1.5rem] bg-white p-4 shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
        <span className="inline-flex items-center gap-2 font-display text-lg font-extrabold text-qupu-brand-blue">
          <i className="fa-solid fa-box-open text-base text-qupu-brand-orange" aria-hidden="true" />
          Koleksiku
        </span>
        <div className="mt-3">
          {activeChildId ? (
            <InventoryGrid childId={activeChildId} />
          ) : (
            <p className="text-sm font-medium text-qupu-muted">Pilih profil anak dulu untuk melihat koleksi.</p>
          )}
        </div>
      </section>

      {/* Subdued doorway to the PIN-locked parent dashboard. */}
      <Link
        to="/parent"
        className="mx-auto mb-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-qupu-muted/70 transition-colors hover:text-qupu-muted"
      >
        <i className="fa-solid fa-user-shield" aria-hidden="true" />
        Orang Tua
      </Link>
    </div>
  )
}

// Design hero: the child's avatar wrapped in a conic XP ring, name, tier chip
// and "XP to next level" line. Reads the shared gamification store (hydrated
// by TopStatStrip on every member mount).
function ProfileHero({
  child,
  editing,
  onToggleEdit,
}: {
  child: Child
  editing: boolean
  onToggleEdit: () => void
}) {
  const stats = useGamificationStats((s) => s.stats)
  const level = stats?.level ?? 1
  const xp = stats?.xp ?? 0
  const xpToNext = stats?.xpToNext ?? 0
  const span = xp + xpToNext
  const pct = span > 0 ? Math.min(100, Math.round((xp / span) * 100)) : 0

  return (
    <section className="rounded-[1.5rem] bg-white p-4 shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
      <div className="flex items-center gap-4">
        <span
          className="flex flex-shrink-0 rounded-full p-1.5"
          style={{ background: `conic-gradient(#F0853A ${pct}%, #F7EAD6 0)` }}
          role="img"
          aria-label={`${pct}% menuju level berikutnya`}
        >
          <span
            className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full text-[2.125rem] text-white shadow-[inset_0_-5px_0_rgba(0,0,0,0.15),0_0_0_3px_#FFFFFF]"
            style={{ backgroundColor: child.avatarColor ?? DEFAULT_AVATAR_COLOR }}
          >
            <i className={avatarIconClass(child.avatarIcon ?? DEFAULT_AVATAR_SLUG)} aria-hidden="true" />
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-2xl font-black leading-tight text-qupu-brand-blue">
            {child.name}
          </h1>
          <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-qupu-cream px-2.5 py-1 text-xs font-black text-qupu-brand-blue">
            <i className="fa-solid fa-star text-[#F59E0B]" aria-hidden="true" />
            {stats?.tierName ? `${stats.tierName} · ` : ''}Lv {level}
          </div>
          {xpToNext > 0 && (
            <p className="mt-1.5 text-[0.6875rem] font-extrabold text-qupu-muted">
              Kurang <strong className="text-qupu-brand-orange">{xpToNext} XP</strong> menuju Level{' '}
              {level + 1}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onToggleEdit}
          aria-expanded={editing}
          aria-label={editing ? 'Tutup pengaturan avatar' : 'Ubah avatar'}
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm ring-1 ring-[#FFE3CC] transition-transform active:translate-y-0.5 ${
            editing ? 'bg-qupu-brand-orange text-white' : 'bg-qupu-shell text-qupu-muted'
          }`}
        >
          <i className={editing ? 'fa-solid fa-xmark' : 'fa-solid fa-pen'} aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}

// 3-stat icon row: streak / XP / coins — numbers only, fed by the shared
// gamification store (TopStatStrip self-hydrates it on every member mount,
// so this is normally already populated).
function StatRow() {
  const stats = useGamificationStats((s) => s.stats)

  const items = [
    { icon: 'fa-solid fa-fire', color: '#F97316', label: 'Streak', value: stats?.streak ?? 0 },
    { icon: 'fa-solid fa-bolt', color: '#8A5BF0', label: 'XP', value: stats?.xp ?? 0 },
    { icon: 'fa-solid fa-coins', color: '#D9A406', label: 'Koin', value: stats?.coinBalance ?? 0 },
  ]

  return (
    <section className="grid grid-cols-3 gap-2.5">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col items-center rounded-[1.25rem] bg-white px-2 py-3 shadow-[0_4px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]"
        >
          <i className={`${item.icon} text-lg`} style={{ color: item.color }} aria-hidden="true" />
          <span className="mt-1 font-display text-xl font-extrabold text-qupu-brand-blue">
            {item.value}
          </span>
          <span className="text-[0.5625rem] font-black uppercase tracking-[0.14em] text-qupu-muted">
            {item.label}
          </span>
        </div>
      ))}
    </section>
  )
}

// Horizontal shelf of the most recent badge medallions, linking to /badges.
const SHELF_MAX = 6

function BadgeShelf({ childId }: { childId: string | null }) {
  const [unlocks, setUnlocks] = useState<
    Array<{ videoId: string; videoTitle: string; badgeCount: number; colorHex: string; unlockedAt: string }>
  >([])

  useEffect(() => {
    if (!childId) {
      setUnlocks([])
      return
    }
    let cancelled = false
    api
      .get('/me/badges', { params: { childId } })
      .then((response) => {
        if (cancelled) return
        const groups = (response.data.data.families ?? []) as SubjectBadgeGroup[]
        const flat = groups.flatMap((group) =>
          group.unlocks.map((u) => ({
            videoId: u.videoId,
            videoTitle: u.videoTitle,
            badgeCount: u.badgeCount,
            colorHex: group.colorHex,
            unlockedAt: u.unlockedAt,
          })),
        )
        flat.sort((a, b) => b.unlockedAt.localeCompare(a.unlockedAt))
        setUnlocks(flat)
      })
      .catch(() => {
        // Shelf renders the link-only state; /badges still works.
      })
    return () => {
      cancelled = true
    }
  }, [childId])

  return (
    <section className="rounded-[1.5rem] bg-white p-4 shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 font-display text-lg font-extrabold text-qupu-brand-blue">
          <i className="fa-solid fa-medal text-base text-[#8A5BF0]" aria-hidden="true" />
          {unlocks.reduce((acc, u) => acc + u.badgeCount, 0)} Badge
        </span>
        <Link
          to="/badges"
          className="inline-flex items-center gap-1.5 rounded-full bg-qupu-cream px-3 py-1.5 text-[0.6875rem] font-extrabold text-qupu-brand-orange transition-transform active:translate-y-0.5"
        >
          Lihat semua
          <i className="fa-solid fa-chevron-right text-[0.5625rem]" aria-hidden="true" />
        </Link>
      </div>
      {unlocks.length > 0 ? (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {unlocks.slice(0, SHELF_MAX).map((u) => (
            <div key={u.videoId} className="w-16 flex-shrink-0">
              <BadgeMedallion
                state="earned"
                label={u.videoTitle}
                colorHex={u.colorHex}
                href="/badges"
                badgeCount={u.badgeCount}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 w-16">
          <BadgeMedallion state="locked" label="Belum ada" />
        </div>
      )}
    </section>
  )
}
