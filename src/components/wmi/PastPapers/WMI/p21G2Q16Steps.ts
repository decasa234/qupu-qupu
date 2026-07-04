import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { BIG_TOTAL, BOTTOM_SMALL, SMALL_TOTAL, TOP_SMALL, TRIANGLE_TOTAL } from './P21G2Q16Illustration'

export type Q16Phase = 'show' | 'bottom' | 'top' | 'big' | 'result'

export interface Q16Step {
  phase: Q16Phase
  /** Which strip of small triangles is lit (0 bottom, 1 top), or null. */
  litRow: number | null
  /** Light the three side-2 triangles. */
  litBig: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q16Storyboard {
  smallTotal: number
  bigTotal: number
  total: number
  steps: Q16Step[]
  finalIndex: number
}

export function buildP21G2Q16Steps(lang: Lang): Q16Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q16Step[] = [
    {
      phase: 'show',
      litRow: null,
      litBig: false,
      hold: 1700,
      result: false,
      caption: t(
        'Count by size: the small triangles strip by strip first, then the bigger ones.',
        'Hitung per ukuran: segitiga kecil per baris dulu, lalu yang lebih besar.',
      ),
    },
    {
      phase: 'bottom',
      litRow: 0,
      litBig: false,
      hold: 2000,
      result: false,
      caption: t(
        `Bottom strip: 3 up + 2 down = ${BOTTOM_SMALL} small triangles.`,
        `Baris bawah: 3 ke atas + 2 ke bawah = ${BOTTOM_SMALL} segitiga kecil.`,
      ),
    },
    {
      phase: 'top',
      litRow: 1,
      litBig: false,
      hold: 2000,
      result: false,
      caption: t(
        `Top strip: 2 up + 2 down = ${TOP_SMALL} more. Small total: ${BOTTOM_SMALL} + ${TOP_SMALL} = ${SMALL_TOTAL}.`,
        `Baris atas: 2 ke atas + 2 ke bawah = ${TOP_SMALL} lagi. Total kecil: ${BOTTOM_SMALL} + ${TOP_SMALL} = ${SMALL_TOTAL}.`,
      ),
    },
    {
      phase: 'big',
      litRow: null,
      litBig: true,
      hold: 2200,
      result: false,
      caption: t(
        `Bigger triangles (each made of 4 small ones): 2 point up, 1 points down = ${BIG_TOTAL}.`,
        `Segitiga lebih besar (masing-masing dari 4 segitiga kecil): 2 ke atas, 1 ke bawah = ${BIG_TOTAL}.`,
      ),
    },
    {
      phase: 'result',
      litRow: null,
      litBig: false,
      hold: 0,
      result: true,
      caption: t(
        `${SMALL_TOTAL} + ${BIG_TOTAL} = ${TRIANGLE_TOTAL} triangles — answer C.`,
        `${SMALL_TOTAL} + ${BIG_TOTAL} = ${TRIANGLE_TOTAL} segitiga — jawaban C.`,
      ),
    },
  ]

  return {
    smallTotal: SMALL_TOTAL,
    bigTotal: BIG_TOTAL,
    total: TRIANGLE_TOTAL,
    steps,
    finalIndex: steps.length - 1,
  }
}
