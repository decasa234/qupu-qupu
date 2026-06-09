// api/services/gamification/quests.ts
//
// Read service for GET /api/me/quests — the "Misi Hari Ini" panel.
// Ensures today's WIB-day quest instances exist (same generator the
// dashboard and submitVideoScore use) and maps them to the API shape.

import { withTransaction } from '../../db.js'
import { assertChildOwnership } from '../../lib/childOwnership.js'
import { ensureProfile } from './profileUpdater.js'
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
