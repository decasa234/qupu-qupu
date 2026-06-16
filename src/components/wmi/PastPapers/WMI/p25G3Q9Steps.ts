import type { Lang } from '../concepts/explainers/makeTenSteps'

export type CrossPhase = 'show' | 'vertical' | 'centre' | 'horizontal' | 'result'

export interface CrossStep {
  phase: CrossPhase
  showCentre: boolean
  showTriangle: boolean
  litLine: 'none' | 'vertical' | 'horizontal'
  caption: string
  hold: number
  result: boolean
}

export interface CrossStoryboard {
  answer: string
  steps: CrossStep[]
  finalIndex: number
}

export function buildP25G3Q9Steps(lang: Lang, answer: string): CrossStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const A = answer || 'E'

  const steps: CrossStep[] = [
    {
      phase: 'show',
      showCentre: false,
      showTriangle: false,
      litLine: 'none',
      hold: 1700,
      result: false,
      caption: t('Every fraction is over 18, and each line of 3 adds to 18/18.', 'Semua pecahan per 18, dan tiap garis berisi 3 berjumlah 18/18.'),
    },
    {
      phase: 'vertical',
      showCentre: false,
      showTriangle: false,
      litLine: 'vertical',
      hold: 2100,
      result: false,
      caption: t('Vertical line: 5/18 + centre + 4/18 = 18/18.', 'Garis tegak: 5/18 + tengah + 4/18 = 18/18.'),
    },
    {
      phase: 'centre',
      showCentre: true,
      showTriangle: false,
      litLine: 'vertical',
      hold: 2200,
      result: false,
      caption: t('5/18 + 4/18 = 9/18, so the centre = 18/18 − 9/18 = 9/18.', '5/18 + 4/18 = 9/18, jadi tengah = 18/18 − 9/18 = 9/18.'),
    },
    {
      phase: 'horizontal',
      showCentre: true,
      showTriangle: false,
      litLine: 'horizontal',
      hold: 2200,
      result: false,
      caption: t('Horizontal line: 7/18 + 9/18 + ▲ = 18/18, so ▲ = 18/18 − 16/18.', 'Garis mendatar: 7/18 + 9/18 + ▲ = 18/18, jadi ▲ = 18/18 − 16/18.'),
    },
    {
      phase: 'result',
      showCentre: true,
      showTriangle: true,
      litLine: 'horizontal',
      hold: 0,
      result: true,
      caption: t(`▲ = 2/18 — answer ${A}.`, `▲ = 2/18 — jawaban ${A}.`),
    },
  ]

  return { answer: A, steps, finalIndex: steps.length - 1 }
}
