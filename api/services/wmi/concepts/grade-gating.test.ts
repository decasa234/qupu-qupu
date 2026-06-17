import { describe, expect, test } from 'vitest'
import { CONCEPTS } from './registry.js'

// After grade-gating, these trivial difficulty-1 concepts must not serve G2/G3.
const GATED: Record<string, number[]> = {
  'single-digit-addition': [1],
  'single-digit-subtraction': [1],
  'compare-order-numbers': [1],
  'more-or-less-by-k': [1],
  'tally-marks-count': [1],
  'clock-read-time': [1],
  'bar-chart-compare': [1],
  'angle-type': [2],
}

describe('grade-gating of trivial concepts', () => {
  for (const [slug, grades] of Object.entries(GATED)) {
    test(`${slug} is gated to ${JSON.stringify(grades)}`, () => {
      expect([...CONCEPTS[slug as keyof typeof CONCEPTS].meta.grades]).toEqual(grades)
    })
  }
})
