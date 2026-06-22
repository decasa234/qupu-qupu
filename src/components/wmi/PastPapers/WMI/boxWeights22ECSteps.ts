// IKMC-21-EC-Q22 — "Which boxes contain apples?"
// Box 1: 7 kg · Box 2: 5 kg · Box 3: 6 kg · Box 4: 2 kg · Box 5: 16 kg
// Total = 36 kg. banana = 3 × apple → 4 × apple = 36 → apple = 9 kg.
// The only pair that sums to 9: Box 1 (7) + Box 4 (2) = 9. Answer: E (1 and 4).
//
// Beat story (one idea per beat — no answer revealed in step 0):
//   0. goal      — show the five crates, nothing highlighted.
//   1. total     — add all weights: 7+5+6+2+16 = 36 kg.
//   2. ratio     — bananas = 3 × apples, so 4 × apples = 36, apples = 9 kg.
//   3. tryA      — test boxes 1+2: 7+5=12 ≠ 9 ✗   (lit: 0,1)
//   4. tryB      — test boxes 2+3: 5+6=11 ≠ 9 ✗   (lit: 1,2)
//   5. tryC      — test boxes 2+4: 5+2=7  ≠ 9 ✗   (lit: 1,3)
//   6. tryD      — test boxes 3+4: 6+2=8  ≠ 9 ✗   (lit: 2,3)
//   7. tryE      — test boxes 1+4: 7+2=9  ✓        (lit: 0,3)
//   8. result    — confirmed: 27=3×9 ✓ → answer E  (lit: 0,3)

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type BoxPhase =
  | 'goal'
  | 'total'
  | 'ratio'
  | 'tryA'
  | 'tryB'
  | 'tryC'
  | 'tryD'
  | 'tryE'
  | 'result'

export interface BoxStep {
  phase: BoxPhase
  /** 0-based crate indices to highlight this beat. */
  litBoxes: number[]
  /** The running total shown (e.g. "7+5+6+2+16 = 36"), or null. */
  totalLine: string | null
  /** The ratio/apple-share line shown, or null. */
  ratioLine: string | null
  /** The candidate test line (e.g. "7+2 = 9 ✓"), or null. */
  testLine: string | null
  /** Whether this test beat is the correct pair (green). */
  testOk: boolean
  /** Whether this is the final confirmed-answer beat. */
  result: boolean
  caption: string
  hold: number
}

export interface BoxStoryboard {
  steps: BoxStep[]
  finalIndex: number
}

export const BOX_WEIGHTS = [7, 5, 6, 2, 16] as const
export const TOTAL_WEIGHT = BOX_WEIGHTS.reduce((a, b) => a + b, 0) // 36
export const APPLE_WEIGHT = TOTAL_WEIGHT / 4                        // 9
export const BANANA_WEIGHT = TOTAL_WEIGHT - APPLE_WEIGHT            // 27

// 0-based indices of the correct apple boxes (Box 1 = 0, Box 4 = 3).
export const APPLE_BOXES: number[] = [0, 3]

export function buildBoxWeights22ECSteps(lang: Lang): BoxStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BoxStep[] = []

  // ── beat 0: goal ────────────────────────────────────────────────────────────
  steps.push({
    phase: 'goal',
    litBoxes: [],
    totalLine: null,
    ratioLine: null,
    testLine: null,
    testOk: false,
    result: false,
    hold: 2000,
    caption: t(
      '5 boxes — each holds apples OR bananas. Bananas weigh 3× as much as apples.',
      '5 kotak — masing-masing berisi apel ATAU pisang. Pisang 3× lebih berat dari apel.',
    ),
  })

  // ── beat 1: sum all weights ─────────────────────────────────────────────────
  steps.push({
    phase: 'total',
    litBoxes: [0, 1, 2, 3, 4],
    totalLine: t(
      `7 + 5 + 6 + 2 + 16 = ${TOTAL_WEIGHT} kg`,
      `7 + 5 + 6 + 2 + 16 = ${TOTAL_WEIGHT} kg`,
    ),
    ratioLine: null,
    testLine: null,
    testOk: false,
    result: false,
    hold: 2200,
    caption: t(
      `Total weight of all boxes: ${TOTAL_WEIGHT} kg`,
      `Total berat semua kotak: ${TOTAL_WEIGHT} kg`,
    ),
  })

  // ── beat 2: apply the ratio to find apple weight ────────────────────────────
  steps.push({
    phase: 'ratio',
    litBoxes: [],
    totalLine: t(
      `Total = ${TOTAL_WEIGHT} kg`,
      `Total = ${TOTAL_WEIGHT} kg`,
    ),
    ratioLine: t(
      `banana = 3 × apple → 4 × apple = ${TOTAL_WEIGHT} → apple = ${APPLE_WEIGHT} kg`,
      `pisang = 3 × apel → 4 × apel = ${TOTAL_WEIGHT} → apel = ${APPLE_WEIGHT} kg`,
    ),
    testLine: null,
    testOk: false,
    result: false,
    hold: 2600,
    caption: t(
      `Apple boxes must total ${APPLE_WEIGHT} kg. Which pairs sum to ${APPLE_WEIGHT}?`,
      `Kotak apel harus berjumlah ${APPLE_WEIGHT} kg. Pasangan mana yang berjumlah ${APPLE_WEIGHT}?`,
    ),
  })

  // ── beats 3–7: test each answer choice ─────────────────────────────────────
  type AnswerDef = {
    phase: BoxPhase
    boxes: number[]
    sum: number
    label: string
  }

  const candidates: AnswerDef[] = [
    { phase: 'tryA', boxes: [0, 1], sum: 7 + 5,  label: '1 & 2' },
    { phase: 'tryB', boxes: [1, 2], sum: 5 + 6,  label: '2 & 3' },
    { phase: 'tryC', boxes: [1, 3], sum: 5 + 2,  label: '2 & 4' },
    { phase: 'tryD', boxes: [2, 3], sum: 6 + 2,  label: '3 & 4' },
    { phase: 'tryE', boxes: [0, 3], sum: 7 + 2,  label: '1 & 4' },
  ]

  for (const { phase, boxes, sum, label } of candidates) {
    const ok = sum === APPLE_WEIGHT
    const w0 = BOX_WEIGHTS[boxes[0]]
    const w1 = BOX_WEIGHTS[boxes[1]]
    steps.push({
      phase,
      litBoxes: boxes,
      totalLine: null,
      ratioLine: null,
      testLine: t(
        `Box ${label.replace(' & ', ' + Box ')}: ${w0} + ${w1} = ${sum} kg${ok ? ' ✓' : ' ✗'}`,
        `Kotak ${label.replace(' & ', ' + Kotak ')}: ${w0} + ${w1} = ${sum} kg${ok ? ' ✓' : ' ✗'}`,
      ),
      testOk: ok,
      result: false,
      hold: ok ? 2400 : 1800,
      caption: ok
        ? t(
            `${w0} + ${w1} = ${sum} kg ✓ — banana = ${BANANA_WEIGHT} = 3 × ${APPLE_WEIGHT} ✓`,
            `${w0} + ${w1} = ${sum} kg ✓ — pisang = ${BANANA_WEIGHT} = 3 × ${APPLE_WEIGHT} ✓`,
          )
        : t(
            `${w0} + ${w1} = ${sum} ≠ ${APPLE_WEIGHT} kg ✗`,
            `${w0} + ${w1} = ${sum} ≠ ${APPLE_WEIGHT} kg ✗`,
          ),
    })
  }

  // ── beat 8: result ──────────────────────────────────────────────────────────
  steps.push({
    phase: 'result',
    litBoxes: APPLE_BOXES,
    totalLine: null,
    ratioLine: null,
    testLine: null,
    testOk: true,
    result: true,
    hold: 0,
    caption: t(
      `Boxes 1 and 4 contain apples (7 + 2 = 9 kg). Answer: E`,
      `Kotak 1 dan 4 berisi apel (7 + 2 = 9 kg). Jawaban: E`,
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
