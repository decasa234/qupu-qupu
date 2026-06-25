import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { CYCLE, QUESTION_POS } from './PatternHK23P1SFQ16Illustration'

// Steps for HKIMO-23-P1SF-Q16 — 6-shape repeating pattern; find the ? at position 7.
// 4 beats:
//   1. Observe: the shapes repeat in a set order.
//   2. Identify the cycle of 6 shapes with a bracket.
//   3. Calculate position 7 = cycle position 1 = square.
//   4. Reveal: the missing shape is a square.

const SHAPE_NAMES_EN: Record<string, string> = {
  'square': 'square (□)',
  'triangle': 'triangle (△)',
  'circle': 'circle (○)',
  'filled-circle': 'filled circle (●)',
}
const SHAPE_NAMES_ID: Record<string, string> = {
  'square': 'persegi (□)',
  'triangle': 'segitiga (△)',
  'circle': 'lingkaran (○)',
  'filled-circle': 'lingkaran hitam (●)',
}

const CYCLE_EN = CYCLE.map((s) => SHAPE_NAMES_EN[s]).join(', ')
const CYCLE_ID = CYCLE.map((s) => SHAPE_NAMES_ID[s]).join(', ')

export interface HK23Q16Step {
  /** Show the cycle bracket under positions 1–6. */
  showBracket: boolean
  /** 1-based positions to highlight. */
  highlightPos: number[]
  /** Whether to reveal the answer shape in the ? slot. */
  revealAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface HK23Q16Storyboard {
  steps: HK23Q16Step[]
  finalIndex: number
}

export function buildPatternHK23P1SFQ16Steps(lang: Lang): HK23Q16Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const cycleLen = CYCLE.length
  const answerShape = CYCLE[(QUESTION_POS - 1) % cycleLen]
  const answerEN = SHAPE_NAMES_EN[answerShape]
  const answerID = SHAPE_NAMES_ID[answerShape]

  const steps: HK23Q16Step[] = [
    // Beat 1: notice the repeating structure
    {
      showBracket: false,
      highlightPos: [],
      revealAnswer: false,
      hold: 2000,
      result: false,
      caption: t(
        `The shapes form a repeating pattern. Look for the repeating unit!`,
        `Bentuk-bentuk membentuk pola berulang. Cari unit yang berulang!`,
      ),
    },
    // Beat 2: bracket and label the 6-item cycle
    {
      showBracket: true,
      highlightPos: [1, 2, 3, 4, 5, 6],
      revealAnswer: false,
      hold: 2600,
      result: false,
      caption: t(
        `The cycle repeats every 6 shapes: ${CYCLE_EN}.`,
        `Pola berulang setiap 6 bentuk: ${CYCLE_ID}.`,
      ),
    },
    // Beat 3: locate position 7 in the cycle
    {
      showBracket: true,
      highlightPos: [1, QUESTION_POS],
      revealAnswer: false,
      hold: 2600,
      result: false,
      caption: t(
        `Position 7 = position 1 of the next cycle (7 − 6 = 1). Position 1 is a ${answerEN}!`,
        `Posisi ke-7 = posisi ke-1 dari siklus berikutnya (7 − 6 = 1). Posisi ke-1 adalah ${answerID}!`,
      ),
    },
    // Beat 4: reveal the answer
    {
      showBracket: true,
      highlightPos: [QUESTION_POS],
      revealAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        `The missing figure is a ${answerEN}. Answer: square.`,
        `Gambar yang hilang adalah ${answerID}. Jawaban: persegi.`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
