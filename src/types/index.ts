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
  numberOfQuestions: number
  difficulty: 'easy' | 'medium' | 'hard'
  isFeatured: boolean
  isPublished: boolean
  sortOrder: number
  publishedAt?: string | null
  subject: SubjectOption
  ageGroup: {
    id: string
    name: string
  }
}

export interface VideoDetail extends VideoCard {
  embedUrl: string
  badgeRanges: VideoBadgeRange[]
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
  isUpgrade: boolean
  subject: {
    id: string
    name: string
    slug: string
    colorHex: string
  }
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

export interface SubjectBadgeTotal {
  id: string
  name: string
  slug: string
  colorHex: string
  totalBadges: number
  videosWithBadges: number
}

export interface MemberProgress {
  summary: ProgressSummary
  recentAttempts: RecentAttempt[]
  videoProgress: VideoProgress[]
  subjectTotals: SubjectBadgeTotal[]
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
  subjectId: string
  ageGroupId: string
  numberOfQuestions: number
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

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
  message?: string
}
