import type { Lang } from '../concepts/explainers/makeTenSteps'
import { CARD_DIGITS } from './DigitCards24G1Illustration'

// CARD_DIGITS = [6, 0, 5, 7, 4, 2] (by index).
//   [0]=6  [1]=0  [2]=5  [3]=7  [4]=4  [5]=2
// Smallest 3-digit EVEN = 204 from cards 2/0/4 → indices [5, 1, 4].
// Leftovers {5, 6, 7} → largest 2-digit ODD = 75 from cards 7/5 → indices [3, 2].
// (Card 6 at index 0 is never chosen — it's the one leftover that stays out.)
const IDX_0 = 1
const IDX_5 = 2
const IDX_7 = 3
const IDX_4 = 4
const IDX_2 = 5

// Which group a beat is building, so the explainer can colour the slot row.
export type DigitGroup = 'even' | 'odd'

export type DigitCardsPhase =
  | 'goal'
  | 'evenHundreds'
  | 'evenTens'
  | 'evenUnits'
  | 'evenDone'
  | 'oddTens'
  | 'oddUnits'
  | 'result'

export interface DigitCardsStep {
  phase: DigitCardsPhase
  /** Indices passed to DigitCards24G1 as pick3 (even group, blue). */
  pick3: number[]
  /** Indices passed to DigitCards24G1 as pick2 (odd group, orange). */
  pick2: number[]
  /** Formed numbers revealed in the band under the cards. */
  showFormed: { even?: string; odd?: string }
  /** Which slot row to render this beat: the 3-digit even or 2-digit odd. */
  group: DigitGroup
  /** Digit slots for the current group ('' = still empty). */
  slots: string[]
  caption: string
  hold: number
  result: boolean
}

export interface DigitCardsStoryboard {
  /** The asked-for value (the odd number). */
  answer: string
  even: string
  odd: string
  steps: DigitCardsStep[]
  finalIndex: number
}

export function buildDigitCards24G1Steps(lang: Lang): DigitCardsStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const digits = CARD_DIGITS.join(', ')

  const EVEN = '204'
  const ODD = '75'

  const steps: DigitCardsStep[] = [
    {
      phase: 'goal',
      pick3: [],
      pick2: [],
      showFormed: {},
      group: 'even',
      slots: ['', '', ''],
      result: false,
      hold: 1900,
      caption: t(
        `Cards ${digits}. First make the SMALLEST 3-digit EVEN number.`,
        `Kartu ${digits}. Pertama buat bilangan GENAP 3 angka TERKECIL.`,
      ),
    },
    {
      phase: 'evenHundreds',
      pick3: [IDX_2],
      pick2: [],
      showFormed: {},
      group: 'even',
      slots: ['2', '', ''],
      result: false,
      hold: 2200,
      caption: t(
        'Hundreds can’t be 0 (then it’s only 2 digits). Smallest card that isn’t 0 is 2.',
        'Ratusan tak boleh 0 (nanti cuma 2 angka). Kartu bukan-nol terkecil adalah 2.',
      ),
    },
    {
      phase: 'evenTens',
      pick3: [IDX_2, IDX_0],
      pick2: [],
      showFormed: {},
      group: 'even',
      slots: ['2', '0', ''],
      result: false,
      hold: 2000,
      caption: t(
        'Now 0 is allowed: the smallest leftover card, 0, goes in the tens.',
        'Sekarang 0 boleh: kartu sisa terkecil, 0, masuk ke puluhan.',
      ),
    },
    {
      phase: 'evenUnits',
      pick3: [IDX_2, IDX_0, IDX_4],
      pick2: [],
      showFormed: {},
      group: 'even',
      slots: ['2', '0', '4'],
      result: false,
      hold: 2200,
      caption: t(
        'Even means the units must be even. The smallest even leftover is 4.',
        'Genap berarti satuan harus genap. Sisa genap terkecil adalah 4.',
      ),
    },
    {
      phase: 'evenDone',
      pick3: [IDX_2, IDX_0, IDX_4],
      pick2: [],
      showFormed: { even: EVEN },
      group: 'even',
      slots: ['2', '0', '4'],
      result: false,
      hold: 2000,
      caption: t(
        `Smallest 3-digit even = ${EVEN}. Leftover cards are 5, 6, 7.`,
        `Genap 3 angka terkecil = ${EVEN}. Kartu sisa: 5, 6, 7.`,
      ),
    },
    {
      phase: 'oddTens',
      pick3: [IDX_2, IDX_0, IDX_4],
      pick2: [IDX_7],
      showFormed: { even: EVEN },
      group: 'odd',
      slots: ['7', ''],
      result: false,
      hold: 2200,
      caption: t(
        'Now the LARGEST 2-digit ODD from 5, 6, 7. Biggest card, 7, leads the tens.',
        'Sekarang GANJIL 2 angka TERBESAR dari 5, 6, 7. Kartu terbesar, 7, jadi puluhan.',
      ),
    },
    {
      phase: 'oddUnits',
      pick3: [IDX_2, IDX_0, IDX_4],
      pick2: [IDX_7, IDX_5],
      showFormed: { even: EVEN },
      group: 'odd',
      slots: ['7', '5'],
      result: false,
      hold: 2200,
      caption: t(
        'Odd means odd units. Of leftovers 6 and 5, only 5 is odd — so units is 5.',
        'Ganjil berarti satuan ganjil. Dari sisa 6 dan 5, hanya 5 ganjil — jadi satuan 5.',
      ),
    },
    {
      phase: 'result',
      pick3: [IDX_2, IDX_0, IDX_4],
      pick2: [IDX_7, IDX_5],
      showFormed: { even: EVEN, odd: ODD },
      group: 'odd',
      slots: ['7', '5'],
      result: true,
      hold: 0,
      caption: t(
        `The largest 2-digit odd number is ${ODD}. The answer is ${ODD}.`,
        `Bilangan ganjil 2 angka terbesar adalah ${ODD}. Jawabannya ${ODD}.`,
      ),
    },
  ]

  return { answer: ODD, even: EVEN, odd: ODD, steps, finalIndex: steps.length - 1 }
}
