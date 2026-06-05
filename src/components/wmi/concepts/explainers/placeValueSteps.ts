import type { Lang } from './makeTenSteps'

export interface PlaceValueStep {
  showNumber: boolean
  showTiles: boolean
  showOnes: boolean
  showRods: boolean
  /** How many of the `tens` ten-rods are revealed (drives the 10, 20, 30… count). */
  rodsRevealed: number
  showResult: boolean
  caption: string
  result: boolean
}

export interface PlaceValueStoryboard {
  n: number
  /** The tens DIGIT, e.g. 4 in 47. */
  tens: number
  /** The ones digit, e.g. 7 in 47. */
  ones: number
  /** The value of the tens digit, e.g. 40 — the answer to the concept question. */
  tensValue: number
  steps: PlaceValueStep[]
  finalIndex: number
}

function clampTwoDigit(n: number): number {
  if (!Number.isFinite(n)) return 10
  return Math.max(10, Math.min(99, Math.round(n)))
}

export function buildPlaceValueSteps(nRaw: number, lang: Lang): PlaceValueStoryboard {
  const n = clampTwoDigit(nRaw)
  const tens = Math.floor(n / 10)
  const ones = n % 10
  const tensValue = tens * 10
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PlaceValueStep[] = []

  // 0. the whole number
  steps.push({
    showNumber: true, showTiles: false, showOnes: false, showRods: false, rodsRevealed: 0, showResult: false,
    caption: t(`This is ${n}.`, `Ini ${n}.`), result: false,
  })
  // 1. split into tens-place and ones-place digits
  steps.push({
    showNumber: false, showTiles: true, showOnes: false, showRods: false, rodsRevealed: 0, showResult: false,
    caption: t(
      `${tens} is in the tens place, ${ones} is in the ones place.`,
      `${tens} di tempat puluhan, ${ones} di tempat satuan.`,
    ), result: false,
  })
  // 2. the ones digit is just itself
  steps.push({
    showNumber: false, showTiles: true, showOnes: true, showRods: false, rodsRevealed: 0, showResult: false,
    caption: t(`The ones digit ${ones} is worth ${ones}.`, `Angka satuan ${ones} nilainya ${ones}.`), result: false,
  })
  // 3..(2+tens). reveal the tens digit as ten-rods, counting by tens
  for (let r = 1; r <= tens; r++) {
    steps.push({
      showNumber: false, showTiles: true, showOnes: true, showRods: true, rodsRevealed: r, showResult: false,
      caption: t(`${r} ten${r > 1 ? 's' : ''} = ${r * 10}`, `${r} puluhan = ${r * 10}`), result: false,
    })
  }
  // final. the value of the tens digit
  steps.push({
    showNumber: false, showTiles: true, showOnes: true, showRods: true, rodsRevealed: tens, showResult: true,
    caption: t(`So the tens digit is worth ${tensValue}.`, `Jadi nilai angka puluhan adalah ${tensValue}.`), result: true,
  })

  return { n, tens, ones, tensValue, steps, finalIndex: steps.length - 1 }
}
