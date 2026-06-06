import { describe, test, expect } from 'vitest'
import { validatePaper } from './validate.js'
import type { PaperFile } from './types.js'

function mc(number: number, answer: string, figure?: string): PaperFile['questions'][number] {
  return {
    number,
    body_en: `Q${number} en`,
    body_id: `Q${number} id`,
    answer_type: 'multiple_choice',
    choices_en: ['A', 'B', 'C', 'D'].map((l) => ({ label: l, text: `${l}t` })),
    choices_id: ['A', 'B', 'C', 'D'].map((l) => ({ label: l, text: `${l}t` })),
    answer,
    ...(figure ? { figure_url: `/api/public/wmi/figures/${figure}` } : {}),
  }
}

const goodPaper: PaperFile = {
  year: 2019, grade: 1, round: 'final', variant: 'A',
  title: 'WMI 2019 Grade 1 Final — Paper A', recommended_duration_min: 60,
  questions: [
    mc(1, 'B', '2019-final-g1-a-q1.jpg'),
    mc(2, 'D'),
    { number: 3, body_en: 'x', body_id: 'y', answer_type: 'fill_in', answer: '240' },
  ],
}

describe('validatePaper', () => {
  test('a well-formed paper has no problems', () => {
    expect(validatePaper(goodPaper, new Set(['2019-final-g1-a-q1.jpg']))).toEqual([])
  })

  test('flags bad choices, bad answer, missing figure, empty fill-in, and numbering gaps', () => {
    const bad: PaperFile = {
      ...goodPaper,
      questions: [
        { ...mc(1, 'E'), choices_en: [{ label: 'A', text: 'a' }] },
        mc(3, 'B', 'missing.jpg'),
        { number: 4, body_en: 'x', body_id: 'y', answer_type: 'fill_in', answer: '' },
      ],
    }
    const problems = validatePaper(bad, new Set())
    expect(problems.join('\n')).toMatch(/numbering not contiguous/)
    expect(problems.join('\n')).toMatch(/Q1: .*choices_en/)
    expect(problems.join('\n')).toMatch(/Q1: answer "E" must be A-D/)
    expect(problems.join('\n')).toMatch(/Q3: figure_url file "missing.jpg" not found/)
    expect(problems.join('\n')).toMatch(/Q4: fill_in needs a non-empty answer/)
  })
})
