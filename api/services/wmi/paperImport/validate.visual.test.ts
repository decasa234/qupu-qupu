import { describe, test, expect } from 'vitest'
import { validatePaper } from './validate'
import type { PaperFile, PaperQuestion } from './types'

const choices = [
  { label: 'A', text: '21' },
  { label: 'B', text: '16' },
  { label: 'C', text: '24' },
  { label: 'D', text: '12' },
]

function paperWith(visual: PaperQuestion['visual']): PaperFile {
  return {
    year: 2025,
    grade: 1,
    round: 'semifinal',
    variant: 'A',
    title: 'test',
    recommended_duration_min: 60,
    questions: [
      {
        number: 1,
        body_en: 'Which is largest?',
        body_id: 'Mana yang terbesar?',
        answer_type: 'multiple_choice',
        choices_en: choices,
        choices_id: choices,
        answer: 'C',
        visual,
      },
    ],
  }
}

const goodParams = {
  intro_en: 'Check each option.',
  intro_id: 'Periksa tiap pilihan.',
  items: [{ text_en: '24 is biggest', text_id: '24 terbesar', ok: true }],
  final_en: 'So 24 (C).',
  final_id: 'Jadi 24 (C).',
  aria_en: 'a',
  aria_id: 'b',
}

describe('validatePaper — visual template binding', () => {
  test('valid try-and-eliminate binding produces no problems', () => {
    const problems = validatePaper(paperWith({ templateId: 'try-and-eliminate', params: goodParams }), new Set())
    expect(problems).toEqual([])
  })

  test('unknown templateId is flagged', () => {
    const problems = validatePaper(paperWith({ templateId: 'no-such-template', params: {} }), new Set())
    expect(problems.some((p) => p.includes('unknown visual.templateId'))).toBe(true)
  })

  test('invalid params for a real template are flagged', () => {
    const problems = validatePaper(
      paperWith({ templateId: 'try-and-eliminate', params: { intro_en: 'only this' } }),
      new Set(),
    )
    expect(problems.some((p) => p.includes('visual.params invalid'))).toBe(true)
  })
})
