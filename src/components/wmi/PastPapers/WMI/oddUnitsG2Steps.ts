import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-19F2A-Q11 — units digit of (two successive odd numbers) product.
// Only the LAST digits matter. The five successive odd last-digit pairs and the
// units digit of each product:
export interface OddPair {
  a: number
  b: number
  prod: string
  unit: number
}
export const ODD_PAIRS: OddPair[] = [
  { a: 1, b: 3, prod: '3', unit: 3 },
  { a: 3, b: 5, prod: '15', unit: 5 },
  { a: 5, b: 7, prod: '35', unit: 5 },
  { a: 7, b: 9, prod: '63', unit: 3 },
  { a: 9, b: 1, prod: '9', unit: 9 },
]
/** Units digits that CAN appear, in first-seen order. */
export const POSSIBLE_UNITS = [3, 5, 9]
export const IMPOSSIBLE_UNIT = 7

export interface OddUnitsStep {
  /** How many of the five pair-rows are revealed. */
  revealRows: number
  /** Possible units collected so far (unique). */
  units: number[]
  /** Reveal the "never 7" conclusion. */
  showImpossible: boolean
  caption: string
  hold: number
  result: boolean
}

export interface OddUnitsStoryboard {
  steps: OddUnitsStep[]
  finalIndex: number
}

export function buildOddUnitsG2Steps(lang: Lang): OddUnitsStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: OddUnitsStep[] = [
    {
      revealRows: 0,
      units: [],
      showImpossible: false,
      hold: 1700,
      result: false,
      caption: t(
        'Only the LAST digit decides the last digit of the product.',
        'Hanya angka TERAKHIR yang menentukan satuan dari hasil kali.',
      ),
    },
    {
      revealRows: 1,
      units: [3],
      showImpossible: false,
      hold: 1500,
      result: false,
      caption: t('1 and 3: 1 × 3 = 3 — ends in 3.', '1 dan 3: 1 × 3 = 3 — berakhiran 3.'),
    },
    {
      revealRows: 2,
      units: [3, 5],
      showImpossible: false,
      hold: 1500,
      result: false,
      caption: t('3 and 5: 3 × 5 = 15 — ends in 5.', '3 dan 5: 3 × 5 = 15 — berakhiran 5.'),
    },
    {
      revealRows: 3,
      units: [3, 5],
      showImpossible: false,
      hold: 1500,
      result: false,
      caption: t('5 and 7: 5 × 7 = 35 — ends in 5 again.', '5 dan 7: 5 × 7 = 35 — berakhiran 5 lagi.'),
    },
    {
      revealRows: 4,
      units: [3, 5],
      showImpossible: false,
      hold: 1500,
      result: false,
      caption: t('7 and 9: 7 × 9 = 63 — ends in 3.', '7 dan 9: 7 × 9 = 63 — berakhiran 3.'),
    },
    {
      revealRows: 5,
      units: [3, 5, 9],
      showImpossible: false,
      hold: 1800,
      result: false,
      caption: t('9 and 1: 9 × 1 = 9 — ends in 9.', '9 dan 1: 9 × 1 = 9 — berakhiran 9.'),
    },
    {
      revealRows: 5,
      units: [3, 5, 9],
      showImpossible: true,
      hold: 0,
      result: true,
      caption: t(
        'The product can only end in 3, 5, or 9 — never 7. So the answer is 7.',
        'Hasil kalinya hanya bisa berakhiran 3, 5, atau 9 — tidak pernah 7. Jadi jawabannya 7.',
      ),
    },
  ]
  return { steps, finalIndex: steps.length - 1 }
}
