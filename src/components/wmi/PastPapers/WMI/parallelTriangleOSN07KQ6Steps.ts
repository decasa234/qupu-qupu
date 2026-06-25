// OSN-07-SD-KAB-Q6 — "Segitiga BEF sama sisi, AB ∥ DC. Besar ∠DCE + ∠DAF?"
// Answer: 150°
//
// Method:
//   1. BEF equilateral → all angles 60°, esp. ∠FBE = 60°.
//   2. AB ∥ DC, line CE (extension of EB) is a transversal.
//      ∠DCE = ∠FBE = 60° (co-interior / alternate angle relationship).
//   3. ∠DAF = 90° (DA ⊥ AB, shown by right-angle mark at A).
//   4. ∠DCE + ∠DAF = 60° + 90° = 150°.

import type { ParallelTriangleHighlight } from './ParallelTriangleOSN07KQ6Illustration'

export type Lang = 'en' | 'id'

export interface ParallelTriangleStep {
  highlight: ParallelTriangleHighlight
  showAnswer: boolean
  equationLine: string | null
  caption: string
  hold: number
  result: boolean
}

export interface ParallelTriangleStoryboard {
  steps: ParallelTriangleStep[]
  finalIndex: number
}

export function buildParallelTriangleOSN07KQ6Steps(lang: Lang): ParallelTriangleStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ParallelTriangleStep[] = [
    // 1. Intro — show full figure
    {
      highlight: null,
      showAnswer: false,
      equationLine: null,
      hold: 2600,
      result: false,
      caption: t(
        'Triangle BEF is equilateral and AB ∥ DC. Find ∠DCE + ∠DAF.',
        'Segitiga BEF sama sisi dan AB ∥ DC. Cari ∠DCE + ∠DAF.',
      ),
    },
    // 2. Highlight the equilateral triangle — all angles are 60°
    {
      highlight: 'triangle',
      showAnswer: false,
      equationLine: '∠BEF = ∠EFB = ∠FBE = 60°',
      hold: 2800,
      result: false,
      caption: t(
        'Triangle BEF is equilateral, so all three interior angles equal 60°.',
        'Segitiga BEF sama sisi, jadi ketiga sudut dalamnya sama besar = 60°.',
      ),
    },
    // 3. ∠DAF = 90°
    {
      highlight: 'daf',
      showAnswer: false,
      equationLine: '∠DAF = 90°',
      hold: 2800,
      result: false,
      caption: t(
        '∠DAF = 90° because DA is perpendicular to AB (shown by the right-angle mark at A).',
        '∠DAF = 90° karena DA tegak lurus AB (ditunjukkan oleh tanda siku-siku di A).',
      ),
    },
    // 4. ∠DCE = 60° via parallel lines
    {
      highlight: 'dce',
      showAnswer: false,
      equationLine: '∠DCE = 60°',
      hold: 2800,
      result: false,
      caption: t(
        'Since AB ∥ DC, the line CE (which is the extension of EB) makes the same 60° angle with DC as ∠FBE makes with AB.',
        'Karena AB ∥ DC, garis CE (perpanjangan EB) membentuk sudut 60° yang sama dengan DC, seperti ∠FBE terhadap AB.',
      ),
    },
    // 5. Sum → 150°
    {
      highlight: 'all',
      showAnswer: true,
      equationLine: '∠DCE + ∠DAF = 60° + 90° = 150°',
      hold: 0,
      result: true,
      caption: t(
        '∠DCE + ∠DAF = 60° + 90° = 150°.',
        '∠DCE + ∠DAF = 60° + 90° = 150°.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
