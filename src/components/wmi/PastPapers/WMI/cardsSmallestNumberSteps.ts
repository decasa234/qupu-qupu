import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { CARD_DIGITS } from './CardsSmallestNumberIllustration'

// Card indices for the digits we care about. CARD_DIGITS = [6, 5, 0, 2].
const IDX_6 = 0
const IDX_5 = 1
const IDX_0 = 2
const IDX_2 = 3

export type CardsPhase = 'show' | 'hundreds' | 'tens' | 'units' | 'result'

export interface CardsStep {
  phase: CardsPhase
  /** Card indices currently highlighted as "picked". */
  picked: number[]
  /** Card indices faded out as "not used / rejected". */
  faded: number[]
  /** Place-value labels under picked cards, keyed by card index. */
  placeLabels: Record<number, string>
  /** The number built so far, digit slots ('' = empty). */
  slots: [string, string, string]
  caption: string
  hold: number
  result: boolean
}

export interface CardsStoryboard {
  answer: string
  steps: CardsStep[]
  finalIndex: number
}

export function buildCardsSmallestNumberSteps(lang: Lang): CardsStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const digits = CARD_DIGITS.join(', ')

  const hundreds = lang === 'id' ? 'ratusan' : 'hundreds'
  const tens = lang === 'id' ? 'puluhan' : 'tens'
  const units = lang === 'id' ? 'satuan' : 'units'

  const steps: CardsStep[] = [
    {
      phase: 'show',
      picked: [],
      faded: [],
      placeLabels: {},
      slots: ['', '', ''],
      result: false,
      hold: 1700,
      caption: t(
        `Pick three of the cards (${digits}) to make the smallest 3-digit number.`,
        `Pilih tiga kartu (${digits}) untuk membuat bilangan 3 digit terkecil.`,
      ),
    },
    {
      phase: 'hundreds',
      picked: [IDX_2],
      faded: [IDX_0],
      placeLabels: { [IDX_2]: hundreds },
      slots: ['2', '', ''],
      result: false,
      hold: 2400,
      caption: t(
        'The hundreds digit can’t be 0 (then it’s only 2 digits). The smallest non-zero card is 2.',
        'Angka ratusan tidak boleh 0 (nanti hanya 2 digit). Kartu bukan-nol terkecil adalah 2.',
      ),
    },
    {
      phase: 'tens',
      picked: [IDX_2, IDX_0],
      faded: [],
      placeLabels: { [IDX_2]: hundreds, [IDX_0]: tens },
      slots: ['2', '0', ''],
      result: false,
      hold: 2000,
      caption: t(
        'Now 0 may be used: put the smallest leftover digit, 0, in the tens place.',
        'Sekarang 0 boleh dipakai: letakkan digit sisa terkecil, 0, di tempat puluhan.',
      ),
    },
    {
      phase: 'units',
      picked: [IDX_2, IDX_0, IDX_5],
      faded: [IDX_6],
      placeLabels: { [IDX_2]: hundreds, [IDX_0]: tens, [IDX_5]: units },
      slots: ['2', '0', '5'],
      result: false,
      hold: 2000,
      caption: t(
        'Of the leftovers 6 and 5, the smaller, 5, goes in the units place.',
        'Dari sisa 6 dan 5, yang lebih kecil, 5, masuk ke tempat satuan.',
      ),
    },
    {
      phase: 'result',
      picked: [IDX_2, IDX_0, IDX_5],
      faded: [IDX_6],
      placeLabels: { [IDX_2]: hundreds, [IDX_0]: tens, [IDX_5]: units },
      slots: ['2', '0', '5'],
      result: true,
      hold: 0,
      caption: t(
        'The smallest 3-digit number is 205 — that’s option D.',
        'Bilangan 3 digit terkecil adalah 205 — itu pilihan D.',
      ),
    },
  ]

  return { answer: '205', steps, finalIndex: steps.length - 1 }
}
