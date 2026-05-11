// src/lib/dashboardData.ts
//
// Derives the dashboard view-model from `MemberProgress` + the active child.
// Real fields come from the API; the wireframe-spec fields the backend doesn't
// yet expose (streak, daily goal %, screen time, heatmap, peer comparison,
// recommendations, sparklines, KPI trend %) are stubbed here in one place.
//
// TODO(api): replace the stubbed sections with real fields when the backend
// catches up. See `docs/superpowers/specs/...` for the planned API surface.

import type { Child, MemberProgress, SubjectStat } from '../types'

export type PeerComparison = 'above' | 'avg' | 'below'
export type AttemptAction = 'review' | 'celebrate' | 'continue'
export type InsightType = 'focus' | 'strong' | 'tip'
export type RecommendedTag = 'FOKUS' | 'TANTANGAN' | 'LANJUTAN'

export interface KpiTile {
  key: string
  iconClass: string         // font-awesome class
  iconBg: string            // hex
  value: string             // pre-formatted
  label: string
  trend: number             // signed; rendered with ▲ / ▼ / ·
  trendUnit: '%' | string   // '%' for ratios, 'baru' / 'video' for counts
  sparkline: number[]       // 7 points
}

export interface DashboardSubject {
  id: string
  name: string
  colorHex: string
  score: number             // 0-100, current period
  trend: number             // signed % vs previous period
  peer: PeerComparison
  mastery: number           // 0-100, coverage * average
  subtopics: Array<{ name: string; score: number }>
}

export interface DashboardAttempt {
  id: string
  subjectName: string
  subjectColorHex: string
  videoTitle: string
  videoSlug: string
  whenLabel: string         // pre-formatted ("2 jam lalu")
  score: number             // 0-100
  action: AttemptAction
}

export interface DashboardRecommendation {
  id: string
  title: string
  reason: string
  tag: RecommendedTag
  subjectColorHex: string
  subjectInitial: string
  href: string
}

export interface DashboardBadge {
  id: string
  name: string
  description: string
  colorHex: string
  icon: string              // single emoji
  earned: boolean
}

export interface DashboardInsight {
  type: InsightType
  icon: string              // single emoji
  kicker: string
  title: string
  body: string
  cta: string
  href: string
}

export interface DashboardViewModel {
  child: { id: string; name: string; ageLabel: string }
  level: number
  xp: number
  xpToNext: number
  streak: number
  longestStreak: number
  dailyGoalPct: number      // 0-100
  screenTimeMin: number
  favTime: string           // pre-formatted
  heatmap: number[]         // 28 values, 0-4 intensity
  todayIdx: number          // 0-27
  kpis: KpiTile[]
  insights: DashboardInsight[]
  subjects: DashboardSubject[]
  recommended: DashboardRecommendation[]
  attempts: DashboardAttempt[]
  badges: DashboardBadge[]
}

// ─────────────────────────────────────────────────────────────────────
// Pure helpers
// ─────────────────────────────────────────────────────────────────────

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n))
}

function relativeDayLabel(iso: string, now: Date = new Date()): string {
  const t = new Date(iso).getTime()
  const diffMs = now.getTime() - t
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
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

function peerForScore(score: number): PeerComparison {
  if (score >= 80) return 'above'
  if (score < 65) return 'below'
  return 'avg'
}

function levelFromXp(xp: number): { level: number; xpInLevel: number; xpToNext: number } {
  // simple curve: each level needs +200 XP more than the previous
  let level = 1
  let needed = 200
  let remaining = xp
  while (remaining >= needed) {
    remaining -= needed
    level += 1
    needed += 200
  }
  return { level, xpInLevel: remaining, xpToNext: needed }
}

// 7-point sparkline that ramps up to the current value (so the line looks
// believable on a tile that says "+12% vs last period"). Replace with real
// daily history when the API exposes it.
function stubSparkline(target: number, trend: number): number[] {
  const start = clamp(target - trend, 0, target)
  return Array.from({ length: 7 }, (_, i) => {
    const t = i / 6
    return Math.round(start + (target - start) * t)
  })
}

// 28-day heatmap, gently rising toward today. Replace with real activity log.
function stubHeatmap(streak: number, attemptsCount: number): number[] {
  const base = clamp(Math.round(attemptsCount / 14), 0, 3)
  return Array.from({ length: 28 }, (_, i) => {
    const isStreakDay = i >= 28 - streak
    if (isStreakDay) return clamp(base + 1 + ((i + streak) % 2), 1, 4)
    // mild noise for older days
    return ((i * 7) % 5) <= 1 ? 0 : Math.max(0, base - 1 + ((i * 3) % 2))
  })
}

// ─────────────────────────────────────────────────────────────────────
// Insight rule engine (pure, deterministic)
// ─────────────────────────────────────────────────────────────────────

export function buildInsights(args: {
  childName: string
  streak: number
  subjects: DashboardSubject[]
  lowestAttempt?: DashboardAttempt
}): DashboardInsight[] {
  const { childName, streak, subjects, lowestAttempt } = args
  const ranked = [...subjects].sort((a, b) => a.score - b.score)
  const weakest = ranked[0]
  const strongest = ranked[ranked.length - 1]
  const weakestSub = weakest?.subtopics.length
    ? [...weakest.subtopics].sort((a, b) => a.score - b.score)[0]
    : undefined

  const focus: DashboardInsight = weakest
    ? {
        type: 'focus',
        icon: '🎯',
        kicker: 'Fokus minggu ini',
        title: weakestSub
          ? `${childName} sering keliru di "${weakestSub.name}"`
          : `${childName} perlu latihan ${weakest.name}`,
        body: weakestSub
          ? `Akurasi di topik ini ${weakestSub.score}%. Coba latih 5 menit bareng Bunda sebelum tidur.`
          : `Skor saat ini ${weakest.score}%. Coba ulang video terakhir bareng Bunda.`,
        cta: 'Mulai latihan',
        href: '/videos',
      }
    : {
        type: 'focus',
        icon: '🎯',
        kicker: 'Fokus minggu ini',
        title: `Belum ada data fokus untuk ${childName}`,
        body: 'Selesaikan beberapa quiz dulu supaya kami bisa kasih saran yang tepat.',
        cta: 'Pilih video',
        href: '/videos',
      }

  const strong: DashboardInsight = strongest
    ? {
        type: 'strong',
        icon: '🌟',
        kicker: 'Sudah jago',
        title: `${childName} unggul di ${strongest.name}!`,
        body: `Skor ${strongest.score}% dengan tren ${strongest.trend >= 0 ? '+' : ''}${strongest.trend}%. Saatnya tantang ke level lebih tinggi.`,
        cta: 'Naik level',
        href: '/videos',
      }
    : {
        type: 'strong',
        icon: '🌟',
        kicker: 'Sudah jago',
        title: 'Belum ada subject yang bisa dipamerkan',
        body: 'Semangat! Setelah beberapa quiz, kami tunjukkan yang paling jago di sini.',
        cta: 'Pilih video',
        href: '/videos',
      }

  const tip: DashboardInsight =
    streak >= 5
      ? {
          type: 'tip',
          icon: '💡',
          kicker: 'Saran untuk Bunda',
          title: `${streak} hari berturut! Beri ${childName} pelukan.`,
          body: 'Konsistensi anak luar biasa. Rayakan dengan menonton video favoritnya bareng-bareng.',
          cta: 'Lihat semua badge',
          href: '/badges',
        }
      : lowestAttempt
      ? {
          type: 'tip',
          icon: '💡',
          kicker: 'Saran untuk Bunda',
          title: `Diskusikan "${lowestAttempt.videoTitle}" bareng ${childName}`,
          body: `Skor terakhir ${lowestAttempt.score}%. Anak suka diskusi — tanyakan "kenapa pilih jawaban itu?"`,
          cta: 'Lihat detail',
          href: `/videos/${lowestAttempt.videoSlug}`,
        }
      : {
          type: 'tip',
          icon: '💡',
          kicker: 'Saran untuk Bunda',
          title: 'Mulai dengan 5 menit sehari',
          body: 'Konsistensi pendek lebih ampuh daripada sesi panjang. Pilih video singkat dulu.',
          cta: 'Pilih video',
          href: '/videos',
        }

  return [focus, strong, tip]
}

// ─────────────────────────────────────────────────────────────────────
// MemberProgress → DashboardViewModel
// ─────────────────────────────────────────────────────────────────────

function buildSubjects(stats: SubjectStat[]): DashboardSubject[] {
  return stats
    .filter((s) => s.totalVideosAvailable > 0)
    .map((s) => {
      const score = Math.round(s.averageBestScore ?? 0)
      const coverage =
        s.totalVideosAvailable === 0
          ? 0
          : Math.round((s.videosAttempted / s.totalVideosAvailable) * 100)
      const mastery = Math.round((coverage * score) / 100)
      const subtopics = s.videos.slice(0, 4).map((v) => ({
        name: v.videoTitle,
        score: Math.round(v.bestScore),
      }))
      return {
        id: s.id,
        name: s.name,
        colorHex: s.colorHex,
        score,
        trend: 0, // TODO(api): real per-period trend
        peer: peerForScore(score),
        mastery,
        subtopics,
      }
    })
    .sort((a, b) => b.score - a.score)
}

function buildAttempts(progress: MemberProgress): DashboardAttempt[] {
  return progress.recentAttempts.slice(0, 6).map((a) => ({
    id: a.id,
    subjectName: a.subjectName,
    subjectColorHex: a.subjectColorHex,
    videoTitle: a.videoTitle,
    videoSlug: a.videoSlug,
    whenLabel: relativeDayLabel(a.createdAt),
    score: Math.round(a.scorePercentage),
    action: actionForScore(a.scorePercentage),
  }))
}

function buildRecommendations(subjects: DashboardSubject[]): DashboardRecommendation[] {
  // TODO(api): swap for /api/me/recommendations
  if (subjects.length === 0) return []
  const ranked = [...subjects].sort((a, b) => a.score - b.score)
  const weak = ranked[0]
  const strong = ranked[ranked.length - 1]
  const middle = ranked[Math.floor(ranked.length / 2)] ?? weak
  const initial = (s: DashboardSubject) => s.name.charAt(0).toUpperCase()
  return [
    {
      id: `rec-${weak.id}`,
      title: `${weak.name} — Latihan Mudah`,
      reason: `${weak.name} butuh latihan ekstra minggu ini`,
      tag: 'FOKUS',
      subjectColorHex: weak.colorHex,
      subjectInitial: initial(weak),
      href: '/videos',
    },
    {
      id: `rec-${strong.id}`,
      title: `${strong.name} — Naik Level`,
      reason: `Siap untuk level berikutnya`,
      tag: 'TANTANGAN',
      subjectColorHex: strong.colorHex,
      subjectInitial: initial(strong),
      href: '/videos',
    },
    {
      id: `rec-${middle.id}`,
      title: `${middle.name} — Lanjutan`,
      reason: 'Lanjutan dari video terakhir',
      tag: 'LANJUTAN',
      subjectColorHex: middle.colorHex,
      subjectInitial: initial(middle),
      href: '/videos',
    },
  ]
}

function buildBadges(progress: MemberProgress, streak: number): DashboardBadge[] {
  // TODO(api): real badge catalog with earned dates. For now derive a small
  // strip from streak + totals so the section never looks empty.
  const totalBadges = progress.summary.badgesTotal
  const attempts = progress.summary.attemptsCount
  return [
    { id: 'first-quiz', name: 'Pertama Kali', description: 'Quiz pertama', colorHex: '#F0853A', icon: '🎯', earned: attempts >= 1 },
    { id: 'streak-3', name: 'Streak 3 Hari', description: '3 hari berturut', colorHex: '#FF6B6B', icon: '🔥', earned: streak >= 3 },
    { id: 'streak-5', name: 'Streak 5 Hari', description: '5 hari berturut', colorHex: '#F0853A', icon: '🔥', earned: streak >= 5 },
    { id: 'ten-quiz', name: '10 Quiz', description: '10 quiz selesai', colorHex: '#58CC02', icon: '✅', earned: attempts >= 10 },
    { id: 'twenty-five', name: '25 Quiz', description: '25 quiz selesai', colorHex: '#8A5BF0', icon: '🏆', earned: attempts >= 25 },
    { id: 'fifty', name: '50 Quiz', description: '50 quiz selesai', colorHex: '#FFDD55', icon: '⭐', earned: attempts >= 50 },
    { id: 'streak-10', name: 'Streak 10', description: '10 hari berturut', colorHex: '#FF6B6B', icon: '🔥', earned: streak >= 10 },
    { id: 'star', name: 'Bintang', description: `${totalBadges} badge`, colorHex: '#FFDD55', icon: '⭐', earned: totalBadges >= 5 },
  ]
}

function buildKpis(progress: MemberProgress): KpiTile[] {
  const s = progress.summary
  // TODO(api): real per-period trend. Stub trends so tiles aren't all 0%.
  const attemptsTrend = s.attemptsCount > 0 ? 12 : 0
  const scoreTrend = s.averageScore > 0 ? 5 : 0
  const videosTrend = s.videosCompleted > 0 ? 3 : 0
  const badgesTrend = s.badgesTotal > 0 ? 2 : 0
  return [
    {
      key: 'attempts',
      iconClass: 'fa-solid fa-bolt',
      iconBg: '#F0853A',
      value: String(s.attemptsCount),
      label: 'Quiz selesai',
      trend: attemptsTrend,
      trendUnit: '%',
      sparkline: stubSparkline(s.attemptsCount, attemptsTrend),
    },
    {
      key: 'score',
      iconClass: 'fa-solid fa-star',
      iconBg: '#FFDD55',
      value: `${s.averageScore}%`,
      label: 'Skor rata-rata',
      trend: scoreTrend,
      trendUnit: '%',
      sparkline: stubSparkline(s.averageScore, scoreTrend),
    },
    {
      key: 'videos',
      iconClass: 'fa-solid fa-circle-play',
      iconBg: '#58CC02',
      value: String(s.videosCompleted),
      label: 'Video selesai',
      trend: videosTrend,
      trendUnit: 'video',
      sparkline: stubSparkline(s.videosCompleted, videosTrend),
    },
    {
      key: 'badges',
      iconClass: 'fa-solid fa-medal',
      iconBg: '#8A5BF0',
      value: String(s.badgesTotal),
      label: 'Lencana',
      trend: badgesTrend,
      trendUnit: 'baru',
      sparkline: stubSparkline(s.badgesTotal, badgesTrend),
    },
  ]
}

function ageLabel(child: Child): string {
  // TODO(api): expose ageGroup label on Child for richer kicker text.
  return child.name
}

export function buildDashboardViewModel(
  progress: MemberProgress,
  child: Child,
): DashboardViewModel {
  const subjects = buildSubjects(progress.subjectStats)
  const attempts = buildAttempts(progress)
  // TODO(api): real streak. Derive from earned data for now.
  const streak = Math.min(7, progress.recentAttempts.length)
  const longestStreak = streak
  // TODO(api): real XP / level. Stub off attempts so the bar has a value.
  const xp = progress.summary.attemptsCount * 30
  const { level, xpInLevel, xpToNext } = levelFromXp(xp)
  const lowestAttempt = [...attempts].sort((a, b) => a.score - b.score)[0]

  return {
    child: { id: child.id, name: child.name, ageLabel: ageLabel(child) },
    level,
    xp: xpInLevel,
    xpToNext,
    streak,
    longestStreak,
    dailyGoalPct: clamp(progress.summary.attemptsCount * 10, 0, 100), // TODO(api): real goal %
    screenTimeMin: clamp(progress.summary.attemptsCount * 5, 0, 60),  // TODO(api): real screen time
    favTime: 'Sore (15:00–17:00)',                                     // TODO(api): derive from activity
    heatmap: stubHeatmap(streak, progress.summary.attemptsCount),
    todayIdx: 27,
    kpis: buildKpis(progress),
    insights: buildInsights({
      childName: child.name,
      streak,
      subjects,
      lowestAttempt,
    }),
    subjects,
    recommended: buildRecommendations(subjects),
    attempts,
    badges: buildBadges(progress, streak),
  }
}
