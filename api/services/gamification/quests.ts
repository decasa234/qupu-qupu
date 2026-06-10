// api/services/gamification/quests.ts
//
// Read service for GET /api/me/quests — the "Misi Hari Ini" panel — plus
// the claim ritual (POST /api/me/quests/:id/claim). Quest completion no
// longer auto-pays (P2.2); the explicit claim is the ONLY place quest
// rewards move balances.

import { queryOne, withTransaction } from '../../db.js'
import { assertChildOwnership } from '../../lib/childOwnership.js'
import { appendLedger } from './ledger.js'
import { ensureProfile, updateProfileWithDelta } from './profileUpdater.js'
import { ensureDailyQuests, type ActiveQuest } from './questGenerator.js'

export interface DailyQuestItem {
  id: string
  title: string            // Indonesian, personalized (title_rendered)
  description: string
  progress: number
  target: number
  rewardCoins: number
  rewardXp: number
  completed: boolean
  claimedAt: string | null
}

// Pure mapping from a generator row to the API item. 'claimed' implies the
// quest was completed first, so it stays `completed: true` for the panel.
export function mapQuestForApi(q: ActiveQuest): DailyQuestItem {
  return {
    id: q.id,
    title: q.title,
    description: q.description,
    progress: q.progressValue,
    target: q.targetValue,
    rewardCoins: q.coinReward,
    rewardXp: q.xpReward,
    completed: q.status === 'completed' || q.status === 'claimed',
    claimedAt: q.claimedAt,
  }
}

export async function getDailyQuestsForChild(
  parentUserId: string,
  childId: string,
): Promise<{ quests: DailyQuestItem[] }> {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, childId)
    // Brand-new children may not have a profile row yet; the generator
    // stamps last_quest_refresh_date on it, so make sure it exists.
    await ensureProfile(client, childId)
    const quests = await ensureDailyQuests(client, childId)
    return { quests: quests.map(mapQuestForApi) }
  })
}

export interface QuestClaimResult {
  claimed: boolean          // true iff THIS call performed the payout
  alreadyClaimed: boolean
  xp: number                // amounts granted by this call (0 if already claimed)
  coins: number
  totalXp: number
  coinBalance: number
  level: number
  tierName: string
  levelUp: { previousLevel: number; currentLevel: number; tierName: string } | null
  streak: { current: number; longest: number }
}

// Claim a completed quest's reward (P2.2). Race-safe: the instance row is
// locked FOR UPDATE for the whole transaction, so a concurrent double-tap
// blocks, re-reads the stamped claimed_at, and exits on the alreadyClaimed
// branch. Pre-ritual instances were backfilled with claimed_at (migration
// 0040) so they land there too — and even if one slipped past the backfill,
// the DAILY_QUEST_XP ledger row keyed to the instance id is the SAME key the
// old auto-grant wrote, so the ledger UNIQUE pays nothing twice.
export async function claimQuestReward(
  parentUserId: string,
  questInstanceId: string,
): Promise<QuestClaimResult> {
  return withTransaction(async (client) => {
    const quest = await queryOne<{
      id: string
      child_id: string
      completed_at: string | null
      claimed_at: string | null
      code: string
      quest_type: string
      xp_reward: number
      coin_reward: number
    }>(
      `SELECT cqi.id, cqi.child_id, cqi.completed_at, cqi.claimed_at,
              qt.code, qt.quest_type, qt.xp_reward, qt.coin_reward
         FROM child_quest_instances cqi
         JOIN quest_templates qt ON qt.id = cqi.quest_template_id
        WHERE cqi.id = $1
        FOR UPDATE OF cqi`,
      [questInstanceId],
      client,
    )
    if (!quest) throw new Error('Quest not found')
    // Ownership AFTER existence: the instance's child must belong to the
    // authenticated parent. assertChildOwnership throws 'Child not found'
    // (→ 404), indistinguishable from a missing quest — no oracle.
    await assertChildOwnership(client, parentUserId, quest.child_id)
    if (!quest.completed_at) throw new Error('Quest not completed')

    const childId = quest.child_id
    await ensureProfile(client, childId)

    const snapshot = async (): Promise<Omit<QuestClaimResult, 'claimed' | 'alreadyClaimed' | 'xp' | 'coins' | 'levelUp'>> => {
      // 0/0 delta + null activityDate = pure read of the canonical profile
      // (levels resolved by the same code path every grant uses).
      const p = await updateProfileWithDelta(client, {
        childId,
        xpDelta: 0,
        coinDelta: 0,
        activityDate: null,
      })
      return {
        totalXp: p.after.totalXp,
        coinBalance: p.after.coinBalance,
        level: p.after.currentLevel,
        tierName: p.after.currentTierName,
        streak: {
          current: p.after.currentStreakDays,
          longest: p.after.longestStreakDays,
        },
      }
    }

    if (quest.claimed_at) {
      return { claimed: false, alreadyClaimed: true, xp: 0, coins: 0, levelUp: null, ...(await snapshot()) }
    }

    // Ledger first — same (child, DAILY_QUEST_XP, child_quest_instance, id)
    // key as the retired auto-grant, so historical rows collide here.
    const led = await appendLedger(client, {
      childId,
      rewardType: 'DAILY_QUEST_XP',
      sourceType: 'child_quest_instance',
      sourceId: quest.id,
      xpDelta: Number(quest.xp_reward),
      coinDelta: Number(quest.coin_reward),
      metadata: { questCode: quest.code, questType: quest.quest_type },
    })

    // Stamp the claim regardless of whether the ledger appended (a collided
    // row means it was paid long ago — stamping prevents further attempts).
    await client.query(
      `UPDATE child_quest_instances
          SET claimed_at = NOW(), status = 'claimed', updated_at = NOW()
        WHERE id = $1`,
      [quest.id],
    )

    if (!led.appended) {
      return { claimed: false, alreadyClaimed: true, xp: 0, coins: 0, levelUp: null, ...(await snapshot()) }
    }

    // Credit balances. activityDate null: claiming is not learning activity
    // (see UpdateProfileInput) — streak/last_activity_date stay untouched.
    const profile = await updateProfileWithDelta(client, {
      childId,
      xpDelta: led.xpDelta,
      coinDelta: led.coinDelta,
      activityDate: null,
    })

    return {
      claimed: true,
      alreadyClaimed: false,
      xp: led.xpDelta,
      coins: led.coinDelta,
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
      streak: {
        current: profile.after.currentStreakDays,
        longest: profile.after.longestStreakDays,
      },
    }
  })
}
