/**
 * MazeGrid — generic prop-driven SVG maze primitive for WMI/IKMC illustrations.
 *
 * Consolidates the repeating cell-grid + blocked-cells + highlighted-path pattern
 * found in:
 *   - MazeGrid11PEIllustration  (7×5 cell grid, blocked cells, animal start/goal)
 *   - AnimalMaze24G1Illustration (5×5 node lattice, edge-blocked bars)
 *   - MouseMaze9Illustration     (5×5 node lattice, gate edges)
 *   - Maze20PEIllustration       (room layout — less applicable but same path idea)
 *
 * This primitive models the most common variant: a **cell grid** (like MazeGrid11PE)
 * where cells can be individually filled (blocked, coloured, etc.) and a route is
 * a sequence of cells. For node-lattice mazes (like AnimalMaze24G1 / MouseMaze9)
 * keep their bespoke edge-blocked rendering; this primitive handles cell mazes.
 *
 * Pure SVG render — no framer-motion, no React state/hooks, SSR-safe
 * (no window / document / Math.random access).
 *
 * @example
 * // 7×5 maze: two blocked cells, Kanga start, Koala goal, amber trail
 * import { MazeGrid, bfsPath } from '.../primitives/MazeGrid'
 * const blocked: [number,number][] = [[2,0],[3,1]]
 * const trail = bfsPath(7, 5, blocked, [0,4], [6,0]) ?? []
 * <svg viewBox="0 0 380 300" width={380}>
 *   <MazeGrid
 *     rows={5} cols={7}
 *     blocked={blocked}
 *     start={{ cell: [0,4], glyph: <KangaGlyph x={0} y={0} /> }}
 *     goal={{ cell: [6,0], glyph: <KoalaGlyph x={0} y={0} /> }}
 *     path={trail}
 *   />
 * </svg>
 */

import type { ReactNode } from 'react'

// ── types ─────────────────────────────────────────────────────────────────────

/**
 * All props for the MazeGrid component.
 *
 * Coordinate convention: `[col, row]` where col 0 is leftmost, row 0 is topmost.
 */
export interface MazeGridProps {
  /** Number of rows in the cell grid. */
  rows: number
  /** Number of columns in the cell grid. */
  cols: number

  /**
   * Cells that cannot be traversed. Rendered as filled rectangles.
   * Format: `[col, row][]`.
   * @default []
   */
  blocked?: ReadonlyArray<readonly [number, number]>

  /**
   * Optional per-cell fill colour function.
   * Return a CSS colour string (e.g. `'#60A5FA'`) to tint the cell,
   * or `undefined` to leave it transparent.
   * Takes precedence over the default blocked-cell colour when a blocked cell
   * also matches — set the colour here rather than relying on `blocked` styling
   * when you need a custom shade.
   *
   * @param col Column index (0-based).
   * @param row Row index (0-based).
   */
  cellFill?: (col: number, row: number) => string | undefined

  /**
   * Start position.
   * `cell` — `[col, row]` of the starting cell.
   * `glyph` — optional ReactNode rendered centred in the cell (use `<g>` with
   *   relative coordinates — it is `translate(cx, cy)` by the primitive).
   */
  start?: { cell: readonly [number, number]; glyph?: ReactNode }

  /**
   * Goal / end position. Same shape as `start`.
   */
  goal?: { cell: readonly [number, number]; glyph?: ReactNode }

  /**
   * Highlighted path as an ordered list of `[col, row]` cells.
   * Rendered as a rounded amber polyline through cell centres.
   * Pass the result of `bfsPath(...)` or any manually computed route.
   * @default []
   */
  path?: ReadonlyArray<readonly [number, number]>

  /**
   * Cell size in pixels (both width and height — cells are square).
   * @default 48
   */
  cellSize?: number

  /**
   * Padding around the grid in pixels. Gives room for glyphs that overflow
   * cell boundaries, such as animal heads.
   * @default 36
   */
  padding?: number

  /**
   * Stroke colour of the highlighted path polyline.
   * @default '#F59E0B'  (amber — qupu brand trail colour)
   */
  trailColor?: string
}

// ── colour tokens ─────────────────────────────────────────────────────────────

const DEFAULT_TRAIL = '#F59E0B'       // amber — matches AnimalMaze24G1, MazeGrid11PE
const DEFAULT_BLOCKED_FILL = '#60A5FA'   // blue — matches MazeGrid11PE blocked cells
const DEFAULT_BLOCKED_STROKE = '#3B82F6'
const GRID_STROKE = '#C9CBD1'            // light gray gridlines

// ── component ─────────────────────────────────────────────────────────────────

/**
 * MazeGrid
 *
 * Renders a cell-based maze as a pure SVG fragment (no wrapping `<svg>`).
 * **Always place inside an `<svg>` element.** The viewBox of that svg should be
 * `"0 0 {cols*cellSize + padding*2} {rows*cellSize + padding*2}"`.
 *
 * Render order (back → front):
 *   1. Blocked cell fills
 *   2. Custom per-cell fills (cellFill)
 *   3. Path polyline
 *   4. Grid lines (drawn on top so they stay crisp through fills)
 *   5. Start glyph
 *   6. Goal glyph
 *
 * @see MazeGridProps for full prop documentation.
 */
export function MazeGrid({
  rows,
  cols,
  blocked = [],
  cellFill,
  start,
  goal,
  path = [],
  cellSize = 48,
  padding = 36,
  trailColor = DEFAULT_TRAIL,
}: MazeGridProps) {
  // cell top-left corner
  const cellLeft = (col: number) => padding + col * cellSize
  const cellTop  = (row: number) => padding + row * cellSize
  // cell centre
  const cx = (col: number) => cellLeft(col) + cellSize / 2
  const cy = (row: number) => cellTop(row)  + cellSize / 2

  const blockedSet = new Set(blocked.map(([c, r]) => `${c},${r}`))

  // polyline points string for the highlighted path
  const trailPoints =
    path.length > 1
      ? path.map(([c, r]) => `${cx(c)},${cy(r)}`).join(' ')
      : null

  return (
    <g>
      {/* ── 1. blocked cell fills ── */}
      {blocked.map(([c, r], i) => (
        <rect
          key={`blk-${i}`}
          x={cellLeft(c)}
          y={cellTop(r)}
          width={cellSize}
          height={cellSize}
          fill={DEFAULT_BLOCKED_FILL}
          stroke={DEFAULT_BLOCKED_STROKE}
          strokeWidth={1}
          rx={Math.round(cellSize * 0.125)}
          ry={Math.round(cellSize * 0.125)}
        />
      ))}

      {/* ── 2. custom per-cell fills ── */}
      {cellFill &&
        Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            const fill = cellFill(c, r)
            if (!fill) return null
            // skip re-drawing if this cell is already a blocked cell (blocked wins)
            if (blockedSet.has(`${c},${r}`)) return null
            return (
              <rect
                key={`cf-${c}-${r}`}
                x={cellLeft(c)}
                y={cellTop(r)}
                width={cellSize}
                height={cellSize}
                fill={fill}
                rx={Math.round(cellSize * 0.125)}
                ry={Math.round(cellSize * 0.125)}
              />
            )
          }),
        )}

      {/* ── 3. path polyline (under grid lines, so lines stay crisp) ── */}
      {trailPoints && (
        <polyline
          points={trailPoints}
          fill="none"
          stroke={trailColor}
          strokeWidth={Math.round(cellSize * 0.15)}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.85}
        />
      )}

      {/* ── 4. grid lines (COLS+1 verticals + ROWS+1 horizontals) ── */}
      {Array.from({ length: cols + 1 }, (_, c) => (
        <line
          key={`vl-${c}`}
          x1={padding + c * cellSize}
          y1={padding}
          x2={padding + c * cellSize}
          y2={padding + rows * cellSize}
          stroke={GRID_STROKE}
          strokeWidth={1.5}
        />
      ))}
      {Array.from({ length: rows + 1 }, (_, r) => (
        <line
          key={`hl-${r}`}
          x1={padding}
          y1={padding + r * cellSize}
          x2={padding + cols * cellSize}
          y2={padding + r * cellSize}
          stroke={GRID_STROKE}
          strokeWidth={1.5}
        />
      ))}

      {/* ── 5. start glyph ── */}
      {start && (
        <g transform={`translate(${cx(start.cell[0])},${cy(start.cell[1])})`}>
          {start.glyph ?? (
            /* default: filled circle marker */
            <circle r={cellSize * 0.18} fill="#22C55E" />
          )}
        </g>
      )}

      {/* ── 6. goal glyph ── */}
      {goal && (
        <g transform={`translate(${cx(goal.cell[0])},${cy(goal.cell[1])})`}>
          {goal.glyph ?? (
            /* default: star-shaped marker */
            <polygon
              points="0,-10 3,-4 10,-4 4,1 6,9 0,5 -6,9 -4,1 -10,-4 -3,-4"
              fill="#FBBF24"
              stroke="#D97706"
              strokeWidth={1}
            />
          )}
        </g>
      )}
    </g>
  )
}

// ── bfsPath helper ────────────────────────────────────────────────────────────

/**
 * bfsPath
 *
 * Compute the BFS shortest path through a cell grid from `start` to `goal`,
 * avoiding all `blocked` cells. Returns the ordered list of `[col, row]` cells
 * (including start and goal), or `null` if no path exists.
 *
 * This is a pure function — no React, no side-effects, safe to call at module
 * level or inside a server component.
 *
 * Neighbour order: right, up, left, down (deterministic, same as MazeGrid11PE).
 *
 * @param rows       Number of rows in the grid.
 * @param cols       Number of columns in the grid.
 * @param blocked    Cells to treat as walls. Format: `[col, row][]`.
 * @param start      Start cell `[col, row]`.
 * @param goal       Goal cell `[col, row]`.
 * @returns          Ordered path from start to goal, or `null` when unreachable.
 *
 * @example
 * const trail = bfsPath(5, 7, [[2,0],[3,1]], [0,4], [6,0])
 * // → [[0,4],[1,4],[2,4],...,[6,0]] or null
 */
export function bfsPath(
  rows: number,
  cols: number,
  blocked: ReadonlyArray<readonly [number, number]>,
  start: readonly [number, number],
  goal: readonly [number, number],
): [number, number][] | null {
  const key = ([c, r]: readonly [number, number]) => `${c},${r}`
  const blockedSet = new Set(blocked.map(key))

  const prev = new Map<string, readonly [number, number] | null>()
  prev.set(key(start), null)
  const queue: Array<readonly [number, number]> = [start]
  let head = 0

  while (head < queue.length) {
    const cur = queue[head++]
    if (cur[0] === goal[0] && cur[1] === goal[1]) break
    const [c, r] = cur
    const neighbours: Array<readonly [number, number]> = [
      [c + 1, r],
      [c,     r - 1],
      [c - 1, r],
      [c,     r + 1],
    ]
    for (const nb of neighbours) {
      const [nc, nr] = nb
      if (nc < 0 || nc >= cols || nr < 0 || nr >= rows) continue
      if (blockedSet.has(key(nb))) continue
      if (prev.has(key(nb))) continue
      prev.set(key(nb), cur)
      queue.push(nb)
    }
  }

  if (!prev.has(key(goal))) return null

  const path: [number, number][] = []
  let cur: readonly [number, number] | null = goal
  while (cur) {
    path.push([cur[0], cur[1]])
    cur = prev.get(key(cur)) ?? null
  }
  return path.reverse()
}
