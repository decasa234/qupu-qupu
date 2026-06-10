// api/services/gamification/summary.ts
//
// Read-only gamification snapshot for the Profil page: the child's level, XP
// progress within the current tier, balances, and the full tier ladder so the
// UI can render "level tiering". Levels are derived from total_xp via the
// shared levelCurve, never read from the cached column.

import { pool, queryOne } from '../../db.js'
import { assertChildOwnership } from '../../lib/childOwnership.js'
import { loadLevelTiers, resolveLevel } from './levelCurve.js'
import { checkRecoveryUsedRecently } from './streakUpdater.js'

export interface GamificationTierInfo {
  level: number
  name: string
  minXp: number
  themeKey: string | null
}

// Non-null whenever a recoverable break exists (pre_break_streak_days > 0).
// `eligible` mirrors recoverStreak's actual gate: the 30-day usage cap.
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
  levelSpan: number // xpIntoCurrent + xpToNext for the current level (0 at max)
  coinBalance: number
  streak: number
  longestStreak: number
  // Streak shields owned (0..2) — auto-consumed on a missed day (P1.2).
  streakShields: number
  streakRecovery: GamificationStreakRecovery | null
  tiers: GamificationTierInfo[]
}

export async function getGamificationSummary(
  parentUserId: string,
  childId: string,
): Promise<GamificationSummary> {
  const client = await pool.connect()
  try {
    await assertChildOwnership(client, parentUserId, childId)
    const tiers = await loadLevelTiers(client)
    const profile = await queryOne<{
      total_xp: number
      coin_balance: number
      current_streak_days: number
      longest_streak_days: number
      pre_break_streak_days: number
      streak_shields: number
    }>(
      `SELECT total_xp, coin_balance, current_streak_days, longest_streak_days,
              pre_break_streak_days, streak_shields
         FROM gamification_profiles WHERE child_id = $1`,
      [childId],
      client,
    )
    const totalXp = Number(profile?.total_xp ?? 0)
    const resolution = resolveLevel(totalXp, tiers)

    // Streak recovery: pre_break_streak_days is set when the streak broke
    // with a one-day skip (streakUpdater gap === 2). Mirror recoverStreak's
    // gate — preBreak > 0 AND no recovery used in the rolling 30 days — so
    // the UI never offers a recovery the endpoint would refuse.
    const preBreak = Number(profile?.pre_break_streak_days ?? 0)
    let streakRecovery: GamificationStreakRecovery | null = null
    if (preBreak > 0) {
      const usedRecently = await checkRecoveryUsedRecently(client, childId)
      streakRecovery = { eligible: !usedRecently, previousStreak: preBreak }
    }
    return {
      level: resolution.tier.levelNumber,
      tierName: resolution.tier.tierName,
      totalXp,
      xpIntoCurrent: resolution.xpIntoCurrent,
      xpToNext: resolution.xpToNext,
      levelSpan: resolution.xpIntoCurrent + resolution.xpToNext,
      coinBalance: Number(profile?.coin_balance ?? 0),
      streak: Number(profile?.current_streak_days ?? 0),
      longestStreak: Number(profile?.longest_streak_days ?? 0),
      streakShields: Number(profile?.streak_shields ?? 0),
      streakRecovery,
      tiers: tiers.map((tier) => ({
        level: tier.levelNumber,
        name: tier.tierName,
        minXp: tier.minXp,
        themeKey: tier.themeKey,
      })),
    }
  } finally {
    client.release()
  }
}
