// api/services/gamification/levelCurve.ts
//
// Pure mapping: total XP → level tier. The level_tiers table is the source
// of truth; this module loads the seeded tiers once and provides a
// deterministic mapping function.
//
// Levels are derived, never granted. A child's `current_level` field is a
// cached read; the canonical answer is computed here from total_xp.

import type { PoolClient } from 'pg'
import { query } from '../../db.js'

export interface LevelTier {
  id: string
  levelNumber: number
  tierName: string
  minXp: number
  themeKey: string | null
  sortOrder: number
}

let cached: LevelTier[] | null = null

export async function loadLevelTiers(client: PoolClient): Promise<LevelTier[]> {
  if (cached) return cached
  const rows = await query<{
    id: string
    level_number: number
    tier_name: string
    min_xp: number
    theme_key: string | null
    sort_order: number
  }>(
    `SELECT id, level_number, tier_name, min_xp, theme_key, sort_order
       FROM level_tiers
       ORDER BY min_xp ASC`,
    [],
    client,
  )
  cached = rows.map((r) => ({
    id: r.id,
    levelNumber: Number(r.level_number),
    tierName: r.tier_name,
    minXp: Number(r.min_xp),
    themeKey: r.theme_key,
    sortOrder: Number(r.sort_order),
  }))
  return cached
}

export interface LevelResolution {
  tier: LevelTier            // current tier the child is in
  nextTier: LevelTier | null // null if at max level
  xpIntoCurrent: number      // xp earned past current tier's threshold
  xpToNext: number           // xp still needed for next tier (0 if maxed)
}

export function resolveLevel(totalXp: number, tiers: LevelTier[]): LevelResolution {
  if (tiers.length === 0) {
    throw new Error('level_tiers is empty — run migration 0012')
  }
  // tiers sorted ASC by min_xp; find the last tier where min_xp <= totalXp.
  let current = tiers[0]
  for (const tier of tiers) {
    if (tier.minXp <= totalXp) current = tier
    else break
  }
  const idx = tiers.findIndex((t) => t.id === current.id)
  const nextTier = idx + 1 < tiers.length ? tiers[idx + 1] : null
  const xpIntoCurrent = totalXp - current.minXp
  const xpToNext = nextTier ? nextTier.minXp - totalXp : 0
  return { tier: current, nextTier, xpIntoCurrent, xpToNext }
}

// Test-only cache reset; do not call in production code paths.
export function __resetCache(): void {
  cached = null
}
