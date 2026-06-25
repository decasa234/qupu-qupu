// SEAMO-X 2024 Paper A Q7 — wire-square perimeter steps.
// Wire total = 98 cm. Square side = 16 cm.
// Strategy: perimeter = 4 × 16 = 64 cm; remaining = 98 − 64 = 34 cm.
//
// Beat 0 — intro (idle phase): show the square, read the facts
// Beat 1 — perimeter (highlight all 4 sides): 4 × 16 = 64 cm
// Beat 2 — result: remaining = 98 − 64 = 34 cm ✓

import type { WireSquarePhase } from './WireSquareX24A7Illustration'

export type Lang = 'en' | 'id'

// Problem constants — bound to seed quantities
export const WIRE_TOTAL_CM = 98
export const SIDE_CM = 16
export const PERIMETER_CM = 64   // 4 × 16
export const REMAINING_CM = 34   // 98 − 64

export type WireSquareX24A7PhaseLabel = 'intro' | 'perimeter' | 'result'

export interface WireSquareX24A7Step {
  phase: WireSquareX24A7PhaseLabel
  /** Passed to <WireSquareX24A7 phase={...} /> for visual highlighting. */
  squarePhase: WireSquarePhase
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface WireSquareX24A7Storyboard {
  answer: number
  steps: WireSquareX24A7Step[]
  finalIndex: number
}

export function buildWireSquareX24A7Steps(lang: Lang): WireSquareX24A7Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: WireSquareX24A7Step[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      squarePhase: 'idle',
      equation: '',
      hold: 1600,
      result: false,
      caption: t(
        'A 98 cm wire is bent into a square of side 16 cm. Find the remaining wire.',
        'Kawat 98 cm dibentuk menjadi persegi bersisi 16 cm. Temukan sisa kawat.',
      ),
    },
    // Beat 1 — perimeter
    {
      phase: 'perimeter',
      squarePhase: 'perimeter',
      equation: t('Perimeter = 4 × 16 = 64 cm', 'Keliling = 4 × 16 = 64 cm'),
      hold: 2400,
      result: false,
      caption: t(
        'A square has 4 equal sides. Perimeter = 4 × 16 = 64 cm of wire used.',
        'Persegi memiliki 4 sisi sama panjang. Keliling = 4 × 16 = 64 cm kawat digunakan.',
      ),
    },
    // Beat 2 — result
    {
      phase: 'result',
      squarePhase: 'result',
      equation: t('Remaining = 98 − 64 = 34 cm ✓', 'Sisa = 98 − 64 = 34 cm ✓'),
      hold: 0,
      result: true,
      caption: t(
        'Remaining wire = 98 − 64 = 34 cm.',
        'Sisa kawat = 98 − 64 = 34 cm.',
      ),
    },
  ]

  return { answer: REMAINING_CM, steps, finalIndex: steps.length - 1 }
}
