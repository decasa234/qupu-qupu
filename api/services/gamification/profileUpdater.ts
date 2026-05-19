// api/services/gamification/profileUpdater.ts
//
// Atomic profile mutator. The eng review locked this pattern:
// `UPDATE ... SET total_xp = total_xp + $delta` is the ONLY safe way to
// increment XP under concurrent submissions. Read-then-write loses
// concurrent increments.
//
// Level/tier recompute happens in two steps inside the same transaction:
//   1. Atomic XP delta → returns the new total_xp
//   2. If new total_xp crosses a tier threshold, update current_level
//      and current_tier_id. This is a follow-up UPDATE on the same row in
//      the same transaction, so it's still atomic from outside.

import type { PoolClient } from 'pg'
import { queryOne } from '../../db.js'
import { loadLevelTiers, resolveLevel, type LevelTier } from './levelCurve.js'

export interface ProfileSnapshot {
  childId: string
  totalXp: number
  currentLevel: number
  currentTierId: string | null
  currentTierName: string
  currentStreakDays: number
  longestStreakDays: number
  lastActivityDate: string | null
}

export interface UpdateProfileInput {
  childId: string
  xpDelta: number
  activityDate: string // YYYY-MM-DD WIB
}

export interface UpdateProfileResult {
  before: ProfileSnapshot
  after: ProfileSnapshot
  levelUp: { previousLevel: number; currentLevel: number; tier: LevelTier } | null
}

/**
 * Ensures a gamification_profiles row exists for the child. Idempotent.
 * Called inside the score-submission transaction before the atomic delta.
 */
async function ensureProfile(client: PoolClient, childId: string): Promise<void> {
  await client.query(
    `INSERT INTO gamification_profiles (child_id) VALUES ($1)
     ON CONFLICT (child_id) DO NOTHING`,
    [childId],
  )
}

async function fetchSnapshot(
  client: PoolClient,
  childId: string,
  tiers: LevelTier[],
): Promise<ProfileSnapshot> {
  const row = await queryOne<{
    child_id: string
    total_xp: number
    current_level: number
    current_tier_id: string | null
    current_streak_days: number
    longest_streak_days: number
    last_activity_date: string | null
  }>(
    `SELECT child_id, total_xp, current_level, current_tier_id,
            current_streak_days, longest_streak_days, last_activity_date
       FROM gamification_profiles
       WHERE child_id = $1`,
    [childId],
    client,
  )
  if (!row) throw new Error('gamification_profile missing after ensureProfile')
  const resolution = resolveLevel(Number(row.total_xp), tiers)
  return {
    childId: row.child_id,
    totalXp: Number(row.total_xp),
    currentLevel: Number(row.current_level),
    currentTierId: row.current_tier_id,
    currentTierName: resolution.tier.tierName,
    currentStreakDays: Number(row.current_streak_days),
    longestStreakDays: Number(row.longest_streak_days),
    lastActivityDate: row.last_activity_date,
  }
}

export async function updateProfileWithDelta(
  client: PoolClient,
  input: UpdateProfileInput,
): Promise<UpdateProfileResult> {
  const tiers = await loadLevelTiers(client)

  await ensureProfile(client, input.childId)
  const before = await fetchSnapshot(client, input.childId, tiers)

  // Step 1: atomic XP delta. Returns the new total_xp from a single UPDATE.
  const xpRow = await queryOne<{ total_xp: number }>(
    `UPDATE gamification_profiles
        SET total_xp = total_xp + $1,
            last_activity_date = $2,
            updated_at = NOW()
        WHERE child_id = $3
        RETURNING total_xp`,
    [input.xpDelta, input.activityDate, input.childId],
    client,
  )
  if (!xpRow) throw new Error('gamification_profile UPDATE returned no row')
  const newTotalXp = Number(xpRow.total_xp)

  // Step 2: resolve level from new total. If it changed, write current_level
  // and current_tier_id. Still atomic — same transaction, same row.
  const resolution = resolveLevel(newTotalXp, tiers)
  const levelChanged =
    resolution.tier.levelNumber !== before.currentLevel ||
    resolution.tier.id !== before.currentTierId

  if (levelChanged) {
    await client.query(
      `UPDATE gamification_profiles
          SET current_level = $1,
              current_tier_id = $2,
              updated_at = NOW()
          WHERE child_id = $3`,
      [resolution.tier.levelNumber, resolution.tier.id, input.childId],
    )
  }

  const after: ProfileSnapshot = {
    ...before,
    totalXp: newTotalXp,
    currentLevel: resolution.tier.levelNumber,
    currentTierId: resolution.tier.id,
    currentTierName: resolution.tier.tierName,
    lastActivityDate: input.activityDate,
  }

  const levelUp =
    resolution.tier.levelNumber > before.currentLevel
      ? {
          previousLevel: before.currentLevel,
          currentLevel: resolution.tier.levelNumber,
          tier: resolution.tier,
        }
      : null

  return { before, after, levelUp }
}
