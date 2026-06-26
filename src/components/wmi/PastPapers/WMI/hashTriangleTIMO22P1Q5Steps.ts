// TIMO-22-P1H-Q5 — storyboard for animated explainer
// Growing triangular staircase: G1=1, G2=3, G3=6, G4=10 → G5=?
// Quantities bound to seed breakdown.quantities.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type Phase = 'observe' | 'diffs' | 'predict' | 'reveal'

export interface HashTriangleStep {
  phase: Phase
  showDiffs: boolean
  showGroup5: boolean
  caption: string
  hold: number
  result: boolean
}

export interface HashTriangleStoryboard {
  steps: HashTriangleStep[]
  finalIndex: number
}

// Quantities from seed breakdown.quantities (anti-drift)
export const COUNTS = [1, 3, 6, 10, 15] as const   // groups 1-5

export function buildHashTriangleTIMO22P1Q5Steps(lang: Lang): HashTriangleStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: HashTriangleStep[] = [
    {
      phase: 'observe',
      showDiffs: false,
      showGroup5: false,
      hold: 2000,
      result: false,
      caption: t(
        `Count the # symbols: Group 1=1, Group 2=3, Group 3=6, Group 4=10. How does each group grow?`,
        `Hitung simbol #: Kelompok 1=1, 2=3, 3=6, 4=10. Bagaimana pola pertumbuhannya?`,
      ),
    },
    {
      phase: 'diffs',
      showDiffs: true,
      showGroup5: false,
      hold: 2400,
      result: false,
      caption: t(
        `Differences: +2, +3, +4 — each step adds one more # than the previous step.`,
        `Selisih: +2, +3, +4 — setiap langkah menambah satu # lebih banyak dari langkah sebelumnya.`,
      ),
    },
    {
      phase: 'predict',
      showDiffs: true,
      showGroup5: false,
      hold: 2200,
      result: false,
      caption: t(
        `The next difference is +5. So Group 5 = 10 + 5 = 15.`,
        `Selisih berikutnya adalah +5. Maka Kelompok 5 = 10 + 5 = 15.`,
      ),
    },
    {
      phase: 'reveal',
      showDiffs: false,
      showGroup5: true,
      hold: 0,
      result: true,
      caption: t(
        `Group 5 has 15 # symbols. (Formula: 5 × 6 ÷ 2 = 15.) ✓`,
        `Kelompok 5 memiliki 15 simbol #. (Rumus: 5 × 6 ÷ 2 = 15.) ✓`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
