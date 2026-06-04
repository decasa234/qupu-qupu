// src/hooks/useGamificationStats.ts
//
// Reads gamification stats (streak / coins / level) from the dashboard
// payload shared via React state. Components in <AppShell> subscribe via
// useGamificationStats() to render the top stat strip without each one
// fetching independently. The actual fetch happens in Dashboard.tsx (and
// after-purchase / after-score events trigger a refresh via the same hook).
import { create } from 'zustand'

export interface GamificationStats {
  streak: number
  coinBalance: number
  level: number
  tierName: string
  xp: number
  xpToNext: number
}

interface StatsState {
  stats: GamificationStats | null
  setStats: (s: GamificationStats) => void
  patchCoinBalance: (newBalance: number) => void
  // Merge a partial update into the current stats (e.g. after a konsep answer
  // grants XP/coins/streak). No-op if stats haven't been loaded yet.
  patchStats: (partial: Partial<GamificationStats>) => void
}

export const useGamificationStats = create<StatsState>((set) => ({
  stats: null,
  setStats: (s) => set({ stats: s }),
  patchCoinBalance: (newBalance) =>
    set((state) =>
      state.stats ? { stats: { ...state.stats, coinBalance: newBalance } } : state,
    ),
  patchStats: (partial) =>
    set((state) => (state.stats ? { stats: { ...state.stats, ...partial } } : state)),
}))
