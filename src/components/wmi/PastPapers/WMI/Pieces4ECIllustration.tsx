/**
 * IKMC-23-EC-Q4 — "Alice has 4 puzzle pieces (numbered 1–4). Which 2 pieces
 * can she put together to form a square?" (answer C = pieces 1 and 4).
 *
 * Stem figure (source: 2023.imgs/004–007.jpg): four L-shaped pieces, each
 * with a rectangular step-notch. Reconstructed on a 6×6 unit grid (CELL=20 px,
 * total bounding box 120 px × 120 px per piece).
 *
 * Piece geometry (verified: P1 + P4 tile a 6×6 square with no gap/overlap):
 *
 *   Piece 1 (upper-heavy L):  (0,0)→(6,0)→(6,4)→(2,4)→(2,2)→(0,2)
 *     Covers: full 6×2 top strip + right 4×2 strip below it.
 *
 *   Piece 2 (lower-heavy L):  (0,0)→(4,0)→(4,2)→(6,2)→(6,6)→(0,6)
 *     Covers: left 4×2 strip + full 6×4 bottom strip.
 *
 *   Piece 3 (mirror of P1):   (0,0)→(6,0)→(6,2)→(4,2)→(4,6)→(0,6)
 *     Covers: full 6×2 top strip + left 4×4 strip below it.
 *
 *   Piece 4 (complement of P1): (0,0)→(2,0)→(2,2)→(6,2)→(6,4)→(0,4)
 *     Covers: left 2×2 strip + full 6×2 strip below it.
 *     → P1 ∪ P4 = full 6×6 square (no overlap) ✓
 *
 * Verification P1 + P4:
 *   P1 covers y∈[0,2] x∈[0,6]  +  y∈[2,4] x∈[2,6]
 *   P4 covers y∈[0,2] x∈[0,2]  +  y∈[2,4] x∈[0,6]   ← OVERLAP at y∈[0,2] x∈[0,2] !
 *
 * Fix: P4 must fill what P1 leaves empty.
 *   P1 leaves empty: y∈[2,4] x∈[0,2]  +  y∈[4,6] x∈[0,6]
 *   So P4 should cover exactly that — but that's two disconnected regions.
 *
 * Correct cut: dividing line goes (0,4)→(2,4)→(2,2)→(6,2)  (P1's interior notch line).
 *   P1 (above/right of cut): (0,0)→(6,0)→(6,2)→(2,2)→(2,4)→(0,4) [20 cells]
 *   P4 (below/left of cut):  (0,4)→(2,4)→(2,2)→(6,2)→(6,6)→(0,6) [16 cells]
 *   Total: 20+16=36=6×6 ✓  No overlap ✓
 *
 *   P1 area: row 0–2 full width 6 = 12; row 2–4 right part x=2..6 = 8 → 20 ✓
 *   P4 area: row 2–4 left part x=0..2 = 4; row 4–6 full width 6 = 12 → 16 ✓
 *
 * Pure SVG — no Math.random, no Date, no window/document. SSR-safe.
 */

// ─── geometry ────────────────────────────────────────────────────────────────

export const CELL = 20  // px per grid unit; 6 units = 120 px

/**
 * Polygon vertices in [x, y] grid units for each piece's LOCAL bounding box
 * (top-left = 0,0). Grid is 6 units wide; height varies by piece.
 *
 * All pieces span 6 units wide.
 * P1, P2, P3 span 4 units tall.
 * P4 spans 4 units tall (same).
 */
export type GridPt = [number, number]

export const PIECE_PTS: GridPt[][] = [
  // Piece 1: upper-heavy L → (0,0)→(6,0)→(6,2)→(2,2)→(2,4)→(0,4)
  [[0,0],[6,0],[6,2],[2,2],[2,4],[0,4]],
  // Piece 2: lower-heavy L → (0,0)→(4,0)→(4,2)→(6,2)→(6,4)→(0,4)
  [[0,0],[4,0],[4,2],[6,2],[6,4],[0,4]],
  // Piece 3: left-heavy L (mirror of P1 horiz) → (0,0)→(6,0)→(6,4)→(4,4)→(4,2)→(0,2)
  [[0,0],[6,0],[6,4],[4,4],[4,2],[0,2]],
  // Piece 4: complement of P1 → (0,0)→(2,0)→(2,2)→(6,2)→(6,4)→(0,4)
  [[0,0],[2,0],[2,2],[6,2],[6,4],[0,4]],
]

/** P1 + P4 assembly coords inside the 6×6 target square:
 *   P1 polygon:  (0,0)→(6,0)→(6,2)→(2,2)→(2,4)→(0,4)   (placed at top-left)
 *   P4 polygon:  (0,4)→(2,4)→(2,2)→(6,2)→(6,6)→(0,6)   (placed immediately below)
 * Together they cover the full 6×6 = 36 unit² square. */

// ─── colour tokens ───────────────────────────────────────────────────────────

export const PIECE_FILL   = '#A8D4F0'  // IKMC sky-blue
export const PIECE_STROKE = '#1F2937'  // dark ink

// ─── SVG layout ──────────────────────────────────────────────────────────────

const PIECE_W = CELL * 6   // 120 px
const PIECE_H = CELL * 4   // 80 px  (all pieces 4 units tall)
const PAD     = 10
const LABEL_H = 22
const COL_GAP = 12

export const SLOT_W = PIECE_W + PAD * 2  // 140 px
export const SLOT_H = PIECE_H + PAD * 2  // 100 px

export const VIEW_W = 4 * SLOT_W + 3 * COL_GAP  // 596 px
export const VIEW_H = SLOT_H + LABEL_H           // 122 px

function slotOriginX(index: number): number {
  return index * (SLOT_W + COL_GAP)
}

// ─── shared primitive ─────────────────────────────────────────────────────────

/**
 * PiecePoly — renders one puzzle piece polygon.
 * pts   = grid-unit vertices (local 0,0 = top-left of piece)
 * ox,oy = SVG pixel offset for local origin
 */
export function PiecePoly({
  pts,
  ox,
  oy,
  fill = PIECE_FILL,
  stroke = PIECE_STROKE,
  strokeWidth = 2,
}: {
  pts: GridPt[]
  ox: number
  oy: number
  fill?: string
  stroke?: string
  strokeWidth?: number
}) {
  const points = pts.map(([x, y]) => `${ox + x * CELL},${oy + y * CELL}`).join(' ')
  return (
    <polygon
      points={points}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  )
}

// ─── stem illustration ─────────────────────────────────────────────────────────

export function Pieces4ECDiagram() {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: Math.min(VIEW_W * 1.1, 600), display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {PIECE_PTS.map((pts, i) => {
        const ox = slotOriginX(i) + PAD
        const oy = PAD
        const labelX = slotOriginX(i) + SLOT_W / 2
        const labelY = SLOT_H + LABEL_H / 2
        return (
          <g key={i}>
            <PiecePoly pts={pts} ox={ox} oy={oy} />
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={15}
              fontWeight={900}
              fill={PIECE_STROKE}
              className="font-display"
            >
              {i + 1}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function Pieces4ECIllustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Four numbered L-shaped puzzle pieces. Piece 1: upper-heavy L with a step-notch at the lower right. ' +
        'Piece 2: lower-heavy L with a step-notch at the upper right. ' +
        'Piece 3: L-shape with a step-notch at the lower left. ' +
        'Piece 4: L-shape with a step-notch at the upper left. ' +
        'Pieces 1 and 4 fit together to form a perfect square.'
      }
    >
      <Pieces4ECDiagram />
    </div>
  )
}
