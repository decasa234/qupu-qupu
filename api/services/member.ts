import type { PoolClient } from 'pg'
import { query, queryOne, withTransaction } from '../db.js'
import {
  processScoreSubmission,
  type ProcessScoreResult,
} from './gamification/index.js'
import { recoverStreak } from './gamification/streakUpdater.js'
import { listAchievementsForChild } from './gamification/achievementEvaluator.js'
import { wibDateString } from '../lib/wib.js'

interface ProgressRow {
  attempts_count: string
  average_score: string | null
  videos_completed: string
  badges_total: string
}

type Predikat = 'SANGAT_BAIK' | 'BAIK' | 'CUKUP' | 'KURANG' | 'BELUM_MULAI'

function computePredikat(videosAttempted: number, averageBestScore: number | null): Predikat {
  if (videosAttempted === 0 || averageBestScore === null) return 'BELUM_MULAI'
  if (averageBestScore >= 85) return 'SANGAT_BAIK'
  if (averageBestScore >= 70) return 'BAIK'
  if (averageBestScore >= 55) return 'CUKUP'
  return 'KURANG'
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

    const existingUnlock = await queryOne<{
      id: string
      badge_count: number
      correct_answers: number
    }>(
      `
        SELECT id, badge_count, correct_answers
        FROM user_badge_unlocks
        WHERE child_id = $1 AND video_id = $2
      `,
      [input.childId, input.videoId],
      client,
    )

    const isCorrection = existingUnlock !== null

    const scorePercentage = Number(
      ((input.correctAnswers / video.number_of_questions) * 100).toFixed(2),
    )

    const attempt = await queryOne<{
      id: string
      created_at: string
    }>(
      `
        INSERT INTO score_attempts
          (child_id, video_id, correct_answers, total_questions, score_percentage, is_correction)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, created_at
      `,
      [
        input.childId,
        input.videoId,
        input.correctAnswers,
        video.number_of_questions,
        scorePercentage,
        isCorrection,
      ],
      client,
    )

    const matchedRange = await queryOne<{
      id: string
      badge_count: number
    }>(
      `
        SELECT id, badge_count
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
    const previousBadgeCount = existingUnlock?.badge_count ?? 0
    const previousCorrectAnswers = existingUnlock?.correct_answers ?? null

    await client.query(
      `
        INSERT INTO user_badge_unlocks
          (child_id, video_id, badge_count, correct_answers, unlocked_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (child_id, video_id)
        DO UPDATE SET
          badge_count = EXCLUDED.badge_count,
          correct_answers = EXCLUDED.correct_answers,
          updated_at = NOW()
      `,
      [input.childId, input.videoId, earnedBadgeCount, input.correctAnswers],
    )

    // Gamification engine — eng review decision E1: same transaction.
    // If this throws, the score insert + badge upsert above roll back too.
    // That's the intended atomicity: kid resubmits cleanly rather than
    // ending up in a state with a score but no reward ledger.
    const gamification: ProcessScoreResult = await processScoreSubmission(
      client,
      {
        childId: input.childId,
        scoreAttemptId: attempt?.id ?? '',
        videoId: video.id,
        videoSubjectId: video.subject_id,
        correctAnswers: input.correctAnswers,
        totalQuestions: video.number_of_questions,
        scorePercentage,
        isCorrection,
        previousCorrectAnswers,
      },
    )

    return {
      attempt: {
        id: attempt?.id ?? '',
        correctAnswers: input.correctAnswers,
        totalQuestions: video.number_of_questions,
        scorePercentage,
        createdAt: attempt?.created_at ?? new Date().toISOString(),
      },
      earnedBadgeCount,
      finalBadgeCount: earnedBadgeCount,
      previousBadgeCount,
      previousCorrectAnswers,
      isCorrection,
      isUpgrade: earnedBadgeCount > previousBadgeCount,
      subject: {
        id: video.subject_id,
        name: video.subject_name,
        slug: video.subject_slug,
        colorHex: video.subject_color_hex,
      },
      gamification: {
        xpEarned: gamification.xpEarned,
        ledgerEntries: gamification.ledgerEntries,
        totalXp: gamification.profile.totalXp,
        currentLevel: gamification.profile.currentLevel,
        currentTierName: gamification.profile.currentTierName,
        levelUp: gamification.levelUp
          ? {
              previousLevel: gamification.levelUp.previousLevel,
              currentLevel: gamification.levelUp.currentLevel,
              currentTierName: gamification.levelUp.tier.tierName,
            }
          : null,
        streak: {
          current: gamification.streak.currentStreakDays,
          longest: gamification.streak.longestStreakDays,
          recoveryEligible: gamification.streak.recoveryEligible,
        },
        completedQuests: gamification.completedQuests,
        unlockedAchievements: gamification.unlockedAchievements,
      },
    }
  })
}

export async function getMemberProgress(parentUserId: string, childId: string) {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, childId)

    const [summary, recentAttempts, videoProgress, child, periodRow] = await Promise.all([
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
        total_questions: number | null
      }>(
        `
          -- best_attempts: latest score_attempts row per video for this child.
          -- Aliased as "best_*" for back-compat with the existing read-mapping.
          WITH best_attempts AS (
            SELECT DISTINCT ON (sa.video_id)
              sa.video_id,
              sa.score_percentage AS best_score,
              sa.correct_answers AS best_correct_answers,
              sa.created_at AS latest_attempt_at
            FROM score_attempts sa
            WHERE sa.child_id = $1
            ORDER BY sa.video_id, sa.created_at DESC
          )
          SELECT
            ba.video_id,
            v.title AS video_title,
            v.slug AS video_slug,
            v.number_of_questions AS total_questions,
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
      queryOne<{ period_start: string }>(
        `
          SELECT COALESCE(MIN(sa.created_at), c.created_at) AS period_start
          FROM children c
          LEFT JOIN score_attempts sa ON sa.child_id = c.id
          WHERE c.id = $1
          GROUP BY c.created_at
        `,
        [childId],
        client,
      ),
    ])

    const subjectStatRows = await query<{
      subject_id: string
      subject_name: string
      subject_slug: string
      subject_color_hex: string
      total_videos_available: string
      videos_attempted: string
      average_best_score: string | null
      badges_earned: string
      badges_available: string
    }>(
      `
        WITH child_age AS (
          SELECT age_group_id FROM children WHERE id = $1
        ),
        available_videos AS (
          SELECT v.id AS video_id, v.subject_id
          FROM videos v, child_age
          WHERE v.is_published = TRUE
            AND (child_age.age_group_id IS NULL OR v.age_group_id = child_age.age_group_id)
        ),
        best_per_video AS (
          SELECT sa.video_id, MAX(sa.score_percentage) AS best_score
          FROM score_attempts sa
          WHERE sa.child_id = $1
          GROUP BY sa.video_id
        ),
        badges_avail_per_subject AS (
          SELECT subject_id, COALESCE(SUM(per_video_max), 0) AS badges_available
          FROM (
            SELECT av.subject_id, av.video_id, COALESCE(MAX(vbr.badge_count), 0) AS per_video_max
            FROM available_videos av
            LEFT JOIN video_badge_rules vbr ON vbr.video_id = av.video_id
            GROUP BY av.subject_id, av.video_id
          ) per_video
          GROUP BY subject_id
        )
        SELECT
          s.id AS subject_id,
          s.name AS subject_name,
          s.slug AS subject_slug,
          s.color_hex AS subject_color_hex,
          COUNT(DISTINCT av.video_id) AS total_videos_available,
          COUNT(DISTINCT bpv.video_id) AS videos_attempted,
          AVG(bpv.best_score) AS average_best_score,
          COALESCE(SUM(ubu.badge_count), 0) AS badges_earned,
          COALESCE(MAX(bas.badges_available), 0) AS badges_available
        FROM subjects s
        LEFT JOIN available_videos av ON av.subject_id = s.id
        LEFT JOIN best_per_video bpv ON bpv.video_id = av.video_id
        LEFT JOIN user_badge_unlocks ubu ON ubu.video_id = av.video_id AND ubu.child_id = $1
        LEFT JOIN badges_avail_per_subject bas ON bas.subject_id = s.id
        -- Only subjects with at least one published, age-matched video.
        -- Mirrors fetchSubjects in dashboard.ts so the report and the
        -- dashboard "Performa" panel list the same subjects.
        WHERE EXISTS (SELECT 1 FROM available_videos av2 WHERE av2.subject_id = s.id)
        GROUP BY s.id, s.name, s.slug, s.color_hex
        -- Same ordering as the dashboard: highest score first, subjects
        -- the child hasn't started last, then alphabetical.
        ORDER BY (AVG(bpv.best_score) IS NULL),
                 AVG(bpv.best_score) DESC NULLS LAST,
                 s.name ASC
      `,
      [childId],
      client,
    )

    const videosBySubjectId = new Map<string, typeof videoProgress>()
    for (const v of videoProgress) {
      const list = videosBySubjectId.get(v.subject_id) ?? []
      list.push(v)
      videosBySubjectId.set(v.subject_id, list)
    }

    const subjectStats = subjectStatRows.map((row) => {
      const videosAttempted = Number(row.videos_attempted)
      const averageBestScore =
        row.average_best_score === null
          ? null
          : Number(Number(row.average_best_score).toFixed(1))
      return {
        id: row.subject_id,
        name: row.subject_name,
        slug: row.subject_slug,
        colorHex: row.subject_color_hex,
        totalVideosAvailable: Number(row.total_videos_available),
        videosAttempted,
        averageBestScore,
        badgesEarned: Number(row.badges_earned),
        badgesAvailable: Number(row.badges_available),
        predikat: computePredikat(videosAttempted, averageBestScore),
        videos: (videosBySubjectId.get(row.subject_id) ?? []).map((v) => ({
          videoId: v.video_id,
          videoSlug: v.video_slug,
          videoTitle: v.video_title,
          bestScore: Number(v.best_score),
          bestCorrectAnswers: v.best_correct_answers,
          totalQuestions: v.total_questions ?? 0,
          badgeCount: Number(v.badge_count ?? 0),
          latestAttemptAt: v.latest_attempt_at,
        })),
      }
    })

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
      child: child
        ? {
            id: child.id,
            name: child.name,
            ageGroupId: child.age_group_id,
            avatarColor: child.avatar_color,
          }
        : null,
      subjectStats,
      periodStart: periodRow?.period_start ?? new Date().toISOString(),
      periodEnd: new Date().toISOString(),
    }
  })
}

export async function useStreakRecoveryForChild(
  parentUserId: string,
  childId: string,
) {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, childId)
    const today = wibDateString(new Date())
    const result = await recoverStreak(client, childId, today)
    return result
  })
}

export async function getMemberAchievements(
  parentUserId: string,
  childId: string,
) {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, childId)
    const achievements = await listAchievementsForChild(client, childId)
    return { achievements }
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
        WITH child_age AS (
          SELECT age_group_id FROM children WHERE id = $1
        ),
        available_videos AS (
          SELECT v.id AS video_id, v.subject_id
          FROM videos v, child_age
          WHERE v.is_published = TRUE
            AND (child_age.age_group_id IS NULL OR v.age_group_id = child_age.age_group_id)
        ),
        per_video_max AS (
          SELECT av.subject_id, av.video_id, COALESCE(MAX(vbr.badge_count), 0) AS badges
          FROM available_videos av
          LEFT JOIN video_badge_rules vbr ON vbr.video_id = av.video_id
          GROUP BY av.subject_id, av.video_id
        ),
        badges_avail_per_subject AS (
          SELECT subject_id, COALESCE(SUM(badges), 0) AS badges_available
          FROM per_video_max
          GROUP BY subject_id
        )
        SELECT
          s.id AS subject_id,
          s.name AS subject_name,
          s.slug AS subject_slug,
          s.color_hex AS subject_color_hex,
          s.description AS subject_description,
          COALESCE(bas.badges_available, 0) AS total_badges
        FROM subjects s
        LEFT JOIN badges_avail_per_subject bas ON bas.subject_id = s.id
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
          ubu.correct_answers AS best_correct_answers,
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

export async function getMemberVideoScore(
  parentUserId: string,
  childId: string,
  videoId: string,
) {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, childId)

    const row = await queryOne<{
      correct_answers: number
      badge_count: number
      total_questions: number
      score_percentage: number
      latest_attempt_at: string
    }>(
      `
        SELECT
          ubu.correct_answers,
          ubu.badge_count,
          v.number_of_questions AS total_questions,
          ROUND((ubu.correct_answers::NUMERIC / v.number_of_questions) * 100, 2) AS score_percentage,
          ubu.updated_at AS latest_attempt_at
        FROM user_badge_unlocks ubu
        JOIN videos v ON v.id = ubu.video_id
        WHERE ubu.child_id = $1 AND ubu.video_id = $2
      `,
      [childId, videoId],
      client,
    )

    if (!row) return null

    return {
      correctAnswers: row.correct_answers,
      totalQuestions: row.total_questions,
      badgeCount: row.badge_count,
      scorePercentage: Number(row.score_percentage),
      latestAttemptAt: row.latest_attempt_at,
    }
  })
}
