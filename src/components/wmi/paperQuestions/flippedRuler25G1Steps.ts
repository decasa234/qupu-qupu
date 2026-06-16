// WMI-25F1A-Q5 (2025 Grade 1 Final) — storyboard for the "flipped ruler" animation.
//
// Isaac measures a pencil on a ruler that is turned over, so its printed numbers
// run the "wrong way" (4..13 left -> right, every glyph mirror-flipped). The
// eraser end sits over mark 11 and the sharpened tip over mark 6.
//
// THE TRAP: read "11" as the length, because the eraser sits on the biggest
// number. THE METHOD: a length is the DISTANCE between the two ends, not a
// single reading. Mark both ends (11 and 6), take the gap 11 - 6 = 5 cm. The
// flip never matters, because flipping the ruler does not change a difference.
//
// Teaching walk, one idea per beat:
//   1. goal   — what we want: the pencil's length in cm.
//   2. trap   — the tempting wrong move: "the eraser is on 11, so 11 cm?" (reject).
//   3. eraser — mark the eraser end: it reads 11.
//   4. tip    — mark the tip end: it reads 6.
//   5. gap    — length is the GAP between the ends: 11 - 6.
//   6. result — 11 - 6 = 5 cm; the flip didn't matter, we measured a difference.
//
// Pure builder: (lang) => storyboard. No random, no dates, SSR-safe.

import type { Lang } from '../concepts/explainers/makeTenSteps'
import { ERASER_MARK, TIP_MARK, ANSWER } from './FlippedRuler25G1Illustration'

export type FlippedRulerPhase = 'goal' | 'trap' | 'eraser' | 'tip' | 'gap' | 'result'

export interface FlippedRulerStep {
  phase: FlippedRulerPhase
  /** Drop the two end markers + span bracket via the primitive's showMeasure. */
  showMeasure: boolean
  /** Light the eraser-end marker (mark 11) on this beat. */
  markEraser: boolean
  /** Light the tip-end marker (mark 6) on this beat. */
  markTip: boolean
  /** Subtraction line to show under the figure, e.g. "11 − 6 = 5"; '' to hide. */
  sum: string
  caption: string
  hold: number
  result: boolean
}

export interface FlippedRulerStoryboard {
  eraserMark: number
  tipMark: number
  answer: number
  steps: FlippedRulerStep[]
  finalIndex: number
}

export function buildFlippedRuler25G1Steps(lang: Lang): FlippedRulerStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: FlippedRulerStep[] = [
    {
      phase: 'goal',
      showMeasure: false,
      markEraser: false,
      markTip: false,
      sum: '',
      hold: 2000,
      result: false,
      caption: t(
        'How long is the pencil? The ruler is turned over — its numbers run backwards.',
        'Berapa panjang pensil? Penggaris terbalik — angkanya berurutan terbalik.',
      ),
    },
    {
      phase: 'trap',
      showMeasure: false,
      markEraser: true,
      markTip: false,
      sum: '',
      hold: 2100,
      result: false,
      caption: t(
        'Tempting: the eraser sits on 11, so 11 cm? No — a length is not one reading.',
        'Menggoda: penghapus di angka 11, jadi 11 cm? Bukan — panjang bukan satu angka.',
      ),
    },
    {
      phase: 'eraser',
      showMeasure: true,
      markEraser: true,
      markTip: false,
      sum: '',
      hold: 1800,
      result: false,
      caption: t(
        `Mark the eraser end. It lines up with ${ERASER_MARK}.`,
        `Tandai ujung penghapus. Tepat di angka ${ERASER_MARK}.`,
      ),
    },
    {
      phase: 'tip',
      showMeasure: true,
      markEraser: true,
      markTip: true,
      sum: '',
      hold: 1800,
      result: false,
      caption: t(
        `Mark the sharp tip. It lines up with ${TIP_MARK}.`,
        `Tandai ujung runcing. Tepat di angka ${TIP_MARK}.`,
      ),
    },
    {
      phase: 'gap',
      showMeasure: true,
      markEraser: true,
      markTip: true,
      sum: `${ERASER_MARK} − ${TIP_MARK}`,
      hold: 2000,
      result: false,
      caption: t(
        'The length is the GAP between the two ends — take the difference.',
        'Panjang adalah JARAK antara dua ujung — ambil selisihnya.',
      ),
    },
    {
      phase: 'result',
      showMeasure: true,
      markEraser: true,
      markTip: true,
      sum: `${ERASER_MARK} − ${TIP_MARK} = ${ANSWER}`,
      hold: 0,
      result: true,
      caption: t(
        `${ERASER_MARK} − ${TIP_MARK} = ${ANSWER} cm. Flipping doesn’t change a difference!`,
        `${ERASER_MARK} − ${TIP_MARK} = ${ANSWER} cm. Membalik tak mengubah selisih!`,
      ),
    },
  ]

  return {
    eraserMark: ERASER_MARK,
    tipMark: TIP_MARK,
    answer: ANSWER,
    steps,
    finalIndex: steps.length - 1,
  }
}
