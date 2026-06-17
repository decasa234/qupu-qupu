import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { applyInferFormula, applyNestedFormula, INFER_IDS, NESTED_IDS } from './index.js'

// ─── Hand-computed acceptance tests ─────────────────────────────────────────

describe('custom-operation: sum-range-minus-b formula', () => {
  // a ☼ b = (a + (a+1) + … + (b−1)) − b
  // Taxonomy reference: 1☼3=0, 2☼5=4
  test('1 ☼ 3 = 0 (sum 1+2 − 3)', () => {
    expect(applyInferFormula('sum-range-minus-b', 1, 3)).toBe(0)
  })
  test('2 ☼ 5 = 4 (sum 2+3+4 − 5)', () => {
    expect(applyInferFormula('sum-range-minus-b', 2, 5)).toBe(4)
  })
  // Plan acceptance test: 4 ☼ 9 = (4+5+6+7+8) − 9 = 30 − 9 = 21
  test('4 ☼ 9 = 21 — render answer must equal "21"', () => {
    const result = concept.render({
      mode: 'infer',
      formula: 'sum-range-minus-b',
      e1: 1, e2: 3,
      e3: 2, e4: 5,
      c: 4, d: 9,
    })
    expect(result.answer).toBe('21')
  })
})

describe('custom-operation: square-minus-b formula (harder rule)', () => {
  // a ☼ b = a² − b
  // Hand-computed: 5 ☼ 7 = 25 − 7 = 18
  test('5 ☼ 7 = 18 — render answer must equal "18"', () => {
    const result = concept.render({
      mode: 'infer',
      formula: 'square-minus-b',
      e1: 2, e2: 3,
      e3: 3, e4: 5,
      c: 5, d: 7,
    })
    expect(result.answer).toBe('18')
  })
  // Additional: 6 ☼ 4 = 36 − 4 = 32
  test('6 ☼ 4 = 32', () => {
    expect(applyInferFormula('square-minus-b', 6, 4)).toBe(32)
  })
})

describe('custom-operation: sum-sq-minus-prod formula', () => {
  // a ☼ b = (a+b)² − (a×b)
  // 2 ☼ 3 = 25 − 6 = 19
  test('2 ☼ 3 = 19', () => {
    expect(applyInferFormula('sum-sq-minus-prod', 2, 3)).toBe(19)
  })
  // 3 ☼ 4 = 49 − 12 = 37
  test('3 ☼ 4 = 37 — render answer', () => {
    const result = concept.render({
      mode: 'infer',
      formula: 'sum-sq-minus-prod',
      e1: 2, e2: 3,
      e3: 1, e4: 2,
      c: 3, d: 4,
    })
    expect(result.answer).toBe('37')
  })
})

describe('custom-operation: nested mode', () => {
  // Rule: a ☼ b = a × b − b
  // (3 ☼ 4) ☼ 2 = (12−4) ☼ 2 = 8 ☼ 2 = 16−2 = 14
  test('(3 ☼ 4) ☼ 2 = 14 with nested-mul-minus-b', () => {
    const result = concept.render({
      mode: 'nested',
      formula: 'nested-mul-minus-b',
      a: 3, b: 4, c: 2,
    })
    expect(result.answer).toBe('14')
  })

  // Rule: a ☼ b = 2 × (a + b)
  // (2 ☼ 3) ☼ 5 = 10 ☼ 5 = 30
  test('(2 ☼ 3) ☼ 5 = 30 with nested-double-sum', () => {
    const result = concept.render({
      mode: 'nested',
      formula: 'nested-double-sum',
      a: 2, b: 3, c: 5,
    })
    expect(result.answer).toBe('30')
  })

  // Rule: a ☼ b = a + b + a × b
  // (2 ☼ 3) ☼ 4:
  //   inner = 2+3+6 = 11
  //   outer = 11+4+44 = 59
  test('(2 ☼ 3) ☼ 4 = 59 with nested-sum-plus-prod', () => {
    expect(applyNestedFormula('nested-sum-plus-prod', 2, 3)).toBe(11)
    const result = concept.render({
      mode: 'nested',
      formula: 'nested-sum-plus-prod',
      a: 2, b: 3, c: 4,
    })
    expect(result.answer).toBe('59')
  })
})

// ─── Determinism ─────────────────────────────────────────────────────────────

describe('custom-operation: determinism', () => {
  test('same seed produces same params', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })
})

// ─── Seed-loop: all formulas exercised, answers recoverable ──────────────────

describe('custom-operation: 200 seeds — schema valid, answer = formula applied', () => {
  test('infer mode: both formula modes present; answer consistent', () => {
    const inferFormulas = new Set<string>()
    const nestedFormulas = new Set<string>()
    let inferCount = 0
    let nestedCount = 0

    for (let seed = 1; seed <= 200; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.choices_en).toBeNull()

      if (p.mode === 'infer') {
        inferCount++
        inferFormulas.add(p.formula)
        // Answer must match the formula applied to (c, d)
        const expected = applyInferFormula(p.formula, p.c, p.d)
        expect(Number(r.answer)).toBe(expected)
        // Verify the two examples are distinct pairs
        expect(p.e1 !== p.e3 || p.e2 !== p.e4).toBe(true)
        // Verify the query pair is distinct from both examples
        expect(p.c !== p.e1 || p.d !== p.e2).toBe(true)
        expect(p.c !== p.e3 || p.d !== p.e4).toBe(true)
      } else {
        nestedCount++
        nestedFormulas.add(p.formula)
        const inner = applyNestedFormula(p.formula, p.a, p.b)
        const expected = applyNestedFormula(p.formula, inner, p.c)
        expect(Number(r.answer)).toBe(expected)
      }
    }

    // Both modes should be generated across seeds
    expect(inferCount).toBeGreaterThan(0)
    expect(nestedCount).toBeGreaterThan(0)

    // All infer formula ids should be exercised
    for (const id of INFER_IDS) {
      expect(inferFormulas.has(id)).toBe(true)
    }
    // All nested formula ids should be exercised
    for (const id of NESTED_IDS) {
      expect(nestedFormulas.has(id)).toBe(true)
    }
  })
})

// ─── Recoverability: two examples uniquely determine the rule ─────────────────

describe('custom-operation: two examples uniquely determine the rule (no ambiguity)', () => {
  // For each generated 'infer' instance, verify that NO other infer formula
  // produces the SAME outputs for BOTH example pairs — i.e., the two examples
  // together uniquely point to the correct formula among INFER_FORMULAS.
  test('no formula collision across 200 seeds', () => {
    let inferSeeds = 0

    for (let seed = 1; seed <= 200; seed++) {
      const p = concept.generate(mulberry32(seed))
      if (p.mode !== 'infer') continue
      inferSeeds++

      const ex1 = applyInferFormula(p.formula, p.e1, p.e2)
      const ex2 = applyInferFormula(p.formula, p.e3, p.e4)

      // Count how many OTHER formulas also produce ex1, ex2 for the SAME pairs
      const matches = INFER_IDS.filter(
        (id) =>
          id !== p.formula &&
          applyInferFormula(id, p.e1, p.e2) === ex1 &&
          applyInferFormula(id, p.e3, p.e4) === ex2,
      )

      // There should be no collisions — the two examples uniquely identify the rule
      if (matches.length > 0) {
        throw new Error(
          `Seed ${seed}: formula "${p.formula}" collides with [${matches.join(', ')}] ` +
          `on examples (${p.e1}☼${p.e2}=${ex1}, ${p.e3}☼${p.e4}=${ex2})`,
        )
      }
    }

    expect(inferSeeds).toBeGreaterThan(100)
  })
})
