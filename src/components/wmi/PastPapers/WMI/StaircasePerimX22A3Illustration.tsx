// SEAMOX-22-A-Q3 — "Find the perimeter of the staircase-shaped figure"
// (width = 10 m, height = 8 m; answer = 36 m — NOT shown here)
//
// Two-panel figure faithful to the source images (OCR 2022.imgs/004.jpg + 005.jpg):
//   Left:  Example rectangle (6 m × 4 m) with perimeter annotation (20 m).
//   Right: The 4-step staircase (10 m wide, 8 m tall) — the actual problem figure.
//
// Adapted from Staircase1PEIllustration — staircase geometry; no animals or step numbers.
// Pure render — no Math.random, no Date, no hooks, SSR-safe and deterministic.

// ── Geometry constants (re-exported so the explainer shares the same values) ──

/** px per metre */
export const SCALE = 14

/** Number of stair steps */
export const STEPS = 4

/** Staircase bounding dimensions (m) */
export const W_M = 10
export const H_M = 8

/** Step tread width / riser height (m) */
export const TREAD_M = 2.5
export const RISER_M = 2

/** Staircase bounding dimensions (px) */
export const W = W_M * SCALE   // 140
export const H = H_M * SCALE   // 112

/** Step tread / riser (px) */
export const T = TREAD_M * SCALE  // 35
export const R = RISER_M * SCALE  // 28

// ── Colour tokens ──────────────────────────────────────────────────────────────
export const COLOR = {
  SHAPE_FILL:   '#F3EFE7',
  SHAPE_STROKE: '#8B7355',
  LABEL:        '#2E3A30',
  DIM:          '#5B4636',
  PANEL_TITLE:  '#7C6A58',
  DIVIDER:      '#E0D8CC',
  H_EDGE:       '#2C7BE5',   // horizontal highlight (explainer beat 1)
  V_EDGE:       '#D97706',   // vertical highlight (explainer beat 2)
  RESULT:       '#10B981',   // all edges (explainer beat 3)
} as const

// ── Explainer layout constants (separate single-staircase SVG) ─────────────────

/** Explainer SVG dimensions */
export const EX_SVG_W = 260
export const EX_SVG_H = 200

/** Staircase origin in the explainer SVG */
export const EX_OX = 50       // x of bottom-left
export const EX_OY = 163      // y of bottom-left

// ── Shared geometry helpers ────────────────────────────────────────────────────

/**
 * Returns the 10 vertices of the 4-step staircase polygon as [x, y] pairs.
 * Origin (ox, oy) is the bottom-left corner of the shape.
 * The polygon closes from vertex[9] back to vertex[0] — that closing edge is
 * the leftmost riser (height R, the first step's left face).
 */
export function staircaseVertices(ox: number, oy: number): [number, number][] {
  return [
    [ox,           oy],
    [ox + W,       oy],
    [ox + W,       oy - H],
    [ox + W - T,   oy - H],
    [ox + W - T,   oy - H + R],
    [ox + W - 2*T, oy - H + R],
    [ox + W - 2*T, oy - H + 2*R],
    [ox + W - 3*T, oy - H + 2*R],
    [ox + W - 3*T, oy - H + 3*R],
    [ox,           oy - H + 3*R],
  ]
}

/** Renders one line segment (for explainers that colour H vs V edges). */
export type SegKind = 'H' | 'V'
export type Seg = { x1: number; y1: number; x2: number; y2: number; kind: SegKind }

/**
 * Returns the 10 edges of the staircase separately, tagged H or V.
 * Order: 5 horizontal (bottom, treads 4→1), then 5 vertical (right, risers 4→1 + left).
 */
export function staircaseSegs(ox: number, oy: number): Seg[] {
  return [
    // Horizontal ─────────────────────────────────────────────────────────────
    { x1: ox,           y1: oy,            x2: ox + W,       y2: oy,            kind: 'H' }, // bottom
    { x1: ox + W,       y1: oy - H,        x2: ox + W - T,   y2: oy - H,        kind: 'H' }, // tread-4
    { x1: ox + W - T,   y1: oy - H + R,    x2: ox + W - 2*T, y2: oy - H + R,    kind: 'H' }, // tread-3
    { x1: ox + W - 2*T, y1: oy - H + 2*R,  x2: ox + W - 3*T, y2: oy - H + 2*R,  kind: 'H' }, // tread-2
    { x1: ox + W - 3*T, y1: oy - H + 3*R,  x2: ox,           y2: oy - H + 3*R,  kind: 'H' }, // tread-1
    // Vertical ────────────────────────────────────────────────────────────────
    { x1: ox + W,       y1: oy,            x2: ox + W,       y2: oy - H,        kind: 'V' }, // right
    { x1: ox + W - T,   y1: oy - H,        x2: ox + W - T,   y2: oy - H + R,    kind: 'V' }, // riser-4
    { x1: ox + W - 2*T, y1: oy - H + R,    x2: ox + W - 2*T, y2: oy - H + 2*R,  kind: 'V' }, // riser-3
    { x1: ox + W - 3*T, y1: oy - H + 2*R,  x2: ox + W - 3*T, y2: oy - H + 3*R,  kind: 'V' }, // riser-2
    { x1: ox,           y1: oy - H + 3*R,  x2: ox,           y2: oy,            kind: 'V' }, // left / riser-1
  ]
}

// ── Illustration layout ────────────────────────────────────────────────────────

// Total SVG
const SVG_W = 440
const SVG_H = 215

// Left panel — example rectangle (6 m × 4 m at 14 px/m = 84×56 px)
const RECT_W = 6 * SCALE   // 84
const RECT_H = 4 * SCALE   // 56
const RECT_X = 34
const RECT_Y = 52

// Right panel — staircase
const OX = 245   // bottom-left x
const OY = 168   // bottom-left y (top at OY - H = 56)

// ── Illustration component ─────────────────────────────────────────────────────

/**
 * StaircasePerimX22A3Illustration
 *
 * Static problem figure for SEAMOX-22-A-Q3.
 * Left: example rectangle (6 m × 4 m) as the question defines perimeter.
 * Right: 4-step staircase (10 m × 8 m) — the problem to solve.
 * The perimeter (36 m) is NOT shown.
 */
export default function StaircasePerimX22A3Illustration() {
  const pts = staircaseVertices(OX, OY)
  const pointsAttr = pts.map(([x, y]) => `${x},${y}`).join(' ')

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Dua panel: kiri — persegi panjang contoh 6 m × 4 m dengan keliling (4+6+6+4)=20 m; ' +
        'kanan — bangun tangga 4 anak tangga, lebar keseluruhan 10 m, tinggi keseluruhan 8 m. ' +
        'Temukan keliling bangun tangga tersebut.'
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

        {/* ── LEFT PANEL — example rectangle ──────────────────────────────── */}
        <text
          x={RECT_X + RECT_W / 2} y={22}
          textAnchor="middle" fontSize={10} fontWeight={700}
          fill={COLOR.PANEL_TITLE}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          Contoh / Example
        </text>

        {/* rectangle */}
        <rect
          x={RECT_X} y={RECT_Y}
          width={RECT_W} height={RECT_H}
          fill={COLOR.SHAPE_FILL}
          stroke={COLOR.SHAPE_STROKE}
          strokeWidth={2}
        />

        {/* top "6 m" */}
        <text
          x={RECT_X + RECT_W / 2} y={RECT_Y - 9}
          textAnchor="middle" fontSize={11} fontWeight={700}
          fill={COLOR.LABEL}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >6 m</text>

        {/* bottom "6 m" */}
        <text
          x={RECT_X + RECT_W / 2} y={RECT_Y + RECT_H + 15}
          textAnchor="middle" fontSize={11} fontWeight={700}
          fill={COLOR.LABEL}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >6 m</text>

        {/* left "4 m" */}
        <text
          x={RECT_X - 8} y={RECT_Y + RECT_H / 2}
          textAnchor="end" fontSize={11} fontWeight={700}
          fill={COLOR.LABEL}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          dominantBaseline="central"
        >4 m</text>

        {/* right "4 m" */}
        <text
          x={RECT_X + RECT_W + 8} y={RECT_Y + RECT_H / 2}
          textAnchor="start" fontSize={11} fontWeight={700}
          fill={COLOR.LABEL}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          dominantBaseline="central"
        >4 m</text>

        {/* perimeter annotation */}
        <text
          x={RECT_X + RECT_W / 2} y={RECT_Y + RECT_H + 32}
          textAnchor="middle" fontSize={9.5}
          fill={COLOR.DIM}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >(4+6+6+4) = 20 m</text>

        {/* ── divider ─────────────────────────────────────────────────────── */}
        <line
          x1={215} y1={18} x2={215} y2={SVG_H - 18}
          stroke={COLOR.DIVIDER}
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />

        {/* ── RIGHT PANEL — staircase (the problem figure) ─────────────────── */}
        <text
          x={OX + W / 2} y={22}
          textAnchor="middle" fontSize={10} fontWeight={700}
          fill={COLOR.PANEL_TITLE}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          Temukan keliling / Find perimeter
        </text>

        {/* staircase polygon */}
        <polygon
          points={pointsAttr}
          fill={COLOR.SHAPE_FILL}
          stroke={COLOR.SHAPE_STROKE}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* "10 m" bottom label */}
        <text
          x={OX + W / 2} y={OY + 18}
          textAnchor="middle" fontSize={12} fontWeight={700}
          fill={COLOR.LABEL}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >10 m</text>

        {/* "8 m" right label */}
        <text
          x={OX + W + 14} y={OY - H / 2}
          textAnchor="start" fontSize={12} fontWeight={700}
          fill={COLOR.LABEL}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          dominantBaseline="central"
        >8 m</text>
      </svg>
    </div>
  )
}
