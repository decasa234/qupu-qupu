/**
 * One-off backfill: set videos.published_at to the real YouTube upload time
 * (snippet.publishedAt) for every row that has a youtube_video_id.
 *
 * Before this script existed, published_at was set to NOW() at the moment the
 * admin flipped is_published. New imports now write the YouTube time directly,
 * but legacy rows still hold the website-publish moment. This script overwrites
 * those values with the YouTube truth so dashboards and the landing-page
 * "Video Terbaru" timestamps reflect actual upload date.
 *
 * Usage:
 *   npx tsx api/scripts/backfill_youtube_published_at.ts          # dry-run
 *   npx tsx api/scripts/backfill_youtube_published_at.ts --apply  # actually update
 *
 * Requires DATABASE_URL and YOUTUBE_API_KEY in env (loaded via dotenv).
 */
import { pool, query } from '../db.js'

interface VideoRow {
  id: string
  youtube_video_id: string
  title: string
  published_at: string | null
}

interface YouTubeApiItem {
  id: string
  snippet?: { publishedAt?: string }
}

async function fetchPublishedAt(ids: string[], apiKey: string): Promise<Map<string, string>> {
  const result = new Map<string, string>()
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50)
    const url =
      `https://www.googleapis.com/youtube/v3/videos?id=${encodeURIComponent(batch.join(','))}` +
      `&part=snippet&key=${encodeURIComponent(apiKey)}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`)
    }
    const body = (await response.json()) as { items?: YouTubeApiItem[] }
    for (const item of body.items ?? []) {
      const publishedAt = item.snippet?.publishedAt
      if (publishedAt) result.set(item.id, publishedAt)
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

  const videos = await query<VideoRow>(
    'SELECT id, youtube_video_id, title, published_at FROM videos WHERE youtube_video_id IS NOT NULL',
  )

  if (videos.length === 0) {
    console.log('No videos found.')
    await pool.end()
    return
  }

  console.log(`Found ${videos.length} videos. Fetching publishedAt from YouTube...`)
  const publishedMap = await fetchPublishedAt(
    videos.map((v) => v.youtube_video_id),
    apiKey,
  )

  const updates: Array<{ row: VideoRow; newPublishedAt: string }> = []
  const unchanged: VideoRow[] = []
  const missing: VideoRow[] = []

  for (const row of videos) {
    const fresh = publishedMap.get(row.youtube_video_id)
    if (!fresh) {
      missing.push(row)
      continue
    }
    if (row.published_at && new Date(row.published_at).toISOString() === new Date(fresh).toISOString()) {
      unchanged.push(row)
      continue
    }
    updates.push({ row, newPublishedAt: fresh })
  }

  console.log(`\n=== Summary ===`)
  console.log(`Already correct:           ${unchanged.length}`)
  console.log(`Will update:               ${updates.length}`)
  console.log(`Missing on YouTube (skip): ${missing.length}`)

  if (updates.length > 0) {
    console.log(`\n=== Updates (first 20) ===`)
    for (const { row, newPublishedAt } of updates.slice(0, 20)) {
      const oldStr = row.published_at ? new Date(row.published_at).toISOString().slice(0, 10) : 'NULL'
      const newStr = new Date(newPublishedAt).toISOString().slice(0, 10)
      console.log(`  ${oldStr} → ${newStr}  ${row.youtube_video_id}  ${row.title.slice(0, 50)}`)
    }
    if (updates.length > 20) console.log(`  ... and ${updates.length - 20} more`)
  }

  if (!apply) {
    console.log('\nDry-run only. Re-run with --apply to write the changes.')
    await pool.end()
    return
  }

  if (updates.length === 0) {
    console.log('\nNothing to update.')
    await pool.end()
    return
  }

  let updated = 0
  for (const { row, newPublishedAt } of updates) {
    await query('UPDATE videos SET published_at = $1 WHERE id = $2', [newPublishedAt, row.id])
    updated += 1
  }
  console.log(`\nUpdated ${updated} videos.`)
  await pool.end()
}

main().catch((error) => {
  console.error('backfill_youtube_published_at failed:', error)
  process.exit(1)
})
