// api/services/gamification/ledger.ts
//
// Append-only writer for reward_ledger. Same idempotency pattern as
// gamification_events: UNIQUE on (child_id, reward_type, source_type,
// source_id) guarantees a retried submission cannot grant double XP.
//
// Reward types are open-ended strings to allow the future quest and
// achievement plans to add their own kinds without schema changes.

import type { PoolClient } from 'pg'
import { queryOne } from '../../db.js'

export type RewardType =
  | 'QUIZ_COMPLETION_XP'
  | 'SCORE_IMPROVED_XP'
  | 'HIGH_SCORE_XP'
  | 'PERFECT_SCORE_XP'
  | 'DAILY_QUEST_XP'        // Plan 2
  | 'ACHIEVEMENT_XP'        // Plan 3
  | 'STREAK_BONUS_XP'       // Plan 2
  | 'SHOP_PURCHASE'
  | 'LOGIN_BONUS_COIN'      // daily login bonus (coins-only, no XP)

export interface AppendLedgerInput {
  childId: string
  rewardType: RewardType
  sourceType: string
  sourceId: string
  xpDelta: number
  coinDelta?: number // coins granted alongside XP; omitted means 0
  metadata?: Record<string, unknown>
}

export interface AppendedLedger {
  id: string
  xpDelta: number
  coinDelta: number
  appended: boolean // false if no-op (duplicate)
}

export async function appendLedger(
  client: PoolClient,
  input: AppendLedgerInput,
): Promise<AppendedLedger> {
  const coinDelta = input.coinDelta ?? 0
  const row = await queryOne<{ id: string; xp_delta: number; coin_delta: number }>(
    `INSERT INTO reward_ledger
       (child_id, reward_type, source_type, source_id, xp_delta, coin_delta, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
     ON CONFLICT (child_id, reward_type, source_type, source_id) DO NOTHING
     RETURNING id, xp_delta, coin_delta`,
    [
      input.childId,
      input.rewardType,
      input.sourceType,
      input.sourceId,
      input.xpDelta,
      coinDelta,
      JSON.stringify(input.metadata ?? {}),
    ],
    client,
  )

  if (row) {
    return {
      id: row.id,
      xpDelta: Number(row.xp_delta),
      coinDelta: Number(row.coin_delta),
      appended: true,
    }
  }

  // Duplicate: return the existing row so callers know the canonical deltas.
  const existing = await queryOne<{ id: string; xp_delta: number; coin_delta: number }>(
    `SELECT id, xp_delta, coin_delta FROM reward_ledger
       WHERE child_id = $1 AND reward_type = $2 AND source_type = $3 AND source_id = $4`,
    [input.childId, input.rewardType, input.sourceType, input.sourceId],
    client,
  )
  return {
    id: existing?.id ?? '',
    xpDelta: existing ? Number(existing.xp_delta) : 0,
    coinDelta: existing ? Number(existing.coin_delta) : 0,
    appended: false,
  }
}
