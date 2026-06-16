// WMI-20P2A-Q6 (2020 Grade 2 Semifinal) — storyboard for the "build the solid
// from the pieces" animation.
//
// The pieces are THREE matched PAIRS of rectangles. A rectangular box has 6
// faces, and opposite faces are congruent — so a box always needs exactly 3
// pairs of equal rectangles. These three pairs assemble into a cuboid; that is
// option B.
//
// THE TRAP: pick a cube. A cube is the "obvious" box, but a cube's faces are
// all the SAME square, so it needs 3 pairs of EQUAL squares — our pairs are
// three DIFFERENT rectangles, so they make a (non-cube) cuboid, not a cube.
//
// Teaching walk, one idea per beat:
//   1. count   — there are 3 matched pairs of rectangles (6 cards in all).
//   2. faces   — a box has 6 faces; opposite faces are equal → 3 pairs. Match!
//   3. long    — the long pair becomes the front + back.
//   4. wide    — the wide pair becomes the top + bottom.
//   5. end     — the small pair becomes the two ends → the box is closed.
//   6. result  — these 3 pairs build that cuboid → option B.
//
// Pure builder: (lang) => storyboard. No random, no dates, SSR-safe.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { PiecePairId, Cuboid20Props } from './P20G2Q6Illustration'

export type BoxPhase = 'count' | 'faces' | 'long' | 'wide' | 'end' | 'result'

export interface BoxStep {
  phase: BoxPhase
  /** Highlight a loose pair in the pieces view; undefined = none. */
  highlightId?: PiecePairId
  /** Show the assembled cuboid (true) or the loose pieces (false). */
  showBox: boolean
  /** Which cuboid face pair to light up. */
  litPair: NonNullable<Cuboid20Props['litPair']>
  caption: string
  hold: number
  result: boolean
}

export interface BoxStoryboard {
  answerLabel: string
  steps: BoxStep[]
  finalIndex: number
}

export function buildP20G2Q6Steps(lang: Lang, answerLabel: string): BoxStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BoxStep[] = [
    {
      phase: 'count',
      highlightId: undefined,
      showBox: false,
      litPair: 'none',
      hold: 2000,
      result: false,
      caption: t(
        'The pieces are 3 matched pairs of rectangles — 6 cards in all.',
        'Potongannya adalah 3 pasang persegi panjang yang sama — 6 kartu seluruhnya.',
      ),
    },
    {
      phase: 'faces',
      highlightId: undefined,
      showBox: true,
      litPair: 'none',
      hold: 2200,
      result: false,
      caption: t(
        'A box has 6 faces; opposite faces are equal → exactly 3 pairs. It fits!',
        'Kotak punya 6 sisi; sisi berhadapan sama → tepat 3 pasang. Cocok!',
      ),
    },
    {
      phase: 'long',
      highlightId: 'long',
      showBox: true,
      litPair: 'long',
      hold: 1900,
      result: false,
      caption: t('The long pair becomes the front and back.', 'Pasangan panjang menjadi sisi depan dan belakang.'),
    },
    {
      phase: 'wide',
      highlightId: 'wide',
      showBox: true,
      litPair: 'wide',
      hold: 1900,
      result: false,
      caption: t('The wide pair becomes the top and bottom.', 'Pasangan lebar menjadi sisi atas dan bawah.'),
    },
    {
      phase: 'end',
      highlightId: 'end',
      showBox: true,
      litPair: 'end',
      hold: 1900,
      result: false,
      caption: t('The small pair caps the two ends — the box is closed.', 'Pasangan kecil menutup kedua ujung — kotak tertutup.'),
    },
    {
      phase: 'result',
      highlightId: undefined,
      showBox: true,
      litPair: 'none',
      hold: 0,
      result: true,
      caption: t(
        `All 3 pairs build this box (not a cube) → option ${answerLabel}.`,
        `Ketiga pasangan membentuk kotak ini (bukan kubus) → pilihan ${answerLabel}.`,
      ),
    },
  ]

  return { answerLabel, steps, finalIndex: steps.length - 1 }
}
