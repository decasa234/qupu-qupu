// src/pages/Me.tsx
//
// Profil tab — kid-only since Task 7. Account management, child profiles,
// and every parent setting moved to the PIN-locked /parent dashboard; this
// page keeps only the kid surfaces: avatar hero + level, a 3-stat icon row,
// a horizontal badge shelf, family cards, and the owned-items collection.
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
import type { SubjectBadgeGroup } from '../types'

export default function MePage() {
  useDocumentTitle('Profil')
  const { children, activeChildId } = useAuthStore()
  const activeChild = children.find((child) => child.id === activeChildId) ?? null

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 sm:max-w-lg">
      {activeChild && <AvatarEditor child={activeChild} />}

      {activeChild && <LevelDetail childId={activeChild.id} />}

      <StatRow />

      <BadgeShelf childId={activeChildId} />

      {/* Family surfaces (P2.3) — both render nothing for accounts with
          fewer than 2 children. */}
      <FamilyLeaderboard />
      <FamilyQuestCard />

      <section id="koleksi" className="rounded-[2rem] border-[3px] border-qupu-brand-orange/40 bg-white p-5 shadow-[5px_6px_0_0_#FFD3B1]">
        <div className="text-[0.6875rem] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Koleksi saya</div>
        <h2 className="mt-1 font-display text-lg font-extrabold text-qupu-brand-blue">Item yang sudah dimiliki</h2>
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
    <section className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col items-center rounded-[1.5rem] border-[3px] border-qupu-brand-blue/15 bg-white px-2 py-3 shadow-[3px_4px_0_0_#FFD3B1]"
        >
          <i className={`${item.icon} text-lg`} style={{ color: item.color }} aria-hidden="true" />
          <span className="mt-1 font-display text-xl font-extrabold text-qupu-brand-blue">
            {item.value}
          </span>
          <span className="text-[0.625rem] font-black uppercase tracking-[0.14em] text-qupu-muted">
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
    <section className="rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-5 shadow-[5px_6px_0_0_#FFD3B1]">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 font-display text-lg font-extrabold text-qupu-brand-blue">
          <i className="fa-solid fa-medal text-base text-[#8A5BF0]" aria-hidden="true" />
          {unlocks.reduce((acc, u) => acc + u.badgeCount, 0)} Badge
        </span>
        <Link
          to="/badges"
          className="inline-flex items-center gap-1.5 rounded-full bg-qupu-shell px-3 py-1.5 text-[0.6875rem] font-extrabold text-qupu-brand-orange ring-1 ring-[#FFE3CC] transition-transform active:translate-y-0.5"
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
