/**
 * One-off cleanup: delete every catalog video whose YouTube source is gone
 * (deleted or made private — videos.list omits its ID). HARD delete: the videos
 * FK cascade also removes the linked video_badge_rules, score_attempts, and
 * user_badge_unlocks, so members lose the scores + badges tied to these videos.
 *
 * Usage (npx is fine; the direct binary path avoids shell-hook rewrites):
 *   ./node_modules/.bin/tsx api/scripts/delete_stale_videos.ts          # dry-run
 *   ./node_modules/.bin/tsx api/scripts/delete_stale_videos.ts --apply  # delete
 *
 * Requires DATABASE_URL and YOUTUBE_API_KEY in env (loaded via dotenv).
 */
import { pool } from '../db.js'
import { deleteVideosByIds, findStaleVideos } from '../services/staleVideos.js'

async function main() {
  const apply = process.argv.includes('--apply')

  const stale = await findStaleVideos()

  if (stale.length === 0) {
    console.log('No stale videos — every catalog video is still live on YouTube.')
    await pool.end()
    return
  }

  let totalScores = 0
  let totalBadges = 0
  console.log(`\n=== ${stale.length} stale video(s) (gone from YouTube) ===`)
  for (const video of stale) {
    totalScores += video.scoreAttempts
    totalBadges += video.badgeUnlocks
    const flags = [
      video.isPublished ? 'PUBLISHED' : 'draft',
      `${video.scoreAttempts} scores`,
      `${video.badgeUnlocks} badges`,
    ].join(' · ')
    console.log(`  ${video.youtubeVideoId}  [${flags}]  ${video.title.slice(0, 60)}`)
  }
  console.log(
    `\nCascade impact if deleted: ${totalScores} score attempt(s) + ${totalBadges} earned badge(s) removed.`,
  )

  if (!apply) {
    console.log('\nDry-run only. Re-run with --apply to hard-delete the listed videos.')
    await pool.end()
    return
  }

  const deleted = await deleteVideosByIds(stale.map((video) => video.id))
  console.log(`\nDeleted ${deleted} stale video(s).`)
  await pool.end()
}

main().catch((error) => {
  console.error('delete_stale_videos failed:', error)
  process.exit(1)
})
