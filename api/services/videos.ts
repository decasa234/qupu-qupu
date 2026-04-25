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
  number_of_questions: number
  difficulty: 'easy' | 'medium' | 'hard'
  is_published: boolean
  is_featured: boolean
  sort_order: number
  published_at: string | null
  created_at: string
  updated_at: string
  subject_id: string
  subject_name: string
  subject_color_hex: string
  age_group_id: string
  age_group_name: string
  badge_family_id: string
  badge_family_name: string
  badge_family_slug: string
  badge_family_color_hex: string
  badge_family_description: string | null
}

interface BadgeRuleRow {
  video_id: string
  badge_tier_id: string
  tier_number: number
  tier_name: string
  tier_color_hex: string
  tier_icon_name: string
  min_correct: number
  max_correct: number | null
}

interface VideoInput {
  title: string
  slug?: string
  youtubeUrl: string
  thumbnailUrl?: string
  subjectId: string
  ageGroupId: string
  badgeFamilyId: string
  numberOfQuestions: number
  difficulty: 'easy' | 'medium' | 'hard'
  description?: string
  isPublished?: boolean
  isFeatured?: boolean
  sortOrder?: number
  badgeRules: Array<{
    tier: number
    minCorrect: number
    maxCorrect: number | null
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
    s.color_hex AS subject_color_hex,
    ag.id AS age_group_id,
    ag.name AS age_group_name,
    bf.id AS badge_family_id,
    bf.name AS badge_family_name,
    bf.slug AS badge_family_slug,
    bf.color_hex AS badge_family_color_hex,
    bf.description AS badge_family_description
  FROM videos v
  JOIN subjects s ON s.id = v.subject_id
  JOIN age_groups ag ON ag.id = v.age_group_id
  JOIN badge_families bf ON bf.id = v.badge_family_id
`

function mapVideoCard(row: VideoRow) {
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
    subject: {
      id: row.subject_id,
      name: row.subject_name,
      colorHex: row.subject_color_hex,
    },
    ageGroup: {
      id: row.age_group_id,
      name: row.age_group_name,
    },
    badgeFamily: {
      id: row.badge_family_id,
      name: row.badge_family_name,
      slug: row.badge_family_slug,
      colorHex: row.badge_family_color_hex,
      description: row.badge_family_description,
    },
  }
}

function mapVideoDetail(row: VideoRow, badgeRules: BadgeRuleRow[]) {
  return {
    ...mapVideoCard(row),
    embedUrl: buildYouTubeEmbed(row.youtube_video_id),
    badgeRules: badgeRules
      .sort((left, right) => left.tier_number - right.tier_number)
      .map((rule) => ({
        badgeTierId: rule.badge_tier_id,
        tier: rule.tier_number,
        name: rule.tier_name,
        iconName: rule.tier_icon_name,
        colorHex: rule.tier_color_hex,
        minCorrect: rule.min_correct,
        maxCorrect: rule.max_correct,
      })),
  }
}

export async function listMeta(executor?: DbExecutor) {
  const [subjects, ageGroups, badgeFamilies] = await Promise.all([
    query<{ id: string; name: string; color_hex: string }>(
      'SELECT id, name, color_hex FROM subjects ORDER BY name',
      [],
      executor,
    ),
    query<{ id: string; name: string; min_age: number; max_age: number }>(
      'SELECT id, name, min_age, max_age FROM age_groups ORDER BY min_age',
      [],
      executor,
    ),
    query<{ id: string; name: string; slug: string; color_hex: string; description: string | null }>(
      'SELECT id, name, slug, color_hex, description FROM badge_families ORDER BY name',
      [],
      executor,
    ),
  ])

  return {
    subjects: subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      colorHex: subject.color_hex,
    })),
    ageGroups: ageGroups.map((group) => ({
      id: group.id,
      name: group.name,
      minAge: group.min_age,
      maxAge: group.max_age,
    })),
    badgeFamilies: badgeFamilies.map((family) => ({
      id: family.id,
      name: family.name,
      slug: family.slug,
      colorHex: family.color_hex,
      description: family.description,
    })),
  }
}

export async function listPublicVideos(options: {
  search?: string
  subject?: string
  featured?: boolean
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

  const rows = await query<VideoRow>(
    `
      ${VIDEO_SELECT}
      WHERE ${conditions.join(' AND ')}
      ORDER BY v.is_featured DESC, v.sort_order ASC, v.published_at DESC NULLS LAST, v.created_at DESC
    `,
    params,
  )

  return rows.map(mapVideoCard)
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

  const badgeRules = await query<BadgeRuleRow>(
    `
      SELECT
        vbr.video_id,
        bt.id AS badge_tier_id,
        bt.tier AS tier_number,
        bt.name AS tier_name,
        bt.color_hex AS tier_color_hex,
        bt.icon_name AS tier_icon_name,
        vbr.min_correct,
        vbr.max_correct
      FROM video_badge_rules vbr
      JOIN badge_tiers bt ON bt.id = vbr.badge_tier_id
      WHERE vbr.video_id = $1
      ORDER BY bt.tier ASC
    `,
    [row.id],
  )

  return mapVideoDetail(row, badgeRules)
}

export async function listAdminVideos() {
  const rows = await query<VideoRow>(
    `
      ${VIDEO_SELECT}
      ORDER BY v.updated_at DESC
    `,
  )

  const rules = await query<BadgeRuleRow>(
    `
      SELECT
        vbr.video_id,
        bt.id AS badge_tier_id,
        bt.tier AS tier_number,
        bt.name AS tier_name,
        bt.color_hex AS tier_color_hex,
        bt.icon_name AS tier_icon_name,
        vbr.min_correct,
        vbr.max_correct
      FROM video_badge_rules vbr
      JOIN badge_tiers bt ON bt.id = vbr.badge_tier_id
      ORDER BY bt.tier ASC
    `,
  )

  const groupedRules = rules.reduce<Record<string, BadgeRuleRow[]>>((accumulator, rule) => {
    accumulator[rule.video_id] = accumulator[rule.video_id] ?? []
    accumulator[rule.video_id].push(rule)
    return accumulator
  }, {})

  return rows.map((row) => mapVideoDetail(row, groupedRules[row.id] ?? []))
}

async function getAdminVideoById(videoId: string, executor: DbExecutor) {
  const row = await queryOne<VideoRow>(
    `
      ${VIDEO_SELECT}
      WHERE v.id = $1
    `,
    [videoId],
    executor,
  )

  if (!row) {
    return null
  }

  const rules = await query<BadgeRuleRow>(
    `
      SELECT
        vbr.video_id,
        bt.id AS badge_tier_id,
        bt.tier AS tier_number,
        bt.name AS tier_name,
        bt.color_hex AS tier_color_hex,
        bt.icon_name AS tier_icon_name,
        vbr.min_correct,
        vbr.max_correct
      FROM video_badge_rules vbr
      JOIN badge_tiers bt ON bt.id = vbr.badge_tier_id
      WHERE vbr.video_id = $1
      ORDER BY bt.tier ASC
    `,
    [videoId],
    executor,
  )

  return mapVideoDetail(row, rules)
}

function normalizeVideoInput(input: VideoInput) {
  const youtubeVideoId = extractYouTubeVideoId(input.youtubeUrl)

  if (!youtubeVideoId) {
    throw new Error('Invalid YouTube URL')
  }

  const slug = slugify(input.slug?.trim() || input.title)
  const badgeRules = [...input.badgeRules].sort((left, right) => left.tier - right.tier)

  if (badgeRules.length !== 3) {
    throw new Error('Exactly three badge rules are required')
  }

  for (let index = 0; index < badgeRules.length; index += 1) {
    const rule = badgeRules[index]

    if (rule.minCorrect < 0) {
      throw new Error('Badge rule minimum cannot be negative')
    }

    if (rule.maxCorrect !== null && rule.maxCorrect < rule.minCorrect) {
      throw new Error('Badge rule range is invalid')
    }

    if (rule.maxCorrect !== null && rule.maxCorrect > input.numberOfQuestions) {
      throw new Error('Badge rule maximum cannot exceed the question count')
    }

    if (index > 0) {
      const previous = badgeRules[index - 1]
      const previousMax = previous.maxCorrect ?? input.numberOfQuestions

      if (rule.minCorrect <= previousMax) {
        throw new Error('Badge rule ranges must not overlap')
      }
    }
  }

  return {
    ...input,
    slug,
    youtubeVideoId,
    thumbnailUrl: input.thumbnailUrl?.trim() || buildYouTubeThumbnail(youtubeVideoId),
    badgeRules,
  }
}

async function syncVideoBadgeRules(
  client: PoolClient,
  videoId: string,
  badgeFamilyId: string,
  badgeRules: VideoInput['badgeRules'],
) {
  await client.query('DELETE FROM video_badge_rules WHERE video_id = $1', [videoId])

  for (const rule of badgeRules) {
    const badgeTier = await queryOne<{ id: string }>(
      `
        SELECT id
        FROM badge_tiers
        WHERE family_id = $1 AND tier = $2
      `,
      [badgeFamilyId, rule.tier],
      client,
    )

    if (!badgeTier) {
      throw new Error(`Badge tier ${rule.tier} does not exist for this family`)
    }

    await client.query(
      `
        INSERT INTO video_badge_rules (video_id, badge_tier_id, min_correct, max_correct)
        VALUES ($1, $2, $3, $4)
      `,
      [videoId, badgeTier.id, rule.minCorrect, rule.maxCorrect],
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
          badge_family_id,
          number_of_questions,
          difficulty,
          is_published,
          is_featured,
          sort_order,
          published_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CASE WHEN $12 THEN NOW() ELSE NULL END)
        RETURNING id
      `,
      [
        normalized.title,
        normalized.slug,
        normalized.description ?? null,
        normalized.youtubeUrl,
        normalized.youtubeVideoId,
        normalized.thumbnailUrl,
        normalized.subjectId,
        normalized.ageGroupId,
        normalized.badgeFamilyId,
        normalized.numberOfQuestions,
        normalized.difficulty,
        normalized.isPublished ?? true,
        normalized.isFeatured ?? false,
        normalized.sortOrder ?? 0,
      ],
      client,
    )

    if (!video) {
      throw new Error('Failed to create video')
    }

    await syncVideoBadgeRules(client, video.id, normalized.badgeFamilyId, normalized.badgeRules)

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
          badge_family_id = $10,
          number_of_questions = $11,
          difficulty = $12,
          is_published = $13,
          is_featured = $14,
          sort_order = $15,
          published_at = CASE
            WHEN $13 = TRUE AND published_at IS NULL THEN NOW()
            WHEN $13 = FALSE THEN NULL
            ELSE published_at
          END,
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
        normalized.subjectId,
        normalized.ageGroupId,
        normalized.badgeFamilyId,
        normalized.numberOfQuestions,
        normalized.difficulty,
        normalized.isPublished ?? true,
        normalized.isFeatured ?? false,
        normalized.sortOrder ?? 0,
      ],
    )

    await syncVideoBadgeRules(client, videoId, normalized.badgeFamilyId, normalized.badgeRules)

    return getAdminVideoById(videoId, client)
  })
}

export async function deleteVideo(videoId: string) {
  const deleted = await queryOne<{ id: string }>(
    'DELETE FROM videos WHERE id = $1 RETURNING id',
    [videoId],
  )

  return Boolean(deleted)
}
