// IKMC-19-PE-Q19 — "A figure has been cut into 3 pieces. Which figure could
// have been cut?" (answer A = heart shape)
//
// Animation strategy: assemble the 3 pieces step by step → they form a heart →
// compare to option A → answer is A.
//
// Beats:
//   0. Show all 3 pieces. "Look at the 3 cut pieces. Which shape do they form?"
//   1. Highlight piece 1 + piece 2 fitting together (left lobe + right lobe → top of heart).
//   2. Add piece 3 (triangle → bottom point of heart). Now we see a heart outline.
//   3. Full heart assembled. "The 3 pieces form a heart shape!"
//   4. Result. "The answer is A — heart shape."

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type AssemblePhase =
  | 'pieces'      // beat 0: show the 3 separate pieces
  | 'lobe-left'   // beat 1: piece 1 placed (left lobe)
  | 'lobe-right'  // beat 2: piece 2 placed (right lobe — two lobes together)
  | 'point'       // beat 3: piece 3 placed (bottom triangle point) → full heart
  | 'result'      // beat 4: answer revealed

export interface Pieces19Step {
  phase: AssemblePhase
  caption: string
  hold: number
  result: boolean
}

export interface Pieces19Storyboard {
  steps: Pieces19Step[]
  finalIndex: number
}

export function buildPieces19Steps(lang: Lang): Pieces19Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Pieces19Step[] = [
    {
      phase: 'pieces',
      result: false,
      hold: 2200,
      caption: t(
        'Here are the 3 cut pieces. Look at their curved and straight edges.',
        'Inilah 3 bagian potongan. Perhatikan tepi lengkung dan lurusnya.',
      ),
    },
    {
      phase: 'lobe-left',
      result: false,
      hold: 1800,
      caption: t(
        'Piece 1 (the curved slice) forms the left lobe of a heart.',
        'Bagian 1 (irisan lengkung) membentuk lobe kiri sebuah hati.',
      ),
    },
    {
      phase: 'lobe-right',
      result: false,
      hold: 1800,
      caption: t(
        'Piece 2 (the half-disk) slots in as the right lobe.',
        'Bagian 2 (setengah lingkaran) masuk sebagai lobe kanan.',
      ),
    },
    {
      phase: 'point',
      result: false,
      hold: 2000,
      caption: t(
        'Piece 3 (the triangle) fills the bottom point — a heart appears!',
        'Bagian 3 (segitiga) mengisi titik bawah — bentuk hati terbentuk!',
      ),
    },
    {
      phase: 'result',
      result: true,
      hold: 0,
      caption: t(
        'The 3 pieces reassemble into a heart. Answer: A.',
        '3 bagian tersebut membentuk hati. Jawaban: A.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
