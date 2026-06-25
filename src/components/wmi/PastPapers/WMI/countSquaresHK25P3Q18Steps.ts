import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { SQUARES_BY_SIZE, SQUARE_TOTAL } from './CountSquaresHK25P3Q18Illustration'

export type CountSquaresHK25P3Q18Phase = 'show' | 'count' | 'result'

export interface CountSquaresHK25P3Q18Step {
  phase: CountSquaresHK25P3Q18Phase
  size: number | null
  running: number
  caption: string
  hold: number
  result: boolean
}

export interface CountSquaresHK25P3Q18Storyboard {
  total: number
  steps: CountSquaresHK25P3Q18Step[]
  finalIndex: number
}

export function buildCountSquaresHK25P3Q18Steps(lang: Lang): CountSquaresHK25P3Q18Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CountSquaresHK25P3Q18Step[] = [
    {
      phase: 'show',
      size: null,
      running: 0,
      hold: 1500,
      result: false,
      caption: t(
        'Count squares of EVERY size — 1×1 and 2×2!',
        'Hitung persegi dari SEMUA ukuran — 1×1 dan 2×2!',
      ),
    },
  ]

  let running = 0
  SQUARES_BY_SIZE.forEach(({ size, items }) => {
    running += items.length
    const name = `${size}×${size}`
    steps.push({
      phase: 'count',
      size,
      running,
      hold: 1800,
      result: false,
      caption: t(
        `${name} squares: ${items.length}. Running total: ${running}.`,
        `Persegi ${name}: ${items.length}. Total sejauh ini: ${running}.`,
      ),
    })
  })

  const sumParts = SQUARES_BY_SIZE.map((g) => g.items.length).join(' + ')
  steps.push({
    phase: 'result',
    size: null,
    running: SQUARE_TOTAL,
    hold: 0,
    result: true,
    caption: t(
      `${sumParts} = ${SQUARE_TOTAL} squares in all!`,
      `${sumParts} = ${SQUARE_TOTAL} persegi seluruhnya!`,
    ),
  })

  return { total: SQUARE_TOTAL, steps, finalIndex: steps.length - 1 }
}
