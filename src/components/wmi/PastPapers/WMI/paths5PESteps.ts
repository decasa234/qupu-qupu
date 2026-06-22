// IKMC-21-PE-Q5 — storyboard for the "longest path" explainer animation.
//
// Question: "Which of the paths shown in the pictures is the longest?"
// Answer: A (34 grid segments — the most).
//
// Key insight:
//   A longer path doesn't have to cover more AREA — it travels more total
//   distance. A zigzag path uses more steps than a straight path that spans
//   the same width/height. Count the grid segments (each horizontal or
//   vertical step between adjacent lattice points) to compare length.
//
//   Segment counts (each unit segment = 1 step):
//     A: 34 segments ← longest (answer)
//     B: 28 segments
//     C: 26 segments
//     D: 24 segments
//     E: 20 segments  ← shortest
//
// Teaching walk, one idea per beat:
//   0. intro     — lengths aren't obvious from area; trace and count.
//   1. countE    — count E: 20 segments. Simple staircase.
//   2. countD    — count D: 24 segments. Compact zigzag.
//   3. countC    — count C: 26 segments. Medium spiral.
//   4. countB    — count B: 28 segments. Long S-path.
//   5. countA    — count A: 34 segments. Dense winding — the most!
//   6. result    — A has the most segments → A is the longest path.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type Paths5PhaseId =
  | 'intro'
  | 'countE'
  | 'countD'
  | 'countC'
  | 'countB'
  | 'countA'
  | 'result'

export interface Paths5Beat {
  /** Animation phase identifier. */
  phase: Paths5PhaseId
  /**
   * Which path label is being highlighted ('A'–'E'), or null for non-path beats.
   */
  activeLabel: 'A' | 'B' | 'C' | 'D' | 'E' | null
  /** Segment count shown for the active path (null to hide). */
  segments: number | null
  /** Whether this is the answer path (A). */
  isAnswer: boolean
  /** Equation or count chip text; '' to hide. */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual stop). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface Paths5Storyboard {
  steps: Paths5Beat[]
  finalIndex: number
}

export function buildPaths5PESteps(lang: Lang): Paths5Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Paths5Beat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      activeLabel: null,
      segments: null,
      isAnswer: false,
      equation: '',
      hold: 2400,
      result: false,
      caption: t(
        'A path\'s length = total grid steps it travels. A zigzag path can be longer than a straight path that covers the same area!',
        'Panjang jalur = total langkah kotak yang ditempuh. Jalur berliku bisa lebih panjang dari jalur lurus yang menutupi area yang sama!',
      ),
    },

    // Beat 1 — count E (shortest)
    {
      phase: 'countE',
      activeLabel: 'E',
      segments: 20,
      isAnswer: false,
      equation: 'E: 20',
      hold: 2000,
      result: false,
      caption: t(
        'Path E: simple staircase — 20 grid steps.',
        'Jalur E: tangga sederhana — 20 langkah kotak.',
      ),
    },

    // Beat 2 — count D
    {
      phase: 'countD',
      activeLabel: 'D',
      segments: 24,
      isAnswer: false,
      equation: 'D: 24',
      hold: 2000,
      result: false,
      caption: t(
        'Path D: compact zigzag — 24 grid steps.',
        'Jalur D: zigzag kompak — 24 langkah kotak.',
      ),
    },

    // Beat 3 — count C
    {
      phase: 'countC',
      activeLabel: 'C',
      segments: 26,
      isAnswer: false,
      equation: 'C: 26',
      hold: 2000,
      result: false,
      caption: t(
        'Path C: medium spiral — 26 grid steps.',
        'Jalur C: spiral sedang — 26 langkah kotak.',
      ),
    },

    // Beat 4 — count B
    {
      phase: 'countB',
      activeLabel: 'B',
      segments: 28,
      isAnswer: false,
      equation: 'B: 28',
      hold: 2000,
      result: false,
      caption: t(
        'Path B: long S-path — 28 grid steps.',
        'Jalur B: jalur-S panjang — 28 langkah kotak.',
      ),
    },

    // Beat 5 — count A (answer, most segments)
    {
      phase: 'countA',
      activeLabel: 'A',
      segments: 34,
      isAnswer: true,
      equation: 'A: 34 ✓',
      hold: 2200,
      result: false,
      caption: t(
        'Path A: dense winding path — 34 grid steps. The most of all five!',
        'Jalur A: jalur berliku padat — 34 langkah kotak. Terbanyak dari semua lima!',
      ),
    },

    // Beat 6 — result
    {
      phase: 'result',
      activeLabel: 'A',
      segments: 34,
      isAnswer: true,
      equation: '34 > 28 > 26 > 24 > 20',
      hold: 0,
      result: true,
      caption: t(
        'Path A has the most grid steps (34) → Path A is the longest. Answer: A.',
        'Jalur A memiliki langkah kotak terbanyak (34) → Jalur A paling panjang. Jawaban: A.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
