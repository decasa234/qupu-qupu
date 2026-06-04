import { createVideo } from './videos.js'
import { fetchYouTubeMetadata } from './youtubeImport.js'
import {
  SHORT_VIDEO_MAX_SECONDS,
  buildYouTubeThumbnail,
  buildYouTubeWatchUrl,
  sanitizeYouTubeText,
  slugifyForBulk,
  validateHttpsThumbnailUrl,
} from '../lib/youtube.js'
import {
  invalidateChannelListingCache,
  resolveUploadsPlaylistId,
} from './youtubeChannel.js'
import {
  loadPrefillContext,
  resolvePrefill,
  type PrefillContext,
  type ResolvedPrefill,
} from './draftPrefill.js'

const TITLE_MAX = 200
const DESCRIPTION_MAX = 2000

export type ImportStatus = 'created' | 'already_imported' | 'error'

export interface ImportResult {
  youtubeVideoId: string
  status: ImportStatus
  videoId?: string
  error?: ImportErrorCode
}

export type ImportErrorCode =
  | 'youtube_not_found'
  | 'youtube_unavailable'
  | 'quota_exceeded'
  | 'slug_conflict'
  | 'short_video'
  | 'import_failed'

interface PgError {
  code?: string
  constraint?: string
  message?: string
}

function mapToErrorCode(error: unknown): ImportErrorCode {
  if (!(error instanceof Error)) return 'import_failed'
  const msg = error.message.toLowerCase()
  if (msg.includes('not found') || msg.includes('unlisted') || msg.includes('private')) {
    return 'youtube_not_found'
  }
  if (msg.includes('youtube api error: 403') || msg.includes('quota')) {
    return 'quota_exceeded'
  }
  if (msg.includes('youtube api error') || msg.includes('youtube_unavailable')) {
    return 'youtube_unavailable'
  }
  return 'import_failed'
}

function buildDraftPayload(
  id: string,
  metadata: Awaited<ReturnType<typeof fetchYouTubeMetadata>>,
  slug: string,
  prefill: ResolvedPrefill | null,
) {
  const sanitizedTitle = sanitizeYouTubeText(metadata.title, TITLE_MAX) || metadata.title.slice(0, TITLE_MAX)
  const sanitizedDescription = sanitizeYouTubeText(metadata.description, DESCRIPTION_MAX)
  let thumbnailUrl = buildYouTubeThumbnail(id)
  try {
    thumbnailUrl = validateHttpsThumbnailUrl(metadata.thumbnailUrl)
  } catch {
    // Fall through to the constructed YouTube CDN thumbnail.
  }
  return {
    title: sanitizedTitle,
    slug,
    youtubeUrl: buildYouTubeWatchUrl(id),
    thumbnailUrl,
    subjectId: prefill?.subjectId ?? null,
    ageGroupId: prefill?.ageGroupId ?? null,
    numberOfQuestions: prefill?.numberOfQuestions ?? null,
    difficulty: 'medium' as const,
    description: sanitizedDescription,
    isPublished: false,
    isFeatured: false,
    sortOrder: 0,
    publishedAt: metadata.publishedAt,
    badgeRanges: prefill?.badgeRanges ?? [],
  }
}

async function importOne(id: string, context: PrefillContext): Promise<ImportResult> {
  let metadata: Awaited<ReturnType<typeof fetchYouTubeMetadata>>
  try {
    metadata = await fetchYouTubeMetadata(id)
  } catch (error) {
    return { youtubeVideoId: id, status: 'error', error: mapToErrorCode(error) }
  }

  // Defense in depth: the picker already filters Shorts at the channel
  // listing layer, but a stale cache or direct API call could still target
  // one. Reject before writing anything to the DB. durationSeconds === 0 is
  // a sentinel for "could not parse" — let those through rather than
  // blocking imports on a YouTube API quirk.
  if (metadata.durationSeconds > 0 && metadata.durationSeconds <= SHORT_VIDEO_MAX_SECONDS) {
    return { youtubeVideoId: id, status: 'error', error: 'short_video' }
  }

  const slugs = slugifyForBulk(metadata.title || id, id)
  const prefill = resolvePrefill(metadata.title, context)

  try {
    const created = await createVideo(buildDraftPayload(id, metadata, slugs.base, prefill))
    return { youtubeVideoId: id, status: 'created', videoId: created?.id }
  } catch (error) {
    const pgError = error as PgError
    if (pgError.code === '23505') {
      if (pgError.constraint === 'videos_youtube_video_id_unique') {
        return { youtubeVideoId: id, status: 'already_imported' }
      }
      if (pgError.constraint === 'videos_slug_key') {
        // Slug collision — retry once in a fresh transaction with the
        // youtube_video_id-suffixed slug. Postgres aborts the original
        // transaction on 23505, so the retry must call createVideo again.
        try {
          const created = await createVideo(
            buildDraftPayload(id, metadata, slugs.withSuffix, prefill),
          )
          return { youtubeVideoId: id, status: 'created', videoId: created?.id }
        } catch (retryError) {
          const retryPg = retryError as PgError
          if (retryPg.code === '23505' && retryPg.constraint === 'videos_youtube_video_id_unique') {
            return { youtubeVideoId: id, status: 'already_imported' }
          }
          if (retryPg.code === '23505') {
            return { youtubeVideoId: id, status: 'error', error: 'slug_conflict' }
          }
          console.error('Bulk import retry failed:', retryError)
          return { youtubeVideoId: id, status: 'error', error: 'import_failed' }
        }
      }
    }
    console.error('Bulk import row failed:', error)
    return { youtubeVideoId: id, status: 'error', error: mapToErrorCode(error) }
  }
}

/**
 * Best-effort import: each video gets its own transaction (via createVideo's
 * own withTransaction) so a failure on one row does not poison the rest.
 *
 * On any structurally valid request the channel listing cache is evicted at
 * the end so the picker reflects the new alreadyImported state on next page
 * load — eviction is a single DELETE that all serverless instances see.
 */
export async function bulkImportAsDrafts(youtubeVideoIds: string[]): Promise<ImportResult[]> {
  const context = await loadPrefillContext()
  const results: ImportResult[] = []
  for (const id of youtubeVideoIds) {
    results.push(await importOne(id, context))
  }

  try {
    const playlistId = await resolveUploadsPlaylistId()
    await invalidateChannelListingCache(playlistId)
  } catch (error) {
    // Cache eviction is best-effort; if it fails the next listing request
    // will simply serve up-to-10-minute-stale annotations, which the DB
    // UNIQUE constraint still prevents from causing actual duplicates.
    console.error('Cache invalidation after bulk import failed:', error)
  }

  return results
}
