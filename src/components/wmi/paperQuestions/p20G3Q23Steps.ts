import type { Lang } from '../concepts/explainers/makeTenSteps'
import { A_VAL, ABC_SUM, B_VAL, C_VAL } from './P20G3Q23Illustration'

export interface Q23Step {
  /** Target cells to spotlight ([] = all). */
  spotlight: string[]
  caption: string
  hold: number
  result: boolean
}

export interface Q23Storyboard {
  answer: number
  steps: Q23Step[]
  finalIndex: number
}

export function buildP20G3Q23Steps(lang: Lang): Q23Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q23Step[] = [
    {
      spotlight: [],
      hold: 2000,
      result: false,
      caption: t(
        'Every cell is a different digit 0–9. Start where a block has the most givens.',
        'Tiap sel adalah angka berbeda 0–9. Mulai dari blok yang paling banyak angkanya.',
      ),
    },
    {
      spotlight: ['A'],
      hold: 2100,
      result: false,
      caption: t(
        `The "+ 2 =" row pins cell A: chasing its equation gives A = ${A_VAL}.`,
        `Baris "+ 2 =" menentukan sel A: dari persamaannya, A = ${A_VAL}.`,
      ),
    },
    {
      spotlight: ['B'],
      hold: 2100,
      result: false,
      caption: t(
        `In the top-right block the "× … = 6" chain forces cell B = ${B_VAL}.`,
        `Di blok kanan-atas, rantai "× … = 6" memaksa sel B = ${B_VAL}.`,
      ),
    },
    {
      spotlight: ['C'],
      hold: 2100,
      result: false,
      caption: t(
        `The bottom-right "− 3 =" line leaves cell C = ${C_VAL}.`,
        `Baris "− 3 =" di kanan-bawah menyisakan sel C = ${C_VAL}.`,
      ),
    },
    {
      spotlight: [],
      hold: 0,
      result: true,
      caption: t(
        `A + B + C = ${A_VAL} + ${B_VAL} + ${C_VAL} = ${ABC_SUM} — answer A.`,
        `A + B + C = ${A_VAL} + ${B_VAL} + ${C_VAL} = ${ABC_SUM} — jawaban A.`,
      ),
    },
  ]

  return { answer: ABC_SUM, steps, finalIndex: steps.length - 1 }
}
