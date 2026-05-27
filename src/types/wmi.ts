export type WmiGrade = 0 | 1 | 2 | 3
export type WmiRound = 'semifinal' | 'final'
export type WmiAnswerType = 'multiple_choice' | 'fill_in'
export type WmiMode = 'drill' | 'exam'

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
}

export interface WmiPaperSummary {
  id: string
  year: number
  grade: WmiGrade
  round: WmiRound
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

export interface WmiAttemptResult {
  is_correct: boolean
  correct_answer: string
  hint_en: string | null
  hint_id: string | null
}
