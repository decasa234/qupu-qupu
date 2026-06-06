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
  'alternating-chain-eval': 'ARI',
  'mistaken-digit-correction': 'ARI',
  'missing-addend': 'ARI',
  'digit-sum': 'NUM',
  'place-value': 'NUM',
  'compare-order-numbers': 'NUM',
  'reverse-arithmetic-puzzle': 'NUM',
  'find-number-by-digit-sum': 'NUM',
  'build-number-from-digit-clues': 'NUM',
  'more-or-less-by-k': 'NUM',
  'divisibility-multiple-property': 'NUM',
  'digit-frequency': 'NUM',
  'odd-even-reasoning': 'NUM',
  'perfect-square-search': 'NUM',
  'product-of-consecutive': 'NUM',
  'fraction-of-region': 'NUM',
  'arrange-digits-to-form-number': 'NUM',
  'equivalent-fraction-fill': 'NUM',
  'story-sum': 'WORD',
  'money-shopping-change': 'WORD',
  'legs-items-rate': 'WORD',
  'distance-rate-time': 'WORD',
  'weight-balance-word': 'WORD',
  'lacking-money-shared': 'WORD',
  'budget-selection': 'WORD',
  'money-coins-total': 'WORD',
  'net-progress-cycles': 'WORD',
  'rope-wraps-ratio': 'WORD',
  'pattern-next': 'PAT',
  'number-pyramid': 'PAT',
  'number-line-jumps': 'PAT',
  'visual-pattern-next': 'PAT',
  'shape-transformation-rule': 'PAT',
  'position-in-line': 'LOG',
  'assignment-cycle': 'LOG',
  'operator-fill': 'LOG',
  'which-might-be': 'LOG',
  'range-count-evaluate': 'LOG',
  'sum-partition-split': 'LOG',
  'venn-set-membership': 'LOG',
  'truth-order-clues': 'LOG',
  'count-objects': 'CNT',
  'combination-product-sum': 'CNT',
  'count-shapes-in-figure': 'CNT',
  'count-rectangles-grid': 'CNT',
  'make-groups-leftover': 'CNT',
  'shape-perimeter-square': 'GEO',
  'dice-opposite-faces': 'GEO',
  'direction-orientation': 'GEO',
  'shape-perimeter-rectangle': 'GEO',
  'rectangle-area-grid': 'GEO',
  'perimeter-area-composed': 'GEO',
  'block-count-3d': 'GEO',
  'count-polygon-sides': 'GEO',
  'symmetry-count': 'GEO',
  'angle-type': 'GEO',
  'grid-path-steps': 'GEO',
  'same-figure-identify': 'GEO',
  'dice-net-fold': 'GEO',
  'maze-path-shortest': 'GEO',
  'clock-time-after': 'MEA',
  'unit-conversion': 'MEA',
  'clock-read-time': 'MEA',
  'scale-read': 'MEA',
  'bar-chart-compare': 'DAT',
  'tally-marks-count': 'DAT',
  'table-lookup-combine': 'DAT',
}

// Short, stable recall codes: domain letter + index within domain
// (A=Arithmetic, N=Number sense, W=Word, P=Pattern, L=Logic, C=Counting,
// G=Geometry, M=Measurement, D=Data). New concepts get the next free number
// in their domain — never renumber existing ones.
const SHORT_ID_BY_SLUG: Record<string, string> = {
  'single-digit-addition': 'A1',
  'single-digit-subtraction': 'A2',
  'multiplication-small': 'A3',
  'arithmetic-expression-eval': 'A4',
  'which-expression-equals': 'A5',
  'custom-operation': 'A6',
  'alternating-chain-eval': 'A7',
  'mistaken-digit-correction': 'A8',
  'missing-addend': 'A9',
  'digit-sum': 'N1',
  'place-value': 'N2',
  'compare-order-numbers': 'N3',
  'reverse-arithmetic-puzzle': 'N4',
  'find-number-by-digit-sum': 'N5',
  'build-number-from-digit-clues': 'N6',
  'more-or-less-by-k': 'N7',
  'divisibility-multiple-property': 'N8',
  'digit-frequency': 'N9',
  'odd-even-reasoning': 'N10',
  'perfect-square-search': 'N11',
  'product-of-consecutive': 'N12',
  'fraction-of-region': 'N13',
  'arrange-digits-to-form-number': 'N14',
  'equivalent-fraction-fill': 'N15',
  'story-sum': 'W1',
  'money-shopping-change': 'W2',
  'legs-items-rate': 'W3',
  'distance-rate-time': 'W4',
  'weight-balance-word': 'W5',
  'lacking-money-shared': 'W6',
  'budget-selection': 'W7',
  'money-coins-total': 'W8',
  'net-progress-cycles': 'W9',
  'rope-wraps-ratio': 'W10',
  'pattern-next': 'P1',
  'number-pyramid': 'P2',
  'number-line-jumps': 'P3',
  'visual-pattern-next': 'P4',
  'shape-transformation-rule': 'P5',
  'position-in-line': 'L1',
  'assignment-cycle': 'L2',
  'operator-fill': 'L3',
  'which-might-be': 'L4',
  'range-count-evaluate': 'L5',
  'sum-partition-split': 'L6',
  'venn-set-membership': 'L7',
  'truth-order-clues': 'L8',
  'count-objects': 'C1',
  'combination-product-sum': 'C2',
  'count-shapes-in-figure': 'C3',
  'count-rectangles-grid': 'C4',
  'make-groups-leftover': 'C5',
  'shape-perimeter-square': 'G1',
  'dice-opposite-faces': 'G2',
  'direction-orientation': 'G3',
  'shape-perimeter-rectangle': 'G4',
  'rectangle-area-grid': 'G5',
  'perimeter-area-composed': 'G6',
  'block-count-3d': 'G7',
  'count-polygon-sides': 'G8',
  'symmetry-count': 'G9',
  'angle-type': 'G10',
  'grid-path-steps': 'G11',
  'same-figure-identify': 'G12',
  'dice-net-fold': 'G13',
  'maze-path-shortest': 'G14',
  'clock-time-after': 'M1',
  'unit-conversion': 'M2',
  'clock-read-time': 'M3',
  'scale-read': 'M4',
  'bar-chart-compare': 'D1',
  'tally-marks-count': 'D2',
  'table-lookup-combine': 'D3',
}

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
  domain: string
  domain_label: string
  priority: 'high' | 'normal'
}

export function listConceptsForPreview(): ConceptSummary[] {
  return ALL_SLUGS.map((slug) => {
    const c = CONCEPTS[slug]
    const domain = DOMAIN_BY_SLUG[slug] ?? 'OTHER'
    return {
      slug,
      short_id: SHORT_ID_BY_SLUG[slug] ?? '',
      name_en: c.meta.name_en,
      name_id: c.meta.name_id,
      description_id: c.meta.description_id ?? null,
      grades: [...c.meta.grades],
      domain,
      domain_label: DOMAIN_LABEL[domain],
      priority: HIGH_PRIORITY.has(slug) ? ('high' as const) : ('normal' as const),
    }
  }).sort(
    (a, b) =>
      DOMAIN_ORDER.indexOf(a.domain) - DOMAIN_ORDER.indexOf(b.domain) ||
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
