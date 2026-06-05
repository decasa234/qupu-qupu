import { describe, test, expect } from 'vitest'
import { buildPatternNextSteps } from './patternNextSteps'

describe('buildPatternNextSteps', () => {
  test('terms are an arithmetic sequence with difference step', () => {
    const sb = buildPatternNextSteps(2, 3, 'en')
    const diffs = sb.terms.slice(1).map((v, i) => v - sb.terms[i])
    diffs.forEach((d) => expect(d).toBe(3))
  })

  test('next = lastTerm + step', () => {
    const sb = buildPatternNextSteps(2, 3, 'en')
    expect(sb.next).toBe(sb.terms[sb.terms.length - 1] + sb.step)
  })

  test('known case: start 2 step 3 → terms [2,5,8], next 11', () => {
    // The concept render shows 3 terms: [0,1,2].map(i => start + i*step)
    // correct = start + 3*step
    const sb = buildPatternNextSteps(2, 3, 'en')
    expect(sb.terms).toEqual([2, 5, 8])
    expect(sb.next).toBe(11)
  })

  test('4 phases in order: show, diff, add, result', () => {
    const sb = buildPatternNextSteps(1, 1, 'en')
    expect(sb.steps.map((s) => s.phase)).toEqual(['show', 'diff', 'add', 'result'])
    expect(sb.steps.length).toBe(4)
  })

  test('last step has result:true and caption contains next value', () => {
    const sb = buildPatternNextSteps(3, 2, 'en')
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain(String(sb.next))
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
  })

  test('language switch: id captions differ from en', () => {
    const en = buildPatternNextSteps(1, 2, 'en')
    const id = buildPatternNextSteps(1, 2, 'id')
    expect(id.steps[0].caption).toContain('Bilangan')
    expect(en.steps[0].caption).toContain('What')
    expect(id.steps[1].caption).toContain('naik')
    expect(en.steps[1].caption).toContain('goes up')
    expect(id.steps[3].caption).toContain('berikutnya')
    expect(en.steps[3].caption).toContain('next')
  })

  test('add phase caption contains lastShown + step = next', () => {
    const sb = buildPatternNextSteps(4, 1, 'en')
    const addStep = sb.steps.find((s) => s.phase === 'add')!
    expect(addStep.caption).toContain(String(sb.terms[sb.terms.length - 1]))
    expect(addStep.caption).toContain(String(sb.next))
  })

  test('terms count is always 3', () => {
    for (const [start, step] of [[1, 1], [9, 3], [5, 2]]) {
      const sb = buildPatternNextSteps(start, step, 'en')
      expect(sb.terms.length).toBe(3)
    }
  })
})
