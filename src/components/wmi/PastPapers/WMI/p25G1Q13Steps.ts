// Storyboard for WMI-25P1A-Q13 — minimum squares to add to make a big square.
// Beat-by-beat: the smallest enclosing square is 4×4 = 16; the figure has 7;
// so add 16 − 7 = 9 (answer E).
import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { Q13_BIG_TOTAL, Q13_GRID_SIDE, Q13_TO_ADD, Q13_USED } from './P25G1Q13Illustration'

export interface Q13Step {
  showBigOutline: boolean
  showGhosts: boolean
  numberFilled: boolean
  numberGhosts: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q13Storyboard {
  used: number
  bigTotal: number
  toAdd: number
  answer: number
  steps: Q13Step[]
  finalIndex: number
}

export function buildP25G1Q13Steps(lang: Lang): Q13Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q13Step[] = [
    {
      showBigOutline: false,
      showGhosts: false,
      numberFilled: true,
      numberGhosts: false,
      hold: 2000,
      result: false,
      caption: t(`Count the squares already there: ${Q13_USED}.`, `Hitung persegi yang sudah ada: ${Q13_USED}.`),
    },
    {
      showBigOutline: true,
      showGhosts: false,
      numberFilled: false,
      numberGhosts: false,
      hold: 2000,
      result: false,
      caption: t(
        `The shape is 4 wide and 3 tall, so the smallest big square is ${Q13_GRID_SIDE}×${Q13_GRID_SIDE}.`,
        `Bentuknya 4 lebar dan 3 tinggi, jadi persegi besar terkecil adalah ${Q13_GRID_SIDE}×${Q13_GRID_SIDE}.`,
      ),
    },
    {
      showBigOutline: true,
      showGhosts: false,
      numberFilled: false,
      numberGhosts: false,
      hold: 1900,
      result: false,
      caption: t(
        `A ${Q13_GRID_SIDE}×${Q13_GRID_SIDE} square holds ${Q13_GRID_SIDE}×${Q13_GRID_SIDE} = ${Q13_BIG_TOTAL} small squares.`,
        `Persegi ${Q13_GRID_SIDE}×${Q13_GRID_SIDE} memuat ${Q13_GRID_SIDE}×${Q13_GRID_SIDE} = ${Q13_BIG_TOTAL} persegi kecil.`,
      ),
    },
    {
      showBigOutline: true,
      showGhosts: true,
      numberFilled: false,
      numberGhosts: true,
      hold: 2100,
      result: false,
      caption: t('Fill the empty cells to complete the big square.', 'Isi sel kosong untuk melengkapi persegi besar.'),
    },
    {
      showBigOutline: true,
      showGhosts: true,
      numberFilled: false,
      numberGhosts: true,
      hold: 0,
      result: true,
      caption: t(
        `${Q13_BIG_TOTAL} − ${Q13_USED} = ${Q13_TO_ADD} squares to add — answer E.`,
        `${Q13_BIG_TOTAL} − ${Q13_USED} = ${Q13_TO_ADD} persegi ditambahkan — jawaban E.`,
      ),
    },
  ]

  return {
    used: Q13_USED,
    bigTotal: Q13_BIG_TOTAL,
    toAdd: Q13_TO_ADD,
    answer: Q13_TO_ADD,
    steps,
    finalIndex: steps.length - 1,
  }
}
