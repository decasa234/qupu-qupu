// SEAMO-18-B-Q11 — step storyboard for the number-puzzle explainer.
//
// Three circle groups: top × (BL + BR) = centre.
//   Group 1:  4 × (5+3) = 4×8 = 32  ✓
//   Group 2:  5 × (7+8) = 5×15 = 75  ✓
//   Group 3:  ? × (6+5) = 55 → ? × 11 = 55 → ? = 5   → Answer A
//
// Teaching walk, one idea per beat:
//   0. intro     — show the three groups, identify the unknown.
//   1. rule-1    — verify group 1: top × (BL+BR) = centre.
//   2. rule-2    — verify group 2 with same rule.
//   3. apply     — apply rule to group 3: ? × 11 = 55.
//   4. result    — divide: ? = 55 ÷ 11 = 5 → answer A.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type NumPuzzle18B11Phase =
  | 'intro'
  | 'rule-1'
  | 'rule-2'
  | 'apply'
  | 'result'

export interface NumPuzzle18B11Beat {
  phase:         NumPuzzle18B11Phase
  /** Highlight group 1 (0-indexed). */
  highlightG1:   boolean
  /** Highlight group 2. */
  highlightG2:   boolean
  /** Highlight group 3 / reveal answer. */
  highlightG3:   boolean
  revealAnswer:  boolean
  equation:      string
  caption:       string
  hold:          number   // ms; 0 = final beat (manual only)
  result:        boolean
}

export interface NumPuzzle18B11Storyboard {
  steps:      NumPuzzle18B11Beat[]
  finalIndex: number
}

export function buildNumPuzzle18B11Steps(lang: Lang): NumPuzzle18B11Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: NumPuzzle18B11Beat[] = [
    {
      phase: 'intro',
      highlightG1: false, highlightG2: false, highlightG3: false,
      revealAnswer: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Three circle groups — each has a large centre circle and three small circles (top, bottom-left, bottom-right). Find the rule.',
        'Tiga kelompok lingkaran — masing-masing punya lingkaran tengah besar dan tiga lingkaran kecil (atas, bawah-kiri, bawah-kanan). Temukan aturannya.',
      ),
    },
    {
      phase: 'rule-1',
      highlightG1: true, highlightG2: false, highlightG3: false,
      revealAnswer: false,
      equation: '4 × (5 + 3) = 4 × 8 = 32 ✓',
      hold: 2400,
      result: false,
      caption: t(
        'Group 1: top × (BL + BR) = 4 × (5+3) = 4 × 8 = 32. That matches the centre!',
        'Kelompok 1: atas × (BK + BKn) = 4 × (5+3) = 4 × 8 = 32. Sama dengan nilai tengah!',
      ),
    },
    {
      phase: 'rule-2',
      highlightG1: false, highlightG2: true, highlightG3: false,
      revealAnswer: false,
      equation: '5 × (7 + 8) = 5 × 15 = 75 ✓',
      hold: 2400,
      result: false,
      caption: t(
        'Group 2: 5 × (7+8) = 5 × 15 = 75 ✓. Rule confirmed: top × (BL + BR) = centre.',
        'Kelompok 2: 5 × (7+8) = 5 × 15 = 75 ✓. Aturan terbukti: atas × (BK + BKn) = tengah.',
      ),
    },
    {
      phase: 'apply',
      highlightG1: false, highlightG2: false, highlightG3: true,
      revealAnswer: false,
      equation: '? × (6 + 5) = 55  →  ? × 11 = 55',
      hold: 2400,
      result: false,
      caption: t(
        'Group 3: ? × (6+5) = 55. So ? × 11 = 55.',
        'Kelompok 3: ? × (6+5) = 55. Jadi ? × 11 = 55.',
      ),
    },
    {
      phase: 'result',
      highlightG1: false, highlightG2: false, highlightG3: true,
      revealAnswer: true,
      equation: '? = 55 ÷ 11 = 5  →  A',
      hold: 0,
      result: true,
      caption: t(
        '? = 55 ÷ 11 = 5. The missing number is 5 — answer A.',
        '? = 55 ÷ 11 = 5. Bilangan yang hilang adalah 5 — jawaban A.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
