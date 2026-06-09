// src/lib/gamificationApi.ts
//
// Per-child gamification snapshot for the Profil page (level, XP progress,
// balances, and the full tier ladder). Mirrors GET /me/gamification.
// Also the daily-quest list for the "Misi Hari Ini" panel (GET /me/quests).
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

// Mirrors api/services/gamification/quests.ts DailyQuestItem — the shape
// returned by GET /me/quests (NOT the dashboard payload's DashboardQuest,
// which uses progressValue/targetValue/status instead).
export interface DailyQuest {
  id: string
  title: string            // Indonesian, personalized
  description: string
  progress: number
  target: number
  rewardCoins: number
  rewardXp: number
  completed: boolean
  claimedAt: string | null
}

export async function fetchDailyQuests(childId: string): Promise<DailyQuest[]> {
  const res = await api.get('/me/quests', { params: { childId } })
  return (res.data.data as { quests: DailyQuest[] }).quests
}
