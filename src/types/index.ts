export type UserRole = 'student' | 'teacher' | 'parent' | 'admin'

export interface User {
  id: string
  email: string
  phone: string | null
  name: string
  age: number | null
  age_group_id?: string | null
  role: UserRole
}

export interface AuthPayload {
  user: User
  token: string
  refreshToken: string
}

export interface Child {
  id: string
  parentUserId: string
  name: string
  ageGroupId: string | null
  avatarColor: string | null
  createdAt: string
  updatedAt: string
}

export interface SubjectOption {
  id: string
  name: string
  slug?: string
  colorHex: string
  description?: string | null
  defaultBadgeRanges?: Array<{
    minCorrect: number
    maxCorrect: number | null
    badgeCount: number
  }>
}

export interface AgeGroupOption {
  id: string
  name: string
  minAge: number
  maxAge: number
}

export interface VideoBadgeRange {
  id: string
  minCorrect: number
  maxCorrect: number | null
  badgeCount: number
}

export interface VideoCard {
  id: string
  slug: string
  title: string
  description?: string | null
  youtubeUrl: string
  youtubeVideoId: string
  thumbnailUrl: string
  // Drafts (isPublished=false) may have null subject/ageGroup/numberOfQuestions.
  // Public catalog endpoints filter to isPublished=true, so consumers there see
  // non-null values at runtime; admin pages must guard the null cases.
  numberOfQuestions: number | null
  difficulty: 'easy' | 'medium' | 'hard'
  isFeatured: boolean
  isPublished: boolean
  sortOrder: number
  publishedAt?: string | null
  subject: SubjectOption | null
  ageGroup: {
    id: string
    name: string
  } | null
}

export interface VideoDetail extends VideoCard {
  embedUrl: string
  badgeRanges: VideoBadgeRange[]
}

export interface RewardLedgerEntry {
  rewardType: string
  xpDelta: number
}

export interface ScoreLevelUp {
  previousLevel: number
  currentLevel: number
  currentTierName: string
}

export interface ScoreCompletedQuest {
  id: string
  code: string
  title: string
  xpAwarded: number
}

export interface ScoreUnlockedAchievement {
  id: string
  code: string
  title: string
  iconKey: string | null
  xpAwarded: number
}

export interface ScoreGamificationSummary {
  xpEarned: number
  ledgerEntries: RewardLedgerEntry[]
  totalXp: number
  currentLevel: number
  currentTierName: string
  levelUp: ScoreLevelUp | null
  streak: {
    current: number
    longest: number
    recoveryEligible: boolean
  }
  completedQuests: ScoreCompletedQuest[]
  unlockedAchievements: ScoreUnlockedAchievement[]
}

export interface ScoreAttemptResult {
  attempt: {
    id: string
    correctAnswers: number
    totalQuestions: number
    scorePercentage: number
    createdAt: string
  }
  earnedBadgeCount: number
  finalBadgeCount: number
  previousBadgeCount: number
  previousCorrectAnswers: number | null
  isUpgrade: boolean
  isCorrection: boolean
  subject: {
    id: string
    name: string
    slug: string
    colorHex: string
  }
  gamification?: ScoreGamificationSummary
}

export interface VideoScoreState {
  correctAnswers: number
  totalQuestions: number
  badgeCount: number
  scorePercentage: number
  latestAttemptAt: string
}

export interface ProgressSummary {
  attemptsCount: number
  averageScore: number
  videosCompleted: number
  badgesTotal: number
}

export interface RecentAttempt {
  id: string
  scorePercentage: number
  correctAnswers: number
  totalQuestions: number
  createdAt: string
  videoTitle: string
  videoSlug: string
  subjectName: string
  subjectColorHex: string
}

export interface VideoProgress {
  videoId: string
  videoTitle: string
  videoSlug: string
  bestScore: number
  bestCorrectAnswers: number
  badgeCount: number
  latestAttemptAt: string
  subject: {
    id: string
    name: string
    colorHex: string
  }
}

export type Predikat = 'SANGAT_BAIK' | 'BAIK' | 'CUKUP' | 'KURANG' | 'BELUM_MULAI'

export interface SubjectStatVideo {
  videoId: string
  videoSlug: string
  videoTitle: string
  bestScore: number
  bestCorrectAnswers: number
  totalQuestions: number
  badgeCount: number
  latestAttemptAt: string
}

export interface SubjectStat {
  id: string
  name: string
  slug: string
  colorHex: string
  totalVideosAvailable: number
  videosAttempted: number
  averageBestScore: number | null
  badgesEarned: number
  badgesAvailable: number
  predikat: Predikat
  videos: SubjectStatVideo[]
}

export interface MemberProgress {
  summary: ProgressSummary
  recentAttempts: RecentAttempt[]
  videoProgress: VideoProgress[]
  subjectStats: SubjectStat[]
  periodStart: string
  periodEnd: string
  child: {
    id: string
    name: string
    ageGroupId: string | null
    avatarColor: string | null
  } | null
}

export interface SubjectBadgeGroup {
  id: string
  name: string
  slug: string
  colorHex: string
  description: string | null
  totalBadges: number
  unlocks: Array<{
    videoId: string
    videoTitle: string
    videoSlug: string
    badgeCount: number
    bestCorrectAnswers: number
    totalQuestions: number
    unlockedAt: string
  }>
}

export interface PublicMeta {
  subjects: SubjectOption[]
  ageGroups: AgeGroupOption[]
  stats: {
    featuredVideos: number
  }
}

export interface AdminVideoFormValues {
  title: string
  slug: string
  youtubeUrl: string
  thumbnailUrl: string
  // In draft mode (isPublished=false) these may be empty/null — the server
  // accepts the relaxed shape and the editor only enforces them when the
  // admin flips isPublished to true.
  subjectId: string
  ageGroupId: string
  numberOfQuestions: number | null
  difficulty: 'easy' | 'medium' | 'hard'
  description: string
  isPublished: boolean
  isFeatured: boolean
  sortOrder: number
  badgeRanges: Array<{
    minCorrect: number
    maxCorrect: number | null
    badgeCount: number
  }>
}

export interface ChannelVideoItem {
  id: string
  title: string
  publishedAt: string | null
  thumbnailUrl: string
  durationSeconds: number
  alreadyImported: boolean
  available: boolean
  unavailableReason?: string
}

export interface ChannelVideoListResponse {
  items: ChannelVideoItem[]
  page: number
  pageCount: number
  total: number
}

export type ImportResultStatus = 'created' | 'already_imported' | 'error'

export interface ImportResult {
  youtubeVideoId: string
  status: ImportResultStatus
  videoId?: string
  error?: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
  message?: string
}
