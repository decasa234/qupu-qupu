import { describe, test, expect } from 'vitest'
import {
  buildCountTwoDigitSteps,
  qualifyingFor,
  phantomsFor,
  type CountTwoDigitConstraint,
} from './countTwoDigitSteps'

// Independent enumeration of 10..99, written out longhand so it cannot share a
// bug with the storyboard's own filter.
function bruteForce(cs: CountTwoDigitConstraint[]): number[] {
  const out: number[] = []
  for (let n = 10; n <= 99; n++) {
    const tens = Number(String(n)[0])
    const ones = Number(String(n)[1])
    let ok = true
    for (const c of cs) {
      if (c.kind === 'tens') ok &&= c.cmp === 'gt' ? tens > c.v : c.cmp === 'lt' ? tens < c.v : tens === c.v
      else if (c.kind === 'units') ok &&= c.cmp === 'gt' ? ones > c.v : c.cmp === 'lt' ? ones < c.v : ones === c.v
      else if (c.kind === 'digit-sum') ok &&= tens + ones === c.v
      else ok &&= n >= c.lo && n <= c.hi
    }
    if (ok) out.push(n)
  }
  return out
}

const TENS_GT_5: CountTwoDigitConstraint = { kind: 'tens', cmp: 'gt', v: 5 }
const UNITS_GT_7: CountTwoDigitConstraint = { kind: 'units', cmp: 'gt', v: 7 }
const SUM_8: CountTwoDigitConstraint = { kind: 'digit-sum', v: 8 }
const BETWEEN_39_50: CountTwoDigitConstraint = { kind: 'between', lo: 39, hi: 50 }

describe('buildCountTwoDigitSteps', () => {
  test('qualifying set is the honest enumeration of 10..99 under the rules', () => {
    const sb = buildCountTwoDigitSteps([TENS_GT_5, UNITS_GT_7], 'how-many', 'en')
    expect(sb.qualifying).toEqual(bruteForce([TENS_GT_5, UNITS_GT_7]))
    expect(sb.qualifying).toEqual([68, 69, 78, 79, 88, 89, 98, 99])
    expect(sb.answer).toBe(8)
  })

  test('digit sum 8 gives 17..80 and never the phantom "08"', () => {
    const sb = buildCountTwoDigitSteps([SUM_8], 'how-many', 'id')
    expect(sb.qualifying).toEqual([17, 26, 35, 44, 53, 62, 71, 80])
    expect(sb.answer).toBe(8)
    expect(qualifyingFor([SUM_8])).not.toContain(8)
    expect(phantomsFor([SUM_8])).toEqual([8])
  })

  test('the tens beat greys every decade no ones digit can rescue', () => {
    const sb = buildCountTwoDigitSteps([TENS_GT_5], 'how-many', 'en')
    const tensBeat = sb.steps.find((s) => s.phase === 'tens')!
    expect(tensBeat.deadRows).toEqual([1, 2, 3, 4, 5])
    // and the digit-sum rule kills rows too — 9 can never pair down to a sum of 8
    const sumBeat = buildCountTwoDigitSteps([SUM_8], 'how-many', 'en').steps.find((s) => s.phase === 'tens')!
    expect(sumBeat.deadRows).toEqual([9])
  })

  test('the units beat greys the ones columns the rule forbids', () => {
    const sb = buildCountTwoDigitSteps([TENS_GT_5, UNITS_GT_7], 'how-many', 'en')
    const unitsBeat = sb.steps.find((s) => s.phase === 'units')!
    expect(unitsBeat.deadCols).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    // no units rule -> no units beat at all
    expect(buildCountTwoDigitSteps([SUM_8], 'how-many', 'en').steps.some((s) => s.phase === 'units')).toBe(false)
  })

  test('only the final beat carries the answer, and it is the single result beat', () => {
    const cases: [CountTwoDigitConstraint[], 'how-many' | 'largest-minus-smallest'][] = [
      [[TENS_GT_5, UNITS_GT_7], 'how-many'],
      [[SUM_8], 'largest-minus-smallest'],
      [[BETWEEN_39_50], 'how-many'],
    ]
    for (const [cs, ask] of cases) {
      const sb = buildCountTwoDigitSteps(cs, ask, 'id')
      expect(sb.steps.length).toBeGreaterThanOrEqual(3)
      expect(sb.finalIndex).toBe(sb.steps.length - 1)
      sb.steps.forEach((s, i) => {
        expect(s.answer === null).toBe(i !== sb.finalIndex)
        expect(s.result).toBe(i === sb.finalIndex)
      })
      expect(sb.steps[sb.finalIndex].caption).toContain(String(sb.answer))
    }
  })

  test('the leading-zero trap gets its own beat with the ghost row', () => {
    const sb = buildCountTwoDigitSteps([SUM_8], 'how-many', 'id')
    expect(sb.trapKind).toBe('leading-zero')
    expect(sb.showZeroRow).toBe(true)
    const trap = sb.steps.find((s) => s.phase === 'trap')!
    expect(trap.zeroRowUnits).toEqual([8])
    expect(trap.caption).toContain('08')
    expect(trap.caption).toContain('bukan bilangan dua angka')
    // and it lands before the tally, so the count itself stays clean
    expect(sb.steps.indexOf(trap)).toBeLessThan(sb.steps.findIndex((s) => s.phase === 'tally'))
  })

  test('the fencepost trap names the wrong subtraction for a plain run', () => {
    const sb = buildCountTwoDigitSteps([BETWEEN_39_50], 'how-many', 'id')
    expect(sb.trapKind).toBe('fencepost')
    expect(sb.answer).toBe(12)
    const trap = sb.steps.find((s) => s.phase === 'trap')!
    expect(trap.caption).toContain('50 − 39 = 11')
    expect(trap.caption).toContain('39')
    // trap sits immediately before the result it would spoil
    expect(sb.steps.indexOf(trap)).toBe(sb.finalIndex - 1)
  })

  test('a wide leading-zero family is not claimed as the trap', () => {
    // tens < 3 lets every one-digit number through; listing ten of them teaches nothing
    const sb = buildCountTwoDigitSteps([{ kind: 'tens', cmp: 'lt', v: 3 }], 'how-many', 'en')
    expect(phantomsFor([{ kind: 'tens', cmp: 'lt', v: 3 }])).toHaveLength(10)
    expect(sb.trapKind).toBeNull()
    expect(sb.showZeroRow).toBe(false)
    expect(sb.steps.some((s) => s.phase === 'trap')).toBe(false)
  })

  test('largest-minus-smallest walks smallest, then largest, then subtracts', () => {
    const sb = buildCountTwoDigitSteps([UNITS_GT_7], 'largest-minus-smallest', 'en')
    expect(sb.smallest).toBe(18)
    expect(sb.largest).toBe(99)
    expect(sb.answer).toBe(81)
    const phases = sb.steps.map((s) => s.phase)
    expect(phases.indexOf('smallest')).toBeLessThan(phases.indexOf('largest'))
    expect(phases[sb.finalIndex]).toBe('result')
    expect(sb.steps.find((s) => s.phase === 'smallest')!.focus).toEqual([18])
    expect(sb.steps.find((s) => s.phase === 'largest')!.focus).toEqual([99])
    expect(sb.steps[sb.finalIndex].caption).toBe('99 − 18 = 81.')
  })

  test('row tallies add up to the count, and the result beat shows the sum', () => {
    const sb = buildCountTwoDigitSteps([TENS_GT_5, UNITS_GT_7], 'how-many', 'id')
    expect(sb.rowCounts).toEqual([0, 0, 0, 0, 0, 2, 2, 2, 2])
    expect(sb.rowCounts.reduce((a, b) => a + b, 0)).toBe(sb.qualifying.length)
    expect(sb.steps[sb.finalIndex].caption).toBe('2 + 2 + 2 + 2 = 8 bilangan.')
  })

  test('language switch: rules and captions follow lang', () => {
    const en = buildCountTwoDigitSteps([TENS_GT_5], 'how-many', 'en')
    const id = buildCountTwoDigitSteps([TENS_GT_5], 'how-many', 'id')
    expect(en.rules[0]).toBe('The tens digit is greater than 5')
    expect(id.rules[0]).toBe('Angka puluhannya lebih dari 5')
    expect(en.steps[0].caption).toContain('Two-digit numbers')
    expect(id.steps[0].caption).toContain('Bilangan dua angka')
    expect(en.steps.length).toBe(id.steps.length)
  })

  test('malformed params degrade instead of throwing', () => {
    const sb = buildCountTwoDigitSteps(null, undefined, 'id')
    expect(sb.constraints).toEqual([])
    expect(sb.ask).toBe('how-many')
    expect(sb.qualifying).toHaveLength(90)
    expect(Number.isNaN(sb.answer)).toBe(false)
    expect(sb.steps.length).toBeGreaterThanOrEqual(3)
  })
})
