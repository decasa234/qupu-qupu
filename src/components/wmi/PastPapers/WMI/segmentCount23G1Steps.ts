import type { Lang } from '../../concepts/explainers/makeTenSteps'
import {
  BOX_SQUARES,
  TRIANGLE_SQUARES,
  SQUARE_COUNTS,
  DIGIT_SQUARES,
  ANSWER,
} from './SegmentCount23G1Illustration'

// WMI-23F1A-Q17 (2023 Grade 1 Final) — fill-in answer = 3.
//
// "Draw each digit 0–9 on the 15-square grid (draw it, then erase, one at a
// time). In the end □ squares were drawn on 9 times and △ squares 7 times.
// Find □ − △."
//
// The animation teaches the method by *building the tally in front of the kid*:
//   1. State the goal.
//   2. Step through digits 0…9 — each beat lights that digit's squares so the
//      learner watches the per-square count climb (the figure shows each shape).
//   3. Reveal the heat overlay: the final draw-count written in every square.
//   4. Ring the squares drawn exactly 9 times → count them → □ = 5.
//   5. Ring the squares drawn exactly 7 times → count them → △ = 2.
//   6. Result: 5 − 2 = 3.
//
// Nothing is asserted: counts come straight from SQUARE_COUNTS / BOX_SQUARES /
// TRIANGLE_SQUARES exported by the illustration, so the storyboard can't drift.

export type SegPhase = 'goal' | 'digit' | 'heat' | 'box' | 'triangle' | 'result'

export interface SegmentStep {
  phase: SegPhase
  /** Light this digit's squares (digit phase only; null otherwise). */
  showDigit: number | null
  /** Reveal the per-square draw-count overlay. */
  heat: boolean
  /** Squares ringed for emphasis this beat (the □ or △ group, partial-to-full). */
  highlight: readonly number[]
  /** Colour key for the rings: blue (box, 9×) or amber (triangle, 7×). */
  ring: 'box' | 'triangle' | null
  caption: string
  result: boolean
  /** How long to hold this beat, in ms (winner holds = 0). */
  hold: number
}

export interface SegmentStoryboard {
  steps: SegmentStep[]
  finalIndex: number
  boxCount: number
  triangleCount: number
  answer: number
}

export function buildSegmentCount23G1Steps(lang: Lang): SegmentStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const boxCount = BOX_SQUARES.length // squares drawn 9× → □
  const triangleCount = TRIANGLE_SQUARES.length // squares drawn 7× → △
  const answer = ANSWER // boxCount − triangleCount = 3

  const steps: SegmentStep[] = []

  // 1) Goal.
  steps.push({
    phase: 'goal',
    showDigit: null,
    heat: false,
    highlight: [],
    ring: null,
    caption: t(
      'Draw each digit 0–9 on the 15 squares, one at a time. We keep a tally of how many times each square gets drawn on.',
      'Gambar tiap angka 0–9 di 15 kotak, satu per satu. Kita catat berapa kali tiap kotak tergambari.',
    ),
    result: false,
    hold: 2600,
  })

  // 2) Step through digits 0…9. Each beat lights that digit's squares; the
  //    caption names how many squares it adds a mark to.
  for (let d = 0; d <= 9; d++) {
    const lit = DIGIT_SQUARES[d].length
    steps.push({
      phase: 'digit',
      showDigit: d,
      heat: false,
      highlight: [],
      ring: null,
      caption: t(
        `Draw "${d}". It lights ${lit} squares — each of those squares gets one more mark.`,
        `Gambar "${d}". Menyala ${lit} kotak — tiap kotak itu dapat satu coretan lagi.`,
      ),
      result: false,
      hold: d === 0 ? 2000 : 1500,
    })
  }

  // 3) Reveal the per-square totals (heat overlay).
  steps.push({
    phase: 'heat',
    showDigit: null,
    heat: true,
    highlight: [],
    ring: null,
    caption: t(
      'After all ten digits, each square shows how many times it was drawn on.',
      'Setelah sepuluh angka, tiap kotak menunjukkan berapa kali ia tergambari.',
    ),
    result: false,
    hold: 2800,
  })

  // 4) Ring the squares drawn exactly 9 times, one by one → □.
  BOX_SQUARES.forEach((sq, i) => {
    const upto = BOX_SQUARES.slice(0, i + 1)
    steps.push({
      phase: 'box',
      showDigit: null,
      heat: true,
      highlight: upto,
      ring: 'box',
      caption: t(
        `Squares with a 9 — that is □. Found ${i + 1}.`,
        `Kotak berangka 9 — itulah □. Ketemu ${i + 1}.`,
      ),
      result: false,
      hold: i === BOX_SQUARES.length - 1 ? 2200 : 1300,
    })
  })
  // Box tally settles.
  steps.push({
    phase: 'box',
    showDigit: null,
    heat: true,
    highlight: BOX_SQUARES,
    ring: 'box',
    caption: t(
      `${boxCount} squares were drawn on 9 times, so □ = ${boxCount}.`,
      `${boxCount} kotak tergambari 9 kali, jadi □ = ${boxCount}.`,
    ),
    result: false,
    hold: 2400,
  })

  // 5) Ring the squares drawn exactly 7 times, one by one → △.
  TRIANGLE_SQUARES.forEach((sq, i) => {
    const upto = TRIANGLE_SQUARES.slice(0, i + 1)
    steps.push({
      phase: 'triangle',
      showDigit: null,
      heat: true,
      highlight: upto,
      ring: 'triangle',
      caption: t(
        `Squares with a 7 — that is △. Found ${i + 1}.`,
        `Kotak berangka 7 — itulah △. Ketemu ${i + 1}.`,
      ),
      result: false,
      hold: i === TRIANGLE_SQUARES.length - 1 ? 2200 : 1300,
    })
  })
  // Triangle tally settles.
  steps.push({
    phase: 'triangle',
    showDigit: null,
    heat: true,
    highlight: TRIANGLE_SQUARES,
    ring: 'triangle',
    caption: t(
      `${triangleCount} squares were drawn on 7 times, so △ = ${triangleCount}.`,
      `${triangleCount} kotak tergambari 7 kali, jadi △ = ${triangleCount}.`,
    ),
    result: false,
    hold: 2400,
  })

  // 6) Result: □ − △ = 5 − 2 = 3.
  steps.push({
    phase: 'result',
    showDigit: null,
    heat: true,
    highlight: [],
    ring: null,
    caption: t(
      `□ − △ = ${boxCount} − ${triangleCount} = ${answer}.`,
      `□ − △ = ${boxCount} − ${triangleCount} = ${answer}.`,
    ),
    result: true,
    hold: 0,
  })

  return {
    steps,
    finalIndex: steps.length - 1,
    boxCount,
    triangleCount,
    answer,
  }
}

// Re-export so the explainer reads counts from a single source of truth.
export { SQUARE_COUNTS, BOX_SQUARES, TRIANGLE_SQUARES }
