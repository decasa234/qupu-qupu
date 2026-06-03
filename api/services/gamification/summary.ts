// api/services/gamification/summary.ts
//
// Read-only gamification snapshot for the Profil page: the child's level, XP
// progress within the current tier, balances, and the full tier ladder so the
// UI can render "level tiering". Levels are derived from total_xp via the
// shared levelCurve, never read from the cached column.

import { pool, queryOne } from '../../db.js'
import { assertChildOwnership } from '../../lib/childOwnership.js'
import { loadLevelTiers, resolveLevel } from './levelCurve.js'

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
  levelSpan: number // xpIntoCurrent + xpToNext for the current level (0 at max)
  coinBalance: number
  streak: number
  longestStreak: number
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
    }>(
      `SELECT total_xp, coin_balance, current_streak_days, longest_streak_days
         FROM gamification_profiles WHERE child_id = $1`,
      [childId],
      client,
    )
    const totalXp = Number(profile?.total_xp ?? 0)
    const resolution = resolveLevel(totalXp, tiers)
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
