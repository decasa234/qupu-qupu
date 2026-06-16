import type { Breakdown } from '../concepts/types.js'

/** Binds a question to a reusable explainer-pool template (Approach A). */
export interface QuestionVisualBinding {
  templateId: string
  params: unknown
}

export interface PaperQuestion {
  number: number
  body_en: string
  body_id: string
  answer_type: 'multiple_choice' | 'fill_in'
  choices_en?: Array<{ label: string; text: string }>
  choices_id?: Array<{ label: string; text: string }>
  answer: string
  figure_url?: string
  hint_en?: string
  hint_id?: string
  hint_steps_en?: string[]
  hint_steps_id?: string[]
  breakdown?: Breakdown
  visual?: QuestionVisualBinding
  difficulty?: number
}

export interface PaperFile {
  brand: string                 // brand slug; defaults handled at load time as 'wmi'
  year: number
  grade?: number                // legacy WMI; optional for other brands
  level: string                 // brand level key (e.g. 'g2')
  round: string                 // brand round key
  variant?: string              // default 'A'
  title: string
  source_url?: string
  recommended_duration_min: number
  questions: PaperQuestion[]
}
