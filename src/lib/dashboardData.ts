// src/lib/dashboardData.ts
//
// Frontend types + client-side insight rule engine. The heavy lifting lives
// in `GET /api/me/dashboard` (api/services/dashboard.ts); this module just
// types the response and computes the 3 insight cards from the real data.

export type PeerComparison = 'above' | 'avg' | 'below'
export type AttemptAction = 'review' | 'celebrate' | 'continue'
export type RecommendedTag = 'FOKUS' | 'TANTANGAN' | 'LANJUTAN'
export type InsightType = 'focus' | 'strong' | 'tip'

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
  score: number
  trend: number
  peer: PeerComparison
  mastery: number
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
  icon: string
  earned: boolean
}

export interface DashboardInsight {
  type: InsightType
  icon: string
  kicker: string
  title: string
  body: string
  cta: string
  href: string
}

export interface DashboardViewModel {
  child: { id: string; name: string; ageLabel: string | null }
  level: number
  tierName: string
  xp: number
  xpToNext: number
  totalXp: number
  streak: number
  longestStreak: number
  recoveryEligible: boolean
  dailyGoalPct: number
  dailyGoalQuizzes: number
  screenTimeMin: number
  favTime: string
  heatmap: number[]
  todayIdx: number
  kpis: KpiTile[]
  insights: DashboardInsight[]
  subjects: DashboardSubject[]
  recommended: DashboardRecommendation[]
  attempts: DashboardAttempt[]
  badges: DashboardBadge[]
  quests: DashboardQuest[]
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
  reason: string
  tag: RecommendedTag
  subjectColorHex: string
  subjectInitial: string
  videoSlug: string
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
}

export interface DashboardApiResponse {
  child: { id: string; name: string; ageLabel: string | null }
  level: number
  tierName: string
  xp: number
  xpToNext: number
  totalXp: number
  streak: number
  longestStreak: number
  recoveryEligible: boolean
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
    reason: r.reason,
    tag: r.tag,
    subjectColorHex: r.subjectColorHex,
    subjectInitial: r.subjectInitial,
    href: `/videos/${r.videoSlug}`,
  }
}

// ─────────────────────────────────────────────────────────────────────
// Insight rule engine (client-side, pure)
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
// API → View model
// ─────────────────────────────────────────────────────────────────────

export function dashboardFromApi(payload: DashboardApiResponse): DashboardViewModel {
  const subjects = payload.subjects
  const attempts = payload.attempts
  const lowestAttempt = attempts.length
    ? [...attempts].sort((a, b) => a.score - b.score)[0]
    : undefined
  return {
    child: payload.child,
    level: payload.level,
    tierName: payload.tierName,
    xp: payload.xp,
    xpToNext: payload.xpToNext,
    totalXp: payload.totalXp,
    streak: payload.streak,
    longestStreak: payload.longestStreak,
    recoveryEligible: payload.recoveryEligible,
    dailyGoalPct: payload.dailyGoalPct,
    dailyGoalQuizzes: payload.dailyGoalQuizzes,
    screenTimeMin: payload.screenTimeMin,
    favTime: payload.favTime,
    heatmap: payload.heatmap,
    todayIdx: payload.todayIdx,
    kpis: payload.kpis.map(mapKpi),
    insights: buildInsights({
      childName: payload.child.name,
      streak: payload.streak,
      subjects,
      lowestAttempt,
    }),
    subjects,
    recommended: payload.recommended.map(mapRecommendation),
    attempts,
    badges: payload.badges,
    quests: payload.quests,
  }
}
