// Storyboard for OSN-07-SD-KAB-Q5 post-answer explainer.
// "Berapa banyak kubus satuan yang masih diperlukan untuk memenuhi kotak?"
// Box capacity: 4 × 3 × 3 = 36. Already placed: 14. Answer: 36 − 14 = 22.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type BoxFillPhase = 'intro' | 'capacity' | 'placed' | 'result'

export interface BoxFillOSN07KQ5Step {
  phase: BoxFillPhase
  showGhost: boolean
  highlightPlaced: boolean
  caption: string
  hold: number
  result: boolean
}

export interface BoxFillOSN07KQ5Storyboard {
  steps: BoxFillOSN07KQ5Step[]
  finalIndex: number
  answer: number
}

export function buildBoxFillOSN07KQ5Steps(lang: Lang): BoxFillOSN07KQ5Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BoxFillOSN07KQ5Step[] = [
    {
      phase: 'intro',
      showGhost: false,
      highlightPlaced: false,
      hold: 2000,
      result: false,
      caption: t(
        'A rectangular box is partially filled with unit cubes. How many more are needed?',
        'Kotak balok sudah diisi sebagian dengan kubus satuan. Berapa banyak lagi yang diperlukan?',
      ),
    },
    {
      phase: 'capacity',
      showGhost: true,
      highlightPlaced: false,
      hold: 2400,
      result: false,
      caption: t(
        'Box capacity: 4 × 3 × 3 = 36 unit cubes (total slots).',
        'Kapasitas kotak: 4 × 3 × 3 = 36 kubus satuan (jumlah slot).',
      ),
    },
    {
      phase: 'placed',
      showGhost: true,
      highlightPlaced: true,
      hold: 2400,
      result: false,
      caption: t(
        'Cubes already placed (highlighted): 14.',
        'Kubus yang sudah diletakkan (disorot): 14.',
      ),
    },
    {
      phase: 'result',
      showGhost: true,
      highlightPlaced: false,
      hold: 0,
      result: true,
      caption: t(
        'Cubes still needed: 36 − 14 = 22.',
        'Kubus yang masih diperlukan: 36 − 14 = 22.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1, answer: 22 }
}
