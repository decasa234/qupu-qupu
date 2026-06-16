import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { SHAPE_ROWS } from './ShapeCountChartIllustration'

export type ShapeCountPhase = 'show' | 'count' | 'result'

export interface ShapeCountStep {
  phase: ShapeCountPhase
  /** Row index being counted (0..3), or null on show/result. */
  activeRow: number | null
  caption: string
  hold: number
  result: boolean
}

export interface ShapeCountStoryboard {
  counts: number[]
  steps: ShapeCountStep[]
  finalIndex: number
}

const NAME: Record<string, { en: string; id: string }> = {
  circle: { en: 'circles', id: 'lingkaran' },
  square: { en: 'squares', id: 'persegi' },
  triangle: { en: 'triangles', id: 'segitiga' },
  bar: { en: 'bars', id: 'batang' },
}

export function buildShapeCountChartSteps(lang: Lang): ShapeCountStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const counts = SHAPE_ROWS.map((r) => r.count)

  const steps: ShapeCountStep[] = [
    {
      phase: 'show',
      activeRow: null,
      hold: 1500,
      result: false,
      caption: t('Count each kind of shape, then fill in the chart.', 'Hitung setiap jenis bentuk, lalu isi grafiknya.'),
    },
  ]

  SHAPE_ROWS.forEach((row, i) => {
    const name = NAME[row.kind]
    steps.push({
      phase: 'count',
      activeRow: i,
      hold: 1700,
      result: false,
      caption: t(`${name.en}: ${row.count}.`, `${name.id}: ${row.count}.`),
    })
  })

  steps.push({
    phase: 'result',
    activeRow: null,
    hold: 0,
    result: true,
    caption: t(
      `Chart with ${counts.join(', ')} — that's option C.`,
      `Grafik dengan ${counts.join(', ')} — itu pilihan C.`,
    ),
  })

  return { counts, steps, finalIndex: steps.length - 1 }
}
