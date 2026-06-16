import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { SQUARES_BY_SIZE, SQUARE_TOTAL } from './CountSquaresIllustration'

export type CountSquaresPhase = 'show' | 'count' | 'result'

export interface CountSquaresStep {
  phase: CountSquaresPhase
  /** Square size highlighted on this beat, or null on show/result. */
  size: number | null
  /** Running total of squares counted so far. */
  running: number
  caption: string
  hold: number
  result: boolean
}

export interface CountSquaresStoryboard {
  total: number
  steps: CountSquaresStep[]
  finalIndex: number
}

const SIZE_NAME = (size: number, lang: Lang): string => {
  if (lang === 'id') return `${size}×${size}`
  return `${size}×${size}`
}

export function buildCountSquaresSteps(lang: Lang): CountSquaresStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CountSquaresStep[] = [
    {
      phase: 'show',
      size: null,
      running: 0,
      hold: 1500,
      result: false,
      caption: t('How many squares of every size are hidden here? Count by size.', 'Ada berapa persegi dari segala ukuran di sini? Hitung per ukuran.'),
    },
  ]

  let running = 0
  SQUARES_BY_SIZE.forEach(({ size, items }) => {
    running += items.length
    const name = SIZE_NAME(size, lang)
    steps.push({
      phase: 'count',
      size,
      running,
      hold: 1800,
      result: false,
      caption: t(
        `${name} squares: ${items.length}. Total so far ${running}.`,
        `Persegi ${name}: ${items.length}. Sejauh ini ${running}.`,
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
      `${sumParts} = ${SQUARE_TOTAL} squares in all.`,
      `${sumParts} = ${SQUARE_TOTAL} persegi semuanya.`,
    ),
  })

  return { total: SQUARE_TOTAL, steps, finalIndex: steps.length - 1 }
}
