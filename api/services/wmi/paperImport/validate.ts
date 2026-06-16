import type { PaperFile } from './types.js'
// Tsx-only import (this module is run solely by db/seed/wmi/validate-papers.ts, never
// the API server) — lets us validate a question's pooled-template params at seed time.
import { getTemplate } from '../../../../src/components/wmi/PastPapers/WMI/templates/registry.js'

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

  // Papers from 2019-2022 use 4 options (A-D); 2023+ finals use 5 options (A-E).
  const okChoices = (c?: Array<{ label: string; text: string }>): boolean =>
    Array.isArray(c) &&
    (c.length === 4 || c.length === 5) &&
    c.every((x, i) => x.label === 'ABCDE'[i] && Boolean(x.text?.trim()))

  for (const q of paper.questions) {
    if (!q.body_en?.trim()) problems.push(tag(q.number, 'empty body_en'))
    if (!q.body_id?.trim()) problems.push(tag(q.number, 'empty body_id'))

    if (q.answer_type === 'multiple_choice') {
      if (!okChoices(q.choices_en)) problems.push(tag(q.number, 'multiple_choice needs 4 or 5 choices_en labelled A,B,C,D[,E]'))
      if (!okChoices(q.choices_id)) problems.push(tag(q.number, 'multiple_choice needs 4 or 5 choices_id labelled A,B,C,D[,E]'))
      if (!/^[ABCDE]$/.test(q.answer)) problems.push(tag(q.number, `answer "${q.answer}" must be A-E`))
    } else if (q.answer_type === 'fill_in') {
      if (!q.answer?.trim()) problems.push(tag(q.number, 'fill_in needs a non-empty answer'))
    } else {
      problems.push(tag(q.number, `unknown answer_type "${q.answer_type as string}"`))
    }

    if (q.figure_url) {
      const base = q.figure_url.split('/').pop() ?? ''
      if (!presentFigures.has(base)) problems.push(tag(q.number, `figure_url file "${base}" not found in figures/`))
    }

    if (q.visual) {
      const t = getTemplate(q.visual.templateId)
      if (!t) {
        problems.push(tag(q.number, `unknown visual.templateId "${q.visual.templateId}"`))
      } else if (t.meta.paramsSchema) {
        const parsed = t.meta.paramsSchema.safeParse(q.visual.params)
        if (!parsed.success) {
          problems.push(
            tag(q.number, `visual.params invalid for "${q.visual.templateId}": ${parsed.error.issues[0]?.message ?? 'schema mismatch'}`),
          )
        }
      }
    }
  }

  return problems
}
