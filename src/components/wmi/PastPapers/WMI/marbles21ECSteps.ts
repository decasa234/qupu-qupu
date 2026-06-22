// IKMC-23-EC-Q21 — storyboard for the marbles animation.
//
// The question: Adam and Brenda each have 9 marbles. Together: 8 red + 10 blue.
// Brenda has blue = 2 × red. How many blue marbles does Adam have?
//
// Teaching walk, one idea per beat:
//   0. intro    — show the 18 scattered marbles; state the two givens.
//   1. brenda   — Brenda: blue = 2×red and blue+red = 9 → red=3, blue=6.
//   2. subtract — Total blue = 10; Adam = 10 − 6 = 4.
//   3. check    — Adam: 9 − 4 = 5 red; 5+3 = 8 ✓.
//   4. result   — Adam has 4 blue → answer B.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type MarblePhaseId = 'intro' | 'brenda' | 'subtract' | 'check' | 'result'

export interface MarbleBeat {
  /** Animation phase. */
  phase: MarblePhaseId
  /** Highlight Brenda's portion (3 red, 6 blue). */
  showBrenda: boolean
  /** Highlight the total-blue subtraction. */
  showSubtract: boolean
  /** Show the check arithmetic. */
  showCheck: boolean
  /** Equation / maths line; '' to hide. */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface MarbleStoryboard {
  steps: MarbleBeat[]
  finalIndex: number
}

export function buildMarbles21ECSteps(lang: Lang): MarbleStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: MarbleBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      showBrenda: false,
      showSubtract: false,
      showCheck: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Adam and Brenda each have 9 marbles. Together: 8 red and 10 blue. Brenda has twice as many blue as red.',
        'Adam dan Brenda masing-masing punya 9 kelereng. Bersama: 8 merah dan 10 biru. Brenda punya 2× lebih banyak biru dari merah.',
      ),
    },

    // Beat 1 — find Brenda's split
    {
      phase: 'brenda',
      showBrenda: true,
      showSubtract: false,
      showCheck: false,
      equation: t('blue = 2×red, blue+red = 9', 'biru = 2×merah, biru+merah = 9'),
      hold: 2400,
      result: false,
      caption: t(
        'Brenda: blue = 2×red and both sum to 9 → 3×red = 9 → red = 3, blue = 6.',
        'Brenda: biru = 2×merah dan keduanya berjumlah 9 → 3×merah = 9 → merah = 3, biru = 6.',
      ),
    },

    // Beat 2 — Adam's blue count
    {
      phase: 'subtract',
      showBrenda: true,
      showSubtract: true,
      showCheck: false,
      equation: '10 − 6 = 4',
      hold: 2400,
      result: false,
      caption: t(
        'Total blue = 10. Brenda has 6 blue. Adam has 10 − 6 = 4 blue marbles.',
        'Total biru = 10. Brenda punya 6 biru. Adam punya 10 − 6 = 4 kelereng biru.',
      ),
    },

    // Beat 3 — verify
    {
      phase: 'check',
      showBrenda: true,
      showSubtract: true,
      showCheck: true,
      equation: t('Adam: 4+5=9 ✓  Total red: 5+3=8 ✓', 'Adam: 4+5=9 ✓  Total merah: 5+3=8 ✓'),
      hold: 2200,
      result: false,
      caption: t(
        'Check: Adam has 4 blue + 5 red = 9 ✓. Total red = 5 + 3 = 8 ✓.',
        'Periksa: Adam punya 4 biru + 5 merah = 9 ✓. Total merah = 5 + 3 = 8 ✓.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      showBrenda: false,
      showSubtract: true,
      showCheck: false,
      equation: '4 → B',
      hold: 0,
      result: true,
      caption: t(
        'Adam has 4 blue marbles — answer B.',
        'Adam memiliki 4 kelereng biru — jawaban B.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
