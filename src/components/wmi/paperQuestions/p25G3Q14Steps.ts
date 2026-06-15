import type { Lang } from '../concepts/explainers/makeTenSteps'
import { PERIMETER, TALL, TOTAL_WIDTH } from './P25G3Q14Illustration'

export type PerimPhase = 'show' | 'bottom' | 'left' | 'steps' | 'result'

export interface PerimStep {
  phase: PerimPhase
  showOutline: boolean
  showTotal: boolean
  caption: string
  hold: number
  result: boolean
}

export interface PerimStoryboard {
  answer: string
  steps: PerimStep[]
  finalIndex: number
}

export function buildP25G3Q14Steps(lang: Lang, answer: string): PerimStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const A = answer || 'E'

  const steps: PerimStep[] = [
    {
      phase: 'show',
      showOutline: false,
      showTotal: false,
      hold: 1700,
      result: false,
      caption: t('Perimeter = trace the outer border only.', 'Keliling = telusuri hanya tepi luar.'),
    },
    {
      phase: 'bottom',
      showOutline: false,
      showTotal: false,
      hold: 2000,
      result: false,
      caption: t(
        `Bottom edge is the full width: 9 + 5 + 3 + 1 = ${TOTAL_WIDTH}.`,
        `Sisi alas adalah lebar penuh: 9 + 5 + 3 + 1 = ${TOTAL_WIDTH}.`,
      ),
    },
    {
      phase: 'left',
      showOutline: false,
      showTotal: false,
      hold: 2000,
      result: false,
      caption: t(
        `The tall left edge is the biggest square's side: ${TALL}.`,
        `Sisi kiri yang tinggi adalah sisi persegi terbesar: ${TALL}.`,
      ),
    },
    {
      phase: 'steps',
      showOutline: true,
      showTotal: false,
      hold: 2200,
      result: false,
      caption: t(
        `The tops (9+5+3+1) and the step drops (4+2+2+1) each also total ${TOTAL_WIDTH} and ${TALL}.`,
        `Sisi atas (9+5+3+1) dan turunan tangga (4+2+2+1) masing-masing juga ${TOTAL_WIDTH} dan ${TALL}.`,
      ),
    },
    {
      phase: 'result',
      showOutline: true,
      showTotal: true,
      hold: 0,
      result: true,
      caption: t(
        `2 × ${TOTAL_WIDTH} + 2 × ${TALL} = ${PERIMETER} — answer ${A}.`,
        `2 × ${TOTAL_WIDTH} + 2 × ${TALL} = ${PERIMETER} — jawaban ${A}.`,
      ),
    },
  ]

  return { answer: A, steps, finalIndex: steps.length - 1 }
}
