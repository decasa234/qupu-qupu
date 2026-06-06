import type { PaperFile } from './types.js'

// The paper-identifying fields needed to name a figure (a subset of PaperFile).
export type PaperMeta = Pick<PaperFile, 'year' | 'round' | 'grade' | 'variant'>

// Deterministic, collision-free figure filename for a paper question.
export function figureName(meta: PaperMeta, questionNumber: number, ext: string): string {
  const e = ext.replace(/^\./, '').toLowerCase()
  return `${meta.year}-${meta.round}-g${meta.grade}-${meta.variant.toLowerCase()}-q${questionNumber}.${e}`
}
