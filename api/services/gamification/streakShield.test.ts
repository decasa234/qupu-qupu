// Pure streak-shield math (no DB) — the consume decision P1.2 hooks into
// updateStreakForActivity, plus the covered-dates + deterministic-UUID
// helpers used for the audit ledger row.

import { describe, it, expect } from 'vitest'
import { resolveShieldConsumption, __test__ } from './streakUpdater.js'

const { wibDatesBetween, deterministicUuid } = __test__

describe('resolveShieldConsumption', () => {
  it('gap 2 (1 missed day), 1 shield → covered, consume 1', () => {
    expect(resolveShieldConsumption(2, 1)).toEqual({ consume: 1, covered: true })
  })

  it('gap 2, 2 shields → covered, consume only 1 (no over-spend)', () => {
    expect(resolveShieldConsumption(2, 2)).toEqual({ consume: 1, covered: true })
  })

  it('gap 3 (2 missed days), 2 shields → covered, consume 2', () => {
    expect(resolveShieldConsumption(3, 2)).toEqual({ consume: 2, covered: true })
  })

  it('gap 4 (3 missed days), 2 shields → NOT covered, consume 0 (no waste)', () => {
    expect(resolveShieldConsumption(4, 2)).toEqual({ consume: 0, covered: false })
  })

  it('gap 3, 1 shield → NOT covered, consume 0', () => {
    expect(resolveShieldConsumption(3, 1)).toEqual({ consume: 0, covered: false })
  })

  it('gap 2, 0 shields → break (consume 0)', () => {
    expect(resolveShieldConsumption(2, 0)).toEqual({ consume: 0, covered: false })
  })

  it('gap 0 / gap 1 (no missed day) → never consumes', () => {
    expect(resolveShieldConsumption(0, 2)).toEqual({ consume: 0, covered: false })
    expect(resolveShieldConsumption(1, 2)).toEqual({ consume: 0, covered: false })
  })
})

describe('wibDatesBetween', () => {
  it('gap 2: returns the single missed day', () => {
    expect(wibDatesBetween('2026-06-08', '2026-06-10')).toEqual(['2026-06-09'])
  })

  it('gap 3: returns both missed days, ascending', () => {
    expect(wibDatesBetween('2026-06-07', '2026-06-10')).toEqual([
      '2026-06-08',
      '2026-06-09',
    ])
  })

  it('crosses a month boundary', () => {
    expect(wibDatesBetween('2026-05-31', '2026-06-02')).toEqual(['2026-06-01'])
  })

  it('consecutive days: nothing between', () => {
    expect(wibDatesBetween('2026-06-09', '2026-06-10')).toEqual([])
  })
})

describe('deterministicUuid', () => {
  it('is stable for the same seed (idempotency anchor)', () => {
    const a = deterministicUuid('streak-shield:child-1:2026-06-10')
    const b = deterministicUuid('streak-shield:child-1:2026-06-10')
    expect(a).toBe(b)
  })

  it('differs across seeds and is UUID-shaped', () => {
    const a = deterministicUuid('streak-shield:child-1:2026-06-10')
    const b = deterministicUuid('streak-shield:child-1:2026-06-11')
    expect(a).not.toBe(b)
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })
})
