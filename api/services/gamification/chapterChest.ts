// api/services/gamification/chapterChest.ts
//
// Chapter chests (P2.2): per (child, chapter) a one-time chest opens when
// the chapter's grown share — concepts at best_tier >= Mahir over the
// chapter's enabled concepts — reaches 50% and 100%.
//
// Idempotency: the ledger source id is deterministically derived from
// chest:<child>:<subjectKey>:<threshold>, so the UNIQUE
// (child_id, reward_type, source_type, source_id) key makes every replay,
// retry, or re-attempt a no-op. The garden's chest markers derive "earned"
// from the same share >= threshold math, so payment and display agree.

import type { PoolClient } from 'pg'
import { deterministicUuid } from '../../lib/deterministicUuid.js'
import { appendLedger } from './ledger.js'

export type ChestThreshold = 50 | 100

export const CHAPTER_CHEST_REWARD: Record<ChestThreshold, { xp: number; coins: number }> = {
  50: { xp: 0, coins: 15 },
  100: { xp: 20, coins: 40 },
}

// Pure crossing math (exported for unit tests). Integer-only share check:
// grown * 100 >= threshold * total avoids float drift on awkward totals.
//
// Returns every threshold the AFTER state reaches — including thresholds the
// BEFORE state had already reached. That is deliberate self-healing: the
// drill path can silently push a chapter past a threshold (chests are only
// evaluated at session commits), and a strict before<t<=after crossing would
// then lose the chest forever. Re-attempts cost one no-op ledger insert.
// The before count still gates the whole computation: when nothing newly
// grew (after <= before) there is nothing to grant or heal, so callers skip
// the chapter COUNT query entirely on the warm path.
export function chestThresholdsToGrant(
  grownBefore: number,
  grownAfter: number,
  total: number,
): ChestThreshold[] {
  if (total <= 0 || grownAfter <= grownBefore) return []
  return ([50, 100] as const).filter((t) => grownAfter * 100 >= t * total)
}

export interface GrantedChest {
  threshold: ChestThreshold
  coins: number
  xp: number
}

// Attempt the chest grants for every due threshold. Returns ONLY the chests
// this call actually appended (an already-earned chest no-ops and is not
// surfaced — the ceremony must never celebrate the same chest twice).
export async function grantChapterChests(
  client: PoolClient,
  childId: string,
  subjectKey: string,
  thresholds: ChestThreshold[],
): Promise<GrantedChest[]> {
  const granted: GrantedChest[] = []
  for (const threshold of thresholds) {
    const reward = CHAPTER_CHEST_REWARD[threshold]
    const led = await appendLedger(client, {
      childId,
      rewardType: 'CHAPTER_CHEST_XP',
      sourceType: 'chapter_chest',
      sourceId: deterministicUuid(`chest:${childId}:${subjectKey}:${threshold}`),
      xpDelta: reward.xp,
      coinDelta: reward.coins,
      metadata: { subjectKey, threshold },
    })
    if (led.appended) {
      granted.push({ threshold, coins: led.coinDelta, xp: led.xpDelta })
    }
  }
  return granted
}
