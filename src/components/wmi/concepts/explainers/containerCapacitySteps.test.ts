import { describe, test, expect } from 'vitest'
import { boxesUsed, buildContainerSteps, normalizeContainerParams } from './containerCapacitySteps'

const P = { total: 137, capacity: 9 } // 15 full boxes, 2 left over → 16

describe('buildContainerSteps', () => {
  test('reads the division: 15 full boxes, remainder 2, answer 16', () => {
    const sb = buildContainerSteps(P, 'id', 'C')
    expect(sb.floor).toBe(15)
    expect(sb.remainder).toBe(2)
    expect(sb.answer).toBe(16)
    expect(sb.answerLabel).toBe('C')
  })

  test('storyboard runs intro → fills → skip → trap → leftover → total', () => {
    const sb = buildContainerSteps(P, 'id', 'C')
    expect(sb.steps.map((s) => s.id)).toEqual([
      'intro',
      'fill',
      'fill',
      'skip',
      'trap',
      'leftover',
      'total',
    ])
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
    expect(sb.steps.length).toBeGreaterThanOrEqual(3)
  })

  test('every beat conserves eggs: sealed × capacity + bench + remaining = total', () => {
    for (const capacity of [3, 4, 7, 9, 12, 20]) {
      for (let total = capacity + 1; total <= 200; total += 7) {
        const sb = buildContainerSteps({ total, capacity }, 'en')
        for (const s of sb.steps) {
          expect(s.sealed * capacity + s.bench + s.remaining).toBe(total)
          expect(s.bench).toBeLessThanOrEqual(capacity)
          expect(s.bench).toBeGreaterThanOrEqual(0)
          expect(s.remaining).toBeGreaterThanOrEqual(0)
          expect(s.sealed).toBeGreaterThanOrEqual(0)
        }
      }
    }
  })

  test('only the last beat carries the count and the choice letter', () => {
    const sb = buildContainerSteps(P, 'id', 'C')
    const earlier = sb.steps.slice(0, -1)
    expect(earlier.every((s) => s.answerValue === null && s.answerLabel === null)).toBe(true)
    expect(earlier.every((s) => s.result === false)).toBe(true)
    // and no earlier caption names "<answer> kotak"
    const leak = new RegExp(`(^|[^0-9])${sb.answer} kotak`)
    expect(earlier.some((s) => leak.test(s.caption) || leak.test(s.note ?? ''))).toBe(false)

    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.answerValue).toBe(16)
    expect(last.answerLabel).toBe('C')
    expect(last.equation).toBe('15 + 1 = 16')
    expect(last.caption).toContain('16 kotak')
    expect(last.hold).toBe(0)
  })

  test('the floor-division trap gets its own beat and names the stranded eggs', () => {
    const sb = buildContainerSteps(P, 'id', 'C')
    const trap = sb.steps.find((s) => s.trap)!
    expect(trap).toBeDefined()
    expect(trap.caption).toContain('15 kotak')
    expect(trap.caption).toContain('2 telur')
    expect(trap.remaining).toBe(2)
    expect(trap.note).toContain('137 ÷ 9 = 15 sisa 2')
    // it must come before the leftover box opens
    expect(sb.steps.indexOf(trap)).toBeLessThan(sb.steps.findIndex((s) => s.partial))
  })

  test('the leftover beat opens a part-full box that still counts as one', () => {
    const sb = buildContainerSteps(P, 'id', 'C')
    const rest = sb.steps.find((s) => s.id === 'leftover')!
    expect(rest.partial).toBe(true)
    expect(rest.sealed).toBe(15)
    expect(rest.bench).toBe(2)
    expect(rest.bench).toBeLessThan(sb.capacity)
    expect(rest.remaining).toBe(0)
    // the deduction is on screen a beat before it is spoken
    expect(boxesUsed(rest)).toBe(16)
    expect(rest.answerValue).toBeNull()
  })

  test('short runs show every box instead of skipping', () => {
    // 20 eggs, boxes of 7 → 2 full boxes + 6 left over
    const sb = buildContainerSteps({ total: 20, capacity: 7 }, 'id')
    expect(sb.floor).toBe(2)
    expect(sb.steps.map((s) => s.id)).toEqual(['intro', 'fill', 'fill', 'trap', 'leftover', 'total'])
    expect(sb.steps[sb.finalIndex].answerValue).toBe(3)
  })

  test('long runs stay short: at most seven beats even at 66 boxes', () => {
    const sb = buildContainerSteps({ total: 200, capacity: 3 }, 'id')
    expect(sb.floor).toBe(66)
    expect(sb.answer).toBe(67)
    expect(sb.steps).toHaveLength(7)
    expect(sb.steps.find((s) => s.id === 'skip')!.sealed).toBe(65)
  })

  test('exact fits (legacy params) drop the trap and land on the full boxes', () => {
    const sb = buildContainerSteps({ total: 60, capacity: 10 }, 'id')
    expect(sb.remainder).toBe(0)
    expect(sb.answer).toBe(6)
    expect(sb.steps.some((s) => s.trap)).toBe(false)
    expect(sb.steps.some((s) => s.partial)).toBe(false)
    expect(sb.steps.length).toBeGreaterThanOrEqual(3)
    expect(sb.steps[sb.finalIndex].answerValue).toBe(6)
  })

  test('language switch: id and en captions, same numbers', () => {
    const id = buildContainerSteps(P, 'id', 'C')
    const en = buildContainerSteps(P, 'en', 'C')
    expect(id.steps[0].caption).toBe('137 telur mau dikemas. Satu kotak muat 9.')
    expect(en.steps[0].caption).toBe('137 eggs to pack. One box holds 9.')
    expect(en.steps[en.finalIndex].caption).toBe('15 full boxes + 1 part-full box = 16 boxes.')
    expect(en.steps[en.finalIndex].note).toBe('Answer: C')
    expect(id.steps[id.finalIndex].note).toBe('Jawaban: C')
    expect(id.steps.map((s) => s.id)).toEqual(en.steps.map((s) => s.id))
  })

  test('deterministic: same input, same storyboard', () => {
    expect(buildContainerSteps(P, 'id', 'C')).toEqual(buildContainerSteps(P, 'id', 'C'))
  })

  test('only a bare A-D letter is treated as a choice label', () => {
    expect(buildContainerSteps(P, 'id', 'c').answerLabel).toBe('C')
    expect(buildContainerSteps(P, 'id', '16').answerLabel).toBeNull()
    expect(buildContainerSteps(P, 'id', '').answerLabel).toBeNull()
    expect(buildContainerSteps(P, 'id').answerLabel).toBeNull()
    expect(buildContainerSteps(P, 'id', '16').steps.slice(-1)[0].note).toBeNull()
  })

  test('normalizeContainerParams survives junk from the pool', () => {
    expect(normalizeContainerParams(undefined)).toEqual({ total: 137, capacity: 9 })
    expect(normalizeContainerParams({ total: 5, capacity: 9 })).toEqual({ total: 10, capacity: 9 })
    expect(normalizeContainerParams({ total: 9999, capacity: 99 })).toEqual({ total: 200, capacity: 20 })
    const sb = buildContainerSteps({ total: 'x', capacity: null }, 'id')
    expect(sb.steps.length).toBeGreaterThanOrEqual(3)
  })
})
