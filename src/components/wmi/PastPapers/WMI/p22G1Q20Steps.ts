import type { Lang } from '../concepts/explainers/makeTenSteps'
import {
  ANSWER_LETTER,
  CIRCLE_TOTAL,
  DIAMOND_VALUE,
  STAR_VALUE,
  type CircleKey,
} from './P22G1Q20Illustration'

export type Q20Phase = 'show' | 'constant' | 'star' | 'diamond' | 'result'

export interface Q20Step {
  phase: Q20Phase
  highlightCircles: CircleKey[]
  showConstant: boolean
  revealStar?: number
  revealDiamond?: number
  caption: string
  hold: number
  result: boolean
}

export interface Q20Storyboard {
  star: number
  diamond: number
  answer: string
  steps: Q20Step[]
  finalIndex: number
}

export function buildP22G1Q20Steps(lang: Lang): Q20Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q20Step[] = [
    {
      phase: 'show',
      highlightCircles: [],
      showConstant: false,
      hold: 1900,
      result: false,
      caption: t(
        'Add up the numbers inside ONE circle. The whole left circle: 13 + 17 = 30.',
        'Jumlahkan angka di dalam SATU lingkaran. Lingkaran kiri penuh: 13 + 17 = 30.',
      ),
    },
    {
      phase: 'constant',
      highlightCircles: ['botL'],
      showConstant: true,
      hold: 2200,
      result: false,
      caption: t(
        `Check another: bottom-left = 17 + 7 + 6 = 30. So EVERY circle sums to ${CIRCLE_TOTAL}.`,
        `Cek yang lain: kiri-bawah = 17 + 7 + 6 = 30. Jadi SETIAP lingkaran berjumlah ${CIRCLE_TOTAL}.`,
      ),
    },
    {
      phase: 'star',
      highlightCircles: ['topM'],
      showConstant: true,
      revealStar: STAR_VALUE,
      hold: 2300,
      result: false,
      caption: t(
        `Middle-top circle: 12 + 7 + ★ = ${CIRCLE_TOTAL}, so ★ = ${CIRCLE_TOTAL} − 19 = ${STAR_VALUE}.`,
        `Lingkaran tengah-atas: 12 + 7 + ★ = ${CIRCLE_TOTAL}, jadi ★ = ${CIRCLE_TOTAL} − 19 = ${STAR_VALUE}.`,
      ),
    },
    {
      phase: 'diamond',
      highlightCircles: ['botR'],
      showConstant: true,
      revealStar: STAR_VALUE,
      revealDiamond: DIAMOND_VALUE,
      hold: 2300,
      result: false,
      caption: t(
        `Bottom-right circle: ★ + 5 + ♦ = ${CIRCLE_TOTAL}, so ♦ = ${CIRCLE_TOTAL} − ${STAR_VALUE + 5} = ${DIAMOND_VALUE}.`,
        `Lingkaran kanan-bawah: ★ + 5 + ♦ = ${CIRCLE_TOTAL}, jadi ♦ = ${CIRCLE_TOTAL} − ${STAR_VALUE + 5} = ${DIAMOND_VALUE}.`,
      ),
    },
    {
      phase: 'result',
      highlightCircles: ['topM', 'botR'],
      showConstant: true,
      revealStar: STAR_VALUE,
      revealDiamond: DIAMOND_VALUE,
      hold: 0,
      result: true,
      caption: t(
        `★ = ${STAR_VALUE}, ♦ = ${DIAMOND_VALUE} — answer ${ANSWER_LETTER}.`,
        `★ = ${STAR_VALUE}, ♦ = ${DIAMOND_VALUE} — jawaban ${ANSWER_LETTER}.`,
      ),
    },
  ]

  return {
    star: STAR_VALUE,
    diamond: DIAMOND_VALUE,
    answer: ANSWER_LETTER,
    steps,
    finalIndex: steps.length - 1,
  }
}
