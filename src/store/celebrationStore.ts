// src/store/celebrationStore.ts
//
// Persistent per-child queue of profile celebrations ("Bab baru terbuka!",
// level up, streak day). Surfaces (BelajarPath's garden diff, the
// CelebrationHost's stats watcher) ENQUEUE events the moment they detect
// them; CelebrationHost shows the queue head as a popup and only dismissal
// removes it — so an unacknowledged celebration survives reloads and waits
// until the kid taps continue. Items are deduped by id, so detection can be
// re-run safely (StrictMode, refetches).
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface RevealChapterInfo {
  nameId: string
  colorHex: string
  iconKey: string
  concepts: Array<{ nameId: string }>
}

export type Celebration =
  | { id: string; kind: 'chapter'; chapter: RevealChapterInfo }
  | { id: string; kind: 'level'; level: number; tierName?: string }
  | { id: string; kind: 'streak'; streak: number }

interface CelebrationState {
  queues: Record<string, Celebration[]>
  enqueue: (childId: string, celebration: Celebration) => void
  dismissHead: (childId: string) => void
}

export const useCelebrationStore = create<CelebrationState>()(
  persist(
    (set) => ({
      queues: {},
      enqueue: (childId, celebration) =>
        set((state) => {
          const queue = state.queues[childId] ?? []
          if (queue.some((c) => c.id === celebration.id)) return state
          return { queues: { ...state.queues, [childId]: [...queue, celebration] } }
        }),
      dismissHead: (childId) =>
        set((state) => ({
          queues: { ...state.queues, [childId]: (state.queues[childId] ?? []).slice(1) },
        })),
    }),
    { name: 'qupu-celebrations' },
  ),
)
