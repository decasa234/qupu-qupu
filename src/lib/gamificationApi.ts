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

// Non-null whenever the child's last streak break is recoverable
// (broke with a one-day skip). `eligible` already accounts for the
// backend's 30-day usage cap.
export interface GamificationStreakRecovery {
  eligible: boolean
  previousStreak: number
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
  // Streak shields owned (0..2) — auto-consumed when a day is missed.
  streakShields: number
  streakRecovery: GamificationStreakRecovery | null
  tiers: GamificationTierInfo[]
}

export async function fetchGamificationSummary(childId: string): Promise<GamificationSummary> {
  const res = await api.get('/me/gamification', { params: { childId } })
  return res.data.data as GamificationSummary
}

// Mirrors api/services/gamification/streakUpdater.ts RecoveryResult — the
// shape returned by POST /me/streak-recovery.
export interface StreakRecoveryResult {
  recovered: boolean
  reason?: 'not_eligible' | 'cap_reached' | 'no_pre_break_value'
  currentStreakDays: number
  longestStreakDays: number
}

export async function recoverStreak(childId: string): Promise<StreakRecoveryResult> {
  const res = await api.post('/me/streak-recovery', { childId })
  return res.data.data as StreakRecoveryResult
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

// Mirrors api/services/gamification/quests.ts QuestClaimResult — the shape
// returned by POST /me/quests/:id/claim (P2.2 claim ritual). A double-tap
// returns alreadyClaimed with the canonical balances, never an error.
export interface QuestClaimResult {
  claimed: boolean
  alreadyClaimed: boolean
  xp: number
  coins: number
  totalXp: number
  coinBalance: number
  level: number
  tierName: string
  levelUp: { previousLevel: number; currentLevel: number; tierName: string } | null
  streak: { current: number; longest: number }
}

export async function claimDailyQuest(questId: string): Promise<QuestClaimResult> {
  const res = await api.post(`/me/quests/${questId}/claim`)
  return res.data.data as QuestClaimResult
}
