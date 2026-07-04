import type { Lang } from '../../concepts/explainers/makeTenSteps'
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
        'Each empty cell holds one digit 0–9; some answers spill into two connected cells.',
        'Tiap sel kosong berisi satu angka 0–9; beberapa jawaban mengisi dua sel yang terhubung.',
      ),
    },
    {
      spotlight: ['A'],
      hold: 2100,
      result: false,
      caption: t(
        `Left chain: 8 × 4 = 32, then 3 − 2 = 1, 1 − 1 = 0, 6 − 0 = 6; the column 6 + A = 11 gives A = ${A_VAL}.`,
        `Rantai kiri: 8 × 4 = 32, lalu 3 − 2 = 1, 1 − 1 = 0, 6 − 0 = 6; kolom 6 + A = 11 memberi A = ${A_VAL}.`,
      ),
    },
    {
      spotlight: ['B'],
      hold: 2100,
      result: false,
      caption: t(
        `Top-right: 5 × 2 = 10, and (5 − 2) × 6 = 18 lands in the B cells, so B = ${B_VAL}.`,
        `Kanan-atas: 5 × 2 = 10, dan (5 − 2) × 6 = 18 jatuh di sel B, jadi B = ${B_VAL}.`,
      ),
    },
    {
      spotlight: ['C'],
      hold: 2100,
      result: false,
      caption: t(
        `Bottom-right: A + 2 = 7, 9 × 7 = 63, and 6 × 5 = 30 — the C cell is the TENS digit of 30 (the units 0 closes 3 − 3 = 0), so C = ${C_VAL}.`,
        `Kanan-bawah: A + 2 = 7, 9 × 7 = 63, dan 6 × 5 = 30 — sel C adalah angka PULUHAN dari 30 (angka satuannya 0 menutup 3 − 3 = 0), jadi C = ${C_VAL}.`,
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
