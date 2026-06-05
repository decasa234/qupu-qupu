import type { PoolClient } from 'pg'
import { query, queryOne, withTransaction, type DbExecutor } from '../db.js'
import { buildYouTubeEmbed, buildYouTubeThumbnail, extractYouTubeVideoId, slugify } from '../lib/youtube.js'

interface VideoRow {
  id: string
  slug: string
  title: string
  description: string | null
  youtube_url: string
  youtube_video_id: string
  thumbnail_url: string | null
  // Drafts (is_published=false) may have NULL number_of_questions, subject_id,
  // and age_group_id. The publish-time CHECK constraint guarantees they're
  // populated whenever is_published=true.
  number_of_questions: number | null
  difficulty: 'easy' | 'medium' | 'hard'
  is_published: boolean
  is_featured: boolean
  sort_order: number
  published_at: string | null
  created_at: string
  updated_at: string
  subject_id: string | null
  subject_name: string | null
  subject_slug: string | null
  subject_color_hex: string | null
  age_group_id: string | null
  age_group_name: string | null
}

interface BadgeRangeRow {
  id: string
  video_id: string
  min_correct: number
  max_correct: number | null
  badge_count: number
}

interface VideoInput {
  title: string
  slug?: string
  youtubeUrl: string
  thumbnailUrl?: string
  // Required when isPublished is true; may be null/undefined for drafts.
  subjectId?: string | null
  ageGroupId?: string | null
  numberOfQuestions?: number | null
  difficulty: 'easy' | 'medium' | 'hard'
  description?: string
  isPublished?: boolean
  isFeatured?: boolean
  sortOrder?: number
  // Real YouTube upload time (snippet.publishedAt). Bulk/single import threads
  // this through; the admin form does not expose it (UPDATE leaves the column
  // untouched). Backfill via db/scripts/backfill_youtube_published_at.ts.
  publishedAt?: string | null
  badgeRanges?: Array<{
    minCorrect: number
    maxCorrect: number | null
    badgeCount: number
  }>
}

const VIDEO_SELECT = `
  SELECT
    v.id,
    v.slug,
    v.title,
    v.description,
    v.youtube_url,
    v.youtube_video_id,
    v.thumbnail_url,
    v.number_of_questions,
    v.difficulty,
    v.is_published,
    v.is_featured,
    v.sort_order,
    v.published_at,
    v.created_at,
    v.updated_at,
    s.id AS subject_id,
    s.name AS subject_name,
    s.slug AS subject_slug,
    s.color_hex AS subject_color_hex,
    ag.id AS age_group_id,
    ag.name AS age_group_name
  FROM videos v
  LEFT JOIN subjects s ON s.id = v.subject_id
  LEFT JOIN age_groups ag ON ag.id = v.age_group_id
`

function mapVideoCard(row: VideoRow) {
  const subject =
    row.subject_id && row.subject_name && row.subject_slug && row.subject_color_hex
      ? {
          id: row.subject_id,
          name: row.subject_name,
          slug: row.subject_slug,
          colorHex: row.subject_color_hex,
        }
      : null
  const ageGroup =
    row.age_group_id && row.age_group_name
      ? { id: row.age_group_id, name: row.age_group_name }
      : null
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    youtubeUrl: row.youtube_url,
    youtubeVideoId: row.youtube_video_id,
    thumbnailUrl: row.thumbnail_url ?? buildYouTubeThumbnail(row.youtube_video_id),
    numberOfQuestions: row.number_of_questions,
    difficulty: row.difficulty,
    isFeatured: row.is_featured,
    isPublished: row.is_published,
    sortOrder: row.sort_order,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    subject,
    ageGroup,
  }
}

function mapVideoDetail(row: VideoRow, badgeRanges: BadgeRangeRow[]) {
  return {
    ...mapVideoCard(row),
    embedUrl: buildYouTubeEmbed(row.youtube_video_id),
    badgeRanges: [...badgeRanges]
      .sort((a, b) => a.min_correct - b.min_correct)
      .map((range) => ({
        id: range.id,
        minCorrect: range.min_correct,
        maxCorrect: range.max_correct,
        badgeCount: range.badge_count,
      })),
  }
}

export async function listMeta(executor?: DbExecutor) {
  const [subjects, ageGroups] = await Promise.all([
    query<{
      id: string
      name: string
      slug: string
      color_hex: string
      description: string | null
      default_badge_ranges: unknown
    }>(
      'SELECT id, name, slug, color_hex, description, default_badge_ranges FROM subjects ORDER BY name',
      [],
      executor,
    ),
    query<{ id: string; name: string; min_age: number; max_age: number }>(
      'SELECT id, name, min_age, max_age FROM age_groups ORDER BY min_age',
      [],
      executor,
    ),
  ])

  return {
    subjects: subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      slug: subject.slug,
      colorHex: subject.color_hex,
      description: subject.description,
      defaultBadgeRanges: Array.isArray(subject.default_badge_ranges)
        ? (subject.default_badge_ranges as Array<{
            minCorrect: number
            maxCorrect: number | null
            badgeCount: number
          }>)
        : [],
    })),
    ageGroups: ageGroups.map((group) => ({
      id: group.id,
      name: group.name,
      minAge: group.min_age,
      maxAge: group.max_age,
    })),
  }
}

export async function listPublicVideos(options: {
  search?: string
  subject?: string
  featured?: boolean
  page?: number
  pageSize?: number
} = {}) {
  const conditions = ['v.is_published = TRUE']
  const params: unknown[] = []

  if (options.search) {
    const extractedId = extractYouTubeVideoId(options.search)

    params.push(`%${options.search}%`)
    const ilikeIndex = params.length

    if (extractedId) {
      params.push(extractedId)
      const idIndex = params.length
      conditions.push(
        `(v.title ILIKE $${ilikeIndex} OR v.description ILIKE $${ilikeIndex} OR v.youtube_video_id = $${idIndex} OR v.youtube_url ILIKE $${ilikeIndex})`,
      )
    } else {
      conditions.push(
        `(v.title ILIKE $${ilikeIndex} OR v.description ILIKE $${ilikeIndex} OR v.youtube_video_id ILIKE $${ilikeIndex} OR v.youtube_url ILIKE $${ilikeIndex})`,
      )
    }
  }

  if (options.subject) {
    params.push(options.subject)
    conditions.push(`s.slug = $${params.length}`)
  }

  if (options.featured) {
    conditions.push('v.is_featured = TRUE')
  }

  const whereClause = conditions.join(' AND ')

  // Paginate when an explicit page is requested. Callers that omit page/pageSize
  // (legacy, e.g. featured-only queries) still get the unpaginated array shape.
  if (options.page !== undefined || options.pageSize !== undefined) {
    const pageSize = Math.max(1, Math.min(100, options.pageSize ?? 12))
    const page = Math.max(1, options.page ?? 1)
    const offset = (page - 1) * pageSize

    const totalRow = await queryOne<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM videos v LEFT JOIN subjects s ON s.id = v.subject_id WHERE ${whereClause}`,
      params,
    )
    const total = Number(totalRow?.count ?? 0)
    const pageCount = Math.max(1, Math.ceil(total / pageSize))

    const paginatedParams = [...params, pageSize, offset]
    const rows = await query<VideoRow>(
      `
        ${VIDEO_SELECT}
        WHERE ${whereClause}
        ORDER BY v.is_featured DESC, v.sort_order ASC, v.published_at DESC NULLS LAST, v.created_at DESC
        LIMIT $${paginatedParams.length - 1} OFFSET $${paginatedParams.length}
      `,
      paginatedParams,
    )

    return {
      items: rows.map(mapVideoCard),
      page,
      pageSize,
      pageCount,
      total,
    }
  }

  const rows = await query<VideoRow>(
    `
      ${VIDEO_SELECT}
      WHERE ${whereClause}
      ORDER BY v.is_featured DESC, v.sort_order ASC, v.published_at DESC NULLS LAST, v.created_at DESC
    `,
    params,
  )

  return rows.map(mapVideoCard)
}

async function getVideoBadgeRanges(videoId: string, executor?: DbExecutor) {
  return query<BadgeRangeRow>(
    `
      SELECT id, video_id, min_correct, max_correct, badge_count
      FROM video_badge_rules
      WHERE video_id = $1
      ORDER BY min_correct ASC
    `,
    [videoId],
    executor,
  )
}

export async function getPublicVideoBySlug(slug: string) {
  const row = await queryOne<VideoRow>(
    `
      ${VIDEO_SELECT}
      WHERE v.slug = $1 AND v.is_published = TRUE
    `,
    [slug],
  )

  if (!row) return null

  const badgeRanges = await getVideoBadgeRanges(row.id)

  return mapVideoDetail(row, badgeRanges)
}

export async function listAdminVideos() {
  const rows = await query<VideoRow>(
    `
      ${VIDEO_SELECT}
      WHERE v.deleted_at IS NULL
      ORDER BY v.updated_at DESC
    `,
  )

  const ranges = await query<BadgeRangeRow>(
    `
      SELECT id, video_id, min_correct, max_correct, badge_count
      FROM video_badge_rules
      ORDER BY min_correct ASC
    `,
  )

  const groupedRanges = ranges.reduce<Record<string, BadgeRangeRow[]>>((accumulator, range) => {
    accumulator[range.video_id] = accumulator[range.video_id] ?? []
    accumulator[range.video_id].push(range)
    return accumulator
  }, {})

  return rows.map((row) => mapVideoDetail(row, groupedRanges[row.id] ?? []))
}

async function getAdminVideoById(videoId: string, executor: DbExecutor) {
  const row = await queryOne<VideoRow>(
    `
      ${VIDEO_SELECT}
      WHERE v.id = $1 AND v.deleted_at IS NULL
    `,
    [videoId],
    executor,
  )

  if (!row) {
    return null
  }

  const ranges = await getVideoBadgeRanges(videoId, executor)

  return mapVideoDetail(row, ranges)
}

function normalizeVideoInput(input: VideoInput) {
  const youtubeVideoId = extractYouTubeVideoId(input.youtubeUrl)

  if (!youtubeVideoId) {
    throw new Error('Invalid YouTube URL')
  }

  const slug = slugify(input.slug?.trim() || input.title) || youtubeVideoId.toLowerCase()
  const isPublished = input.isPublished ?? true
  const badgeRanges = [...(input.badgeRanges ?? [])].sort((a, b) => a.minCorrect - b.minCorrect)

  // Draft mode: only YouTube-derived fields are validated. The publish-time
  // CHECK constraint and the publish branch below enforce the full invariant
  // when isPublished flips to true.
  if (!isPublished) {
    return {
      ...input,
      slug,
      youtubeVideoId,
      thumbnailUrl: input.thumbnailUrl?.trim() || buildYouTubeThumbnail(youtubeVideoId),
      isPublished: false,
      subjectId: input.subjectId ?? null,
      ageGroupId: input.ageGroupId ?? null,
      numberOfQuestions: input.numberOfQuestions ?? null,
      badgeRanges,
    }
  }

  // Publish mode: full validation. QUPU-fields and badge ranges must be
  // populated and consistent.
  if (!input.subjectId) {
    throw new Error('Subject is required to publish a video')
  }
  if (!input.ageGroupId) {
    throw new Error('Age group is required to publish a video')
  }
  if (!input.numberOfQuestions || input.numberOfQuestions <= 0) {
    throw new Error('Number of questions is required to publish a video')
  }

  const numberOfQuestions = input.numberOfQuestions

  if (badgeRanges.length === 0) {
    throw new Error('At least one badge range is required')
  }

  for (let index = 0; index < badgeRanges.length; index += 1) {
    const range = badgeRanges[index]

    if (range.minCorrect < 0) {
      throw new Error('Badge range minimum cannot be negative')
    }

    if (range.minCorrect > numberOfQuestions) {
      throw new Error('Badge range minimum cannot exceed the question count')
    }

    if (range.maxCorrect !== null && range.maxCorrect < range.minCorrect) {
      throw new Error('Badge range max cannot be less than min')
    }

    if (range.maxCorrect !== null && range.maxCorrect > numberOfQuestions) {
      throw new Error('Badge range maximum cannot exceed the question count')
    }

    if (range.badgeCount < 0) {
      throw new Error('Badge count cannot be negative')
    }

    if (index > 0) {
      const previous = badgeRanges[index - 1]
      const previousMax = previous.maxCorrect ?? numberOfQuestions

      if (range.minCorrect <= previousMax) {
        throw new Error('Badge ranges must not overlap')
      }
    }
  }

  return {
    ...input,
    slug,
    youtubeVideoId,
    thumbnailUrl: input.thumbnailUrl?.trim() || buildYouTubeThumbnail(youtubeVideoId),
    isPublished: true,
    subjectId: input.subjectId,
    ageGroupId: input.ageGroupId,
    numberOfQuestions,
    badgeRanges,
  }
}

async function syncVideoBadgeRanges(
  client: PoolClient,
  videoId: string,
  badgeRanges: NonNullable<VideoInput['badgeRanges']>,
) {
  await client.query('DELETE FROM video_badge_rules WHERE video_id = $1', [videoId])

  for (const range of badgeRanges) {
    await client.query(
      `
        INSERT INTO video_badge_rules (video_id, min_correct, max_correct, badge_count)
        VALUES ($1, $2, $3, $4)
      `,
      [videoId, range.minCorrect, range.maxCorrect, range.badgeCount],
    )
  }
}

export async function createVideo(input: VideoInput) {
  const normalized = normalizeVideoInput(input)

  return withTransaction(async (client) => {
    const video = await queryOne<{ id: string }>(
      `
        INSERT INTO videos (
          title,
          slug,
          description,
          youtube_url,
          youtube_video_id,
          thumbnail_url,
          subject_id,
          age_group_id,
          number_of_questions,
          difficulty,
          is_published,
          is_featured,
          sort_order,
          published_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id
      `,
      [
        normalized.title,
        normalized.slug,
        normalized.description ?? null,
        normalized.youtubeUrl,
        normalized.youtubeVideoId,
        normalized.thumbnailUrl,
        normalized.subjectId ?? null,
        normalized.ageGroupId ?? null,
        normalized.numberOfQuestions ?? null,
        normalized.difficulty,
        normalized.isPublished,
        normalized.isFeatured ?? false,
        normalized.sortOrder ?? 0,
        normalized.publishedAt ?? null,
      ],
      client,
    )

    if (!video) {
      throw new Error('Failed to create video')
    }

    await syncVideoBadgeRanges(client, video.id, normalized.badgeRanges)

    return getAdminVideoById(video.id, client)
  })
}

export async function updateVideo(videoId: string, input: VideoInput) {
  const normalized = normalizeVideoInput(input)

  return withTransaction(async (client) => {
    const existing = await queryOne<{ id: string; is_published: boolean }>(
      'SELECT id, is_published FROM videos WHERE id = $1',
      [videoId],
      client,
    )

    if (!existing) {
      return null
    }

    await client.query(
      `
        UPDATE videos
        SET
          title = $2,
          slug = $3,
          description = $4,
          youtube_url = $5,
          youtube_video_id = $6,
          thumbnail_url = $7,
          subject_id = $8,
          age_group_id = $9,
          number_of_questions = $10,
          difficulty = $11,
          is_published = $12,
          is_featured = $13,
          sort_order = $14,
          updated_at = NOW()
        WHERE id = $1
      `,
      [
        videoId,
        normalized.title,
        normalized.slug,
        normalized.description ?? null,
        normalized.youtubeUrl,
        normalized.youtubeVideoId,
        normalized.thumbnailUrl,
        normalized.subjectId ?? null,
        normalized.ageGroupId ?? null,
        normalized.numberOfQuestions ?? null,
        normalized.difficulty,
        normalized.isPublished,
        normalized.isFeatured ?? false,
        normalized.sortOrder ?? 0,
      ],
    )

    await syncVideoBadgeRanges(client, videoId, normalized.badgeRanges)

    return getAdminVideoById(videoId, client)
  })
}

// Soft delete: mark the row removed and unpublish it. The youtube_video_id
// stays on record so the channel importer's "already imported" check still
// sees it and the video never resurfaces in the import picker. Earned badges
// and scores are preserved (the row is not removed). For a true hard delete
// (e.g. stale-video purge), use deleteVideosByIds in services/staleVideos.ts.
export async function deleteVideo(videoId: string) {
  const deleted = await queryOne<{ id: string }>(
    `UPDATE videos
     SET deleted_at = NOW(), is_published = false, updated_at = NOW()
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING id`,
    [videoId],
  )

  return Boolean(deleted)
}
