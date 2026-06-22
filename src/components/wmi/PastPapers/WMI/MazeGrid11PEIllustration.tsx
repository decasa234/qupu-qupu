// IKMC-22-PE-Q11 — Grid maze illustration
//
// "Kanga wants to reach the koala without going through any of the coloured
//  squares. Which route could she take?"
//
// Stem image source: docs/reference/ocr-res/ikmc/contest/preecolier/2022.imgs/032.jpg
//
// Reconstruction from the source scan:
//   Grid:  7 columns (0–6) × 5 rows (0–4) of cells.
//   Kanga: bottom-left cell  (col 0, row 4).
//   Koala: top-right  cell   (col 6, row 0).
//   Blue (coloured/blocked) cells:
//     (2,0)  — top-center blob, upper part
//     (2,1)  — top-center blob, lower part
//     (0,2)  — left blob, upper part
//     (1,2)  — left blob, right part
//     (3,3)  — bottom-center blob, left part
//     (3,4)  — bottom-center blob, bottom part
//     (4,4)  — bottom-center blob, right part
//     (5,1)  — right blob, upper part
//     (5,2)  — right blob, lower part
//
// Valid route — answer A (BFS-verified):
//   (0,4)→(1,4)→(2,4)→(2,3)→(2,2)→(3,2)→(4,2)→(4,1)→(4,0)→(5,0)→(6,0)
//   Every step avoids the 9 blocked cells above.
//
// The stem draws the problem only (no route highlighted).
// The explainer imports MazeGrid11PE and passes litPath to reveal route A.

// ---- Palette ---------------------------------------------------------------
const CELL_STROKE = '#C9CBD1'
const BLOCKED_FILL = '#60A5FA'   // blue – matches the source scan's cyan-blue blobs
const BLOCKED_STROKE = '#3B82F6'
const TRAIL_COLOR = '#F59E0B'    // amber – same TRAIL used in AnimalMaze24G1
const INK = '#1F2937'

// ---- Geometry ---------------------------------------------------------------

const COLS = 7   // number of cell columns
const ROWS = 5   // number of cell rows
const CELL = 48  // cell size in px
const PAD  = 36  // padding to give room for the animal glyphs at the corners

const VIEW_W = COLS * CELL + PAD * 2
const VIEW_H = ROWS * CELL + PAD * 2

// top-left corner of cell (col, row)
const cellX = (col: number) => PAD + col * CELL
const cellY = (row: number) => PAD + row * CELL
// centre of cell (col, row)
const cx = (col: number) => cellX(col) + CELL / 2
const cy = (row: number) => cellY(row) + CELL / 2

// ---- Data -------------------------------------------------------------------

/** Blue (blocked) cells — reconstructed from the source scan. */
export const BLOCKED_CELLS: ReadonlyArray<readonly [number, number]> = [
  [2, 0],  // top-center blob (upper)
  [2, 1],  // top-center blob (lower)
  [0, 2],  // left blob (upper)
  [1, 2],  // left blob (right part)
  [3, 3],  // bottom-center blob (left)
  [3, 4],  // bottom-center blob (bottom)
  [4, 4],  // bottom-center blob (right)
  [5, 1],  // right blob (upper)
  [5, 2],  // right blob (lower)
] as const

const BLOCKED_SET = new Set(BLOCKED_CELLS.map(([c, r]) => `${c},${r}`))

/** Start cell: Kanga (bottom-left). */
export const START: readonly [number, number] = [0, 4] as const
/** End cell: Koala (top-right). */
export const END: readonly [number, number] = [6, 0] as const

// ---- BFS path finder -------------------------------------------------------

/**
 * BFS from START to END, avoiding BLOCKED_CELLS.
 * Returns the list of cells [col, row] on the shortest valid route,
 * or an empty array if no path exists.
 * Deterministic (fixed neighbour order: right, up, left, down).
 */
export function findPath(
  start: readonly [number, number] = START,
  end: readonly [number, number] = END,
): Array<readonly [number, number]> {
  const key = ([c, r]: readonly [number, number]) => `${c},${r}`
  const prev = new Map<string, readonly [number, number] | null>()
  prev.set(key(start), null)
  const queue: Array<readonly [number, number]> = [start]
  let head = 0
  while (head < queue.length) {
    const cur = queue[head++]
    if (cur[0] === end[0] && cur[1] === end[1]) break
    const [c, r] = cur
    for (const next of [
      [c + 1, r] as const,
      [c,     r - 1] as const,
      [c - 1, r] as const,
      [c,     r + 1] as const,
    ]) {
      const [nc, nr] = next
      if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue
      if (BLOCKED_SET.has(key(next))) continue
      if (prev.has(key(next))) continue
      prev.set(key(next), cur)
      queue.push(next)
    }
  }
  if (!prev.has(key(end))) return []
  const path: Array<readonly [number, number]> = []
  let cur: readonly [number, number] | null = end
  while (cur) {
    path.push(cur)
    cur = prev.get(key(cur)) ?? null
  }
  return path.reverse()
}

/** Encode a path as a string for litPath prop (e.g. "04-14-24-23-..."). */
export function encodePath(path: Array<readonly [number, number]>): string {
  return path.map(([c, r]) => `${c}${r}`).join('-')
}

/** The pre-computed answer-A route (BFS-verified). */
export const ROUTE_A = encodePath(findPath())

// ---- Kangaroo glyph --------------------------------------------------------

function KangaGlyph({ x, y }: { x: number; y: number }) {
  // Simple SVG kangaroo: body (oval), head, ears, tail, rear legs
  return (
    <g transform={`translate(${x},${y})`}>
      {/* body */}
      <ellipse cx={0} cy={0} rx={10} ry={13} fill="#D97706" stroke="#92400E" strokeWidth={1.2} />
      {/* head */}
      <ellipse cx={4} cy={-15} rx={7} ry={6} fill="#D97706" stroke="#92400E" strokeWidth={1.2} />
      {/* ear */}
      <ellipse cx={6} cy={-20} rx={2} ry={3.5} fill="#D97706" stroke="#92400E" strokeWidth={1} />
      {/* eye */}
      <circle cx={6} cy={-15} r={1.2} fill={INK} />
      {/* tail */}
      <path d={`M -10,6 Q -18,12 -14,18`} fill="none" stroke="#D97706" strokeWidth={3} strokeLinecap="round" />
      {/* rear leg */}
      <path d={`M 2,10 L 4,18 L 10,20`} fill="none" stroke="#D97706" strokeWidth={3} strokeLinecap="round" />
    </g>
  )
}

// ---- Koala glyph -----------------------------------------------------------

function KoalaGlyph({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      {/* body */}
      <ellipse cx={0} cy={4} rx={10} ry={11} fill="#9CA3AF" stroke="#6B7280" strokeWidth={1.2} />
      {/* head */}
      <circle cx={0} cy={-9} r={10} fill="#9CA3AF" stroke="#6B7280" strokeWidth={1.2} />
      {/* ears */}
      <ellipse cx={-9} cy={-16} rx={5} ry={4} fill="#9CA3AF" stroke="#6B7280" strokeWidth={1} />
      <ellipse cx={ 9} cy={-16} rx={5} ry={4} fill="#9CA3AF" stroke="#6B7280" strokeWidth={1} />
      {/* nose */}
      <ellipse cx={0} cy={-7} rx={4} ry={3} fill="#6B7280" />
      {/* eyes */}
      <circle cx={-4} cy={-11} r={1.5} fill={INK} />
      <circle cx={ 4} cy={-11} r={1.5} fill={INK} />
    </g>
  )
}

// ---- MazeGrid11PE primitive -------------------------------------------------

export interface MazeGrid11PEProps {
  /**
   * Optional route to highlight, encoded as `"cr-cr-..."` (e.g. "04-14-24").
   * The stem leaves this null; the explainer passes the answer-A route.
   */
  litPath?: string | null
}

/**
 * MazeGrid11PE
 *
 * Shared grid maze primitive for IKMC-22-PE-Q11.
 * Renders the 7×5 cell grid with blue blocked cells, Kanga at bottom-left,
 * Koala at top-right, and (optionally) a highlighted route overlay.
 */
export function MazeGrid11PE({ litPath = null }: MazeGrid11PEProps) {
  // Decode lit route into cell centres for a polyline
  const trailPoints = (() => {
    if (!litPath) return null
    const pts = litPath.split('-').map((tok) => {
      const col = Number(tok[0])
      const row = Number(tok[1])
      if (!Number.isFinite(col) || !Number.isFinite(row)) return null
      return `${cx(col)},${cy(row)}`
    })
    return pts.every((p) => p !== null) ? (pts as string[]).join(' ') : null
  })()

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width={Math.min(360, VIEW_W)}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="white" />

      {/* Cell backgrounds — blocked cells drawn in blue */}
      {Array.from({ length: ROWS }, (_, r) =>
        Array.from({ length: COLS }, (_, c) => {
          const blocked = BLOCKED_SET.has(`${c},${r}`)
          if (!blocked) return null
          return (
            <rect
              key={`bc-${c}-${r}`}
              x={cellX(c)}
              y={cellY(r)}
              width={CELL}
              height={CELL}
              fill={BLOCKED_FILL}
              stroke={BLOCKED_STROKE}
              strokeWidth={1}
              rx={6}
              ry={6}
            />
          )
        }),
      )}

      {/* Optional route trail (drawn under the grid lines) */}
      {trailPoints && (
        <polyline
          points={trailPoints}
          fill="none"
          stroke={TRAIL_COLOR}
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.85}
        />
      )}

      {/* Grid lines */}
      {Array.from({ length: COLS + 1 }, (_, c) => (
        <line
          key={`vl${c}`}
          x1={PAD + c * CELL}
          y1={PAD}
          x2={PAD + c * CELL}
          y2={PAD + ROWS * CELL}
          stroke={CELL_STROKE}
          strokeWidth={1.5}
        />
      ))}
      {Array.from({ length: ROWS + 1 }, (_, r) => (
        <line
          key={`hl${r}`}
          x1={PAD}
          y1={PAD + r * CELL}
          x2={PAD + COLS * CELL}
          y2={PAD + r * CELL}
          stroke={CELL_STROKE}
          strokeWidth={1.5}
        />
      ))}

      {/* Kanga at START (bottom-left) */}
      <KangaGlyph x={cx(START[0])} y={cy(START[1])} />

      {/* Koala at END (top-right) */}
      <KoalaGlyph x={cx(END[0])} y={cy(END[1])} />
    </svg>
  )
}

// ---- Default export: stem illustration -------------------------------------

/**
 * MazeGrid11PEIllustration
 *
 * Static problem-only figure for IKMC-22-PE-Q11 (2022 IKMC Pre-Ecolier, Q11).
 * Shows the 7×5 grid with blue blocked cells, Kanga (start, bottom-left),
 * and Koala (goal, top-right). Never reveals the valid route — that is the
 * explainer's job.
 */
export default function MazeGrid11PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Kotak-kotak 7×5: Kanga di pojok kiri bawah, Koala di pojok kanan atas. Kotak biru adalah penghalang yang tidak boleh dilalui. Temukan rute dari Kanga ke Koala yang menghindari semua kotak biru."
    >
      <MazeGrid11PE />
    </div>
  )
}
