// Storyboard for the WMI-19P3A-Q5 explainer (repeating-symbol pattern).
//
// Idea per beat:
//   1. Show the strip — symbols repeat in a fixed loop.
//   2. Mark the loop: ○ × △ △ (period 4).
//   3. Count along the loop to the "?" box (box 11 → 3rd slot of the loop).
//   4. The 3rd slot of the loop is △.
//   5. Result: "?" = △ — answer C.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { LOOP, Q5_QMARK_INDEX } from './P19G3Q5Illustration'

export type Q5Phase = 'show' | 'loop' | 'count' | 'slot' | 'result'

export interface Q5Step {
  phase: Q5Phase
  /** Box index to highlight, or null. */
  highlightIndex: number | null
  /** Reveal the answer glyph at the "?" box on the final beat. */
  reveal: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q5Storyboard {
  /** 1-based position of the "?" box in the strip. */
  qPosition: number
  /** 1-based slot of the "?" within the loop. */
  loopSlot: number
  steps: Q5Step[]
  finalIndex: number
}

export function buildP19G3Q5Steps(lang: Lang): Q5Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const period = LOOP.length // 4
  const qPosition = Q5_QMARK_INDEX + 1 // 11
  const loopSlot = (Q5_QMARK_INDEX % period) + 1 // 3

  const steps: Q5Step[] = [
    {
      phase: 'show',
      highlightIndex: null,
      reveal: false,
      hold: 1700,
      result: false,
      caption: t(
        'The symbols repeat in a fixed loop, again and again.',
        'Simbolnya berulang dalam satu putaran tetap, lagi dan lagi.',
      ),
    },
    {
      phase: 'loop',
      highlightIndex: null,
      reveal: false,
      hold: 2000,
      result: false,
      caption: t(
        `One loop is ○ × △ △ — that is ${period} boxes long.`,
        `Satu putaran adalah ○ × △ △ — panjangnya ${period} kotak.`,
      ),
    },
    {
      phase: 'count',
      highlightIndex: Q5_QMARK_INDEX,
      reveal: false,
      hold: 2100,
      result: false,
      caption: t(
        `The "?" is box ${qPosition}. Two full loops fill boxes 1–8, so box ${qPosition} starts loop 3.`,
        `"?" ada di kotak ${qPosition}. Dua putaran penuh mengisi kotak 1–8, jadi kotak ${qPosition} memulai putaran ke-3.`,
      ),
    },
    {
      phase: 'slot',
      highlightIndex: Q5_QMARK_INDEX,
      reveal: false,
      hold: 2000,
      result: false,
      caption: t(
        `Box ${qPosition} is slot ${loopSlot} of the loop: ○(1) ×(2) △(${loopSlot}).`,
        `Kotak ${qPosition} adalah slot ke-${loopSlot} dalam putaran: ○(1) ×(2) △(${loopSlot}).`,
      ),
    },
    {
      phase: 'result',
      highlightIndex: Q5_QMARK_INDEX,
      reveal: true,
      hold: 0,
      result: true,
      caption: t(
        'Slot 3 of the loop is △, so "?" = △ — answer C.',
        'Slot ke-3 putaran adalah △, jadi "?" = △ — jawaban C.',
      ),
    },
  ]

  return { qPosition, loopSlot, steps, finalIndex: steps.length - 1 }
}
