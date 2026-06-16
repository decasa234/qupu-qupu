import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { BoxKey } from './P21G2Q22Illustration'
import {
  PRODUCT_BOTTOM,
  PRODUCT_LEFT,
  PRODUCT_RIGHT,
  PRODUCT_TOP,
  SOLUTION,
  SOLUTION_SUM,
} from './P21G2Q22Illustration'

export type CrossPhase = 'show' | 'tl' | 'tr' | 'bl' | 'br' | 'result'

export interface CrossStep {
  phase: CrossPhase
  /** Box values filled in so far. */
  values: Partial<Record<BoxKey, number>>
  /** Box being reasoned about on this beat (ring-highlighted), if any. */
  highlight: BoxKey | null
  /** Sum line to show beneath the grid, if any. */
  showSum: string | null
  caption: string
  hold: number
  result: boolean
}

export interface CrossStoryboard {
  answer: number
  steps: CrossStep[]
  finalIndex: number
}

export function buildP21G2Q22Steps(lang: Lang): CrossStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const { TL, TR, BL, BR } = SOLUTION
  const sumLine = `${TL} + ${TR} + ${BL} + ${BR} = ${SOLUTION_SUM}`

  const steps: CrossStep[] = [
    {
      phase: 'show',
      values: {},
      highlight: null,
      showSum: null,
      hold: 1900,
      result: false,
      caption: t(
        `Each box is a whole number. Top × = ${PRODUCT_TOP}, bottom × = ${PRODUCT_BOTTOM}, left × = ${PRODUCT_LEFT}, right × = ${PRODUCT_RIGHT}.`,
        `Tiap kotak bilangan bulat. Atas × = ${PRODUCT_TOP}, bawah × = ${PRODUCT_BOTTOM}, kiri × = ${PRODUCT_LEFT}, kanan × = ${PRODUCT_RIGHT}.`,
      ),
    },
    {
      phase: 'tl',
      values: { TL },
      highlight: 'TL',
      showSum: null,
      hold: 2200,
      result: false,
      caption: t(
        `Top-left is in both 18 and 24. The number that divides both is ${TL}. So TL = ${TL}.`,
        `Kotak kiri-atas ada di 18 dan 24. Bilangan yang membagi keduanya adalah ${TL}. Jadi kiri-atas = ${TL}.`,
      ),
    },
    {
      phase: 'tr',
      values: { TL, TR },
      highlight: 'TR',
      showSum: null,
      hold: 2000,
      result: false,
      caption: t(
        `Top row: ${PRODUCT_TOP} ÷ ${TL} = ${TR}. So TR = ${TR}.`,
        `Baris atas: ${PRODUCT_TOP} ÷ ${TL} = ${TR}. Jadi kanan-atas = ${TR}.`,
      ),
    },
    {
      phase: 'bl',
      values: { TL, TR, BL },
      highlight: 'BL',
      showSum: null,
      hold: 2000,
      result: false,
      caption: t(
        `Left column: ${PRODUCT_LEFT} ÷ ${TL} = ${BL}. So BL = ${BL}.`,
        `Kolom kiri: ${PRODUCT_LEFT} ÷ ${TL} = ${BL}. Jadi kiri-bawah = ${BL}.`,
      ),
    },
    {
      phase: 'br',
      values: { TL, TR, BL, BR },
      highlight: 'BR',
      showSum: null,
      hold: 2200,
      result: false,
      caption: t(
        `Right column: ${PRODUCT_RIGHT} ÷ ${TR} = ${BR}. Check bottom row: ${BL} × ${BR} = ${PRODUCT_BOTTOM} ✓. So BR = ${BR}.`,
        `Kolom kanan: ${PRODUCT_RIGHT} ÷ ${TR} = ${BR}. Cek baris bawah: ${BL} × ${BR} = ${PRODUCT_BOTTOM} ✓. Jadi kanan-bawah = ${BR}.`,
      ),
    },
    {
      phase: 'result',
      values: { TL, TR, BL, BR },
      highlight: null,
      showSum: sumLine,
      hold: 0,
      result: true,
      caption: t(
        `Largest possible sum: ${sumLine} — answer B.`,
        `Jumlah terbesar: ${sumLine} — jawaban B.`,
      ),
    },
  ]

  return {
    answer: SOLUTION_SUM,
    steps,
    finalIndex: steps.length - 1,
  }
}
