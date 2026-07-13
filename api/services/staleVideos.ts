import { query } from '../db.js'
import { YouTubeMisconfiguredError } from './youtubeChannel.js'

/*
 * Stale video detection. A catalog video is "stale" when its YouTube source is
 * gone — YouTube's videos.list omits IDs that have been deleted or made
 * private. Unlisted videos still return by ID, so they are NOT flagged.
 */

export interface StaleVideo {
  id: string
  youtubeVideoId: string
  title: string
  isPublished: boolean
  // Linked member history. Videos with any of these are soft-deleted, never
  // hard-deleted (FK RESTRICT since migration 0049).
  scoreAttempts: number
  badgeUnlocks: number
}

// Returns the subset of `ids` that YouTube still serves. Batches of 50 (the
// videos.list id cap). `part=id` keeps the quota cost minimal (1 unit/call).
async function fetchLiveYouTubeIds(ids: string[], apiKey: string): Promise<Set<string>> {
  const live = new Set<string>()
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50)
    const url =
      `https://www.googleapis.com/youtube/v3/videos?id=${encodeURIComponent(batch.join(','))}` +
      `&part=id&key=${encodeURIComponent(apiKey)}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`)
    }
    const body = (await response.json()) as { items?: Array<{ id: string }> }
    for (const item of body.items ?? []) live.add(item.id)
  }
  return live
}

// Every catalog video whose YouTube source is gone, annotated with the count of
// linked score attempts + earned badges that a hard delete would remove.
export async function findStaleVideos(): Promise<StaleVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    throw new YouTubeMisconfiguredError('YOUTUBE_API_KEY is not configured')
  }

  const rows = await query<{
    id: string
    youtube_video_id: string
    title: string
    is_published: boolean
    score_attempts: string
    badge_unlocks: string
  }>(`
    SELECT
      v.id,
      v.youtube_video_id,
      v.title,
      v.is_published,
      (SELECT COUNT(*) FROM score_attempts s WHERE s.video_id = v.id) AS score_attempts,
      (SELECT COUNT(*) FROM user_badge_unlocks u WHERE u.video_id = v.id) AS badge_unlocks
    FROM videos v
    WHERE v.deleted_at IS NULL
    ORDER BY v.created_at DESC
  `)
  if (rows.length === 0) return []

  const liveIds = await fetchLiveYouTubeIds(
    rows.map((row) => row.youtube_video_id),
    apiKey,
  )

  return rows
    .filter((row) => !liveIds.has(row.youtube_video_id))
    .map((row) => ({
      id: row.id,
      youtubeVideoId: row.youtube_video_id,
      title: row.title,
      isPublished: row.is_published,
      scoreAttempts: Number(row.score_attempts),
      badgeUnlocks: Number(row.badge_unlocks),
    }))
}

// Remove videos by id. Videos with member history (attempts/badges) are
// soft-deleted — the FKs are ON DELETE RESTRICT (migration 0049) precisely so
// a purge can never destroy kids' history. History-free videos are hard
// deleted (cascade only removes their video_badge_rules). Returns the count
// removed either way.
export async function deleteVideosByIds(ids: string[]): Promise<number> {
  if (ids.length === 0) return 0
  const softDeleted = await query<{ id: string }>(
    `UPDATE videos
        SET deleted_at = NOW(), is_published = false, updated_at = NOW()
      WHERE id = ANY($1::uuid[]) AND deleted_at IS NULL
        AND (EXISTS (SELECT 1 FROM score_attempts s WHERE s.video_id = videos.id)
          OR EXISTS (SELECT 1 FROM user_badge_unlocks u WHERE u.video_id = videos.id))
      RETURNING id`,
    [ids],
  )
  const hardDeleted = await query<{ id: string }>(
    `DELETE FROM videos
      WHERE id = ANY($1::uuid[])
        AND NOT EXISTS (SELECT 1 FROM score_attempts s WHERE s.video_id = videos.id)
        AND NOT EXISTS (SELECT 1 FROM user_badge_unlocks u WHERE u.video_id = videos.id)
      RETURNING id`,
    [ids],
  )
  return softDeleted.length + hardDeleted.length
}
