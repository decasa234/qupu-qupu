// Animation steps for HKIMO-25-P1H-Q5 — L-shaped star groups.
//
// Strategy:
//   0. Intro  — show all four groups; invite counting.
//   1. Count1 — highlight group 1 (1 star).
//   2. Count2 — highlight group 2 (3 stars).
//   3. Count3 — highlight group 3 (5 stars).
//   4. Count4 — highlight group 4 (7 stars).
//   5. Pattern — 1, 3, 5, 7 … (odd numbers, +2 each step).
//   6. Formula — group n = 2n − 1.
//   7. Result  — 2 × 7 − 1 = 13 ✓

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type StarPhase =
  | 'intro'
  | 'count1'
  | 'count2'
  | 'count3'
  | 'count4'
  | 'pattern'
  | 'formula'
  | 'result'

export interface StarStep {
  phase: StarPhase
  /** Which group (1–4) to highlight, or null = show all equally. */
  activeGroup: number | null
  caption: string
  hold: number
  result: boolean
}

export interface StarStoryboard {
  steps: StarStep[]
  finalIndex: number
}

function t(lang: Lang, en: string, id: string): string {
  return lang === 'id' ? id : en
}

export function buildLStarsHK25P1Q5Steps(lang: Lang): StarStoryboard {
  const steps: StarStep[] = [
    {
      phase: 'intro',
      activeGroup: null,
      caption: t(
        lang,
        'Each group grows by adding a new L-arm. Count the ★ in each group.',
        'Setiap kelompok tumbuh dengan menambahkan lengan L baru. Hitung ★ di setiap kelompok.',
      ),
      hold: 2200,
      result: false,
    },
    {
      phase: 'count1',
      activeGroup: 1,
      caption: t(lang, 'Group 1 → 1 star.', 'Kelompok 1 → 1 bintang.'),
      hold: 1500,
      result: false,
    },
    {
      phase: 'count2',
      activeGroup: 2,
      caption: t(lang, 'Group 2 → 3 stars (+2).', 'Kelompok 2 → 3 bintang (+2).'),
      hold: 1500,
      result: false,
    },
    {
      phase: 'count3',
      activeGroup: 3,
      caption: t(lang, 'Group 3 → 5 stars (+2).', 'Kelompok 3 → 5 bintang (+2).'),
      hold: 1500,
      result: false,
    },
    {
      phase: 'count4',
      activeGroup: 4,
      caption: t(lang, 'Group 4 → 7 stars (+2).', 'Kelompok 4 → 7 bintang (+2).'),
      hold: 1500,
      result: false,
    },
    {
      phase: 'pattern',
      activeGroup: null,
      caption: t(
        lang,
        'Sequence: 1, 3, 5, 7 … — odd numbers. Each group adds 2 stars.',
        'Barisan: 1, 3, 5, 7 … — bilangan ganjil. Setiap kelompok bertambah 2 bintang.',
      ),
      hold: 2200,
      result: false,
    },
    {
      phase: 'formula',
      activeGroup: null,
      caption: t(
        lang,
        'Rule: group n has 2n − 1 stars. For n = 7: 2 × 7 − 1 = ?',
        'Aturan: kelompok ke-n memiliki 2n − 1 bintang. Untuk n = 7: 2 × 7 − 1 = ?',
      ),
      hold: 2200,
      result: false,
    },
    {
      phase: 'result',
      activeGroup: null,
      caption: t(lang, '2 × 7 − 1 = 13 ✓', '2 × 7 − 1 = 13 ✓'),
      hold: 2500,
      result: true,
    },
  ]
  return { steps, finalIndex: steps.length - 1 }
}
