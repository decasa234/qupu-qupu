// Storyboard for WMI-25F1A-Q13 (2025 Grade 1 Final) — "which shape continues
// the pattern at the '?'". The teaching idea is to SPLIT one tricky sequence
// into two simple ones that run in lock-step, then read each off independently:
//
//   • OUTLINE shape → repeats every 5:  triangle, circle, square, pentagon, diamond
//   • FACE mood     → repeats every 3:  smile, frown, frown
//
// The '?' sits at position 15 (0-based index 14). Counting through each short
// cycle lands the shape on DIAMOND (14 mod 5 = 4) and the mood on FROWN
// (14 mod 3 = 2) → a sad diamond → option A. We never assert the answer; we
// step through both cycles and let them meet.
//
// Pure (lang) => storyboard. No random/date/state — SSR-safe and deterministic.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import {
  seqCellAt,
  SHAPE_CYCLE,
  MOOD_CYCLE,
  type SeqShape,
  type SeqMood,
} from './ShapeSeq25G1Illustration'

// Which of the two cycles a beat is teaching (or the goal / final reveal).
export type ShapeSeqPhase = 'goal' | 'shape' | 'mood' | 'result'

export interface ShapeSeqStep {
  phase: ShapeSeqPhase
  /** Index into SHAPE_CYCLE to spotlight (0..4), or null. */
  shapeLit: number | null
  /** Index into MOOD_CYCLE to spotlight (0..2), or null. */
  moodLit: number | null
  /** The shape the '?' has been deduced to be, once known. */
  shapeAnswer: SeqShape | null
  /** The mood the '?' has been deduced to be, once known. */
  moodAnswer: SeqMood | null
  /** True on the final beat that draws the finished sad diamond + names A. */
  result: boolean
  caption: string
  hold: number
}

export interface ShapeSeqStoryboard {
  /** The drawn answer cell (diamond + frown). */
  answer: { shape: SeqShape; mood: SeqMood }
  /** The 1-based position of the '?' in the printed row. */
  qPos: number
  steps: ShapeSeqStep[]
  finalIndex: number
}

const SHAPE_WORD: Record<SeqShape, { en: string; id: string }> = {
  triangle: { en: 'triangle', id: 'segitiga' },
  circle: { en: 'circle', id: 'lingkaran' },
  square: { en: 'square', id: 'persegi' },
  pentagon: { en: 'pentagon', id: 'segilima' },
  diamond: { en: 'diamond', id: 'belah ketupat' },
}
const MOOD_WORD: Record<SeqMood, { en: string; id: string }> = {
  smile: { en: 'smile', id: 'tersenyum' },
  frown: { en: 'frown', id: 'cemberut' },
}

export function buildShapeSeq25G1Steps(lang: Lang): ShapeSeqStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const shapeName = (s: SeqShape) => SHAPE_WORD[s][lang === 'id' ? 'id' : 'en']
  const moodName = (m: SeqMood) => MOOD_WORD[m][lang === 'id' ? 'id' : 'en']

  // The '?' is the 15th cell (0-based index 14). Read each cycle off its own
  // period so the two never get tangled together.
  const qIndex = 14
  const qPos = qIndex + 1 // 15
  const answer = seqCellAt(qIndex) // { diamond, frown }

  const shapeLen = SHAPE_CYCLE.length // 5
  const moodLen = MOOD_CYCLE.length // 3
  const shapeStop = qIndex % shapeLen // 4 → diamond
  const moodStop = qIndex % moodLen // 2 → frown

  const steps: ShapeSeqStep[] = []

  // 1) Goal — one row, two patterns hiding inside it.
  steps.push({
    phase: 'goal',
    shapeLit: null,
    moodLit: null,
    shapeAnswer: null,
    moodAnswer: null,
    result: false,
    hold: 2000,
    caption: t(
      `What fills the "?" — shape #${qPos}? Two patterns hide here: the OUTLINE and the FACE. Solve them one at a time.`,
      `Apa isi "?" — bangun ke-${qPos}? Ada dua pola: GARIS LUAR dan WAJAH. Pecahkan satu per satu.`,
    ),
  })

  // 2) Walk the OUTLINE cycle (period 5). Light each shape in turn, counting up
  // to position 15 to show it lands on the diamond.
  steps.push({
    phase: 'shape',
    shapeLit: null,
    moodLit: null,
    shapeAnswer: null,
    moodAnswer: null,
    result: false,
    hold: 1900,
    caption: t(
      'First the OUTLINE. It repeats every 5: triangle, circle, square, pentagon, diamond — then back to the start.',
      'Pertama GARIS LUAR. Berulang tiap 5: segitiga, lingkaran, persegi, segilima, belah ketupat — lalu mengulang.',
    ),
  })
  SHAPE_CYCLE.forEach((shp, k) => {
    const last = k === shapeLen - 1
    steps.push({
      phase: 'shape',
      shapeLit: k,
      moodLit: null,
      shapeAnswer: null,
      moodAnswer: null,
      result: false,
      hold: last ? 1500 : 950,
      caption: t(
        `${shapeName(shp)} (step ${k + 1} of 5)${last ? ' — the cycle closes here.' : ''}`,
        `${shapeName(shp)} (langkah ${k + 1} dari 5)${last ? ' — di sini siklus tutup.' : ''}`,
      ),
    })
  })
  // Land the outline on the '?'.
  steps.push({
    phase: 'shape',
    shapeLit: shapeStop,
    moodLit: null,
    shapeAnswer: answer.shape,
    moodAnswer: null,
    result: false,
    hold: 2100,
    caption: t(
      `Count to ${qPos}: ${qPos} = 3 fives exactly, so it lands on step 5 of the cycle → the "?" shape is a ${shapeName(answer.shape)}.`,
      `Hitung sampai ${qPos}: ${qPos} = 3 lima pas, jadi mendarat di langkah 5 → bentuk "?" adalah ${shapeName(answer.shape)}.`,
    ),
  })

  // 3) Walk the FACE cycle (period 3). Keep the diamond known; now find the mood.
  steps.push({
    phase: 'mood',
    shapeLit: null,
    moodLit: null,
    shapeAnswer: answer.shape,
    moodAnswer: null,
    result: false,
    hold: 1900,
    caption: t(
      'Now the FACE. It repeats every 3: smile, frown, frown — then back to smile.',
      'Sekarang WAJAH. Berulang tiap 3: tersenyum, cemberut, cemberut — lalu tersenyum lagi.',
    ),
  })
  MOOD_CYCLE.forEach((md, k) => {
    const last = k === moodLen - 1
    steps.push({
      phase: 'mood',
      shapeLit: null,
      moodLit: k,
      shapeAnswer: answer.shape,
      moodAnswer: null,
      result: false,
      hold: last ? 1500 : 1000,
      caption: t(
        `${moodName(md)} (step ${k + 1} of 3)${last ? ' — the cycle closes here.' : ''}`,
        `${moodName(md)} (langkah ${k + 1} dari 3)${last ? ' — di sini siklus tutup.' : ''}`,
      ),
    })
  })
  // Land the mood on the '?'.
  steps.push({
    phase: 'mood',
    shapeLit: null,
    moodLit: moodStop,
    shapeAnswer: answer.shape,
    moodAnswer: answer.mood,
    result: false,
    hold: 2100,
    caption: t(
      `Count to ${qPos}: ${qPos} = 5 threes exactly, so it lands on step 3 of the cycle → the "?" face is a ${moodName(answer.mood)}.`,
      `Hitung sampai ${qPos}: ${qPos} = 5 tiga pas, jadi mendarat di langkah 3 → wajah "?" adalah ${moodName(answer.mood)}.`,
    ),
  })

  // 4) Result — put the two answers together and draw the finished cell. This is
  // the winning beat: last, hold 0.
  steps.push({
    phase: 'result',
    shapeLit: shapeStop,
    moodLit: moodStop,
    shapeAnswer: answer.shape,
    moodAnswer: answer.mood,
    result: true,
    hold: 0,
    caption: t(
      `${shapeName(answer.shape)} + ${moodName(answer.mood)} = a sad diamond. That is option A.`,
      `${shapeName(answer.shape)} + ${moodName(answer.mood)} = belah ketupat sedih. Itu pilihan A.`,
    ),
  })

  return { answer, qPos, steps, finalIndex: steps.length - 1 }
}
