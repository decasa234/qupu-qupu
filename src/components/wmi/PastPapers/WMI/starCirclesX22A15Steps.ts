import type { Lang } from '../../concepts/explainers/makeTenSteps'

// ── Problem constants (bound to seed quantities) ──────────────────────────────

export const TOTAL_SUM   = 28   // 1+2+3+4+5+6+7
export const LINE_TARGET = 12   // each arm of 3 must sum to 12
export const NUM_LINES   = 3    // three arms
export const LINES_SUM   = NUM_LINES * LINE_TARGET  // 36
export const CENTER_VAL  = 4    // (36 − 28) / 2 = 4  ← the answer

/**
 * One valid assignment (center = 4; others arbitrary but all lines sum to 12):
 *   Top arm:   7 + 1 + 4 = 12
 *   Left arm:  4 + 2 + 6 = 12
 *   Right arm: 4 + 3 + 5 = 12
 */
export const SOLUTION = {
  top:    7,
  upper:  1,
  center: CENTER_VAL,
  li:     2,
  lo:     6,
  ri:     3,
  ro:     5,
} as const

// ── Beat types ────────────────────────────────────────────────────────────────

export type StarCirclesPhase =
  | 'show'          // display empty star
  | 'sum-total'     // 1+2+…+7 = 28
  | 'sum-lines'     // 3×12 = 36
  | 'deduce-center' // 36−28 = 8 = 2×center → center = 4
  | 'fill-in'       // reveal full solution
  | 'result'        // confirm answer

export interface StarCirclesStep {
  phase:       StarCirclesPhase
  /** labels to show on nodes (undefined = empty circle) */
  labels?:     Partial<Record<'top'|'upper'|'center'|'li'|'lo'|'ri'|'ro', number>>
  /** fill colours for nodes */
  fills?:      Partial<Record<'top'|'upper'|'center'|'li'|'lo'|'ri'|'ro', string>>
  caption:     string
  hold:        number
  result:      boolean
}

export interface StarCirclesStoryboard {
  steps:      StarCirclesStep[]
  finalIndex: number
}

// ── Builder ───────────────────────────────────────────────────────────────────

export function buildStarCirclesX22A15Steps(lang: Lang): StarCirclesStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const AMBER  = '#FDE68A'  // highlight colour for center
  const GREEN  = '#D1FAE5'  // solution colour

  const steps: StarCirclesStep[] = [
    {
      phase: 'show',
      hold: 1800,
      result: false,
      caption: t(
        `Place numbers 1–7 (each once) so every arm of 3 circles sums to ${LINE_TARGET}.`,
        `Letakkan bilangan 1–7 (masing-masing sekali) agar setiap lengan 3 lingkaran berjumlah ${LINE_TARGET}.`,
      ),
    },
    {
      phase: 'sum-total',
      hold: 2000,
      result: false,
      caption: t(
        `First: 1+2+3+4+5+6+7 = ${TOTAL_SUM}.`,
        `Pertama: 1+2+3+4+5+6+7 = ${TOTAL_SUM}.`,
      ),
    },
    {
      phase: 'sum-lines',
      hold: 2000,
      result: false,
      caption: t(
        `There are ${NUM_LINES} arms, each summing to ${LINE_TARGET}, so adding all arm-totals gives ${NUM_LINES}×${LINE_TARGET} = ${LINES_SUM}.`,
        `Ada ${NUM_LINES} lengan, masing-masing berjumlah ${LINE_TARGET}, sehingga total semua lengan = ${NUM_LINES}×${LINE_TARGET} = ${LINES_SUM}.`,
      ),
    },
    {
      phase: 'deduce-center',
      fills: { center: AMBER },
      hold: 2400,
      result: false,
      caption: t(
        `The center circle is counted in all ${NUM_LINES} arms; every other circle is counted once. So ${LINES_SUM} = ${TOTAL_SUM} + 2×center  →  center = (${LINES_SUM}−${TOTAL_SUM})÷2 = ${CENTER_VAL}.`,
        `Lingkaran tengah dihitung di ke-${NUM_LINES} lengan; lingkaran lain dihitung sekali. Jadi ${LINES_SUM} = ${TOTAL_SUM} + 2×tengah  →  tengah = (${LINES_SUM}−${TOTAL_SUM})÷2 = ${CENTER_VAL}.`,
      ),
    },
    {
      phase: 'fill-in',
      labels: SOLUTION,
      fills: { center: AMBER },
      hold: 2200,
      result: false,
      caption: t(
        `One valid fill: top-arm ${SOLUTION.top}+${SOLUTION.upper}+${CENTER_VAL}=${LINE_TARGET} ✓, left-arm ${CENTER_VAL}+${SOLUTION.li}+${SOLUTION.lo}=${LINE_TARGET} ✓, right-arm ${CENTER_VAL}+${SOLUTION.ri}+${SOLUTION.ro}=${LINE_TARGET} ✓.`,
        `Pengisian yang valid: lengan atas ${SOLUTION.top}+${SOLUTION.upper}+${CENTER_VAL}=${LINE_TARGET} ✓, lengan kiri ${CENTER_VAL}+${SOLUTION.li}+${SOLUTION.lo}=${LINE_TARGET} ✓, lengan kanan ${CENTER_VAL}+${SOLUTION.ri}+${SOLUTION.ro}=${LINE_TARGET} ✓.`,
      ),
    },
    {
      phase: 'result',
      labels: SOLUTION,
      fills: {
        top: GREEN, upper: GREEN, center: GREEN,
        li: GREEN, lo: GREEN, ri: GREEN, ro: GREEN,
      },
      hold: 0,
      result: true,
      caption: t(
        `The number in the middle circle is ${CENTER_VAL}.`,
        `Bilangan di lingkaran tengah adalah ${CENTER_VAL}.`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
