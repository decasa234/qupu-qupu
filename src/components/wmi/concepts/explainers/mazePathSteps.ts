import type { Lang } from './makeTenSteps'

/** Grid coordinate {x, y} — x = column (0-left), y = row (0-top). */
export interface GridCoord {
  x: number
  y: number
}

export interface MazePathStep {
  /** Token position for this beat. */
  tokenCell: GridCoord
  /** How many moves have been made so far (0 at start, increases each step). */
  stepsTaken: number
  /** Path cells traced so far (from start up to and including tokenCell). */
  tracedPath: GridCoord[]
  caption: string
  hold: number
  result: boolean
}

export interface MazePathStoryboard {
  cols: number
  rows: number
  walls: GridCoord[]
  /** Shortest BFS path from start to target (inclusive of both endpoints). */
  path: GridCoord[]
  /** Total step count (path.length − 1). */
  answer: number
  steps: MazePathStep[]
  finalIndex: number
}

interface MazeParams {
  cols?: unknown
  rows?: unknown
  walls?: unknown
}

/** Key for a coordinate. */
function key(x: number, y: number): string {
  return `${x},${y}`
}

/**
 * BFS from start (0,0) to target (cols-1, rows-1) over open cells.
 * Returns the shortest path as an array of GridCoord (inclusive), or null if
 * no path exists.
 */
function bfs(cols: number, rows: number, blocked: Set<string>): GridCoord[] | null {
  const start = key(0, 0)
  const goalX = cols - 1
  const goalY = rows - 1
  const goalKey = key(goalX, goalY)

  if (blocked.has(start) || blocked.has(goalKey)) return null

  const prev = new Map<string, string | null>([[start, null]])
  const queue: GridCoord[] = [{ x: 0, y: 0 }]
  let head = 0

  while (head < queue.length) {
    const { x, y } = queue[head++]
    const cur = key(x, y)
    if (cur === goalKey) {
      // Reconstruct path
      const path: GridCoord[] = []
      let k: string | null = goalKey
      while (k !== null) {
        const [kx, ky] = k.split(',').map(Number)
        path.push({ x: kx, y: ky })
        k = prev.get(k) ?? null
      }
      path.reverse()
      return path
    }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = x + dx
      const ny = y + dy
      const nk = key(nx, ny)
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue
      if (blocked.has(nk) || prev.has(nk)) continue
      prev.set(nk, cur)
      queue.push({ x: nx, y: ny })
    }
  }
  return null
}

function clampDim(v: unknown, lo: number, hi: number, fallback: number): number {
  const n = typeof v === 'number' ? v : Number(v)
  if (!Number.isFinite(n) || n !== Math.round(n)) return fallback
  return Math.max(lo, Math.min(hi, n))
}

/**
 * Builds the beat storyboard for the maze-path-shortest explainer.
 *
 * Param fields (matching concept's Params schema):
 *   - `cols`: integer 4–6
 *   - `rows`: integer 4–6
 *   - `walls`: Array of [x, y] tuples (column-row, 0-indexed from top-left)
 *
 * Start = (0,0) top-left; Target = (cols-1, rows-1) bottom-right.
 * Animates a token moving one cell per beat along the BFS shortest path.
 */
export function buildMazePathSteps(
  params: MazeParams,
  lang: Lang,
): MazePathStoryboard {
  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  // Defensive parsing of dimensions
  const cols = clampDim((params ?? {}).cols, 4, 6, 4)
  const rows = clampDim((params ?? {}).rows, 4, 6, 4)

  // Defensive parsing of walls — concept encodes as [[x,y], ...] tuples
  const rawWalls = (params ?? {}).walls
  const wallList: GridCoord[] = []
  if (Array.isArray(rawWalls)) {
    for (const w of rawWalls) {
      if (Array.isArray(w) && w.length >= 2) {
        const wx = Number(w[0])
        const wy = Number(w[1])
        if (Number.isFinite(wx) && Number.isFinite(wy)) {
          wallList.push({ x: wx, y: wy })
        }
      }
    }
  }

  const blocked = new Set(wallList.map((w) => key(w.x, w.y)))
  const path = bfs(cols, rows, blocked)

  // Fallback: if no path found, emit a single safe result beat
  if (!path || path.length < 2) {
    const fallbackAnswer = (cols - 1) + (rows - 1)
    const fallbackSteps: MazePathStep[] = [
      {
        tokenCell: { x: 0, y: 0 },
        stepsTaken: 0,
        tracedPath: [{ x: 0, y: 0 }],
        caption: T(`${fallbackAnswer} steps`, `${fallbackAnswer} langkah`),
        hold: 0,
        result: true,
      },
    ]
    return {
      cols,
      rows,
      walls: wallList,
      path: [],
      answer: fallbackAnswer,
      steps: fallbackSteps,
      finalIndex: 0,
    }
  }

  const answer = path.length - 1
  const steps: MazePathStep[] = []

  // Beat 0: token at start, step count = 0
  steps.push({
    tokenCell: { x: 0, y: 0 },
    stepsTaken: 0,
    tracedPath: [{ x: 0, y: 0 }],
    caption: T(
      'Start at the top-left dot.',
      'Mulai dari titik pojok kiri atas.',
    ),
    hold: 1400,
    result: false,
  })

  // Beats 1..answer: one per move
  for (let m = 1; m <= answer; m++) {
    const cell = path[m]
    const isLast = m === answer
    const traced = path.slice(0, m + 1)

    if (isLast) {
      // Final result beat
      steps.push({
        tokenCell: { x: cell.x, y: cell.y },
        stepsTaken: m,
        tracedPath: traced,
        caption: T(
          `Reached the flag in ${answer} steps!`,
          `Bendera dicapai dalam ${answer} langkah!`,
        ),
        hold: 0,
        result: true,
      })
    } else {
      steps.push({
        tokenCell: { x: cell.x, y: cell.y },
        stepsTaken: m,
        tracedPath: traced,
        caption: T(
          `Step ${m}: move to (${cell.x + 1}, ${cell.y + 1}).`,
          `Langkah ${m}: pindah ke (${cell.x + 1}, ${cell.y + 1}).`,
        ),
        hold: m < answer - 1 ? 900 : 1200,
        result: false,
      })
    }
  }

  return {
    cols,
    rows,
    walls: wallList,
    path,
    answer,
    steps,
    finalIndex: steps.length - 1,
  }
}
