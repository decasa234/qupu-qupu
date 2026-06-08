import { describe, it, expect } from 'vitest'
import { ALL_SLUGS } from './registry.js'
import { SUBJECTS, CURRICULUM, TAGS } from './curriculum.js'

const SUBJECT_KEYS = new Set(SUBJECTS.map((s) => s.subjectKey))

describe('wmi curriculum (per-grade subjects)', () => {
  it('maps every concept slug to a valid subject + difficulty', () => {
    const bad = ALL_SLUGS.filter((s) => {
      const c = CURRICULUM[s]
      return !c || !SUBJECT_KEYS.has(c.subjectKey) || c.difficulty < 1 || c.difficulty > 3
    })
    expect(bad).toEqual([])
  })
  it('subject grades are 1..3 (no grade 0) and keys unique', () => {
    expect(SUBJECTS.every((s) => s.grade >= 1 && s.grade <= 3)).toBe(true)
    expect(new Set(SUBJECTS.map((s) => s.subjectKey)).size).toBe(SUBJECTS.length)
  })
  it('every subject has at least one concept (no empty subjects)', () => {
    const used = new Set(ALL_SLUGS.map((s) => CURRICULUM[s]?.subjectKey))
    const empty = SUBJECTS.filter((s) => !used.has(s.subjectKey)).map((s) => s.subjectKey)
    expect(empty).toEqual([])
  })
  it('every concept has at least one valid tag', () => {
    const valid = new Set(TAGS.map((t) => t.key))
    const bad = ALL_SLUGS.filter((s) => {
      const tags = CURRICULUM[s]?.tags
      return !tags || tags.length === 0 || tags.some((t) => !valid.has(t))
    })
    expect(bad).toEqual([])
  })
})
