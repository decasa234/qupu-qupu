import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { CIRCLE_ONLY } from './P23G1Q17Illustration'

// WMI-23P1A-Q17 (2023 Grade 1 Semifinal): how many DIGITS are both OUTSIDE the
// square and INSIDE the circle? (3 = 1 digit, 24 = 2 digits.)
//
// The circle-only region (outside square, inside circle) holds {25, 6, 13, 7}.
// Count DIGITS, not numbers: 25→2, 6→1, 13→2, 7→1  =>  6 digits (choice B).
//
// One idea per beat:
//   beat 0 — read the ask: outside the square AND inside the circle.
//   beat 1 — find that region: {25, 6, 13, 7}.
//   beat 2 — count DIGITS, not numbers: 25 and 13 are two digits each.
//   beat 3 — result: 2 + 1 + 2 + 1 = 6 → answer B.

const REGION = [...CIRCLE_ONLY] // [25, 6, 13, 7]
const DIGITS = REGION.map((n) => String(n).length) // [2, 1, 2, 1]
const TOTAL_DIGITS = DIGITS.reduce((a, b) => a + b, 0) // 6

export type P23G1Q17Phase = 'ask' | 'region' | 'count' | 'result'

export interface P23G1Q17Step {
  phase: P23G1Q17Phase
  /** Ring the circle-only numbers in the figure (from the 'region' beat onward). */
  highlight: boolean
  /** Show the per-number digit tags (from the 'count' beat onward). */
  showDigits: boolean
  caption: string
  hold: number
  result: boolean
}

export interface P23G1Q17Storyboard {
  region: number[]
  digits: number[]
  total: number
  answer: number
  steps: P23G1Q17Step[]
  finalIndex: number
}

export function buildP23G1Q17Steps(lang: Lang): P23G1Q17Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const regionList = REGION.join(', ')
  const sumLine = `${DIGITS.join(' + ')} = ${TOTAL_DIGITS}`

  const steps: P23G1Q17Step[] = [
    {
      phase: 'ask',
      highlight: false,
      showDigits: false,
      hold: 2000,
      result: false,
      caption: t(
        'We want digits that are OUTSIDE the square but INSIDE the circle.',
        'Kita cari angka yang di LUAR persegi tetapi di DALAM lingkaran.',
      ),
    },
    {
      phase: 'region',
      highlight: true,
      showDigits: false,
      hold: 2100,
      result: false,
      caption: t(
        `That region holds these numbers: ${regionList}.`,
        `Daerah itu memuat bilangan-bilangan ini: ${regionList}.`,
      ),
    },
    {
      phase: 'count',
      highlight: true,
      showDigits: true,
      hold: 2300,
      result: false,
      caption: t(
        'Count DIGITS, not numbers: 25 and 13 have two digits each; 6 and 7 have one.',
        'Hitung ANGKA, bukan bilangan: 25 dan 13 punya dua angka; 6 dan 7 punya satu.',
      ),
    },
    {
      phase: 'result',
      highlight: true,
      showDigits: true,
      hold: 0,
      result: true,
      caption: t(`${sumLine} digits — answer B.`, `${sumLine} angka — jawaban B.`),
    },
  ]

  return {
    region: REGION,
    digits: DIGITS,
    total: TOTAL_DIGITS,
    answer: TOTAL_DIGITS,
    steps,
    finalIndex: steps.length - 1,
  }
}
