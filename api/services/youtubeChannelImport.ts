import { query } from '../db.js'
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

const TITLE_MAX = 200
const DESCRIPTION_MAX = 2000

interface BadgeRangeJson {
  minCorrect: number
  maxCorrect: number | null
  badgeCount: number
}

interface PrefillRule {
  pattern: RegExp
  subjectSlug: string
  ageGroupName: string
  numberOfQuestions: number
}

// Order matters: aljabar must be checked before matematika because aljabar
// titles often contain "Kuis Matematika" in parentheses.
//
// Slugs and age-group names below match the live DB exactly — keep them in
// sync with `db/scripts/prefill_existing_drafts.sql`. The seed.sql values
// are stale (they use `-i` suffixes and a shorter age-group name).
const PREFILL_RULES: PrefillRule[] = [
  {
    pattern: /beda/i,
    subjectSlug: 'odd-one-out',
    ageGroupName: 'Semua Usia',
    numberOfQuestions: 60,
  },
  {
    pattern: /aljabar/i,
    subjectSlug: 'aljabar-1',
    ageGroupName: 'Usia 5-8 ( TK-2SD )',
    numberOfQuestions: 30,
  },
  {
    pattern: /matematika/i,
    subjectSlug: 'matematika-1',
    ageGroupName: 'Usia 5-8 ( TK-2SD )',
    numberOfQuestions: 20,
  },
]

interface PrefillContext {
  subjectsBySlug: Map<string, { id: string; defaultBadgeRanges: BadgeRangeJson[] }>
  ageGroupsByName: Map<string, string>
}

interface ResolvedPrefill {
  subjectId: string
  ageGroupId: string
  numberOfQuestions: number
  badgeRanges: BadgeRangeJson[]
}

async function loadPrefillContext(): Promise<PrefillContext> {
  const [subjects, ageGroups] = await Promise.all([
    query<{ id: string; slug: string; default_badge_ranges: unknown }>(
      'SELECT id, slug, default_badge_ranges FROM subjects',
    ),
    query<{ id: string; name: string }>('SELECT id, name FROM age_groups'),
  ])

  const subjectsBySlug = new Map<string, { id: string; defaultBadgeRanges: BadgeRangeJson[] }>()
  for (const subject of subjects) {
    subjectsBySlug.set(subject.slug, {
      id: subject.id,
      defaultBadgeRanges: Array.isArray(subject.default_badge_ranges)
        ? (subject.default_badge_ranges as BadgeRangeJson[])
        : [],
    })
  }

  // Key by trimmed name: some age-group rows carry stray trailing whitespace
  // (e.g. "Semua Usia "), which would otherwise break the exact-match lookup.
  const ageGroupsByName = new Map<string, string>()
  for (const ageGroup of ageGroups) {
    ageGroupsByName.set(ageGroup.name.trim(), ageGroup.id)
  }

  return { subjectsBySlug, ageGroupsByName }
}

function resolvePrefill(title: string, context: PrefillContext): ResolvedPrefill | null {
  for (const rule of PREFILL_RULES) {
    if (!rule.pattern.test(title)) continue
    const subject = context.subjectsBySlug.get(rule.subjectSlug.trim())
    const ageGroupId = context.ageGroupsByName.get(rule.ageGroupName.trim())
    if (!subject || !ageGroupId) {
      console.warn(
        `Prefill skipped for "${title}" — missing subject "${rule.subjectSlug}" or age group "${rule.ageGroupName}" in DB`,
      )
      return null
    }
    return {
      subjectId: subject.id,
      ageGroupId,
      numberOfQuestions: rule.numberOfQuestions,
      badgeRanges: subject.defaultBadgeRanges,
    }
  }
  return null
}

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
