// IKMC-23-EC-Q11 — storyboard for "Ali's ruler" animation.
//
// Problem: Ali has a 60 cm ruler with only 4 marked points: 0, m1, m2, and 60.
// From C(4,2) = 6 pairs of points he can measure 6 distinct lengths.
// He needs to measure exactly 10, 20, 30, 40, 50, and 60 cm.
// Which ruler option covers all six?
//
// The key insight: the 6 distances from {0, m1, m2, 60} are:
//   m1−0, m2−m1, 60−m2, m2−0, 60−m1, 60−0
// Only E (m1=10, m2=40) gives {10, 30, 20, 40, 50, 60} — all six.
//
// Teaching walk (beats):
//   0  goal      — state the task; C(4,2)=6 distances needed
//   1  check-D   — Ruler D (10,20): distances include two 10s → ✗
//   2  check-E   — Ruler E (10,40): distances = {10,30,20,40,50,60} → ✓
//   3  result    — Ruler E covers all six. Answer: E.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type PhaseId = 'goal' | 'check-D' | 'check-E' | 'result'

export interface RulerBeat {
  /** Which animation phase this beat belongs to. */
  phase: PhaseId
  /** Which ruler key (A–E) to display; null shows no ruler (goal beat). */
  rulerKey: string | null
  /** Highlight the m1 tick mark. */
  highlightM1: boolean
  /** Highlight the m2 tick mark. */
  highlightM2: boolean
  /** Equation pill text ('' = hide). */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface RulerStoryboard {
  steps: RulerBeat[]
  finalIndex: number
}

export function buildOpts11ECSteps(lang: Lang): RulerStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: RulerBeat[] = [
    // Beat 0 — goal
    {
      phase: 'goal',
      rulerKey: null,
      highlightM1: false,
      highlightM2: false,
      equation: 'C(4,2) = 6',
      hold: 2400,
      result: false,
      caption: t(
        'Ali needs to measure 10, 20, 30, 40, 50, and 60 cm. Each ruler has 4 marked points (0, m₁, m₂, 60), giving C(4,2) = 6 distances. Which ruler gives all six?',
        'Ali perlu mengukur 10, 20, 30, 40, 50, dan 60 cm. Setiap penggaris punya 4 titik (0, m₁, m₂, 60) sehingga menghasilkan C(4,2) = 6 jarak. Penggaris mana yang mencakup keenamnya?',
      ),
    },

    // Beat 1 — check Ruler D (m1=10, m2=20)
    {
      phase: 'check-D',
      rulerKey: 'D',
      highlightM1: true,
      highlightM2: true,
      equation: '10, 10, 40, 20, 50, 60 ✗',
      hold: 2600,
      result: false,
      caption: t(
        'Ruler D (marks at 10 & 20): distances are 10, 10, 40, 20, 50, 60 — the distance 10 appears twice and 30 is missing. ✗',
        'Penggaris D (tanda di 10 & 20): jarak-jaraknya adalah 10, 10, 40, 20, 50, 60 — jarak 10 muncul dua kali dan 30 tidak ada. ✗',
      ),
    },

    // Beat 2 — check Ruler E (m1=10, m2=40)
    {
      phase: 'check-E',
      rulerKey: 'E',
      highlightM1: true,
      highlightM2: true,
      equation: '10, 30, 20, 40, 50, 60 ✓',
      hold: 2600,
      result: false,
      caption: t(
        'Ruler E (marks at 10 & 40): distances are 10, 30, 20, 40, 50, 60 — all six different values! ✓',
        'Penggaris E (tanda di 10 & 40): jarak-jaraknya adalah 10, 30, 20, 40, 50, 60 — keenam nilai berbeda! ✓',
      ),
    },

    // Beat 3 — result
    {
      phase: 'result',
      rulerKey: 'E',
      highlightM1: true,
      highlightM2: true,
      equation: 'Ruler E → E',
      hold: 0,
      result: true,
      caption: t(
        'Ruler E covers all six lengths: 10, 20, 30, 40, 50, and 60 cm. Answer: E.',
        'Penggaris E mencakup keenam panjang: 10, 20, 30, 40, 50, dan 60 cm. Jawaban: E.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
