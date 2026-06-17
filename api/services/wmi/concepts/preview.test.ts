import { describe, expect, test } from 'vitest'
import { listConceptsForPreview } from './preview.js'
import { STRAND_ORDER } from './taxonomy.js'

describe('listConceptsForPreview', () => {
  const list = listConceptsForPreview()

  test('exposes strand/topic/difficulty/isOlympiad for a foundational concept', () => {
    const add = list.find((c) => c.slug === 'single-digit-addition')!
    expect(add.strand).toBe('AR')
    expect(add.strand_label).toBe('Arithmetic & Computation')
    expect(add.topic).toBe('AR-OPS')
    expect(add.topic_label).toBe('Basic Operations')
    expect(add.difficulty).toBe(1)
    expect(add.isOlympiad).toBe(false)
    expect(add.short_id).toBe('A1')
  })

  test('flags a genuine olympiad concept', () => {
    const combo = list.find((c) => c.slug === 'combination-product-sum')!
    expect(combo.strand).toBe('CO')
    expect(combo.difficulty).toBe(5)
    expect(combo.isOlympiad).toBe(true)
  })

  test('is sorted by strand order', () => {
    const idx = (s: string) => STRAND_ORDER.indexOf(s as never)
    for (let i = 1; i < list.length; i++) {
      expect(idx(list[i].strand)).toBeGreaterThanOrEqual(idx(list[i - 1].strand))
    }
  })
})
