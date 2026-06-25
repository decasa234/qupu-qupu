// SEAMOX-23-A-Q3 — "Find the perimeter of the figure shown below"
// Figure: 10×8 cm rectangle with a 4 cm wide × 3 cm deep notch cut from the top.
// Labels shown: bottom=10 cm, right=8 cm, notch inner-right=3 cm, notch bottom=4 cm.
// Answer (NOT shown): perimeter = 42 cm.
//
// Adapted from StaircasePerimX22A3Illustration — same rectilinear-perimeter pattern,
// same colour tokens and SCALE; shape replaced with the notched rectangle.
// Pure render — no Math.random, no Date, no hooks, SSR-safe and deterministic.

// ── Geometry constants (re-exported so the explainer shares the same values) ──

/** px per cm */
export const SCALE = 12

/** Shape bounding dimensions (cm) */
export const W_CM = 10
export const H_CM = 8

/** Notch dimensions (cm) */
export const WL_CM = 3   // left outer wall width
export const NW_CM = 4   // notch opening width
export const WR_CM = 3   // right outer wall width
export const ND_CM = 3   // notch depth

/** Bounding dimensions (px) */
export const W  = W_CM  * SCALE   // 120
export const H  = H_CM  * SCALE   // 96
export const WL = WL_CM * SCALE   // 36
export const NW = NW_CM * SCALE   // 48
export const WR = WR_CM * SCALE   // 36
export const ND = ND_CM * SCALE   // 36

// ── Colour tokens (identical to StaircasePerimX22A3) ──────────────────────────
export const COLOR = {
  SHAPE_FILL:   '#F3EFE7',
  SHAPE_STROKE: '#8B7355',
  LABEL:        '#2E3A30',
  DIM:          '#5B4636',
  PANEL_TITLE:  '#7C6A58',
  H_EDGE:       '#2C7BE5',
  V_EDGE:       '#D97706',
  RESULT:       '#10B981',
} as const

// ── Explainer layout constants ─────────────────────────────────────────────────
export const EX_SVG_W = 260
export const EX_SVG_H = 200
/** Shape origin (top-left of shape) in the explainer SVG */
export const EX_OX = 50
export const EX_OY = 28

// ── Shared geometry helpers ────────────────────────────────────────────────────

/**
 * Returns the 8 polygon vertices of the notched rectangle as [x, y] pairs.
 * (ox, oy) = top-left corner of the bounding box in SVG coords (y-axis down).
 * Trace is clockwise starting from bottom-left.
 */
export function notchRectVertices(ox: number, oy: number): [number, number][] {
  return [
    [ox,           oy + H],        // bottom-left
    [ox + W,       oy + H],        // bottom-right
    [ox + W,       oy],            // top-right
    [ox + WL + NW, oy],            // notch outer top-right
    [ox + WL + NW, oy + ND],       // notch inner bottom-right
    [ox + WL,      oy + ND],       // notch inner bottom-left
    [ox + WL,      oy],            // notch outer top-left
    [ox,           oy],            // top-left
  ]
}

export type SegKind = 'H' | 'V'
export type Seg = { x1: number; y1: number; x2: number; y2: number; kind: SegKind }

/**
 * Returns 8 named edges of the shape, tagged H or V.
 * Horizontal: bottom, top-left, notch-bottom, top-right.
 * Vertical:   left, notch inner-left, notch inner-right, right.
 */
export function notchRectSegs(ox: number, oy: number): Seg[] {
  return [
    // Horizontal ──────────────────────────────────────────────────────────────
    { x1: ox,           y1: oy + H,        x2: ox + W,       y2: oy + H,        kind: 'H' }, // bottom   10 cm
    { x1: ox,           y1: oy,            x2: ox + WL,      y2: oy,            kind: 'H' }, // top-left  3 cm
    { x1: ox + WL,      y1: oy + ND,       x2: ox + WL + NW, y2: oy + ND,       kind: 'H' }, // notch-bot 4 cm
    { x1: ox + WL + NW, y1: oy,            x2: ox + W,       y2: oy,            kind: 'H' }, // top-right 3 cm
    // Vertical ────────────────────────────────────────────────────────────────
    { x1: ox,           y1: oy,            x2: ox,           y2: oy + H,        kind: 'V' }, // left      8 cm
    { x1: ox + WL,      y1: oy,            x2: ox + WL,      y2: oy + ND,       kind: 'V' }, // n-inner-L 3 cm
    { x1: ox + WL + NW, y1: oy + ND,       x2: ox + WL + NW, y2: oy,            kind: 'V' }, // n-inner-R 3 cm
    { x1: ox + W,       y1: oy,            x2: ox + W,       y2: oy + H,        kind: 'V' }, // right     8 cm
  ]
}

// ── Illustration layout ────────────────────────────────────────────────────────

const SVG_W = 280
const SVG_H = 190
// Shape origin (top-left of shape) in the illustration SVG
const OX = 55
const OY = 30

// ── Illustration component ─────────────────────────────────────────────────────

/**
 * NotchRectX23A3Illustration
 *
 * Static problem figure for SEAMOX-23-A-Q3.
 * Shows the 10 cm × 8 cm rectangle with a 4 cm × 3 cm notch cut from the top,
 * labelled with the four given dimensions. Perimeter (42 cm) is NOT shown.
 */
export default function NotchRectX23A3Illustration() {
  const pts = notchRectVertices(OX, OY)
  const pointsAttr = pts.map(([x, y]) => `${x},${y}`).join(' ')

  // Midpoint of the right outer wall (for the 8 cm label)
  const rightMidY = OY + H / 2

  // Midpoint of the notch inner-right wall (for the 3 cm label)
  const notchRightX = OX + WL + NW
  const notchRightMidY = OY + ND / 2

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Bangun segi empat berlekuk: lebar keseluruhan 10 cm, tinggi 8 cm, ' +
        'lekukan di bagian atas lebar 4 cm dan dalam 3 cm. Temukan keliling bangun tersebut.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ maxWidth: SVG_W, display: 'block' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* shape polygon */}
        <polygon
          points={pointsAttr}
          fill={COLOR.SHAPE_FILL}
          stroke={COLOR.SHAPE_STROKE}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* ── dimension labels ──────────────────────────────────────────── */}

        {/* "10 cm" below the bottom edge */}
        <text
          x={OX + W / 2} y={OY + H + 18}
          textAnchor="middle" fontSize={12} fontWeight={700}
          fill={COLOR.LABEL}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >10 cm</text>

        {/* "8 cm" right of the right side */}
        <text
          x={OX + W + 14} y={rightMidY}
          textAnchor="start" fontSize={12} fontWeight={700}
          fill={COLOR.LABEL}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          dominantBaseline="central"
        >8 cm</text>

        {/* "3 cm" right of the notch inner-right wall */}
        <text
          x={notchRightX + 10} y={notchRightMidY}
          textAnchor="start" fontSize={11} fontWeight={700}
          fill={COLOR.DIM}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          dominantBaseline="central"
        >3 cm</text>

        {/* "4 cm" below the notch bottom (inside the notch) */}
        <text
          x={OX + WL + NW / 2} y={OY + ND + 14}
          textAnchor="middle" fontSize={11} fontWeight={700}
          fill={COLOR.DIM}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >4 cm</text>
      </svg>
    </div>
  )
}
