import { describe, it, expect } from 'vitest'
import { ALL_SLUGS } from './registry.js'
import { THEMES, CURRICULUM } from './curriculum.js'

describe('wmi curriculum', () => {
  it('maps every concept slug', () => {
    const missing = ALL_SLUGS.filter((s) => !CURRICULUM[s])
    expect(missing).toEqual([])
  })
  it('uses only defined themes and valid difficulty', () => {
    const keys = new Set(THEMES.map((t) => t.themeKey))
    for (const slug of ALL_SLUGS) {
      const c = CURRICULUM[slug]
      expect(keys.has(c.themeKey)).toBe(true)
      expect(c.difficulty).toBeGreaterThanOrEqual(1)
      expect(c.difficulty).toBeLessThanOrEqual(3)
    }
  })
})
