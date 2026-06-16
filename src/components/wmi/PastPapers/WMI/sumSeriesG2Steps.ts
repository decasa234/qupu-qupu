import type { Lang } from '../concepts/explainers/makeTenSteps'

// "Evenly spaced sum" storyboard, shared by WMI-19F2A-Q16 (168+158+148+138+128)
// and WMI-19F1A-Q16 (68+58+48+38+28). The amounts above the middle exactly fill
// the amounts below it ("give and take"), so every number levels out to the
// middle ⇒ total = middle × 5. The conclusion is derived on screen.
export const NUMBERS = [168, 158, 148, 138, 128]
export const MIDDLE_INDEX = 2
export const MIDDLE = 148
export const COUNT = NUMBERS.length // 5
export const TOTAL = 740

export interface SumStep {
  /** Outer pair levelled to the middle (±2 steps). */
  give20: boolean
  /** Inner pair levelled to the middle (±1 step). */
  give10: boolean
  /** All five shown as the middle value. */
  leveled: boolean
  showProduct: boolean
  showTotal: boolean
  caption: string
  hold: number
  result: boolean
}
export interface SumStoryboard {
  steps: SumStep[]
  finalIndex: number
}

/** Generic builder for any five evenly spaced numbers (descending or ascending). */
export function buildSumSeriesSteps(lang: Lang, numbers: number[]): SumStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const mid = numbers[MIDDLE_INDEX]
  const dOuter = Math.abs(numbers[0] - mid)
  const dInner = Math.abs(numbers[1] - mid)
  const hi2 = Math.max(numbers[0], numbers[4])
  const lo2 = Math.min(numbers[0], numbers[4])
  const hi1 = Math.max(numbers[1], numbers[3])
  const lo1 = Math.min(numbers[1], numbers[3])
  const total = mid * numbers.length

  const steps: SumStep[] = [
    {
      give20: false, give10: false, leveled: false, showProduct: false, showTotal: false,
      hold: 1800, result: false,
      caption: t(
        `The numbers are evenly spaced around the middle, ${mid}.`,
        `Bilangannya tersebar rata di sekitar nilai tengah, ${mid}.`,
      ),
    },
    {
      give20: true, give10: false, leveled: false, showProduct: false, showTotal: false,
      hold: 2200, result: false,
      caption: t(
        `${hi2} is ${dOuter} above and ${lo2} is ${dOuter} below — move ${dOuter} across, both become ${mid}.`,
        `${hi2} lebih ${dOuter}, ${lo2} kurang ${dOuter} — pindahkan ${dOuter}, keduanya jadi ${mid}.`,
      ),
    },
    {
      give20: true, give10: true, leveled: false, showProduct: false, showTotal: false,
      hold: 2200, result: false,
      caption: t(
        `${hi1} is ${dInner} above and ${lo1} is ${dInner} below — both become ${mid} too.`,
        `${hi1} lebih ${dInner}, ${lo1} kurang ${dInner} — keduanya juga jadi ${mid}.`,
      ),
    },
    {
      give20: true, give10: true, leveled: true, showProduct: true, showTotal: false,
      hold: 1800, result: false,
      caption: t(
        `Now all five are ${mid}, so the sum is ${mid} × ${numbers.length}.`,
        `Sekarang kelimanya ${mid}, jadi jumlahnya ${mid} × ${numbers.length}.`,
      ),
    },
    {
      give20: true, give10: true, leveled: true, showProduct: true, showTotal: true,
      hold: 0, result: true,
      caption: t(`${mid} × ${numbers.length} = ${total}.`, `${mid} × ${numbers.length} = ${total}.`),
    },
  ]
  return { steps, finalIndex: steps.length - 1 }
}

export function buildSumSeriesG2Steps(lang: Lang): SumStoryboard {
  return buildSumSeriesSteps(lang, NUMBERS)
}
