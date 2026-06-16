import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { Q25_GRID, Q25_OTHER_WAYS, Q25_TOTAL_WAYS } from './P20G1Q25Illustration'

export type Q25Phase = 'show' | 'start' | 'grow' | 'reach10' | 'result'

export interface Q25Step {
  phase: Q25Phase
  /** "ways to reach" badges keyed "r,c". */
  waysBadges: Record<string, number>
  litCells: Record<string, boolean>
  showExamplePath: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q25Storyboard {
  total: number
  other: number
  steps: Q25Step[]
  finalIndex: number
}

// Count ways to reach every cell as its value v, stepping from a v−1 neighbour.
function computeWays(): Record<string, number> {
  const R = Q25_GRID.length
  const C = Q25_GRID[0].length
  const ways: Record<string, number> = {}
  const key = (r: number, c: number) => `${r},${c}`
  // value 1 cells start with 1 way
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (Q25_GRID[r][c] === 1) ways[key(r, c)] = 1
  for (let v = 2; v <= 10; v++) {
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < C; c++) {
        if (Q25_GRID[r][c] !== v) continue
        let tot = 0
        for (const [dr, dc] of [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ] as const) {
          const nr = r + dr
          const nc = c + dc
          if (nr >= 0 && nr < R && nc >= 0 && nc < C && Q25_GRID[nr][nc] === v - 1) tot += ways[key(nr, nc)] ?? 0
        }
        ways[key(r, c)] = tot
      }
    }
  }
  return ways
}

const WAYS = computeWays()

// Badges for cells whose value is ≤ v (cumulative reveal as the count flows up).
function badgesUpTo(v: number): Record<string, number> {
  const out: Record<string, number> = {}
  for (let r = 0; r < Q25_GRID.length; r++) {
    for (let c = 0; c < Q25_GRID[0].length; c++) {
      if (Q25_GRID[r][c] <= v) {
        const w = WAYS[`${r},${c}`] ?? 0
        if (w > 0) out[`${r},${c}`] = w
      }
    }
  }
  return out
}

function litForValue(v: number): Record<string, boolean> {
  const out: Record<string, boolean> = {}
  for (let r = 0; r < Q25_GRID.length; r++)
    for (let c = 0; c < Q25_GRID[0].length; c++) if (Q25_GRID[r][c] === v) out[`${r},${c}`] = true
  return out
}

export function buildP20G1Q25Steps(lang: Lang): Q25Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q25Step[] = [
    {
      phase: 'show',
      waysBadges: {},
      litCells: {},
      showExamplePath: true,
      hold: 1900,
      result: false,
      caption: t(
        "Don't draw every path. Count the ways to REACH each number instead.",
        'Jangan gambar tiap jalur. Hitung berapa cara MENCAPAI tiap angka.',
      ),
    },
    {
      phase: 'start',
      waysBadges: badgesUpTo(3),
      litCells: litForValue(3),
      showExamplePath: false,
      hold: 2200,
      result: false,
      caption: t(
        'Start at 1 (1 way). At a cell, add the ways from its smaller neighbours.',
        'Mulai di 1 (1 cara). Di tiap sel, jumlahkan cara dari tetangga yang lebih kecil.',
      ),
    },
    {
      phase: 'grow',
      waysBadges: badgesUpTo(8),
      litCells: litForValue(8),
      showExamplePath: false,
      hold: 2300,
      result: false,
      caption: t(
        'Where two arrows meet, the ways add up. Keep flowing toward 10.',
        'Di tempat dua jalur bertemu, caranya dijumlahkan. Terus mengalir ke 10.',
      ),
    },
    {
      phase: 'reach10',
      waysBadges: badgesUpTo(9),
      litCells: litForValue(9),
      showExamplePath: false,
      hold: 2200,
      result: false,
      caption: t(
        'The cell with 9 collects 6 + 2 ways from below it.',
        'Sel berisi 9 mengumpulkan 6 + 2 cara dari bawahnya.',
      ),
    },
    {
      phase: 'result',
      waysBadges: badgesUpTo(10),
      litCells: litForValue(10),
      showExamplePath: false,
      hold: 0,
      result: true,
      caption: t(
        `10 is reached ${Q25_TOTAL_WAYS} ways total. Minus the shown one = ${Q25_OTHER_WAYS} other ways — answer B.`,
        `10 dicapai ${Q25_TOTAL_WAYS} cara seluruhnya. Dikurangi yang dicontohkan = ${Q25_OTHER_WAYS} cara lain — jawaban B.`,
      ),
    },
  ]

  return { total: Q25_TOTAL_WAYS, other: Q25_OTHER_WAYS, steps, finalIndex: steps.length - 1 }
}
