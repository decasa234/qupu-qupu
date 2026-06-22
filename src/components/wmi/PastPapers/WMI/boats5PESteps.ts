// IKMC-23-PE-Q5 — "Which boat is mine?" storyboard.
//
// Strategy: two-condition elimination.
//   Condition 1: circles > 1   → eliminate C (only 1 circle)
//   Condition 2: triangles − squares = 2   → of the survivors, only E qualifies
//
// Shape counts per boat (read from source paper):
//   A: circles=2, triangles=1, squares=1  →  Δ−□=0  ✗
//   B: circles=3, triangles=3, squares=2  →  Δ−□=1  ✗
//   C: circles=1  → eliminated by condition 1
//   D: circles=2, triangles=1, squares=3  →  Δ−□=−2 ✗
//   E: circles=3, triangles=4, squares=2  →  Δ−□=2  ✓  ← ANSWER
//
// Beat walk (one idea per beat):
//   0. intro   — state both conditions.
//   1. cond1   — apply circles > 1: strike C (circles=1).
//   2. checkA  — check A: Δ−□ = 1−1 = 0 ≠ 2, eliminated.
//   3. checkB  — check B: Δ−□ = 3−2 = 1 ≠ 2, eliminated.
//   4. checkD  — check D: Δ−□ = 1−3 = −2 ≠ 2, eliminated.
//   5. result  — only E remains: circles=3>1 ✓, Δ−□=4−2=2 ✓ → answer E.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type Boats5PEPhase =
  | 'intro'
  | 'cond1'
  | 'checkA'
  | 'checkB'
  | 'checkD'
  | 'result'

export interface Boats5PEBeat {
  phase: Boats5PEPhase
  /** Boats that have been eliminated so far (shown with an X overlay). */
  eliminated: ReadonlyArray<string>
  /** The boat being examined this beat (highlighted). */
  active: string | null
  /** Equation shown in the chip; '' to hide. */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface Boats5PEStoryboard {
  steps: Boats5PEBeat[]
  finalIndex: number
}

export function buildBoats5PESteps(lang: Lang): Boats5PEStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Boats5PEBeat[] = [
    // Beat 0 — intro: state both conditions
    {
      phase: 'intro',
      eliminated: [],
      active: null,
      equation: t('circles > 1  AND  △ − □ = 2', 'lingkaran > 1  DAN  △ − □ = 2'),
      hold: 2600,
      result: false,
      caption: t(
        'Two clues: the boat must have MORE than 1 circle, AND exactly 2 more triangles than squares.',
        'Dua petunjuk: perahu harus punya LEBIH dari 1 lingkaran, DAN tepat 2 segitiga lebih banyak dari persegi.',
      ),
    },

    // Beat 1 — condition 1: circles > 1 → eliminate C
    {
      phase: 'cond1',
      eliminated: ['C'],
      active: 'C',
      equation: t('C: circles = 1 ✗', 'C: lingkaran = 1 ✗'),
      hold: 2200,
      result: false,
      caption: t(
        'Boat C has only 1 circle — that is NOT more than 1. Cross out C!',
        'Perahu C hanya punya 1 lingkaran — itu BUKAN lebih dari 1. Coret C!',
      ),
    },

    // Beat 2 — check A: triangles−squares = 1−1 = 0 ≠ 2
    {
      phase: 'checkA',
      eliminated: ['C', 'A'],
      active: 'A',
      equation: t('A: 1 − 1 = 0 ≠ 2 ✗', 'A: 1 − 1 = 0 ≠ 2 ✗'),
      hold: 2200,
      result: false,
      caption: t(
        'Boat A: 1 triangle − 1 square = 0, not 2. Eliminated!',
        'Perahu A: 1 segitiga − 1 persegi = 0, bukan 2. Dieliminasi!',
      ),
    },

    // Beat 3 — check B: triangles−squares = 3−2 = 1 ≠ 2
    {
      phase: 'checkB',
      eliminated: ['C', 'A', 'B'],
      active: 'B',
      equation: t('B: 3 − 2 = 1 ≠ 2 ✗', 'B: 3 − 2 = 1 ≠ 2 ✗'),
      hold: 2200,
      result: false,
      caption: t(
        'Boat B: 3 triangles − 2 squares = 1, not 2. Eliminated!',
        'Perahu B: 3 segitiga − 2 persegi = 1, bukan 2. Dieliminasi!',
      ),
    },

    // Beat 4 — check D: triangles−squares = 1−3 = −2 ≠ 2
    {
      phase: 'checkD',
      eliminated: ['C', 'A', 'B', 'D'],
      active: 'D',
      equation: t('D: 1 − 3 = −2 ≠ 2 ✗', 'D: 1 − 3 = −2 ≠ 2 ✗'),
      hold: 2200,
      result: false,
      caption: t(
        'Boat D: 1 triangle − 3 squares = −2, not 2. Eliminated!',
        'Perahu D: 1 segitiga − 3 persegi = −2, bukan 2. Dieliminasi!',
      ),
    },

    // Beat 5 — result: only E remains, verify both conditions
    {
      phase: 'result',
      eliminated: ['C', 'A', 'B', 'D'],
      active: 'E',
      equation: t('E: circles=3>1 ✓  and  4−2=2 ✓', 'E: lingkaran=3>1 ✓  dan  4−2=2 ✓'),
      hold: 0,
      result: true,
      caption: t(
        'Only boat E is left: 3 circles (>1 ✓) and 4−2=2 triangles more than squares ✓. Answer: E.',
        'Hanya perahu E yang tersisa: 3 lingkaran (>1 ✓) dan 4−2=2 segitiga lebih dari persegi ✓. Jawaban: E.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
