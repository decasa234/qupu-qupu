import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type StarTrianglePhase = 'show' | 'counts' | 'formula' | 'apply' | 'result'

export interface StarTriangleStep {
  phase: StarTrianglePhase
  highlightGroups: number[]   // which groups (1-4) to highlight
  showCounts: boolean         // show star counts under panels
  caption: string
  hold: number
  result: boolean
}

export interface StarTriangleStoryboard {
  steps: StarTriangleStep[]
  finalIndex: number
}

// Problem constants bound to seed quantities
export const GROUPS = [1, 2, 3, 4] as const
export const COUNTS = [1, 3, 6, 10] as const   // triangular numbers T(n)=n(n+1)/2
export const TARGET_N = 9
export const ANSWER = 45  // 9×10/2

/**
 * Beat-by-beat storyboard for HKIMO-22-P2H-Q5:
 *   0. Show all 4 groups — read the pattern.
 *   1. Highlight each group; reveal star counts (1, 3, 6, 10).
 *   2. Show the formula: count = n(n+1)/2.
 *   3. Apply to n=9: 9 × 10 ÷ 2 = 45.
 *   4. Result — 45 stars in the 9th group.
 */
export function buildStarTriangleHK22P2Q5Steps(lang: Lang): StarTriangleStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: StarTriangleStep[] = [
    {
      phase: 'show',
      highlightGroups: [],
      showCounts: false,
      hold: 1800,
      result: false,
      caption: t(
        'Group 1 has 1 ★, group 2 has 3 ★, group 3 has 6 ★, group 4 has 10 ★. Spot the pattern!',
        'Kelompok 1 punya 1 ★, kelompok 2 punya 3 ★, kelompok 3 punya 6 ★, kelompok 4 punya 10 ★. Temukan polanya!',
      ),
    },
    {
      phase: 'counts',
      highlightGroups: [1, 2, 3, 4],
      showCounts: true,
      hold: 2000,
      result: false,
      caption: t(
        'Each group n is a right-triangle: row 1 has 1 ★, row 2 has 2 ★, … row n has n ★. Total = 1+2+…+n.',
        'Setiap kelompok ke-n berupa segitiga siku-siku: baris 1 punya 1 ★, baris 2 punya 2 ★, … baris ke-n punya n ★. Total = 1+2+…+n.',
      ),
    },
    {
      phase: 'formula',
      highlightGroups: [1, 2, 3, 4],
      showCounts: true,
      hold: 2200,
      result: false,
      caption: t(
        'Formula: count for group n = n × (n + 1) ÷ 2. Check: group 3 = 3×4÷2 = 6 ✓',
        'Rumus: jumlah bintang kelompok ke-n = n × (n + 1) ÷ 2. Cek: kelompok 3 = 3×4÷2 = 6 ✓',
      ),
    },
    {
      phase: 'apply',
      highlightGroups: [],
      showCounts: false,
      hold: 2000,
      result: false,
      caption: t(
        'For group 9: 9 × (9 + 1) ÷ 2 = 9 × 10 ÷ 2 = 90 ÷ 2 = 45.',
        'Untuk kelompok ke-9: 9 × (9 + 1) ÷ 2 = 9 × 10 ÷ 2 = 90 ÷ 2 = 45.',
      ),
    },
    {
      phase: 'result',
      highlightGroups: [],
      showCounts: false,
      hold: 2500,
      result: true,
      caption: t(
        'The 9th group has 45 ★.',
        'Kelompok ke-9 memiliki 45 ★.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
