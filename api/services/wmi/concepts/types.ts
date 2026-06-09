import type { ZodType } from 'zod'

export interface Rng {
  int(minInclusive: number, maxInclusive: number): number
  pick<T>(items: readonly T[]): T
  shuffle<T>(items: readonly T[]): T[]
}

export type WmiChoice = { label: string; text: string }

// Authored problem decomposition produced by the question-designer role. One
// object: bilingual where it is prose, language-neutral where it is data.
// Both shown to learners (the "Q" panel) and the shared brief the illustrator /
// step-explainer / animator bind to. Mirrored on the frontend in src/types/wmi.ts.
// One spotlighted span in the problem text. Color-coded by category and clickable
// to reveal a short kid-friendly note about why it matters. `phrase_*` must be a
// substring of the rendered body in that language. Categories are open-ended;
// the renderer assigns a colour per category and falls back gracefully.
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
  value: string // pre-formatted for display, e.g. "30, 50, 90, 120" or "160"
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
  // Learner-facing: color-coded, clickable spans spotlighted in the problem text.
  highlights: BreakdownHighlight[]
  // Machine brief (drives the illustrator / step-explainer / animator):
  quantities: BreakdownQuantity[]
  strategy: BreakdownStrategy
  // Only present when the problem has a genuine tempting wrong answer.
  trap: BreakdownTrap | null
  answer: BreakdownAnswer
  vocab?: string[]
}

export interface Rendered {
  body_en: string
  body_id: string
  answer_type: 'multiple_choice' | 'fill_in'
  choices_en: WmiChoice[] | null
  choices_id: WmiChoice[] | null
  answer: string
  hint_en: string | null
  hint_id: string | null
  hint_steps_en?: string[] | null
  hint_steps_id?: string[] | null
  breakdown?: Breakdown | null
}

export interface ConceptMeta {
  slug: string
  name_en: string
  name_id: string
  grades: readonly number[]
  description_id?: string
}

export interface ConceptLogic<P> {
  meta: ConceptMeta
  paramsSchema: ZodType<P>
  generate(rng: Rng): P
  render(params: P): Rendered
}
