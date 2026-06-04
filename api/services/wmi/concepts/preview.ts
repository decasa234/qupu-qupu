// Admin-only concept proofreading: list every registered concept and generate
// sample rendered instances on the fly. Pure in-memory — no DB reads/writes,
// no bootstrap. Used by the /admin/wmi/concepts proofreading page.
import { mulberry32 } from './rng.js'
import { ALL_SLUGS, CONCEPTS, getConcept } from './registry.js'

const DOMAIN_LABEL: Record<string, string> = {
  ARI: 'Arithmetic & Operations',
  NUM: 'Number Sense & Place Value',
  WORD: 'Word Problems',
  PAT: 'Patterns & Sequences',
  LOG: 'Logic & Reasoning',
  CNT: 'Counting & Combinatorics',
  GEO: 'Geometry & Spatial',
  MEA: 'Measurement & Time',
  DAT: 'Data, Tables & Classification',
  OTHER: 'Other',
}
const DOMAIN_ORDER = ['ARI', 'NUM', 'WORD', 'PAT', 'LOG', 'CNT', 'GEO', 'MEA', 'DAT', 'OTHER']

// Maps each built concept to its taxonomy domain (see docs/wmi-concepts/).
// New concepts not listed here fall back to OTHER until added.
const DOMAIN_BY_SLUG: Record<string, string> = {
  'single-digit-addition': 'ARI',
  'single-digit-subtraction': 'ARI',
  'multiplication-small': 'ARI',
  'arithmetic-expression-eval': 'ARI',
  'which-expression-equals': 'ARI',
  'custom-operation': 'ARI',
  'digit-sum': 'NUM',
  'place-value': 'NUM',
  'compare-order-numbers': 'NUM',
  'reverse-arithmetic-puzzle': 'NUM',
  'find-number-by-digit-sum': 'NUM',
  'story-sum': 'WORD',
  'money-shopping-change': 'WORD',
  'legs-items-rate': 'WORD',
  'pattern-next': 'PAT',
  'count-objects': 'CNT',
  'shape-perimeter-square': 'GEO',
  'clock-time-after': 'MEA',
}

export interface ConceptSummary {
  slug: string
  name_en: string
  name_id: string
  description_id: string | null
  grades: number[]
  domain: string
  domain_label: string
}

export function listConceptsForPreview(): ConceptSummary[] {
  return ALL_SLUGS.map((slug) => {
    const c = CONCEPTS[slug]
    const domain = DOMAIN_BY_SLUG[slug] ?? 'OTHER'
    return {
      slug,
      name_en: c.meta.name_en,
      name_id: c.meta.name_id,
      description_id: c.meta.description_id ?? null,
      grades: [...c.meta.grades],
      domain,
      domain_label: DOMAIN_LABEL[domain],
    }
  }).sort(
    (a, b) =>
      DOMAIN_ORDER.indexOf(a.domain) - DOMAIN_ORDER.indexOf(b.domain) ||
      a.name_en.localeCompare(b.name_en),
  )
}

export interface ConceptSample {
  seed: number
  params?: unknown
  body_en?: string
  body_id?: string
  answer_type?: 'multiple_choice' | 'fill_in'
  choices_en?: { label: string; text: string }[] | null
  choices_id?: { label: string; text: string }[] | null
  answer?: string
  hint_en?: string | null
  hint_id?: string | null
  hint_steps_en?: string[] | null
  hint_steps_id?: string[] | null
  error?: string
}

export function sampleConcept(slug: string, count: number, baseSeed: number): ConceptSample[] {
  const concept = getConcept(slug)
  if (!concept) throw new Error('Concept not found')
  const out: ConceptSample[] = []
  for (let i = 0; i < count; i++) {
    const seed = baseSeed + i
    try {
      const params = concept.generate(mulberry32(seed))
      concept.paramsSchema.parse(params)
      const r = concept.render(params)
      out.push({
        seed,
        params,
        body_en: r.body_en,
        body_id: r.body_id,
        answer_type: r.answer_type,
        choices_en: r.choices_en,
        choices_id: r.choices_id,
        answer: r.answer,
        hint_en: r.hint_en,
        hint_id: r.hint_id,
        hint_steps_en: r.hint_steps_en ?? null,
        hint_steps_id: r.hint_steps_id ?? null,
      })
    } catch (e) {
      out.push({ seed, error: e instanceof Error ? e.message : String(e) })
    }
  }
  return out
}
