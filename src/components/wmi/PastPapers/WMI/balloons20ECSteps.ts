// IKMC-21-EC-Q20 — storyboard for the balloons / dart-throw animation.
//
// The question: Mia throws darts at balloons worth 3, 9, 13, 14, 18 points.
// She scores 30 total. Which balloon does she DEFINITELY hit?
//
// Strategy: find all subsets that sum to 30, then intersect them.
//   Combo A: 3 + 9 + 18 = 30 ✓
//   Combo B: 3 + 13 + 14 = 30 ✓
//   (All other subsets checked and eliminated)
//   Balloon 3 appears in BOTH → definitely hit → answer A.
//
// Teaching walk, one idea per beat:
//   0. intro   — show all 5 balloons; state the total-score constraint.
//   1. combo1  — try 3 + 9 + 18 = 30 ✓; highlight those three.
//   2. combo2  — try 3 + 13 + 14 = 30 ✓; highlight those three.
//   3. compare — both combos share balloon "3"; highlight it.
//   4. result  — balloon 3 is definitely hit → answer A.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type BalloonPhase = 'intro' | 'combo1' | 'combo2' | 'compare' | 'result'

export interface BalloonBeat {
  phase: BalloonPhase
  /**
   * Index into BALLOON_VALUES (0–4 → 3,9,13,14,18).
   * True = balloon is highlighted for this beat.
   */
  highlighted: [boolean, boolean, boolean, boolean, boolean]
  /**
   * Index into BALLOON_VALUES for balloons that are dimmed (greyed out).
   * These are balloons that are NOT in the current candidate set.
   */
  dimmed: [boolean, boolean, boolean, boolean, boolean]
  /** Equation chip to show below the figure; '' = hide. */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
  /** Highlight color for marked balloons. */
  highlightColor: string
}

export interface BalloonStoryboard {
  steps: BalloonBeat[]
  finalIndex: number
}

// BALLOON_VALUES = [3, 9, 13, 14, 18]
// Indices:          0  1   2   3   4

const NONE: [boolean, boolean, boolean, boolean, boolean] = [false, false, false, false, false]
const DIM_NONE: [boolean, boolean, boolean, boolean, boolean] = [false, false, false, false, false]

export function buildBalloons20ECSteps(lang: Lang): BalloonStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const ORANGE = '#F59E0B'
  const BLUE = '#2563EB'
  const GREEN = '#10B981'

  const steps: BalloonBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlighted: NONE,
      dimmed: DIM_NONE,
      equation: '',
      hold: 2400,
      result: false,
      highlightColor: ORANGE,
      caption: t(
        'Five balloons: 3, 9, 13, 14, 18 points. Mia hits some and scores exactly 30. Which balloon is always hit?',
        'Lima balon: 3, 9, 13, 14, 18 poin. Mia mengenai beberapa dan mendapat tepat 30. Balon mana yang selalu kena?',
      ),
    },

    // Beat 1 — first valid combo: 3 + 9 + 18 = 30
    {
      phase: 'combo1',
      highlighted: [true, true, false, false, true],  // 3, 9, 18
      dimmed:      [false, false, true, true, false],  // dim 13, 14
      equation: '3 + 9 + 18 = 30 ✓',
      hold: 2800,
      result: false,
      highlightColor: ORANGE,
      caption: t(
        'First combination: 3 + 9 + 18 = 30 ✓. This works — she could hit these three.',
        'Kombinasi pertama: 3 + 9 + 18 = 30 ✓. Ini berhasil — dia bisa mengenai ketiganya.',
      ),
    },

    // Beat 2 — second valid combo: 3 + 13 + 14 = 30
    {
      phase: 'combo2',
      highlighted: [true, false, true, true, false],  // 3, 13, 14
      dimmed:      [false, true, false, false, true],  // dim 9, 18
      equation: '3 + 13 + 14 = 30 ✓',
      hold: 2800,
      result: false,
      highlightColor: BLUE,
      caption: t(
        'Second combination: 3 + 13 + 14 = 30 ✓. This also works — a different set of three.',
        'Kombinasi kedua: 3 + 13 + 14 = 30 ✓. Ini juga berhasil — tiga balon yang berbeda.',
      ),
    },

    // Beat 3 — intersection: balloon 3 is in both
    {
      phase: 'compare',
      highlighted: [true, false, false, false, false],  // only balloon "3"
      dimmed:      [false, true, true, true, true],      // dim all others
      equation: '3 ∈ both sets',
      hold: 2600,
      result: false,
      highlightColor: GREEN,
      caption: t(
        'Balloon 3 is in BOTH valid combinations. The others appear in only one — they are not guaranteed.',
        'Balon 3 ada di KEDUA kombinasi valid. Balon lain hanya ada di satu kombinasi — tidak dijamin kena.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      highlighted: [true, false, false, false, false],
      dimmed:      [false, true, true, true, true],
      equation: 'Balloon 3 → A',
      hold: 0,
      result: true,
      highlightColor: GREEN,
      caption: t(
        'Mia definitely hits the 3-point balloon — answer A.',
        'Mia pasti mengenai balon bernilai 3 poin — jawaban A.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
