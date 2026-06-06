import type { Lang } from './makeTenSteps'

export type ScalePhase = 'show' | 'between' | 'half' | 'result'

export interface ScaleStep {
  phase: ScalePhase
  caption: string
  result: boolean
}

export interface ScaleStoryboard {
  max: number
  value: number
  /** Nearest lower numbered (×10) mark. */
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
      caption: t(`The arrow is between ${lo} and ${hi}.`, `Panah ada di antara ${lo} dan ${hi}.`),
      result: false,
    },
    {
      phase: 'half',
      caption: t(
        `It sits on the half-mark, exactly between them → ${value}.`,
        `Panah tepat di garis tengah keduanya → ${value}.`,
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
