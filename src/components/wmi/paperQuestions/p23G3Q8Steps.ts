import type { Lang } from '../concepts/explainers/makeTenSteps'
import type { SideKey } from './P23G3Q8Illustration'
import { KNOWN_SUM, PERIMETER, X_VALUE } from './P23G3Q8Illustration'

export type PerimPhase = 'show' | 'sumKnown' | 'solve' | 'result'

export interface PerimStep {
  phase: PerimPhase
  highlight: SideKey[]
  revealX: boolean
  caption: string
  hold: number
  result: boolean
}

export interface PerimStoryboard {
  perimeter: number
  knownSum: number
  x: number
  answerLetter: string
  steps: PerimStep[]
  finalIndex: number
}

export function buildP23G3Q8Steps(lang: Lang, answerLetter: string): PerimStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PerimStep[] = [
    {
      phase: 'show',
      highlight: [],
      revealX: false,
      hold: 1700,
      result: false,
      caption: t(
        'Perimeter is the total of every side all the way around.',
        'Keliling adalah jumlah semua sisi mengelilingi bangun.',
      ),
    },
    {
      phase: 'sumKnown',
      highlight: ['bottom', 'leftSlope', 'valleyLeft', 'rightSlope'],
      revealX: false,
      hold: 2200,
      result: false,
      caption: t(
        `Add the four known sides: 32 + 15 + 3 + 21 = ${KNOWN_SUM} m.`,
        `Jumlahkan empat sisi yang diketahui: 32 + 15 + 3 + 21 = ${KNOWN_SUM} m.`,
      ),
    },
    {
      phase: 'solve',
      highlight: ['x'],
      revealX: false,
      hold: 2200,
      result: false,
      caption: t(
        `The whole way around is ${PERIMETER} m, so x fills the gap: x = ${PERIMETER} − ${KNOWN_SUM}.`,
        `Total keliling ${PERIMETER} m, jadi x mengisi sisanya: x = ${PERIMETER} − ${KNOWN_SUM}.`,
      ),
    },
    {
      phase: 'result',
      highlight: ['x'],
      revealX: true,
      hold: 0,
      result: true,
      caption: t(
        `x = ${PERIMETER} − ${KNOWN_SUM} = ${X_VALUE} m — answer ${answerLetter}. (Forget the 3 m valley side and you'd wrongly get 8.)`,
        `x = ${PERIMETER} − ${KNOWN_SUM} = ${X_VALUE} m — jawaban ${answerLetter}. (Lupa sisi lembah 3 m, keliru jadi 8.)`,
      ),
    },
  ]

  return { perimeter: PERIMETER, knownSum: KNOWN_SUM, x: X_VALUE, answerLetter, steps, finalIndex: steps.length - 1 }
}
