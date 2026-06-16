import type { Lang } from '../concepts/explainers/makeTenSteps'
import { TOTAL_CM2, WHITE_CM2 } from './P22G3Q18Illustration'

// Storyboard for WMI-22P3A-Q18 — white check-mark area.
// Strategy: the whole 4x2 grid is 8 x 36 = 288 cm². The white tick, once its
// triangles are added up, covers exactly one quarter of the big rectangle, so
// its area is 288 ÷ 4 = 72 cm² (answer D).

export interface Q18Step {
  showTotal: boolean
  emphasizeWhite: boolean
  whiteLabel?: string
  caption: string
  hold: number
  result: boolean
}

export interface Q18Storyboard {
  total: number
  white: number
  steps: Q18Step[]
  finalIndex: number
}

export function buildP22G3Q18Steps(lang: Lang): Q18Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q18Step[] = [
    {
      showTotal: false,
      emphasizeWhite: false,
      hold: 1900,
      result: false,
      caption: t(
        'There are 8 small green rectangles, and each one is 36 cm².',
        'Ada 8 persegi panjang kecil hijau, masing-masing 36 cm².',
      ),
    },
    {
      showTotal: true,
      emphasizeWhite: false,
      hold: 2100,
      result: false,
      caption: t(
        `So the whole big rectangle = 8 × 36 = ${TOTAL_CM2} cm².`,
        `Jadi seluruh persegi panjang besar = 8 × 36 = ${TOTAL_CM2} cm².`,
      ),
    },
    {
      showTotal: true,
      emphasizeWhite: true,
      hold: 2300,
      result: false,
      caption: t(
        'The white check-mark is built from triangles. Add them up: it fills exactly one quarter of the big rectangle.',
        'Centang putih tersusun dari segitiga. Jumlahkan: ia mengisi tepat seperempat persegi panjang besar.',
      ),
    },
    {
      showTotal: true,
      emphasizeWhite: true,
      whiteLabel: `${WHITE_CM2}`,
      hold: 0,
      result: true,
      caption: t(
        `White area = ${TOTAL_CM2} ÷ 4 = ${WHITE_CM2} cm² — answer D.`,
        `Luas putih = ${TOTAL_CM2} ÷ 4 = ${WHITE_CM2} cm² — jawaban D.`,
      ),
    },
  ]

  return { total: TOTAL_CM2, white: WHITE_CM2, steps, finalIndex: steps.length - 1 }
}
