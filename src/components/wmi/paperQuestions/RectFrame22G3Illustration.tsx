/**
 * WMI-22F3A-Q21 — Four rectangles pinwheeled around a shaded (starred) region.
 *
 * THE FIGURE (reconstructed from db/seed/wmi/figures/2022-final-g3-a-q21.jpg)
 * =========================================================================
 * Four rectangles are arranged in a windmill/pinwheel around a small shaded
 * central rectangle that holds a red star. Visible scan labels:
 *
 *   TOP rectangle    : area 56, top edge "7", small "4" at its bottom-left.
 *   LEFT rectangle   : area 45, left edge "9", small "4" at its bottom.
 *   RIGHT rectangle  : area 48, right edge "8", small "3" at its top.
 *   BOTTOM rectangle : area 42, small "3" at its bottom-right.
 *
 * Derived rectangle dimensions (w × h, from the areas + the labelled edges):
 *   TOP    = 7 × 8  (= 56)   — "7" is the top edge, so height = 56 / 7 = 8.
 *   LEFT   = 5 × 9  (= 45)   — "9" is the left edge, so width  = 45 / 9 = 5.
 *   RIGHT  = 6 × 8  (= 48)   — "8" is the right edge, so width = 48 / 8 = 6.
 *   BOTTOM = 7 × 6  (= 42)   — 7 × 6 = 42 (the un-labelled rectangle).
 *
 * VERIFIED PROOF THAT THE SHADED AREA = 30
 * ----------------------------------------
 * The four rectangles together with the shaded star region EXACTLY TILE a
 * 13 × 17 enclosing rectangle (no gaps, no overlaps). This was confirmed by a
 * cell-by-cell fill:
 *
 *     LLLLL.TTTTTTT      box = 13 wide × 17 tall
 *     LLLLL.TTTTTTT      TOP    7×8 hugs top-right
 *     LLLLL.TTTTTTT      LEFT   5×9 hugs top-left
 *     LLLLL.TTTTTTT      RIGHT  6×8 hugs bottom-right
 *     LLLLL.TTTTTTT      BOTTOM 7×6 hugs bottom-left
 *     LLLLL.TTTTTTT      "." cells = the shaded star region (exactly 30 cells)
 *     LLLLL.TTTTTTT
 *     LLLLL.TTTTTTT
 *     LLLLL........
 *     .......RRRRRR
 *     .......RRRRRR
 *     BBBBBBBRRRRRR
 *     BBBBBBBRRRRRR
 *     BBBBBBBRRRRRR
 *     BBBBBBBRRRRRR
 *     BBBBBBBRRRRRR
 *     BBBBBBBRRRRRR
 *
 *   Enclosing rectangle  : 13 × 17                       = 221
 *   Sum of four rectangles: 56 + 45 + 48 + 42            = 191
 *   Shaded (star) area    : 221 − 191                    =  30   ✓
 *
 *   (13 = 7 + 6 = top width + right width;
 *    17 = 8 + 9 = top height + left height.)
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
// Geometry of the SCAN pinwheel (drawing layout, NOT the 13×17 tiling)
// ---------------------------------------------------------------------------
//
// We lay the four rectangles around a small central shaded rectangle so the
// drawing reproduces the windmill look of the scan. The shaded centre is sized
// like a small square; each rectangle hugs one side of it and overshoots toward
// the next (the small "4"/"3" stubs). Coordinates below are purely for display.

const U = 22 // base unit (px) for the central shaded cell side

// central shaded region (a small square in the drawing) — top-left at (CX, CY)
const CX = 150
const CY = 130
const CW = U * 2 // ~44
const CH = U * 2 // ~44

// rectangle drawing sizes (proportional, "not to scale")
const TOP_W = U * 3
const TOP_H = U * 2.4
const LEFT_W = U * 2.4
const LEFT_H = U * 3
const RIGHT_W = U * 2.4
const RIGHT_H = U * 3
const BOT_W = U * 3
const BOT_H = U * 2.4

// pinwheel offsets (the small stubs): each rect is shifted along the shared edge
const OFF = U * 0.7

export const PIECES: RectFramePiece[] = [
  // TOP rectangle (area 56) — sits above centre, right-aligned to centre's right edge
  {
    id: 'top',
    x: CX + CW - TOP_W + OFF,
    y: CY - TOP_H,
    w: TOP_W,
    h: TOP_H,
    area: 56,
    labels: [
      { text: '7', dx: TOP_W / 2, dy: -10 },
      { text: '4', dx: 12, dy: TOP_H - 10, small: true },
    ],
  },
  // LEFT rectangle (area 45) — sits left of centre, top-aligned to centre's top edge
  {
    id: 'left',
    x: CX - LEFT_W,
    y: CY - OFF,
    w: LEFT_W,
    h: LEFT_H,
    area: 45,
    labels: [
      { text: '9', dx: -11, dy: LEFT_H / 2 },
      { text: '4', dx: 12, dy: LEFT_H - 10, small: true },
    ],
  },
  // RIGHT rectangle (area 48) — sits right of centre, bottom-aligned to centre's bottom edge
  {
    id: 'right',
    x: CX + CW,
    y: CY + CH - RIGHT_H + OFF,
    w: RIGHT_W,
    h: RIGHT_H,
    area: 48,
    labels: [
      { text: '8', dx: RIGHT_W + 11, dy: RIGHT_H / 2 },
      { text: '3', dx: RIGHT_W - 12, dy: 12, small: true },
    ],
  },
  // BOTTOM rectangle (area 42) — sits below centre, left-aligned to centre's left edge
  {
    id: 'bottom',
    x: CX - OFF,
    y: CY + CH,
    w: BOT_W,
    h: BOT_H,
    area: 42,
    labels: [{ text: '3', dx: BOT_W - 12, dy: BOT_H - 10, small: true }],
  },
  // central shaded star region (no area shown — that's the unknown)
  { id: 'star', x: CX, y: CY, w: CW, h: CH },
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
