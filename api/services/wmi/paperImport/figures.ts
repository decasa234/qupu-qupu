export interface PaperMeta {
  year: number
  round: 'semifinal' | 'final'
  grade: number
  variant: 'A' | 'B'
}

// Deterministic, collision-free figure filename for a paper question.
export function figureName(meta: PaperMeta, questionNumber: number, ext: string): string {
  const e = ext.replace(/^\./, '').toLowerCase()
  return `${meta.year}-${meta.round}-g${meta.grade}-${meta.variant.toLowerCase()}-q${questionNumber}.${e}`
}
