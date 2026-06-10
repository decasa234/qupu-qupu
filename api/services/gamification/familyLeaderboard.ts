// api/services/gamification/familyLeaderboard.ts
//
// "Papan Keluarga" — sibling leaderboard for GET /api/me/family/leaderboard.
// Account-private by construction (COPPA-safe): the only children that can
// ever appear are the authenticated parent's own, ranked by THIS WIB week's
// XP (reward_ledger sum since Monday 00:00 WIB). No cross-account data, no
// public surface.

import { pool, query } from '../../db.js'
import { wibWeek } from '../../lib/wib.js'

export interface FamilyLeaderboardEntry {
  childId: string
  name: string
  // Raw Child avatar fields (avatar slug + hex color) — the FE resolves the
  // slug to a Font Awesome class via src/lib/avatars.ts avatarIconClass().
  avatarIcon: string | null
  avatarColor: string | null
  weeklyXp: number
  rank: number
}

export interface FamilyLeaderboard {
  week: { start: string; end: string }
  entries: FamilyLeaderboardEntry[]
}

export async function getFamilyLeaderboard(parentUserId: string): Promise<FamilyLeaderboard> {
  const week = wibWeek(new Date())
  const rows = await query<{
    child_id: string
    name: string
    avatar_icon: string | null
    avatar_color: string | null
    weekly_xp: string
  }>(
    `SELECT c.id AS child_id, c.name, c.avatar_icon, c.avatar_color,
            COALESCE(SUM(rl.xp_delta), 0)::text AS weekly_xp
       FROM children c
       LEFT JOIN reward_ledger rl
         ON rl.child_id = c.id AND rl.created_at >= $2
      WHERE c.parent_user_id = $1
      GROUP BY c.id, c.name, c.avatar_icon, c.avatar_color
      ORDER BY COALESCE(SUM(rl.xp_delta), 0) DESC, c.created_at ASC`,
    [parentUserId, week.startUtc],
    pool,
  )

  // Competition ranking with shared ranks on ties (1, 1, 3): siblings with
  // equal weekly XP share the crown — warm framing, no artificial loser.
  const entries: FamilyLeaderboardEntry[] = []
  for (const [i, row] of rows.entries()) {
    const weeklyXp = Number(row.weekly_xp)
    const rank =
      i > 0 && entries[i - 1].weeklyXp === weeklyXp ? entries[i - 1].rank : i + 1
    entries.push({
      childId: row.child_id,
      name: row.name,
      avatarIcon: row.avatar_icon,
      avatarColor: row.avatar_color,
      weeklyXp,
      rank,
    })
  }

  return { week: { start: week.start, end: week.end }, entries }
}
