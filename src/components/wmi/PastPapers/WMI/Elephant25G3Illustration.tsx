// In-card figure for WMI-25F3A-Q25 (2025 Grade-3 Final, Q25 — "elephant area").
//
// Reconstructed from db/seed/wmi/figures/2025-final-g3-a-q25.jpg. The shaded
// elephant sits on 1 cm grid paper and its outline is built — exactly as the
// stem states — from 7 straight SEGMENTS, 6 congruent LONG arcs (each a
// half-disc drawn inside a 1×3 rectangle, radius 1.5) and 4 congruent SHORT
// arcs (each inside a 1×2 rectangle, radius 1.0). The printed letters/numbers
// mark which piece is which:
//   segments  : 1 (left side), 2 (chest slope), 3 (front-foot ledge),
//               5 (rear-foot step), 6 (rear leg), 7 (trunk-tip top), W (back)
//   long arcs : A (head/back), Y (front-leg front), 4 (belly baseline),
//               C (rear-leg back), D (trunk right), E (trunk left → saddle)
//   short arcs: X (chest notch), B (toe), Z (rump), F (back dip)
//
// The figure is PROBLEM-ONLY: it draws the setup (grid + labelled outline),
// never the area answer. Pure render, SSR-safe, deterministic — no params.

// ---- geometry, in GRID units (x → right, y → down; one unit = 1 cm) ----------

type EdgeKind = 'L' | 'La' | 'Sa' // segment | long arc | short arc
type Bulge = 'out' | 'in'

export interface ElephantVertex {
  /** grid coordinate of this vertex */
  p: [number, number]
  /** how the boundary reaches this vertex FROM the previous one (null = start) */
  edge: EdgeKind | null
  /** the printed label sitting on that piece */
  tag: string | null
  /** for arcs: does it bulge away from the body ('out') or into it ('in') */
  bulge?: Bulge
}

/** The elephant outline, traced clockwise from the top of the left side. */
export const ELEPHANT_PATH: ElephantVertex[] = [
  { p: [3.0, 4.6], edge: null, tag: null },
  { p: [3.0, 6.6], edge: 'L', tag: '1' }, // left side of head
  { p: [4.0, 7.4], edge: 'Sa', tag: 'X', bulge: 'in' }, // chest notch (concave)
  { p: [4.0, 8.0], edge: 'L', tag: '2' }, // chest slope
  { p: [2.7, 10.0], edge: 'La', tag: 'Y', bulge: 'out' }, // front-leg front
  { p: [1.0, 10.0], edge: 'L', tag: '3' }, // front-foot ledge
  { p: [4.0, 11.0], edge: 'Sa', tag: 'B', bulge: 'out' }, // toe
  { p: [9.3, 11.0], edge: 'La', tag: '4', bulge: 'out' }, // belly baseline (bulges down)
  { p: [9.3, 9.6], edge: 'L', tag: '5' }, // rear-foot step
  { p: [10.8, 7.4], edge: 'La', tag: 'C', bulge: 'out' }, // rear-leg back
  { p: [10.9, 5.6], edge: 'L', tag: '6' }, // rear leg
  { p: [10.6, 4.4], edge: 'Sa', tag: 'Z', bulge: 'out' }, // rump
  { p: [12.0, 1.4], edge: 'La', tag: 'D', bulge: 'out' }, // trunk right edge (bulges right)
  { p: [10.8, 1.0], edge: 'L', tag: '7' }, // trunk-tip top
  { p: [10.0, 3.9], edge: 'La', tag: 'E', bulge: 'in' }, // trunk left edge → saddle (concave)
  { p: [8.2, 3.3], edge: 'Sa', tag: 'F', bulge: 'in' }, // saddle dip rising onto the back
  { p: [5.5, 2.7], edge: 'L', tag: 'W' }, // back segment to head peak
  { p: [3.0, 4.6], edge: 'La', tag: 'A', bulge: 'out' }, // head/back arc to start
]

export const ELEPHANT_EDGE_COUNTS = { segments: 7, longArcs: 6, shortArcs: 4 } as const
export const LONG_ARC_RECT = '1 × 3' as const // long arc lives in a 1×3 rectangle (r = 1.5)
export const SHORT_ARC_RECT = '1 × 2' as const // short arc lives in a 1×2 rectangle (r = 1.0)

// ---- pixel layout -----------------------------------------------------------

const CELL = 40 // px per cm
const PAD = 8 // outer padding so outward arcs never clip
const COLS = 14
const ROWS = 13
const VIEW_W = PAD * 2 + COLS * CELL
const VIEW_H = PAD * 2 + ROWS * CELL

const INK = '#1F2937'

/** Roughly the body's centre of mass, in grid units — used to decide which
 *  way each arc bulges ('out' = away from here) and where labels sit. */
const BODY_CENTROID: [number, number] = [6.5, 6.5]

/** grid (x,y) → svg pixel (x,y) */
function px(gx: number, gy: number): [number, number] {
  return [PAD + gx * CELL, PAD + gy * CELL]
}

/**
 * Build the closed outline path string. Straight pieces are plain line-tos;
 * each arc is a quadratic curve whose control point is pushed perpendicular to
 * the chord by the arc's half-height (long arc ≈ a 1×3 half-disc, radius 1.5;
 * short arc ≈ a 1×2 half-disc, radius 1.0). `bulge` chooses which side of the
 * chord the curve swells toward — 'out' = away from the body, 'in' = into it.
 * We trace CLOCKWISE, so the left-hand normal points outward.
 */
export function buildElephantOutline(path: ElephantVertex[]): string {
  const [sx, sy] = px(path[0].p[0], path[0].p[1])
  let d = `M ${sx.toFixed(2)} ${sy.toFixed(2)}`
  for (let i = 1; i < path.length; i++) {
    const v = path[i]
    const [ax, ay] = px(path[i - 1].p[0], path[i - 1].p[1])
    const [tx, ty] = px(v.p[0], v.p[1])
    if (v.edge === 'L' || v.edge == null) {
      d += ` L ${tx.toFixed(2)} ${ty.toFixed(2)}`
    } else {
      const rCm = v.edge === 'La' ? 1.5 : 1.0
      const dx = tx - ax
      const dy = ty - ay
      const len = Math.hypot(dx, dy) || 1
      // bulge half-height: the arc's natural radius, but never so large that the
      // quadratic curls back on a short chord (cap at 0.85× the chord length).
      const h = Math.min(rCm * CELL, len * 0.85)
      const mx = (ax + tx) / 2
      const my = (ay + ty) / 2
      // Outward = the chord-perpendicular that points AWAY from the body
      // centroid (reliable for this star-convex blob). 'in' flips it inward.
      const [cgx, cgy] = px(BODY_CENTROID[0], BODY_CENTROID[1])
      let nx = dy / len
      let ny = -dx / len
      const towardOut = nx * (mx - cgx) + ny * (my - cgy)
      if (towardOut < 0) {
        nx = -nx
        ny = -ny
      }
      if (v.bulge === 'in') {
        nx = -nx
        ny = -ny
      }
      // apex sits ~h off the chord, so the control point is ~2h off it.
      const cx = mx + nx * h * 2
      const cy = my + ny * h * 2
      d += ` Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${tx.toFixed(2)} ${ty.toFixed(2)}`
    }
  }
  return d + ' Z'
}

/** midpoint of a piece, nudged outward, where its printed label sits */
function labelPos(path: ElephantVertex[], i: number): { x: number; y: number } {
  const a = path[i - 1].p
  const b = path[i].p
  const mx = (a[0] + b[0]) / 2
  const my = (a[1] + b[1]) / 2
  // outward normal ≈ away from the body centroid
  const cx = BODY_CENTROID[0]
  const cy = BODY_CENTROID[1]
  let nx = mx - cx
  let ny = my - cy
  const len = Math.hypot(nx, ny) || 1
  nx /= len
  ny /= len
  const off = path[i].edge === 'L' ? 0.7 : 1.15
  const [gx, gy] = [mx + nx * off, my + ny * off]
  const [x, y] = px(gx, gy)
  return { x, y }
}

// ---- component --------------------------------------------------------------

export default function Elephant25G3Illustration() {
  const outline = buildElephantOutline(ELEPHANT_PATH)

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Seekor gajah yang diarsir di atas kertas berpetak 1 cm. Tepinya tersusun dari ' +
        '7 ruas garis (ditandai 1, 2, 3, 5, 6, 7, W), 6 busur panjang yang kongruen ' +
        '(ditandai A, Y, 4, C, D, E — tiap busur dalam persegi panjang 1 × 3), dan ' +
        '4 busur pendek yang kongruen (ditandai X, B, Z, F — tiap busur dalam persegi ' +
        'panjang 1 × 2). Pertanyaan: tentukan luas gajah dalam cm persegi.'
      }
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* 1 cm grid */}
        {Array.from({ length: COLS + 1 }, (_, c) => {
          const [x] = px(c, 0)
          return (
            <line
              key={`vx${c}`}
              x1={x}
              y1={PAD}
              x2={x}
              y2={PAD + ROWS * CELL}
              className="stroke-qupu-peach"
              strokeWidth={1}
            />
          )
        })}
        {Array.from({ length: ROWS + 1 }, (_, r) => {
          const [, y] = px(0, r)
          return (
            <line
              key={`hz${r}`}
              x1={PAD}
              y1={y}
              x2={PAD + COLS * CELL}
              y2={y}
              className="stroke-qupu-peach"
              strokeWidth={1}
            />
          )
        })}

        {/* shaded elephant body */}
        <path
          d={outline}
          className="fill-qupu-sky stroke-qupu-brand-blue"
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* printed labels (1–7, A–F, W, X, Y, Z), each in a small ink disc */}
        {ELEPHANT_PATH.map((v, i) =>
          v.tag == null ? null : (
            <g key={`lab-${i}`}>
              {(() => {
                const { x, y } = labelPos(ELEPHANT_PATH, i)
                return (
                  <>
                    <circle cx={x} cy={y} r={11} fill={INK} />
                    <text
                      x={x}
                      y={y + 0.5}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={13}
                      fontWeight={900}
                      fill="#FFFFFF"
                      className="font-display"
                    >
                      {v.tag}
                    </text>
                  </>
                )
              })()}
            </g>
          ),
        )}
      </svg>
    </div>
  )
}
