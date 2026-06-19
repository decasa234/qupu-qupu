// IKMC-19-PE-Q17 — storyboard for the cat-path animation.
//
// The question: A cat is at the top-left corner of a 3×3 grid.  A milk bowl is
// at the bottom-right corner.  The cat can only move RIGHT or DOWN.  In how many
// ways can the cat reach the milk?
//
// Mathematical structure: monotone lattice paths on a 3×3 grid require exactly
// 2 RIGHT moves and 2 DOWN moves — total 4 moves arranged in some order.
// The count is C(4,2) = 6.
//
// Animation strategy — enumerate one path per beat, show a running counter:
//   0. intro   — show the static grid; cat at (0,0), milk at (2,2).
//   1. path 1  — R R D D  (→→↓↓)  counter: 1
//   2. path 2  — R D R D  (→↓→↓)  counter: 2
//   3. path 3  — R D D R  (→↓↓→)  counter: 3
//   4. path 4  — D R R D  (↓→→↓)  counter: 4
//   5. path 5  — D R D R  (↓→↓→)  counter: 5
//   6. path 6  — D D R R  (↓↓→→)  counter: 6
//   7. result  — all 6 paths fade to green; "Answer E" banner.
//
// Each path is represented as a sequence of [col, row] lattice nodes
// (4 steps → 5 nodes including start and end).
//
// Pure builder: (lang) → storyboard.  No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type CatPhaseId = 'intro' | 'path' | 'result'

/** A [col, row] lattice node on the 3×3 grid (nodes 0–2 in each axis). */
export type Node = [number, number]

export interface CatBeat {
  phase: CatPhaseId
  /** Paths shown as coloured trails.  Each entry has the node sequence and a colour string. */
  paths: Array<{ nodes: Node[]; color: string }>
  /** Running count of enumerated paths so far (shown as a badge). */
  count: number
  /** Equation / label text shown below the figure; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface CatStoryboard {
  steps: CatBeat[]
  finalIndex: number
}

// ── Path definitions ──────────────────────────────────────────────────────────────────────────
//
// Notation: R = right (+1 col), D = down (+1 row).
// Each path starts at (0,0) and ends at (2,2).

/** All 6 monotone paths from (0,0) to (2,2). */
export const ALL_PATHS: Node[][] = [
  // Path 1: R R D D
  [[0,0],[1,0],[2,0],[2,1],[2,2]],
  // Path 2: R D R D
  [[0,0],[1,0],[1,1],[2,1],[2,2]],
  // Path 3: R D D R
  [[0,0],[1,0],[1,1],[1,2],[2,2]],
  // Path 4: D R R D
  [[0,0],[0,1],[1,1],[2,1],[2,2]],
  // Path 5: D R D R
  [[0,0],[0,1],[1,1],[1,2],[2,2]],
  // Path 6: D D R R
  [[0,0],[0,1],[0,2],[1,2],[2,2]],
]

// Progressive colour palette: each new path gets a distinct colour
const PATH_COLORS = [
  '#3B82F6', // blue
  '#F59E0B', // amber
  '#10B981', // green
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
]

const RESULT_COLOR = '#10B981'

// ── Builder ───────────────────────────────────────────────────────────────────────────────────

export function buildCatPath17Steps(lang: Lang): CatStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CatBeat[] = []

  // Beat 0 — intro
  steps.push({
    phase: 'intro',
    paths: [],
    count: 0,
    equation: '',
    hold: 2000,
    result: false,
    caption: t(
      'The cat is at the top-left. The milk is at the bottom-right. The cat can only move RIGHT or DOWN.',
      'Kucing ada di sudut kiri atas. Susu ada di sudut kanan bawah. Kucing hanya boleh bergerak KE KANAN atau KE BAWAH.',
    ),
  })

  // Beats 1–6 — one path revealed per beat
  for (let i = 0; i < 6; i++) {
    const activePath = { nodes: ALL_PATHS[i], color: PATH_COLORS[i] }
    const prevPaths = ALL_PATHS.slice(0, i).map((nodes, j) => ({
      nodes,
      color: PATH_COLORS[j],
    }))

    const moves = movesLabel(ALL_PATHS[i])

    steps.push({
      phase: 'path',
      paths: [...prevPaths, activePath],
      count: i + 1,
      equation: `${t('Path', 'Jalur')} ${i + 1}: ${moves}`,
      hold: 2200,
      result: false,
      caption: t(
        `Path ${i + 1} of 6: ${moves}. ${i + 1 < 6 ? 'Keep looking for more.' : 'That is all 6 paths!'}`,
        `Jalur ${i + 1} dari 6: ${moves}. ${i + 1 < 6 ? 'Cari jalur lainnya.' : 'Itulah 6 jalur!'}`,
      ),
    })
  }

  // Beat 7 — result: all 6 paths shown in green
  steps.push({
    phase: 'result',
    paths: ALL_PATHS.map((nodes) => ({ nodes, color: RESULT_COLOR })),
    count: 6,
    equation: t('6 paths → E', '6 jalur → E'),
    hold: 0,
    result: true,
    caption: t(
      'There are 6 ways the cat can reach the milk — answer E.',
      'Ada 6 cara kucing mencapai susu — jawaban E.',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}

/** Build a short move-sequence string like "→→↓↓" from a node sequence. */
function movesLabel(nodes: Node[]): string {
  const parts: string[] = []
  for (let i = 1; i < nodes.length; i++) {
    const dc = nodes[i][0] - nodes[i - 1][0]
    const dr = nodes[i][1] - nodes[i - 1][1]
    if (dc === 1) parts.push('→')
    else if (dr === 1) parts.push('↓')
  }
  return parts.join('')
}
