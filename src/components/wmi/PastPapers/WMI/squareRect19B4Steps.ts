// squareRect19B4Steps — SEAMO-19-B-Q4
//
// Square ABCD (side 6 cm) contains a tilted rectangle EFGH with vertices on
// the square's sides: FB = 4 cm (given).
//
// METHOD (beat by beat, concrete arithmetic shown every step):
//   1. FB = 4, FB = 2·AF  →  AF = 2  →  side of ABCD = 6 cm.
//   2. Place A=(0,6) B=(6,6) C=(6,0) D=(0,0).
//      E=(0,4)  F=(2,6)  G=(6,2)  H=(4,0).
//   3. Shoelace formula: ½|…| = 16 cm².
//   4. Answer = 16 → choice D.
//
// Builds a pure storyboard; no framer-motion, no Date, SSR-safe.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

// ---- given -------------------------------------------------------------------
export const FB = 4                    // cm — printed on figure
export const AF = FB / 2               // 2 cm  (FB = 2·AF)
export const SIDE = AF + FB            // 6 cm — square side

// ---- coordinates (math system: D at origin, y up) ---------------------------
// A=(0,6) B=(6,6) C=(6,0) D=(0,0)
// AE = AF = 2  →  E=(0, 6−2) = (0,4)   on left side A→D
// AF = 2       →  F=(2, 6)              on top side A→B
// BG = 2·GC, BG + GC = 6 → BG=4, GC=2 → G=(6, 6−4)=(6,2) on right side B→C
// DH = 2·HC, DH + HC = 6 → DH=4, HC=2 → H=(4, 0)         on bottom side D→C
export const E = [0, 4] as [number, number]
export const F = [2, 6] as [number, number]
export const G = [6, 2] as [number, number]
export const Hv = [4, 0] as [number, number]   // H vertex (avoid shadowing built-in)

// ---- shoelace ----------------------------------------------------------------
// ½|x_E(y_F − y_H) + x_F(y_G − y_E) + x_G(y_H − y_F) + x_H(y_E − y_G)|
// = ½|0·(6−0) + 2·(2−4) + 6·(0−6) + 4·(4−2)|
// = ½|0 − 4 − 36 + 8| = ½·32 = 16
export const SHOELACE_SUM = (
  E[0] * (F[1] - Hv[1]) +
  F[0] * (G[1] - E[1]) +
  G[0] * (Hv[1] - F[1]) +
  Hv[0] * (E[1] - G[1])
)  // = −32 (negative due to orientation)
export const AREA = Math.abs(SHOELACE_SUM) / 2  // 16
export const ANSWER_CHOICE = 'D'

/** One animation beat. */
export interface SquareRect19B4Step {
  showCoords: boolean
  showArea: boolean
  math: string | null
  result: boolean
  caption: string
  hold: number   // ms; 0 on the final beat (linger)
}

export interface SquareRect19B4Storyboard {
  answer: number
  answerChoice: string
  steps: SquareRect19B4Step[]
  finalIndex: number
}

export function buildSquareRect19B4Steps(lang: Lang): SquareRect19B4Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SquareRect19B4Step[] = [
    // 1 — find the square's side from the given ratio
    {
      showCoords: false,
      showArea: false,
      math: `FB = 2 × AF  →  AF = ${AF},  side = ${AF} + ${FB} = ${SIDE} cm`,
      result: false,
      hold: 2600,
      caption: t(
        `FB = ${FB} cm and FB = 2·AF, so AF = ${AF} cm. The square's side is ${AF} + ${FB} = ${SIDE} cm.`,
        `FB = ${FB} cm dan FB = 2·AF, jadi AF = ${AF} cm. Sisi persegi = ${AF} + ${FB} = ${SIDE} cm.`,
      ),
    },
    // 2 — place coordinates and find all four vertices
    {
      showCoords: true,
      showArea: false,
      math: `E=(0,4)  F=(2,6)  G=(6,2)  H=(4,0)`,
      result: false,
      hold: 2900,
      caption: t(
        `Set A=(0,6) B=(6,6) C=(6,0) D=(0,0). Then: E=(0,4), F=(2,6), G=(6,2), H=(4,0).`,
        `Tetapkan A=(0,6) B=(6,6) C=(6,0) D=(0,0). Maka: E=(0,4), F=(2,6), G=(6,2), H=(4,0).`,
      ),
    },
    // 3 — apply the shoelace formula
    {
      showCoords: true,
      showArea: false,
      math: `½|0·(6−0) + 2·(2−4) + 6·(0−6) + 4·(4−2)| = ½|0 − 4 − 36 + 8| = ½·32`,
      result: false,
      hold: 3200,
      caption: t(
        `Use the shoelace formula: ½|x_E(y_F−y_H) + x_F(y_G−y_E) + x_G(y_H−y_F) + x_H(y_E−y_G)|.`,
        `Gunakan rumus tali sepatu: ½|x_E(y_F−y_H) + x_F(y_G−y_E) + x_G(y_H−y_F) + x_H(y_E−y_G)|.`,
      ),
    },
    // 4 — land on the answer
    {
      showCoords: true,
      showArea: true,
      math: `${AREA} cm²`,
      result: true,
      hold: 0,
      caption: t(
        `Area of EFGH = ${AREA} cm² → choice ${ANSWER_CHOICE}.`,
        `Luas EFGH = ${AREA} cm² → pilihan ${ANSWER_CHOICE}.`,
      ),
    },
  ]

  return { answer: AREA, answerChoice: ANSWER_CHOICE, steps, finalIndex: steps.length - 1 }
}
