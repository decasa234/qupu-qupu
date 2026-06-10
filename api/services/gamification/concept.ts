// api/services/gamification/concept.ts
//
// Reward economy for the WMI "konsep" concept questions. Unlike the video
// quiz (a one-shot completion handled by the full orchestrator in index.ts),
// konsep is an endless stream of auto-generated questions, so rewards are
// small per-answer grants composing the same primitives the orchestrator
// uses: ensureProfile → updateStreakForActivity → appendLedger
// → updateProfileWithDelta. All child_id-keyed, all inside the caller's
// transaction.
//
// Rules (product decisions, P2.1 "XP represents growth"):
//   - Answering ANY konsep question counts as activity for the day, so the
//     daily streak advances on correct AND wrong answers (showing up counts).
//   - XP + coins are granted ONLY on a correct answer.
//   - Per-correct XP scales DOWN with the concept's best_tier (mastery):
//     grinding a Dikuasai concept pays 1 XP, a fresh concept pays 5. Coins
//     stay flat at 1 — coins are the spend currency, XP the growth signal.
//   - Crossing a tier grants a ONE-TIME ledger-idempotent bonus (Berlatih /
//     Mahir / Dikuasai). best_tier is monotonic, so a tier can only ever be
//     crossed once per (child, concept).
//   - NO daily cap. Idempotency on the (child, reward_type, source_type,
//     concept_instance_id) natural key still prevents a retried submission
//     of the SAME question from double-granting.

import type { PoolClient } from 'pg'
import { deterministicUuid } from '../../lib/deterministicUuid.js'
import { wibDateString } from '../../lib/wib.js'
import { appendLedger } from './ledger.js'
import { ensureProfile, updateProfileWithDelta } from './profileUpdater.js'
import { updateStreakForActivity } from './streakUpdater.js'

// Mastery-scaled per-correct XP curve (P2.1). Exported: the batched session
// commit (wmi/concepts/session.ts) writes the same per-instance ledger rows
// in one multi-VALUES insert — amounts and idempotency keys MUST stay in
// lockstep with awardConceptReward. Never zero — kindness floor.
export function conceptXpForTier(bestTier: number): number {
  if (bestTier <= 1) return 5 // fresh / Baru belajar
  if (bestTier === 2) return 4 // Berlatih
  if (bestTier === 3) return 2 // Mahir
  return 1 // Dikuasai (and anything above)
}

// Coins stay flat per correct answer (spend currency, not growth signal).
export const CONCEPT_CORRECT_COINS = 1

// One-time tier-up bonuses: granted the moment a concept's best_tier crosses
// 2 (Berlatih), 3 (Mahir), or 4 (Dikuasai).
export const TIER_UP_BONUS: Record<2 | 3 | 4, { xp: number; coins: number }> = {
  2: { xp: 5, coins: 0 }, // Berlatih
  3: { xp: 20, coins: 5 }, // Mahir
  4: { xp: 40, coins: 10 }, // Dikuasai
}

// The bonus-bearing tiers crossed by a fromTier → toTier move. A single
// session fold can jump multiple tiers at once (e.g. 0 → 3 crosses 2 AND 3).
export function crossedTiers(fromTier: number, toTier: number): (2 | 3 | 4)[] {
  const out: (2 | 3 | 4)[] = []
  for (const tier of [2, 3, 4] as const) {
    if (fromTier < tier && toTier >= tier) out.push(tier)
  }
  return out
}

export interface TierUpGrant {
  xp: number
  coins: number
}

// Grant every bonus crossed by fromTier → toTier, ledger-idempotent: the
// source id is deterministically derived from tier-up:<child>:<slug>:<tier>,
// so replays/recomputes conflict on the unique ledger key and grant nothing.
// Returns only the APPENDED amounts (0/0 when everything was already paid).
export async function grantTierUpBonuses(
  client: PoolClient,
  childId: string,
  conceptSlug: string,
  fromTier: number,
  toTier: number,
): Promise<TierUpGrant> {
  let xp = 0
  let coins = 0
  for (const tier of crossedTiers(fromTier, toTier)) {
    const bonus = TIER_UP_BONUS[tier]
    const led = await appendLedger(client, {
      childId,
      rewardType: 'CONCEPT_TIER_UP_XP',
      sourceType: 'concept_tier_up',
      sourceId: deterministicUuid(`tier-up:${childId}:${conceptSlug}:${tier}`),
      xpDelta: bonus.xp,
      coinDelta: bonus.coins,
      metadata: { conceptSlug, tier },
    })
    if (led.appended) {
      xp += led.xpDelta
      coins += led.coinDelta
    }
  }
  return { xp, coins }
}

export interface ConceptRewardResult {
  xpEarned: number
  coinsEarned: number
  totalXp: number
  coinBalance: number
  level: number
  tierName: string
  levelUp: { previousLevel: number; currentLevel: number; tierName: string } | null
  streak: { current: number; longest: number }
  // Set when this answer crossed one or more concept tiers — the one-time
  // bonus is already folded into xpEarned/coinsEarned.
  tierUp: { toTier: number; bonusXp: number; bonusCoins: number } | null
}

export async function awardConceptReward(
  client: PoolClient,
  input: {
    childId: string
    conceptInstanceId: string
    isCorrect: boolean
    conceptSlug: string
    // The concept's best_tier BEFORE this answer's progress upsert — prices
    // the per-answer XP (the caller reads it from upsertConceptProgress).
    tierBefore: number
    // best_tier AFTER the upsert — a rise grants the one-time tier-up bonus.
    tierAfter: number
  },
): Promise<ConceptRewardResult> {
  const today = wibDateString(new Date())

  await ensureProfile(client, input.childId)

  // Advance the daily streak first — it reads the OLD last_activity_date to
  // compute the day gap, before updateProfileWithDelta stamps today's date.
  // Idempotent within a WIB day (gap === 0 is a no-op on the counter).
  const streak = await updateStreakForActivity(client, input.childId, today)

  let xpDelta = 0
  let coinDelta = 0
  if (input.isCorrect) {
    // Same per-instance idempotency key as ever — only the AMOUNT now varies
    // with the pre-answer tier.
    const led = await appendLedger(client, {
      childId: input.childId,
      rewardType: 'CONCEPT_COMPLETION_XP',
      sourceType: 'concept_attempt',
      sourceId: input.conceptInstanceId,
      xpDelta: conceptXpForTier(input.tierBefore),
      coinDelta: CONCEPT_CORRECT_COINS,
    })
    if (led.appended) {
      xpDelta = led.xpDelta
      coinDelta = led.coinDelta
    }
  }

  // One-time tier-up bonus when this answer pushed best_tier over a
  // threshold. Idempotent on tier-up:<child>:<slug>:<tier>.
  let tierUp: ConceptRewardResult['tierUp'] = null
  if (input.tierAfter > input.tierBefore) {
    const grant = await grantTierUpBonuses(
      client,
      input.childId,
      input.conceptSlug,
      input.tierBefore,
      input.tierAfter,
    )
    if (grant.xp > 0 || grant.coins > 0) {
      xpDelta += grant.xp
      coinDelta += grant.coins
      tierUp = { toTier: input.tierAfter, bonusXp: grant.xp, bonusCoins: grant.coins }
    }
  }

  // Always run the profile delta — even at 0/0 it stamps last_activity_date =
  // today (so tomorrow's streak gap is correct) and returns the canonical
  // balances/level for the top stat strip.
  const profile = await updateProfileWithDelta(client, {
    childId: input.childId,
    xpDelta,
    coinDelta,
    activityDate: today,
  })

  return {
    xpEarned: xpDelta,
    coinsEarned: coinDelta,
    totalXp: profile.after.totalXp,
    coinBalance: profile.after.coinBalance,
    level: profile.after.currentLevel,
    tierName: profile.after.currentTierName,
    levelUp: profile.levelUp
      ? {
          previousLevel: profile.levelUp.previousLevel,
          currentLevel: profile.levelUp.currentLevel,
          tierName: profile.levelUp.tier.tierName,
        }
      : null,
    streak: { current: streak.currentStreakDays, longest: streak.longestStreakDays },
    tierUp,
  }
}
