// Pure unit test (no DB) for the always-tap numeric distractor generator.
import { describe, expect, it } from 'vitest'
import { buildNumericChoices } from './lesson.js'

describe('buildNumericChoices', () => {
  it('returns null for non-integer answers (they keep the text input)', () => {
    expect(buildNumericChoices('abc')).toBeNull()
    expect(buildNumericChoices('1.5')).toBeNull()
    expect(buildNumericChoices('')).toBeNull()
  })

  it('yields 4 unique, non-negative choices that always include the answer', () => {
    for (const ans of ['0', '1', '5', '12', '99']) {
      const choices = buildNumericChoices(ans)
      expect(choices).not.toBeNull()
      const labels = choices!.map((c) => c.label)
      expect(labels).toContain(ans) // the correct value is always one of the tiles
      expect(labels).toHaveLength(4)
      expect(new Set(labels).size).toBe(4) // no duplicate distractors
      expect(labels.every((l) => Number(l) >= 0)).toBe(true) // never negative
      choices!.forEach((c) => expect(c.label).toBe(c.text)) // label IS the value
    }
  })
})
