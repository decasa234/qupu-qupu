/**
 * SEAMO-2016-Paper-A-Q18 — Dartboard illustration
 *
 * "The diagram shows a dartboard. What is the least number of throws to
 *  score 100?" (answer: 3 — e.g. 38 + 23 + 39 = 100)
 *
 * Source figure: docs/reference/ocr-res/seamo/contest/paper-a/2016.imgs/015.jpg
 *
 * The dartboard is a circle divided into 8 equal 45° wedge sections by
 * 4 lines through the centre (vertical, horizontal, two diagonals).
 * Sections clockwise from NW: 26, 39, 19, 38, 23, 44, 41, 11.
 *
 * Highlight prop: array of scores to tint amber (used by explainer to
 * show the winning combination 38 + 23 + 39 = 100).
 *
 * SSR-safe: no window/document/random/Date. Pure render.
 */

// ── colour tokens ─────────────────────────────────────────────────────────────
const FILL_GREEN    = '#4CAF50'   // section fill (matches source image)
const FILL_AMBER    = '#F59E0B'   // highlighted section (explainer)
const STROKE_DARK   = '#2D3748'   // divider lines & outer ring
const TEXT_DARK     = '#1A202C'   // section label text

// ── geometry ──────────────────────────────────────────────────────────────────
const CX = 110
const CY = 110
const R  = 95   // circle radius
const VIEW = 220

/** Convert polar coords to cartesian, angle in degrees (0 = right, CCW positive) */
function polar(cx: number, cy: number, r: number, angleDeg: number): [number, number] {
  const rad = (angleDeg * Math.PI) / 180
  return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)]
}

/**
 * Build a SVG pie-wedge path from the circle centre to the arc.
 * Angles are in degrees, measured clockwise from the top (12-o'clock).
 */
function wedgePath(cx: number, cy: number, r: number, startClockDeg: number, endClockDeg: number): string {
  // Convert clockwise-from-top to standard math angle (CCW from right)
  const toMath = (d: number) => 90 - d
  const [x1, y1] = polar(cx, cy, r, toMath(startClockDeg))
  const [x2, y2] = polar(cx, cy, r, toMath(endClockDeg))
  const largeArc = endClockDeg - startClockDeg > 180 ? 1 : 0
  return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`
}

/**
 * Label position: midpoint of the wedge arc at 60% radius.
 */
function labelPos(cx: number, cy: number, r: number, startClockDeg: number, endClockDeg: number): [number, number] {
  const midDeg = (startClockDeg + endClockDeg) / 2
  const toMath = (d: number) => 90 - d
  return polar(cx, cy, r * 0.62, toMath(midDeg))
}

// ── Section data ──────────────────────────────────────────────────────────────
// 8 wedges, each 45°, clockwise from NW (starting at 315° clockwise from top).
// Order confirmed from source image (015.jpg).
const SECTIONS: Array<{ score: number; start: number; end: number }> = [
  { score: 26, start: 315, end:   0 },   // NW — wraps through north
  { score: 39, start:   0, end:  45 },   // NE
  { score: 19, start:  45, end:  90 },   // E upper
  { score: 38, start:  90, end: 135 },   // E lower
  { score: 23, start: 135, end: 180 },   // SE
  { score: 44, start: 180, end: 225 },   // SW
  { score: 41, start: 225, end: 270 },   // W lower
  { score: 11, start: 270, end: 315 },   // W upper
]

// ── Props ─────────────────────────────────────────────────────────────────────
export interface DartboardProps {
  /**
   * Scores to highlight in amber (e.g. [38, 23, 39] for the explainer).
   * Default: [] — all sections show in green.
   */
  highlighted?: readonly number[]
}

// ── Primitive ─────────────────────────────────────────────────────────────────
export function DartboardSVG({ highlighted = [] }: DartboardProps) {
  const hlSet = new Set(highlighted)

  return (
    <svg
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      width="100%"
      style={{ maxWidth: 240, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Background */}
      <rect x={0} y={0} width={VIEW} height={VIEW} fill="#f9fafb" />

      {/* Wedge sections */}
      {SECTIONS.map(({ score, start, end }) => {
        const fill = hlSet.has(score) ? FILL_AMBER : FILL_GREEN
        return (
          <path
            key={score}
            d={wedgePath(CX, CY, R, start, end)}
            fill={fill}
            stroke={STROKE_DARK}
            strokeWidth={2}
            strokeLinejoin="round"
          />
        )
      })}

      {/* Outer circle border */}
      <circle cx={CX} cy={CY} r={R} fill="none" stroke={STROKE_DARK} strokeWidth={2.5} />

      {/* Score labels */}
      {SECTIONS.map(({ score, start, end }) => {
        const [lx, ly] = labelPos(CX, CY, R, start, end)
        return (
          <text
            key={`label-${score}`}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={14}
            fontWeight={700}
            fill={TEXT_DARK}
            fontFamily="system-ui, sans-serif"
          >
            {score}
          </text>
        )
      })}
    </svg>
  )
}

// ── Default export — static illustration for the question stem ─────────────────
export default function Dartboard16A18Illustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Papan dart dengan delapan bagian bernilai 11, 19, 23, 26, 38, 39, 41, dan 44. Pertanyaan: berapa lemparan minimum untuk mendapatkan skor 100?"
    >
      <DartboardSVG />
    </div>
  )
}
