import { describe, test, expect } from 'vitest'
import { buildChainEvalSteps } from './chainEvalSteps'

describe('buildChainEvalSteps', () => {
  test('evaluates left to right with a running total per step', () => {
    const sb = buildChainEvalSteps({ start: 30, steps: [{ op: '+', n: 12 }, { op: '-', n: 5 }, { op: '+', n: 8 }] }, 'en')
    expect(sb.answer).toBe(45)
    expect(sb.beats.map((b) => b.total)).toEqual([30, 42, 37, 45])
    expect(sb.beats[0].active).toBe(-1)
    expect(sb.beats[1].active).toBe(0)
    expect(sb.beats[2].caption).toBe('42 − 5 = 37')
    const last = sb.beats[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.total).toBe(45)
    expect(sb.finalIndex).toBe(sb.beats.length - 1)
  })

  test('handles subtraction chains', () => {
    const sb = buildChainEvalSteps({ start: 50, steps: [{ op: '-', n: 20 }, { op: '-', n: 5 }] }, 'en')
    expect(sb.answer).toBe(25)
    expect(sb.beats.map((b) => b.total)).toEqual([50, 30, 25])
  })

  test('language switches the start caption; only the last beat is the result', () => {
    expect(buildChainEvalSteps({ start: 30, steps: [{ op: '+', n: 1 }, { op: '+', n: 1 }] }, 'id').beats[0].caption).toContain('Mulai')
    expect(buildChainEvalSteps({ start: 30, steps: [{ op: '+', n: 1 }, { op: '+', n: 1 }] }, 'en').beats[0].caption).toContain('Start')
    const sb = buildChainEvalSteps({ start: 30, steps: [{ op: '+', n: 1 }, { op: '+', n: 1 }] }, 'en')
    expect(sb.beats.slice(0, -1).every((b) => !b.result)).toBe(true)
    expect(sb.beats[sb.finalIndex].result).toBe(true)
  })

  test('defensive: missing steps yields just the start beat', () => {
    const sb = buildChainEvalSteps({ start: 7 } as unknown as { start: number; steps: never[] }, 'en')
    expect(sb.answer).toBe(7)
    expect(sb.beats).toHaveLength(1)
  })
})
