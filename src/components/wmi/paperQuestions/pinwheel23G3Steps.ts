// WMI-23F3A-Q19 (2023 Grade 3 Final) — pinwheel of 4 identical rectangles.
//
// "The figure is made up of 4 identical rectangles. The perimeter of the whole
// figure is 48 cm and its area is 90 cm². Find the perimeter of one rectangle."
// Answer: 19.5 cm.
//
// METHOD (deduce step by step — no formula from thin air). Let one rectangle be
// L (long) × W (short). Four of them pinwheel around a square hole, so:
//   • the OUTER boundary is a square of side  L + W,
//   • the central HOLE is a square of side    L − W.
// Whole-figure perimeter = outer + hole boundaries
//   = 4(L + W) + 4(L − W).
// The +4W and −4W cancel, leaving 4L + 4L = 8L. So 8L = 48 ⇒ L = 6.
// Whole-figure area = the 4 rectangles = 4·L·W = 90 ⇒ L·W = 22.5
//   ⇒ W = 22.5 ÷ 6 = 3.75.
// One rectangle's perimeter = 2(L + W) = 2(6 + 3.75) = 2 × 9.75 = 19.5.
//
// Pure builder: (lang) => storyboard. No Math.random, no Date — SSR-safe and
// deterministic. All numbers are derived here from the two givens (48, 90); the
// figure only mirrors L/W via the illustration's showDims prop.

import type { Lang } from '../concepts/explainers/makeTenSteps'

// ---- the two givens, then everything deduced from them ---------------------
export const WHOLE_PERIMETER = 48 // cm — perimeter of the whole pinwheel figure
export const WHOLE_AREA = 90 // cm² — area of the whole figure (= 4 rectangles)
export const L = WHOLE_PERIMETER / 8 // 8L = 48 ⇒ L = 6 (long side)
export const LW = WHOLE_AREA / 4 // 4·LW = 90 ⇒ L·W = 22.5
export const W = LW / L // W = 22.5 ÷ 6 = 3.75 (short side)
export const ANSWER = 2 * (L + W) // 2(6 + 3.75) = 19.5 (one rectangle's perimeter)

/** Trim trailing zeros so 3.75 / 19.5 / 22.5 print cleanly. */
function num(n: number): string {
  return Number(n.toFixed(2)).toString()
}

/** Which dimensions/labels the figure should reveal this beat. */
export type DimPhase =
  | 'none' // plain pinwheel, no labels (goal beat)
  | 'sides' // outer L+W and hole L−W squares lit, L & W marked on a tile
  | 'long' // L = 6 confirmed
  | 'short' // W = 3.75 confirmed
  | 'rect' // one rectangle highlighted with both sides 6 and 3.75

export interface PinwheelStep {
  phase: DimPhase
  /** True only on the final winning beat (hold 0). */
  result: boolean
  caption: string
  hold: number
}

export interface PinwheelStoryboard {
  answer: number
  long: number
  short: number
  steps: PinwheelStep[]
  finalIndex: number
}

export function buildPinwheelSteps(lang: Lang): PinwheelStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PinwheelStep[] = [
    // 1 — the goal.
    {
      phase: 'none',
      result: false,
      hold: 2600,
      caption: t(
        `4 same rectangles make a pinwheel. The whole edge is ${WHOLE_PERIMETER} cm and the whole area is ${WHOLE_AREA} cm². We want ONE rectangle's perimeter.`,
        `4 persegi panjang sama membentuk kincir. Seluruh tepi ${WHOLE_PERIMETER} cm dan luas seluruhnya ${WHOLE_AREA} cm². Kita cari keliling SATU persegi panjang.`,
      ),
    },
    // 2 — name the long and short sides; light up the two squares.
    {
      phase: 'sides',
      result: false,
      hold: 3000,
      caption: t(
        'Call the long side L and the short side W. The outside is a square of side L+W, and the hole is a square of side L−W.',
        'Sebut sisi panjang L dan sisi pendek W. Bagian luar persegi sisi L+W, dan lubang persegi sisi L−W.',
      ),
    },
    // 3 — perimeter: the W's cancel, leaving 8L = 48 ⇒ L = 6.
    {
      phase: 'long',
      result: false,
      hold: 3200,
      caption: t(
        `Whole edge = 4(L+W) + 4(L−W). The +W and −W cancel: that's just 8L. So 8L = ${WHOLE_PERIMETER}, giving L = ${num(L)}.`,
        `Tepi seluruhnya = 4(L+W) + 4(L−W). +W dan −W saling hapus: tinggal 8L. Jadi 8L = ${WHOLE_PERIMETER}, sehingga L = ${num(L)}.`,
      ),
    },
    // 4 — area: 4·L·W = 90 ⇒ L·W = 22.5 ⇒ W = 3.75.
    {
      phase: 'short',
      result: false,
      hold: 3200,
      caption: t(
        `The 4 rectangles fill the area: 4·L·W = ${WHOLE_AREA}, so L·W = ${num(LW)}. With L = ${num(L)}: W = ${num(LW)} ÷ ${num(L)} = ${num(W)}.`,
        `4 persegi panjang mengisi luasnya: 4·L·W = ${WHOLE_AREA}, jadi L·W = ${num(LW)}. Dengan L = ${num(L)}: W = ${num(LW)} ÷ ${num(L)} = ${num(W)}.`,
      ),
    },
    // 5 — one rectangle's perimeter. Winner, hold 0.
    {
      phase: 'rect',
      result: true,
      hold: 0,
      caption: t(
        `One rectangle is ${num(L)} by ${num(W)}. Its perimeter = 2(${num(L)} + ${num(W)}) = 2 × ${num(L + W)} = ${num(ANSWER)} cm.`,
        `Satu persegi panjang ${num(L)} kali ${num(W)}. Kelilingnya = 2(${num(L)} + ${num(W)}) = 2 × ${num(L + W)} = ${num(ANSWER)} cm.`,
      ),
    },
  ]

  return { answer: ANSWER, long: L, short: W, steps, finalIndex: steps.length - 1 }
}
