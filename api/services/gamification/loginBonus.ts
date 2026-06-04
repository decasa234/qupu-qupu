// api/services/gamification/loginBonus.ts
//
// Daily login bonus — a once-per-WIB-day coin grant claimed from the Home
// "Hadiah Login" card. Coins-only; grants no XP and, critically, never
// touches last_activity_date (a login claim is not a learning activity, so
// it must not advance or reset the streak — that is why this does NOT route
// through updateProfileWithDelta).
//
// Idempotency: daily_login_claims has UNIQUE(child_id, claim_date). The
// INSERT ... ON CONFLICT DO NOTHING RETURNING id is the guard — a double-tap
// or HTTP retry on the same WIB day inserts nothing and grants nothing. The
// claim row id then keys the reward_ledger row so the audit trail is
// reconcilable against coin_balance (same invariant as shop purchases).

import type { PoolClient } from 'pg'
import { queryOne, withTransaction } from '../../db.js'
import { assertChildOwnership } from '../../lib/childOwnership.js'
import { wibDateString } from '../../lib/wib.js'
import { appendLedger } from './ledger.js'
import { ensureProfile } from './profileUpdater.js'

// Coins granted per daily claim. Flat for now; the per-day escalation
// (day-2 > day-1, etc.) is a future tuning question, mirrors quiz coin
// constant in gamification/index.ts.
export const LOGIN_BONUS_COINS = 5

export interface LoginBonusResult {
  claimed: boolean        // true iff THIS call performed the grant
  alreadyClaimedToday: boolean
  coinsAwarded: number    // coins granted by this call (0 if already claimed)
  coinBalance: number     // resulting balance, for the client to sync
}

/**
 * Whether the child has already claimed the login bonus on the given WIB
 * day. Read-only; used by the dashboard so the card renders claimed vs
 * claimable on first paint. Accepts an executor so it can join the
 * dashboard's transaction snapshot.
 */
export async function hasClaimedLoginBonus(
  executor: PoolClient,
  childId: string,
  wibDay: string,
): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `SELECT id FROM daily_login_claims WHERE child_id = $1 AND claim_date = $2`,
    [childId, wibDay],
    executor,
  )
  return Boolean(row)
}

export async function claimLoginBonus(
  childId: string,
  parentUserId: string,
): Promise<LoginBonusResult> {
  const today = wibDateString(new Date())

  return withTransaction(async (client) => {
    // Ownership is asserted INSIDE the claim transaction so the check and the
    // coin credit share one connection/snapshot (no assert→mutate gap).
    await assertChildOwnership(client, parentUserId, childId)
    await ensureProfile(client, childId)

    // Idempotency-checked insert. Empty RETURNING ⇒ already claimed today.
    const claim = await queryOne<{ id: string }>(
      `INSERT INTO daily_login_claims (child_id, claim_date, coins_awarded)
         VALUES ($1, $2, $3)
         ON CONFLICT (child_id, claim_date) DO NOTHING
         RETURNING id`,
      [childId, today, LOGIN_BONUS_COINS],
      client,
    )

    if (!claim) {
      const bal = await queryOne<{ coin_balance: number }>(
        `SELECT coin_balance FROM gamification_profiles WHERE child_id = $1`,
        [childId],
        client,
      )
      return {
        claimed: false,
        alreadyClaimedToday: true,
        coinsAwarded: 0,
        coinBalance: Number(bal?.coin_balance ?? 0),
      }
    }

    // Atomic coin credit. coin_balance ONLY — last_activity_date untouched.
    const credit = await queryOne<{ coin_balance: number }>(
      `UPDATE gamification_profiles
          SET coin_balance = coin_balance + $1, updated_at = NOW()
          WHERE child_id = $2
          RETURNING coin_balance`,
      [LOGIN_BONUS_COINS, childId],
      client,
    )
    if (!credit) throw new Error('gamification_profile UPDATE returned no row')

    // Mirror to the ledger, idempotent on the claim row id.
    await appendLedger(client, {
      childId,
      rewardType: 'LOGIN_BONUS_COIN',
      sourceType: 'daily_login_claim',
      sourceId: claim.id,
      xpDelta: 0,
      coinDelta: LOGIN_BONUS_COINS,
      metadata: { claimDate: today },
    })

    return {
      claimed: true,
      alreadyClaimedToday: true,
      coinsAwarded: LOGIN_BONUS_COINS,
      coinBalance: Number(credit.coin_balance),
    }
  })
}
