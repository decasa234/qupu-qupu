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
  difficulty?: number
}

export interface PaperFile {
  year: number
  grade: number
  round: 'semifinal' | 'final'
  variant: 'A' | 'B'
  title: string
  source_url?: string
  recommended_duration_min: number
  questions: PaperQuestion[]
}
