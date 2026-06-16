// Deterministic storyboard for the WMI-25P1A-Q22 explainer.
//
// Round fish tank, 7 areas in a ring, 3 kinds of fish, adjacent areas differ,
// counts (clockwise from top) = [2,1,1,3,1,1,3], total 12.
// Find the largest possible difference between two kinds' totals. Answer B = 6.
//
// Best valid 3-colouring (verified by brute force over all proper colourings of
// the 7-cycle that respect the three known fish):
//   area kind by index: [B, Y, B, Y, R, B, Y]   (B=blue, Y=yellow, R=red)
//   Yellow = areas 1,3,6 = 1 + 3 + 3 = 7
//   Blue   = areas 0,2,5 = 2 + 1 + 1 = 4
//   Red    = area  4     = 1
//   Largest − smallest = 7 − 1 = 6.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { AREAS, TOTAL_FISH } from './P25G1Q22Illustration'

// Kind assignment per area index (the maximising grouping).
const KIND: Array<'Y' | 'B' | 'R'> = ['B', 'Y', 'B', 'Y', 'R', 'B', 'Y']

const FILL = { Y: '#FFC107', B: '#42A5F5', R: '#EF5350' } as const

function sumFor(k: 'Y' | 'B' | 'R'): number {
  return AREAS.reduce((acc, a, i) => acc + (KIND[i] === k ? a.count : 0), 0)
}

export const YELLOW_SUM = sumFor('Y') // 7
export const BLUE_SUM = sumFor('B') // 4
export const RED_SUM = sumFor('R') // 1
export const MAX_DIFF = Math.max(YELLOW_SUM, BLUE_SUM, RED_SUM) - Math.min(YELLOW_SUM, BLUE_SUM, RED_SUM) // 6

export interface Q22Step {
  /** Per-area fill colour to show the grouping (null = plain water). */
  groupFill: Array<string | null>
  caption: string
  hold: number
  result: boolean
}

export interface Q22Storyboard {
  answer: number
  steps: Q22Step[]
  finalIndex: number
}

function fillForKinds(kinds: Array<'Y' | 'B' | 'R'>): Array<string | null> {
  return KIND.map((k) => (kinds.includes(k) ? FILL[k] : null))
}

export function buildP25G1Q22Steps(lang: Lang): Q22Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const none: Array<string | null> = AREAS.map(() => null)

  const steps: Q22Step[] = [
    {
      groupFill: none,
      hold: 1900,
      result: false,
      caption: t(
        `3 kinds of fish fill 7 areas (total ${TOTAL_FISH}); neighbours must differ.`,
        `3 jenis ikan mengisi 7 area (total ${TOTAL_FISH}); tetangga harus berbeda.`,
      ),
    },
    {
      groupFill: fillForKinds(['Y']),
      hold: 2000,
      result: false,
      caption: t(
        `Group the biggest kind (yellow): 1 + 3 + 3 = ${YELLOW_SUM}.`,
        `Kelompokkan jenis terbesar (kuning): 1 + 3 + 3 = ${YELLOW_SUM}.`,
      ),
    },
    {
      groupFill: fillForKinds(['Y', 'R']),
      hold: 2000,
      result: false,
      caption: t(
        `Make another kind as small as the rules allow (red): just ${RED_SUM}.`,
        `Buat jenis lain sekecil mungkin sesuai aturan (merah): hanya ${RED_SUM}.`,
      ),
    },
    {
      groupFill: fillForKinds(['Y', 'B', 'R']),
      hold: 0,
      result: true,
      caption: t(
        `Biggest ${YELLOW_SUM} − smallest ${RED_SUM} = ${MAX_DIFF} — answer B.`,
        `Terbesar ${YELLOW_SUM} − terkecil ${RED_SUM} = ${MAX_DIFF} — jawaban B.`,
      ),
    },
  ]

  return { answer: MAX_DIFF, steps, finalIndex: steps.length - 1 }
}
