// Storyboard for SEAMO-21-B-Q3 — shaded border frame.
// Answer: E (shaded area = 26 m², not listed in A–D).
//
// Method: outer area − inner area = shaded area.
//   outer area = 9 × 6 = 54 m²
//   inner area = (9−2) × (6−2) = 7 × 4 = 28 m²
//   shaded area = 54 − 28 = 26 m²  → choice E (None of the above)

export type Lang = 'en' | 'id'

export type BorderedRectPhase = 'problem' | 'outer' | 'inner' | 'shaded'

export interface BorderedRectStep {
  /** Which region to highlight in the illustration */
  phase: BorderedRectPhase
  /** Arithmetic expression shown in the chip */
  equation: string
  /** True on the final winner beat */
  result: boolean
  /** Caption text */
  caption: string
  /** Hold in ms; 0 = final beat (no auto-advance) */
  hold: number
}

export interface BorderedRectStoryboard {
  steps: BorderedRectStep[]
  finalIndex: number
  answer: number
  answerChoice: string
}

const OUTER_W   = 9
const OUTER_H   = 6
const BORDER    = 1
const INNER_W   = OUTER_W - 2 * BORDER   // 7
const INNER_H   = OUTER_H - 2 * BORDER   // 4
const OUTER_AREA = OUTER_W * OUTER_H      // 54
const INNER_AREA = INNER_W * INNER_H      // 28
const SHADED     = OUTER_AREA - INNER_AREA // 26

export function buildBorderedRectSteps(lang: Lang): BorderedRectStoryboard {
  const t = (en: string, id: string): string => (lang === 'id' ? id : en)

  const steps: BorderedRectStep[] = []

  // Beat 0 — intro: show the problem.
  steps.push({
    phase: 'problem',
    equation: '',
    result: false,
    hold: 1700,
    caption: t(
      'Find the area of the shaded border region.',
      'Cari luas daerah tepi yang diarsir.',
    ),
  })

  // Beat 1 — highlight outer rectangle.
  steps.push({
    phase: 'outer',
    equation: `${OUTER_W} × ${OUTER_H} = ${OUTER_AREA} m²`,
    result: false,
    hold: 2000,
    caption: t(
      `Outer rectangle area = ${OUTER_W} × ${OUTER_H} = ${OUTER_AREA} m².`,
      `Luas persegi panjang luar = ${OUTER_W} × ${OUTER_H} = ${OUTER_AREA} m².`,
    ),
  })

  // Beat 2 — highlight inner white rectangle.
  steps.push({
    phase: 'inner',
    equation: `(${OUTER_W}−2) × (${OUTER_H}−2) = ${INNER_W} × ${INNER_H} = ${INNER_AREA} m²`,
    result: false,
    hold: 2400,
    caption: t(
      `Border of ${BORDER} m on each side: inner = (${OUTER_W}−2) × (${OUTER_H}−2) = ${INNER_W} × ${INNER_H} = ${INNER_AREA} m².`,
      `Tepi ${BORDER} m di tiap sisi: dalam = (${OUTER_W}−2) × (${OUTER_H}−2) = ${INNER_W} × ${INNER_H} = ${INNER_AREA} m².`,
    ),
  })

  // Beat 3 — highlight shaded region, show subtraction.
  steps.push({
    phase: 'shaded',
    equation: `${OUTER_AREA} − ${INNER_AREA} = ${SHADED} m²`,
    result: false,
    hold: 2000,
    caption: t(
      `Shaded = ${OUTER_AREA} − ${INNER_AREA} = ${SHADED} m².`,
      `Diarsir = ${OUTER_AREA} − ${INNER_AREA} = ${SHADED} m².`,
    ),
  })

  // Beat 4 (final) — check choices; 26 is not listed → E.
  steps.push({
    phase: 'shaded',
    equation: `${SHADED} m² → E`,
    result: true,
    hold: 0,
    caption: t(
      `${SHADED} m² is not in choices A–D (17, 19, 35, 54) → answer is E.`,
      `${SHADED} m² tidak ada di pilihan A–D (17, 19, 35, 54) → jawaban E.`,
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: SHADED, answerChoice: 'E' }
}
