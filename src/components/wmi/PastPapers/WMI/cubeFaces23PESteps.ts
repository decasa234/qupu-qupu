import type { Lang } from '../../concepts/explainers/makeTenSteps'

// ---------------------------------------------------------------------------
// Problem constants  (all from seed quantities — anti-drift)
// ---------------------------------------------------------------------------

/** The number whose opposite face we are finding. */
export const FACE_GIVEN = 5

/** The correct opposite value (answer C). */
export const FACE_OPP   = 6

/** The equal opposite-pair sum. */
export const PAIR_SUM   = FACE_GIVEN + FACE_OPP   // 11

/** The two remaining opposite pairs that also sum to PAIR_SUM. */
export const PAIR_B = [2, 9] as const
export const PAIR_C = [3, 8] as const

// The three faces visible in the problem figure: top=5, left=4, right=8.
export const VISIBLE_TOP   = 5
export const VISIBLE_LEFT  = 4
export const VISIBLE_RIGHT = 8

// ---------------------------------------------------------------------------
// Beat types
// ---------------------------------------------------------------------------

export type CubeFaces23PEPhase =
  | 'intro'       // show cube, state the rule
  | 'test-c'      // test x=6: pairs work ✓
  | 'pairs'       // show the two remaining pairs
  | 'result'      // confirm answer C

export interface CubeFaces23PEStep {
  phase: CubeFaces23PEPhase
  /** Highlight opposite-pair sum (S label) */
  showSum: boolean
  /** Highlight the answer pair 5↔6 */
  highlightAnswerPair: boolean
  /** Highlight remaining pairs B and C */
  highlightRemainingPairs: boolean
  caption: string
  hold: number
  result: boolean
}

export interface CubeFaces23PEStoryboard {
  steps: CubeFaces23PEStep[]
  finalIndex: number
}

/**
 * Beat storyboard for IKMC-20-PE-Q23.
 *
 * Beat 1 (intro)    — show labelled cube; state the equal-opposite-pairs rule.
 * Beat 2 (test-c)   — try x=6: S = 5+6 = 11; highlight the pair.
 * Beat 3 (pairs)    — show (2,9) and (3,8) also sum to 11; all 6 numbers distinct.
 * Beat 4 (result)   — confirm answer C = 6.
 */
export function buildCubeFaces23PESteps(lang: Lang): CubeFaces23PEStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CubeFaces23PEStep[] = [
    {
      phase: 'intro',
      showSum: false,
      highlightAnswerPair: false,
      highlightRemainingPairs: false,
      hold: 2000,
      result: false,
      caption: t(
        `A cube has 3 pairs of opposite faces. Every pair must sum to the same value S. ` +
        `Face 5 is on top — what is its opposite?`,
        `Sebuah kubus memiliki 3 pasang sisi berhadapan. Setiap pasang harus berjumlah sama S. ` +
        `Sisi 5 ada di atas — apa sisi berhadapannya?`,
      ),
    },
    {
      phase: 'test-c',
      showSum: true,
      highlightAnswerPair: true,
      highlightRemainingPairs: false,
      hold: 2200,
      result: false,
      caption: t(
        `Try x = ${FACE_OPP}: S = ${FACE_GIVEN} + ${FACE_OPP} = ${PAIR_SUM}. ` +
        `Now check if 4 more distinct numbers from 1–9 can form 2 pairs, each summing to ${PAIR_SUM}.`,
        `Coba x = ${FACE_OPP}: S = ${FACE_GIVEN} + ${FACE_OPP} = ${PAIR_SUM}. ` +
        `Periksa apakah 4 angka berbeda dari 1–9 bisa membentuk 2 pasang, masing-masing berjumlah ${PAIR_SUM}.`,
      ),
    },
    {
      phase: 'pairs',
      showSum: true,
      highlightAnswerPair: true,
      highlightRemainingPairs: true,
      hold: 2400,
      result: false,
      caption: t(
        `Remaining numbers (excluding ${FACE_GIVEN} and ${FACE_OPP}): ` +
        `pair (${PAIR_B[0]}, ${PAIR_B[1]}) = ${PAIR_SUM} ✓  and  (${PAIR_C[0]}, ${PAIR_C[1]}) = ${PAIR_SUM} ✓. ` +
        `All 6 numbers are distinct — it works!`,
        `Angka yang tersisa (kecuali ${FACE_GIVEN} dan ${FACE_OPP}): ` +
        `pasang (${PAIR_B[0]}, ${PAIR_B[1]}) = ${PAIR_SUM} ✓  dan  (${PAIR_C[0]}, ${PAIR_C[1]}) = ${PAIR_SUM} ✓. ` +
        `Keenam angka berbeda — berhasil!`,
      ),
    },
    {
      phase: 'result',
      showSum: true,
      highlightAnswerPair: true,
      highlightRemainingPairs: true,
      hold: 0,
      result: true,
      caption: t(
        `The face opposite 5 is ${FACE_OPP} — answer C.`,
        `Sisi yang berhadapan dengan 5 adalah ${FACE_OPP} — jawaban C.`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
