import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type AgeAlicePhase = 'show' | 'now' | 'future' | 'solve' | 'result'

export interface AgeAliceStep {
  phase: AgeAlicePhase
  highlightNow: boolean
  highlightFuture: boolean
  showAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface AgeAliceStoryboard {
  steps: AgeAliceStep[]
  finalIndex: number
}

// Problem constants (bound to seed quantities)
export const SUM_NOW = 33           // Alice + Uncle = 33
export const YEARS_AHEAD = 3        // "in 3 years"
export const ALICE_AGE = 10         // answer
export const UNCLE_AGE = SUM_NOW - ALICE_AGE  // 23
export const ANSWER_LABEL = 'B'

/**
 * Beat-by-beat storyboard:
 *   1. Show both panels — read the problem.
 *   2. Highlight "NOW" panel — label the equation: Uncle = 33 − a.
 *   3. Highlight "IN 3 YEARS" panel — label the future equation.
 *   4. Solve: 36 − a = 2a + 6  →  3a = 30  →  a = 10.
 *   5. Result — Alice = 10, answer B.
 */
export function buildAgeAlice19B7Steps(lang: Lang): AgeAliceStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: AgeAliceStep[] = [
    {
      phase: 'show',
      highlightNow: false,
      highlightFuture: false,
      showAnswer: false,
      hold: 1800,
      result: false,
      caption: t(
        `Alice and her uncle's ages add up to ${SUM_NOW}. In ${YEARS_AHEAD} years, uncle will be twice Alice's age.`,
        `Umur Alice dan pamannya berjumlah ${SUM_NOW}. Dalam ${YEARS_AHEAD} tahun, paman akan berumur dua kali umur Alice.`,
      ),
    },
    {
      phase: 'now',
      highlightNow: true,
      highlightFuture: false,
      showAnswer: false,
      hold: 2000,
      result: false,
      caption: t(
        `Let Alice's age now = a. Then Uncle's age now = ${SUM_NOW} − a.`,
        `Misalkan umur Alice sekarang = a. Maka umur paman sekarang = ${SUM_NOW} − a.`,
      ),
    },
    {
      phase: 'future',
      highlightNow: false,
      highlightFuture: true,
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        `In ${YEARS_AHEAD} years: (${SUM_NOW}−a)+${YEARS_AHEAD} = 2(a+${YEARS_AHEAD})  →  ${SUM_NOW + YEARS_AHEAD}−a = 2a+${YEARS_AHEAD * 2}.`,
        `Dalam ${YEARS_AHEAD} tahun: (${SUM_NOW}−a)+${YEARS_AHEAD} = 2(a+${YEARS_AHEAD})  →  ${SUM_NOW + YEARS_AHEAD}−a = 2a+${YEARS_AHEAD * 2}.`,
      ),
    },
    {
      phase: 'solve',
      highlightNow: false,
      highlightFuture: true,
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        `${SUM_NOW + YEARS_AHEAD} − a = 2a + ${YEARS_AHEAD * 2}  →  3a = ${SUM_NOW + YEARS_AHEAD - YEARS_AHEAD * 2}  →  a = ${ALICE_AGE}.`,
        `${SUM_NOW + YEARS_AHEAD} − a = 2a + ${YEARS_AHEAD * 2}  →  3a = ${SUM_NOW + YEARS_AHEAD - YEARS_AHEAD * 2}  →  a = ${ALICE_AGE}.`,
      ),
    },
    {
      phase: 'result',
      highlightNow: false,
      highlightFuture: false,
      showAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        `Alice is ${ALICE_AGE} years old. Check: uncle = ${UNCLE_AGE}; in ${YEARS_AHEAD} years uncle=${UNCLE_AGE + YEARS_AHEAD}, Alice=${ALICE_AGE + YEARS_AHEAD}, ${UNCLE_AGE + YEARS_AHEAD}=2×${ALICE_AGE + YEARS_AHEAD} ✓ — answer ${ANSWER_LABEL}.`,
        `Umur Alice ${ALICE_AGE} tahun. Cek: paman=${UNCLE_AGE}; dalam ${YEARS_AHEAD} tahun paman=${UNCLE_AGE + YEARS_AHEAD}, Alice=${ALICE_AGE + YEARS_AHEAD}, ${UNCLE_AGE + YEARS_AHEAD}=2×${ALICE_AGE + YEARS_AHEAD} ✓ — jawaban ${ANSWER_LABEL}.`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
