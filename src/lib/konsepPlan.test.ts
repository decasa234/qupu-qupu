import { describe, expect, test } from 'vitest'
import { buildPlan, FOCUS_SESSION_SIZE, SESSION_SIZE } from './konsepPlan'
import type { WmiGardenConcept } from '../types/wmi'

function makeConcept(slug: string, pct = 0): WmiGardenConcept {
  return {
    slug,
    nameId: slug,
    nameEn: slug,
    difficulty: 1,
    tier: 0,
    pct,
    tags: [],
    attempts: 0,
    correct: 0,
  }
}

const concepts = [
  makeConcept('alpha', 10),
  makeConcept('beta', 50),
  makeConcept('gamma', 90),
]

function maxConsecutiveRun(plan: WmiGardenConcept[]): number {
  let max = 0
  let run = 0
  let prev: string | null = null
  for (const item of plan) {
    run = item.slug === prev ? run + 1 : 1
    prev = item.slug
    if (run > max) max = run
  }
  return max
}

describe('buildPlan (non-focus)', () => {
  test('defaults to SESSION_SIZE (20) items drawn from the input', () => {
    for (let i = 0; i < 200; i++) {
      const plan = buildPlan(concepts)
      expect(plan).toHaveLength(SESSION_SIZE)
      for (const item of plan) {
        expect(concepts).toContain(item)
      }
    }
  })

  test('respects an explicit size', () => {
    const plan = buildPlan(concepts, { size: 7 })
    expect(plan).toHaveLength(7)
  })

  test('never picks the same slug twice in a row (old invariant)', () => {
    for (let i = 0; i < 200; i++) {
      const plan = buildPlan(concepts)
      expect(maxConsecutiveRun(plan)).toBeLessThanOrEqual(1)
    }
  })

  test('single-concept chapter repeats that concept (adjacency waived)', () => {
    const only = [makeConcept('solo')]
    const plan = buildPlan(only)
    expect(plan).toHaveLength(SESSION_SIZE)
    expect(plan.every((c) => c.slug === 'solo')).toBe(true)
  })
})

describe('buildPlan (focus mode)', () => {
  test('size 10 yields exactly 10 items: 8 focus + 2 review', () => {
    for (let i = 0; i < 200; i++) {
      const plan = buildPlan(concepts, { focusSlug: 'beta', size: FOCUS_SESSION_SIZE })
      expect(plan).toHaveLength(10)
      const focusItems = plan.filter((c) => c.slug === 'beta')
      const reviewItems = plan.filter((c) => c.slug !== 'beta')
      expect(focusItems).toHaveLength(8)
      expect(reviewItems).toHaveLength(2)
      for (const item of reviewItems) {
        expect(['alpha', 'gamma']).toContain(item.slug)
      }
    }
  })

  test('single-concept chapter + focus → all questions are focus', () => {
    const only = [makeConcept('solo')]
    const plan = buildPlan(only, { focusSlug: 'solo', size: FOCUS_SESSION_SIZE })
    expect(plan).toHaveLength(10)
    expect(plan.every((c) => c.slug === 'solo')).toBe(true)
  })

  test('same slug never appears more than 3x consecutively when review exists', () => {
    for (let i = 0; i < 200; i++) {
      const plan = buildPlan(concepts, { focusSlug: 'alpha', size: FOCUS_SESSION_SIZE })
      expect(maxConsecutiveRun(plan)).toBeLessThanOrEqual(3)
    }
  })

  test('focusSlug not present in concepts falls back to non-focus behavior', () => {
    for (let i = 0; i < 200; i++) {
      const plan = buildPlan(concepts, { focusSlug: 'missing', size: FOCUS_SESSION_SIZE })
      expect(plan).toHaveLength(10)
      expect(maxConsecutiveRun(plan)).toBeLessThanOrEqual(1)
      for (const item of plan) {
        expect(concepts).toContain(item)
      }
    }
  })
})
