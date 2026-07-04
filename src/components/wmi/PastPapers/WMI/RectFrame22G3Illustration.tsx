/**
 * WMI-22F3A-Q21 — Four rectangles pinwheeled around a shaded (starred) region.
 *
 * THE FIGURE (reconstructed from db/seed/wmi/figures/2022-final-g3-a-q21.jpg)
 * =========================================================================
 * Four rectangles are arranged in a windmill/pinwheel around a small shaded
 * central rectangle that holds a red star. Visible scan labels:
 *
 *   TOP rectangle    : area 56, top edge "7"; small "4" on its LEFT edge
 *                      (the gap between its top and the LEFT rectangle's top).
 *   LEFT rectangle   : area 45, left edge "9"; small "4" under its bottom
 *                      (the gap between its left edge and the BOTTOM rect's left edge).
 *   RIGHT rectangle  : area 48, right edge "8".
 *   BOTTOM rectangle : area 42; small "3" on its right edge (the part sticking
 *                      out below the RIGHT rectangle's bottom).
 *
 * Alignments visible in the scan:
 *   TOP.left  = star.left = LEFT.right     TOP.bottom  = star.top = RIGHT.top
 *   LEFT.bottom = star.bottom = BOTTOM.top BOTTOM.right = star.right = RIGHT.left
 *
 * VERIFIED DERIVATION OF THE SHADED AREA = 30 (uses every label)
 * --------------------------------------------------------------
 *   TOP    56 = 7 × 8  → 8 tall.       LEFT  45 = 9 × 5 → 5 wide.
 *   RIGHT  48 = 8 × 6  → 6 wide.
 *   Shaded height: LEFT's top is 4 below TOP's top, so 8 − 4 = 4 of LEFT's 9
 *     lies above the shaded region → height = 9 − 4 = 5.
 *   BOTTOM: starts at star.bottom and ends 3 below RIGHT's bottom →
 *     height = 8 + 3 − 5 = 6 → width = 42 ÷ 6 = 7.
 *   Shaded width: BOTTOM's left edge is 4 right of LEFT's left edge, i.e.
 *     5 − 4 = 1 left of the star → width = 7 − 1 = 6.
 *   Shaded area = 5 × 6 = 30 ✓
 *
 * (Note: the pieces do NOT tile an enclosing rectangle — the answer comes
 *  from the 4 / 4 / 3 offsets, not from a big-box subtraction.)
 *
 * This component draws the SCAN's pinwheel layout (the problem setup) — the four
 * rectangles with their area / edge / small labels around a pale-blue central
 * region with a red star. It NEVER shows the answer (30); deriving 30 is the
 * step-explainer / animator's job. Figure is not to scale.
 *
 * Pure render from constants — SSR-safe, deterministic, no params needed.
 */

// ---------------------------------------------------------------------------
// RectFrame — reusable primitive (co-exported for the animator)
// ---------------------------------------------------------------------------

export interface RectFramePiece {
  /** stable id, e.g. 'top' | 'left' | 'right' | 'bottom' | 'star' */
  id: string
  /** top-left x in SVG user units */
  x: number
  /** top-left y in SVG user units */
  y: number
  /** width in SVG user units */
  w: number
  /** height in SVG user units */
  h: number
  /** big area label drawn at the centre (omit for the star) */
  area?: number
  /** small/edge labels: { text, dx, dy } positioned relative to top-left corner */
  labels?: { text: string; dx: number; dy: number; small?: boolean }[]
}

export interface RectFrameProps {
  pieces: RectFramePiece[]
  /** id of the central shaded piece (gets pale-blue fill + star) */
  starId?: string
  /** ids to highlight (animator hook) — drawn with the highlight fill */
  highlight?: string[]
  viewW: number
  viewH: number
}

/**
 * Draws a set of axis-aligned rectangles with area / edge labels, plus an
 * optional pale-blue shaded star piece. Used by the stem illustration and by the
 * animator to highlight individual rectangles while showing the area sum.
 * Pure SVG — deterministic, no randomness, no side effects.
 */
export function RectFrame({ pieces, starId, highlight = [], viewW, viewH }: RectFrameProps) {
  return (
    <svg
      viewBox={`0 0 ${viewW} ${viewH}`}
      width={Math.min(300, viewW)}
      height={(Math.min(300, viewW) / viewW) * viewH}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {pieces.map((p) => {
        const isStar = p.id === starId
        const isHi = highlight.includes(p.id)
        const fillClass = isStar
          ? 'fill-qupu-brand-blue/20'
          : isHi
            ? 'fill-qupu-peach'
            : 'fill-qupu-cream'
        return (
          <g key={p.id}>
            <rect
              x={p.x}
              y={p.y}
              width={p.w}
              height={p.h}
              className={`${fillClass} stroke-qupu-ink`}
              strokeWidth={1.6}
            />
            {/* big area label, centred */}
            {p.area != null && (
              <text
                x={p.x + p.w / 2}
                y={p.y + p.h / 2}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-qupu-ink"
                fontSize={15}
                fontWeight={600}
              >
                {p.area}
              </text>
            )}
            {/* red star for the shaded central piece */}
            {isStar && (
              <Star cx={p.x + p.w / 2} cy={p.y + p.h / 2} r={Math.min(p.w, p.h) * 0.32} />
            )}
            {/* small / edge labels */}
            {p.labels?.map((l, i) => (
              <text
                key={i}
                x={p.x + l.dx}
                y={p.y + l.dy}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-qupu-ink"
                fontSize={l.small ? 11 : 13}
                fontWeight={l.small ? 400 : 500}
              >
                {l.text}
              </text>
            ))}
          </g>
        )
      })}
    </svg>
  )
}

/** Five-pointed red star centred at (cx, cy) with outer radius r. */
function Star({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const inner = r * 0.42
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : inner
    // start pointing up (-90°)
    const a = (-90 + i * 36) * (Math.PI / 180)
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`)
  }
  return <polygon points={pts.join(' ')} className="fill-qupu-brand-orange" />
}

// ---------------------------------------------------------------------------
// Geometry of the SCAN pinwheel — drawn in TRUE proportions (k px per unit)
// ---------------------------------------------------------------------------
//
// Solved dimensions: star 6 w × 5 h; TOP 7×8; LEFT 5×9; RIGHT 6×8; BOTTOM 7×6.
// Alignments: TOP.left = star.left = LEFT.right; TOP.bottom = star.top = RIGHT.top;
// LEFT.bottom = star.bottom = BOTTOM.top; BOTTOM.right = star.right = RIGHT.left;
// LEFT.top = TOP.top + 4; BOTTOM.left = LEFT.left + 4; BOTTOM.bottom = RIGHT.bottom + 3.

const K = 14 // px per problem unit

// star (shaded) top-left — chosen so the whole 17u × 19u bundle centres in view
const SX = 51 + 5 * K   // = 121  (LEFT.left 51 + LEFT width 5u)
const SY = 27 + 8 * K   // = 139  (TOP.top 27 + TOP height 8u)
const SW = 6 * K        // star width  6u
const SH = 5 * K        // star height 5u

export const PIECES: RectFramePiece[] = [
  // TOP rectangle (area 56 = 7×8) — left edge flush with the star's left edge
  {
    id: 'top',
    x: SX,
    y: SY - 8 * K,
    w: 7 * K,
    h: 8 * K,
    area: 56,
    labels: [
      { text: '7', dx: (7 * K) / 2, dy: -10 },
      // "4": gap on TOP's left edge between TOP.top and LEFT.top (4u tall)
      { text: '4', dx: -10, dy: 2 * K, small: true },
    ],
  },
  // LEFT rectangle (area 45 = 5×9) — bottom edge flush with the star's bottom
  {
    id: 'left',
    x: SX - 5 * K,
    y: SY - 4 * K, // its top is 4u below TOP's top (8u − 4u above star top)
    w: 5 * K,
    h: 9 * K,
    area: 45,
    labels: [
      { text: '9', dx: -11, dy: (9 * K) / 2 },
      // "4": gap under LEFT's bottom between LEFT.left and BOTTOM.left (4u wide)
      { text: '4', dx: 2 * K, dy: 9 * K + 11, small: true },
    ],
  },
  // RIGHT rectangle (area 48 = 6×8) — top edge flush with the star's top
  {
    id: 'right',
    x: SX + SW,
    y: SY,
    w: 6 * K,
    h: 8 * K,
    area: 48,
    labels: [{ text: '8', dx: 6 * K + 11, dy: (8 * K) / 2 }],
  },
  // BOTTOM rectangle (area 42 = 7×6) — right edge flush with the star's right
  {
    id: 'bottom',
    x: SX + SW - 7 * K,
    y: SY + SH,
    w: 7 * K,
    h: 6 * K,
    area: 42,
    // "3": the part of BOTTOM's right edge sticking out below RIGHT's bottom
    labels: [{ text: '3', dx: 7 * K + 10, dy: 6 * K - (1.5 * K), small: true }],
  },
  // central shaded star region (no area shown — that's the unknown)
  { id: 'star', x: SX, y: SY, w: SW, h: SH },
]

// viewBox sized with headroom so labels/arcs never clip; content centred.
const VIEW_W = 340
const VIEW_H = 320

// ---------------------------------------------------------------------------
// Stem illustration (in-card figure shown with the question)
// ---------------------------------------------------------------------------

/**
 * RectFrame22G3Illustration — draws the four-rectangle pinwheel around the
 * shaded star region with all area / edge / small labels. Shows the setup only;
 * never reveals the answer (30).
 */
export default function RectFrame22G3Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Empat persegi panjang mengelilingi sebuah daerah berbintang yang diarsir. ' +
        'Persegi panjang atas berluas 56 dengan sisi 7, persegi panjang kiri berluas 45 dengan sisi 9, ' +
        'persegi panjang kanan berluas 48 dengan sisi 8, dan persegi panjang bawah berluas 42. ' +
        'Tentukan luas daerah berbintang di tengah. Gambar tidak sesuai skala.'
      }
    >
      <RectFrame pieces={PIECES} starId="star" viewW={VIEW_W} viewH={VIEW_H} />
    </div>
  )
}
