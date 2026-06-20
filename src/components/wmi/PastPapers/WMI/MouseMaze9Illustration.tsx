// Mouse-and-cheese gate maze for IKMC-2019-PreEcolier Q9
// (CODE: IKMC-19-PE-Q9).
//
// Question: "You have to close two of the five gates so that the mouse cannot
// reach the cheese. Which gates should you close?"
// Answer: E (gates 4 and 5).
//
// Maze topology — 5×5 node grid (col 0..4 left→right, row 0..4 top→bottom).
// Mouse at (0,0), cheese at (4,4).
//
// Cheese (4,4) is ONLY reachable via exactly two edges:
//   Gate 4: (3,4)–(4,4)   — bottom path into the cheese pocket
//   Gate 5: (4,3)–(4,4)   — right path into the cheese pocket
//
// All other open corridors keep (0,0) connected to both (3,4) and (4,3).
//
// Closing gates 4 AND 5 → cheese unreachable (minimum cut = 2). ✓
// Closing only gate 4 → (4,3)→(4,4) still open via gate 5. ✓
// Closing only gate 5 → (3,4)→(4,4) still open via gate 4. ✓
// Gates 1, 2, 3 sit on alternative sub-paths; each can be bypassed alone. ✓
//
// Pure render, SSR-safe, deterministic — no Math.random / Date / window.

// ---------------------------------------------------------------- topology ---

/** A (col, row) node in the 5×5 grid. */
export interface MazeNode {
  c: number
  r: number
}

/**
 * Every open corridor between adjacent grid nodes.
 * Format: [c1, r1, c2, r2] — both directions implied.
 * Gate edges are also listed here (they are open unless explicitly closed).
 */
export const OPEN_CORRIDORS: [number, number, number, number][] = [
  // top row
  [0, 0, 1, 0],
  [1, 0, 2, 0],
  [2, 0, 3, 0],
  [3, 0, 4, 0],
  // left column (gate 1 on the last segment)
  [0, 0, 0, 1],
  [0, 1, 0, 2],
  [0, 2, 0, 3],
  // right column top (4,2-4,3 in right col; 4,3-4,4 = gate 5)
  [4, 0, 4, 1],
  [4, 1, 4, 2],
  [4, 2, 4, 3],
  // internal horizontals — row 1
  [0, 1, 1, 1],
  [1, 1, 2, 1],
  // internal horizontals — row 2
  [0, 2, 1, 2],
  [1, 2, 2, 2],
  [2, 2, 3, 2],
  // internal horizontals — row 3
  [0, 3, 1, 3],
  [1, 3, 2, 3],
  [2, 3, 3, 3],
  // internal verticals — col 1
  [1, 0, 1, 1],
  [1, 1, 1, 2],
  [1, 2, 1, 3],
  [1, 3, 1, 4],
  // internal verticals — col 2
  [2, 0, 2, 1],
  [2, 1, 2, 2],
  [2, 2, 2, 3],
  [2, 3, 2, 4],
  // internal verticals — col 3
  [3, 0, 3, 1],
  [3, 2, 3, 3],
  [3, 3, 3, 4],
  // bottom row partial
  [0, 4, 1, 4],
  // ---- gate edges (open by default; each has a gate marker) ----
  // Gate 1: left side, bottom  (0,3)–(0,4)
  [0, 3, 0, 4],
  // Gate 2: bottom row center-left  (1,4)–(2,4)
  [1, 4, 2, 4],
  // Gate 3: bottom row center  (2,4)–(3,4)
  [2, 4, 3, 4],
  // Gate 4: bottom path into cheese  (3,4)–(4,4)  ← KEY
  [3, 4, 4, 4],
  // Gate 5: right path into cheese  (4,3)–(4,4)  ← KEY
  [4, 3, 4, 4],
]

/** The five gate edges, indexed 1–5. */
export const GATE_EDGES: Record<number, [number, number, number, number]> = {
  1: [0, 3, 0, 4],
  2: [1, 4, 2, 4],
  3: [2, 4, 3, 4],
  4: [3, 4, 4, 4],
  5: [4, 3, 4, 4],
}

// --------------------------------------------------------------------- BFS ---

function edgeKey(c1: number, r1: number, c2: number, r2: number): string {
  // canonical: smaller-col-then-row first
  if (c1 > c2 || (c1 === c2 && r1 > r2)) {
    return `${c2},${r2}|${c1},${r1}`
  }
  return `${c1},${r1}|${c2},${r2}`
}

/** BFS from mouse (0,0) to cheese (4,4). Returns the path, or [] if cut off. */
export function bfsPath(closedGates: number[] = []): MazeNode[] {
  // build blocked set from closed gate edges
  const blocked = new Set<string>()
  for (const g of closedGates) {
    const e = GATE_EDGES[g]
    if (e) blocked.add(edgeKey(e[0], e[1], e[2], e[3]))
  }

  // build adjacency from OPEN_CORRIDORS minus blocked
  const adj = new Map<string, MazeNode[]>()
  for (const [c1, r1, c2, r2] of OPEN_CORRIDORS) {
    if (blocked.has(edgeKey(c1, r1, c2, r2))) continue
    const k1 = `${c1},${r1}`
    const k2 = `${c2},${r2}`
    if (!adj.has(k1)) adj.set(k1, [])
    if (!adj.has(k2)) adj.set(k2, [])
    adj.get(k1)!.push({ c: c2, r: r2 })
    adj.get(k2)!.push({ c: c1, r: r1 })
  }

  const nodeKey = (n: MazeNode) => `${n.c},${n.r}`
  const prev = new Map<string, MazeNode | null>()
  const start: MazeNode = { c: 0, r: 0 }
  const end: MazeNode = { c: 4, r: 4 }
  prev.set(nodeKey(start), null)
  const queue: MazeNode[] = [start]
  let head = 0
  while (head < queue.length) {
    const cur = queue[head++]
    if (cur.c === end.c && cur.r === end.r) break
    for (const nb of adj.get(nodeKey(cur)) ?? []) {
      if (!prev.has(nodeKey(nb))) {
        prev.set(nodeKey(nb), cur)
        queue.push(nb)
      }
    }
  }
  if (!prev.has(nodeKey(end))) return []
  const path: MazeNode[] = []
  let cur: MazeNode | null = end
  while (cur) {
    path.push(cur)
    cur = prev.get(nodeKey(cur)) ?? null
  }
  return path.reverse()
}

// ------------------------------------------------------------------ layout ---

const COLS = 5
const ROWS = 5
const CELL = 56 // pixel spacing between adjacent grid nodes
const PAD = 46 // margin around the grid

const GRID_W = (COLS - 1) * CELL
const GRID_H = (ROWS - 1) * CELL
const VIEW_W = GRID_W + PAD * 2
const VIEW_H = GRID_H + PAD * 2

/** Pixel x-coord of column c. */
const nx = (c: number) => PAD + c * CELL
/** Pixel y-coord of row r. */
const ny = (r: number) => PAD + r * CELL

const CORRIDOR_COLOR = '#D1D5DB' // light gray corridors
const TRAIL_COLOR = '#F59E0B'    // lit-path orange (qupu brand)
const GATE_OPEN = '#6B7280'      // gray ring for open gate
const GATE_CLOSED = '#EF4444'    // red ring for closed gate
const INK = '#1E293B'            // dark text / mouse / cheese

// --------------------------------------------------------------- sub-glyphs ---

/** A tiny cartoon mouse head at (cx, cy). Uses SVG primitives, SSR-safe. */
function MouseGlyph({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g aria-label="mouse">
      {/* body */}
      <ellipse cx={cx} cy={cy + 2} rx={11} ry={9} fill="#9CA3AF" />
      {/* head */}
      <circle cx={cx} cy={cy - 6} r={8} fill="#9CA3AF" />
      {/* ears */}
      <circle cx={cx - 6} cy={cy - 13} r={4} fill="#9CA3AF" />
      <circle cx={cx + 6} cy={cy - 13} r={4} fill="#9CA3AF" />
      <circle cx={cx - 6} cy={cy - 13} r={2.5} fill="#F9A8D4" />
      <circle cx={cx + 6} cy={cy - 13} r={2.5} fill="#F9A8D4" />
      {/* eyes */}
      <circle cx={cx - 3} cy={cy - 7} r={1.5} fill={INK} />
      <circle cx={cx + 3} cy={cy - 7} r={1.5} fill={INK} />
      {/* nose */}
      <circle cx={cx} cy={cy - 3} r={1.2} fill="#F43F5E" />
    </g>
  )
}

/** A wedge of cheese at (cx, cy). */
function CheeseGlyph({ cx, cy }: { cx: number; cy: number }) {
  const w = 22
  const h = 16
  return (
    <g aria-label="cheese">
      {/* wedge body */}
      <polygon
        points={`${cx - w},${cy + h / 2} ${cx + w},${cy + h / 2} ${cx + w},${cy - h / 2} ${cx},${cy - h - 2}`}
        fill="#FBBF24"
        stroke="#D97706"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* holes */}
      <circle cx={cx - 6} cy={cy + 2} r={3} fill="#FEF3C7" />
      <circle cx={cx + 8} cy={cy - 2} r={2.5} fill="#FEF3C7" />
    </g>
  )
}

// ---------------------------------------------------------------- primitive ---

export interface MouseMaze9Props {
  /** Gate numbers (1–5) to show as closed (red). */
  closedGates?: number[]
  /** Optional path to highlight — array of [col, row] pairs. */
  litPath?: [number, number][] | null
}

/**
 * The shared maze primitive. Draws all corridors, gate markers, mouse and
 * cheese glyphs, and optionally a highlighted route trace.
 *
 * Used by both `MouseMaze9Illustration` (stem — no closed gates) and
 * `MouseMaze9Explainer` (animation — may show closed gates and a route trace).
 */
export function MouseMaze9({ closedGates = [], litPath = null }: MouseMaze9Props) {
  const closedSet = new Set(closedGates)

  // The trail as an SVG points string (if any)
  const trailPts =
    litPath && litPath.length > 1
      ? litPath.map(([c, r]) => `${nx(c)},${ny(r)}`).join(' ')
      : null

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width={Math.min(300, VIEW_W)}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {/* ---- corridors ---- */}
      {OPEN_CORRIDORS.map(([c1, r1, c2, r2], i) => {
        // check if this corridor is a gate edge
        const gateNum = Object.entries(GATE_EDGES).find(
          ([, e]) => e[0] === c1 && e[1] === r1 && e[2] === c2 && e[3] === r2,
        )?.[0]
        // skip drawing gated corridors as plain lines; they get the gate marker
        if (gateNum) return null
        return (
          <line
            key={`c${i}`}
            x1={nx(c1)}
            y1={ny(r1)}
            x2={nx(c2)}
            y2={ny(r2)}
            stroke={CORRIDOR_COLOR}
            strokeWidth={3}
            strokeLinecap="round"
          />
        )
      })}

      {/* ---- highlighted trail (explainer only) ---- */}
      {trailPts && (
        <polyline
          points={trailPts}
          fill="none"
          stroke={TRAIL_COLOR}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.85}
        />
      )}

      {/* ---- gate markers ---- */}
      {Object.entries(GATE_EDGES).map(([numStr, [c1, r1, c2, r2]]) => {
        const gNum = Number(numStr)
        const closed = closedSet.has(gNum)
        const mx = (nx(c1) + nx(c2)) / 2
        const my = (ny(r1) + ny(r2)) / 2
        const ringColor = closed ? GATE_CLOSED : GATE_OPEN
        const bgColor = closed ? '#FEE2E2' : '#F9FAFB'

        // draw the short gate bar (a thickened dashed segment)
        const isHorizontal = r1 === r2
        const barHalf = 9
        const bx1 = isHorizontal ? mx - barHalf : mx
        const bx2 = isHorizontal ? mx + barHalf : mx
        const by1 = isHorizontal ? my : my - barHalf
        const by2 = isHorizontal ? my : my + barHalf

        return (
          <g key={`g${gNum}`}>
            {/* corridor line up to the gate (split by the gate circle) */}
            <line
              x1={nx(c1)}
              y1={ny(r1)}
              x2={bx1}
              y2={by1}
              stroke={CORRIDOR_COLOR}
              strokeWidth={3}
              strokeLinecap="round"
            />
            <line
              x1={bx2}
              y1={by2}
              x2={nx(c2)}
              y2={ny(r2)}
              stroke={CORRIDOR_COLOR}
              strokeWidth={3}
              strokeLinecap="round"
            />
            {/* gate circle */}
            <circle cx={mx} cy={my} r={11} fill={bgColor} stroke={ringColor} strokeWidth={2.5} />
            <text
              x={mx}
              y={my}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11}
              fontWeight="bold"
              fill={ringColor}
            >
              {gNum}
            </text>
          </g>
        )
      })}

      {/* ---- mouse at top-left (0,0) ---- */}
      <MouseGlyph cx={nx(0)} cy={ny(0)} />

      {/* ---- cheese at bottom-right (4,4) ---- */}
      <CheeseGlyph cx={nx(4)} cy={ny(4)} />
    </svg>
  )
}

// -------------------------------------------------------------------- stem ---

/**
 * Stem illustration for IKMC-19-PE-Q9 — the maze as presented in the question
 * (mouse at top-left, cheese at bottom-right, five open gates). Never reveals
 * which gates to close.
 */
export default function MouseMaze9Illustration(_props: { lang?: 'en' | 'id' }) {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Labirin dengan tikus di pojok kiri atas dan keju di pojok kanan bawah. Ada 5 gerbang (1–5) di berbagai lorong. Tutup 2 gerbang agar tikus tidak bisa mencapai keju."
    >
      <MouseMaze9 />
    </div>
  )
}
