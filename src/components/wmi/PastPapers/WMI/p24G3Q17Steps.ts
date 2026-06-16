import type { Lang } from '../../concepts/explainers/makeTenSteps'
import {
  ANSWER_MAX,
  MAX_RIGHT_ANGLES_PER_SQUARE,
  ONE_SQUARE_ANGLES,
  SQUARES_TO_DRAW,
  TWO_SQUARES_MAX,
} from './P24G3Q17Illustration'

export type Q17Phase = 'one' | 'two' | 'rate' | 'four' | 'result'

export interface Q17Step {
  phase: Q17Phase
  /** How many squares to draw in the explainer's scene (1..4). */
  squares: number
  /** The running number to display in the count badge (or null to hide). */
  badge: number | null
  caption: string
  hold: number
  result: boolean
}

export interface Q17Storyboard {
  oneAngles: number
  twoMax: number
  perSquare: number
  squares: number
  answerMax: number
  answer: string
  steps: Q17Step[]
  finalIndex: number
}

export function buildP24G3Q17Steps(lang: Lang): Q17Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q17Step[] = [
    {
      phase: 'one',
      squares: 1,
      badge: ONE_SQUARE_ANGLES,
      hold: 1800,
      result: false,
      caption: t(
        `One square has ${ONE_SQUARE_ANGLES} corners = ${ONE_SQUARE_ANGLES} right angles.`,
        `Satu persegi punya ${ONE_SQUARE_ANGLES} sudut = ${ONE_SQUARE_ANGLES} sudut siku-siku.`,
      ),
    },
    {
      phase: 'two',
      squares: 2,
      badge: TWO_SQUARES_MAX,
      hold: 2200,
      result: false,
      caption: t(
        `Two squares can cross to make at most ${TWO_SQUARES_MAX} right angles (corners + crossings).`,
        `Dua persegi yang berpotongan paling banyak ${TWO_SQUARES_MAX} sudut siku-siku (sudut + perpotongan).`,
      ),
    },
    {
      phase: 'rate',
      squares: 2,
      badge: MAX_RIGHT_ANGLES_PER_SQUARE,
      hold: 2100,
      result: false,
      caption: t(
        `${TWO_SQUARES_MAX} for 2 squares = ${MAX_RIGHT_ANGLES_PER_SQUARE} per square at the most.`,
        `${TWO_SQUARES_MAX} untuk 2 persegi = ${MAX_RIGHT_ANGLES_PER_SQUARE} per persegi paling banyak.`,
      ),
    },
    {
      phase: 'four',
      squares: 4,
      badge: null,
      hold: 2000,
      result: false,
      caption: t(
        `Draw ${SQUARES_TO_DRAW} squares so every pair crosses: ${SQUARES_TO_DRAW} x ${MAX_RIGHT_ANGLES_PER_SQUARE}.`,
        `Gambar ${SQUARES_TO_DRAW} persegi agar tiap pasang berpotongan: ${SQUARES_TO_DRAW} x ${MAX_RIGHT_ANGLES_PER_SQUARE}.`,
      ),
    },
    {
      phase: 'result',
      squares: 4,
      badge: ANSWER_MAX,
      hold: 0,
      result: true,
      caption: t(
        `${SQUARES_TO_DRAW} x ${MAX_RIGHT_ANGLES_PER_SQUARE} = ${ANSWER_MAX} right angles - answer E.`,
        `${SQUARES_TO_DRAW} x ${MAX_RIGHT_ANGLES_PER_SQUARE} = ${ANSWER_MAX} sudut siku-siku - jawaban E.`,
      ),
    },
  ]

  return {
    oneAngles: ONE_SQUARE_ANGLES,
    twoMax: TWO_SQUARES_MAX,
    perSquare: MAX_RIGHT_ANGLES_PER_SQUARE,
    squares: SQUARES_TO_DRAW,
    answerMax: ANSWER_MAX,
    answer: 'E',
    steps,
    finalIndex: steps.length - 1,
  }
}
