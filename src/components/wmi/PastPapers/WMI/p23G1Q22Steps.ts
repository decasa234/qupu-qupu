import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { FLAG_ORDER } from './P23G1Q22Illustration'

export type FlagPhase = 'show' | 'idea' | 'tally' | 'sum' | 'result'

export interface FlagStep {
  phase: FlagPhase
  /** Column index of the flag currently being inspected (-1 = none). */
  focusIndex: number
  /** Running total of out-of-order pairs counted so far. */
  runningTotal: number
  caption: string
  hold: number
  result: boolean
}

export interface FlagStoryboard {
  /** Per-flag count of smaller flags sitting to its right (the inversions). */
  perFlag: number[]
  answer: number
  steps: FlagStep[]
  finalIndex: number
}

/** For each flag, how many smaller-numbered flags lie to its right. */
function smallerToRight(order: number[]): number[] {
  return order.map((v, i) => order.slice(i + 1).filter((x) => x < v).length)
}

export function buildP23G1Q22Steps(lang: Lang): FlagStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const order = FLAG_ORDER
  const perFlag = smallerToRight(order) // [4, 2, 2, 0, 1, 0]
  const answer = perFlag.reduce((a, b) => a + b, 0) // 9

  const steps: FlagStep[] = [
    {
      phase: 'show',
      focusIndex: -1,
      runningTotal: 0,
      hold: 1900,
      result: false,
      caption: t(
        'Now: 5, 3, 4, 1, 6, 2. We want 1, 2, 3, 4, 5, 6.',
        'Sekarang: 5, 3, 4, 1, 6, 2. Kita ingin 1, 2, 3, 4, 5, 6.',
      ),
    },
    {
      phase: 'idea',
      focusIndex: -1,
      runningTotal: 0,
      hold: 2200,
      result: false,
      caption: t(
        'One swap fixes one out-of-order pair. So count: how many pairs are out of order?',
        'Satu tukar membetulkan satu pasang yang salah urut. Jadi hitung: berapa pasang yang salah urut?',
      ),
    },
  ]

  // One tally beat per flag: spotlight it and add its "smaller-to-the-right" count.
  let running = 0
  order.forEach((value, i) => {
    running += perFlag[i]
    const k = perFlag[i]
    steps.push({
      phase: 'tally',
      focusIndex: i,
      runningTotal: running,
      hold: 1700,
      result: false,
      caption: t(
        `Flag ${value}: ${k} smaller flag${k === 1 ? '' : 's'} sit to its right. Total so far: ${running}.`,
        `Bendera ${value}: ada ${k} bendera lebih kecil di kanannya. Jumlah sejauh ini: ${running}.`,
      ),
    })
  })

  steps.push({
    phase: 'sum',
    focusIndex: -1,
    runningTotal: answer,
    hold: 2000,
    result: false,
    caption: t(
      `Add them up: 4 + 2 + 2 + 0 + 1 + 0 = ${answer} out-of-order pairs.`,
      `Jumlahkan: 4 + 2 + 2 + 0 + 1 + 0 = ${answer} pasang yang salah urut.`,
    ),
  })

  steps.push({
    phase: 'result',
    focusIndex: -1,
    runningTotal: answer,
    hold: 0,
    result: true,
    caption: t(
      `So at least ${answer} adjacent swaps are needed — answer C.`,
      `Jadi paling sedikit ${answer} kali tukar bersebelahan — jawaban C.`,
    ),
  })

  return { perFlag, answer, steps, finalIndex: steps.length - 1 }
}
