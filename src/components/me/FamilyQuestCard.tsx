// src/components/me/FamilyQuestCard.tsx
//
// "Misi Keluarga" — the weekly family co-op quest panel (P2.3), rendered
// under the FamilyLeaderboard on Dashboard and Me. Progress is the WHOLE
// family's XP this WIB week; on completion every child was already paid
// server-side, so the completed state is purely informational.
//
// Render contract: nothing unless the account has >= 2 children, nothing on
// fetch failure, nothing when the API returns quest: null.

import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { fetchFamilyQuest, type FamilyQuest } from '../../lib/gamificationApi'

export default function FamilyQuestCard() {
  const { children } = useAuthStore()
  const isFamily = children.length >= 2
  const [quest, setQuest] = useState<FamilyQuest | null>(null)

  useEffect(() => {
    if (!isFamily) return
    let cancelled = false
    fetchFamilyQuest()
      .then((data) => { if (!cancelled) setQuest(data) })
      .catch(() => { if (!cancelled) setQuest(null) })
    return () => { cancelled = true }
  }, [isFamily])

  if (!isFamily || !quest) return null

  const pct = quest.targetXp > 0
    ? Math.min(100, Math.round((quest.progressXp / quest.targetXp) * 100))
    : 0

  return (
    <section className="rounded-[1.5rem] bg-white p-4 shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
      <div className="flex items-center gap-2.5">
        <span
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-sm ${
            quest.completed ? 'bg-qupu-brand-yellow text-qupu-brand-blue' : 'bg-qupu-brand-blue text-white'
          }`}
        >
          <i
            className={quest.completed ? 'fa-solid fa-trophy' : 'fa-solid fa-hand-holding-heart'}
            aria-hidden="true"
          />
        </span>
        <h2 className="min-w-0 flex-1 truncate font-display text-base font-black text-qupu-brand-blue">
          Misi Keluarga
        </h2>
        <span className="flex-shrink-0 rounded-full bg-qupu-cream px-2.5 py-1 text-[0.6875rem] font-black text-qupu-brand-blue">
          {Math.min(quest.progressXp, quest.targetXp)}/{quest.targetXp} XP
        </span>
      </div>

      <p className="mt-2 text-xs font-bold text-qupu-brand-blue">
        Kumpulkan {quest.targetXp} XP bersama minggu ini
      </p>

      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#F1E4CC]">
        <div
          className={`h-full rounded-full ${quest.completed ? 'bg-[#58A700]' : 'bg-qupu-brand-orange'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {quest.completed ? (
        <p className="mt-2 inline-flex items-center gap-1.5 text-[0.6875rem] font-extrabold text-[#58A700]">
          <i className="fa-solid fa-circle-check" aria-hidden="true" />
          Selesai! Hadiah sudah masuk.
        </p>
      ) : (
        <p className="mt-2 inline-flex items-center gap-1.5 text-[0.6875rem] font-bold text-qupu-muted">
          <i className="fa-solid fa-coins text-amber-500" aria-hidden="true" />
          +{quest.rewardCoinsPerChild} koin untuk semua
        </p>
      )}
    </section>
  )
}
