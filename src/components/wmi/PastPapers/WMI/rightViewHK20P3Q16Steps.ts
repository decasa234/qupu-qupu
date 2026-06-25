// Storyboard for HKIMO-20-P3H-Q16 — post-answer explainer.
// "At least how many square(s) can be seen viewing the figure from the right?"
// Answer: 3 — the right-view silhouette has 3 filled cells: (y=0,z=0), (y=1,z=0), (y=1,z=1).

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type RightViewPhase = 'intro' | 'highlight-front' | 'highlight-back' | 'right-view' | 'total'

export interface RightViewHK20P3Q16Step {
  phase: RightViewPhase
  /** Which depth layers to highlight in the iso figure:
   *  0 = no highlight, 1 = front row (y=0) gold, 2 = back row (y=1) gold */
  highlightDepth: number
  /** How many right-view squares to show (0–3) */
  viewSquares: number
  runningTotal: number
  caption: string
  hold: number
  result: boolean
}

export interface RightViewHK20P3Q16Storyboard {
  steps: RightViewHK20P3Q16Step[]
  finalIndex: number
  answer: number
}

export function buildRightViewHK20P3Q16Steps(lang: Lang): RightViewHK20P3Q16Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: RightViewHK20P3Q16Step[] = [
    {
      phase: 'intro',
      highlightDepth: 0,
      viewSquares: 0,
      runningTotal: 0,
      caption: t(
        'Look at the 3D figure from the right side →',
        'Lihat bangun 3D dari sisi kanan →',
      ),
      hold: 2000,
      result: false,
    },
    {
      phase: 'highlight-front',
      highlightDepth: 1,
      viewSquares: 1,
      runningTotal: 1,
      caption: t(
        'Front row (y=0): only 1 height → 1 square visible',
        'Baris depan: tinggi 1 → terlihat 1 kotak',
      ),
      hold: 2500,
      result: false,
    },
    {
      phase: 'highlight-back',
      highlightDepth: 2,
      viewSquares: 3,
      runningTotal: 3,
      caption: t(
        'Back row (y=1): height 2 → 2 more squares visible',
        'Baris belakang: tinggi 2 → 2 kotak lagi terlihat',
      ),
      hold: 2500,
      result: false,
    },
    {
      phase: 'total',
      highlightDepth: 0,
      viewSquares: 3,
      runningTotal: 3,
      caption: t(
        'Right-view: 1 + 2 = 3 squares visible ✓',
        'Pandangan kanan: 1 + 2 = 3 kotak terlihat ✓',
      ),
      hold: 3000,
      result: true,
    },
  ]

  return { steps, finalIndex: steps.length - 1, answer: 3 }
}
