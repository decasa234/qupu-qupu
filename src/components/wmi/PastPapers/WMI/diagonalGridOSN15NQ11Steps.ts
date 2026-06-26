import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type DiagonalGridPhase = 'setup' | 'countPoints' | 'formula' | 'apply' | 'result'

export interface DiagonalGridStep {
  phase: DiagonalGridPhase
  highlightX: boolean
  showAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface DiagonalGridStoryboard {
  steps: DiagonalGridStep[]
  finalIndex: number
}

// Constants bound to seed quantities
export const SMALL_COLS   = 8
export const SMALL_ROWS   = 6
export const SMALL_GCD    = 2     // GCD(8,6)
export const SMALL_POINTS = 3     // GCD+1

export const BIG_COLS     = 48
export const BIG_ROWS     = 36
export const BIG_GCD      = 12    // GCD(48,36)
export const BIG_POINTS   = 13    // GCD+1 — the answer

/**
 * Beat-by-beat storyboard for OSN-15-SD-NAS-Q11:
 *  1. Show the 8×6 grid with diagonal A→C.
 *  2. Highlight midpoint X — count 3 lattice points.
 *  3. Derive the GCD formula and verify on 8×6.
 *  4. Apply GCD(48,36)=12 → 13 points.
 *  5. Result.
 */
export function buildDiagonalGridOSN15NQ11Steps(lang: Lang): DiagonalGridStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: DiagonalGridStep[] = [
    {
      phase: 'setup',
      highlightX: false,
      showAnswer: false,
      hold: 1800,
      result: false,
      caption: t(
        `Rectangle ABCD is ${SMALL_COLS}×${SMALL_ROWS} — ${SMALL_COLS * SMALL_ROWS} unit squares. ` +
          `Diagonal AC is drawn from corner A (bottom-left) to C (top-right).`,
        `Persegi panjang ABCD berukuran ${SMALL_COLS}×${SMALL_ROWS} — ` +
          `${SMALL_COLS * SMALL_ROWS} persegi kecil. Diagonal AC dari A (kiri bawah) ke C (kanan atas).`,
      ),
    },
    {
      phase: 'countPoints',
      highlightX: true,
      showAnswer: false,
      hold: 2000,
      result: false,
      caption: t(
        `Diagonal AC passes through exactly ${SMALL_POINTS} grid intersection points: A, X (the midpoint), and C.`,
        `Diagonal AC melewati tepat ${SMALL_POINTS} titik perpotongan garis grid: A, X (titik tengah), dan C.`,
      ),
    },
    {
      phase: 'formula',
      highlightX: false,
      showAnswer: false,
      hold: 2400,
      result: false,
      caption: t(
        `Rule: diagonal of m×n grid passes through GCD(m, n)+1 lattice points. ` +
          `GCD(${SMALL_COLS}, ${SMALL_ROWS}) = ${SMALL_GCD}, so ${SMALL_GCD}+1 = ${SMALL_POINTS}. ✓`,
        `Rumus: diagonal grid m×n melewati GCD(m, n)+1 titik kisi. ` +
          `GCD(${SMALL_COLS}, ${SMALL_ROWS}) = ${SMALL_GCD}, jadi ${SMALL_GCD}+1 = ${SMALL_POINTS}. ✓`,
      ),
    },
    {
      phase: 'apply',
      highlightX: false,
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        `For ${BIG_COLS}×${BIG_ROWS}: GCD(${BIG_COLS}, ${BIG_ROWS}) = ${BIG_GCD} ` +
          `(since ${BIG_COLS}=4×${BIG_GCD}, ${BIG_ROWS}=3×${BIG_GCD}), so ${BIG_GCD}+1 = ${BIG_POINTS}.`,
        `Untuk ${BIG_COLS}×${BIG_ROWS}: GCD(${BIG_COLS}, ${BIG_ROWS}) = ${BIG_GCD} ` +
          `(karena ${BIG_COLS}=4×${BIG_GCD}, ${BIG_ROWS}=3×${BIG_GCD}), jadi ${BIG_GCD}+1 = ${BIG_POINTS}.`,
      ),
    },
    {
      phase: 'result',
      highlightX: false,
      showAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        `The diagonal of the ${BIG_COLS}×${BIG_ROWS} rectangle passes through ${BIG_POINTS} lattice points.`,
        `Diagonal persegi panjang ${BIG_COLS}×${BIG_ROWS} melewati ${BIG_POINTS} titik kisi.`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
