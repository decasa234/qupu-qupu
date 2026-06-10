// src/hooks/useGamificationStats.ts
//
// Reads gamification stats (streak / coins / level) from the dashboard
// payload shared via React state. Components in <AppShell> subscribe via
// useGamificationStats() to render the top stat strip without each one
// fetching independently. The actual fetch happens in Dashboard.tsx (and
// after-purchase / after-score events trigger a refresh via the same hook).
// TopStatStrip additionally SELF-HYDRATES from /me/gamification when the
// store is empty (P1.10), so cold deep links never render zeroed stats.
//
// The store is CHILD-AWARE: every write stamps the child the numbers belong
// to (statsChildId). Patches aimed at a different child than the stamped one
// are dropped, and AppShell resets the store whenever the active child stops
// matching the stamp — so sibling A's streak/coins can never render for B,
// and a freshly logged-in parent never sees the previous account's numbers.
import { create } from 'zustand'

export interface GamificationStats {
  streak: number
  // Streak shields owned (0..2) — shown as a chip next to the streak flame.
  streakShields: number
  coinBalance: number
  level: number
  tierName: string
  xp: number
  xpToNext: number
}

interface StatsState {
  stats: GamificationStats | null
  /** Child the current stats belong to — null exactly when stats is null. */
  statsChildId: string | null
  /** Full overwrite, stamped with the child these numbers were fetched for. */
  setStats: (childId: string, s: GamificationStats) => void
  patchCoinBalance: (childId: string, newBalance: number) => void
  // Merge a partial update into the current stats (e.g. after a konsep answer
  // grants XP/coins/streak). No-op if stats haven't been loaded yet or the
  // loaded stats belong to a different child.
  patchStats: (childId: string, partial: Partial<GamificationStats>) => void
  /** Drop everything (logout / child switch) — the next fetch repopulates. */
  reset: () => void
}

export const useGamificationStats = create<StatsState>((set) => ({
  stats: null,
  statsChildId: null,
  setStats: (childId, s) => set({ stats: s, statsChildId: childId }),
  patchCoinBalance: (childId, newBalance) =>
    set((state) =>
      state.stats && state.statsChildId === childId
        ? { stats: { ...state.stats, coinBalance: newBalance } }
        : state,
    ),
  patchStats: (childId, partial) =>
    set((state) =>
      state.stats && state.statsChildId === childId
        ? { stats: { ...state.stats, ...partial } }
        : state,
    ),
  reset: () => set({ stats: null, statsChildId: null }),
}))

// Push a reward/commit payload into the top stat strip. If the strip already
// holds this child's stats, merge; otherwise seed it so the totals aren't
// stuck at zero (e.g. the kid deep-linked straight into a drill/session via
// the bottom tab). The xp bar — not shown in the strip — refreshes on the
// next dashboard load.
export function syncStatStrip(
  childId: string,
  next: Pick<GamificationStats, 'streak' | 'coinBalance' | 'level' | 'tierName'>,
): void {
  const store = useGamificationStats.getState()
  if (store.stats && store.statsChildId === childId) store.patchStats(childId, next)
  else store.setStats(childId, { streakShields: 0, ...next, xp: 0, xpToNext: 0 })
}
