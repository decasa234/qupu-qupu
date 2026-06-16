// Triangle-sequence figure for WMI-25P3A-Q22 (2025 Semifinal Grade 3, Paper A).
//
// Reconstructed from db/seed/wmi/figures/2025-semifinal-g3-a-q22.jpg: a growing
// sequence of right-pointing triangular meshes drawn on a triangular dot lattice.
//   Picture 1 -> 1 triangle, Picture 2 -> 2, Picture 3 -> 5, Picture 4 -> 12, ...
// then a dashed "?" placeholder for Picture 6 (the thing being asked).
//
// Each picture is a right-pointing triangular mesh of "order" k (the left vertical
// base is divided into k segments and the mesh tapers to a single apex on the right).
// Dots sit at every lattice vertex and the lattice edges draw the small + large
// triangles, matching the scan's look.
//
// The figure shows the SETUP ONLY (the given pictures 1-4 and a ? for picture 6).
// It never reveals the count for picture 6 — that is the explainer's job.

const INK = '#2B2118' // dark lattice lines / dots, matching the scan
const DOT_R = 3.4

/* --------------------------------------------------------------- lattice ---- */
// A right-pointing triangular mesh of order k. We place lattice points so the
// LEFT side is a vertical column of (k + 1) dots and successive columns to the
// right shrink by one, ending at the single apex. Columns are spaced by a fixed
// horizontal step; within a column, dots are spaced vertically and each column is
// shifted down by half a step (triangular packing) so edges form 60°-ish meshes.

export interface MeshPoint {
  col: number
  row: number
  x: number
  y: number
}

const COL_DX = 30 // horizontal spacing between columns
const ROW_DY = 30 // vertical spacing between dots in a column

/**
 * Build the lattice points for a right-pointing mesh of order k.
 * Column c (0..k) has (k - c + 1) points. Column c is centred vertically so the
 * whole mesh is symmetric about its horizontal mid-line.
 */
export function meshPoints(k: number): MeshPoint[] {
  const pts: MeshPoint[] = []
  for (let c = 0; c <= k; c++) {
    const count = k - c + 1 // dots in this column
    const colHeight = (count - 1) * ROW_DY
    const yStart = -colHeight / 2 // centre each column on y = 0
    for (let r = 0; r < count; r++) {
      pts.push({ col: c, row: r, x: c * COL_DX, y: yStart + r * ROW_DY })
    }
  }
  return pts
}

const findPt = (pts: MeshPoint[], col: number, row: number) => pts.find((p) => p.col === col && p.row === row)

/**
 * Lattice edges for a right-pointing mesh of order k. Three edge families form the
 * triangular grid: vertical (within a column), and the two diagonals that connect a
 * column to the smaller column on its right.
 */
export function meshEdges(k: number): Array<[MeshPoint, MeshPoint]> {
  const pts = meshPoints(k)
  const edges: Array<[MeshPoint, MeshPoint]> = []
  const add = (a?: MeshPoint, b?: MeshPoint) => {
    if (a && b) edges.push([a, b])
  }
  for (let c = 0; c <= k; c++) {
    const count = k - c + 1
    // vertical edges within the column
    for (let r = 0; r < count - 1; r++) {
      add(findPt(pts, c, r), findPt(pts, c, r + 1))
    }
    // diagonals to the next (smaller) column: point (c, r) connects to (c+1, r-1)
    // and (c+1, r) where they exist. The next column has count-1 points, shifted
    // down by half a step, so row r in column c maps to rows r-1 and r in c+1.
    if (c < k) {
      for (let r = 0; r < count; r++) {
        add(findPt(pts, c, r), findPt(pts, c + 1, r - 1))
        add(findPt(pts, c, r), findPt(pts, c + 1, r))
      }
    }
  }
  return edges
}

/* ------------------------------------------------------------- primitive ---- */
// Order per picture index (1-based). Pictures 1..4 grow 1,2,3,4; the dashed
// picture 6 placeholder is drawn separately (a "?" in a circle, as in the scan).
export const PICTURE_ORDER: Record<number, number> = { 1: 1, 2: 2, 3: 3, 4: 4 }
// The stated triangle counts from the stem (1, 2, 5, 12) and the keyed answer (43).
export const PICTURE_COUNTS: Record<number, number> = { 1: 1, 2: 2, 3: 5, 4: 12, 6: 43 }

export interface TriMeshProps {
  k: number
  /** Stroke colour for the lattice (the explainer can recolour to highlight). */
  stroke?: string
  /** Stroke width. */
  strokeWidth?: number
}

/** One right-pointing triangular mesh of order k, drawn around its own origin. */
export function TriMesh({ k, stroke = INK, strokeWidth = 1.8 }: TriMeshProps) {
  const pts = meshPoints(k)
  const edges = meshEdges(k)
  return (
    <g>
      {edges.map(([a, b], i) => (
        <line
          key={`e${i}`}
          x1={a.x.toFixed(1)}
          y1={a.y.toFixed(1)}
          x2={b.x.toFixed(1)}
          y2={b.y.toFixed(1)}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      ))}
      {pts.map((p, i) => (
        <circle key={`d${i}`} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={DOT_R} fill={stroke} />
      ))}
    </g>
  )
}

/* -------------------------------------------------------- mesh dimensions --- */
function meshWidth(k: number) {
  return k * COL_DX
}
function meshHeight(k: number) {
  return k * ROW_DY // tallest column (col 0) has k+1 dots -> k gaps
}

/* ------------------------------------------------------------- full figure -- */
const LABELS: Array<{ pic: number; k: number }> = [
  { pic: 1, k: 1 },
  { pic: 2, k: 2 },
  { pic: 3, k: 3 },
  { pic: 4, k: 4 },
]

export function TriSequenceFigure() {
  // Lay the four meshes out left to right, baselines aligned on y = 0 (centre),
  // then a dotted "?" circle for Picture 6.
  const GAP = 34
  const Q_R = 44 // radius of the dashed "?" circle
  const LABEL_GAP = 26 // space below each mesh for its caption

  // Compute x-origins.
  const placements: Array<{ pic: number; k: number; ox: number; w: number; h: number }> = []
  let cursor = 0
  for (const { pic, k } of LABELS) {
    const w = meshWidth(k)
    const h = meshHeight(k)
    placements.push({ pic, k, ox: cursor, w, h })
    cursor += w + GAP
  }
  // dotted ? circle for picture 6
  const dotsGap = 30
  const qCx = cursor + dotsGap + Q_R
  const qBottom = Q_R

  // viewBox extents
  const maxH = Math.max(...placements.map((p) => p.h), Q_R * 2)
  const top = -maxH / 2 - 16
  const bottomMesh = maxH / 2 + LABEL_GAP + 18
  const left = -16
  const right = qCx + Q_R + 16
  const vbW = right - left
  const vbH = bottomMesh - top

  return (
    <svg
      viewBox={`${left.toFixed(1)} ${top.toFixed(1)} ${vbW.toFixed(1)} ${vbH.toFixed(1)}`}
      width="100%"
      style={{ maxWidth: 560, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {placements.map(({ pic, k, ox, h }) => (
        <g key={pic} transform={`translate(${ox.toFixed(1)}, 0)`}>
          <TriMesh k={k} />
          <text
            x={(meshWidth(k) / 2).toFixed(1)}
            y={(h / 2 + LABEL_GAP).toFixed(1)}
            textAnchor="middle"
            fontSize={15}
            fontStyle="italic"
            fontWeight={600}
            fill={INK}
          >
            {`Picture ${pic}`}
          </text>
        </g>
      ))}

      {/* connecting dots "....." between picture 4 and the ? */}
      {[0, 1, 2].map((i) => (
        <circle key={`gap${i}`} cx={(cursor + 8 + i * 9).toFixed(1)} cy={0} r={2.4} fill={INK} />
      ))}

      {/* dashed ? circle = Picture 6 (the unknown) */}
      <circle cx={qCx.toFixed(1)} cy={0} r={Q_R} fill="none" stroke={INK} strokeWidth={1.8} strokeDasharray="4 5" />
      <text x={qCx.toFixed(1)} y={0} textAnchor="middle" dominantBaseline="central" fontSize={34} fontWeight={700} fontStyle="italic" fill={INK}>
        ?
      </text>
      <text
        x={qCx.toFixed(1)}
        y={(qBottom + LABEL_GAP + 4).toFixed(1)}
        textAnchor="middle"
        fontSize={15}
        fontStyle="italic"
        fontWeight={600}
        fill={INK}
      >
        Picture 6
      </text>
    </svg>
  )
}

export default function P25G3Q22Illustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Deret gambar segitiga yang makin rapat: Gambar 1 punya 1 segitiga, Gambar 2 punya 2, Gambar 3 punya 5, Gambar 4 punya 12, lalu lingkaran putus-putus berisi tanda tanya untuk Gambar 6."
    >
      <TriSequenceFigure />
    </div>
  )
}
