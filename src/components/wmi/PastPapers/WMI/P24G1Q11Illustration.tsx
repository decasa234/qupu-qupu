// In-card SVG illustration for WMI-24P1A-Q11 (2024 Grade-1 Semifinal, Paper A).
//
// "The six shapes labelled 1 to 6 are shown. Which two of them can be put
//  together to exactly fill the empty square on the right?"  Answer: E (6 + 6).
//
// Source figure (db/seed/wmi/figures/2024-semifinal-g1-a-q11.jpg): six light-blue
// shapes labelled 1..6 sit in a peach panel; to the right is an empty square.
// Each shape is a right-triangle half of a square whose diagonal "cut" edge is a
// jagged/curved profile (notches and bumps). Two shapes fit together exactly only
// when their cut edges are perfectly complementary.
//
// The matching pair is 6 + 6: piece 6's cut edge is 180°-rotationally symmetric
// about the square's centre, so a second copy of piece 6 — rotated a half turn —
// locks notch-to-bump against the first, and their straight legs become the four
// sides of the square. (This is exactly why two IDENTICAL copies work.) Option E
// = "6 + 6".
//
// The static figure draws ONLY the six pieces and the empty target square — it
// never shows the assembled answer. Post-answer, the explainer slides a second
// copy of piece 6 into place via the co-exported `Piece6` primitive.
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

const INK = '#1F2937'
const PIECE_FILL = '#CFE6F5' // light blue, matches the scan
const PIECE_FILL_2 = '#FBCF9C' // peach — the second (rotated) copy in the explainer
const PANEL_FILL = '#FBE3C4' // peach panel background
const PANEL_STROKE = '#E7B57E'
const TARGET_FILL = '#EAF4FC' // very light blue empty square
const LABEL_BG = '#1F2937'
const LABEL_FG = '#FFFFFF'

// ── Piece geometry ────────────────────────────────────────────────────────────
//
// Every piece lives on a unit square of side S with the RIGHT ANGLE at the
// BOTTOM-LEFT corner A = (0, S). Its two straight legs are the left edge
// (TL → A) and the bottom edge (A → BR). The third side is the "cut" edge that
// runs from the top-left corner TL = (0, 0) to the bottom-right corner BR =
// (S, S).
//
// For piece 6 the cut edge is built to be 180°-rotationally symmetric about the
// square centre C = (S/2, S/2): for every point (x, y) on the cut, (S−x, S−y) is
// also on it. That symmetry is what lets a second copy of piece 6, rotated a half
// turn, tile the square exactly.

const S = 100 // unit square side for piece geometry

/**
 * The cut edge of piece 6 from TL (0,0) to BR (S,S), as an SVG path data string
 * WITHOUT the leading move (the caller supplies `M`). Built point-symmetric about
 * the centre: a short straight run, an inward V-notch, a round lobe bulging to the
 * upper-right, then (by symmetry) the mirrored notch, and into BR.
 */
function piece6CutPath(): string {
  // Hand-tuned control points along the diagonal, point-symmetric about (50,50).
  // Top half (near TL):
  //   small step down-right, then a notch dimple, then sweep the round lobe.
  // The lobe is a single arc; symmetry guarantees the bottom half mirrors it.
  return [
    // from TL (0,0):
    `L 18 10`, // short straight run down-right
    `L 30 30`, // dip in toward a small notch corner
    `L 22 38`, // the inward V-notch tip (points up-left)
    // round lobe bulging to the upper-right (a big convex arc) ending past centre
    `A 30 30 0 1 1 78 62`,
    // mirrored notch tip (points down-right), by 180° symmetry of the top notch
    `L 70 70`,
    `L 82 90`, // mirrored straight dip
    // into BR (S,S):
    `L ${S} ${S}`,
  ].join(' ')
}

/** Full outline path of piece 6 (closed), in unit-square coords. */
export function piece6Path(): string {
  // TL (0,0) → cut edge → BR (S,S) → A bottom-left (0,S) → close (back up to TL).
  return `M 0 0 ${piece6CutPath()} L 0 ${S} Z`
}

/**
 * One drawn copy of piece 6.
 *
 * @param x,y      top-left placement of the unit square in SVG coords
 * @param size     rendered side length (the unit square is scaled to this)
 * @param fill     fill colour
 * @param rotated  when true, rotate the piece 180° about its own centre (this is
 *                 the second copy that locks into the first)
 * @param label    optional number badge (e.g. "6") drawn near the bottom-left
 */
export function Piece6({
  x,
  y,
  size,
  fill = PIECE_FILL,
  rotated = false,
  label,
}: {
  x: number
  y: number
  size: number
  fill?: string
  rotated?: boolean
  label?: string
}) {
  const k = size / S
  const cx = x + size / 2
  const cy = y + size / 2
  const transform = `translate(${x} ${y}) scale(${k})`
  const groupTransform = rotated ? `rotate(180 ${cx} ${cy})` : undefined

  return (
    <g transform={groupTransform}>
      <path d={piece6Path()} transform={transform} fill={fill} stroke={INK} strokeWidth={2.4 / k} strokeLinejoin="round" />
      {label != null && (
        <g transform={rotated ? `rotate(180 ${x + size * 0.2} ${y + size * 0.82})` : undefined}>
          <circle cx={x + size * 0.2} cy={y + size * 0.82} r={size * 0.12} fill={LABEL_BG} />
          <text
            x={x + size * 0.2}
            y={y + size * 0.82 + 1}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={size * 0.16}
            fontWeight={900}
            fill={LABEL_FG}
            className="font-display"
          >
            {label}
          </text>
        </g>
      )}
    </g>
  )
}

// The five "distractor" pieces (1..5). Each is a right-triangle half of a square
// with a DIFFERENT jagged cut edge, drawn to resemble the scan. None of them is
// self-complementary, so only piece 6 pairs with its own copy. These are drawn
// purely as visual context; their exact cut profiles are not load-bearing.
//
// Each entry is the cut-edge path (TL → BR) in unit-square coords.
const OTHER_CUTS: Record<number, string> = {
  // 1: right angle TOP-LEFT — long zigzag, two steps
  1: 'L 12 8 L 22 28 L 14 40 L 40 50 L 36 66 L 56 74 L 70 86 L 100 100',
  2: 'L 16 6 L 8 24 L 34 34 L 30 52 L 52 60 L 48 78 L 100 100',
  3: 'L 14 10 L 26 30 L 16 40 L 44 54 L 40 72 L 64 80 L 56 92 L 100 100',
  4: 'L 22 14 L 40 6 L 34 26 L 58 30 L 50 50 L 72 56 L 64 78 L 100 100',
  5: 'L 24 12 L 44 16 L 38 34 L 60 40 L 54 60 L 78 66 L 100 100',
}

function otherPiecePath(n: number): string {
  return `M 0 0 ${OTHER_CUTS[n]} L 0 ${S} Z`
}

/** A distractor piece 1..5 (right angle at bottom-left, varied cut edge). */
function OtherPiece({ n, x, y, size }: { n: number; x: number; y: number; size: number }) {
  const k = size / S
  return (
    <g>
      <path
        d={otherPiecePath(n)}
        transform={`translate(${x} ${y}) scale(${k})`}
        fill={PIECE_FILL}
        stroke={INK}
        strokeWidth={2.4 / k}
        strokeLinejoin="round"
      />
      <circle cx={x + size * 0.2} cy={y + size * 0.82} r={size * 0.12} fill={LABEL_BG} />
      <text
        x={x + size * 0.2}
        y={y + size * 0.82 + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size * 0.16}
        fontWeight={900}
        fill={LABEL_FG}
        className="font-display"
      >
        {n}
      </text>
    </g>
  )
}

// ── Layout ──────────────────────────────────────────────────────────────────
const PIECE_SIZE = 76
const COL_GAP = 18
const ROW_GAP = 18
const PANEL_PAD = 18
const ARROW_W = 56
const TARGET_SIZE = 96
const OUT_PAD = 12

// Panel holds a 3 × 2 grid of pieces.
const PANEL_W = PANEL_PAD * 2 + 3 * PIECE_SIZE + 2 * COL_GAP
const PANEL_H = PANEL_PAD * 2 + 2 * PIECE_SIZE + ROW_GAP

const SVG_W = OUT_PAD * 2 + PANEL_W + ARROW_W + TARGET_SIZE
const SVG_H = OUT_PAD * 2 + PANEL_H

// piece grid origins inside the panel
function pieceOrigin(col: number, row: number): { x: number; y: number } {
  return {
    x: OUT_PAD + PANEL_PAD + col * (PIECE_SIZE + COL_GAP),
    y: OUT_PAD + PANEL_PAD + row * (PIECE_SIZE + ROW_GAP),
  }
}

export function Q11Diagram() {
  // pieces 1,2,3 on the top row; 4,5,6 on the bottom row
  const placements: Array<{ n: number; col: number; row: number }> = [
    { n: 1, col: 0, row: 0 },
    { n: 2, col: 1, row: 0 },
    { n: 3, col: 2, row: 0 },
    { n: 4, col: 0, row: 1 },
    { n: 5, col: 1, row: 1 },
    { n: 6, col: 2, row: 1 },
  ]

  const arrowX = OUT_PAD + PANEL_W + 6
  const arrowMidY = OUT_PAD + PANEL_H / 2
  const targetX = OUT_PAD + PANEL_W + ARROW_W
  const targetY = OUT_PAD + (PANEL_H - TARGET_SIZE) / 2

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: 520, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* peach panel */}
      <rect
        x={OUT_PAD}
        y={OUT_PAD}
        width={PANEL_W}
        height={PANEL_H}
        rx={16}
        fill={PANEL_FILL}
        stroke={PANEL_STROKE}
        strokeWidth={2}
      />

      {/* the six pieces */}
      {placements.map(({ n, col, row }) => {
        const { x, y } = pieceOrigin(col, row)
        return n === 6 ? (
          <Piece6 key={n} x={x} y={y} size={PIECE_SIZE} label="6" />
        ) : (
          <OtherPiece key={n} n={n} x={x} y={y} size={PIECE_SIZE} />
        )
      })}

      {/* arrow → */}
      <g stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none">
        <line x1={arrowX} y1={arrowMidY} x2={arrowX + ARROW_W - 20} y2={arrowMidY} />
        <polyline points={`${arrowX + ARROW_W - 30},${arrowMidY - 10} ${arrowX + ARROW_W - 16},${arrowMidY} ${arrowX + ARROW_W - 30},${arrowMidY + 10}`} />
      </g>

      {/* empty target square */}
      <rect
        x={targetX}
        y={targetY}
        width={TARGET_SIZE}
        height={TARGET_SIZE}
        rx={4}
        fill={TARGET_FILL}
        stroke={INK}
        strokeWidth={3}
      />
    </svg>
  )
}

export default function P24G1Q11Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Enam bentuk biru berlabel 1 sampai 6 di dalam panel oranye, lalu tanda panah ke sebuah persegi kosong. Pilih dua bentuk yang digabungkan tepat mengisi persegi itu."
    >
      <Q11Diagram />
    </div>
  )
}

export { PIECE_FILL, PIECE_FILL_2, INK as Q11_INK, S as PIECE_UNIT, TARGET_FILL }
