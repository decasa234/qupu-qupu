// src/components/me/DailyQuestsPanel.tsx
//
// "Misi Hari Ini" — compact, read-only daily-quest card rendered at the top
// of the WMI garden and as the first Dashboard card. Quests auto-grant today
// (the claim ritual is P1), so there is no claim button.
//
// Resilience contract: fetches GET /me/quests on mount; on ANY failure (or
// an empty quest list) it renders NOTHING, so the host page never looks
// broken because quests failed.

import { useEffect, useState } from 'react'
import { fetchDailyQuests, type DailyQuest } from '../../lib/gamificationApi'

interface Props {
  childId: string
  variant?: 'garden' | 'dashboard'
}

function progressPct(quest: DailyQuest): number {
  if (quest.target <= 0) return quest.completed ? 100 : 0
  return Math.min(100, Math.round((quest.progress / quest.target) * 100))
}

export default function DailyQuestsPanel({ childId, variant = 'garden' }: Props) {
  const [quests, setQuests] = useState<DailyQuest[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setQuests(null)
    fetchDailyQuests(childId)
      .then((list) => { if (!cancelled) setQuests(list) })
      .catch(() => { if (!cancelled) setQuests(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [childId])

  // The garden stacks sections with their own top margin; the dashboard
  // column already provides spacing via space-y-4.
  const margin = variant === 'garden' ? 'mt-4 ' : ''

  if (loading) {
    return (
      <div
        className={`${margin}h-36 animate-pulse rounded-[1.5rem] bg-qupu-cream`}
        aria-hidden="true"
      />
    )
  }

  // Fetch failed or no quests today — render nothing rather than a broken card.
  if (!quests || quests.length === 0) return null

  const doneCount = quests.filter((q) => q.completed).length
  const allDone = doneCount === quests.length

  return (
    <section className={`${margin}rounded-[1.5rem] bg-white p-4 shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]`}>
      <div className="flex items-center gap-2.5">
        <span
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-sm ${
            allDone ? 'bg-qupu-brand-yellow text-qupu-brand-blue' : 'bg-qupu-brand-blue text-white'
          }`}
        >
          <i className={allDone ? 'fa-solid fa-trophy' : 'fa-solid fa-list-check'} aria-hidden="true" />
        </span>
        <h2 className="min-w-0 flex-1 truncate font-display text-base font-black text-qupu-brand-blue">
          {allDone ? 'Semua misi selesai!' : 'Misi Hari Ini'}
        </h2>
        <span className="flex-shrink-0 rounded-full bg-qupu-cream px-2.5 py-1 text-[11px] font-black text-qupu-brand-blue">
          {doneCount}/{quests.length}
        </span>
      </div>

      <ul className="mt-3 space-y-2.5">
        {quests.map((quest) => (
          <li key={quest.id} className="flex items-center gap-2.5">
            <span
              className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                quest.completed
                  ? 'bg-[#58A700] text-[9px] text-white'
                  : 'ring-2 ring-inset ring-[#FFE3CC]'
              }`}
            >
              {quest.completed && <i className="fa-solid fa-check" aria-hidden="true" />}
            </span>
            <div className={`min-w-0 flex-1 ${quest.completed ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-xs font-bold text-qupu-brand-blue" title={quest.description}>
                  {quest.title}
                </p>
                <span className="flex flex-shrink-0 items-center gap-1">
                  {quest.rewardXp > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-qupu-brand-blue px-2 py-0.5 text-[10px] font-extrabold text-white">
                      <i className="fa-solid fa-bolt text-qupu-brand-yellow" aria-hidden="true" />
                      +{quest.rewardXp} XP
                    </span>
                  )}
                  {quest.rewardCoins > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
                      <i className="fa-solid fa-coins" aria-hidden="true" />
                      +{quest.rewardCoins}
                    </span>
                  )}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#F1E4CC]">
                <div
                  className={`h-full rounded-full ${quest.completed ? 'bg-[#58A700]' : 'bg-qupu-brand-orange'}`}
                  style={{ width: `${progressPct(quest)}%` }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
