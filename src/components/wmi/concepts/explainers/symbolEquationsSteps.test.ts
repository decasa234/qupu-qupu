import { describe, test, expect } from 'vitest'
import {
  buildSymbolEquationSteps,
  normalizeSymbolEqParams,
  symbolEqAnswerLabel,
  symbolEqOptions,
  type SymbolEqParams,
} from './symbolEquationsSteps'

const P: SymbolEqParams = { s: 4, c: 7, n: 3, slip: -1, totalKind: 'second' }
// totals: 3 x 4 = 12 and 4 + 7 = 11; options 4, 6, 7, 11 -> answer C

// Standalone-number match, so "12" never counts as containing "2".
const quotes = (text: string, value: number) =>
  new RegExp(`(^|[^0-9])${value}([^0-9]|$)`).test(text)

describe('buildSymbolEquationSteps', () => {
  test('mirrors the concept generator: options ascending, label points at the circle', () => {
    const sb = buildSymbolEquationSteps(P, 'en')
    expect(sb.options).toEqual([4, 6, 7, 11])
    expect(sb.answerLabel).toBe('C')
    expect(sb.total1).toBe(12)
    expect(sb.total2).toBe(11)
  })

  test('five beats: read, share, carry across, pose the leftover, land it', () => {
    const sb = buildSymbolEquationSteps(P, 'en')
    expect(sb.steps).toHaveLength(5)
    expect(sb.finalIndex).toBe(4)
    expect(sb.steps.map((b) => b.eq1)).toEqual(['idle', 'share', 'solved', 'solved', 'solved'])
    expect(sb.steps.map((b) => b.swapped)).toEqual([false, false, true, true, true])
    expect(sb.steps.map((b) => b.subtract)).toEqual([null, null, null, 'ask', 'done'])
    expect(sb.steps.map((b) => b.focus)).toEqual([0, 1, 2, 2, 2])
  })

  test('the star value is earned on beat 1 and only carried across on beat 2', () => {
    const sb = buildSymbolEquationSteps(P, 'en')
    expect(sb.steps[0].fact).toBe(false)
    expect(sb.steps[1].fact).toBe(true)
    // the swap cannot happen before the value exists
    expect(sb.steps.findIndex((b) => b.swapped)).toBeGreaterThan(
      sb.steps.findIndex((b) => b.fact),
    )
  })

  test('only the last beat is the result, and it is the only one that holds forever', () => {
    const sb = buildSymbolEquationSteps(P, 'en')
    expect(sb.steps.filter((b) => b.result)).toHaveLength(1)
    expect(sb.steps[sb.finalIndex].result).toBe(true)
    expect(sb.steps[sb.finalIndex].hold).toBe(0)
    expect(sb.steps.slice(0, sb.finalIndex).every((b) => b.hold > 0)).toBe(true)
  })

  test('no beat before the last one quotes the circle value or the answer label', () => {
    for (const lang of ['en', 'id'] as const) {
      for (const p of [
        P,
        { s: 2, c: 9, n: 4, slip: 1, totalKind: 'first' },
        { s: 6, c: 3, n: 2, slip: -1, totalKind: 'second' },
        { s: 9, c: 12, n: 2, slip: 1, totalKind: 'second' },
      ] as SymbolEqParams[]) {
        const sb = buildSymbolEquationSteps(p, lang)
        for (const beat of sb.steps.slice(0, sb.finalIndex)) {
          expect(quotes(beat.caption, sb.c)).toBe(false)
        }
        const last = sb.steps[sb.finalIndex]
        expect(quotes(last.caption, sb.c)).toBe(true)
        expect(last.caption).toContain(sb.answerLabel)
      }
    }
  })

  test('every arithmetic claim in a caption is true', () => {
    for (const p of [
      P,
      { s: 3, c: 8, n: 4, slip: 1, totalKind: 'first' },
      { s: 7, c: 2, n: 3, slip: -1, totalKind: 'first' },
    ] as SymbolEqParams[]) {
      for (const lang of ['en', 'id'] as const) {
        const sb = buildSymbolEquationSteps(p, lang)
        for (const beat of sb.steps) {
          for (const m of beat.caption.matchAll(/(\d+)\s*÷\s*(\d+)\s*=\s*(\d+)/g)) {
            expect(Number(m[1]) / Number(m[2])).toBe(Number(m[3]))
          }
          for (const m of beat.caption.matchAll(/(\d+)\s*−\s*(\d+)\s*=\s*(\d+)/g)) {
            expect(Number(m[1]) - Number(m[2])).toBe(Number(m[3]))
          }
        }
      }
    }
  })

  test('language switch: en and id say the same maths in their own words', () => {
    const en = buildSymbolEquationSteps(P, 'en')
    const id = buildSymbolEquationSteps(P, 'id')
    expect(en.steps[0].caption).toContain('Two equations')
    expect(id.steps[0].caption).toContain('Dua persamaan')
    expect(en.steps[1].caption).toContain('12 ÷ 3 = 4')
    expect(id.steps[1].caption).toContain('12 ÷ 3 = 4')
    expect(en.steps[4].caption).toContain('11 − 4 = 7')
    expect(id.steps[4].caption).toContain('11 − 4 = 7')
    // The English copy must not open a caption with a bare "A" — the answer
    // labels are single letters, so a stray article would read as a leak.
    expect(en.steps.slice(0, 4).some((b) => /(^|\s)A(\s|$)/.test(b.caption))).toBe(false)
  })

  test('stale params (saved before slip / totalKind existed) still build a board', () => {
    const stale = { s: 5, c: 6, n: 2 }
    const norm = normalizeSymbolEqParams(stale)
    expect(norm).toEqual({ s: 5, c: 6, n: 2, slip: -1, totalKind: 'second' })
    const sb = buildSymbolEquationSteps(stale, 'id')
    expect(sb.steps.every((b) => !/NaN|undefined/.test(b.caption))).toBe(true)
    // 5 (the star) and 5 (6 − 1) collide — generate would never emit this, which
    // is exactly why such rows have to be regenerated. It must not crash.
    expect(symbolEqOptions(norm)).toEqual([5, 5, 6, 11])
    expect(sb.answerLabel).toBe(symbolEqAnswerLabel(norm))
    expect(sb.answerLabel).toBe('C')
  })

  test('garbage params fall back to a drawable sample instead of NaN', () => {
    const sb = buildSymbolEquationSteps({ s: 'x', c: null, n: undefined }, 'id')
    expect(sb.s).toBe(4)
    expect(sb.c).toBe(5)
    expect(sb.n).toBe(3)
    expect(sb.steps.every((b) => !/NaN|undefined/.test(b.caption))).toBe(true)
  })
})
