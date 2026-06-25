// midpointShadedX22B13Steps — SEAMO-X 2022 Paper B Q13
//
// ABCD square (area 50 cm²). E, F, G, H are midpoints of the sides.
// Lines from each corner to the non-adjacent midpoint form an inner shaded square.
// Find the area of the shaded square.
//
// METHOD (beat by beat):
//   1. Identify midpoints E, F, G, H on ABCD.
//      State: ABCD = 50 cm².
//   2. Draw lines A→H, B→E, C→F, D→G from each corner to the non-adjacent midpoint.
//   3. The 4 lines form an inner square. By geometry, its area = 1/5 of the outer square.
//      Area of inner square = 50 ÷ 5 = 10 cm².
//
// SSR-safe — no hooks, no framer-motion.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

// ── Given / answer ──────────────────────────────────────────────────────────
export const OUTER_AREA  = 50   // cm²
export const INNER_AREA  = 10   // cm²

// ── Step shape ──────────────────────────────────────────────────────────────
export interface MidpointShadedX22B13Step {
  /** Show the 4 diagonal construction lines. */
  showLines: boolean
  /** Fill the shaded inner square. */
  showShading: boolean
  /** Show "10 cm²" label at the inner square centre. */
  showAnswer: boolean
  /** Arithmetic expression displayed below the figure (null = hidden). */
  math: string | null
  /** Whether this is the result beat (green styling). */
  result: boolean
  /** Caption shown below the math line. */
  caption: string
  /** Hold duration in ms before auto-advancing (0 = final / paused). */
  hold: number
}

export interface MidpointShadedX22B13Storyboard {
  answer: number
  steps: MidpointShadedX22B13Step[]
  finalIndex: number
}

// ── Builder ─────────────────────────────────────────────────────────────────
export function buildMidpointShadedX22B13Steps(lang: Lang): MidpointShadedX22B13Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: MidpointShadedX22B13Step[] = [
    // Beat 0 — show the square and identify midpoints
    {
      showLines:   false,
      showShading: false,
      showAnswer:  false,
      math: t(`Area(ABCD) = ${OUTER_AREA} cm²`, `Luas(ABCD) = ${OUTER_AREA} cm²`),
      result: false,
      hold: 2400,
      caption: t(
        `ABCD is a square with area 50 cm². E, F, G, H are the midpoints of the four sides.`,
        `ABCD adalah persegi dengan luas 50 cm². E, F, G, H adalah titik tengah keempat sisinya.`,
      ),
    },
    // Beat 1 — draw the 4 construction lines
    {
      showLines:   true,
      showShading: false,
      showAnswer:  false,
      math: t(`Draw A→H, B→E, C→F, D→G`, `Gambar A→H, B→E, C→F, D→G`),
      result: false,
      hold: 2600,
      caption: t(
        `Connect each corner to the midpoint of the non-adjacent side. The 4 lines intersect, forming an inner square.`,
        `Hubungkan setiap sudut ke titik tengah sisi yang tidak berdekatan. 4 garis berpotongan membentuk persegi dalam.`,
      ),
    },
    // Beat 2 — shade the inner square
    {
      showLines:   true,
      showShading: true,
      showAnswer:  false,
      math: t(`Area(shaded) = 1/5 × 50`, `Luas(arsiran) = 1/5 × 50`),
      result: false,
      hold: 2400,
      caption: t(
        `By the midpoint construction, the shaded inner square has area = 1/5 of ABCD.`,
        `Berdasarkan konstruksi titik tengah, persegi arsiran dalam memiliki luas = 1/5 dari ABCD.`,
      ),
    },
    // Beat 3 (final) — reveal the answer
    {
      showLines:   true,
      showShading: true,
      showAnswer:  true,
      math: t(`50 ÷ 5 = ${INNER_AREA} cm²`, `50 ÷ 5 = ${INNER_AREA} cm²`),
      result: true,
      hold: 0,
      caption: t(
        `Area of the shaded square = 50 ÷ 5 = 10 cm².`,
        `Luas persegi yang diarsir = 50 ÷ 5 = 10 cm².`,
      ),
    },
  ]

  return { answer: INNER_AREA, steps, finalIndex: steps.length - 1 }
}
