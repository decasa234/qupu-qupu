// Admin-only concept proofreading: list every registered concept and generate
// sample rendered instances on the fly. Pure in-memory — no DB reads/writes,
// no bootstrap. Used by the /admin/wmi/concepts proofreading page.
import { mulberry32 } from './rng.js'
import { ALL_SLUGS, CONCEPTS, getConcept } from './registry.js'
import {
  CONCEPT_TAGS,
  SHORT_ID_BY_SLUG,
  STRAND_ORDER,
  TOPICS,
  strandLabel,
  topicLabel,
  type ConceptTags,
  type StrandCode,
} from './taxonomy.js'

const TOPIC_ORDER = new Map(TOPICS.map((t, i) => [t.code, i]))

function shortIdNum(code: string): number {
  const n = parseInt(code.slice(1), 10)
  return Number.isNaN(n) ? 999 : n
}

// Concepts whose illustration most urgently needs a human eyeball (subtle
// geometry where a drawing bug is most likely and hardest to catch). These get
// a red flag on the proofreading page until reviewed.
const HIGH_PRIORITY = new Set([
  'clock-read-time',
  'block-count-3d',
  'maze-path-shortest',
  'same-figure-identify',
  'count-shapes-in-figure',
  'angle-type',
  'dice-net-fold',
])

export interface ConceptSummary {
  slug: string
  short_id: string
  name_en: string
  name_id: string
  description_id: string | null
  grades: number[]
  strand: StrandCode
  strand_label: string
  topic: string
  topic_label: string
  difficulty: 1 | 2 | 3 | 4 | 5
  isOlympiad: boolean
  priority: 'high' | 'normal'
}

// Defensive only — the taxonomy.test.ts invariant guarantees every registered
// concept is tagged, so this fallback should never be hit at runtime.
const FALLBACK_TAG: ConceptTags = { strand: 'AR', topic: 'AR-OPS', difficulty: 3, isOlympiad: false }

export function listConceptsForPreview(): ConceptSummary[] {
  return ALL_SLUGS.map((slug) => {
    const c = CONCEPTS[slug]
    const tag = CONCEPT_TAGS[slug] ?? FALLBACK_TAG
    return {
      slug,
      short_id: SHORT_ID_BY_SLUG[slug] ?? '',
      name_en: c.meta.name_en,
      name_id: c.meta.name_id,
      description_id: c.meta.description_id ?? null,
      grades: [...c.meta.grades],
      strand: tag.strand,
      strand_label: strandLabel(tag.strand, 'en'),
      topic: tag.topic,
      topic_label: topicLabel(tag.topic, 'en'),
      difficulty: tag.difficulty,
      isOlympiad: tag.isOlympiad,
      priority: HIGH_PRIORITY.has(slug) ? ('high' as const) : ('normal' as const),
    }
  }).sort(
    (a, b) =>
      STRAND_ORDER.indexOf(a.strand) - STRAND_ORDER.indexOf(b.strand) ||
      (TOPIC_ORDER.get(a.topic) ?? 999) - (TOPIC_ORDER.get(b.topic) ?? 999) ||
      shortIdNum(a.short_id) - shortIdNum(b.short_id) ||
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
  breakdown?: import('./types.js').Breakdown | null
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
        breakdown: r.breakdown ?? null,
      })
    } catch (e) {
      out.push({ seed, error: e instanceof Error ? e.message : String(e) })
    }
  }
  return out
}
