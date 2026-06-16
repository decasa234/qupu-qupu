// WMI-23F3A-Q4 (2023 Grade 3 Final) — two identical rectangles overlap in a
// square; find the perimeter of the whole figure. Answer: E = 312.
//
// METHOD (deduced beat by beat, concrete arithmetic on every step — no formula
// dropped from the sky):
//   1. GOAL — trace the outline once; we want its total length.
//   2. ONE rectangle is 56 × 42 (the two edges meeting at the left corner).
//      Its perimeter = 2·(56 + 42) = 2·98 = 196.
//   3. The overlap is a SQUARE. The printed 36 is the part of a 56-long side
//      sticking out past the overlap, so the square's side = 56 − 36 = 20.
//   4. TWO rectangles together = 2 × 196 = 392 of edge — but that double-counts
//      the hidden bits where they overlap.
//   5. Overlapping in the 20×20 square HIDES 4 square-sides from the outline:
//      4 × 20 = 80. So P = 392 − 80 = 312.
//   6. Conclude: perimeter = 312 → choice E.
//
// Pure builder: (lang) => storyboard. No Math.random, no Date — SSR-safe and
// deterministic. The figure dims (56/42/36) and the answer are the printed
// givens; everything else (square side 20, 196, 392, 80, 312) is derived in
// view, so the animation shows the work.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

// ---- printed givens (from the static figure) -------------------------------
export const LONG = 56 // long side of each rectangle
export const SHORT = 42 // short side of each rectangle
export const STICKOUT = 36 // visible part of a long side past the overlap

// ---- derived quantities (shown step by step, never asserted up front) ------
export const ONE_PERIMETER = 2 * (LONG + SHORT) // 196 — one rectangle's perimeter
export const SQUARE_SIDE = LONG - STICKOUT // 20 — overlap square's side
export const TWO_PERIMETER = 2 * ONE_PERIMETER // 392 — both rectangles' edge
export const HIDDEN = 4 * SQUARE_SIDE // 80 — square-sides swallowed by the overlap
export const ANSWER = TWO_PERIMETER - HIDDEN // 312 — figure's perimeter
export const ANSWER_CHOICE = 'E'

/** One beat of the storyboard. */
export interface OverlapStep {
  /** Reveal/shade the central overlap square in the figure. */
  showSquare: boolean
  /** Surface the derived 20 and edge labels in the figure. */
  showDims: boolean
  /** The concrete arithmetic line for this beat (already evaluated), or null. */
  math: string | null
  /** True only on the final winning beat (it holds). */
  result: boolean
  caption: string
  /** Hold time in ms; 0 on the final beat so it lingers. */
  hold: number
}

export interface OverlapStoryboard {
  answer: number
  answerChoice: string
  steps: OverlapStep[]
  finalIndex: number
}

export function buildOverlapRectsSteps(lang: Lang): OverlapStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: OverlapStep[] = [
    // 1 — goal: trace the outline.
    {
      showSquare: false,
      showDims: false,
      math: null,
      result: false,
      hold: 2400,
      caption: t(
        'Two identical rectangles overlap. We want the length all the way around the outside.',
        'Dua persegi panjang identik bertumpang tindih. Kita mau panjang keliling tepi luarnya.',
      ),
    },
    // 2 — one rectangle is 56 × 42; its perimeter is 2·(56+42) = 196.
    {
      showSquare: false,
      showDims: false,
      math: `2 × (${LONG} + ${SHORT}) = 2 × ${LONG + SHORT} = ${ONE_PERIMETER}`,
      result: false,
      hold: 2700,
      caption: t(
        `Each rectangle is ${LONG} long and ${SHORT} wide. One rectangle's perimeter is ${ONE_PERIMETER}.`,
        `Tiap persegi panjang ${LONG} panjang dan ${SHORT} lebar. Keliling satu persegi panjang ${ONE_PERIMETER}.`,
      ),
    },
    // 3 — the overlap is a square; its side = 56 − 36 = 20.
    {
      showSquare: true,
      showDims: true,
      math: `${LONG} − ${STICKOUT} = ${SQUARE_SIDE}`,
      result: false,
      hold: 2700,
      caption: t(
        `The overlap is a square. The ${STICKOUT} sticks out past it on a ${LONG}-side, so the square's side is ${SQUARE_SIDE}.`,
        `Bagian tumpang tindih berbentuk persegi. Sisa ${STICKOUT} menonjol di sisi ${LONG}, jadi sisi persegi ${SQUARE_SIDE}.`,
      ),
    },
    // 4 — two rectangles together = 2 × 196 = 392 of edge.
    {
      showSquare: true,
      showDims: false,
      math: `2 × ${ONE_PERIMETER} = ${TWO_PERIMETER}`,
      result: false,
      hold: 2600,
      caption: t(
        `Two rectangles have ${TWO_PERIMETER} of edge in total — but overlapping hides some of it.`,
        `Dua persegi panjang punya total tepi ${TWO_PERIMETER} — tapi tumpang tindih menyembunyikan sebagian.`,
      ),
    },
    // 5 — overlapping hides 4 square-sides: 4 × 20 = 80, so 392 − 80 = 312.
    {
      showSquare: true,
      showDims: true,
      math: `${TWO_PERIMETER} − 4 × ${SQUARE_SIDE} = ${TWO_PERIMETER} − ${HIDDEN} = ${ANSWER}`,
      result: false,
      hold: 2900,
      caption: t(
        `Sitting in the ${SQUARE_SIDE}×${SQUARE_SIDE} square buries 4 sides (4 × ${SQUARE_SIDE} = ${HIDDEN}). Take them off: ${TWO_PERIMETER} − ${HIDDEN} = ${ANSWER}.`,
        `Persegi ${SQUARE_SIDE}×${SQUARE_SIDE} menyembunyikan 4 sisi (4 × ${SQUARE_SIDE} = ${HIDDEN}). Kurangi: ${TWO_PERIMETER} − ${HIDDEN} = ${ANSWER}.`,
      ),
    },
    // 6 — land on the answer.
    {
      showSquare: true,
      showDims: true,
      math: `${ANSWER}`,
      result: true,
      hold: 0,
      caption: t(
        `The perimeter of the figure is ${ANSWER} → choice ${ANSWER_CHOICE}.`,
        `Keliling bangun ini ${ANSWER} → pilihan ${ANSWER_CHOICE}.`,
      ),
    },
  ]

  return { answer: ANSWER, answerChoice: ANSWER_CHOICE, steps, finalIndex: steps.length - 1 }
}
