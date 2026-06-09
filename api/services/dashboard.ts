// api/services/dashboard.ts
//
// Parent-dashboard read service. Derives the full dashboard payload from
// existing tables — score_attempts, user_badge_unlocks, videos, subjects,
// video_badge_rules, children. No new tables, no new columns.
//
// All queries run inside one withTransaction so they share a snapshot.
// All day boundaries are in Asia/Jakarta (WIB, UTC+7, no DST). "Today" is
// the current WIB calendar day; "period" is the trailing 7 WIB days;
// "previous period" is the 7 WIB days before that; the heatmap shows 28
// WIB days ending today. Postgres-side day-bucketing uses
// `AT TIME ZONE 'Asia/Jakarta'`; the JS-side boundary helper is
// `dateOnlyWib()`.

import type { PoolClient } from 'pg'
import { query, queryOne, withTransaction } from '../db.js'
import { ensureDailyQuests, type ActiveQuest } from './gamification/questGenerator.js'
import { loadLevelTiers, resolveLevel } from './gamification/levelCurve.js'
import { hasClaimedLoginBonus, LOGIN_BONUS_COINS } from './gamification/loginBonus.js'
import { fetchScreenTimeMinutes } from './sessionEvents.js'

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

export type PeerComparison = 'above' | 'avg' | 'below'
export type AttemptAction = 'review' | 'celebrate' | 'continue'

// Internal ranking label — picks which video to surface per slot.
// Not exposed in the payload; the catalog-style card doesn't show it.
type RecommendedSlot = 'weakest' | 'strongest' | 'middle'

export interface DashboardKpi {
  key: 'attempts' | 'score' | 'videos' | 'badges'
  value: string
  numericValue: number
  trend: number       // signed; for percent metrics that's percentage-points,
                      // for count metrics it's absolute delta
  trendUnit: '%' | 'video' | 'baru'
  sparkline: number[] // 7 daily values
}

export interface DashboardSubject {
  id: string
  name: string
  colorHex: string
  started: boolean       // false when the child has never attempted this subject
  score: number          // 0-100, current period
  trend: number          // signed % vs previous period
  peer: PeerComparison
  mastery: number        // 0-100
  badgesEarned: number   // total badges the child earned in this subject
  subtopics: Array<{ name: string; score: number }>
}

export interface DashboardAttempt {
  id: string
  subjectName: string
  subjectColorHex: string
  videoTitle: string
  videoSlug: string
  whenLabel: string
  score: number
  action: AttemptAction
}

export interface DashboardRecommendation {
  id: string
  title: string
  subjectName: string
  subjectColorHex: string
  thumbnailUrl: string
  publishedAt: string | null
  videoSlug: string
}

export interface DashboardBadge {
  id: string
  name: string
  description: string
  colorHex: string
  icon: string
  earned: boolean
}

export interface DashboardQuest {
  id: string
  code: string
  title: string
  description: string
  questType: string
  progressValue: number
  targetValue: number
  status: 'active' | 'completed' | 'claimed' | 'expired'
  xpReward: number
  coinReward: number   // surfaced from quest_templates.coin_reward
}

export interface DashboardPayload {
  child: { id: string; name: string; ageLabel: string | null }
  level: number
  tierName: string                  // e.g. "Bintang Belajar"
  xp: number                        // XP into current level
  xpToNext: number                  // XP needed for next level (0 if maxed)
  totalXp: number                   // lifetime XP — used for "next tier" math
  streak: number
  longestStreak: number
  recoveryEligible: boolean         // exposed so UI can offer streak-recovery
  loginBonus: { claimedToday: boolean; coinReward: number }
  dailyGoalPct: number
  dailyGoalQuizzes: number          // target value (configurable per child)
  screenTimeMin: number
  favTime: string
  heatmap: number[]
  todayIdx: number
  kpis: DashboardKpi[]
  subjects: DashboardSubject[]
  recommended: DashboardRecommendation[]
  attempts: DashboardAttempt[]
  badges: DashboardBadge[]
  quests: DashboardQuest[]          // today's WIB-day quests, post-Plan 4
}

// ─────────────────────────────────────────────────────────────────────
// Pure helpers
// ─────────────────────────────────────────────────────────────────────

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n))
}

function dateOnlyWib(now: Date): Date {
  // Midnight Asia/Jakarta (WIB, UTC+7, no DST) expressed as a UTC instant.
  // Shift `now` +7h to reach WIB wall-clock, take that calendar day in UTC,
  // then shift midnight of that day back by 7h to get the UTC instant.
  // Indonesia has no DST so this affine shift is stable year-round; it
  // would NOT generalize to DST timezones.
  const wibShifted = new Date(now.getTime() + 7 * HOUR_MS)
  return new Date(
    Date.UTC(
      wibShifted.getUTCFullYear(),
      wibShifted.getUTCMonth(),
      wibShifted.getUTCDate(),
    ) - 7 * HOUR_MS,
  )
}

function relativeDayLabel(iso: string, now: Date): string {
  const t = new Date(iso).getTime()
  const diffMs = now.getTime() - t
  const hours = Math.floor(diffMs / HOUR_MS)
  if (hours < 1) return 'baru saja'
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'kemarin'
  if (days < 7) return `${days} hari lalu`
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
}

function actionForScore(score: number): AttemptAction {
  if (score >= 90) return 'celebrate'
  if (score < 65) return 'review'
  return 'continue'
}

function peerForGap(gap: number): PeerComparison {
  if (gap >= 5) return 'above'
  if (gap <= -5) return 'below'
  return 'avg'
}

function intensityFromCount(count: number): number {
  if (count <= 0) return 0
  if (count === 1) return 1
  if (count <= 3) return 2
  if (count <= 6) return 3
  return 4
}

function favTimeLabel(hour: number | null): string {
  if (hour === null) return 'Belum cukup data'
  if (hour < 11) return `Pagi (${pad(hour)}:00–${pad(hour + 2)}:00)`
  if (hour < 15) return `Siang (${pad(hour)}:00–${pad(hour + 2)}:00)`
  if (hour < 18) return `Sore (${pad(hour)}:00–${pad(hour + 2)}:00)`
  return `Malam (${pad(hour)}:00–${pad(hour + 2)}:00)`
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function trendPercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

function wibDateString(now: Date): string {
  const wibShifted = new Date(now.getTime() + 7 * HOUR_MS)
  const y = wibShifted.getUTCFullYear()
  const m = String(wibShifted.getUTCMonth() + 1).padStart(2, '0')
  const d = String(wibShifted.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ─────────────────────────────────────────────────────────────────────
// Streak — pure function over distinct day offsets (today = 0)
// ─────────────────────────────────────────────────────────────────────

function computeStreaks(offsets: number[]): { current: number; longest: number } {
  if (offsets.length === 0) return { current: 0, longest: 0 }
  const unique = [...new Set(offsets)].sort((a, b) => a - b)

  // Current streak: distinct days ending today (0) or yesterday (1), walking back.
  let current = 0
  if (unique[0] === 0 || unique[0] === 1) {
    let expected = unique[0]
    for (const day of unique) {
      if (day === expected) {
        current += 1
        expected += 1
      } else {
        break
      }
    }
  }

  // Longest streak: longest run of consecutive offsets.
  let longest = 1
  let run = 1
  for (let i = 1; i < unique.length; i++) {
    if (unique[i] === unique[i - 1] + 1) {
      run += 1
      longest = Math.max(longest, run)
    } else {
      run = 1
    }
  }
  return { current, longest }
}

// ─────────────────────────────────────────────────────────────────────
// Main entry
// ─────────────────────────────────────────────────────────────────────

export async function getDashboard(parentUserId: string, childId: string): Promise<DashboardPayload> {
  return withTransaction(async (client) => {
    const child = await fetchChild(client, parentUserId, childId)
    if (!child) throw new Error('Child not found')

    const now = new Date()
    const today = dateOnlyWib(now)
    const todayWib = wibDateString(now)
    const periodStart = new Date(today.getTime() - 7 * DAY_MS)
    const prevPeriodStart = new Date(today.getTime() - 14 * DAY_MS)
    const heatmapStart = new Date(today.getTime() - 27 * DAY_MS) // 28-day window inclusive

    const [
      summary,
      dayOffsets,
      hourBuckets,
      activityByDay,
      kpiSparklines,
      subjects,
      attempts,
      recommended,
      gamProfile,
      tiers,
      activeQuests,
      sessionScreenTime,
      loginClaimedToday,
    ] = await Promise.all([
      fetchSummaryStats(client, childId, periodStart, prevPeriodStart, today),
      fetchDayOffsets(client, childId, today),
      fetchHourBuckets(client, childId),
      fetchActivityByDay(client, childId, heatmapStart, today),
      fetchKpiSparklines(client, childId, today),
      fetchSubjects(client, childId, child.ageGroupId, periodStart, prevPeriodStart),
      fetchAttempts(client, childId, now),
      fetchRecommendations(client, childId, child.ageGroupId),
      fetchGamificationProfile(client, childId),
      loadLevelTiers(client),
      ensureDailyQuests(client, childId),
      fetchScreenTimeMinutes(client, childId, today),
      hasClaimedLoginBonus(client, childId, todayWib),
    ])

    // Streak from the gamification engine (Plan 1+2); fall back to the
    // derived count only when no profile exists yet (brand-new child).
    const derivedStreak = computeStreaks(dayOffsets)
    const currentStreak =
      gamProfile.currentStreakDays > 0 ? gamProfile.currentStreakDays : derivedStreak.current
    const longestStreak = Math.max(gamProfile.longestStreakDays, derivedStreak.longest)
    const recoveryEligible = gamProfile.preBreakStreakDays > 0

    // XP / level / tier from gamification_profiles + level_tiers seed.
    const totalXp = gamProfile.totalXp
    const resolution = resolveLevel(totalXp, tiers)
    const level = resolution.tier.levelNumber
    const tierName = resolution.tier.tierName
    const xpInLevel = resolution.xpIntoCurrent
    const xpToNext = resolution.xpToNext

    // Daily goal uses the per-child configurable target (Plan 4).
    const todayAttempts = summary.todayAttempts
    const dailyGoalQuizzes = child.dailyGoalQuizzes
    const dailyGoalPct = clamp(Math.round((todayAttempts / dailyGoalQuizzes) * 100), 0, 100)

    // Screen-time from real session_events (Plan 5a). Falls back to the
    // questions-x-0.5 heuristic only when there are NO video_close
    // events today (sessionScreenTime === null). When events exist but
    // round to 0 minutes (short play), we trust the real number over
    // the heuristic — QA-004 caught the prior `> 0` check inflating
    // short sessions to 30 min via the heuristic.
    const screenTimeMin =
      sessionScreenTime !== null
        ? sessionScreenTime
        : Math.round(summary.todayQuestionTotal * 0.5)

    const heatmap = buildHeatmap(activityByDay)
    const todayIdx = heatmap.length - 1
    const favTime = favTimeLabel(hourBuckets)

    const quests: DashboardQuest[] = activeQuests.map((q: ActiveQuest) => ({
      id: q.id,
      code: q.code,
      title: q.title,
      description: q.description,
      questType: q.questType,
      progressValue: q.progressValue,
      targetValue: q.targetValue,
      status: q.status,
      xpReward: q.xpReward,
      coinReward: q.coinReward,
    }))

    const kpis: DashboardKpi[] = [
      {
        key: 'attempts',
        value: String(summary.attemptsCount),
        numericValue: summary.attemptsCount,
        trend: trendPercent(summary.attemptsCount, summary.prevAttemptsCount),
        trendUnit: '%',
        sparkline: kpiSparklines.attempts,
      },
      {
        key: 'score',
        value: `${summary.averageScore}%`,
        numericValue: summary.averageScore,
        trend: summary.averageScore - summary.prevAverageScore, // percentage points
        trendUnit: '%',
        sparkline: kpiSparklines.score,
      },
      {
        key: 'videos',
        value: String(summary.videosCompleted),
        numericValue: summary.videosCompleted,
        trend: summary.videosCompleted - summary.prevVideosCompleted,
        trendUnit: 'video',
        sparkline: kpiSparklines.videos,
      },
      {
        key: 'badges',
        value: String(summary.badgesTotal),
        numericValue: summary.badgesTotal,
        trend: summary.badgesTotal - summary.prevBadgesTotal,
        trendUnit: 'baru',
        sparkline: kpiSparklines.badges,
      },
    ]

    const badges = deriveBadges(summary, { current: currentStreak, longest: longestStreak })

    return {
      child: {
        id: child.id,
        name: child.name,
        ageLabel: child.ageLabel,
      },
      level,
      tierName,
      xp: xpInLevel,
      xpToNext,
      totalXp,
      coinBalance: gamProfile.coinBalance,
      streak: currentStreak,
      longestStreak,
      recoveryEligible,
      loginBonus: { claimedToday: loginClaimedToday, coinReward: LOGIN_BONUS_COINS },
      dailyGoalPct,
      dailyGoalQuizzes,
      screenTimeMin,
      favTime,
      heatmap,
      todayIdx,
      kpis,
      subjects,
      recommended,
      attempts,
      badges,
      quests,
    }
  })
}

// ─────────────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────────────

interface ChildContext {
  id: string
  name: string
  ageGroupId: string | null
  // Age-group display label. NULL when the child has no age group set;
  // consumers should render the eyebrow without the suffix in that case
  // (avoids the "Anak Bunda · Anak Bunda" duplicate from QA-002).
  ageLabel: string | null
  dailyGoalQuizzes: number
}

async function fetchChild(
  client: PoolClient,
  parentUserId: string,
  childId: string,
): Promise<ChildContext | null> {
  const row = await queryOne<{
    id: string
    name: string
    age_group_id: string | null
    age_group_name: string | null
    daily_goal_quizzes: number
  }>(
    `SELECT c.id, c.name, c.age_group_id, ag.name AS age_group_name,
            c.daily_goal_quizzes
       FROM children c
       LEFT JOIN age_groups ag ON ag.id = c.age_group_id
       WHERE c.id = $1 AND c.parent_user_id = $2`,
    [childId, parentUserId],
    client,
  )
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    ageGroupId: row.age_group_id,
    ageLabel: row.age_group_name ?? null,
    dailyGoalQuizzes: Number(row.daily_goal_quizzes),
  }
}

interface GamificationProfileRow {
  totalXp: number
  coinBalance: number
  currentStreakDays: number
  longestStreakDays: number
  preBreakStreakDays: number
}

async function fetchGamificationProfile(
  client: PoolClient,
  childId: string,
): Promise<GamificationProfileRow> {
  // LEFT JOIN-style: a child who has never submitted has no profile row.
  // Default to zeros so the dashboard renders cleanly for new users.
  const row = await queryOne<{
    total_xp: number
    coin_balance: number
    current_streak_days: number
    longest_streak_days: number
    pre_break_streak_days: number
  }>(
    `SELECT total_xp, coin_balance, current_streak_days, longest_streak_days,
            pre_break_streak_days
       FROM gamification_profiles
       WHERE child_id = $1`,
    [childId],
    client,
  )
  return {
    totalXp: Number(row?.total_xp ?? 0),
    coinBalance: Number(row?.coin_balance ?? 0),
    currentStreakDays: Number(row?.current_streak_days ?? 0),
    longestStreakDays: Number(row?.longest_streak_days ?? 0),
    preBreakStreakDays: Number(row?.pre_break_streak_days ?? 0),
  }
}

interface SummaryStats {
  attemptsCount: number
  averageScore: number
  videosCompleted: number
  badgesTotal: number
  prevAttemptsCount: number
  prevAverageScore: number
  prevVideosCompleted: number
  prevBadgesTotal: number
  lifetimeCorrect: number
  lifetimeAttempts: number
  todayAttempts: number
  todayQuestionTotal: number
}

async function fetchSummaryStats(
  client: PoolClient,
  childId: string,
  periodStart: Date,
  prevPeriodStart: Date,
  today: Date,
): Promise<SummaryStats> {
  const row = await queryOne<{
    attempts_count: string
    average_score: string | null
    videos_completed: string
    prev_attempts_count: string
    prev_average_score: string | null
    prev_videos_completed: string
    badges_total: string
    prev_badges_total: string
    lifetime_correct: string
    lifetime_attempts: string
    today_attempts: string
    today_question_total: string
  }>(
    `
      SELECT
        (SELECT COUNT(*) FROM score_attempts sa
           WHERE sa.child_id = $1 AND sa.created_at >= $2) AS attempts_count,
        (SELECT COALESCE(AVG(sa.score_percentage), 0) FROM score_attempts sa
           WHERE sa.child_id = $1 AND sa.created_at >= $2) AS average_score,
        (SELECT COUNT(DISTINCT sa.video_id) FROM score_attempts sa
           WHERE sa.child_id = $1 AND sa.created_at >= $2) AS videos_completed,
        (SELECT COUNT(*) FROM score_attempts sa
           WHERE sa.child_id = $1 AND sa.created_at >= $3 AND sa.created_at < $2) AS prev_attempts_count,
        (SELECT COALESCE(AVG(sa.score_percentage), 0) FROM score_attempts sa
           WHERE sa.child_id = $1 AND sa.created_at >= $3 AND sa.created_at < $2) AS prev_average_score,
        (SELECT COUNT(DISTINCT sa.video_id) FROM score_attempts sa
           WHERE sa.child_id = $1 AND sa.created_at >= $3 AND sa.created_at < $2) AS prev_videos_completed,
        (SELECT COALESCE(SUM(ubu.badge_count), 0) FROM user_badge_unlocks ubu
           WHERE ubu.child_id = $1) AS badges_total,
        (SELECT COALESCE(SUM(ubu.badge_count), 0) FROM user_badge_unlocks ubu
           WHERE ubu.child_id = $1 AND ubu.unlocked_at < $2) AS prev_badges_total,
        (SELECT COALESCE(SUM(sa.correct_answers), 0) FROM score_attempts sa
           WHERE sa.child_id = $1) AS lifetime_correct,
        (SELECT COUNT(*) FROM score_attempts sa
           WHERE sa.child_id = $1) AS lifetime_attempts,
        (SELECT COUNT(*) FROM score_attempts sa
           WHERE sa.child_id = $1 AND sa.created_at >= $4
             AND sa.is_correction = FALSE) AS today_attempts,
        (SELECT COALESCE(SUM(sa.total_questions), 0) FROM score_attempts sa
           WHERE sa.child_id = $1 AND sa.created_at >= $4) AS today_question_total
    `,
    [childId, periodStart, prevPeriodStart, today],
    client,
  )

  return {
    attemptsCount: Number(row?.attempts_count ?? 0),
    averageScore: Math.round(Number(row?.average_score ?? 0)),
    videosCompleted: Number(row?.videos_completed ?? 0),
    badgesTotal: Number(row?.badges_total ?? 0),
    prevAttemptsCount: Number(row?.prev_attempts_count ?? 0),
    prevAverageScore: Math.round(Number(row?.prev_average_score ?? 0)),
    prevVideosCompleted: Number(row?.prev_videos_completed ?? 0),
    prevBadgesTotal: Number(row?.prev_badges_total ?? 0),
    lifetimeCorrect: Number(row?.lifetime_correct ?? 0),
    lifetimeAttempts: Number(row?.lifetime_attempts ?? 0),
    todayAttempts: Number(row?.today_attempts ?? 0),
    todayQuestionTotal: Number(row?.today_question_total ?? 0),
  }
}

async function fetchDayOffsets(client: PoolClient, childId: string, today: Date): Promise<number[]> {
  // Day bucketing in WIB: convert both sides via AT TIME ZONE 'Asia/Jakarta'
  // so the resulting subtraction is between WIB-day boundaries.
  const rows = await query<{ day_offset: string }>(
    `SELECT DATE_PART('day',
              DATE_TRUNC('day', $2::timestamptz AT TIME ZONE 'Asia/Jakarta')
              - DATE_TRUNC('day', sa.created_at AT TIME ZONE 'Asia/Jakarta')
            )::int AS day_offset
       FROM score_attempts sa
       WHERE sa.child_id = $1
       GROUP BY DATE_TRUNC('day', sa.created_at AT TIME ZONE 'Asia/Jakarta')
       ORDER BY day_offset ASC`,
    [childId, today],
    client,
  )
  return rows.map((r) => Number(r.day_offset)).filter((n) => Number.isFinite(n) && n >= 0)
}

async function fetchHourBuckets(client: PoolClient, childId: string): Promise<number | null> {
  // Hour-of-day in WIB so "favorite time" matches the kid's lived experience
  // (a 22:00 WIB session shouldn't be labeled "siang" because UTC was 15:00).
  const row = await queryOne<{ hour_bucket: string }>(
    `SELECT (EXTRACT(HOUR FROM sa.created_at AT TIME ZONE 'Asia/Jakarta')::int / 2) * 2 AS hour_bucket
       FROM score_attempts sa
       WHERE sa.child_id = $1
       GROUP BY hour_bucket
       ORDER BY COUNT(*) DESC, hour_bucket ASC
       LIMIT 1`,
    [childId],
    client,
  )
  return row ? Number(row.hour_bucket) : null
}

async function fetchActivityByDay(
  client: PoolClient,
  childId: string,
  heatmapStart: Date,
  today: Date,
): Promise<Map<number, number>> {
  // 28-day heatmap in WIB. $2 (heatmapStart) is already a WIB midnight as
  // a UTC instant (set by dateOnlyWib + time math in getDashboard), so the
  // ">= $2" filter compares timestamptz to timestamptz cleanly. The
  // DATE_TRUNC inside uses AT TIME ZONE so the resulting day bucket is
  // a WIB day.
  const rows = await query<{ day_offset: string; cnt: string }>(
    `SELECT
        DATE_PART('day',
          DATE_TRUNC('day', $3::timestamptz AT TIME ZONE 'Asia/Jakarta')
          - DATE_TRUNC('day', sa.created_at AT TIME ZONE 'Asia/Jakarta')
        )::int AS day_offset,
        COUNT(*) AS cnt
       FROM score_attempts sa
       WHERE sa.child_id = $1 AND sa.created_at >= $2
       GROUP BY day_offset`,
    [childId, heatmapStart, today],
    client,
  )
  const map = new Map<number, number>()
  for (const r of rows) {
    map.set(Number(r.day_offset), Number(r.cnt))
  }
  return map
}

function buildHeatmap(byDay: Map<number, number>): number[] {
  // 28 cells, oldest first → newest last. day_offset = 0 is today.
  return Array.from({ length: 28 }, (_, i) => {
    const offset = 27 - i
    return intensityFromCount(byDay.get(offset) ?? 0)
  })
}

async function fetchKpiSparklines(
  client: PoolClient,
  childId: string,
  today: Date,
): Promise<{ attempts: number[]; score: number[]; videos: number[]; badges: number[] }> {
  const sparkStart = new Date(today.getTime() - 6 * DAY_MS)
  const rows = await query<{
    day_offset: string
    attempts: string
    distinct_videos: string
    avg_score: string | null
  }>(
    `SELECT
        DATE_PART('day',
          DATE_TRUNC('day', $3::timestamptz AT TIME ZONE 'Asia/Jakarta')
          - DATE_TRUNC('day', sa.created_at AT TIME ZONE 'Asia/Jakarta')
        )::int AS day_offset,
        COUNT(*) AS attempts,
        COUNT(DISTINCT sa.video_id) AS distinct_videos,
        COALESCE(AVG(sa.score_percentage), 0) AS avg_score
       FROM score_attempts sa
       WHERE sa.child_id = $1 AND sa.created_at >= $2
       GROUP BY day_offset`,
    [childId, sparkStart, today],
    client,
  )
  const badgeRows = await query<{ day_offset: string; cnt: string }>(
    `SELECT
        DATE_PART('day',
          DATE_TRUNC('day', $3::timestamptz AT TIME ZONE 'Asia/Jakarta')
          - DATE_TRUNC('day', ubu.unlocked_at AT TIME ZONE 'Asia/Jakarta')
        )::int AS day_offset,
        COALESCE(SUM(ubu.badge_count), 0) AS cnt
       FROM user_badge_unlocks ubu
       WHERE ubu.child_id = $1 AND ubu.unlocked_at >= $2
       GROUP BY day_offset`,
    [childId, sparkStart, today],
    client,
  )

  const attempts = new Array<number>(7).fill(0)
  const score = new Array<number>(7).fill(0)
  const videos = new Array<number>(7).fill(0)
  const badges = new Array<number>(7).fill(0)
  for (const r of rows) {
    const idx = 6 - Number(r.day_offset)
    if (idx < 0 || idx > 6) continue
    attempts[idx] = Number(r.attempts)
    videos[idx] = Number(r.distinct_videos)
    score[idx] = Math.round(Number(r.avg_score ?? 0))
  }
  for (const r of badgeRows) {
    const idx = 6 - Number(r.day_offset)
    if (idx < 0 || idx > 6) continue
    badges[idx] = Number(r.cnt)
  }
  return { attempts, score, videos, badges }
}

interface SubjectRow {
  id: string
  name: string
  color_hex: string
  current_score: string | null
  prev_score: string | null
  mastery_videos_attempted: string
  mastery_videos_available: string
  peer_avg: string | null
  badges_earned: string
}

async function fetchSubjects(
  client: PoolClient,
  childId: string,
  ageGroupId: string | null,
  periodStart: Date,
  prevPeriodStart: Date,
): Promise<DashboardSubject[]> {
  // Subjects, current/prev period scores, coverage, and peer-cohort average.
  // Peer cohort = all children in the same age_group (excluding this child).
  // We compare the child's all-time best per video to the cohort's all-time best.
  const subjectRows = await query<SubjectRow>(
    `
      WITH child_age AS (
        SELECT $2::uuid AS age_group_id
      ),
      available_videos AS (
        SELECT v.id AS video_id, v.subject_id
          FROM videos v, child_age
          WHERE v.is_published = TRUE
            AND (child_age.age_group_id IS NULL OR v.age_group_id = child_age.age_group_id)
      ),
      current_scores AS (
        SELECT v.subject_id, AVG(sa.score_percentage) AS avg_score
          FROM score_attempts sa
          JOIN videos v ON v.id = sa.video_id
          WHERE sa.child_id = $1 AND sa.created_at >= $3
          GROUP BY v.subject_id
      ),
      prev_scores AS (
        SELECT v.subject_id, AVG(sa.score_percentage) AS avg_score
          FROM score_attempts sa
          JOIN videos v ON v.id = sa.video_id
          WHERE sa.child_id = $1 AND sa.created_at >= $4 AND sa.created_at < $3
          GROUP BY v.subject_id
      ),
      attempted_videos AS (
        SELECT av.subject_id, av.video_id
          FROM available_videos av
          WHERE EXISTS (
            SELECT 1 FROM score_attempts sa
              WHERE sa.child_id = $1 AND sa.video_id = av.video_id
          )
      ),
      child_age_full AS (
        SELECT c.age_group_id
          FROM children c WHERE c.id = $1
      ),
      peer_best_per_video AS (
        SELECT v.subject_id, MAX(sa.score_percentage) AS best_score
          FROM score_attempts sa
          JOIN videos v ON v.id = sa.video_id
          JOIN children c ON c.id = sa.child_id
          JOIN child_age_full caf ON TRUE
          WHERE sa.child_id <> $1
            AND (caf.age_group_id IS NULL OR c.age_group_id = caf.age_group_id)
          GROUP BY v.subject_id, sa.video_id
      ),
      peer_avg AS (
        SELECT subject_id, AVG(best_score) AS avg_score
          FROM peer_best_per_video
          GROUP BY subject_id
      ),
      badges_per_subject AS (
        SELECT v.subject_id, COALESCE(SUM(ubu.badge_count), 0) AS badges_earned
          FROM user_badge_unlocks ubu
          JOIN videos v ON v.id = ubu.video_id
          WHERE ubu.child_id = $1
          GROUP BY v.subject_id
      )
      SELECT
        s.id,
        s.name,
        s.color_hex,
        cs.avg_score AS current_score,
        ps.avg_score AS prev_score,
        COALESCE(av_attempted.cnt, 0) AS mastery_videos_attempted,
        COALESCE(av_total.cnt, 0) AS mastery_videos_available,
        pa.avg_score AS peer_avg,
        COALESCE(bps.badges_earned, 0) AS badges_earned
      FROM subjects s
      LEFT JOIN current_scores cs ON cs.subject_id = s.id
      LEFT JOIN prev_scores ps ON ps.subject_id = s.id
      LEFT JOIN (
        SELECT subject_id, COUNT(*) AS cnt FROM attempted_videos GROUP BY subject_id
      ) av_attempted ON av_attempted.subject_id = s.id
      LEFT JOIN (
        SELECT subject_id, COUNT(*) AS cnt FROM available_videos GROUP BY subject_id
      ) av_total ON av_total.subject_id = s.id
      LEFT JOIN peer_avg pa ON pa.subject_id = s.id
      LEFT JOIN badges_per_subject bps ON bps.subject_id = s.id
      WHERE EXISTS (SELECT 1 FROM available_videos av WHERE av.subject_id = s.id)
      ORDER BY (cs.avg_score IS NULL), cs.avg_score DESC NULLS LAST, s.name ASC
    `,
    [childId, ageGroupId, periodStart, prevPeriodStart],
    client,
  )

  if (subjectRows.length === 0) return []

  // Fetch subtopic (per-video) scores for the listed subjects.
  const subjectIds = subjectRows.map((s) => s.id)
  const subtopics = await query<{
    subject_id: string
    video_id: string
    video_title: string
    best_score: string | null
  }>(
    `
      SELECT v.subject_id, v.id AS video_id, v.title AS video_title,
             MAX(sa.score_percentage) AS best_score
        FROM score_attempts sa
        JOIN videos v ON v.id = sa.video_id
        WHERE sa.child_id = $1 AND v.subject_id = ANY($2::uuid[])
        GROUP BY v.subject_id, v.id, v.title
        ORDER BY best_score DESC NULLS LAST
    `,
    [childId, subjectIds],
    client,
  )

  const subBySubject = new Map<string, Array<{ name: string; score: number }>>()
  for (const t of subtopics) {
    const list = subBySubject.get(t.subject_id) ?? []
    list.push({ name: t.video_title, score: Math.round(Number(t.best_score ?? 0)) })
    subBySubject.set(t.subject_id, list)
  }

  return subjectRows.map((row) => {
    const current = row.current_score === null ? 0 : Math.round(Number(row.current_score))
    const prev = row.prev_score === null ? 0 : Math.round(Number(row.prev_score))
    const trend = trendPercent(current, prev)
    const peerAvg = row.peer_avg === null ? null : Math.round(Number(row.peer_avg))
    const peer: PeerComparison = peerAvg === null ? 'avg' : peerForGap(current - peerAvg)
    const attempted = Number(row.mastery_videos_attempted)
    const available = Number(row.mastery_videos_available)
    const coverage = available > 0 ? Math.round((attempted / available) * 100) : 0
    const mastery = current > 0 ? Math.round((coverage * current) / 100) : 0
    const subtopicList = (subBySubject.get(row.id) ?? []).slice(0, 4)

    return {
      id: row.id,
      name: row.name,
      colorHex: row.color_hex,
      // `attempted` counts videos ever attempted in this subject (no date
      // filter) — the right "has the child started this?" signal.
      started: attempted > 0,
      score: current,
      trend,
      peer,
      mastery,
      badgesEarned: Number(row.badges_earned),
      subtopics: subtopicList,
    }
  })
}

async function fetchAttempts(
  client: PoolClient,
  childId: string,
  now: Date,
): Promise<DashboardAttempt[]> {
  const rows = await query<{
    id: string
    score_percentage: string
    created_at: string
    video_title: string
    video_slug: string
    subject_name: string
    subject_color_hex: string
  }>(
    `
      SELECT sa.id, sa.score_percentage, sa.created_at,
             v.title AS video_title, v.slug AS video_slug,
             s.name AS subject_name, s.color_hex AS subject_color_hex
        FROM score_attempts sa
        JOIN videos v ON v.id = sa.video_id
        JOIN subjects s ON s.id = v.subject_id
        WHERE sa.child_id = $1
        ORDER BY sa.created_at DESC
        LIMIT 6
    `,
    [childId],
    client,
  )
  return rows.map((row) => {
    const score = Math.round(Number(row.score_percentage))
    return {
      id: row.id,
      subjectName: row.subject_name,
      subjectColorHex: row.subject_color_hex,
      videoTitle: row.video_title,
      videoSlug: row.video_slug,
      whenLabel: relativeDayLabel(row.created_at, now),
      score,
      action: actionForScore(score),
    }
  })
}

async function fetchRecommendations(
  client: PoolClient,
  childId: string,
  ageGroupId: string | null,
): Promise<DashboardRecommendation[]> {
  // Rank the child's attempted subjects by average score, then surface one
  // not-yet-attempted published video per slot (weakest / strongest /
  // median subject, matching age group if set). The payload carries the
  // real video thumbnail so the dashboard can render catalog-style cards.
  const subjectScores = await query<{
    subject_id: string
    subject_name: string
    color_hex: string
    avg_score: string | null
  }>(
    `
      SELECT s.id AS subject_id, s.name AS subject_name, s.color_hex,
             AVG(sa.score_percentage) AS avg_score
        FROM score_attempts sa
        JOIN videos v ON v.id = sa.video_id
        JOIN subjects s ON s.id = v.subject_id
        WHERE sa.child_id = $1
        GROUP BY s.id, s.name, s.color_hex
        HAVING COUNT(*) > 0
    `,
    [childId],
    client,
  )
  if (subjectScores.length === 0) return []

  const ranked = subjectScores
    .map((row) => ({
      id: row.subject_id,
      name: row.subject_name,
      colorHex: row.color_hex,
      score: Number(row.avg_score ?? 0),
    }))
    .sort((a, b) => a.score - b.score)

  const weakest = ranked[0]
  const strongest = ranked[ranked.length - 1]
  const middle = ranked[Math.floor(ranked.length / 2)] ?? weakest

  const slots: Array<{ subject: typeof weakest; slot: RecommendedSlot }> = [
    { subject: weakest, slot: 'weakest' },
    { subject: strongest, slot: 'strongest' },
    { subject: middle, slot: 'middle' },
  ]

  const picks: DashboardRecommendation[] = []
  const usedVideoIds = new Set<string>()
  for (const { subject } of slots) {
    const video = await queryOne<{
      id: string
      title: string
      slug: string
      thumbnail_url: string | null
      published_at: string | null
      subject_name: string
      subject_color_hex: string
    }>(
      `
        SELECT v.id, v.title, v.slug, v.thumbnail_url, v.published_at,
               s.name AS subject_name, s.color_hex AS subject_color_hex
          FROM videos v
          JOIN subjects s ON s.id = v.subject_id
          WHERE v.subject_id = $1
            AND v.is_published = TRUE
            AND ($2::uuid IS NULL OR v.age_group_id = $2)
            AND NOT EXISTS (
              SELECT 1 FROM score_attempts sa
                WHERE sa.child_id = $3 AND sa.video_id = v.id
            )
            AND v.id <> ALL($4::uuid[])
          ORDER BY v.sort_order ASC, v.published_at DESC NULLS LAST
          LIMIT 1
      `,
      [subject.id, ageGroupId, childId, Array.from(usedVideoIds)],
      client,
    )
    if (!video) continue
    usedVideoIds.add(video.id)
    picks.push({
      id: video.id,
      title: video.title,
      subjectName: video.subject_name,
      subjectColorHex: video.subject_color_hex,
      thumbnailUrl: video.thumbnail_url ?? '',
      publishedAt: video.published_at,
      videoSlug: video.slug,
    })
  }
  return picks
}

function deriveBadges(summary: SummaryStats, streak: { current: number; longest: number }): DashboardBadge[] {
  // Achievement strip derived from existing data. No new badge table.
  const lifetimeAttempts = summary.lifetimeAttempts
  const totalBadges = summary.badgesTotal
  return [
    // `icon` is a Font Awesome class; rendered as <i> by DashboardBadges.
    { id: 'first-quiz',  name: 'Pertama Kali',  description: 'Quiz pertama',     colorHex: '#F0853A', icon: 'fa-solid fa-bullseye',     earned: lifetimeAttempts >= 1 },
    { id: 'streak-3',    name: 'Streak 3 Hari', description: '3 hari berturut',  colorHex: '#FF6B6B', icon: 'fa-solid fa-fire',         earned: streak.longest >= 3 },
    { id: 'streak-5',    name: 'Streak 5 Hari', description: '5 hari berturut',  colorHex: '#F0853A', icon: 'fa-solid fa-fire',         earned: streak.longest >= 5 },
    { id: 'ten-quiz',    name: '10 Quiz',       description: '10 quiz selesai',  colorHex: '#58CC02', icon: 'fa-solid fa-circle-check', earned: lifetimeAttempts >= 10 },
    { id: 'twenty-five', name: '25 Quiz',       description: '25 quiz selesai',  colorHex: '#8A5BF0', icon: 'fa-solid fa-trophy',       earned: lifetimeAttempts >= 25 },
    { id: 'fifty',       name: '50 Quiz',       description: '50 quiz selesai',  colorHex: '#FFDD55', icon: 'fa-solid fa-star',         earned: lifetimeAttempts >= 50 },
    { id: 'streak-10',   name: 'Streak 10',     description: '10 hari berturut', colorHex: '#FF6B6B', icon: 'fa-solid fa-fire',         earned: streak.longest >= 10 },
    { id: 'star',        name: 'Bintang',       description: `${totalBadges} badge`, colorHex: '#FFDD55', icon: 'fa-solid fa-star',     earned: totalBadges >= 5 },
  ]
}

// Exposed for testing / future composition.
export const __test__ = { computeStreaks, intensityFromCount, favTimeLabel, trendPercent }
