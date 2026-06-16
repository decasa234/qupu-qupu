import { describe, test, expect } from 'vitest'
import { buildStarCountSteps } from './starCountSteps'

describe('buildStarCountSteps', () => {
  test('counts the rows with running totals 22, 44, 48 and ends at 48 stars', () => {
    const sb = buildStarCountSteps('en')
    expect(sb.rows).toEqual([22, 22, 4])
    expect(sb.total).toBe(48)
    expect(sb.steps.map((s) => s.phase)).toEqual(['show', 'row', 'row', 'row', 'result'])
    expect(sb.steps.filter((s) => s.phase === 'row').map((s) => s.running)).toEqual([22, 44, 48])
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain('22 + 22 + 4 = 48')
    expect(last.caption).toContain('stars')
  })

  test('Indonesian captions', () => {
    const sb = buildStarCountSteps('id')
    expect(sb.steps[0].caption.toLowerCase()).toContain('hitung')
  })
})
