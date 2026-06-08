import type { Lang } from './makeTenSteps'

export interface DigitSumStep {
  showNumber: boolean
  showTiles: boolean
  showDots: boolean
  merged: boolean
  showResult: boolean
  caption: string
  result: boolean
}

export interface DigitSumStoryboard {
  n: number
  tens: number
  ones: number
  sum: number
  steps: DigitSumStep[]
  /** Index of the last step (the result beat). */
  finalIndex: number
}

function clampTwoDigit(n: number): number {
  if (!Number.isFinite(n)) return 10
  return Math.max(10, Math.min(99, Math.round(n)))
}

export function buildDigitSumSteps(nRaw: number, lang: Lang): DigitSumStoryboard {
  const n = clampTwoDigit(nRaw)
  const tens = Math.floor(n / 10)
  const ones = n % 10
  const sum = tens + ones
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: DigitSumStep[] = [
    {
      showNumber: true, showTiles: false, showDots: false, merged: false, showResult: false,
      caption: t(`This is the number ${n}.`, `Ini bilangan ${n}.`), result: false,
    },
    {
      showNumber: false, showTiles: true, showDots: false, merged: false, showResult: false,
      caption: t(`It has 2 digits: ${tens} and ${ones}.`, `Ada 2 angka: ${tens} dan ${ones}.`), result: false,
    },
    {
      showNumber: false, showTiles: true, showDots: true, merged: false, showResult: false,
      caption: t(
        `The digit ${tens} means ${tens}. The digit ${ones} means ${ones}.`,
        `Angka ${tens} berarti ${tens}. Angka ${ones} berarti ${ones}.`,
      ), result: false,
    },
    {
      showNumber: false, showTiles: true, showDots: true, merged: true, showResult: false,
      caption: t(`Add the digits: ${tens} + ${ones}.`, `Jumlahkan angkanya: ${tens} + ${ones}.`), result: false,
    },
    {
      showNumber: false, showTiles: true, showDots: true, merged: true, showResult: true,
      caption: t(`The sum of the digits is ${sum}.`, `Jumlah angkanya ${sum}.`), result: true,
    },
  ]

  return { n, tens, ones, sum, steps, finalIndex: steps.length - 1 }
}
