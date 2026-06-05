import type { Lang } from './makeTenSteps'

export type ScalePhase = 'show' | 'between' | 'count' | 'result'

export interface ScaleStep {
  phase: ScalePhase
  caption: string
  result: boolean
}

export interface ScaleStoryboard {
  max: number
  value: number
  lo: number
  hi: number
  steps: ScaleStep[]
  finalIndex: number
}

export function buildScaleReadSteps(max: number, value: number, lang: Lang): ScaleStoryboard {
  const lo = Math.floor(value / 10) * 10
  const hi = Math.min(max, lo + 10)

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ScaleStep[] = [
    {
      phase: 'show',
      caption: t('What value is the arrow pointing to?', 'Angka berapa yang ditunjuk panah?'),
      result: false,
    },
    {
      phase: 'between',
      caption: t(
        `The arrow is between ${lo} and ${hi}.`,
        `Panah ada di antara ${lo} dan ${hi}.`,
      ),
      result: false,
    },
    {
      phase: 'count',
      caption: t(
        `Count ${value - lo} small ticks past ${lo}.`,
        `Hitung ${value - lo} garis kecil setelah ${lo}.`,
      ),
      result: false,
    },
    {
      phase: 'result',
      caption: t(`The arrow points to ${value}.`, `Panah menunjuk ${value}.`),
      result: true,
    },
  ]

  return { max, value, lo, hi, steps, finalIndex: steps.length - 1 }
}
