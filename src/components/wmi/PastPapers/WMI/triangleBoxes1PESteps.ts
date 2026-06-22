// Storyboard for IKMC-22-PE-Q1 — "Which box contains the most triangles?"
//
// Strategy: count the triangles in each box one at a time, then declare the max.
//
// Triangle counts (transcribed from scan):
//   A: 1 triangle   D: 3 triangles
//   B: 4 triangles  E: 1 triangle
//   C: 2 triangles
//
// Beats:
//   0. Goal         — look at each box, count ONLY triangles.
//   1-5. Count A–E  — tally per box; running best-so-far.
//   6. Result       — B has 4, the most → answer B.
//
// Pure builder: deterministic, SSR-safe (no random/date/state).

import { TRIANGLE_COUNTS, OPTION_LABELS } from './TriangleBoxes1PEIllustration'

export type Lang = 'en' | 'id'
export type Phase = 'goal' | 'count' | 'result'
export type TriangleBoxLabel = 'A' | 'B' | 'C' | 'D' | 'E'

export interface TriangleBoxesStep {
  phase: Phase
  /** Option being counted on a 'count' beat, else null. */
  option: TriangleBoxLabel | null
  /** Options whose triangle count has been revealed so far. */
  counted: TriangleBoxLabel[]
  /** Current best option (highest triangles seen so far, or null). */
  best: TriangleBoxLabel | null
  /** Caption shown in the caption box. */
  caption: string
  /** Hold duration in ms. */
  hold: number
  /** True only on the final result beat. */
  result: boolean
}

export interface TriangleBoxesStoryboard {
  steps: TriangleBoxesStep[]
  finalIndex: number
  answer: TriangleBoxLabel
}

export function buildTriangleBoxesSteps(lang: Lang): TriangleBoxesStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TriangleBoxesStep[] = []
  const answer: TriangleBoxLabel = 'B'

  // Beat 0 — goal
  steps.push({
    phase: 'goal',
    option: null,
    counted: [],
    best: null,
    hold: 2400,
    result: false,
    caption: t(
      'Count only the triangles in each box. Which box has the most?',
      'Hitung hanya segitiga di setiap kotak. Kotak mana yang paling banyak?',
    ),
  })

  // Beats 1-5 — count each option
  const counted: TriangleBoxLabel[] = []
  let bestLabel: TriangleBoxLabel | null = null
  let bestCount = 0

  for (const label of OPTION_LABELS) {
    const n = TRIANGLE_COUNTS[label]
    counted.push(label)
    if (n > bestCount) {
      bestCount = n
      bestLabel = label
    }

    const nWord = t(
      n === 1 ? `1 triangle` : `${n} triangles`,
      n === 1 ? `1 segitiga` : `${n} segitiga`,
    )

    steps.push({
      phase: 'count',
      option: label,
      counted: [...counted],
      best: bestLabel,
      hold: n === TRIANGLE_COUNTS[answer] ? 2600 : 1900,
      result: false,
      caption: t(
        `Box ${label}: ${nWord}.`,
        `Kotak ${label}: ${nWord}.`,
      ),
    })
  }

  // Beat 6 — result
  steps.push({
    phase: 'result',
    option: answer,
    counted: [...OPTION_LABELS],
    best: answer,
    hold: 0,
    result: true,
    caption: t(
      `Box B has 4 triangles — the most! Answer: B.`,
      `Kotak B memiliki 4 segitiga — paling banyak! Jawaban: B.`,
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer }
}
