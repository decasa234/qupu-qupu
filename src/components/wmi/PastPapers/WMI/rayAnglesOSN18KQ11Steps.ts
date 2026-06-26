// rayAnglesOSN18KQ11Steps.ts — OSN 2018 SD Kabupaten Q11
//
// 5 rays from one vertex; consecutive gaps g1=10°, g2=20°, g3=30°, g4=50°.
// Count angles with DISTINCT measures across all C(5,2)=10 pairs:
//   singles  (4 distinct): 10, 20, 30, 50
//   2-adjacent (1 new):    g1+g2=30°(dup), g2+g3=50°(dup), g3+g4=80°(new)
//   3-adjacent (2 new):    g1+g2+g3=60°(new), g2+g3+g4=100°(new)
//   4-adjacent (1 new):    g1+g2+g3+g4=110°(new)
//   → 8 distinct sizes.   Answer: 8.

export type Lang = 'en' | 'id'

export interface RayAnglesStep {
  /** Arc span to highlight as [cumDegA, cumDegB] from baseline, or null. */
  arc: [number, number] | null
  /** Distinct angle sizes found so far (sorted ascending). */
  found: number[]
  caption: string
  hold: number
  result: boolean
}

export interface RayAnglesStoryboard {
  steps: RayAnglesStep[]
  finalIndex: number
}

export function buildRayAnglesOSN18KQ11Steps(lang: Lang): RayAnglesStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: RayAnglesStep[] = [
    {
      arc: null,
      found: [],
      hold: 1800,
      result: false,
      caption: t(
        'Name the 4 consecutive gaps: g1 = 10°, g2 = 20°, g3 = 30°, g4 = 50°.',
        'Beri nama 4 celah berurutan: g1 = 10°, g2 = 20°, g3 = 30°, g4 = 50°.',
      ),
    },
    {
      arc: null,
      found: [10, 20, 30, 50],
      hold: 2000,
      result: false,
      caption: t(
        'Single gaps give 4 distinct sizes: 10°, 20°, 30°, 50°.',
        'Satu celah saja: 4 ukuran berbeda — 10°, 20°, 30°, 50°.',
      ),
    },
    {
      arc: [30, 110],
      found: [10, 20, 30, 50, 80],
      hold: 2200,
      result: false,
      caption: t(
        'Two adjacent gaps: g1+g2=30° (dup), g2+g3=50° (dup), g3+g4=80° (new) → 5 so far.',
        'Dua celah berurutan: g1+g2=30° (dup), g2+g3=50° (dup), g3+g4=80° (baru) → 5 sekarang.',
      ),
    },
    {
      arc: [0, 60],
      found: [10, 20, 30, 50, 60, 80, 100],
      hold: 2200,
      result: false,
      caption: t(
        'Three adjacent gaps: g1+g2+g3 = 60° (new) and g2+g3+g4 = 100° (new) → 7 so far.',
        'Tiga celah berurutan: g1+g2+g3 = 60° (baru) dan g2+g3+g4 = 100° (baru) → 7 sekarang.',
      ),
    },
    {
      arc: [0, 110],
      found: [10, 20, 30, 50, 60, 80, 100, 110],
      hold: 2000,
      result: false,
      caption: t(
        'All four gaps: g1+g2+g3+g4 = 110° (new) → 8 distinct sizes!',
        'Empat celah semua: g1+g2+g3+g4 = 110° (baru) → 8 ukuran berbeda!',
      ),
    },
    {
      arc: null,
      found: [10, 20, 30, 50, 60, 80, 100, 110],
      hold: 0,
      result: true,
      caption: t(
        'Distinct sizes: {10°, 20°, 30°, 50°, 60°, 80°, 100°, 110°} → answer: 8.',
        'Ukuran berbeda: {10°, 20°, 30°, 50°, 60°, 80°, 100°, 110°} → jawaban: 8.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
