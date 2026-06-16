import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { G2_SHAPE_ROWS } from './ShapeCountG2Illustration'

export type ShapeCountG2Phase = 'show' | 'count' | 'result'

export interface ShapeCountG2Step {
  phase: ShapeCountG2Phase
  /** Row index being counted (0..3), or null on show/result. */
  activeRow: number | null
  caption: string
  hold: number
  result: boolean
}

export interface ShapeCountG2Storyboard {
  counts: number[]
  steps: ShapeCountG2Step[]
  finalIndex: number
}

const NAME: Record<string, { en: string; id: string }> = {
  circle: { en: 'circles', id: 'lingkaran' },
  square: { en: 'squares', id: 'persegi' },
  triangle: { en: 'triangles', id: 'segitiga' },
  bar: { en: 'bars', id: 'batang' },
}

export function buildShapeCountG2Steps(lang: Lang): ShapeCountG2Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const counts = G2_SHAPE_ROWS.map((r) => r.count)

  const steps: ShapeCountG2Step[] = [
    {
      phase: 'show',
      activeRow: null,
      hold: 1500,
      result: false,
      caption: t('Count each kind of shape, then fill in the chart.', 'Hitung setiap jenis bentuk, lalu isi grafiknya.'),
    },
  ]

  G2_SHAPE_ROWS.forEach((row, i) => {
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
