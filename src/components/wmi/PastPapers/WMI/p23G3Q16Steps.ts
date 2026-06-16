import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { A_VAL, ABC_SUM, B_VAL, C_LEAF, C_VAL, FLOWER, PAIRS } from './P23G3Q16Illustration'

export type Q16Phase = 'show' | 'solveA' | 'solveB' | 'solveC' | 'result'

export interface Q16Step {
  phase: Q16Phase
  leftLabels: string[]
  rightLabels: string[]
  highlightRow: number
  solvedRows: number[]
  caption: string
  hold: number
  result: boolean
}

export interface Q16Storyboard {
  a: number
  b: number
  c: number
  sum: number
  steps: Q16Step[]
  finalIndex: number
}

export function buildP23G3Q16Steps(lang: Lang): Q16Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const base = { left: PAIRS.map((p) => p.left), right: PAIRS.map((p) => p.right) }

  // Progressive reveals of the unknown leaves.
  const leftA = [...base.left]
  leftA[0] = String(A_VAL) // A → 3617

  const rightB = [...base.right]
  rightB[1] = String(B_VAL) // B → 2532

  const leftC = [...leftA] // keep A solved
  const rightC = [...rightB] // keep B solved
  leftC[3] = String(C_LEAF) // 289×7 → 2023
  rightC[3] = String(C_VAL) // C → 1777

  const steps: Q16Step[] = [
    {
      phase: 'show',
      leftLabels: base.left,
      rightLabels: base.right,
      highlightRow: -1,
      solvedRows: [],
      hold: 1800,
      result: false,
      caption: t(
        `Each left + right leaf pair adds up to the flower, ${FLOWER}.`,
        `Setiap pasang daun kiri + kanan berjumlah angka bunga, ${FLOWER}.`,
      ),
    },
    {
      phase: 'solveA',
      leftLabels: leftA,
      rightLabels: base.right,
      highlightRow: 0,
      solvedRows: [0],
      hold: 2000,
      result: false,
      caption: t(
        `A + 183 = ${FLOWER}, so A = ${FLOWER} − 183 = ${A_VAL}.`,
        `A + 183 = ${FLOWER}, jadi A = ${FLOWER} − 183 = ${A_VAL}.`,
      ),
    },
    {
      phase: 'solveB',
      leftLabels: leftA,
      rightLabels: rightB,
      highlightRow: 1,
      solvedRows: [0, 1],
      hold: 2000,
      result: false,
      caption: t(
        `1268 + B = ${FLOWER}, so B = ${FLOWER} − 1268 = ${B_VAL}.`,
        `1268 + B = ${FLOWER}, jadi B = ${FLOWER} − 1268 = ${B_VAL}.`,
      ),
    },
    {
      phase: 'solveC',
      leftLabels: leftC,
      rightLabels: rightC,
      highlightRow: 3,
      solvedRows: [0, 1, 3],
      hold: 2200,
      result: false,
      caption: t(
        `289 × 7 = ${C_LEAF}, so C = ${FLOWER} − ${C_LEAF} = ${C_VAL}.`,
        `289 × 7 = ${C_LEAF}, jadi C = ${FLOWER} − ${C_LEAF} = ${C_VAL}.`,
      ),
    },
    {
      phase: 'result',
      leftLabels: leftC,
      rightLabels: rightC,
      highlightRow: -1,
      solvedRows: [0, 1, 3],
      hold: 0,
      result: true,
      caption: t(
        `A + B + C = ${A_VAL} + ${B_VAL} + ${C_VAL} = ${ABC_SUM} — answer D.`,
        `A + B + C = ${A_VAL} + ${B_VAL} + ${C_VAL} = ${ABC_SUM} — jawaban D.`,
      ),
    },
  ]

  return {
    a: A_VAL,
    b: B_VAL,
    c: C_VAL,
    sum: ABC_SUM,
    steps,
    finalIndex: steps.length - 1,
  }
}
