import { describe, it, expect } from 'vitest'
import { lessonBlockSchema, lessonBlocksSchema } from './blocks.js'

describe('lessonBlockSchema', () => {
  it('accepts a valid prose block', () => {
    const r = lessonBlockSchema.safeParse({
      id: 'b1',
      type: 'prose',
      body_en: 'Read the question twice.',
      body_id: 'Baca soal dua kali.',
    })
    expect(r.success).toBe(true)
  })

  it('defaults tip variant to "tip"', () => {
    const r = lessonBlockSchema.parse({
      id: 'b2',
      type: 'tip',
      body_en: 'Underline the keyword.',
      body_id: 'Garis bawahi kata kunci.',
    })
    expect(r.type === 'tip' && r.variant).toBe('tip')
  })

  it('rejects an unknown block type', () => {
    const r = lessonBlockSchema.safeParse({ id: 'x', type: 'video', url: 'a' })
    expect(r.success).toBe(false)
  })

  it('accepts a worked block referencing a paper code', () => {
    const r = lessonBlockSchema.safeParse({
      id: 'b3',
      type: 'worked',
      source: 'paper',
      code: 'WMI-20F1A-Q1',
    })
    expect(r.success).toBe(true)
  })
})

describe('lessonBlocksSchema', () => {
  it('accepts a well-formed check block', () => {
    const r = lessonBlocksSchema.safeParse([
      {
        id: 'c1',
        type: 'check',
        prompt_en: 'What is 2 + 3?',
        prompt_id: 'Berapa 2 + 3?',
        choices_en: ['4', '5', '6'],
        choices_id: ['4', '5', '6'],
        answer_index: 1,
      },
    ])
    expect(r.success).toBe(true)
  })

  it('rejects a check block whose answer_index is out of range', () => {
    const r = lessonBlocksSchema.safeParse([
      {
        id: 'c2',
        type: 'check',
        prompt_en: 'q',
        prompt_id: 'q',
        choices_en: ['a', 'b'],
        choices_id: ['a', 'b'],
        answer_index: 2,
      },
    ])
    expect(r.success).toBe(false)
  })

  it('rejects mismatched choice array lengths', () => {
    const r = lessonBlocksSchema.safeParse([
      {
        id: 'c3',
        type: 'check',
        prompt_en: 'q',
        prompt_id: 'q',
        choices_en: ['a', 'b', 'c'],
        choices_id: ['a', 'b'],
        answer_index: 0,
      },
    ])
    expect(r.success).toBe(false)
  })

  it('rejects duplicate block ids', () => {
    const r = lessonBlocksSchema.safeParse([
      { id: 'dup', type: 'prose', body_en: 'a', body_id: 'a' },
      { id: 'dup', type: 'prose', body_en: 'b', body_id: 'b' },
    ])
    expect(r.success).toBe(false)
  })

  it('rejects a check block with fewer than two choices', () => {
    const r = lessonBlocksSchema.safeParse([
      {
        id: 'c4',
        type: 'check',
        prompt_en: 'q',
        prompt_id: 'q',
        choices_en: ['a'],
        choices_id: ['a'],
        answer_index: 0,
      },
    ])
    expect(r.success).toBe(false)
  })
})
