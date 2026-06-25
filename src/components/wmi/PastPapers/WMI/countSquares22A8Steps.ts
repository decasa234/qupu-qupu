import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { SQUARES_BY_SIZE, SQUARE_TOTAL } from './CountSquares22A8Illustration'

export type CountSquares22A8Phase = 'show' | 'count' | 'result'

export interface CountSquares22A8Step {
  phase: CountSquares22A8Phase
  /** Square size highlighted on this beat, or null on show/result beats. */
  size: number | null
  /** Running total of squares tallied so far. */
  running: number
  caption: string
  hold: number
  result: boolean
}

export interface CountSquares22A8Storyboard {
  total: number
  steps: CountSquares22A8Step[]
  finalIndex: number
}

export function buildCountSquares22A8Steps(lang: Lang): CountSquares22A8Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CountSquares22A8Step[] = [
    {
      phase: 'show',
      size: null,
      running: 0,
      hold: 1500,
      result: false,
      caption: t(
        'Count squares of EVERY size — small, medium, and large!',
        'Hitung persegi dari SEMUA ukuran — kecil, sedang, dan besar!',
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
      `${sumParts} = ${SQUARE_TOTAL} squares in all — answer D!`,
      `${sumParts} = ${SQUARE_TOTAL} persegi seluruhnya — jawaban D!`,
    ),
  })

  return { total: SQUARE_TOTAL, steps, finalIndex: steps.length - 1 }
}
