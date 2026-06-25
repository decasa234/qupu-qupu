// Storyboard for HKIMO-23-P1SF-Q18 — post-answer explainer.
// "At least how many squares visible from the right?" — Answer: 4.
// Structure: stepped pyramid, height = 4−max(x,y). x=3 face has 4 squares.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type RightViewPhase = 'intro' | 'look' | 'highlight' | 'answer'

export interface RightViewHK23P1SFQ18Step {
  phase: RightViewPhase
  /** Highlight right-face squares (x=3, y=0..3, z=0) */
  highlightRightFace: boolean
  /** Show result (green) */
  result: boolean
  caption: string
  hold: number
}

export interface RightViewHK23P1SFQ18Storyboard {
  steps: RightViewHK23P1SFQ18Step[]
  finalIndex: number
  answer: number
}

export function buildRightViewPyramidHK23P1SFQ18Steps(
  lang: Lang,
): RightViewHK23P1SFQ18Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: RightViewHK23P1SFQ18Step[] = []

  steps.push({
    phase: 'intro',
    highlightRightFace: false,
    result: false,
    hold: 2000,
    caption: t(
      'This is a stepped pyramid of unit cubes. We look at it from the right.',
      'Ini adalah piramida bertingkat dari kubus satuan. Kita melihatnya dari kanan.',
    ),
  })

  steps.push({
    phase: 'look',
    highlightRightFace: false,
    result: false,
    hold: 2200,
    caption: t(
      'The rightmost column (x = 3) is only 1 cube tall — one layer at the base.',
      'Kolom paling kanan (x = 3) hanya setinggi 1 kubus — satu lapisan di dasar.',
    ),
  })

  steps.push({
    phase: 'highlight',
    highlightRightFace: true,
    result: false,
    hold: 2400,
    caption: t(
      'From the right, we see the 4 squares on the front face of that column (one per row).',
      'Dari kanan, kita melihat 4 persegi pada sisi depan kolom itu (satu per baris).',
    ),
  })

  steps.push({
    phase: 'answer',
    highlightRightFace: true,
    result: true,
    hold: 0,
    caption: t(
      'At least 4 squares are visible from the right.',
      'Setidaknya 4 persegi terlihat dari kanan.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 4 }
}
