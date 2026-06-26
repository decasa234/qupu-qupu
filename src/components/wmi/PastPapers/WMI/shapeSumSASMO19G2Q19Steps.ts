import type { Lang } from '../../concepts/explainers/makeTenSteps'

// Problem constants bound to seed quantities (db/seed/sasmo/papers/2019-contest-g2.json q19)
export const TOTAL       = 32   // sq + tri + circ + circ = 32
export const SQ_OVER_TRI = 20   // sq = tri + 20
export const CIRC_VAL    = 0    // circle = 0 (given by figure)
export const TRI_VAL     = 6    // derived: tri = (32-20)/2 = 6
export const SQ_VAL      = 26   // derived: sq = 6 + 20 = 26
export const ANSWER      = 26   // sq + circ + circ = 26

export interface ShapeSumStep {
  highlightEq1: boolean
  highlightEq2: boolean
  highlightEq3: boolean
  showAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface ShapeSumStoryboard {
  steps: ShapeSumStep[]
  finalIndex: number
}

export function buildShapeSumSASMO19G2Q19Steps(lang: Lang): ShapeSumStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ShapeSumStep[] = [
    {
      highlightEq1: false, highlightEq2: false, highlightEq3: false,
      showAnswer: false, hold: 1600, result: false,
      caption: t(
        'Three equations are given. Find the value of square + circle + circle.',
        'Tiga persamaan diberikan. Cari nilai persegi + lingkaran + lingkaran.',
      ),
    },
    {
      highlightEq1: true, highlightEq2: false, highlightEq3: false,
      showAnswer: false, hold: 2000, result: false,
      caption: t(
        `Equation 1: square + triangle + circle + circle = ${TOTAL}.`,
        `Persamaan 1: persegi + segitiga + lingkaran + lingkaran = ${TOTAL}.`,
      ),
    },
    {
      highlightEq1: false, highlightEq2: true, highlightEq3: false,
      showAnswer: false, hold: 2000, result: false,
      caption: t(
        `Equation 2: square = triangle + ${SQ_OVER_TRI}.`,
        `Persamaan 2: persegi = segitiga + ${SQ_OVER_TRI}.`,
      ),
    },
    {
      highlightEq1: false, highlightEq2: false, highlightEq3: true,
      showAnswer: false, hold: 2000, result: false,
      caption: t(
        `Equation 3 (from figure): circle = ${CIRC_VAL}.`,
        `Persamaan 3 (dari gambar): lingkaran = ${CIRC_VAL}.`,
      ),
    },
    {
      highlightEq1: true, highlightEq2: true, highlightEq3: false,
      showAnswer: false, hold: 2400, result: false,
      caption: t(
        `Substitute square = triangle + ${SQ_OVER_TRI} into Eq 1: `+
        `2 × triangle + ${SQ_OVER_TRI} = ${TOTAL} → 2 × triangle = ${TOTAL - SQ_OVER_TRI} → triangle = ${TRI_VAL}.`,
        `Substitusi persegi = segitiga + ${SQ_OVER_TRI} ke Persamaan 1: `+
        `2 × segitiga + ${SQ_OVER_TRI} = ${TOTAL} → 2 × segitiga = ${TOTAL - SQ_OVER_TRI} → segitiga = ${TRI_VAL}.`,
      ),
    },
    {
      highlightEq1: false, highlightEq2: true, highlightEq3: false,
      showAnswer: false, hold: 2000, result: false,
      caption: t(
        `Square = triangle + ${SQ_OVER_TRI} = ${TRI_VAL} + ${SQ_OVER_TRI} = ${SQ_VAL}.`,
        `Persegi = segitiga + ${SQ_OVER_TRI} = ${TRI_VAL} + ${SQ_OVER_TRI} = ${SQ_VAL}.`,
      ),
    },
    {
      highlightEq1: false, highlightEq2: false, highlightEq3: false,
      showAnswer: true, hold: 0, result: true,
      caption: t(
        `Square + circle + circle = ${SQ_VAL} + ${CIRC_VAL} + ${CIRC_VAL} = ${ANSWER} ✓`,
        `Persegi + lingkaran + lingkaran = ${SQ_VAL} + ${CIRC_VAL} + ${CIRC_VAL} = ${ANSWER} ✓`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
