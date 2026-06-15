import type { Lang } from '../concepts/explainers/makeTenSteps'
import { Q24_ANSWER, SHADED_FRAMES, GRID_N } from './P25G1Q24Illustration'

// Deterministic storyboard for WMI-25P1A-Q24 (change-of-pattern → rotation).
//
// The four shown frames are one shaded L-tromino inside a 3x3 grid, turning a
// quarter-turn CLOCKWISE each step. The "?" is the next quarter-turn. Method,
// one idea per beat:
//   1. Show the four frames + the "?".
//   2. Notice the shaded shape keeps its L form — it does not grow or shrink.
//   3. Watch one corner: it steps a quarter-turn clockwise each time.
//   4. Apply one more quarter-turn to predict the "?".
//   5. That matches option D.

export type Q24Phase = 'show' | 'sameShape' | 'rotate' | 'predict' | 'result'

export interface Q24Step {
  phase: Q24Phase
  /** Highlight index in the sequence (0..3) to focus, or null. */
  focus: number | null
  /** Reveal the predicted next frame in the "?" slot. */
  revealNext: boolean
  /** Light up the matching option (the answer letter) in the option strip. */
  highlightOption: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q24Storyboard {
  answer: string
  gridN: number
  frames: number
  steps: Q24Step[]
  finalIndex: number
}

export function buildP25G1Q24Steps(lang: Lang): Q24Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q24Step[] = [
    {
      phase: 'show',
      focus: null,
      revealNext: false,
      highlightOption: false,
      hold: 1900,
      result: false,
      caption: t(
        'Watch how the shaded shape changes, then continue it.',
        'Amati bagaimana bentuk yang diarsir berubah, lalu lanjutkan.',
      ),
    },
    {
      phase: 'sameShape',
      focus: 0,
      revealNext: false,
      highlightOption: false,
      hold: 2100,
      result: false,
      caption: t(
        'It is always the same L of 3 cells — it never grows or shrinks.',
        'Selalu bentuk L dari 3 sel yang sama — tidak membesar atau mengecil.',
      ),
    },
    {
      phase: 'rotate',
      focus: 1,
      revealNext: false,
      highlightOption: false,
      hold: 2300,
      result: false,
      caption: t(
        'Each step it turns a quarter-turn clockwise.',
        'Tiap langkah berputar seperempat putaran searah jarum jam.',
      ),
    },
    {
      phase: 'predict',
      focus: 3,
      revealNext: true,
      highlightOption: false,
      hold: 2200,
      result: false,
      caption: t(
        'One more quarter-turn clockwise gives the "?".',
        'Seperempat putaran lagi searah jarum jam memberi "?".',
      ),
    },
    {
      phase: 'result',
      focus: null,
      revealNext: true,
      highlightOption: true,
      hold: 0,
      result: true,
      caption: t(
        `That turned L matches option ${Q24_ANSWER}.`,
        `L yang berputar itu cocok dengan opsi ${Q24_ANSWER}.`,
      ),
    },
  ]

  return {
    answer: Q24_ANSWER,
    gridN: GRID_N,
    frames: SHADED_FRAMES.length,
    steps,
    finalIndex: steps.length - 1,
  }
}
