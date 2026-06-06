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
  /** Nearest lower numbered (×10) mark. */
  lo: number
  hi: number
  /** Nearest lower 5-mark (a big or medium tick) — where the small-tick count starts. */
  base5: number
  steps: ScaleStep[]
  finalIndex: number
}

export function buildScaleReadSteps(max: number, value: number, lang: Lang): ScaleStoryboard {
  const lo = Math.floor(value / 10) * 10
  const hi = Math.min(max, lo + 10)
  const base5 = Math.floor(value / 5) * 5
  const ticks = value - base5

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
      phase: 'count',
      caption: t(
        `Jump to the ${base5} mark, then count ${ticks} small tick${ticks !== 1 ? 's' : ''}.`,
        `Loncat ke garis ${base5}, lalu hitung ${ticks} garis kecil.`,
      ),
      result: false,
    },
    {
      phase: 'result',
      caption: t(`The arrow points to ${value}.`, `Panah menunjuk ${value}.`),
      result: true,
    },
  ]

  return { max, value, lo, hi, base5, steps, finalIndex: steps.length - 1 }
}
