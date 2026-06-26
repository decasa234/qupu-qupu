// Storyboard for OSN-08-SD-KAB-Q22 post-answer explainer.
// "Nilai x yang memenuhi operasi skematik"
// x → ×4 → +4 → ÷5 → 12
// Work backwards: 12×5=60; 60−4=56; 56÷4=14  → x = 14

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type FlowchartPhase = 'intro' | 'step1' | 'step2' | 'step3' | 'result'

export interface FlowchartOSN08KQ22Step {
  phase: FlowchartPhase
  highlightBoxes: number[]
  highlightX: boolean
  highlightOutput: boolean
  xLabel?: string
  caption: string
  badge?: string
  hold: number
  result: boolean
}

export interface FlowchartOSN08KQ22Storyboard {
  steps: FlowchartOSN08KQ22Step[]
  finalIndex: number
  answer: number
}

export function buildFlowchartOSN08KQ22Steps(lang: Lang): FlowchartOSN08KQ22Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: FlowchartOSN08KQ22Step[] = [
    {
      phase: 'intro',
      highlightBoxes: [],
      highlightX: false,
      highlightOutput: false,
      hold: 2000,
      result: false,
      caption: t(
        'Work backwards from the output 12 — reverse each operation.',
        'Kerjakan mundur dari hasil 12 — balik setiap operasi.',
      ),
    },
    {
      phase: 'step1',
      highlightBoxes: [2],
      highlightX: false,
      highlightOutput: true,
      hold: 2400,
      result: false,
      badge: '12 × 5 = 60',
      caption: t(
        'Reverse ÷5: multiply by 5.  12 × 5 = 60.',
        'Balik ÷5: kalikan 5.  12 × 5 = 60.',
      ),
    },
    {
      phase: 'step2',
      highlightBoxes: [1],
      highlightX: false,
      highlightOutput: false,
      hold: 2400,
      result: false,
      badge: '60 − 4 = 56',
      caption: t(
        'Reverse +4: subtract 4.  60 − 4 = 56.',
        'Balik +4: kurangkan 4.  60 − 4 = 56.',
      ),
    },
    {
      phase: 'step3',
      highlightBoxes: [0],
      highlightX: false,
      highlightOutput: false,
      hold: 2400,
      result: false,
      badge: '56 ÷ 4 = 14',
      caption: t(
        'Reverse ×4: divide by 4.  56 ÷ 4 = 14.',
        'Balik ×4: bagi 4.  56 ÷ 4 = 14.',
      ),
    },
    {
      phase: 'result',
      highlightBoxes: [],
      highlightX: true,
      highlightOutput: false,
      xLabel: '14',
      hold: 0,
      result: true,
      badge: 'x = 14',
      caption: t('x = 14 ✓', 'x = 14 ✓'),
    },
  ]

  return { steps, finalIndex: steps.length - 1, answer: 14 }
}
