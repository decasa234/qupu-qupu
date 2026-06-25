// SEAMOX-23-A-Q15 — storyboard for the staircase shortest-path animation.
//
// The question: Find the number of shortest paths from A to B.
// Staircase has 4 rows of cells (widths 4,3,2,1 bottom-to-top).
// Valid cells: C >= R  (col >= row, both 0-indexed from bottom-left).
// Nodes: x=0..4, y=0..4 in math coords (y=0 = bottom, y=4 = top).
// A = (0,0) bottom-left, B = (4,4) top-right.
//
// Movement rules:
//   RIGHT from (x,y) → (x+1,y): valid if x >= y−1
//   UP    from (x,y) → (x,y+1): valid if x >= y
//
// Pascal fill result — paths(x,y):
//   y=0: [1, 1, 1, 1, 1]
//   y=1: [1, 2, 3, 4, 5]
//   y=2: [−, 2, 5, 9, 14]   (x=0 unreachable)
//   y=3: [−, −, 5, 14, 28]
//   y=4: [−, −, −, 14, 42]  ← B = 42
//
// Answer: 42
//
// Pure builder: (lang) → storyboard. No Date, no random, SSR-safe.

export type Lang = 'en' | 'id'

export type StaircasePhaseId =
  | 'intro'
  | 'bottom'
  | 'row1'
  | 'row2'
  | 'row3'
  | 'result'

export interface StaircaseBeat {
  phase: StaircasePhaseId
  /** Show counts for all rows with y <= revealUpToRow (−1 = none). */
  revealUpToRow: number
  highlightB: boolean
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface StaircaseStoryboard {
  steps: StaircaseBeat[]
  finalIndex: number
}

// Pascal counts indexed as COUNTS[y][x].
// null  = node outside the staircase or unreachable by valid moves.
export const COUNTS: Array<Array<number | null>> = [
  // y=0 (bottom row): x=0..4, all reachable by moving right
  [1, 1, 1, 1, 1],
  // y=1: x=0 reachable via the UP move along the step boundary
  [1, 2, 3, 4, 5],
  // y=2: x=0 not reachable (no valid UP from (0,1), no valid RIGHT into (0,2))
  [null, 2, 5, 9, 14],
  // y=3
  [null, null, 5, 14, 28],
  // y=4 (top row)
  [null, null, null, 14, 42],
]

export function buildStaircasePathX23A15Steps(lang: Lang): StaircaseStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: StaircaseBeat[] = [
    // Beat 0 — intro: empty staircase, state the rule
    {
      phase: 'intro',
      revealUpToRow: -1,
      highlightB: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Shortest paths move only right (→) or up (↑). Count the number of ways to reach each node.',
        'Jalur terpendek hanya bergerak ke kanan (→) atau ke atas (↑). Hitung banyak cara mencapai setiap simpul.',
      ),
    },

    // Beat 1 — bottom row (y=0): all 1s
    {
      phase: 'bottom',
      revealUpToRow: 0,
      highlightB: false,
      equation: '→ only = 1 way',
      hold: 2200,
      result: false,
      caption: t(
        'Start at A = 1. Moving right along the bottom row, every node has exactly 1 path. Going up from A puts 1 on the step corner (0,1).',
        'Mulai dari A = 1. Bergerak ke kanan sepanjang baris bawah, setiap simpul memiliki tepat 1 jalur.',
      ),
    },

    // Beat 2 — row y=1: [1, 2, 3, 4, 5]
    {
      phase: 'row1',
      revealUpToRow: 1,
      highlightB: false,
      equation: 'paths = left + below',
      hold: 2400,
      result: false,
      caption: t(
        'Row 1: each node = paths from its left + paths from below. The step corner (0,1) = 1 (from below only). Then 1+1=2, 2+1=3, 3+1=4, 4+1=5.',
        'Baris 1: tiap simpul = jalur dari kiri + jalur dari bawah. Sudut tangga (0,1) = 1. Lalu 1+1=2, 2+1=3, 3+1=4, 4+1=5.',
      ),
    },

    // Beat 3 — rows y=2,3
    {
      phase: 'row2',
      revealUpToRow: 3,
      highlightB: false,
      equation: '2+3=5 · 5+4=9 · 9+5=14',
      hold: 2500,
      result: false,
      caption: t(
        'Rows 2 and 3: the step corners (1,2) and (2,3) inherit only from below. Fill in: 2+3=5, 5+4=9, 9+5=14; then 5+9=14, 14+14=28.',
        'Baris 2 dan 3: sudut langkah mewarisi dari bawah saja. Isi: 2+3=5, 5+4=9, 9+5=14; lalu 5+9=14, 14+14=28.',
      ),
    },

    // Beat 4 — row y=4 + result
    {
      phase: 'result',
      revealUpToRow: 4,
      highlightB: true,
      equation: '14 + 28 = 42',
      hold: 0,
      result: true,
      caption: t(
        'Last row: (3,4) = 14 (from below only); B = (4,4) = 14 + 28 = 42. There are 42 shortest paths from A to B.',
        'Baris terakhir: (3,4) = 14 (dari bawah saja); B = (4,4) = 14 + 28 = 42. Ada 42 jalur terpendek dari A ke B.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
