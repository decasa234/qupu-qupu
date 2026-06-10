// src/components/me/FamilyLeaderboard.tsx
//
// "Papan Keluarga" — account-private sibling leaderboard (P2.3): this
// account's children ranked by THIS WIB week's XP. Warm framing only: the
// leader(s) get a small crown, ties share it, and nobody is called out for
// being last.
//
// Render contract: shows NOTHING unless the account has >= 2 children
// (checked against the auth store before fetching), and renders nothing on
// any fetch failure so host pages never look broken.

import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { avatarIconClass, DEFAULT_AVATAR_COLOR } from '../../lib/avatars'
import {
  fetchFamilyLeaderboard,
  type FamilyLeaderboard as FamilyLeaderboardData,
} from '../../lib/gamificationApi'

export default function FamilyLeaderboard() {
  const { children } = useAuthStore()
  const isFamily = children.length >= 2
  const [board, setBoard] = useState<FamilyLeaderboardData | null>(null)

  useEffect(() => {
    if (!isFamily) return
    let cancelled = false
    fetchFamilyLeaderboard()
      .then((data) => { if (!cancelled) setBoard(data) })
      .catch(() => { if (!cancelled) setBoard(null) })
    return () => { cancelled = true }
  }, [isFamily])

  if (!isFamily || !board || board.entries.length < 2) return null

  return (
    <section className="rounded-[1.5rem] bg-white p-4 shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-qupu-brand-orange text-sm text-white">
          <i className="fa-solid fa-people-group" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-base font-black text-qupu-brand-blue">
            Papan Keluarga
          </h2>
          <p className="text-[10px] font-bold text-qupu-muted">XP minggu ini — semangat bareng!</p>
        </div>
      </div>

      <ul className="mt-3 space-y-2">
        {board.entries.map((entry) => (
          <li
            key={entry.childId}
            className="flex items-center gap-2.5 rounded-[1.25rem] bg-qupu-shell px-3 py-2"
          >
            <span
              className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-base text-white"
              style={{ backgroundColor: entry.avatarColor ?? DEFAULT_AVATAR_COLOR }}
            >
              <i className={avatarIconClass(entry.avatarIcon)} aria-hidden="true" />
              {/* Ties share the crown — every rank-1 row wears it. Purely
                  decorative (the ranking is conveyed by row order). */}
              {entry.rank === 1 && (
                <span
                  className="absolute -right-1 -top-1.5 text-sm text-qupu-brand-yellow drop-shadow-[0_1px_0_rgba(0,0,0,0.25)]"
                  aria-hidden="true"
                >
                  <i className="fa-solid fa-crown" />
                </span>
              )}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-extrabold text-qupu-brand-blue">
              {entry.name}
            </span>
            <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-qupu-brand-blue px-2.5 py-1 text-[11px] font-extrabold text-white">
              <i className="fa-solid fa-bolt text-qupu-brand-yellow" aria-hidden="true" />
              {entry.weeklyXp} XP
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
