import { describe, test, expect } from 'vitest'
import {
  buildCommonFactorSteps,
  readCommonFactorParams,
  type CommonFactorStep,
} from './commonFactorSteps'

const beatText = (s: CommonFactorStep) => `${s.caption} ${s.equation.map((t) => t.text).join(' ')}`
const numbersIn = (text: string) => (text.match(/\d+/g) ?? []).map(Number)

describe('buildCommonFactorSteps', () => {
  test('the storyboard is the identity a×c + b×c = (a+b)×c', () => {
    const sb = buildCommonFactorSteps({ a: 13, b: 7, c: 7 }, 'id')
    expect(sb.sum).toBe(20)
    expect(sb.answer).toBe(13 * 7 + 7 * 7)
    expect(sb.answer).toBe((13 + 7) * 7)
    expect(sb.roundSum).toBe(true)
  })

  test('beats run long → share → lift → group → result, and only the last settles', () => {
    const sb = buildCommonFactorSteps({ a: 13, b: 7, c: 7 }, 'id')
    expect(sb.steps.map((s) => s.phase)).toEqual(['long', 'share', 'lift', 'group', 'result'])
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
    expect(sb.steps.filter((s) => s.result)).toHaveLength(1)
    expect(sb.steps[sb.finalIndex].result).toBe(true)
    expect(sb.steps[sb.finalIndex].hold).toBe(0)
    expect(sb.steps.slice(0, -1).every((s) => s.hold > 0)).toBe(true)
  })

  test('the blocks only join once the shared factor has been spotted', () => {
    const sb = buildCommonFactorSteps({ a: 13, b: 7, c: 7 }, 'en')
    expect(sb.steps.map((s) => s.joined)).toEqual([false, false, true, true, true])
    expect(sb.steps.map((s) => s.sharedLit)).toEqual([false, true, true, true, true])
    // the lift beat is the one that shows the factor coming out
    expect(sb.steps.filter((s) => s.liftTrail).map((s) => s.phase)).toEqual(['lift'])
    // the equal-height proof lands the beat before the join
    expect(sb.steps.filter((s) => s.heightGuides).map((s) => s.phase)).toEqual(['share'])
    expect(sb.steps.map((s) => s.widthLabel)).toEqual([
      'terms',
      'terms',
      'bracket',
      'sum',
      'sum',
    ])
  })

  test('the long form carries two ×c; the lifted form carries one, inside a bracket', () => {
    const sb = buildCommonFactorSteps({ a: 13, b: 7, c: 7 }, 'en')
    const text = (i: number) => sb.steps[i].equation.map((t) => t.text).join(' ')
    expect(text(0)).toBe('13 × 7 + 7 × 7 = ?')
    expect(text(1)).toBe('13 × 7 + 7 × 7 = ?')
    expect(text(2)).toBe('( 13 + 7 ) × 7 = ?')
    expect(text(3)).toBe('20 × 7 = ?')
    expect(text(4)).toBe('20 × 7 = 140')
    // the shared factor is only inked orange once it has been noticed
    expect(sb.steps[0].equation.filter((t) => t.tone === 'shared')).toHaveLength(0)
    expect(sb.steps[1].equation.filter((t) => t.tone === 'shared').length).toBeGreaterThan(0)
    // exactly one token ever carries the answer, on the last beat
    expect(sb.steps[4].equation.filter((t) => t.tone === 'answer').map((t) => t.text)).toEqual([
      '140',
    ])
  })

  test('no beat before the last states the answer', () => {
    for (const [a, b, c] of [
      [13, 7, 7],
      [2, 18, 12],
      [18, 2, 2],
      [4, 6, 5],
      [3, 3, 3],
    ]) {
      const sb = buildCommonFactorSteps({ a, b, c }, 'id')
      for (const s of sb.steps.slice(0, -1)) {
        expect(numbersIn(beatText(s))).not.toContain(sb.answer)
        expect(s.plate).toBe('?')
      }
      const last = sb.steps[sb.finalIndex]
      expect(numbersIn(beatText(last))).toContain(sb.answer)
      expect(last.plate).toBe(String(sb.answer))
    }
  })

  test('captions state only true arithmetic', () => {
    const sb = buildCommonFactorSteps({ a: 13, b: 7, c: 7 }, 'id')
    expect(sb.steps[3].caption).toContain('13 + 7 = 20')
    expect(sb.steps[4].caption).toContain('20 × 7 = 140')
    // 20 is a multiple of ten, so the round-number nudge shows
    expect(sb.steps[3].caption).toContain('angka bulat')
    // …and stays away when the sum is not round
    const odd = buildCommonFactorSteps({ a: 4, b: 5, c: 3 }, 'id')
    expect(odd.roundSum).toBe(false)
    expect(odd.steps[3].caption).toContain('4 + 5 = 9')
    expect(odd.steps[3].caption).not.toContain('angka bulat')
    expect(odd.steps[4].caption).toContain('9 × 3 = 27')
  })

  test('language switch: id and en carry the same numbers, different words', () => {
    const en = buildCommonFactorSteps({ a: 13, b: 7, c: 7 }, 'en')
    const id = buildCommonFactorSteps({ a: 13, b: 7, c: 7 }, 'id')
    expect(en.answer).toBe(id.answer)
    expect(en.steps[0].caption).toContain('The long way')
    expect(id.steps[0].caption).toContain('Cara panjang')
    expect(en.steps[2].caption).toContain('columns')
    expect(id.steps[2].caption).toContain('kolom')
    expect(en.steps[4].caption).toContain('Just one multiplication')
    expect(id.steps[4].caption).toContain('Tinggal sekali kali')
    for (let i = 0; i < en.steps.length; i++) {
      expect(en.steps[i].equation).toEqual(id.steps[i].equation)
      expect(en.steps[i].phase).toBe(id.steps[i].phase)
    }
  })

  test('every params shape the schema allows builds a sound storyboard', () => {
    for (let a = 2; a <= 18; a++) {
      for (let b = 2; b <= 18; b++) {
        for (const c of [2, 5, 12]) {
          const sb = buildCommonFactorSteps({ a, b, c }, 'id')
          expect(sb.answer).toBe(a * c + b * c)
          expect(sb.answer).toBe((a + b) * c)
          expect(sb.steps).toHaveLength(5)
          expect(sb.steps.every((s) => !s.caption.includes('NaN'))).toBe(true)
          expect(sb.steps.every((s) => s.equation.every((t) => t.text.length > 0))).toBe(true)
        }
      }
    }
  })

  test('garbled params fall back instead of rendering NaN', () => {
    for (const bad of [null, undefined, {}, { a: 'x', b: null, c: NaN }, { a: 1 / 0 }]) {
      const sb = buildCommonFactorSteps(bad, 'id')
      expect(Number.isFinite(sb.a) && Number.isFinite(sb.b) && Number.isFinite(sb.c)).toBe(true)
      expect(sb.answer).toBe(sb.a * sb.c + sb.b * sb.c)
      expect(sb.steps.every((s) => !/NaN|undefined/.test(beatText(s)))).toBe(true)
    }
    // out-of-schema values are clamped into something drawable, still consistent
    const huge = readCommonFactorParams({ a: 999, b: -4, c: 88 })
    expect(huge).toEqual({ a: 30, b: 1, c: 20 })
  })
})
