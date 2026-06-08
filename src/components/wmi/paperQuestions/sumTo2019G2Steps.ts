import type { Lang } from '../concepts/explainers/makeTenSteps'
import { MAX_FOUR, BOT_NUM, MID_NUM, TOP_NUM, TOTAL } from './SumTo2019G2Illustration'

export type SumPhaseG2 = 'show' | 'reason' | 'fill' | 'check' | 'result'

export interface SumStepG2 {
  phase: SumPhaseG2
  showTop: boolean
  showMiddle: boolean
  showBottom: boolean
  highlightRow: 'top' | 'middle' | 'bottom' | 'total' | null
  solved: boolean
  caption: string
  hold: number
  result: boolean
}

export interface SumStoryboardG2 {
  answer: number
  steps: SumStepG2[]
  finalIndex: number
}

export function buildSumTo2019G2Steps(lang: Lang): SumStoryboardG2 {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SumStepG2[] = [
    {
      phase: 'show',
      showTop: false,
      showMiddle: false,
      showBottom: false,
      highlightRow: null,
      solved: false,
      caption: t(
        `A 2-digit + 3-digit + 4-digit number add to ${TOTAL}. Use nine of the digits 0–9 (0 must be used, none repeated). Make the 4-digit number as big as possible.`,
        `Angka 2 digit + 3 digit + 4 digit berjumlah ${TOTAL}. Pakai sembilan dari angka 0–9 (0 harus dipakai, tak ada yang berulang). Buat angka 4 digit sebesar mungkin.`,
      ),
      hold: 3000,
      result: false,
    },
    {
      phase: 'reason',
      showTop: false,
      showMiddle: false,
      showBottom: false,
      highlightRow: 'total',
      solved: false,
      caption: t(
        `To make the 4-digit number biggest, keep the other two numbers small — then the 4-digit one is close to ${TOTAL}.`,
        `Agar angka 4 digit terbesar, buat dua angka lain kecil — lalu angka 4 digitnya mendekati ${TOTAL}.`,
      ),
      hold: 2800,
      result: false,
    },
    {
      phase: 'fill',
      showTop: false,
      showMiddle: false,
      showBottom: true,
      highlightRow: 'bottom',
      solved: false,
      caption: t(
        `Fitting nine different digits that still total ${TOTAL} pushes the biggest 4-digit number to ${MAX_FOUR}.`,
        `Memasang sembilan angka berbeda yang tetap berjumlah ${TOTAL} membuat angka 4 digit terbesar menjadi ${MAX_FOUR}.`,
      ),
      hold: 2800,
      result: false,
    },
    {
      phase: 'fill',
      showTop: false,
      showMiddle: true,
      showBottom: true,
      highlightRow: 'middle',
      solved: false,
      caption: t(
        `Let the 3-digit number be ${MID_NUM} (it uses a 0).`,
        `Buat angka 3 digit menjadi ${MID_NUM} (memakai angka 0).`,
      ),
      hold: 2400,
      result: false,
    },
    {
      phase: 'fill',
      showTop: true,
      showMiddle: true,
      showBottom: true,
      highlightRow: 'top',
      solved: false,
      caption: t(
        `Let the 2-digit number be ${TOP_NUM}.`,
        `Buat angka 2 digit menjadi ${TOP_NUM}.`,
      ),
      hold: 2200,
      result: false,
    },
    {
      phase: 'check',
      showTop: true,
      showMiddle: true,
      showBottom: true,
      highlightRow: 'total',
      solved: false,
      caption: t(
        `Check: ${TOP_NUM} + ${MID_NUM} + ${BOT_NUM} = ${TOTAL}. All nine digits are different and 0 is used.`,
        `Periksa: ${TOP_NUM} + ${MID_NUM} + ${BOT_NUM} = ${TOTAL}. Sembilan angka semuanya berbeda dan 0 dipakai.`,
      ),
      hold: 2800,
      result: false,
    },
    {
      phase: 'result',
      showTop: true,
      showMiddle: true,
      showBottom: true,
      highlightRow: 'bottom',
      solved: true,
      caption: t(
        `The largest 4-digit number is ${MAX_FOUR}.`,
        `Angka 4 digit terbesar adalah ${MAX_FOUR}.`,
      ),
      hold: 0,
      result: true,
    },
  ]

  return { answer: MAX_FOUR, steps, finalIndex: steps.length - 1 }
}
