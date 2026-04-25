import type { PoolClient } from 'pg'
import { query, queryOne, withTransaction } from '../db.js'

interface ProgressRow {
  attempts_count: string
  average_score: string | null
  videos_completed: string
  badges_unlocked: string
  upgraded_count: string
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
      badge_family_id: string
      badge_family_name: string
    }>(
      `
        SELECT
          v.id,
          v.title,
          v.number_of_questions,
          bf.id AS badge_family_id,
          bf.name AS badge_family_name
        FROM videos v
        JOIN badge_families bf ON bf.id = v.badge_family_id
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

    const matchedRule = await queryOne<{
      badge_tier_id: string
      tier: number
      tier_name: string
      tier_color_hex: string
      tier_icon_name: string
      min_correct: number
      max_correct: number | null
    }>(
      `
        SELECT
          bt.id AS badge_tier_id,
          bt.tier,
          bt.name AS tier_name,
          bt.color_hex AS tier_color_hex,
          bt.icon_name AS tier_icon_name,
          vbr.min_correct,
          vbr.max_correct
        FROM video_badge_rules vbr
        JOIN badge_tiers bt ON bt.id = vbr.badge_tier_id
        WHERE vbr.video_id = $1
          AND $2 >= vbr.min_correct
          AND (vbr.max_correct IS NULL OR $2 <= vbr.max_correct)
        ORDER BY bt.tier DESC
        LIMIT 1
      `,
      [input.videoId, input.correctAnswers],
      client,
    )

    const existingUnlock = await queryOne<{
      id: string
      badge_tier_id: string
      current_tier: number
    }>(
      `
        SELECT
          ubu.id,
          ubu.badge_tier_id,
          bt.tier AS current_tier
        FROM user_badge_unlocks ubu
        JOIN badge_tiers bt ON bt.id = ubu.badge_tier_id
        WHERE ubu.child_id = $1 AND ubu.video_id = $2
      `,
      [input.childId, input.videoId],
      client,
    )

    let isUpgrade = false
    let unlockedBadge: null | {
      familyId: string
      familyName: string
      tier: number
      tierName: string
      colorHex: string
      iconName: string
    } = null

    if (matchedRule) {
      const shouldUpsert = !existingUnlock || matchedRule.tier > existingUnlock.current_tier

      if (shouldUpsert) {
        await upsertBadgeUnlock(client, {
          childId: input.childId,
          videoId: input.videoId,
          badgeFamilyId: video.badge_family_id,
          badgeTierId: matchedRule.badge_tier_id,
          correctAnswers: input.correctAnswers,
        })
        isUpgrade = existingUnlock !== null
      }

      unlockedBadge = {
        familyId: video.badge_family_id,
        familyName: video.badge_family_name,
        tier: matchedRule.tier,
        tierName: matchedRule.tier_name,
        colorHex: matchedRule.tier_color_hex,
        iconName: matchedRule.tier_icon_name,
      }
    }

    return {
      attempt: {
        id: attempt?.id ?? '',
        correctAnswers: input.correctAnswers,
        totalQuestions: video.number_of_questions,
        scorePercentage,
        createdAt: attempt?.created_at ?? new Date().toISOString(),
      },
      unlockedBadge,
      isUpgrade,
    }
  })
}

async function upsertBadgeUnlock(
  client: PoolClient,
  input: {
    childId: string
    videoId: string
    badgeFamilyId: string
    badgeTierId: string
    correctAnswers: number
  },
) {
  await client.query(
    `
      INSERT INTO user_badge_unlocks (
        child_id,
        video_id,
        badge_family_id,
        badge_tier_id,
        best_correct_answers,
        unlocked_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (child_id, video_id)
      DO UPDATE
      SET
        badge_tier_id = EXCLUDED.badge_tier_id,
        badge_family_id = EXCLUDED.badge_family_id,
        best_correct_answers = GREATEST(user_badge_unlocks.best_correct_answers, EXCLUDED.best_correct_answers),
        updated_at = NOW()
    `,
    [
      input.childId,
      input.videoId,
      input.badgeFamilyId,
      input.badgeTierId,
      input.correctAnswers,
    ],
  )
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
            (SELECT COUNT(*) FROM user_badge_unlocks ubu WHERE ubu.child_id = $1) AS badges_unlocked,
            (
              SELECT COUNT(*)
              FROM user_badge_unlocks ubu
              JOIN badge_tiers bt ON bt.id = ubu.badge_tier_id
              WHERE ubu.child_id = $1 AND bt.tier = 3
            ) AS upgraded_count
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
        tier: number | null
        tier_name: string | null
        tier_color_hex: string | null
        family_name: string | null
        family_color_hex: string | null
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
            bt.tier,
            bt.name AS tier_name,
            bt.color_hex AS tier_color_hex,
            bf.name AS family_name,
            bf.color_hex AS family_color_hex,
            ba.latest_attempt_at
          FROM best_attempts ba
          JOIN videos v ON v.id = ba.video_id
          LEFT JOIN user_badge_unlocks ubu ON ubu.child_id = $1 AND ubu.video_id = ba.video_id
          LEFT JOIN badge_tiers bt ON bt.id = ubu.badge_tier_id
          LEFT JOIN badge_families bf ON bf.id = ubu.badge_family_id
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

    return {
      summary: {
        attemptsCount: Number(summary?.attempts_count ?? 0),
        averageScore: Number(Number(summary?.average_score ?? 0).toFixed(1)),
        videosCompleted: Number(summary?.videos_completed ?? 0),
        badgesUnlocked: Number(summary?.badges_unlocked ?? 0),
        tierThreeUnlocks: Number(summary?.upgraded_count ?? 0),
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
        latestAttemptAt: item.latest_attempt_at,
        unlockedTier: item.tier
          ? {
              tier: item.tier,
              name: item.tier_name,
              colorHex: item.tier_color_hex,
              familyName: item.family_name,
              familyColorHex: item.family_color_hex,
            }
          : null,
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

    const badges = await query<{
      video_id: string
      video_title: string
      video_slug: string
      badge_family_id: string
      badge_family_name: string
      badge_family_slug: string
      badge_family_color_hex: string
      badge_tier_id: string
      badge_tier_name: string
      badge_tier_color_hex: string
      badge_tier_icon_name: string
      badge_tier_number: number
      unlocked_at: string
    }>(
      `
        SELECT
          ubu.video_id,
          v.title AS video_title,
          v.slug AS video_slug,
          bf.id AS badge_family_id,
          bf.name AS badge_family_name,
          bf.slug AS badge_family_slug,
          bf.color_hex AS badge_family_color_hex,
          bt.id AS badge_tier_id,
          bt.name AS badge_tier_name,
          bt.color_hex AS badge_tier_color_hex,
          bt.icon_name AS badge_tier_icon_name,
          bt.tier AS badge_tier_number,
          ubu.unlocked_at
        FROM user_badge_unlocks ubu
        JOIN videos v ON v.id = ubu.video_id
        JOIN badge_families bf ON bf.id = ubu.badge_family_id
        JOIN badge_tiers bt ON bt.id = ubu.badge_tier_id
        WHERE ubu.child_id = $1
        ORDER BY bf.name ASC, bt.tier DESC, ubu.unlocked_at DESC
      `,
      [childId],
      client,
    )

    type BadgeFamilyGroup = {
      id: string
      name: string
      slug: string
      colorHex: string
      unlocks: Array<{
        videoId: string
        videoTitle: string
        videoSlug: string
        tierId: string
        tier: number
        tierName: string
        colorHex: string
        iconName: string
        unlockedAt: string
      }>
    }

    const grouped = badges.reduce<Record<string, BadgeFamilyGroup>>((accumulator, badge) => {
      const key = badge.badge_family_id
      if (!accumulator[key]) {
        accumulator[key] = {
          id: badge.badge_family_id,
          name: badge.badge_family_name,
          slug: badge.badge_family_slug,
          colorHex: badge.badge_family_color_hex,
          unlocks: [],
        }
      }

      accumulator[key].unlocks.push({
        videoId: badge.video_id,
        videoTitle: badge.video_title,
        videoSlug: badge.video_slug,
        tierId: badge.badge_tier_id,
        tier: badge.badge_tier_number,
        tierName: badge.badge_tier_name,
        colorHex: badge.badge_tier_color_hex,
        iconName: badge.badge_tier_icon_name,
        unlockedAt: badge.unlocked_at,
      })

      return accumulator
    }, {})

    return Object.values(grouped)
  })
}
