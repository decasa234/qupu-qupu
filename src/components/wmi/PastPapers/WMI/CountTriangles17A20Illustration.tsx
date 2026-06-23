// SEAMO-17-A-Q20 — "How many triangles are there in the figure below?"
//
// The source figure (2017.imgs/023.jpg) shows a 2-row matchstick trapezoid
// of equilateral triangles:
//   Bottom band (row 1→2): 4 upward unit triangles + 3 downward = 7 unit
//   Top band   (row 0→1): 3 upward unit triangles + 2 downward = 5 unit
//   Total unit triangles: 12
//
// Triangle count by size:
//   Size-1 (unit): 7 up + 5 down = 12
//   Size-2 (2-unit side, spans both rows):
//     up-pointing:   3  (apex at top row, base at bottom row — cols 0-2, 1-3, 2-4)
//     down-pointing: 1  (base at top row cols 0-2, apex at bottom row col 2)
//   Size-3: would need 3 rows — figure only has 2 rows → 0
//   TOTAL: 12 + 4 = 16  → Answer D.
//
// Pure SVG, SSR-safe (no hooks, no framer-motion, no Math.random, no window/document).

// ── Colours ──────────────────────────────────────────────────────────────────
const STICK = '#C8956C' // matchstick body (tan/wood)
const TIP   = '#CC2222' // matchstick head (red)
const BG    = '#FFF9EB' // warm cream background

// ── Grid geometry ─────────────────────────────────────────────────────────────
//
// Unit side length U px, height UH = U·√3/2.
// Rows:
//   row 0 = top row    (3 vertices, col 0..2,  y = PAD)
//   row 1 = mid row    (4 vertices, col 0..3,  y = PAD + UH)
//   row 2 = bottom row (5 vertices, col 0..4,  y = PAD + 2·UH)
//
// x of vertex (row, col): each row-step shifts origin right by U/2.
//   offset(row) = (2 - row) * U/2
//   vx(row, col) = PAD + offset(row) + col * U

const U   = 60
const UH  = (U * Math.sqrt(3)) / 2
const PAD = 14

const VW = Math.round(4 * U + PAD * 2)
const VH = Math.round(2 * UH + PAD * 2)

// vx: x-coord increases with col; x-offset decreases as row increases (trapezoid widens downward).
// row 0 (top, 3 verts):    offset = 2*(U/2) = U    → starts at PAD+U
// row 1 (mid, 4 verts):    offset = 1*(U/2) = U/2  → starts at PAD+U/2
// row 2 (bottom, 5 verts): offset = 0               → starts at PAD
function vx(row: number, col: number): number {
  return PAD + (2 - row) * (U / 2) + col * U
}
// vy: row 0 at top of SVG (y=PAD), row 2 at bottom (y=PAD+2*UH).
function vy(row: number): number {
  return PAD + row * UH
}

// ── Vertex / edge types ───────────────────────────────────────────────────────

type Vertex = readonly [number, number] // [row, col]
type Edge   = readonly [Vertex, Vertex]

function edgeKey(a: Vertex, b: Vertex): string {
  const [ar, ac] = a, [br, bc] = b
  return ar < br || (ar === br && ac <= bc)
    ? `${ar},${ac}|${br},${bc}`
    : `${br},${bc}|${ar},${ac}`
}

// ── Build unique edges from all unit triangles ────────────────────────────────

function buildAllEdges(): Edge[] {
  const seen = new Set<string>()
  const result: Edge[] = []

  function add(a: Vertex, b: Vertex) {
    const k = edgeKey(a, b)
    if (!seen.has(k)) { seen.add(k); result.push([a, b]) }
  }

  // Upward unit triangles: apex(r, c), BL(r+1, c), BR(r+1, c+1)
  // Top band   (r=0): c = 0..2  → 3 ups
  // Bottom band (r=1): c = 0..3 → 4 ups
  for (let r = 0; r <= 1; r++) {
    const count = r === 0 ? 3 : 4
    for (let c = 0; c < count; c++) {
      const apex: Vertex = [r,     c    ]
      const BL:   Vertex = [r + 1, c    ]
      const BR:   Vertex = [r + 1, c + 1]
      add(apex, BL); add(apex, BR); add(BL, BR)
    }
  }

  // Downward unit triangles:
  //   Top band   (base at row 0, apex at row 1): apex=(1, c+1), baseL=(0,c), baseR=(0,c+1). c=0,1
  //   Bottom band (base at row 1, apex at row 2): apex=(2, c+1), baseL=(1,c), baseR=(1,c+1). c=0,1,2
  //
  // Verification of coords for bottom band (c=0):
  //   baseL=vx(1,0)=PAD+U/2, baseR=vx(1,1)=PAD+3U/2, apex=vx(2,1)=PAD+U.
  //   Midpoint of baseL,baseR = PAD+U = vx(2,1) ✓ (apex is directly below midpoint)
  const downTris: Array<[Vertex, Vertex, Vertex]> = []
  for (let c = 0; c < 2; c++) {
    downTris.push([[0, c], [0, c + 1], [1, c + 1]])
  }
  for (let c = 0; c < 3; c++) {
    downTris.push([[1, c], [1, c + 1], [2, c + 1]])
  }
  for (const [bL, bR, ap] of downTris) {
    add(bL, bR); add(bL, ap); add(bR, ap)
  }

  return result
}

function buildAllVertices(): Vertex[] {
  const v: Vertex[] = []
  for (let r = 0; r <= 2; r++) {
    const cols = r === 0 ? 3 : r === 1 ? 4 : 5
    for (let c = 0; c < cols; c++) v.push([r, c])
  }
  return v
}

const ALL_EDGES   = buildAllEdges()
const ALL_VERTS   = buildAllVertices()

// ── Triangle catalogue (exported for explainer) ───────────────────────────────

export type TriSize17 = 1 | 2

export interface TriEntry17 {
  size: TriSize17
  dir: 'up' | 'down'
  key: string
  verts: [Vertex, Vertex, Vertex]
}

function buildAllTris(): TriEntry17[] {
  const out: TriEntry17[] = []

  // Size-1 upward
  for (let c = 0; c < 3; c++) out.push({ size: 1, dir: 'up', key: `U1-0-${c}`, verts: [[0,c],[1,c],[1,c+1]] })
  for (let c = 0; c < 4; c++) out.push({ size: 1, dir: 'up', key: `U1-1-${c}`, verts: [[1,c],[2,c],[2,c+1]] })

  // Size-1 downward: baseL, baseR, apex
  for (let c = 0; c < 2; c++) out.push({ size: 1, dir: 'down', key: `D1-0-${c}`, verts: [[0,c],[0,c+1],[1,c+1]] })
  for (let c = 0; c < 3; c++) out.push({ size: 1, dir: 'down', key: `D1-1-${c}`, verts: [[1,c],[1,c+1],[2,c+1]] })

  // Size-2 upward: apex at row 0 col c, BL=(2,c), BR=(2,c+2). c=0,1,2
  // Spans both bands (2 row-heights). Midpoint of vx(2,c) & vx(2,c+2) = vx(0,c) ✓
  for (let c = 0; c < 3; c++) out.push({ size: 2, dir: 'up', key: `U2-0-${c}`, verts: [[0,c],[2,c],[2,c+2]] })

  // Size-2 downward: base at row 0 cols 0..2, apex at row 2 col 2.
  // baseL=(0,0), baseR=(0,2), apex=(2,2).
  // Width of top row = 2 units (col 0..2). Midpoint at col 1 (row 0) → maps to row-2 col 2.
  // Verify: vx(0,1)=PAD+U+U=PAD+2U; vx(2,2)=PAD+2U ✓
  out.push({ size: 2, dir: 'down', key: `D2-0-0`, verts: [[0,0],[0,2],[2,2]] })

  return out
}

export const ALL_TRIS_17   = buildAllTris()
export const TRI_TOTAL_17  = ALL_TRIS_17.length // 16

export const TRIS_BY_SIZE_17: { size: TriSize17; tris: TriEntry17[] }[] = ([1, 2] as TriSize17[]).map((sz) => ({
  size: sz,
  tris: ALL_TRIS_17.filter((t) => t.size === sz),
}))

// ── Rendering helpers ─────────────────────────────────────────────────────────

function px(v: Vertex): number { return vx(v[0], v[1]) }
function py(v: Vertex): number { return vy(v[0]) }

function pts(verts: [Vertex, Vertex, Vertex]): string {
  return verts.map((v) => `${px(v).toFixed(1)},${py(v).toFixed(1)}`).join(' ')
}

const GREEN      = '#10B981'
const GREEN_FILL = 'rgba(16,185,129,0.22)'
const TIP_R      = 4.5
const STICK_W    = 3.5

// ── Figure (reusable by explainer) ───────────────────────────────────────────

export interface CountTriangles17A20FigureProps {
  highlightSize?: TriSize17 | null
  highlightTri?:  TriEntry17 | null
}

export function CountTriangles17A20Figure({
  highlightSize = null,
  highlightTri  = null,
}: CountTriangles17A20FigureProps) {
  const highlights = highlightTri
    ? [highlightTri]
    : highlightSize != null
      ? ALL_TRIS_17.filter((t) => t.size === highlightSize)
      : []

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: 300, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <rect width={VW} height={VH} fill={BG} rx={8} />

      {/* Green highlight fills (behind matchsticks) */}
      {highlights.map((t, i) => (
        <polygon key={`hf-${i}`} points={pts(t.verts)} fill={GREEN_FILL} />
      ))}

      {/* Matchstick bodies */}
      {ALL_EDGES.map(([a, b], i) => (
        <line
          key={`e-${i}`}
          x1={px(a)} y1={py(a)}
          x2={px(b)} y2={py(b)}
          stroke={STICK}
          strokeWidth={STICK_W}
          strokeLinecap="round"
        />
      ))}

      {/* Matchstick heads (red dots at each vertex) */}
      {ALL_VERTS.map(([r, c], i) => (
        <circle key={`v-${i}`} cx={px([r, c])} cy={py([r, c])} r={TIP_R} fill={TIP} />
      ))}

      {/* Green highlight borders (above matchsticks) */}
      {highlights.map((t, i) => (
        <polygon
          key={`hb-${i}`}
          points={pts(t.verts)}
          fill="none"
          stroke={GREEN}
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}
    </svg>
  )
}

// ── Default export (static illustration) ─────────────────────────────────────

export default function CountTriangles17A20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`Matchstick trapezoid: 4 upward unit triangles in the bottom row and 3 in the top row. Count all triangles of every size — the total is ${TRI_TOTAL_17}.`}
    >
      <CountTriangles17A20Figure />
    </div>
  )
}
