// SEAMO-22-B-Q3 (2022 Contest B) — pentagon ABCDE, ∠A = 90°, find ∠B+∠C+∠D+∠E.
//
// APPROACH (polygon interior-angle sum):
//   Sum of interior angles of a pentagon = (5 − 2) × 180° = 3 × 180° = 540°.
//   ∠A + ∠B + ∠C + ∠D + ∠E = 540°.
//   ∠B + ∠C + ∠D + ∠E = 540° − ∠A = 540° − 90° = 450°.
//   Answer: E (450°).
//
// TRAP: C (420°) — using 360° − ∠A instead of 540° − ∠A.
//
// Pure builder: (lang) => storyboard. No Math.random, no Date — SSR-safe.

import type { HighlightAngle } from './Pentagon22B3Illustration'

export type Lang = 'en' | 'id'

export const ANSWER_VALUE = 450
export const ANSWER_CHOICE = 'E'

export interface PentagonStep {
  /** Which vertex to spotlight this beat. */
  highlight: HighlightAngle
  /** Show the 90° label on A. */
  showALabel: boolean
  /** Optional sum label inside the pentagon (answer beat). */
  sumLabel?: string
  /** Angles accounted for so far. */
  accounted: string[]
  /** True only on the final answer beat. */
  result: boolean
  caption: string
  hold: number
}

export interface PentagonStoryboard {
  steps: PentagonStep[]
  finalIndex: number
}

export function buildPentagon22B3Steps(lang: Lang): PentagonStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PentagonStep[] = [
    // 1. Introduce the figure.
    {
      highlight: null,
      showALabel: false,
      accounted: [],
      result: false,
      hold: 2800,
      caption: t(
        'We have pentagon ABCDE with ∠A = 90°. We need ∠B + ∠C + ∠D + ∠E.',
        'Kita punya segi-lima ABCDE dengan ∠A = 90°. Cari ∠B + ∠C + ∠D + ∠E.',
      ),
    },
    // 2. Pentagon angle-sum formula.
    {
      highlight: null,
      showALabel: false,
      accounted: [],
      result: false,
      hold: 3000,
      caption: t(
        'Key fact: the sum of interior angles of any pentagon = (5 − 2) × 180° = 540°.',
        'Fakta penting: jumlah sudut dalam segi-lima = (5 − 2) × 180° = 540°.',
      ),
    },
    // 3. Spotlight A (the given 90°).
    {
      highlight: 'A',
      showALabel: true,
      accounted: ['∠A = 90°'],
      result: false,
      hold: 2600,
      caption: t(
        '∠A is the right angle: 90°. All five angles together must total 540°.',
        '∠A adalah sudut siku-siku: 90°. Kelima sudut bersama-sama harus berjumlah 540°.',
      ),
    },
    // 4. Subtract.
    {
      highlight: null,
      showALabel: true,
      accounted: ['∠A = 90°'],
      result: false,
      hold: 2800,
      caption: t(
        'So ∠B + ∠C + ∠D + ∠E = 540° − ∠A = 540° − 90°.',
        'Jadi ∠B + ∠C + ∠D + ∠E = 540° − ∠A = 540° − 90°.',
      ),
    },
    // 5. Answer.
    {
      highlight: null,
      showALabel: true,
      sumLabel: '= 450°',
      accounted: ['∠A = 90°'],
      result: true,
      hold: 0,
      caption: t(
        '540° − 90° = 450°. Answer: E (450°).',
        '540° − 90° = 450°. Jawaban: E (450°).',
      ),
    },
  ]

  return {
    steps,
    finalIndex: steps.length - 1,
  }
}
