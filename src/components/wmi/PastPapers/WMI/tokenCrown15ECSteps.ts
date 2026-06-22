// IKMC-20-EC-Q15 — storyboard for the crown/token puzzle animation.
//
// The question: Amelie wants to build a crown using 10 pentagon tokens.
// Each token has triangles numbered 1–5. When two tokens share a side,
// the numbers on that shared side must match. 4 tokens are placed.
// Which number goes in the triangle marked X? → Answer D (4).
//
// Teaching walk, one idea per beat:
//   0. intro         — show the crown; explain the matching rule.
//   1. edge-rule     — highlight the shared edge between placed token and X-token.
//   2. constraint    — read the number on the placed token's adjacent sector.
//   3. identify-x    — the X sector must match the placed token's touching sector = 4.
//   4. result        — X = 4 → answer D.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type CrownPhaseId = 'intro' | 'edge-rule' | 'constraint' | 'identify-x' | 'result'

export interface CrownBeat {
  /** Which animation phase this beat belongs to. */
  phase: CrownPhaseId
  /** Highlight the shared edge between the X-bearing token and its placed neighbour. */
  showEdgeHighlight: boolean
  /** Show a constraint label on the placed token's adjacent sector (value = 4). */
  showConstraintLabel: boolean
  /** Reveal X = 4 in the X triangle. */
  showAnswer: boolean
  /** Equation / maths line to display; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface CrownStoryboard {
  steps: CrownBeat[]
  finalIndex: number
}

/**
 * Build the beat storyboard for IKMC-20-EC-Q15.
 *
 * Constraint chain (bound to seed breakdown.quantities):
 *   The placed token adjacent to the X-token has sector value 4 on the shared edge.
 *   → By the matching rule the X sector = 4.
 *   → Answer D.
 */
export function buildTokenCrown15ECSteps(lang: Lang): CrownStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CrownBeat[] = [
    // Beat 0 — intro: show the static crown, explain the rule
    {
      phase: 'intro',
      showEdgeHighlight: false,
      showConstraintLabel: false,
      showAnswer: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        "Amelie's crown has 10 pentagon tokens in a ring. When two tokens share a side, the numbers on that side must match.",
        'Mahkota Amelie terdiri dari 10 keping segi lima dalam cincin. Ketika dua keping berbagi sisi, angka di sisi itu harus sama.',
      ),
    },

    // Beat 1 — edge-rule: highlight the shared side between the X-token and its placed neighbour
    {
      phase: 'edge-rule',
      showEdgeHighlight: true,
      showConstraintLabel: false,
      showAnswer: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'The X-token shares a side with the placed token next to it. Those two touching triangles must have the same number.',
        'Keping X berbagi sisi dengan keping yang sudah dipasang di sebelahnya. Kedua segitiga yang bersentuhan harus memiliki angka yang sama.',
      ),
    },

    // Beat 2 — constraint: show the number on the placed token's shared sector
    {
      phase: 'constraint',
      showEdgeHighlight: true,
      showConstraintLabel: true,
      showAnswer: false,
      equation: 'Placed sector = 4',
      hold: 2200,
      result: false,
      caption: t(
        'The triangle on the placed token at that shared side is labelled 4.',
        'Segitiga pada keping yang dipasang di sisi bersama itu berlabel 4.',
      ),
    },

    // Beat 3 — identify-x: the X sector must equal 4
    {
      phase: 'identify-x',
      showEdgeHighlight: true,
      showConstraintLabel: true,
      showAnswer: false,
      equation: 'X = placed sector = 4',
      hold: 2200,
      result: false,
      caption: t(
        "By the matching rule, X must equal the touching triangle's number: X = 4.",
        'Dengan aturan pencocokan, X harus sama dengan angka segitiga yang bersentuhan: X = 4.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      showEdgeHighlight: false,
      showConstraintLabel: false,
      showAnswer: true,
      equation: 'X = 4 → D',
      hold: 0,
      result: true,
      caption: t(
        'The triangle marked X must be 4 — answer D.',
        'Segitiga bertanda X harus bernilai 4 — jawaban D.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
