// IKMC-2019-Ecolier-Q8 — storyboard for the arithmetic cross-grid animation.
//
// The question: what number replaces the ? when all calculations are correct?
//
// Grid constraints:
//   Row:      2 + 1 = A        → A = 3
//   Left col: 1 + B = 9        → B = 8
//   Right col:0 + A = C        → C = 0 + 3 = 3
//   Result:   B − C = 8 − 3   → ? = 5  → answer B
//
// Teaching walk, one idea per beat:
//   0. intro      — show the static grid; state the task.
//   1. row        — reveal A=3; explain the horizontal row.
//   2. col-left   — reveal B=8; explain left-inner column.
//   3. col-right  — reveal C=3; explain right column.
//   4. result     — reveal ?=5 (green); answer B.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type CalcGrid8ECPhaseId = 'intro' | 'row' | 'col-left' | 'col-right' | 'result'

export interface CalcGrid8ECBeat {
  /** Which teaching phase this beat belongs to. */
  phase: CalcGrid8ECPhaseId
  /** Show A=3 in the horizontal row result box. */
  showA: boolean
  /** Show B=8 in the left-inner column unknown box. */
  showB: boolean
  /** Show C=3 in the right column unknown box. */
  showC: boolean
  /** Show ?=5 in the question mark box (result beat only). */
  showQ: boolean
  /** Which box to ring-highlight (blue, or green for Q). */
  highlight: 'A' | 'B' | 'C' | 'Q' | null
  /** Equation string shown in the pill beneath the figure; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final beat / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface CalcGrid8ECStoryboard {
  steps: CalcGrid8ECBeat[]
  finalIndex: number
}

export function buildCalcGrid8ECSteps(lang: Lang): CalcGrid8ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CalcGrid8ECBeat[] = [
    // Beat 0 — intro: show static grid, state the task
    {
      phase: 'intro',
      showA: false,
      showB: false,
      showC: false,
      showQ: false,
      highlight: null,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Find the number that replaces the ? when all calculations are correct.',
        'Temukan angka yang menggantikan ? ketika semua perhitungan benar.',
      ),
    },

    // Beat 1 — horizontal row: 2 + 1 = A = 3
    {
      phase: 'row',
      showA: true,
      showB: false,
      showC: false,
      showQ: false,
      highlight: 'A',
      equation: '2 + 1 = 3',
      hold: 2200,
      result: false,
      caption: t(
        'Row: 2 + 1 = 3.',
        'Baris: 2 + 1 = 3.',
      ),
    },

    // Beat 2 — left-inner column: 1 + B = 9 → B = 8
    {
      phase: 'col-left',
      showA: true,
      showB: true,
      showC: false,
      showQ: false,
      highlight: 'B',
      equation: '1 + ? = 9 → ? = 8',
      hold: 2200,
      result: false,
      caption: t(
        'Column: 1 + B = 9 → B = 8.',
        'Kolom: 1 + B = 9 → B = 8.',
      ),
    },

    // Beat 3 — right column: 0 + A = C → C = 3
    {
      phase: 'col-right',
      showA: true,
      showB: true,
      showC: true,
      showQ: false,
      highlight: 'C',
      equation: '0 + 3 = 3',
      hold: 2200,
      result: false,
      caption: t(
        'Right column: 0 + 3 = C = 3.',
        'Kolom kanan: 0 + 3 = C = 3.',
      ),
    },

    // Beat 4 — result: B − C = 8 − 3 = 5 → answer B
    {
      phase: 'result',
      showA: true,
      showB: true,
      showC: true,
      showQ: true,
      highlight: 'Q',
      equation: '8 − 3 = 5',
      hold: 0,
      result: true,
      caption: t(
        'B − C = 8 − 3 = 5 → answer B.',
        'B − C = 8 − 3 = 5 → jawaban B.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
