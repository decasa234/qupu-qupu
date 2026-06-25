// gridPathX22B10Steps.ts
// SEAMOX-22-B-Q10 — animation storyboard for the U-shaped path-counting grid.
//
// Grid layout (col, row), row 0 = top:
//   Left arm:  cols 0-3, rows 0-2  (A at (0,0))
//   Bridge:    (2,3) → (2,4)
//   Right arm: cols 4-7, rows 0-2  (B at (0,7))
//
// Path counts (filled by Pascal-triangle addition rule):
//   Left arm:
//     row 0: 1  1  1  1
//     row 1: 1  2  3  4
//     row 2: 1  3  6  10
//   Right arm:
//     row 2: 10 10 10 10
//     row 1: 10 20 30 40
//     row 0: 10 30 60 100
//
// Beats:
//   0. intro      — empty grid, A=1
//   1. left-top   — fill left arm row 0 (1,1,1,1)
//   2. left-mid   — fill left arm row 1 (1,2,3,4)
//   3. left-bot   — fill left arm row 2 (1,3,6,10)
//   4. bridge     — carry 10 across bridge to right arm (2,4)=10
//   5. right-bot  — fill right arm row 2 (10,10,10,10)
//   6. right-mid  — fill right arm row 1 (10,20,30,40)
//   7. right-top  — fill right arm row 0 (10,30,60,100)
//   8. result     — highlight B=100

export type Lang = 'en' | 'id'

/** A labeled node in the grid. */
export interface PathNode {
  col: number
  row: number
  count: number
  highlight?: boolean
}

export interface PathBeat {
  phase: string
  /** Nodes whose labels are visible at this beat (cumulative). */
  nodes: PathNode[]
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface PathStoryboard {
  steps: PathBeat[]
  finalIndex: number
}

// Left arm counts (row, col indexed; col 0-3, row 0-2)
const LEFT: number[][] = [
  [1, 1, 1,  1],   // row 0
  [1, 2, 3,  4],   // row 1
  [1, 3, 6, 10],   // row 2
]

// Right arm counts (row, col indexed; col 4-7, row 0-2)
const RIGHT: number[][] = [
  [10, 30, 60, 100],  // row 0
  [10, 20, 30,  40],  // row 1
  [10, 10, 10,  10],  // row 2
]

function leftNodes(maxRow: number): PathNode[] {
  const out: PathNode[] = []
  for (let r = 0; r <= maxRow && r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      out.push({ col: c, row: r, count: LEFT[r][c] })
    }
  }
  return out
}

function rightNodes(minRow: number): PathNode[] {
  const out: PathNode[] = []
  for (let r = minRow; r >= 0; r--) {
    for (let c = 0; c < 4; c++) {
      out.push({ col: c + 4, row: r, count: RIGHT[r][c] })
    }
  }
  return out
}

export function buildGridPathX22B10Steps(lang: Lang): PathStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PathBeat[] = [
    // 0: intro
    {
      phase: 'intro',
      nodes: [{ col: 0, row: 0, count: 1, highlight: true }],
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'There is exactly 1 way to start from A. Label each intersection with the running path count.',
        'Hanya ada 1 cara memulai dari A. Beri label setiap persimpangan dengan jumlah lintasan.',
      ),
    },
    // 1: left row 0
    {
      phase: 'left-top',
      nodes: leftNodes(0),
      equation: '1 → 1 → 1 → 1',
      hold: 2000,
      result: false,
      caption: t(
        'Along the top row of the left arm you can only go right — so every node is 1.',
        'Di baris atas lengan kiri kamu hanya bisa ke kanan — setiap simpul bernilai 1.',
      ),
    },
    // 2: left row 1
    {
      phase: 'left-mid',
      nodes: leftNodes(1),
      equation: '1  2  3  4',
      hold: 2000,
      result: false,
      caption: t(
        'Second row: each node = (node above) + (node to the left) — counts go 1, 2, 3, 4.',
        'Baris kedua: tiap simpul = (simpul di atas) + (simpul di kirinya) — nilainya 1, 2, 3, 4.',
      ),
    },
    // 3: left row 2 (bottom)
    {
      phase: 'left-bot',
      nodes: leftNodes(2),
      equation: '1  3  6  10',
      hold: 2200,
      result: false,
      caption: t(
        'Bottom row: 1, 3, 6, 10. The junction node (bottom-right) has 10 paths from A.',
        'Baris bawah: 1, 3, 6, 10. Simpul pertemuan (kanan bawah) memiliki 10 lintasan dari A.',
      ),
    },
    // 4: bridge
    {
      phase: 'bridge',
      nodes: [
        ...leftNodes(2),
        { col: 4, row: 2, count: 10, highlight: true },
      ],
      equation: '10 → 10',
      hold: 2000,
      result: false,
      caption: t(
        'Cross the bridge: all 10 paths carry over to the first node of the right arm.',
        'Lintasi jembatan: semua 10 lintasan terbawa ke simpul pertama lengan kanan.',
      ),
    },
    // 5: right row 2 (bottom)
    {
      phase: 'right-bot',
      nodes: [
        ...leftNodes(2),
        ...rightNodes(2),
      ],
      equation: '10  10  10  10',
      hold: 2000,
      result: false,
      caption: t(
        'Bottom row of right arm (right-only): each node stays at 10.',
        'Baris bawah lengan kanan (hanya ke kanan): setiap simpul tetap 10.',
      ),
    },
    // 6: right row 1
    {
      phase: 'right-mid',
      nodes: [
        ...leftNodes(2),
        ...rightNodes(1),
      ],
      equation: '10  20  30  40',
      hold: 2200,
      result: false,
      caption: t(
        'Middle row: each node = (node to the left) + (node below). Counts: 10, 20, 30, 40.',
        'Baris tengah: tiap simpul = (kiri) + (bawah). Nilainya: 10, 20, 30, 40.',
      ),
    },
    // 7: right row 0 (top → B)
    {
      phase: 'right-top',
      nodes: [
        ...leftNodes(2),
        ...rightNodes(0),
      ],
      equation: '10  30  60  100',
      hold: 2200,
      result: false,
      caption: t(
        'Top row: 10, 30, 60, 100. Point B gets 100 paths.',
        'Baris atas: 10, 30, 60, 100. Titik B mendapat 100 lintasan.',
      ),
    },
    // 8: result
    {
      phase: 'result',
      nodes: [
        ...leftNodes(2),
        ...rightNodes(0).map((n) =>
          n.col === 7 && n.row === 0 ? { ...n, highlight: true } : n
        ),
      ],
      equation: 'C(5,2) × C(5,2) = 10 × 10 = 100',
      hold: 0,
      result: true,
      caption: t(
        'The number of paths from A to B is 100.',
        'Jumlah lintasan dari A ke B adalah 100.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
