// Animal-maze "shortest route to the flag" figure for WMI-24F1A-Q11
// (2024 WMI Final Grade 1 Paper A).
//
// Reconstructed from the source scan
// (db/seed/wmi/figures/2024-final-g1-a-q11.jpg): a 4x4 grid (a 5x5 lattice of
// nodes), five animals sitting at start nodes, a flag inside the grid, and a
// few grid edges blocked by a thick dark bar (an "X" in the original wording).
// Each animal walks along unblocked grid lines, same speed, shortest route to
// the flag; the one with the LONGEST shortest route arrives last.
//
// Node grid (col 0..4 left→right, row 0..4 top→bottom), measured from the scan:
//   D (dog)    @ (3,0)        flag @ (1,3)
//   C (tiger)  @ (3,1)
//   A (monkey) @ (0,2)
//   B (chick)  @ (3,4)
//   E (lion)   @ (4,4)
//
// Blocked edges (each drawn as a thick bar straddling the edge midpoint):
//   vertical   (1,0)-(1,1)              ← short top bar
//   horizontal (2,1)-(3,1)              ← vertical stroke of the L block
//   vertical   (3,1)-(3,2)              ← horizontal stroke of the L block
//   vertical   (1,3)-(1,4), (2,3)-(2,4), (3,3)-(3,4)  ← long bottom bar
//
// BFS shortest routes (verified against the answer key):
//   A monkey 2 · B chick 5 · C tiger 6 · D dog 5 · E lion 4
//   → C (tiger) has the longest route, so it reaches the flag LAST.  Answer C.
//
// Pure render, SSR-safe & deterministic: no params, no random, no state. The
// stem draws ONLY the setup (animals, flag, blocked bars) and never the route.
// The animator passes a litPath to <AnimalMaze24G1/> to trace one animal later.

export type AnimalKey = 'A' | 'B' | 'C' | 'D' | 'E'

/** Single-codepoint emoji for each animal option, matching the source icons. */
export const ANIMAL_GLYPH: Record<AnimalKey, string> = {
  A: '🐵', // monkey
  B: '🐤', // chick
  C: '🐯', // tiger
  D: '🐶', // dog
  E: '🦁', // lion
}

export const ANIMAL_NAME_ID: Record<AnimalKey, string> = {
  A: 'monyet',
  B: 'anak ayam',
  C: 'harimau',
  D: 'anjing',
  E: 'singa',
}

export interface Node {
  c: number
  r: number
}

/** Start node for each animal (col, row). */
export const STARTS: Record<AnimalKey, Node> = {
  A: { c: 0, r: 2 },
  B: { c: 3, r: 4 },
  C: { c: 3, r: 1 },
  D: { c: 3, r: 0 },
  E: { c: 4, r: 4 },
}

/** The flag node. */
export const FLAG: Node = { c: 1, r: 3 }

/** Which side of its node each animal glyph hangs (so it sits outside the grid). */
const ANIMAL_SIDE: Record<AnimalKey, 'up' | 'down' | 'left' | 'right'> = {
  A: 'left',
  B: 'down',
  C: 'right',
  D: 'up',
  E: 'down',
}

/** A blocked grid edge between two adjacent nodes. */
export interface Edge {
  a: Node
  b: Node
}

export const BLOCKED: ReadonlyArray<Edge> = [
  { a: { c: 1, r: 0 }, b: { c: 1, r: 1 } }, // top bar
  { a: { c: 2, r: 1 }, b: { c: 3, r: 1 } }, // L — vertical stroke
  { a: { c: 3, r: 1 }, b: { c: 3, r: 2 } }, // L — horizontal stroke
  { a: { c: 1, r: 3 }, b: { c: 1, r: 4 } }, // bottom bar
  { a: { c: 2, r: 3 }, b: { c: 2, r: 4 } }, // bottom bar
  { a: { c: 3, r: 3 }, b: { c: 3, r: 4 } }, // bottom bar
]

// --------------------------------------------------------------- shortest ---

function edgeKey(a: Node, b: Node): string {
  const [p, q] = [a, b].sort((m, n) => (m.c - n.c) || (m.r - n.r))
  return `${p.c},${p.r}|${q.c},${q.r}`
}

const BLOCKED_SET = new Set(BLOCKED.map((e) => edgeKey(e.a, e.b)))

/**
 * BFS shortest route (in grid edges) from `start` to the flag along unblocked
 * lines, returning the list of nodes visited. Used by the animator to trace a
 * route; the stem itself never draws it. Deterministic (fixed neighbour order).
 */
export function shortestPath(start: Node): Node[] {
  const COLS = 5
  const ROWS = 5
  const key = (n: Node) => `${n.c},${n.r}`
  const prev = new Map<string, Node | null>()
  prev.set(key(start), null)
  const queue: Node[] = [start]
  let head = 0
  while (head < queue.length) {
    const n = queue[head++]
    if (n.c === FLAG.c && n.r === FLAG.r) break
    const steps: Node[] = [
      { c: n.c + 1, r: n.r },
      { c: n.c - 1, r: n.r },
      { c: n.c, r: n.r + 1 },
      { c: n.c, r: n.r - 1 },
    ]
    for (const m of steps) {
      if (m.c < 0 || m.c >= COLS || m.r < 0 || m.r >= ROWS) continue
      if (BLOCKED_SET.has(edgeKey(n, m))) continue
      if (prev.has(key(m))) continue
      prev.set(key(m), n)
      queue.push(m)
    }
  }
  if (!prev.has(key(FLAG))) return []
  const path: Node[] = []
  let cur: Node | null = FLAG
  while (cur) {
    path.push(cur)
    cur = prev.get(key(cur)) ?? null
  }
  return path.reverse()
}

/** "A,B,C..." encoding of an animal's route so the animator can pass it in. */
export function pathFor(animal: AnimalKey): string {
  return shortestPath(STARTS[animal])
    .map((n) => `${n.c}${n.r}`)
    .join('-')
}

// ----------------------------------------------------------------- layout ---

const COLS = 5
const ROWS = 5
const CELL = 56 // node spacing
const PAD = 46 // headroom for the animal glyphs that hang outside the grid
const GLYPH = 34 // animal glyph font size

const GRID_W = (COLS - 1) * CELL
const GRID_H = (ROWS - 1) * CELL
const VIEW_W = GRID_W + PAD * 2
const VIEW_H = GRID_H + PAD * 2

const nx = (c: number) => PAD + c * CELL
const ny = (r: number) => PAD + r * CELL

const GRID_LINE = '#C9CBD1'
const BLOCK_BAR = '#3C342E'
const FLAG_POLE = '#3C342E'

// ----------------------------------------------------------------- glyphs ---

/** A small drawn flag on a pole, centred at (cx, cy). */
function FlagGlyph({ cx, cy }: { cx: number; cy: number }) {
  const top = cy - 18
  return (
    <g>
      <line x1={cx} y1={cy + 6} x2={cx} y2={top} stroke={FLAG_POLE} strokeWidth={3} strokeLinecap="round" />
      <path
        d={`M ${cx} ${top} L ${cx + 20} ${top + 7} L ${cx} ${top + 14} Z`}
        className="fill-qupu-brand-orange"
        stroke={FLAG_POLE}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </g>
  )
}

/** Glyph offset (dx, dy) for an animal hanging on a given side of its node. */
function animalOffset(side: 'up' | 'down' | 'left' | 'right'): [number, number] {
  const d = 30
  if (side === 'up') return [0, -d]
  if (side === 'down') return [0, d]
  if (side === 'left') return [-d, 0]
  return [d, 0]
}

// ---------------------------------------------------------------- diagram ---

export interface AnimalMaze24G1Props {
  /**
   * Optional route to trace, encoded as `"c r-c r-..."` (e.g. "31-41-42").
   * The stem leaves this null; the animator passes one animal's shortest route
   * post-answer to reveal why it arrives last. Never set in the question card.
   */
  litPath?: string | null
}

const TRAIL = '#F59E0B'

/**
 * The maze primitive: grid, blocked bars, flag, the five animal start markers,
 * and (optionally) a single highlighted route. Shared by the stem and the
 * animator so the geometry can never drift between them.
 */
export function AnimalMaze24G1({ litPath = null }: AnimalMaze24G1Props) {
  // grid lines
  const verticals = Array.from({ length: COLS }, (_, c) => c)
  const horizontals = Array.from({ length: ROWS }, (_, r) => r)

  // decode the lit route into a polyline (if any)
  const trailPts = (() => {
    if (!litPath) return null
    const pts = litPath.split('-').map((tok) => {
      const c = Number(tok[0])
      const r = Number(tok[1])
      return Number.isFinite(c) && Number.isFinite(r) ? `${nx(c)},${ny(r)}` : null
    })
    return pts.every((p) => p !== null) ? pts.join(' ') : null
  })()

  const animals = (Object.keys(STARTS) as AnimalKey[]).map((k) => {
    const node = STARTS[k]
    const [dx, dy] = animalOffset(ANIMAL_SIDE[k])
    return { k, node, gx: nx(node.c) + dx, gy: ny(node.r) + dy }
  })

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={Math.min(300, VIEW_W)} style={{ display: 'block' }}>
      {/* grid lines */}
      {verticals.map((c) => (
        <line key={`v${c}`} x1={nx(c)} y1={ny(0)} x2={nx(c)} y2={ny(ROWS - 1)} stroke={GRID_LINE} strokeWidth={1.5} />
      ))}
      {horizontals.map((r) => (
        <line key={`h${r}`} x1={nx(0)} y1={ny(r)} x2={nx(COLS - 1)} y2={ny(r)} stroke={GRID_LINE} strokeWidth={1.5} />
      ))}

      {/* optional traced route (animator only) */}
      {trailPts && (
        <polyline
          points={trailPts}
          fill="none"
          stroke={TRAIL}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.9}
        />
      )}

      {/* blocked edges — a thick bar straddling each blocked grid edge */}
      {BLOCKED.map((e, i) => {
        const x1 = nx(e.a.c)
        const y1 = ny(e.a.r)
        const x2 = nx(e.b.c)
        const y2 = ny(e.b.r)
        const mx = (x1 + x2) / 2
        const my = (y1 + y2) / 2
        const horizontalEdge = e.a.r === e.b.r // a horizontal grid edge → vertical bar across it
        const half = 13
        const bx1 = horizontalEdge ? mx : mx - half
        const bx2 = horizontalEdge ? mx : mx + half
        const by1 = horizontalEdge ? my - half : my
        const by2 = horizontalEdge ? my + half : my
        return (
          <line
            key={`b${i}`}
            x1={bx1}
            y1={by1}
            x2={bx2}
            y2={by2}
            stroke={BLOCK_BAR}
            strokeWidth={6}
            strokeLinecap="round"
          />
        )
      })}

      {/* flag inside the grid */}
      <FlagGlyph cx={nx(FLAG.c)} cy={ny(FLAG.r)} />

      {/* start nodes + animal glyphs */}
      {animals.map(({ k, node, gx, gy }) => (
        <g key={k}>
          <circle cx={nx(node.c)} cy={ny(node.r)} r={6} fill={BLOCK_BAR} />
          <text x={gx} y={gy} textAnchor="middle" dominantBaseline="central" fontSize={GLYPH}>
            {ANIMAL_GLYPH[k]}
          </text>
        </g>
      ))}
    </svg>
  )
}

// ------------------------------------------------------------------- stem ---

export default function AnimalMaze24G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Labirin garis: lima hewan (monyet, anak ayam, harimau, anjing, singa) berada di titik start, sebuah bendera di dalam kotak. Beberapa garis diblokir oleh palang tebal. Setiap hewan berjalan ke bendera lewat rute terpendek dengan kecepatan sama; hewan mana yang tiba paling akhir?"
    >
      <AnimalMaze24G1 />
    </div>
  )
}
