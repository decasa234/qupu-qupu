// WMI-20P2A-Q7 (2020 Grade 2 Semifinal) — storyboard for the "pencil on a ruler"
// animation.
//
// A pencil lies on a ruler; its eraser end sits over mark 8 and its sharpened
// tip over mark 14.
//
// THE TRAP: read "14" as the length, because the tip reaches the biggest number.
// THE METHOD: a length is the DISTANCE between the two ends, not a single
// reading. Mark both ends (8 and 14), take the gap 14 - 8 = 6 cm — because the
// pencil does not start at 0.
//
// Teaching walk, one idea per beat:
//   1. goal    — what we want: the pencil's length in cm.
//   2. trap    — the tempting wrong move: "the tip reaches 14, so 14 cm?" (reject).
//   3. eraser  — mark the eraser end: it reads 8.
//   4. tip     — mark the tip end: it reads 14.
//   5. gap     — length is the GAP between the ends: 14 - 8.
//   6. result  — 14 - 8 = 6 cm.
//
// Pure builder: (lang) => storyboard. No random, no dates, SSR-safe.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { ERASER_MARK, TIP_MARK, ANSWER } from './P20G2Q7Illustration'

export type PencilRulerPhase = 'goal' | 'trap' | 'eraser' | 'tip' | 'gap' | 'result'

export interface PencilRulerStep {
  phase: PencilRulerPhase
  /** Drop the two end markers + span bracket via the primitive's showMeasure. */
  showMeasure: boolean
  /** Light the eraser-end marker (mark 8) on this beat. */
  markEraser: boolean
  /** Light the tip-end marker (mark 14) on this beat. */
  markTip: boolean
  /** Subtraction line to show under the figure, e.g. "14 − 8 = 6"; '' to hide. */
  sum: string
  caption: string
  hold: number
  result: boolean
}

export interface PencilRulerStoryboard {
  eraserMark: number
  tipMark: number
  answer: number
  steps: PencilRulerStep[]
  finalIndex: number
}

export function buildP20G2Q7Steps(lang: Lang): PencilRulerStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PencilRulerStep[] = [
    {
      phase: 'goal',
      showMeasure: false,
      markEraser: false,
      markTip: false,
      sum: '',
      hold: 2000,
      result: false,
      caption: t(
        'How long is the pencil? Read where each end lands on the ruler.',
        'Berapa panjang pensil? Lihat di angka berapa tiap ujungnya.',
      ),
    },
    {
      phase: 'trap',
      showMeasure: false,
      markEraser: false,
      markTip: true,
      sum: '',
      hold: 2100,
      result: false,
      caption: t(
        'Tempting: the tip reaches 14, so 14 cm? No — the pencil does not start at 0.',
        'Menggoda: ujungnya sampai 14, jadi 14 cm? Bukan — pensil tak mulai dari 0.',
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
      sum: `${TIP_MARK} − ${ERASER_MARK}`,
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
      sum: `${TIP_MARK} − ${ERASER_MARK} = ${ANSWER}`,
      hold: 0,
      result: true,
      caption: t(
        `${TIP_MARK} − ${ERASER_MARK} = ${ANSWER} cm — answer C.`,
        `${TIP_MARK} − ${ERASER_MARK} = ${ANSWER} cm — jawaban C.`,
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
