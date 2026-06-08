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
export type BreakdownCategory = 'fact' | 'condition' | 'question'
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
}

export interface WmiConceptVoteResult {
  upvotes: number
  downvotes: number
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
}
