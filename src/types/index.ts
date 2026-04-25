export type UserRole = 'student' | 'teacher' | 'parent' | 'admin'

export interface User {
  id: string
  email: string
  phone: string
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
  colorHex: string
}

export interface AgeGroupOption {
  id: string
  name: string
  minAge: number
  maxAge: number
}

export interface BadgeFamily {
  id: string
  name: string
  slug: string
  colorHex: string
  description?: string | null
}

export interface VideoBadgeRule {
  badgeTierId: string
  tier: number
  name: string
  iconName: string
  colorHex: string
  minCorrect: number
  maxCorrect: number | null
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
  badgeFamily: BadgeFamily
}

export interface VideoDetail extends VideoCard {
  embedUrl: string
  badgeRules: VideoBadgeRule[]
}

export interface ScoreAttemptResult {
  attempt: {
    id: string
    correctAnswers: number
    totalQuestions: number
    scorePercentage: number
    createdAt: string
  }
  unlockedBadge: null | {
    familyId: string
    familyName: string
    tier: number
    tierName: string
    colorHex: string
    iconName: string
  }
  isUpgrade: boolean
}

export interface ProgressSummary {
  attemptsCount: number
  averageScore: number
  videosCompleted: number
  badgesUnlocked: number
  tierThreeUnlocks: number
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
  latestAttemptAt: string
  unlockedTier: null | {
    tier: number
    name: string
    colorHex: string
    familyName: string
    familyColorHex: string
  }
}

export interface MemberProgress {
  summary: ProgressSummary
  recentAttempts: RecentAttempt[]
  videoProgress: VideoProgress[]
  child: {
    id: string
    name: string
    ageGroupId: string | null
    avatarColor: string | null
  } | null
}

export interface BadgeUnlockFamily {
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

export interface PublicMeta {
  subjects: SubjectOption[]
  ageGroups: AgeGroupOption[]
  badgeFamilies: BadgeFamily[]
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
  badgeFamilyId: string
  numberOfQuestions: number
  difficulty: 'easy' | 'medium' | 'hard'
  description: string
  isPublished: boolean
  isFeatured: boolean
  sortOrder: number
  badgeRules: Array<{
    tier: number
    minCorrect: number
    maxCorrect: number | null
  }>
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
  message?: string
}
