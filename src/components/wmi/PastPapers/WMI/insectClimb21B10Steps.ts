import type { Lang } from '../../concepts/explainers/makeTenSteps'

// ── step types ────────────────────────────────────────────────────────────────

export type InsectPhase =
  | 'intro'       // show the figure, no paths highlighted
  | 'count-ab'    // enumerate the 3 A→B paths
  | 'count-bc'    // enumerate the 3 B→C paths
  | 'multiply'    // 3 × 3 = 9
  | 'result'      // confirm answer B (9)

export interface InsectStep {
  phase: InsectPhase
  /** Which A→B paths to highlight (0-based index, up to 3). */
  abPaths: number[]
  /** Which B→C paths to highlight (0-based index, up to 3). */
  bcPaths: number[]
  /** Whether to show the multiplication equation panel. */
  showEquation: boolean
  caption: string
  hold: number
}

export interface InsectStoryboard {
  steps: InsectStep[]
  finalIndex: number
}

// ── path definitions (shared with explainer) ─────────────────────────────────
//
// Each A→B path is a sequence of lattice (col, row) coordinates:
//   RRU = (0,2)→(1,2)→(2,2)→(2,1)
//   RUR = (0,2)→(1,2)→(1,1)→(2,1)
//   URR = (0,2)→(0,1)→(1,1)→(2,1)
//
// Each B→C path (mirrored into the right rectangle):
//   RRU = (2,1)→(3,1)→(4,1)→(4,0)
//   RUR = (2,1)→(3,1)→(3,0)→(4,0)
//   URR = (2,1)→(2,0)→(3,0)→(4,0)

export const AB_PATHS: Array<Array<[number, number]>> = [
  [[0,2],[1,2],[2,2],[2,1]], // RRU
  [[0,2],[1,2],[1,1],[2,1]], // RUR
  [[0,2],[0,1],[1,1],[2,1]], // URR
]

export const BC_PATHS: Array<Array<[number, number]>> = [
  [[2,1],[3,1],[4,1],[4,0]], // RRU
  [[2,1],[3,1],[3,0],[4,0]], // RUR
  [[2,1],[2,0],[3,0],[4,0]], // URR
]

// ── storyboard builder ───────────────────────────────────────────────────────

export function buildInsectClimb21B10Steps(lang: Lang): InsectStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: InsectStep[] = [
    // Beat 0 — intro: show the figure
    {
      phase: 'intro',
      abPaths: [],
      bcPaths: [],
      showEquation: false,
      hold: 1800,
      caption: t(
        'The insect must pass through B. Split the journey into two legs: A → B and B → C.',
        'Serangga harus melewati B. Bagi perjalanan menjadi dua bagian: A → B dan B → C.',
      ),
    },
    // Beats 1–3 — count A→B paths one at a time
    {
      phase: 'count-ab',
      abPaths: [0],
      bcPaths: [],
      showEquation: false,
      hold: 1500,
      caption: t(
        'A → B path 1: Right, Right, Up (RRU).',
        'Jalur A → B ke-1: Kanan, Kanan, Atas (KKA).',
      ),
    },
    {
      phase: 'count-ab',
      abPaths: [0, 1],
      bcPaths: [],
      showEquation: false,
      hold: 1500,
      caption: t(
        'A → B path 2: Right, Up, Right (RUR). That\'s 2 so far.',
        'Jalur A → B ke-2: Kanan, Atas, Kanan (KAK). Sudah 2 jalur.',
      ),
    },
    {
      phase: 'count-ab',
      abPaths: [0, 1, 2],
      bcPaths: [],
      showEquation: false,
      hold: 1600,
      caption: t(
        'A → B path 3: Up, Right, Right (URR). Total A→B = 3 paths.',
        'Jalur A → B ke-3: Atas, Kanan, Kanan (AKK). Total A→B = 3 jalur.',
      ),
    },
    // Beats 4–6 — count B→C paths one at a time
    {
      phase: 'count-bc',
      abPaths: [0, 1, 2],
      bcPaths: [0],
      showEquation: false,
      hold: 1500,
      caption: t(
        'B → C path 1: Right, Right, Up (RRU).',
        'Jalur B → C ke-1: Kanan, Kanan, Atas (KKA).',
      ),
    },
    {
      phase: 'count-bc',
      abPaths: [0, 1, 2],
      bcPaths: [0, 1],
      showEquation: false,
      hold: 1500,
      caption: t(
        'B → C path 2: Right, Up, Right (RUR). That\'s 2 so far.',
        'Jalur B → C ke-2: Kanan, Atas, Kanan (KAK). Sudah 2 jalur.',
      ),
    },
    {
      phase: 'count-bc',
      abPaths: [0, 1, 2],
      bcPaths: [0, 1, 2],
      showEquation: false,
      hold: 1600,
      caption: t(
        'B → C path 3: Up, Right, Right (URR). Total B→C = 3 paths.',
        'Jalur B → C ke-3: Atas, Kanan, Kanan (AKK). Total B→C = 3 jalur.',
      ),
    },
    // Beat 7 — multiply
    {
      phase: 'multiply',
      abPaths: [0, 1, 2],
      bcPaths: [0, 1, 2],
      showEquation: true,
      hold: 2000,
      caption: t(
        'Total paths = A→B × B→C = 3 × 3 = 9.',
        'Total jalur = A→B × B→C = 3 × 3 = 9.',
      ),
    },
    // Beat 8 — result
    {
      phase: 'result',
      abPaths: [0, 1, 2],
      bcPaths: [0, 1, 2],
      showEquation: true,
      hold: 0,
      caption: t(
        '9 ways — the answer is B.',
        '9 cara — jawabannya adalah B.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
