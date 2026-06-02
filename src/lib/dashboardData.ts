// src/lib/dashboardData.ts
//
// Frontend types for the dashboard payload. The heavy lifting lives in
// `GET /api/me/dashboard` (api/services/dashboard.ts); this module just
// types the response and adapts it into the view model.

import api from './api'

export type PeerComparison = 'above' | 'avg' | 'below'
export type AttemptAction = 'review' | 'celebrate' | 'continue'

export interface KpiTile {
  key: string
  iconClass: string         // font-awesome class
  iconBg: string            // hex
  value: string             // pre-formatted by server
  label: string
  trend: number
  trendUnit: '%' | string
  sparkline: number[]
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
  href: string
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

export interface DashboardViewModel {
  child: { id: string; name: string; ageLabel: string | null }
  level: number
  tierName: string
  xp: number
  xpToNext: number
  totalXp: number
  coinBalance: number
  streak: number
  longestStreak: number
  recoveryEligible: boolean
  loginBonus: LoginBonusState
  dailyGoalPct: number
  dailyGoalQuizzes: number
  screenTimeMin: number
  favTime: string
  heatmap: number[]
  todayIdx: number
  kpis: KpiTile[]
  subjects: DashboardSubject[]
  recommended: DashboardRecommendation[]
  attempts: DashboardAttempt[]
  badges: DashboardBadge[]
  quests: DashboardQuest[]
}

export interface LoginBonusState {
  claimedToday: boolean
  coinReward: number
}

// ─────────────────────────────────────────────────────────────────────
// Raw API payload (matches api/services/dashboard.ts DashboardPayload)
// ─────────────────────────────────────────────────────────────────────

interface ApiKpi {
  key: 'attempts' | 'score' | 'videos' | 'badges'
  value: string
  numericValue: number
  trend: number
  trendUnit: '%' | 'video' | 'baru'
  sparkline: number[]
}

interface ApiRecommendation {
  id: string
  title: string
  subjectName: string
  subjectColorHex: string
  thumbnailUrl: string
  publishedAt: string | null
  videoSlug: string
}

export interface DashboardApiResponse {
  child: { id: string; name: string; ageLabel: string | null }
  level: number
  tierName: string
  xp: number
  xpToNext: number
  totalXp: number
  coinBalance: number
  streak: number
  longestStreak: number
  recoveryEligible: boolean
  loginBonus: LoginBonusState
  dailyGoalPct: number
  dailyGoalQuizzes: number
  screenTimeMin: number
  favTime: string
  heatmap: number[]
  todayIdx: number
  kpis: ApiKpi[]
  subjects: DashboardSubject[]
  recommended: ApiRecommendation[]
  attempts: DashboardAttempt[]
  badges: DashboardBadge[]
  quests: DashboardQuest[]
}

// ─────────────────────────────────────────────────────────────────────
// KPI presentation
// ─────────────────────────────────────────────────────────────────────

const KPI_META: Record<ApiKpi['key'], { iconClass: string; iconBg: string; label: string }> = {
  attempts: { iconClass: 'fa-solid fa-bolt',         iconBg: '#F0853A', label: 'Quiz selesai' },
  score:    { iconClass: 'fa-solid fa-star',         iconBg: '#FFDD55', label: 'Skor rata-rata' },
  videos:   { iconClass: 'fa-solid fa-circle-play',  iconBg: '#58CC02', label: 'Video selesai' },
  badges:   { iconClass: 'fa-solid fa-medal',        iconBg: '#8A5BF0', label: 'Lencana' },
}

function mapKpi(k: ApiKpi): KpiTile {
  const meta = KPI_META[k.key]
  return {
    key: k.key,
    iconClass: meta.iconClass,
    iconBg: meta.iconBg,
    value: k.value,
    label: meta.label,
    trend: k.trend,
    trendUnit: k.trendUnit,
    sparkline: k.sparkline,
  }
}

function mapRecommendation(r: ApiRecommendation): DashboardRecommendation {
  return {
    id: r.id,
    title: r.title,
    subjectName: r.subjectName,
    subjectColorHex: r.subjectColorHex,
    thumbnailUrl: r.thumbnailUrl,
    publishedAt: r.publishedAt,
    href: `/quiz/${r.videoSlug}`,
  }
}

// ─────────────────────────────────────────────────────────────────────
// API → View model
// ─────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────
// Daily login bonus claim
// ─────────────────────────────────────────────────────────────────────

export interface LoginBonusClaimResult {
  claimed: boolean
  alreadyClaimedToday: boolean
  coinsAwarded: number
  coinBalance: number
}

export async function claimLoginBonus(childId: string): Promise<LoginBonusClaimResult> {
  const res = await api.post('/me/login-bonus', { childId })
  return res.data.data as LoginBonusClaimResult
}

export function dashboardFromApi(payload: DashboardApiResponse): DashboardViewModel {
  return {
    child: payload.child,
    level: payload.level,
    tierName: payload.tierName,
    xp: payload.xp,
    xpToNext: payload.xpToNext,
    totalXp: payload.totalXp,
    coinBalance: payload.coinBalance,
    streak: payload.streak,
    longestStreak: payload.longestStreak,
    recoveryEligible: payload.recoveryEligible,
    loginBonus: payload.loginBonus,
    dailyGoalPct: payload.dailyGoalPct,
    dailyGoalQuizzes: payload.dailyGoalQuizzes,
    screenTimeMin: payload.screenTimeMin,
    favTime: payload.favTime,
    heatmap: payload.heatmap,
    todayIdx: payload.todayIdx,
    kpis: payload.kpis.map(mapKpi),
    subjects: payload.subjects,
    recommended: payload.recommended.map(mapRecommendation),
    attempts: payload.attempts,
    badges: payload.badges,
    quests: payload.quests,
  }
}
