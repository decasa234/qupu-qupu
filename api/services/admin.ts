import { query, queryOne } from '../db.js'

export interface BadgeRangeTemplate {
  minCorrect: number
  maxCorrect: number | null
  badgeCount: number
}

export interface AdminSubject {
  id: string
  name: string
  slug: string
  colorHex: string
  description: string | null
  defaultBadgeRanges: BadgeRangeTemplate[]
  videoCount: number
}

export interface AdminAgeGroup {
  id: string
  name: string
  minAge: number
  maxAge: number
  description: string | null
  videoCount: number
}

export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'student' | 'teacher' | 'parent' | 'admin'
  phone: string | null
  isVerified: boolean
  hasPassword: boolean
  hasGoogle: boolean
  createdAt: string
}

function normalizeRanges(input: unknown): BadgeRangeTemplate[] {
  if (!Array.isArray(input)) return []
  return input
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item) => ({
      minCorrect: Number(item.minCorrect ?? 0),
      maxCorrect:
        item.maxCorrect === null || item.maxCorrect === undefined
          ? null
          : Number(item.maxCorrect),
      badgeCount: Number(item.badgeCount ?? 0),
    }))
}

export async function listAdminSubjects(): Promise<AdminSubject[]> {
  const rows = await query<{
    id: string
    name: string
    slug: string
    color_hex: string
    description: string | null
    default_badge_ranges: unknown
    video_count: string
  }>(
    `
      SELECT s.id, s.name, s.slug, s.color_hex, s.description, s.default_badge_ranges,
             COUNT(v.id) AS video_count
      FROM subjects s
      LEFT JOIN videos v ON v.subject_id = s.id
      GROUP BY s.id
      ORDER BY s.name ASC
    `,
  )
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    colorHex: row.color_hex,
    description: row.description,
    defaultBadgeRanges: normalizeRanges(row.default_badge_ranges),
    videoCount: Number(row.video_count),
  }))
}

export async function createAdminSubject(input: {
  name: string
  slug: string
  colorHex: string
  description?: string | null
  defaultBadgeRanges?: BadgeRangeTemplate[]
}): Promise<AdminSubject> {
  const ranges = input.defaultBadgeRanges ?? []
  const row = await queryOne<{
    id: string
    name: string
    slug: string
    color_hex: string
    description: string | null
    default_badge_ranges: unknown
  }>(
    `
      INSERT INTO subjects (name, slug, color_hex, description, default_badge_ranges)
      VALUES ($1, $2, $3, $4, $5::jsonb)
      RETURNING id, name, slug, color_hex, description, default_badge_ranges
    `,
    [input.name, input.slug, input.colorHex, input.description ?? null, JSON.stringify(ranges)],
  )
  if (!row) throw new Error('Failed to create subject')
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    colorHex: row.color_hex,
    description: row.description,
    defaultBadgeRanges: normalizeRanges(row.default_badge_ranges),
    videoCount: 0,
  }
}

export async function updateAdminSubject(
  id: string,
  input: {
    name: string
    slug: string
    colorHex: string
    description?: string | null
    defaultBadgeRanges?: BadgeRangeTemplate[]
  },
): Promise<AdminSubject | null> {
  const ranges = input.defaultBadgeRanges ?? []
  const row = await queryOne<{
    id: string
    name: string
    slug: string
    color_hex: string
    description: string | null
    default_badge_ranges: unknown
  }>(
    `
      UPDATE subjects
      SET name = $2, slug = $3, color_hex = $4, description = $5, default_badge_ranges = $6::jsonb
      WHERE id = $1
      RETURNING id, name, slug, color_hex, description, default_badge_ranges
    `,
    [id, input.name, input.slug, input.colorHex, input.description ?? null, JSON.stringify(ranges)],
  )
  if (!row) return null
  const count = await queryOne<{ c: string }>(
    'SELECT COUNT(*) AS c FROM videos WHERE subject_id = $1',
    [id],
  )
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    colorHex: row.color_hex,
    description: row.description,
    defaultBadgeRanges: normalizeRanges(row.default_badge_ranges),
    videoCount: Number(count?.c ?? 0),
  }
}

export async function deleteAdminSubject(id: string): Promise<boolean> {
  const inUse = await queryOne<{ c: string }>(
    'SELECT COUNT(*) AS c FROM videos WHERE subject_id = $1',
    [id],
  )
  if (Number(inUse?.c ?? 0) > 0) {
    throw new Error('Subject is in use by videos. Reassign or delete those videos first.')
  }
  const row = await queryOne<{ id: string }>(
    'DELETE FROM subjects WHERE id = $1 RETURNING id',
    [id],
  )
  return Boolean(row)
}

export async function listAdminAgeGroups(): Promise<AdminAgeGroup[]> {
  const rows = await query<{
    id: string
    name: string
    min_age: number
    max_age: number
    description: string | null
    video_count: string
  }>(
    `
      SELECT ag.id, ag.name, ag.min_age, ag.max_age, ag.description,
             COUNT(v.id) AS video_count
      FROM age_groups ag
      LEFT JOIN videos v ON v.age_group_id = ag.id
      GROUP BY ag.id
      ORDER BY ag.min_age ASC
    `,
  )
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    minAge: row.min_age,
    maxAge: row.max_age,
    description: row.description,
    videoCount: Number(row.video_count),
  }))
}

export async function createAdminAgeGroup(input: {
  name: string
  minAge: number
  maxAge: number
  description?: string | null
}): Promise<AdminAgeGroup> {
  if (input.minAge >= input.maxAge) {
    throw new Error('Min age must be less than max age')
  }
  const row = await queryOne<{
    id: string
    name: string
    min_age: number
    max_age: number
    description: string | null
  }>(
    `
      INSERT INTO age_groups (name, min_age, max_age, description)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, min_age, max_age, description
    `,
    [input.name, input.minAge, input.maxAge, input.description ?? null],
  )
  if (!row) throw new Error('Failed to create age group')
  return {
    id: row.id,
    name: row.name,
    minAge: row.min_age,
    maxAge: row.max_age,
    description: row.description,
    videoCount: 0,
  }
}

export async function updateAdminAgeGroup(
  id: string,
  input: { name: string; minAge: number; maxAge: number; description?: string | null },
): Promise<AdminAgeGroup | null> {
  if (input.minAge >= input.maxAge) {
    throw new Error('Min age must be less than max age')
  }
  const row = await queryOne<{
    id: string
    name: string
    min_age: number
    max_age: number
    description: string | null
  }>(
    `
      UPDATE age_groups
      SET name = $2, min_age = $3, max_age = $4, description = $5
      WHERE id = $1
      RETURNING id, name, min_age, max_age, description
    `,
    [id, input.name, input.minAge, input.maxAge, input.description ?? null],
  )
  if (!row) return null
  const count = await queryOne<{ c: string }>(
    'SELECT COUNT(*) AS c FROM videos WHERE age_group_id = $1',
    [id],
  )
  return {
    id: row.id,
    name: row.name,
    minAge: row.min_age,
    maxAge: row.max_age,
    description: row.description,
    videoCount: Number(count?.c ?? 0),
  }
}

export async function deleteAdminAgeGroup(id: string): Promise<boolean> {
  const inUse = await queryOne<{ c: string }>(
    'SELECT COUNT(*) AS c FROM videos WHERE age_group_id = $1',
    [id],
  )
  if (Number(inUse?.c ?? 0) > 0) {
    throw new Error('Age group is in use by videos.')
  }
  const row = await queryOne<{ id: string }>(
    'DELETE FROM age_groups WHERE id = $1 RETURNING id',
    [id],
  )
  return Boolean(row)
}

export async function listAdminUsers(search?: string): Promise<AdminUser[]> {
  const params: unknown[] = []
  let where = ''
  if (search) {
    params.push(`%${search}%`)
    where = 'WHERE u.email ILIKE $1 OR u.name ILIKE $1'
  }
  const rows = await query<{
    id: string
    email: string
    name: string
    role: AdminUser['role']
    phone: string | null
    is_verified: boolean
    has_password: boolean
    has_google: boolean
    created_at: string
  }>(
    `
      SELECT
        u.id,
        u.email,
        u.name,
        u.role,
        u.phone,
        u.is_verified,
        (u.password_hash IS NOT NULL) AS has_password,
        (u.google_sub IS NOT NULL) AS has_google,
        u.created_at
      FROM users u
      ${where}
      ORDER BY u.created_at DESC
      LIMIT 200
    `,
    params,
  )
  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    phone: row.phone,
    isVerified: row.is_verified,
    hasPassword: row.has_password,
    hasGoogle: row.has_google,
    createdAt: row.created_at,
  }))
}

export async function updateAdminUserRole(
  id: string,
  role: AdminUser['role'],
): Promise<AdminUser | null> {
  const row = await queryOne<{ id: string }>(
    'UPDATE users SET role = $2, updated_at = NOW() WHERE id = $1 RETURNING id',
    [id, role],
  )
  if (!row) return null
  const list = await listAdminUsers()
  return list.find((u) => u.id === id) ?? null
}

export async function deleteAdminUser(id: string): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    'DELETE FROM users WHERE id = $1 RETURNING id',
    [id],
  )
  return Boolean(row)
}

export async function getAdminDashboardStats() {
  const [counts, recentSignups, recentAttempts, topSubjects] = await Promise.all([
    queryOne<{
      users_total: string
      parents_total: string
      admins_total: string
      videos_total: string
      videos_published: string
      attempts_total: string
      badges_total: string
      children_total: string
    }>(
      `
        SELECT
          (SELECT COUNT(*) FROM users) AS users_total,
          (SELECT COUNT(*) FROM users WHERE role = 'parent') AS parents_total,
          (SELECT COUNT(*) FROM users WHERE role = 'admin') AS admins_total,
          (SELECT COUNT(*) FROM videos) AS videos_total,
          (SELECT COUNT(*) FROM videos WHERE is_published = TRUE) AS videos_published,
          (SELECT COUNT(*) FROM score_attempts) AS attempts_total,
          (SELECT COALESCE(SUM(badge_count), 0) FROM user_badge_unlocks) AS badges_total,
          (SELECT COUNT(*) FROM children) AS children_total
      `,
    ),
    query<{
      id: string
      email: string
      name: string
      role: string
      created_at: string
    }>(
      `
        SELECT id, email, name, role, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT 6
      `,
    ),
    query<{
      id: string
      score_percentage: number
      correct_answers: number
      total_questions: number
      created_at: string
      child_name: string
      video_title: string
      video_slug: string
      subject_name: string
      subject_color_hex: string
    }>(
      `
        SELECT
          sa.id,
          sa.score_percentage,
          sa.correct_answers,
          sa.total_questions,
          sa.created_at,
          c.name AS child_name,
          v.title AS video_title,
          v.slug AS video_slug,
          s.name AS subject_name,
          s.color_hex AS subject_color_hex
        FROM score_attempts sa
        JOIN children c ON c.id = sa.child_id
        JOIN videos v ON v.id = sa.video_id
        JOIN subjects s ON s.id = v.subject_id
        ORDER BY sa.created_at DESC
        LIMIT 8
      `,
    ),
    query<{
      subject_id: string
      subject_name: string
      subject_color_hex: string
      total_badges: string
      total_videos: string
    }>(
      `
        SELECT
          s.id AS subject_id,
          s.name AS subject_name,
          s.color_hex AS subject_color_hex,
          COALESCE(SUM(ubu.badge_count), 0) AS total_badges,
          COUNT(DISTINCT v.id) AS total_videos
        FROM subjects s
        LEFT JOIN videos v ON v.subject_id = s.id
        LEFT JOIN user_badge_unlocks ubu ON ubu.video_id = v.id
        GROUP BY s.id, s.name, s.color_hex
        ORDER BY total_badges DESC
      `,
    ),
  ])

  return {
    counts: {
      usersTotal: Number(counts?.users_total ?? 0),
      parentsTotal: Number(counts?.parents_total ?? 0),
      adminsTotal: Number(counts?.admins_total ?? 0),
      videosTotal: Number(counts?.videos_total ?? 0),
      videosPublished: Number(counts?.videos_published ?? 0),
      attemptsTotal: Number(counts?.attempts_total ?? 0),
      badgesTotal: Number(counts?.badges_total ?? 0),
      childrenTotal: Number(counts?.children_total ?? 0),
    },
    recentSignups: recentSignups.map((row) => ({
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      createdAt: row.created_at,
    })),
    recentAttempts: recentAttempts.map((row) => ({
      id: row.id,
      scorePercentage: Number(row.score_percentage),
      correctAnswers: row.correct_answers,
      totalQuestions: row.total_questions,
      createdAt: row.created_at,
      childName: row.child_name,
      videoTitle: row.video_title,
      videoSlug: row.video_slug,
      subjectName: row.subject_name,
      subjectColorHex: row.subject_color_hex,
    })),
    topSubjects: topSubjects.map((row) => ({
      id: row.subject_id,
      name: row.subject_name,
      colorHex: row.subject_color_hex,
      totalBadges: Number(row.total_badges),
      totalVideos: Number(row.total_videos),
    })),
  }
}
