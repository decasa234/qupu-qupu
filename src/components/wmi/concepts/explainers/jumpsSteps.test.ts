import { describe, test, expect } from 'vitest'
import { buildJumpsSteps } from './jumpsSteps'

describe('buildJumpsSteps', () => {
  test('landing = start + step * jumps', () => {
    const sb = buildJumpsSteps(3, 4, 2, 'en')
    expect(sb.landing).toBe(11) // 3 + 4*2 = 11
  })

  test('positions array is correct: [start, start+step, ..., landing]', () => {
    const sb = buildJumpsSteps(3, 4, 2, 'en')
    expect(sb.positions).toEqual([3, 7, 11])
  })

  test('positions has length jumps + 1', () => {
    const sb = buildJumpsSteps(0, 3, 5, 'en')
    expect(sb.positions).toHaveLength(6)
    expect(sb.positions[0]).toBe(0)
    expect(sb.positions[5]).toBe(15)
  })

  test('beats count = jumps + 2 (start + jumps jump beats + result)', () => {
    const sb = buildJumpsSteps(3, 4, 2, 'en')
    expect(sb.steps).toHaveLength(4) // jumps+2 = 4
    expect(sb.finalIndex).toBe(3)
  })

  test('last step has result:true and landing in caption', () => {
    const sb = buildJumpsSteps(3, 4, 2, 'en')
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain('11')
    expect(last.kind).toBe('result')
  })

  test('first step is kind:start with landedJumps 0', () => {
    const sb = buildJumpsSteps(3, 4, 2, 'en')
    const first = sb.steps[0]
    expect(first.kind).toBe('start')
    expect(first.landedJumps).toBe(0)
    expect(first.pos).toBe(3)
  })

  test('jump beats have correct landedJumps and pos', () => {
    const sb = buildJumpsSteps(3, 4, 2, 'en')
    // step index 1 = jump 1: pos = 3+4=7, landedJumps=1
    expect(sb.steps[1].kind).toBe('jump')
    expect(sb.steps[1].landedJumps).toBe(1)
    expect(sb.steps[1].pos).toBe(7)
    // step index 2 = jump 2: pos = 3+8=11, landedJumps=2
    expect(sb.steps[2].kind).toBe('jump')
    expect(sb.steps[2].landedJumps).toBe(2)
    expect(sb.steps[2].pos).toBe(11)
  })

  test('language switch: id contains "Katak", en contains "frog"', () => {
    const id = buildJumpsSteps(3, 4, 2, 'id')
    const en = buildJumpsSteps(3, 4, 2, 'en')
    expect(id.steps[0].caption).toContain('Katak')
    expect(en.steps[0].caption).toContain('frog')
  })

  test('id jump caption contains "Lompat"', () => {
    const id = buildJumpsSteps(3, 4, 2, 'id')
    expect(id.steps[1].caption).toContain('Lompat')
  })

  test('finalIndex is always steps.length - 1', () => {
    for (const jumps of [2, 3, 4, 5]) {
      const sb = buildJumpsSteps(1, 2, jumps, 'en')
      expect(sb.finalIndex).toBe(sb.steps.length - 1)
    }
  })

  test('result beat landedJumps equals jumps', () => {
    const sb = buildJumpsSteps(0, 2, 4, 'en')
    const last = sb.steps[sb.finalIndex]
    expect(last.landedJumps).toBe(4)
  })
})
