import type { Lang } from '../concepts/explainers/makeTenSteps'
import { PER_ROW, TRIANGLE_TOTAL } from './P21G2Q16Illustration'

export type Q16Phase = 'show' | 'bottom' | 'top' | 'result'

export interface Q16Step {
  phase: Q16Phase
  /** Which strip row is lit (0 bottom, 1 top), or null. */
  litRow: number | null
  caption: string
  hold: number
  result: boolean
}

export interface Q16Storyboard {
  perRow: number
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
      hold: 1700,
      result: false,
      caption: t(
        'Count one strip at a time — the small triangles point up, then down, all the way along.',
        'Hitung per baris — segitiga kecil mengarah ke atas, lalu ke bawah, sepanjang baris.',
      ),
    },
    {
      phase: 'bottom',
      litRow: 0,
      hold: 2000,
      result: false,
      caption: t(
        `Bottom strip: 3 up + 3 down = ${PER_ROW} small triangles.`,
        `Baris bawah: 3 ke atas + 3 ke bawah = ${PER_ROW} segitiga kecil.`,
      ),
    },
    {
      phase: 'top',
      litRow: 1,
      hold: 2000,
      result: false,
      caption: t(
        `Top strip: another ${PER_ROW}. The diagonals flip at the middle, so no bigger triangle forms.`,
        `Baris atas: ${PER_ROW} lagi. Diagonal berbalik di tengah, jadi tak ada segitiga lebih besar.`,
      ),
    },
    {
      phase: 'result',
      litRow: null,
      hold: 0,
      result: true,
      caption: t(
        `${PER_ROW} + ${PER_ROW} = ${TRIANGLE_TOTAL} triangles — answer C.`,
        `${PER_ROW} + ${PER_ROW} = ${TRIANGLE_TOTAL} segitiga — jawaban C.`,
      ),
    },
  ]

  return {
    perRow: PER_ROW,
    total: TRIANGLE_TOTAL,
    steps,
    finalIndex: steps.length - 1,
  }
}
