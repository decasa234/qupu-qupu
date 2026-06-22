/**
 * bookcase20PESteps.ts — IKMC-21-PE-Q20
 *
 * "Stan has five toys. On which shelf can the puzzle NOT be placed?"
 * Answer: C (shelf 3).
 *
 * Strategy: try both valid positions for ball (2 or 3), show that in every
 * case shelf 3 is already taken by ball or game, so puzzle can never land there.
 *
 * Each beat carries:
 *   - `placements`: which toy goes on which shelf (1-based, visible in this beat).
 *   - `highlight`: shelf number to highlight (orange ring) or null.
 *   - `caption`: explanation text.
 *   - `result`: true on the final "answer" beat.
 *   - `hold`: ms to pause before auto-advancing.
 */

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { ToyName } from './Bookcase20PEIllustration'

export type ShelfPlacement = { shelf: number; toy: ToyName }

export interface BookcaseStep {
  placements: ShelfPlacement[]
  /** Shelf to highlight with an orange ring (null = none). */
  highlight: number | null
  /** True when the shelf is to be shown crossed-out / blocked (shelf 3). */
  blocked: number | null
  caption: string
  result: boolean
  hold: number
}

export interface BookcaseStoryboard {
  steps: BookcaseStep[]
  finalIndex: number
  /** The shelf that blocks the puzzle (answer C = shelf 3). */
  blockedShelf: number
}

export const BLOCKED_SHELF = 3  // answer C

export function buildBookcase20PESteps(lang: Lang): BookcaseStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BookcaseStep[] = []

  // Beat 0 — label shelves, introduce constraints.
  steps.push({
    placements: [],
    highlight: null,
    blocked: null,
    result: false,
    hold: 2400,
    caption: t(
      'Shelves 1 (bottom) to 5 (top). Rules: blocks < ball, ball < car, game is directly above ball.',
      'Rak 1 (bawah) sampai 5 (atas). Aturan: balok < bola, bola < mobil, permainan tepat di atas bola.',
    ),
  })

  // Beat 1 — try ball on shelf 3.
  steps.push({
    placements: [{ shelf: 3, toy: 'ball' }],
    highlight: 3,
    blocked: null,
    result: false,
    hold: 2400,
    caption: t(
      'Try: ball on shelf 3. Game must be directly above → shelf 4.',
      'Coba: bola di rak 3. Permainan harus tepat di atas → rak 4.',
    ),
  })

  // Beat 2 — add game on shelf 4.
  steps.push({
    placements: [
      { shelf: 3, toy: 'ball' },
      { shelf: 4, toy: 'game' },
    ],
    highlight: 4,
    blocked: null,
    result: false,
    hold: 2400,
    caption: t(
      'Game → shelf 4. Car must be above ball (shelf 3) → only shelf 5 is free.',
      'Permainan → rak 4. Mobil harus di atas bola (rak 3) → hanya rak 5 yang tersisa.',
    ),
  })

  // Beat 3 — add car on shelf 5, blocks on shelf 1 or 2.
  steps.push({
    placements: [
      { shelf: 3, toy: 'ball' },
      { shelf: 4, toy: 'game' },
      { shelf: 5, toy: 'car' },
      { shelf: 1, toy: 'blocks' },
    ],
    highlight: null,
    blocked: null,
    result: false,
    hold: 2400,
    caption: t(
      'Car → shelf 5. Blocks below ball → shelf 1 or 2. Puzzle gets the remaining one (1 or 2). Shelf 3 is taken!',
      'Mobil → rak 5. Balok di bawah bola → rak 1 atau 2. Puzzle di rak yang tersisa (1 atau 2). Rak 3 sudah terisi!',
    ),
  })

  // Beat 4 — try ball on shelf 2.
  steps.push({
    placements: [{ shelf: 2, toy: 'ball' }],
    highlight: 2,
    blocked: null,
    result: false,
    hold: 2400,
    caption: t(
      'Now try: ball on shelf 2. Game directly above → shelf 3.',
      'Sekarang coba: bola di rak 2. Permainan tepat di atas → rak 3.',
    ),
  })

  // Beat 5 — add game on shelf 3.
  steps.push({
    placements: [
      { shelf: 2, toy: 'ball' },
      { shelf: 3, toy: 'game' },
    ],
    highlight: 3,
    blocked: null,
    result: false,
    hold: 2400,
    caption: t(
      "Game → shelf 3 (again!). Car above ball → shelf 4 or 5. Blocks below ball → shelf 1. Puzzle takes the car's spare shelf. Shelf 3 is still taken!",
      'Permainan → rak 3 (lagi!). Mobil di atas bola → rak 4 atau 5. Balok di bawah bola → rak 1. Puzzle di sisa rak mobil. Rak 3 tetap terisi!',
    ),
  })

  // Beat 6 — show shelf 3 is always blocked → answer.
  steps.push({
    placements: [
      { shelf: 2, toy: 'ball' },
      { shelf: 3, toy: 'game' },
    ],
    highlight: null,
    blocked: BLOCKED_SHELF,
    result: true,
    hold: 0,
    caption: t(
      'In every valid arrangement shelf 3 is always taken (by ball or game). The puzzle can NEVER be on shelf 3. Answer: C.',
      'Dalam setiap susunan valid, rak 3 selalu terisi (bola atau permainan). Puzzle TIDAK BISA di rak 3. Jawaban: C.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, blockedShelf: BLOCKED_SHELF }
}
