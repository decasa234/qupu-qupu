/**
 * WMI-24P3A-Q8 (2024 Grade 3 Semifinal, Paper A) — folding a regular hexagon.
 *
 * Source figure (db/seed/wmi/figures/2024-semifinal-g3-a-q8.jpg): a single solid
 * purple regular hexagon (flat top + flat bottom, pointed left/right). The four
 * answer figures A–D were separate scanned images, so the seed stores them as
 * placeholder text; the correct option is A.
 *
 * Problem: fold the regular hexagon along a straight line so the two halves
 * overlap exactly (a line of symmetry), then fold the result the same way once
 * more. What shape is left?
 *   • Fold 1 along the horizontal axis (side-vertex to side-vertex): the half
 *     of a regular hexagon is an isosceles TRAPEZOID (parallel sides s and 2s).
 *   • Fold 2 along that trapezoid's vertical axis: a smaller RIGHT TRAPEZOID
 *     (a quarter of the hexagon) — this matches option A.
 *
 * The static figure shows ONLY the un-folded hexagon (the problem). The fold
 * lines / resulting shape are revealed only by the explainer.
 *
 * Co-exports the `HexFold` primitive and HEX_PTS so the explainer can re-draw
 * the same hexagon and progressively show the fold lines and folded shape.
 *
 * Pure render — no Math.random, no Date, no window/document at module load.
 * SSR-safe + deterministic.
 */

// ── colour tokens ────────────────────────────────────────────────────────────
const HEX_FILL = '#A78BDB' // purple hexagon (matches the scan)
const HEX_EDGE = '#6D5BAE'
const FOLD_LINE = '#E11D48' // red fold/symmetry line
const HALF_FILL = '#7C5FCB' // the kept half/quarter, drawn darker
const HALF_EDGE = '#4C357F'

// ── geometry ─────────────────────────────────────────────────────────────────
const VW = 260
const VH = 240
const CX = VW / 2
const CY = VH / 2
const R = 88 // circumradius

/**
 * Regular hexagon with a FLAT TOP (two vertices form the top edge) and pointed
 * left/right vertices — matching the scanned orientation. Vertices at angles
 * −60, 0, 60, 120, 180, 240 measured from +x, going clockwise in screen space.
 * Listed clockwise starting top-left.
 */
function hexVertices(cx: number, cy: number, r: number): [number, number][] {
  // angles (deg) for flat-top hexagon, clockwise from top-left vertex
  const angles = [-120, -60, 0, 60, 120, 180]
  return angles.map((a) => {
    const rad = (a * Math.PI) / 180
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)] as [number, number]
  })
}

export const HEX_PTS = hexVertices(CX, CY, R)

// Side / midpoint references for the fold lines.
const LEFT_V = HEX_PTS[5] // left vertex (180°)
const RIGHT_V = HEX_PTS[2] // right vertex (0°)
const TOP_MID: [number, number] = [(HEX_PTS[0][0] + HEX_PTS[1][0]) / 2, (HEX_PTS[0][1] + HEX_PTS[1][1]) / 2] // top-edge midpoint
const BOT_MID: [number, number] = [(HEX_PTS[3][0] + HEX_PTS[4][0]) / 2, (HEX_PTS[3][1] + HEX_PTS[4][1]) / 2] // bottom-edge midpoint

function ptsStr(points: [number, number][]): string {
  return points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
}

export interface HexFoldProps {
  /** Show the horizontal symmetry line (fold 1). */
  showFold1?: boolean
  /** Show the vertical symmetry line of the half-trapezoid (fold 2). */
  showFold2?: boolean
  /** Highlight the kept TOP half (isosceles trapezoid) after fold 1. */
  showHalf?: boolean
  /** Highlight the kept top-right QUARTER (right trapezoid) after fold 2. */
  showQuarter?: boolean
}

/** Pure SVG primitive of the hexagon + optional fold lines / folded pieces. */
export function HexFold({ showFold1 = false, showFold2 = false, showHalf = false, showQuarter = false }: HexFoldProps) {
  // Top half = isosceles trapezoid: top-left, top-right, right vertex, left vertex.
  const topHalf: [number, number][] = [HEX_PTS[0], HEX_PTS[1], RIGHT_V, LEFT_V]
  // Top-right quarter = right trapezoid: top-mid, top-right, right vertex, centre.
  const quarter: [number, number][] = [TOP_MID, HEX_PTS[1], RIGHT_V, [CX, CY]]

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 240 }}
      aria-hidden="true"
    >
      {/* full hexagon */}
      <polygon points={ptsStr(HEX_PTS)} fill={HEX_FILL} stroke={HEX_EDGE} strokeWidth={3} strokeLinejoin="round" />

      {/* kept top half (after fold 1) */}
      {showHalf && <polygon points={ptsStr(topHalf)} fill={HALF_FILL} stroke={HALF_EDGE} strokeWidth={3} strokeLinejoin="round" />}

      {/* kept top-right quarter (after fold 2) */}
      {showQuarter && <polygon points={ptsStr(quarter)} fill={HALF_FILL} stroke={HALF_EDGE} strokeWidth={3} strokeLinejoin="round" />}

      {/* fold 1: horizontal symmetry line (left vertex ↔ right vertex) */}
      {showFold1 && (
        <line
          x1={LEFT_V[0]}
          y1={LEFT_V[1]}
          x2={RIGHT_V[0]}
          y2={RIGHT_V[1]}
          stroke={FOLD_LINE}
          strokeWidth={2.6}
          strokeDasharray="7 5"
          strokeLinecap="round"
        />
      )}

      {/* fold 2: vertical symmetry line (top-edge midpoint ↔ bottom-edge midpoint) */}
      {showFold2 && (
        <line
          x1={TOP_MID[0]}
          y1={TOP_MID[1]}
          x2={BOT_MID[0]}
          y2={BOT_MID[1]}
          stroke={FOLD_LINE}
          strokeWidth={2.6}
          strokeDasharray="7 5"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

// ── default export ───────────────────────────────────────────────────────────

export default function P24G3Q8Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Sebuah segi enam beraturan berwarna ungu (sisi atas dan bawah datar). Lipat sepanjang garis simetri agar kedua bagian saling menutupi, lalu ulangi sekali lagi."
    >
      <HexFold />
    </div>
  )
}
