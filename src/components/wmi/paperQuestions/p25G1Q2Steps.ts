import type { Lang } from '../concepts/explainers/makeTenSteps'

// Storyboard for WMI-25P1A-Q2 — "which fraction is the shaded region?"
// Answer A = 1/4. We split the square into 4 equal quadrants, count the total
// equal parts, count the shaded parts, then write shaded-over-total = 1/4.

export type Q2Phase = 'show' | 'parts' | 'shaded' | 'result'

export interface Q2Step {
  phase: Q2Phase
  /** Shade the top-left quadrant. */
  shade: boolean
  /** Draw the 2x2 quadrant lines bold to count the equal parts. */
  emphasise: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q2Storyboard {
  total: number
  shaded: number
  answer: string
  steps: Q2Step[]
  finalIndex: number
}

export function buildP25G1Q2Steps(lang: Lang): Q2Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q2Step[] = [
    {
      phase: 'show',
      shade: true,
      emphasise: false,
      hold: 1700,
      result: false,
      caption: t(
        'A fraction is shaded parts over total equal parts.',
        'Pecahan adalah bagian diarsir dibagi seluruh bagian sama besar.',
      ),
    },
    {
      phase: 'parts',
      shade: true,
      emphasise: true,
      hold: 2000,
      result: false,
      caption: t(
        'The square splits into 4 equal smaller squares — total = 4.',
        'Persegi terbagi jadi 4 persegi sama besar — seluruhnya = 4.',
      ),
    },
    {
      phase: 'shaded',
      shade: true,
      emphasise: true,
      hold: 1900,
      result: false,
      caption: t('Only 1 of those squares is shaded — shaded = 1.', 'Hanya 1 persegi yang diarsir — diarsir = 1.'),
    },
    {
      phase: 'result',
      shade: true,
      emphasise: true,
      hold: 0,
      result: true,
      caption: t('1 shaded out of 4 = 1/4 — answer A.', '1 diarsir dari 4 = 1/4 — jawaban A.'),
    },
  ]

  return { total: 4, shaded: 1, answer: 'A', steps, finalIndex: steps.length - 1 }
}
