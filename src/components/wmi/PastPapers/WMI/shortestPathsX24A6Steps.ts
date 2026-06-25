// shortestPathsX24A6Steps.ts
// SEAMO-X 2024 Paper A Q6 — path-count storyboard for the 4×4 node grid.
//
// Grid (col, row), top-left = (0,0):
//   Nodes: col 0-3, row 0-3 (3×3 cells).
//   A = (0,0) = start = 1 path.
//   B = (3,3) = goal  = 8 paths.
//   x = (1,1) = blocked = 0.
//
// Pascal-triangle fill (right/down only, blocked cell = 0):
//   row 0: 1  1  1  1
//   row 1: 1  0  1  2   ← (1,1)=0 blocked
//   row 2: 1  1  2  4
//   row 3: 1  2  4  8   ← B = 8
//
// Beats:
//   0. intro      — A = 1; explain the rule
//   1. edges      — fill row 0 and col 0 (all 1s)
//   2. block      — show x = 0 prominently
//   3. row1-rest  — fill (2,1)=1 and (3,1)=2
//   4. row2       — fill (1,2)=1, (2,2)=2, (3,2)=4
//   5. row3       — fill (1,3)=2, (2,3)=4, (3,3)=8
//   6. result     — highlight B = 8

export type Lang = 'en' | 'id'

/** A labelled node in the grid. */
export interface PathNode {
  col: number
  row: number
  count: number
  /** true = render in amber (building beat) or green (result beat). */
  highlight?: boolean
}

export interface PathBeat {
  phase: string
  /** All nodes whose labels are visible at this beat (cumulative). */
  nodes: PathNode[]
  equation: string
  caption: string
  /** Auto-advance delay in ms (0 = final beat, held until user advances). */
  hold: number
  result: boolean
}

export interface PathStoryboard {
  steps: PathBeat[]
  finalIndex: number
}

// ── Grid values ───────────────────────────────────────────────────────────────

// COUNTS[row][col] — 0 = blocked at (1,1)
const COUNTS: number[][] = [
  [1, 1, 1, 1],  // row 0
  [1, 0, 1, 2],  // row 1  — (1,1) blocked
  [1, 1, 2, 4],  // row 2
  [1, 2, 4, 8],  // row 3
]

function node(col: number, row: number, highlight = false): PathNode {
  return { col, row, count: COUNTS[row][col], highlight }
}

/** All edge nodes: row 0 (all cols) + col 0 (all rows) — forms the L-border. */
function edgeNodes(): PathNode[] {
  const out: PathNode[] = []
  for (let c = 0; c <= 3; c++) out.push(node(c, 0))   // row 0
  for (let r = 1; r <= 3; r++) out.push(node(0, r))   // col 0 (skip (0,0) dup)
  return out
}

// ── Storyboard builder ────────────────────────────────────────────────────────

export function buildShortestPathsX24A6Steps(lang: Lang): PathStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PathBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      nodes: [node(0, 0, true)],
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'Label each intersection with the number of ways to reach it using only → and ↓. Start: A = 1.',
        'Beri label setiap persimpangan dengan jumlah cara mencapainya menggunakan → dan ↓. Mulai: A = 1.',
      ),
    },

    // Beat 1 — top row + left column (all 1s on the boundary)
    {
      phase: 'edges',
      nodes: edgeNodes(),
      equation: '1  1  1  1  (edges = 1)',
      hold: 2200,
      result: false,
      caption: t(
        'The top row and left column have only one path each — you can only go in one direction.',
        'Baris atas dan kolom kiri hanya punya satu jalur — kamu hanya bisa bergerak satu arah.',
      ),
    },

    // Beat 2 — show the blocked node x = 0
    {
      phase: 'block',
      nodes: [
        ...edgeNodes(),
        { col: 1, row: 1, count: 0, highlight: true },
      ],
      equation: 'x = 0  (blocked)',
      hold: 2400,
      result: false,
      caption: t(
        'The intersection x is blocked: set its count to 0. No path may pass through it.',
        'Persimpangan x terblokir: tetapkan nilainya 0. Tidak ada jalur yang boleh melewatinya.',
      ),
    },

    // Beat 3 — fill rest of row 1: (2,1)=1, (3,1)=2
    {
      phase: 'row1-rest',
      nodes: [
        ...edgeNodes(),
        { col: 1, row: 1, count: 0 },
        node(2, 1, true),
        node(3, 1, true),
      ],
      equation: '(2,1) = 0 + 1 = 1 │ (3,1) = 1 + 1 = 2',
      hold: 2400,
      result: false,
      caption: t(
        'Row 1, remaining nodes: each = (node above) + (node to the left). Node (3,1) = 2.',
        'Baris 1, simpul lainnya: setiap simpul = (di atas) + (di kiri). Simpul (3,1) = 2.',
      ),
    },

    // Beat 4 — fill row 2: (1,2)=1, (2,2)=2, (3,2)=4
    {
      phase: 'row2',
      nodes: [
        ...edgeNodes(),
        { col: 1, row: 1, count: 0 },
        node(2, 1),
        node(3, 1),
        node(1, 2, true),
        node(2, 2, true),
        node(3, 2, true),
      ],
      equation: '1  2  4',
      hold: 2400,
      result: false,
      caption: t(
        'Row 2: (1,2) = 0+1 = 1; (2,2) = 1+1 = 2; (3,2) = 2+2 = 4.',
        'Baris 2: (1,2) = 0+1 = 1; (2,2) = 1+1 = 2; (3,2) = 2+2 = 4.',
      ),
    },

    // Beat 5 — fill row 3: (1,3)=2, (2,3)=4, (3,3)=8
    {
      phase: 'row3',
      nodes: [
        ...edgeNodes(),
        { col: 1, row: 1, count: 0 },
        node(2, 1),
        node(3, 1),
        node(1, 2),
        node(2, 2),
        node(3, 2),
        node(1, 3, true),
        node(2, 3, true),
        node(3, 3, true),
      ],
      equation: '2  4  8',
      hold: 2400,
      result: false,
      caption: t(
        'Row 3: (1,3) = 1+1 = 2; (2,3) = 2+2 = 4; (3,3) = 4+4 = 8. B is reached!',
        'Baris 3: (1,3) = 1+1 = 2; (2,3) = 2+2 = 4; (3,3) = 4+4 = 8. B tercapai!',
      ),
    },

    // Beat 6 — result
    {
      phase: 'result',
      nodes: [
        ...edgeNodes(),
        { col: 1, row: 1, count: 0 },
        node(2, 1),
        node(3, 1),
        node(1, 2),
        node(2, 2),
        node(3, 2),
        node(1, 3),
        node(2, 3),
        { col: 3, row: 3, count: 8, highlight: true },
      ],
      equation: 'B = 8 paths ✓',
      hold: 0,
      result: true,
      caption: t(
        'The number of shortest paths from A to B, avoiding x, is 8.',
        'Jumlah jalur terpendek dari A ke B, menghindari x, adalah 8.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
