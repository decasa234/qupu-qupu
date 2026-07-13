/**
 * One-off cleanup: delete every draft video (is_published = FALSE) whose
 * YouTube duration is <= SHORT_VIDEO_MAX_SECONDS. The DB FK on
 * video_badge_rules.video_id has ON DELETE CASCADE, so badge rules go with
 * the row.
 *
 * Usage:
 *   npx tsx api/scripts/delete_short_drafts.ts          # dry-run, no deletes
 *   npx tsx api/scripts/delete_short_drafts.ts --apply  # actually delete
 *
 * Requires DATABASE_URL and YOUTUBE_API_KEY in env (loaded via dotenv).
 */
import { pool, query } from '../db.js'
import { SHORT_VIDEO_MAX_SECONDS, parseIsoDurationSeconds } from '../lib/youtube.js'

interface DraftRow {
  id: string
  youtube_video_id: string
  title: string
}

interface YouTubeApiItem {
  id: string
  contentDetails?: { duration: string }
}

async function fetchDurations(ids: string[], apiKey: string): Promise<Map<string, number>> {
  const result = new Map<string, number>()
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50)
    const url =
      `https://www.googleapis.com/youtube/v3/videos?id=${encodeURIComponent(batch.join(','))}` +
      `&part=contentDetails&key=${encodeURIComponent(apiKey)}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`)
    }
    const body = (await response.json()) as { items?: YouTubeApiItem[] }
    for (const item of body.items ?? []) {
      result.set(item.id, parseIsoDurationSeconds(item.contentDetails?.duration))
    }
  }
  return result
}

async function main() {
  const apply = process.argv.includes('--apply')
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    console.error('YOUTUBE_API_KEY is not set')
    process.exit(1)
  }

  const drafts = await query<DraftRow>(
    'SELECT id, youtube_video_id, title FROM videos WHERE is_published = FALSE',
  )

  if (drafts.length === 0) {
    console.log('No drafts found.')
    await pool.end()
    return
  }

  console.log(`Found ${drafts.length} drafts. Fetching durations from YouTube...`)
  const durations = await fetchDurations(
    drafts.map((d) => d.youtube_video_id),
    apiKey,
  )

  const shorts: DraftRow[] = []
  const longs: DraftRow[] = []
  const unknown: DraftRow[] = []

  for (const draft of drafts) {
    const seconds = durations.get(draft.youtube_video_id)
    if (seconds === undefined) {
      unknown.push(draft)
    } else if (seconds > 0 && seconds <= SHORT_VIDEO_MAX_SECONDS) {
      shorts.push(draft)
    } else {
      longs.push(draft)
    }
  }

  console.log(`\n=== Summary ===`)
  console.log(`Shorts (<= ${SHORT_VIDEO_MAX_SECONDS}s): ${shorts.length}`)
  console.log(`Long drafts (kept):                    ${longs.length}`)
  console.log(`Unknown duration (kept):               ${unknown.length}`)

  if (shorts.length > 0) {
    console.log(`\n=== Shorts to delete ===`)
    for (const s of shorts) {
      const seconds = durations.get(s.youtube_video_id) ?? 0
      console.log(`  ${seconds.toString().padStart(3)}s  ${s.youtube_video_id}  ${s.title.slice(0, 60)}`)
    }
  }

  if (!apply) {
    console.log('\nDry-run only. Re-run with --apply to delete the listed Shorts.')
    await pool.end()
    return
  }

  if (shorts.length === 0) {
    console.log('\nNothing to delete.')
    await pool.end()
    return
  }

  const ids = shorts.map((s) => s.id)
  // Skip any draft with member history — its FKs are ON DELETE RESTRICT
  // (migration 0049), and history must survive an admin cleanup anyway.
  const result = await query<{ id: string }>(
    `DELETE FROM videos
      WHERE id = ANY($1::uuid[])
        AND NOT EXISTS (SELECT 1 FROM score_attempts s WHERE s.video_id = videos.id)
        AND NOT EXISTS (SELECT 1 FROM user_badge_unlocks u WHERE u.video_id = videos.id)
      RETURNING id`,
    [ids],
  )
  if (result.length < ids.length) {
    console.log(`Skipped ${ids.length - result.length} draft(s) with member history.`)
  }
  console.log(`\nDeleted ${result.length} short drafts.`)
  await pool.end()
}

main().catch((error) => {
  console.error('delete_short_drafts failed:', error)
  process.exit(1)
})
