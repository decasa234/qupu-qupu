// src/lib/gamificationApi.ts
//
// Per-child gamification snapshot for the Profil page (level, XP progress,
// balances, and the full tier ladder). Mirrors GET /me/gamification.
import api from './api'

export interface GamificationTierInfo {
  level: number
  name: string
  minXp: number
  themeKey: string | null
}

export interface GamificationSummary {
  level: number
  tierName: string
  totalXp: number
  xpIntoCurrent: number
  xpToNext: number
  levelSpan: number
  coinBalance: number
  streak: number
  longestStreak: number
  tiers: GamificationTierInfo[]
}

export async function fetchGamificationSummary(childId: string): Promise<GamificationSummary> {
  const res = await api.get('/me/gamification', { params: { childId } })
  return res.data.data as GamificationSummary
}
