import { describe, test, expect } from 'vitest'
import { buildOddEvenSteps } from './oddEvenSteps'

// Options: [{x:3,y:2}, {x:4,y:6}, {x:7,y:5}, {x:2,y:9}]
// Sums:      3+2=5 ✓odd    4+6=10 even   7+5=12 even   2+9=11 ✓odd
// We need exactly one match — use a set where only index 0 is odd-sum:
// [{x:3,y:2} (5,odd ✓), {x:4,y:6} (10,even), {x:8,y:2} (10,even), {x:6,y:4} (10,even)]
const OPTIONS = [
  { x: 3, y: 2 },
  { x: 4, y: 6 },
  { x: 8, y: 2 },
  { x: 6, y: 4 },
]
// correctIndex = 0

describe('buildOddEvenSteps', () => {
  test('parity/sum/match computed correctly', () => {
    const sb = buildOddEvenSteps(OPTIONS, 'en')
    expect(sb.checks[0]).toEqual({ x: 3, y: 2, xOdd: true, yOdd: false, sum: 5, sumOdd: true, match: true })
    expect(sb.checks[1]).toEqual({ x: 4, y: 6, xOdd: false, yOdd: false, sum: 10, sumOdd: false, match: false })
    expect(sb.checks[2]).toEqual({ x: 8, y: 2, xOdd: false, yOdd: false, sum: 10, sumOdd: false, match: false })
    expect(sb.checks[3]).toEqual({ x: 6, y: 4, xOdd: false, yOdd: false, sum: 10, sumOdd: false, match: false })
  })

  test('correctIndex points to the odd-sum option', () => {
    const sb = buildOddEvenSteps(OPTIONS, 'en')
    expect(sb.correctIndex).toBe(0)
    expect(sb.checks[sb.correctIndex].match).toBe(true)
  })

  test('6 steps with checked sequence [0,1,2,3,4,4]', () => {
    const sb = buildOddEvenSteps(OPTIONS, 'en')
    expect(sb.steps).toHaveLength(6)
    expect(sb.steps.map((s) => s.checked)).toEqual([0, 1, 2, 3, 4, 4])
  })

  test('last step has result:true', () => {
    const sb = buildOddEvenSteps(OPTIONS, 'en')
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
  })

  test('last step caption contains the sum of the matching pair', () => {
    const sb = buildOddEvenSteps(OPTIONS, 'en')
    const last = sb.steps[sb.finalIndex]
    const correct = sb.checks[sb.correctIndex]
    expect(last.caption).toContain(String(correct.sum))
  })

  test('language switch: en step[0] contains "odd", id step[0] contains "ganjil"', () => {
    const sbEn = buildOddEvenSteps(OPTIONS, 'en')
    const sbId = buildOddEvenSteps(OPTIONS, 'id')
    expect(sbEn.steps[0].caption).toContain('odd')
    expect(sbId.steps[0].caption).toContain('ganjil')
  })

  test('id result caption contains "ganjil"', () => {
    const sb = buildOddEvenSteps(OPTIONS, 'id')
    expect(sb.steps[5].caption).toContain('ganjil')
  })

  test('en result caption contains "odd"', () => {
    const sb = buildOddEvenSteps(OPTIONS, 'en')
    expect(sb.steps[5].caption).toContain('odd')
  })

  test('only exactly one match across all checks', () => {
    const sb = buildOddEvenSteps(OPTIONS, 'en')
    const matchCount = sb.checks.filter((c) => c.match).length
    expect(matchCount).toBe(1)
  })

  test('works with correct option at last index', () => {
    const opts = [
      { x: 4, y: 6 },
      { x: 8, y: 2 },
      { x: 6, y: 4 },
      { x: 3, y: 2 },
    ]
    const sb = buildOddEvenSteps(opts, 'en')
    expect(sb.correctIndex).toBe(3)
    expect(sb.checks[3].match).toBe(true)
    expect(sb.steps[5].caption).toContain('5') // 3+2=5
  })
})
