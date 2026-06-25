// SEAMO-22-B-Q19 — storyboard for the L-shaped grid shortest-path animation.
//
// The question: Find the number of shortest paths from A to B on an L-shaped grid.
// Upper block: 2 cells wide × 3 cells tall (nodes cols 0-2, rows 0-3)
// Lower block: 5 cells wide × 2 cells tall (nodes cols 0-5, rows 3-5)
// A = (0,0), B = (5,5)
// Answer: E (126)
//
// Teaching walk — Pascal's triangle fill on the L-grid:
//   0. intro     — empty L-grid with A and B; shortest paths go only → or ↓.
//   1. edges     — top row (all 1s) and left column (all 1s) labelled.
//   2. upper     — fill Pascal in the narrow upper block (cols 0-2, rows 1-3).
//   3. junction  — row 3 spreads rightward: (3,3)=10, (4,3)=10, (5,3)=10.
//   4. lower     — fill rows 4-5 of the wide lower block.
//   5. result    — highlight B = 126 → answer E.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PathPhaseId = 'intro' | 'edges' | 'upper' | 'junction' | 'lower' | 'result'

export interface PathBeat {
  phase: PathPhaseId
  /** How many node rows (0-indexed) to show labels for (0 = none, 6 = all). */
  revealUpToRow: number
  /** Whether to highlight the B node (bottom-right). */
  highlightB: boolean
  /** Equation line shown below the figure; '' to hide. */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface PathStoryboard {
  steps: PathBeat[]
  finalIndex: number
}

// Pascal-triangle counts for the L-grid.
// Valid nodes: (col, row) where (col ≤ 2 and row ≤ 3) OR (row ≥ 3 and col ≤ 5).
// A = (0,0) → count = 1. Propagate right and down within L-region.
//
// Precomputed counts indexed as COUNTS[row][col]:
export const COUNTS: Array<Array<number | null>> = [
  // row 0: upper block only (cols 0-2), beyond = null
  [1, 1, 1, null, null, null],
  // row 1
  [1, 2, 3, null, null, null],
  // row 2
  [1, 3, 6, null, null, null],
  // row 3: junction row — upper merges into lower; cols 0-5 open
  [1, 4, 10, 10, 10, 10],
  // row 4
  [1, 5, 15, 25, 35, 45],
  // row 5
  [1, 6, 21, 46, 81, 126],
]

export function buildLShortPath22B19Steps(lang: Lang): PathStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PathBeat[] = [
    // Beat 0 — intro: empty L-grid, state the rule
    {
      phase: 'intro',
      revealUpToRow: -1,
      highlightB: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Shortest paths from A to B move only right (→) or down (↓). Count how many ways to reach each node.',
        'Lintasan terpendek dari A ke B hanya bergerak ke kanan (→) atau ke bawah (↓). Hitung banyak cara mencapai setiap simpul.',
      ),
    },

    // Beat 1 — fill top row and left column (all 1s)
    {
      phase: 'edges',
      revealUpToRow: 0,
      highlightB: false,
      equation: '→ only = 1 way',
      hold: 2200,
      result: false,
      caption: t(
        'Every node in the top row has exactly 1 path (keep going right). Every node in the left column also has 1 path (keep going down).',
        'Setiap simpul di baris atas memiliki tepat 1 jalur (terus ke kanan). Setiap simpul di kolom kiri juga memiliki 1 jalur (terus ke bawah).',
      ),
    },

    // Beat 2 — fill the upper narrow block (rows 1-3)
    {
      phase: 'upper',
      revealUpToRow: 3,
      highlightB: false,
      equation: 'paths[r][c] = left + above',
      hold: 2500,
      result: false,
      caption: t(
        'In the narrow upper block, each node = paths from its left + paths from above. The junction corner (col 2, row 3) gets 10 paths.',
        'Di blok atas yang sempit, tiap simpul = jalur dari kiri + jalur dari atas. Sudut persimpangan (kolom 2, baris 3) mendapat 10 jalur.',
      ),
    },

    // Beat 3 — junction row opens right (row 3, cols 3-5 = 10 each)
    {
      phase: 'junction',
      revealUpToRow: 3,
      highlightB: false,
      equation: '10 → 10 → 10 → 10',
      hold: 2200,
      result: false,
      caption: t(
        'At the junction row the grid widens. Columns 3, 4, 5 each inherit 10 (the only path in from the left edge of the lower block).',
        'Di baris persimpangan, grid melebar. Kolom 3, 4, 5 masing-masing mewarisi 10 (satu-satunya jalur masuk dari sisi kiri blok bawah).',
      ),
    },

    // Beat 4 — fill lower block rows 4-5
    {
      phase: 'lower',
      revealUpToRow: 5,
      highlightB: false,
      equation: '45 + 81 = 126',
      hold: 2500,
      result: false,
      caption: t(
        'Pascal fill continues through the lower block. Row 4: 1, 5, 15, 25, 35, 45. Row 5: 1, 6, 21, 46, 81, 126.',
        'Isian Pascal berlanjut di blok bawah. Baris 4: 1, 5, 15, 25, 35, 45. Baris 5: 1, 6, 21, 46, 81, 126.',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      revealUpToRow: 5,
      highlightB: true,
      equation: '126 → E',
      hold: 0,
      result: true,
      caption: t(
        'B gets 126 shortest paths — answer E (126).',
        'B mendapat 126 lintasan terpendek — jawaban E (126).',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
