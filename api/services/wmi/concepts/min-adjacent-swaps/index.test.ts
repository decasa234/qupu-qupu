import { describe, test, expect } from 'vitest'
import { stripSectionLabels } from '../../../../../src/lib/wmiBreakdown'
import { parseWmiMarkup } from '../../../../../src/lib/wmiMarkup'
import { mulberry32 } from '../rng.js'
import concept, {
  MAX_INVERSIONS,
  MAX_LEN,
  MIN_INVERSIONS,
  MIN_LEN,
  adjacentSwapPlan,
  generate,
  inversionCount,
  neighbourWrongPairs,
  targetRow,
  type Order,
  type Params,
} from './index.js'

const SEEDS = 360

// The breakdown highlighter matches each phrase by substring against the
// DISPLAYED body — the body after stripSectionLabels drops "Find:" / "Cari:",
// glossary markup resolves, and runs of whitespace collapse. A phrase that is
// not found silently renders as plain text with no colour and no note, so every
// seed is checked against the real pipeline, not against the raw body.
function display(text: string): string {
  return parseWmiMarkup(stripSectionLabels(text))
    .map((seg) => seg.text)
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

// ---------------------------------------------------------------------------
// Two INDEPENDENT oracles, written here from the definitions rather than reused
// from the generator:
//   1. brute-force inversion count — count every pair, no cleverness;
//   2. breadth-first search over adjacent-swap states — the literal "fewest
//      swaps" definition, no theorem assumed.
// The generator's answer must equal BOTH, and the two must equal each other.
// ---------------------------------------------------------------------------

function bruteForceInversions(values: readonly number[], order: Order): number {
  let n = 0
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      const wrong = order === 'asc' ? values[i] > values[j] : values[i] < values[j]
      if (wrong) n++
    }
  }
  return n
}

/** Fewest adjacent swaps from `start` to its sorted row, by BFS over rows. */
function bfsMinSwaps(start: readonly number[], order: Order): number {
  const goal = [...start].sort((a, b) => (order === 'asc' ? a - b : b - a)).join(',')
  let frontier = [[...start]]
  const seen = new Set<string>([start.join(',')])
  let depth = 0
  while (frontier.length > 0) {
    if (frontier.some((row) => row.join(',') === goal)) return depth
    const next: number[][] = []
    for (const row of frontier) {
      for (let i = 0; i + 1 < row.length; i++) {
        const child = [...row]
        child[i] = row[i + 1]
        child[i + 1] = row[i]
        const key = child.join(',')
        if (!seen.has(key)) {
          seen.add(key)
          next.push(child)
        }
      }
    }
    frontier = next
    depth++
  }
  throw new Error('bfsMinSwaps: goal unreachable')
}

const seeds = Array.from({ length: SEEDS }, (_, i) => i + 1)
const generated: Params[] = seeds.map((s) => generate(mulberry32(s)))

describe('min-adjacent-swaps — params', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test(`${SEEDS} seeds: every generated params object parses`, () => {
    for (const p of generated) {
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.values.length).toBeGreaterThanOrEqual(MIN_LEN)
      expect(p.values.length).toBeLessThanOrEqual(MAX_LEN)
      expect(new Set(p.values).size).toBe(p.values.length)
    }
  })

  test(`${SEEDS} seeds: the row is 3…9 wrong pairs away from sorted, and never already sorted`, () => {
    for (const p of generated) {
      const k = bruteForceInversions(p.values, p.order)
      expect(k).toBeGreaterThanOrEqual(MIN_INVERSIONS)
      expect(k).toBeLessThanOrEqual(MAX_INVERSIONS)
      // ...and never more than the row can physically hold.
      expect(k).toBeLessThanOrEqual((p.values.length * (p.values.length - 1)) / 2)
      expect(p.values.join(',')).not.toBe(targetRow(p.values, p.order).join(','))
    }
  })

  test('the schema rejects a sorted row, a duplicate value, and an over-scrambled row', () => {
    const base = { kind: 'cards' as const, order: 'asc' as const, name: 'Ayu' }
    expect(() => concept.paramsSchema.parse({ ...base, values: [1, 2, 3, 4] })).toThrow()
    expect(() => concept.paramsSchema.parse({ ...base, values: [2, 2, 3, 1] })).toThrow()
    // 7 6 5 4 3 2 1 has 21 wrong pairs — way past the ceiling.
    expect(() => concept.paramsSchema.parse({ ...base, values: [7, 6, 5, 4, 3, 2, 1] })).toThrow()
  })
})

describe('min-adjacent-swaps — the answer', () => {
  test(`${SEEDS} seeds: answer === inversion count === breadth-first search`, () => {
    for (const p of generated) {
      const inversions = bruteForceInversions(p.values, p.order)
      const bfs = bfsMinSwaps(p.values, p.order)
      // The two independent oracles must agree...
      expect(bfs).toBe(inversions)
      // ...and the generator must land on the same number.
      expect(inversionCount(p.values, p.order)).toBe(inversions)
      expect(concept.render(p).answer).toBe(String(inversions))
    }
  })

  // 3 5 1 4 2 -> wrong pairs (3,1) (3,2) (5,1) (5,4) (5,2) (4,2) = 6.
  test('worked example: 3 5 1 4 2 ascending needs 6 swaps', () => {
    const values = [3, 5, 1, 4, 2]
    expect(bruteForceInversions(values, 'asc')).toBe(6)
    expect(bfsMinSwaps(values, 'asc')).toBe(6)
    expect(inversionCount(values, 'asc')).toBe(6)
    expect(adjacentSwapPlan(values, 'asc')).toHaveLength(6)
  })

  // Descending is the same theorem with the comparison flipped.
  test('worked example: 2 4 1 3 descending needs 3 swaps', () => {
    const values = [2, 4, 1, 3]
    expect(bruteForceInversions(values, 'desc')).toBe(3)
    expect(bfsMinSwaps(values, 'desc')).toBe(3)
    expect(inversionCount(values, 'desc')).toBe(3)
  })

  test(`${SEEDS} seeds: the shown swap run is exactly that long and ends sorted`, () => {
    for (const p of generated) {
      const plan = adjacentSwapPlan(p.values, p.order)
      expect(plan.length).toBe(inversionCount(p.values, p.order))
      expect(plan[plan.length - 1].row.join(',')).toBe(targetRow(p.values, p.order).join(','))
      // Every swap trades true neighbours and clears exactly one wrong pair.
      let before = inversionCount(p.values, p.order)
      for (const move of plan) {
        expect(move.remaining).toBe(before - 1)
        before = move.remaining
      }
      expect(before).toBe(0)
    }
  })

  test(`${SEEDS} seeds: the neighbour-only count is never bigger than the answer`, () => {
    for (const p of generated) {
      expect(neighbourWrongPairs(p.values, p.order)).toBeLessThanOrEqual(inversionCount(p.values, p.order))
    }
  })
})

describe('min-adjacent-swaps — render', () => {
  test(`${SEEDS} seeds: no undefined / NaN anywhere the child can read`, () => {
    for (const p of generated) {
      const r = concept.render(p)
      const strings = [
        r.body_en,
        r.body_id,
        r.hint_en ?? '',
        r.hint_id ?? '',
        ...(r.hint_steps_en ?? []),
        ...(r.hint_steps_id ?? []),
      ]
      for (const s of strings) {
        expect(s).not.toMatch(/undefined|NaN|null/)
        expect(s.trim().length).toBeGreaterThan(0)
      }
      expect(r.answer_type).toBe('fill_in')
      expect(r.choices_en).toBeNull()
      expect(r.choices_id).toBeNull()
      expect(r.hint_steps_en).toHaveLength(3)
      expect(r.hint_steps_id).toHaveLength(3)
      // The steps must SHOW the row and land on the answer, not assert it.
      expect(r.hint_steps_en![2]).toContain(`= ${r.answer} wrong pairs`)
      expect(r.hint_steps_id![2]).toContain(`= ${r.answer} pasang terbalik`)
      // Both bodies print the row exactly as the figure draws it.
      expect(r.body_en).toContain(p.values.join(', '))
      expect(r.body_id).toContain(p.values.join(', '))
    }
  })
})

describe('min-adjacent-swaps — breakdown', () => {
  test(`${SEEDS} seeds: every phrase is an exact substring of the displayed body, in both languages`, () => {
    for (const p of generated) {
      const r = concept.render(p)
      const bodyEn = display(r.body_en)
      const bodyId = display(r.body_id)
      const bd = r.breakdown
      expect(bd).toBeTruthy()
      for (const h of bd!.highlights) {
        expect(h.phrase_en.length).toBeGreaterThan(0)
        expect(h.phrase_id.length).toBeGreaterThan(0)
        expect(
          bodyEn.includes(h.phrase_en),
          `kind=${p.kind} order=${p.order}\nphrase_en: ${h.phrase_en}\nbody_en:   ${bodyEn}`,
        ).toBe(true)
        expect(
          bodyId.includes(h.phrase_id),
          `kind=${p.kind} order=${p.order}\nphrase_id: ${h.phrase_id}\nbody_id:   ${bodyId}`,
        ).toBe(true)
        expect(h.note_en).not.toMatch(/undefined|NaN/)
        expect(h.note_id).not.toMatch(/undefined|NaN/)
      }
      // No phrase may contain another, or the longest-first matcher swallows it.
      const en = bd!.highlights.map((h) => h.phrase_en)
      const id = bd!.highlights.map((h) => h.phrase_id)
      for (const list of [en, id]) {
        for (let i = 0; i < list.length; i++) {
          for (let j = 0; j < list.length; j++) {
            if (i !== j) expect(list[i].includes(list[j])).toBe(false)
          }
        }
      }
      expect(bd!.highlights.some((h) => h.category === 'question')).toBe(true)
      expect(bd!.needsVisual).toBe(true)
      expect(bd!.answer.value).toBe(r.answer)
      expect(bd!.quantities.every((q) => q.value.trim().length > 0)).toBe(true)
    }
  })

  test(`${SEEDS} seeds: the trap, when offered, is a real undercount and never the answer`, () => {
    for (const p of generated) {
      const bd = concept.render(p).breakdown!
      if (!bd.trap) continue
      const wrong = Number(bd.trap.wrong)
      expect(Number.isInteger(wrong)).toBe(true)
      expect(wrong).toBe(neighbourWrongPairs(p.values, p.order))
      expect(wrong).toBeLessThan(Number(bd.answer.value))
      expect(bd.trap.why_en).not.toMatch(/undefined|NaN/)
      expect(bd.trap.why_id).not.toMatch(/undefined|NaN/)
    }
  })
})
