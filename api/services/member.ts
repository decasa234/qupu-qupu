import type { PoolClient } from 'pg'
import { query, queryOne, withTransaction } from '../db.js'

interface ProgressRow {
  attempts_count: string
  average_score: string | null
  videos_completed: string
  badges_total: string
}

async function assertChildOwnership(
  executor: PoolClient,
  parentUserId: string,
  childId: string,
): Promise<void> {
  const owned = await queryOne<{ id: string }>(
    'SELECT id FROM children WHERE id = $1 AND parent_user_id = $2',
    [childId, parentUserId],
    executor,
  )

  if (!owned) {
    throw new Error('Child not found')
  }
}

export async function submitVideoScore(input: {
  userId: string
  childId: string
  videoId: string
  correctAnswers: number
}) {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, input.userId, input.childId)

    const video = await queryOne<{
      id: string
      title: string
      number_of_questions: number
      subject_id: string
      subject_name: string
      subject_slug: string
      subject_color_hex: string
    }>(
      `
        SELECT
          v.id,
          v.title,
          v.number_of_questions,
          s.id AS subject_id,
          s.name AS subject_name,
          s.slug AS subject_slug,
          s.color_hex AS subject_color_hex
        FROM videos v
        JOIN subjects s ON s.id = v.subject_id
        WHERE v.id = $1 AND v.is_published = TRUE
      `,
      [input.videoId],
      client,
    )

    if (!video) {
      throw new Error('Video not found')
    }

    if (input.correctAnswers < 0 || input.correctAnswers > video.number_of_questions) {
      throw new Error(`Correct answers must be between 0 and ${video.number_of_questions}`)
    }

    const scorePercentage = Number(
      ((input.correctAnswers / video.number_of_questions) * 100).toFixed(2),
    )

    const attempt = await queryOne<{
      id: string
      created_at: string
    }>(
      `
        INSERT INTO score_attempts (child_id, video_id, correct_answers, total_questions, score_percentage)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, created_at
      `,
      [input.childId, input.videoId, input.correctAnswers, video.number_of_questions, scorePercentage],
      client,
    )

    const matchedRange = await queryOne<{
      id: string
      badge_count: number
      min_correct: number
      max_correct: number | null
    }>(
      `
        SELECT id, badge_count, min_correct, max_correct
        FROM video_badge_rules
        WHERE video_id = $1
          AND $2 >= min_correct
          AND (max_correct IS NULL OR $2 <= max_correct)
        ORDER BY badge_count DESC
        LIMIT 1
      `,
      [input.videoId, input.correctAnswers],
      client,
    )

    const earnedBadgeCount = matchedRange?.badge_count ?? 0

    const existingUnlock = await queryOne<{
      id: string
      badge_count: number
      best_correct_answers: number
    }>(
      `
        SELECT id, badge_count, best_correct_answers
        FROM user_badge_unlocks
        WHERE child_id = $1 AND video_id = $2
      `,
      [input.childId, input.videoId],
      client,
    )

    const previousBadgeCount = existingUnlock?.badge_count ?? 0
    const isUpgrade = earnedBadgeCount > previousBadgeCount
    const finalBadgeCount = Math.max(earnedBadgeCount, previousBadgeCount)

    if (isUpgrade || !existingUnlock) {
      await client.query(
        `
          INSERT INTO user_badge_unlocks (child_id, video_id, badge_count, best_correct_answers, unlocked_at, updated_at)
          VALUES ($1, $2, $3, $4, NOW(), NOW())
          ON CONFLICT (child_id, video_id)
          DO UPDATE
          SET
            badge_count = GREATEST(user_badge_unlocks.badge_count, EXCLUDED.badge_count),
            best_correct_answers = GREATEST(user_badge_unlocks.best_correct_answers, EXCLUDED.best_correct_answers),
            updated_at = NOW()
        `,
        [input.childId, input.videoId, earnedBadgeCount, input.correctAnswers],
      )
    }

    return {
      attempt: {
        id: attempt?.id ?? '',
        correctAnswers: input.correctAnswers,
        totalQuestions: video.number_of_questions,
        scorePercentage,
        createdAt: attempt?.created_at ?? new Date().toISOString(),
      },
      earnedBadgeCount,
      finalBadgeCount,
      previousBadgeCount,
      isUpgrade,
      subject: {
        id: video.subject_id,
        name: video.subject_name,
        slug: video.subject_slug,
        colorHex: video.subject_color_hex,
      },
    }
  })
}

export async function getMemberProgress(parentUserId: string, childId: string) {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, childId)

    const [summary, recentAttempts, videoProgress, child] = await Promise.all([
      queryOne<ProgressRow>(
        `
          SELECT
            (SELECT COUNT(*) FROM score_attempts sa WHERE sa.child_id = $1) AS attempts_count,
            (SELECT COALESCE(AVG(sa.score_percentage), 0) FROM score_attempts sa WHERE sa.child_id = $1) AS average_score,
            (SELECT COUNT(DISTINCT sa.video_id) FROM score_attempts sa WHERE sa.child_id = $1) AS videos_completed,
            (SELECT COALESCE(SUM(ubu.badge_count), 0) FROM user_badge_unlocks ubu WHERE ubu.child_id = $1) AS badges_total
        `,
        [childId],
        client,
      ),
      query<{
        id: string
        score_percentage: number
        correct_answers: number
        total_questions: number
        created_at: string
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
            v.title AS video_title,
            v.slug AS video_slug,
            s.name AS subject_name,
            s.color_hex AS subject_color_hex
          FROM score_attempts sa
          JOIN videos v ON v.id = sa.video_id
          JOIN subjects s ON s.id = v.subject_id
          WHERE sa.child_id = $1
          ORDER BY sa.created_at DESC
          LIMIT 6
        `,
        [childId],
        client,
      ),
      query<{
        video_id: string
        video_title: string
        video_slug: string
        best_score: number
        best_correct_answers: number
        badge_count: number | null
        subject_id: string
        subject_name: string
        subject_color_hex: string
        latest_attempt_at: string
      }>(
        `
          WITH best_attempts AS (
            SELECT DISTINCT ON (sa.video_id)
              sa.video_id,
              sa.score_percentage AS best_score,
              sa.correct_answers AS best_correct_answers,
              sa.created_at AS latest_attempt_at
            FROM score_attempts sa
            WHERE sa.child_id = $1
            ORDER BY sa.video_id, sa.score_percentage DESC, sa.correct_answers DESC, sa.created_at DESC
          )
          SELECT
            ba.video_id,
            v.title AS video_title,
            v.slug AS video_slug,
            ba.best_score,
            ba.best_correct_answers,
            ubu.badge_count,
            s.id AS subject_id,
            s.name AS subject_name,
            s.color_hex AS subject_color_hex,
            ba.latest_attempt_at
          FROM best_attempts ba
          JOIN videos v ON v.id = ba.video_id
          JOIN subjects s ON s.id = v.subject_id
          LEFT JOIN user_badge_unlocks ubu ON ubu.child_id = $1 AND ubu.video_id = ba.video_id
          ORDER BY ba.latest_attempt_at DESC
        `,
        [childId],
        client,
      ),
      queryOne<{
        id: string
        name: string
        age_group_id: string | null
        avatar_color: string | null
      }>(
        'SELECT id, name, age_group_id, avatar_color FROM children WHERE id = $1',
        [childId],
        client,
      ),
    ])

    const subjectTotals = await query<{
      subject_id: string
      subject_name: string
      subject_slug: string
      subject_color_hex: string
      total_badges: string
      videos_with_badges: string
    }>(
      `
        SELECT
          s.id AS subject_id,
          s.name AS subject_name,
          s.slug AS subject_slug,
          s.color_hex AS subject_color_hex,
          COALESCE(SUM(ubu.badge_count), 0) AS total_badges,
          COUNT(DISTINCT CASE WHEN ubu.badge_count > 0 THEN ubu.video_id END) AS videos_with_badges
        FROM subjects s
        LEFT JOIN videos v ON v.subject_id = s.id
        LEFT JOIN user_badge_unlocks ubu ON ubu.video_id = v.id AND ubu.child_id = $1
        GROUP BY s.id, s.name, s.slug, s.color_hex
        ORDER BY s.name ASC
      `,
      [childId],
      client,
    )

    return {
      summary: {
        attemptsCount: Number(summary?.attempts_count ?? 0),
        averageScore: Number(Number(summary?.average_score ?? 0).toFixed(1)),
        videosCompleted: Number(summary?.videos_completed ?? 0),
        badgesTotal: Number(summary?.badges_total ?? 0),
      },
      recentAttempts: recentAttempts.map((attempt) => ({
        id: attempt.id,
        scorePercentage: Number(attempt.score_percentage),
        correctAnswers: attempt.correct_answers,
        totalQuestions: attempt.total_questions,
        createdAt: attempt.created_at,
        videoTitle: attempt.video_title,
        videoSlug: attempt.video_slug,
        subjectName: attempt.subject_name,
        subjectColorHex: attempt.subject_color_hex,
      })),
      videoProgress: videoProgress.map((item) => ({
        videoId: item.video_id,
        videoTitle: item.video_title,
        videoSlug: item.video_slug,
        bestScore: Number(item.best_score),
        bestCorrectAnswers: item.best_correct_answers,
        badgeCount: Number(item.badge_count ?? 0),
        latestAttemptAt: item.latest_attempt_at,
        subject: {
          id: item.subject_id,
          name: item.subject_name,
          colorHex: item.subject_color_hex,
        },
      })),
      subjectTotals: subjectTotals.map((item) => ({
        id: item.subject_id,
        name: item.subject_name,
        slug: item.subject_slug,
        colorHex: item.subject_color_hex,
        totalBadges: Number(item.total_badges),
        videosWithBadges: Number(item.videos_with_badges),
      })),
      child: child
        ? {
            id: child.id,
            name: child.name,
            ageGroupId: child.age_group_id,
            avatarColor: child.avatar_color,
          }
        : null,
    }
  })
}

export async function getMemberBadges(parentUserId: string, childId: string) {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, childId)

    const subjectRows = await query<{
      subject_id: string
      subject_name: string
      subject_slug: string
      subject_color_hex: string
      subject_description: string | null
      total_badges: string
    }>(
      `
        SELECT
          s.id AS subject_id,
          s.name AS subject_name,
          s.slug AS subject_slug,
          s.color_hex AS subject_color_hex,
          s.description AS subject_description,
          COALESCE(SUM(ubu.badge_count), 0) AS total_badges
        FROM subjects s
        LEFT JOIN videos v ON v.subject_id = s.id
        LEFT JOIN user_badge_unlocks ubu ON ubu.video_id = v.id AND ubu.child_id = $1
        GROUP BY s.id, s.name, s.slug, s.color_hex, s.description
        ORDER BY s.name ASC
      `,
      [childId],
      client,
    )

    const unlockRows = await query<{
      video_id: string
      video_title: string
      video_slug: string
      subject_id: string
      badge_count: number
      best_correct_answers: number
      total_questions: number
      unlocked_at: string
    }>(
      `
        SELECT
          ubu.video_id,
          v.title AS video_title,
          v.slug AS video_slug,
          v.subject_id,
          ubu.badge_count,
          ubu.best_correct_answers,
          v.number_of_questions AS total_questions,
          ubu.unlocked_at
        FROM user_badge_unlocks ubu
        JOIN videos v ON v.id = ubu.video_id
        WHERE ubu.child_id = $1 AND ubu.badge_count > 0
        ORDER BY ubu.unlocked_at DESC
      `,
      [childId],
      client,
    )

    const groupedUnlocks = unlockRows.reduce<
      Record<
        string,
        Array<{
          videoId: string
          videoTitle: string
          videoSlug: string
          badgeCount: number
          bestCorrectAnswers: number
          totalQuestions: number
          unlockedAt: string
        }>
      >
    >((accumulator, row) => {
      accumulator[row.subject_id] = accumulator[row.subject_id] ?? []
      accumulator[row.subject_id].push({
        videoId: row.video_id,
        videoTitle: row.video_title,
        videoSlug: row.video_slug,
        badgeCount: row.badge_count,
        bestCorrectAnswers: row.best_correct_answers,
        totalQuestions: row.total_questions,
        unlockedAt: row.unlocked_at,
      })
      return accumulator
    }, {})

    return subjectRows.map((subject) => ({
      id: subject.subject_id,
      name: subject.subject_name,
      slug: subject.subject_slug,
      colorHex: subject.subject_color_hex,
      description: subject.subject_description,
      totalBadges: Number(subject.total_badges),
      unlocks: groupedUnlocks[subject.subject_id] ?? [],
    }))
  })
}
