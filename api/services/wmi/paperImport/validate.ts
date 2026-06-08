import type { PaperFile } from './types.js'

// Returns a list of human-readable problems; empty means the paper is valid.
export function validatePaper(paper: PaperFile, presentFigures: Set<string>): string[] {
  const problems: string[] = []
  const tag = (n: number, msg: string) => `Q${n}: ${msg}`

  const numbers = paper.questions.map((q) => q.number)
  for (let i = 0; i < numbers.length; i++) {
    if (numbers[i] !== i + 1) {
      problems.push(`numbering not contiguous at position ${i + 1} (found ${numbers[i]}, expected ${i + 1}; later numbers may also be off)`)
      break
    }
  }
  if (new Set(numbers).size !== numbers.length) problems.push('duplicate question numbers')

  const okChoices = (c?: Array<{ label: string; text: string }>): boolean =>
    Array.isArray(c) && c.length === 4 && c.every((x, i) => x.label === 'ABCD'[i] && Boolean(x.text?.trim()))

  for (const q of paper.questions) {
    if (!q.body_en?.trim()) problems.push(tag(q.number, 'empty body_en'))
    if (!q.body_id?.trim()) problems.push(tag(q.number, 'empty body_id'))

    if (q.answer_type === 'multiple_choice') {
      if (!okChoices(q.choices_en)) problems.push(tag(q.number, 'multiple_choice needs 4 choices_en labelled A,B,C,D'))
      if (!okChoices(q.choices_id)) problems.push(tag(q.number, 'multiple_choice needs 4 choices_id labelled A,B,C,D'))
      if (!/^[ABCD]$/.test(q.answer)) problems.push(tag(q.number, `answer "${q.answer}" must be A-D`))
    } else if (q.answer_type === 'fill_in') {
      if (!q.answer?.trim()) problems.push(tag(q.number, 'fill_in needs a non-empty answer'))
    } else {
      problems.push(tag(q.number, `unknown answer_type "${q.answer_type as string}"`))
    }

    if (q.figure_url) {
      const base = q.figure_url.split('/').pop() ?? ''
      if (!presentFigures.has(base)) problems.push(tag(q.number, `figure_url file "${base}" not found in figures/`))
    }
  }

  return problems
}
