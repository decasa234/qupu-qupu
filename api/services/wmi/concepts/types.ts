import type { ZodType } from 'zod'

export interface Rng {
  int(minInclusive: number, maxInclusive: number): number
  pick<T>(items: readonly T[]): T
  shuffle<T>(items: readonly T[]): T[]
}

export type WmiChoice = { label: string; text: string }

export interface Rendered {
  body_en: string
  body_id: string
  answer_type: 'multiple_choice' | 'fill_in'
  choices_en: WmiChoice[] | null
  choices_id: WmiChoice[] | null
  answer: string
  hint_en: string | null
  hint_id: string | null
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
