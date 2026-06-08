import type { Lang } from './makeTenSteps'

export type PatternPhase = 'show' | 'diff' | 'add' | 'result'

export interface PatternStep {
  phase: PatternPhase
  caption: string
  result: boolean
}

export interface PatternNextStoryboard {
  start: number
  step: number
  /** The shown terms (3 terms: start + i*step for i=0..2). */
  terms: number[]
  /** The next value = start + 3*step. */
  next: number
  steps: PatternStep[]
  finalIndex: number
}

export function buildPatternNextSteps(start: number, step: number, lang: Lang): PatternNextStoryboard {
  // Matches the concept's render: seq = [0,1,2].map(i => start + i*step), correct = start + 3*step
  const terms = [0, 1, 2].map((i) => start + i * step)
  const next = start + 3 * step
  const lastShown = terms[terms.length - 1]

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PatternStep[] = [
    {
      phase: 'show',
      caption: t('What number comes next?', 'Bilangan berapa berikutnya?'),
      result: false,
    },
    {
      phase: 'diff',
      caption: t(`Each number goes up by ${step}.`, `Tiap bilangan naik ${step}.`),
      result: false,
    },
    {
      phase: 'add',
      caption: t(`${lastShown} + ${step} = ${next}.`, `${lastShown} + ${step} = ${next}.`),
      result: false,
    },
    {
      phase: 'result',
      caption: t(`The next number is ${next}.`, `Bilangan berikutnya ${next}.`),
      result: true,
    },
  ]

  return { start, step, terms, next, steps, finalIndex: steps.length - 1 }
}
