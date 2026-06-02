// api/services/gamification/streakUpdater.ts
//
// Streak counter + recovery, all in WIB calendar days (Plan 0 locked).
//
// Streak rule:
//   - If today is already counted (last_activity_date == today), no-op.
//   - If yesterday (today - 1) is the last activity, increment streak.
//   - If exactly one day was skipped (last_activity_date == today - 2):
//     streak is BROKEN here. We reset to 1 (today counts) AND record the
//     prior streak value in `pre_break_streak_days` so the kid can
//     optionally restore via POST /api/me/streak-recovery.
//   - If gap > 1 day OR no prior activity: streak resets to 1, no
//     recovery offered.
//
// Recovery rule (rolling 30 days):
//   - Eligible iff: pre_break_streak_days > 0, AND no streak_recoveries
//     row in the last 30 days for this child.
//   - On recovery: streak becomes pre_break_streak_days + 1 (the prior
//     streak + today's day). pre_break_streak_days cleared.

import type { PoolClient } from 'pg'
import { queryOne } from '../../db.js'

export interface StreakState {
  currentStreakDays: number
  longestStreakDays: number
  preBreakStreakDays: number
  lastActivityDate: string | null
  recoveryEligible: boolean
  // When set, the streak was just broken on this submission and the kid
  // can call POST /api/me/streak-recovery within the cap to restore it.
}

function daysBetweenWibDates(a: string, b: string): number {
  // Both inputs are YYYY-MM-DD strings. Compare via Date arithmetic.
  const dA = Date.UTC(
    Number(a.slice(0, 4)),
    Number(a.slice(5, 7)) - 1,
    Number(a.slice(8, 10)),
  )
  const dB = Date.UTC(
    Number(b.slice(0, 4)),
    Number(b.slice(5, 7)) - 1,
    Number(b.slice(8, 10)),
  )
  return Math.round((dB - dA) / (24 * 60 * 60 * 1000))
}

async function checkRecoveryUsedRecently(client: PoolClient, childId: string): Promise<boolean> {
  // Rolling 30 days from now.
  const row = await queryOne<{ recent: string }>(
    `SELECT COUNT(*)::text AS recent
       FROM streak_recoveries
       WHERE child_id = $1 AND recovered_at > NOW() - INTERVAL '30 days'`,
    [childId],
    client,
  )
  return Number(row?.recent ?? 0) > 0
}

export async function updateStreakForActivity(
  client: PoolClient,
  childId: string,
  today: string, // YYYY-MM-DD WIB
): Promise<StreakState> {
  // last_activity_date::text — a bare DATE column comes back from node-pg
  // as a JS Date object, but daysBetweenWibDates expects a YYYY-MM-DD
  // string (.slice on it). Casting to text pins it as a string.
  const profile = await queryOne<{
    current_streak_days: number
    longest_streak_days: number
    pre_break_streak_days: number
    last_activity_date: string | null
  }>(
    `SELECT current_streak_days, longest_streak_days, pre_break_streak_days,
            last_activity_date::text AS last_activity_date
       FROM gamification_profiles
       WHERE child_id = $1`,
    [childId],
    client,
  )
  if (!profile) {
    throw new Error('gamification_profile missing — call ensureProfile first')
  }

  const lastActivity = profile.last_activity_date
  const prevStreak = Number(profile.current_streak_days)
  const longest = Number(profile.longest_streak_days)

  let newStreak: number
  let newPreBreak = 0
  let recoveryEligible = false

  if (lastActivity === null) {
    // First-ever activity.
    newStreak = 1
  } else {
    const gap = daysBetweenWibDates(lastActivity, today)
    if (gap === 0) {
      // Already counted today. No-op on streak counter but still
      // update last_activity_date (cheap no-op write).
      newStreak = prevStreak
      newPreBreak = Number(profile.pre_break_streak_days)
    } else if (gap === 1) {
      // Consecutive day → continue streak.
      newStreak = prevStreak + 1
      newPreBreak = 0 // Clear any prior pre-break value.
    } else if (gap === 2) {
      // Skipped exactly one day → recovery eligible.
      const usedRecently = await checkRecoveryUsedRecently(client, childId)
      newStreak = 1
      newPreBreak = usedRecently ? 0 : prevStreak
      recoveryEligible = !usedRecently && prevStreak > 0
    } else {
      // Gap > 1 day → reset, no recovery offered.
      newStreak = 1
      newPreBreak = 0
    }
  }

  const newLongest = Math.max(longest, newStreak)

  await client.query(
    `UPDATE gamification_profiles
        SET current_streak_days = $1,
            longest_streak_days = $2,
            pre_break_streak_days = $3,
            updated_at = NOW()
        WHERE child_id = $4`,
    [newStreak, newLongest, newPreBreak, childId],
  )

  return {
    currentStreakDays: newStreak,
    longestStreakDays: newLongest,
    preBreakStreakDays: newPreBreak,
    lastActivityDate: today,
    recoveryEligible,
  }
}

// Read the current streak without advancing it. Used on the score-correction
// path: editing a previously-scored quiz must NOT count as a new day of
// activity, but the quest evaluator still needs the current streak value.
export async function readStreakState(
  client: PoolClient,
  childId: string,
): Promise<StreakState> {
  const profile = await queryOne<{
    current_streak_days: number
    longest_streak_days: number
    pre_break_streak_days: number
    last_activity_date: string | null
  }>(
    `SELECT current_streak_days, longest_streak_days, pre_break_streak_days,
            last_activity_date::text AS last_activity_date
       FROM gamification_profiles
       WHERE child_id = $1`,
    [childId],
    client,
  )
  if (!profile) {
    throw new Error('gamification_profile missing — call ensureProfile first')
  }
  return {
    currentStreakDays: Number(profile.current_streak_days),
    longestStreakDays: Number(profile.longest_streak_days),
    preBreakStreakDays: Number(profile.pre_break_streak_days),
    lastActivityDate: profile.last_activity_date,
    recoveryEligible: false,
  }
}

export interface RecoveryResult {
  recovered: boolean
  reason?: 'not_eligible' | 'cap_reached' | 'no_pre_break_value'
  currentStreakDays: number
  longestStreakDays: number
}

export async function recoverStreak(
  client: PoolClient,
  childId: string,
  today: string,
): Promise<RecoveryResult> {
  const profile = await queryOne<{
    current_streak_days: number
    longest_streak_days: number
    pre_break_streak_days: number
  }>(
    `SELECT current_streak_days, longest_streak_days, pre_break_streak_days
       FROM gamification_profiles
       WHERE child_id = $1
       FOR UPDATE`,
    [childId],
    client,
  )
  if (!profile) {
    throw new Error('gamification_profile missing for recovery')
  }
  const preBreak = Number(profile.pre_break_streak_days)
  const current = Number(profile.current_streak_days)
  const longest = Number(profile.longest_streak_days)

  if (preBreak <= 0) {
    return {
      recovered: false,
      reason: 'no_pre_break_value',
      currentStreakDays: current,
      longestStreakDays: longest,
    }
  }

  const usedRecently = await checkRecoveryUsedRecently(client, childId)
  if (usedRecently) {
    return {
      recovered: false,
      reason: 'cap_reached',
      currentStreakDays: current,
      longestStreakDays: longest,
    }
  }

  // Restore streak. Today already counts as 1, so resulting = preBreak + 1.
  const restored = preBreak + 1
  const newLongest = Math.max(longest, restored)

  await client.query(
    `INSERT INTO streak_recoveries
       (child_id, recovered_for_date, pre_break_streak_value, resulting_streak_value)
     VALUES ($1, $2, $3, $4)`,
    [childId, today, preBreak, restored],
  )

  await client.query(
    `UPDATE gamification_profiles
        SET current_streak_days = $1,
            longest_streak_days = $2,
            pre_break_streak_days = 0,
            updated_at = NOW()
        WHERE child_id = $3`,
    [restored, newLongest, childId],
  )

  return {
    recovered: true,
    currentStreakDays: restored,
    longestStreakDays: newLongest,
  }
}

export const __test__ = { daysBetweenWibDates }
