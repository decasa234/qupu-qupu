import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { SHAPE_AREAS, TARGET_AREA } from './P23G3Q5Illustration'

export type AreaPhase = 'show' | 'measure' | 'result'

export interface AreaStep {
  phase: AreaPhase
  /** Shape currently being measured (ringed + others dimmed); null = show all. */
  focus: string | null
  /** Shapes whose "= N" area badge is visible. */
  measured: string[]
  /** Winner to ring green on the result beat. */
  winner: string | null
  caption: string
  hold: number
  result: boolean
}

export interface AreaStoryboard {
  target: number
  answerLetter: string
  steps: AreaStep[]
  finalIndex: number
}

export function buildP23G3Q5Steps(lang: Lang, answerLetter: string): AreaStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const order = ['A', 'B', 'C', 'D']
  const a = (l: string) => SHAPE_AREAS[l]

  const steps: AreaStep[] = [
    {
      phase: 'show',
      focus: null,
      measured: [],
      winner: null,
      hold: 1700,
      result: false,
      caption: t(
        'Each grid square is 1 cm², so I just count the squares each shape covers.',
        'Tiap kotak grid 1 cm², jadi aku tinggal menghitung kotak yang ditutupi tiap bangun.',
      ),
    },
    {
      phase: 'measure',
      focus: 'A',
      measured: ['A'],
      winner: null,
      hold: 2100,
      result: false,
      caption: t(
        `Shape A: a 4×4 block (16) with a triangle cut out (½·4·2 = 4) → 16 − 4 = ${a('A')} cm².`,
        `Bangun A: blok 4×4 (16) dipotong segitiga (½·4·2 = 4) → 16 − 4 = ${a('A')} cm².`,
      ),
    },
    {
      phase: 'measure',
      focus: 'B',
      measured: ['A', 'B'],
      winner: null,
      hold: 1900,
      result: false,
      caption: t(`Shape B (the cross) covers only ${a('B')} cm² — too small.`, `Bangun B (salib) hanya ${a('B')} cm² — terlalu kecil.`),
    },
    {
      phase: 'measure',
      focus: 'C',
      measured: ['A', 'B', 'C'],
      winner: null,
      hold: 1900,
      result: false,
      caption: t(`Shape C: trapezoid (3 + 4)/2 · 4 = ${a('C')} cm² — too big.`, `Bangun C: trapesium (3 + 4)/2 · 4 = ${a('C')} cm² — terlalu besar.`),
    },
    {
      phase: 'measure',
      focus: 'D',
      measured: order,
      winner: null,
      hold: 1900,
      result: false,
      caption: t(`Shape D: rectangle 5 × 3 = ${a('D')} cm² — too big.`, `Bangun D: persegi panjang 5 × 3 = ${a('D')} cm² — terlalu besar.`),
    },
    {
      phase: 'result',
      focus: null,
      measured: order,
      winner: answerLetter,
      hold: 0,
      result: true,
      caption: t(
        `Only shape ${answerLetter} totals exactly ${TARGET_AREA} cm² — answer ${answerLetter}.`,
        `Hanya bangun ${answerLetter} yang totalnya tepat ${TARGET_AREA} cm² — jawaban ${answerLetter}.`,
      ),
    },
  ]

  return { target: TARGET_AREA, answerLetter, steps, finalIndex: steps.length - 1 }
}
