export type WmiGrade = 0 | 1 | 2 | 3
export type WmiRound = 'semifinal' | 'final'
export type WmiAnswerType = 'multiple_choice' | 'fill_in'
export type WmiMode = 'drill' | 'exam' | 'concept'

export interface WmiChoice {
  label: string
  text: string
}

export interface WmiGlossaryTerm {
  id: string
  slug: string
  term_en: string
  term_id: string
  definition_en: string
  definition_id: string
  example_en: string | null
  example_id: string | null
}

// Authored problem decomposition (question-designer output). Mirrors the backend
// definition in api/services/wmi/concepts/types.ts — keep the two in sync.
export type BreakdownCategory = 'fact' | 'condition' | 'question' | 'object'
export interface BreakdownHighlight {
  category: BreakdownCategory
  phrase_en: string
  phrase_id: string
  note_en: string
  note_id: string
}
export interface BreakdownQuantity {
  label_en: string
  label_id: string
  value: string
}
export interface BreakdownStrategy {
  conceptSlug?: string
  name_en: string
  name_id: string
}
export interface BreakdownTrap {
  wrong: string
  why_en: string
  why_id: string
}
export interface BreakdownAnswer {
  form: 'number' | 'choice' | 'unit'
  unit: string | null
  value: string
}
export interface Breakdown {
  needsVisual: boolean
  highlights: BreakdownHighlight[]
  quantities: BreakdownQuantity[]
  strategy: BreakdownStrategy
  trap: BreakdownTrap | null
  answer: BreakdownAnswer
  vocab?: string[]
}

export interface WmiQuestion {
  id: string
  paper_id: string
  number: number
  body_en: string
  body_id: string
  answer_type: WmiAnswerType
  choices_en: WmiChoice[] | null
  choices_id: WmiChoice[] | null
  figure_url: string | null
  hint_en: string | null
  hint_id: string | null
  difficulty: number | null
  code?: string
  hint_steps_en?: string[] | null
  hint_steps_id?: string[] | null
  breakdown?: Breakdown | null
  visual?: { templateId: string; params: unknown } | null
}

export interface WmiPaperSummary {
  id: string
  year: number
  grade: WmiGrade
  round: WmiRound
  variant: 'A' | 'B'
  title: string
  source_url: string | null
  recommended_duration_min: number
  question_count: number
  best_score: number | string | null
}

export interface WmiPaperDetail extends Omit<WmiPaperSummary, 'best_score'> {
  questions: WmiQuestion[]
  // Resumable (started, never completed) exam session for this child —
  // present on the /papers/:id detail read, absent in exam snapshots.
  openSession?: { id: string; started_at: string } | null
}

export interface WmiExamSession {
  id: string
  child_id: string
  paper_id: string
  started_at: string
  completed_at: string | null
  duration_ms: number | null
  correct_count: number | null
  total_questions: number
  abandoned: boolean
}

export interface WmiSubmittedAttempt {
  question_id: string
  selected_answer: string
  is_correct: boolean
  revealed_id_translation: boolean
  looked_up_terms: string[]
}

export interface WmiExamSnapshot {
  session: WmiExamSession
  paper: WmiPaperDetail
  submittedAttempts: WmiSubmittedAttempt[]
}

export interface WmiAttemptInput {
  childId: string
  question_id: string
  mode: WmiMode
  session_id?: string | null
  selected_answer: string
  time_taken_ms?: number | null
  revealed_id_translation?: boolean
  looked_up_terms?: string[]
}

export interface WmiConceptReward {
  xpEarned: number
  coinsEarned: number
  totalXp: number
  coinBalance: number
  level: number
  tierName: string
  levelUp: { previousLevel: number; currentLevel: number; tierName: string } | null
  streak: { current: number; longest: number }
  // Set when this answer crossed one or more concept tiers — the one-time
  // bonus is already folded into xpEarned/coinsEarned. Optional: older
  // responses predate the field.
  tierUp?: { toTier: number; bonusXp: number; bonusCoins: number } | null
}

export interface WmiAttemptResult {
  is_correct: boolean
  correct_answer: string
  hint_en: string | null
  hint_id: string | null
  hint_steps_en: string[] | null
  hint_steps_id: string[] | null
  // Present only for concept attempts — XP/coins/streak granted for this answer.
  gamification?: WmiConceptReward
}

export interface WmiConceptQuestion {
  concept_instance_id: string
  concept_slug: string
  concept_name_id: string
  concept_name_en: string
  tags: string[]
  params: unknown
  body_en: string
  body_id: string
  answer_type: 'multiple_choice' | 'fill_in'
  choices_en: WmiChoice[] | null
  choices_id: WmiChoice[] | null
  hint_en: string | null
  hint_id: string | null
  hint_steps_en: string[] | null
  hint_steps_id: string[] | null
  // Authored color-coded breakdown (recomputed server-side from params), so the
  // konsep session/drill show the same WmiAuthoredBreakdown that papers do.
  breakdown?: Breakdown | null
}

export interface WmiConceptVoteResult {
  upvotes: number
  downvotes: number
}

// ── WMI Claire (isolated warmup drill) ────────────────────────────────────
export interface WmiClaireQuestion {
  index: number
  concept_slug: string
  concept_name_id: string
  concept_name_en: string
  params: unknown
  body_en: string
  body_id: string
  answer_type: 'multiple_choice' | 'fill_in'
  choices_en: WmiChoice[] | null
  choices_id: WmiChoice[] | null
  numeric_answer: boolean
  hint_en: string | null
  hint_id: string | null
  hint_steps_en: string[] | null
  hint_steps_id: string[] | null
  breakdown?: Breakdown | null
}

export interface WmiClaireAnswerResult {
  is_correct: boolean
  correct_answer: string
  hint_en: string | null
  hint_id: string | null
  done: boolean
  score: number | null
}

export interface WmiClaireRoundSummary {
  id: string
  score: number | null
  total: number
  created_at: string
  completed_at: string | null
}

export interface WmiClaireReviewItem {
  index: number
  concept_name_id: string
  concept_name_en: string
  body_id: string
  body_en: string
  correct_answer: string
  selected: string | null
  is_correct: boolean | null
}

export interface WmiClaireRoundReview {
  id: string
  score: number | null
  total: number
  completed_at: string | null
  items: WmiClaireReviewItem[]
}

// ── WMI Claire mock exams ─────────────────────────────────────────────────
export type WmiMockRound = 'final' | 'semifinal'

export type WmiMockQuestion = WmiQuestion & { index: number; part: 'A' | 'B' }

export interface WmiMockAnswerResult {
  is_correct: boolean
  correct_answer: string
  hint_en: string | null
  hint_id: string | null
  done: boolean
  score: number | null
}

export interface WmiMockExamSummary {
  id: string
  round: string
  score: number | null
  total: number
  created_at: string
  completed_at: string | null
}

export interface WmiMockReviewItem {
  index: number
  part: 'A' | 'B'
  number: number
  code: string
  body_id: string
  body_en: string
  choices_id: WmiChoice[] | null
  breakdown: Breakdown | null
  correct_answer: string
  selected: string | null
  is_correct: boolean | null
}

export interface WmiMockReview {
  id: string
  round: string
  score: number | null
  total: number
  completed_at: string | null
  items: WmiMockReviewItem[]
}

export type WmiConceptStatus = 'mastered' | 'in_progress' | 'not_started'

export interface WmiConceptProgress {
  slug: string
  nameEn: string
  nameId: string
  descriptionId: string | null
  grades: number[]
  attempts: number
  correct: number
  status: WmiConceptStatus
  progress: number
  lastAttemptAt: string | null
}

export interface WmiConceptProgressSummary {
  masteryTarget: number
  totalConcepts: number
  mastered: number
  inProgress: number
  notStarted: number
  totalCorrect: number
  totalAttempts: number
  overallProgress: number
  concepts: WmiConceptProgress[]
}

export interface WmiConceptAttemptInput {
  childId: string
  concept_instance_id: string
  mode: 'concept'
  selected_answer: string
  time_taken_ms?: number
  revealed_id_translation?: boolean
  looked_up_terms?: string[]
}

export type WmiComprehensionTier = 0 | 1 | 2 | 3 | 4

export interface WmiGardenConcept {
  slug: string
  nameId: string
  nameEn: string
  difficulty: number
  tier: WmiComprehensionTier
  pct: number
  tags: string[]
  attempts: number
  correct: number
}
export interface WmiGardenChapter {
  subjectKey: string
  nameId: string
  nameEn: string
  colorHex: string
  iconKey: string
  concepts: WmiGardenConcept[]
  meanPct: number
  grownCount: number
  total: number
  unlocked: boolean
  testedOut: boolean
}
export interface WmiGarden {
  grade: WmiGrade
  chapters: WmiGardenChapter[]
  nextConceptSlug: string | null
}

export interface WmiChapterTestQuestion {
  concept_instance_id: string
  concept_slug: string
  body_id: string
  body_en: string
  answer_type: WmiAnswerType
  choices_id: WmiChoice[] | null
  choices_en: WmiChoice[] | null
}
export interface WmiChapterTestResult {
  passed: boolean
  score_pct: number
  correct: number
  total: number
  // Granted once per (child, chapter) on the FIRST pass — 0 on repeat passes
  // where the backend reward ledger no-op'd.
  xp_earned: number
  coins_earned: number
}

export interface WmiKonsepGradeResult {
  is_correct: boolean
  correct_answer: string
  hint_en: string | null
  hint_id: string | null
  hint_steps_en: string[] | null
  hint_steps_id: string[] | null
}
export interface WmiConceptGrown {
  slug: string
  nameId: string
  fromTier: number
  toTier: number
  // One-time tier-up bonus XP granted by this commit (shown on the growth
  // beat). Optional: results stored before this field existed replay without it.
  bonusXp?: number
}
// Mirrors CompletedQuest / UnlockedAchievement in api/services/wmi/concepts/session.ts.
export interface WmiCompletedQuest {
  id: string
  code: string
  title: string
  // CLAIMABLE reward (P2.2) — paid via the Misi Hari Ini claim button, NOT
  // included in this commit's totals.
  rewardXp?: number
  rewardCoins?: number
  // Legacy auto-grant amounts — only on results stored before the claim
  // ritual (replayed sessions); those WERE included in the totals.
  xpAwarded?: number
  coinsAwarded?: number
}
export interface WmiUnlockedAchievement {
  id: string
  code: string
  title: string
  iconKey: string | null
  xpAwarded: number
}
export interface WmiKonsepSessionResult {
  correct: number
  total: number
  xpEarned: number
  coinsEarned: number
  conceptsGrown: WmiConceptGrown[]
  level: number
  tierName: string
  coinBalance: number
  // Streak shields owned after the commit. Optional: results stored before
  // this field existed replay without it.
  streakShields?: number
  levelUp: { previousLevel: number; currentLevel: number; tierName: string } | null
  streak: { current: number; longest: number }
  completedQuests: WmiCompletedQuest[]
  unlockedAchievements: WmiUnlockedAchievement[]
  // Chapter chests opened by this commit (50%/100% grown) — already folded
  // into xpEarned/coinsEarned. Optional: pre-P2.2 stored results lack it.
  chests?: { threshold: number; coins: number; xp: number }[]
  // Variable 2-6 coin session drop, already folded into coinsEarned.
  // Optional: pre-P2.2 stored results lack it.
  sessionDrop?: number
  // True when this commit completed + paid out the weekly Misi Keluarga
  // (P2.3); the committing child's coin share is already folded into
  // coinsEarned/coinBalance. Optional: older stored results lack it.
  familyQuestCompleted?: boolean
  // True when the server replayed an already-committed session (idempotency
  // hit) — skip celebration analytics + stat-strip sync.
  replayed?: boolean
}

// ── QUPU track (garden path 2.0: units/nodes/gates) ───────────────────────
export interface TrackConceptNodeState {
  kind: 'concept'
  slug: string
  nameId: string
  level: number
  gold: boolean
}
export interface TrackGateNodeState {
  kind: 'gate'
  key: string
  problemRef: string
  requires: string[]
  unlocked: boolean
  cleared: boolean
}
export type TrackNodeState = TrackConceptNodeState | TrackGateNodeState
export interface TrackUnitState {
  key: string
  nameId: string
  colorHex: string
  iconKey: string
  unlocked: boolean
  nodes: TrackNodeState[]
}
export interface TrackState {
  trackId: string
  theme: string
  status: string
  units: TrackUnitState[]
}
export interface TrackLessonQuestion {
  instanceId: string
  conceptSlug: string
  level: number
  recall: boolean
  bodyId: string
  bodyEn: string
  answerType: 'multiple_choice' | 'fill_in'
  choicesId: WmiChoice[] | null
  choicesEn: WmiChoice[] | null
}
export interface TrackLessonResult {
  focusCorrect: number
  passed: boolean
  levelBefore: number
  levelAfter: number
  // Present whenever this commit's level-up granted a reward (0/0 on a
  // repeat pass at an already-cleared level, or on a fail).
  xpEarned: number
  coinsEarned: number
}
export interface TrackGateView {
  unlocked: boolean
  cleared: boolean
  question: {
    bodyId: string
    bodyEn: string
    answerType: string
    choicesId: WmiChoice[] | null
    choicesEn: WmiChoice[] | null
  } | null
}
export interface TrackGateSubmitResult {
  correct: boolean
  cleared: boolean
  // Present only on the request that actually clears the gate for the
  // first time (0/0 on a correct-but-already-cleared idempotent resubmit).
  xpEarned: number
  coinsEarned: number
}
