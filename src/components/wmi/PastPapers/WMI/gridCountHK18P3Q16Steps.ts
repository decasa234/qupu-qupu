import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { SQUARES_BY_SIZE, SQUARE_TOTAL } from './GridCountHK18P3Q16Illustration'

export type GridCountHK18P3Q16Phase = 'show' | 'count' | 'result'

export interface GridCountHK18P3Q16Step {
  phase: GridCountHK18P3Q16Phase
  /** Square size highlighted on this beat, or null on show/result beats. */
  size: number | null
  /** Running total of squares tallied so far. */
  running: number
  caption: string
  hold: number
  result: boolean
}

export interface GridCountHK18P3Q16Storyboard {
  total: number
  steps: GridCountHK18P3Q16Step[]
  finalIndex: number
}

export function buildGridCountHK18P3Q16Steps(lang: Lang): GridCountHK18P3Q16Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: GridCountHK18P3Q16Step[] = [
    {
      phase: 'show',
      size: null,
      running: 0,
      hold: 1500,
      result: false,
      caption: t(
        'Count squares of EVERY size — 1×1, 2×2, 3×3, and 4×4!',
        'Hitung persegi dari SEMUA ukuran — 1×1, 2×2, 3×3, dan 4×4!',
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

  const sumParts = SQUARES_BY_SIZE.map(g => g.items.length).join(' + ')
  steps.push({
    phase: 'result',
    size: null,
    running: SQUARE_TOTAL,
    hold: 0,
    result: true,
    caption: t(
      `${sumParts} = ${SQUARE_TOTAL} squares in total!`,
      `${sumParts} = ${SQUARE_TOTAL} persegi seluruhnya!`,
    ),
  })

  return { total: SQUARE_TOTAL, steps, finalIndex: steps.length - 1 }
}
