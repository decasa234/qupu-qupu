// Storyboard for the WMI-19P3A-Q11 explainer (block-pattern matrix).
//
// The four answer choices were printed as images in the original, so the
// explainer derives the count rule and names the correct option letter (D).
//
// Idea per beat:
//   1. Look across each row — the number of black squares changes by a rule.
//   2. Row 1: 5 → 4 → 3 (each step drops one square).
//   3. Row 2: 5 → 4 → 3 (same drop of one).
//   4. Row 3: 6 → 5 → ?, so "?" must have 4 squares.
//   5. The 4-square figure is choice D — answer D.

import type { Lang } from '../concepts/explainers/makeTenSteps'
import { Q11_COUNTS, Q11_ANSWER_COUNT } from './P19G3Q11Illustration'

export type Q11Phase = 'show' | 'row1' | 'row2' | 'row3' | 'result'

export interface Q11Step {
  phase: Q11Phase
  /** Panel index to highlight (0..8), or null. */
  highlightPanel: number | null
  /** Show the per-panel count badges. */
  showCounts: boolean
  /** Reveal the answer panel (4 blocks). */
  revealAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q11Storyboard {
  answerCount: number
  steps: Q11Step[]
  finalIndex: number
}

export function buildP19G3Q11Steps(lang: Lang): Q11Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const [r1a, r1b, r1c, r2a, r2b, r2c, r3a, r3b] = Q11_COUNTS

  const steps: Q11Step[] = [
    {
      phase: 'show',
      highlightPanel: null,
      showCounts: false,
      revealAnswer: false,
      hold: 1800,
      result: false,
      caption: t(
        'Look across each row: count the black squares in every panel.',
        'Perhatikan tiap baris: hitung kotak hitam di setiap panel.',
      ),
    },
    {
      phase: 'row1',
      highlightPanel: 2,
      showCounts: true,
      revealAnswer: false,
      hold: 2100,
      result: false,
      caption: t(
        `Row 1: ${r1a} → ${r1b} → ${r1c}. Each step drops one square.`,
        `Baris 1: ${r1a} → ${r1b} → ${r1c}. Setiap langkah berkurang satu kotak.`,
      ),
    },
    {
      phase: 'row2',
      highlightPanel: 5,
      showCounts: true,
      revealAnswer: false,
      hold: 2100,
      result: false,
      caption: t(
        `Row 2: ${r2a} → ${r2b} → ${r2c}. Same rule — minus one each time.`,
        `Baris 2: ${r2a} → ${r2b} → ${r2c}. Aturan sama — berkurang satu tiap kali.`,
      ),
    },
    {
      phase: 'row3',
      highlightPanel: 8,
      showCounts: true,
      revealAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        `Row 3: ${r3a} → ${r3b} → ?. So "?" has ${r3b} − 1 = ${Q11_ANSWER_COUNT} squares.`,
        `Baris 3: ${r3a} → ${r3b} → ?. Jadi "?" punya ${r3b} − 1 = ${Q11_ANSWER_COUNT} kotak.`,
      ),
    },
    {
      phase: 'result',
      highlightPanel: 8,
      showCounts: false,
      revealAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        `The ${Q11_ANSWER_COUNT}-square figure is choice D — answer D.`,
        `Gambar dengan ${Q11_ANSWER_COUNT} kotak adalah pilihan D — jawaban D.`,
      ),
    },
  ]

  return { answerCount: Q11_ANSWER_COUNT, steps, finalIndex: steps.length - 1 }
}
