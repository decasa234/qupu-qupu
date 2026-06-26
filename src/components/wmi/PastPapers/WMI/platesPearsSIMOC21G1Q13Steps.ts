// platesPearsSIMOC21G1Q13Steps.ts
// Beat-by-beat storyboard for SIMOC-21-G1-Q13 (Fibonacci plates+pears).
//
// Strategy:
//   0. Intro — survey all 5 plates.
//   1. Highlight plates 1 & 2 → both have 1 pear; start of pattern.
//   2. Highlight plates 1-2-3 → plate 3 = 1+1 = 2 (first Fibonacci step).
//   3. Highlight plates 2-3-4 → plate 4 = 1+2 = 3.
//   4. Highlight plates 3-4-5 → plate 5 = 2+3 = 5.
//   5. Highlight plates 4-5 + show plate 6 → plate 6 = 3+5 = 8.
//   6. Result — plate 6 confirmed = 8, answer D.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type PlatesPhase = 'intro' | 'rule' | 'extend' | 'result'

export interface PlatesStep {
  phase: PlatesPhase
  /** 0-based indices of plates 1–5 to highlight (amber ring). */
  highlighted: number[]
  /** Whether to render the preview of plate 6 with 8 pears. */
  showPlate6: boolean
  caption: string
  hold: number
  result: boolean
}

function t(lang: Lang, en: string, id: string): string {
  return lang === 'id' ? id : en
}

export function buildPlatesPearsSIMOC21G1Q13Steps(
  lang: Lang,
): { steps: PlatesStep[]; finalIndex: number } {
  const steps: PlatesStep[] = []

  // Beat 0 — intro
  steps.push({
    phase: 'intro',
    highlighted: [],
    showPlate6: false,
    hold: 1600,
    result: false,
    caption: t(
      lang,
      'Yong Xin placed pears on plates following a pattern. Count the pears on each plate.',
      'Yong Xin meletakkan pir mengikuti suatu pola. Hitung jumlah pir di setiap piring.',
    ),
  })

  // Beat 1 — plates 1 & 2
  steps.push({
    phase: 'rule',
    highlighted: [0, 1],
    showPlate6: false,
    hold: 2000,
    result: false,
    caption: t(
      lang,
      'Plate 1 → 1 pear. Plate 2 → 1 pear. These two numbers start the pattern.',
      'Piring 1 → 1 pir. Piring 2 → 1 pir. Dua bilangan ini memulai pola.',
    ),
  })

  // Beat 2 — plates 1, 2, 3
  steps.push({
    phase: 'rule',
    highlighted: [0, 1, 2],
    showPlate6: false,
    hold: 2200,
    result: false,
    caption: t(
      lang,
      'Plate 3 = plate 1 + plate 2 = 1 + 1 = 2 pears. Each plate is the sum of the two before it!',
      'Piring 3 = piring 1 + piring 2 = 1 + 1 = 2 pir. Setiap piring adalah jumlah dua piring sebelumnya!',
    ),
  })

  // Beat 3 — plates 2, 3, 4
  steps.push({
    phase: 'rule',
    highlighted: [1, 2, 3],
    showPlate6: false,
    hold: 2200,
    result: false,
    caption: t(
      lang,
      'Plate 4 = plate 2 + plate 3 = 1 + 2 = 3 pears. The rule holds!',
      'Piring 4 = piring 2 + piring 3 = 1 + 2 = 3 pir. Aturan berlaku!',
    ),
  })

  // Beat 4 — plates 3, 4, 5
  steps.push({
    phase: 'rule',
    highlighted: [2, 3, 4],
    showPlate6: false,
    hold: 2200,
    result: false,
    caption: t(
      lang,
      'Plate 5 = plate 3 + plate 4 = 2 + 3 = 5 pears. Pattern confirmed.',
      'Piring 5 = piring 3 + piring 4 = 2 + 3 = 5 pir. Pola terkonfirmasi.',
    ),
  })

  // Beat 5 — show plate 6
  steps.push({
    phase: 'extend',
    highlighted: [3, 4],
    showPlate6: true,
    hold: 2400,
    result: false,
    caption: t(
      lang,
      'Plate 6 = plate 4 + plate 5 = 3 + 5 = 8 pears!',
      'Piring 6 = piring 4 + piring 5 = 3 + 5 = 8 pir!',
    ),
  })

  // Beat 6 — result
  steps.push({
    phase: 'result',
    highlighted: [3, 4],
    showPlate6: true,
    hold: 0,
    result: true,
    caption: t(
      lang,
      'Plate 6 has 8 pears. Answer: D (8).',
      'Piring ke-6 memiliki 8 pir. Jawaban: D (8).',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
