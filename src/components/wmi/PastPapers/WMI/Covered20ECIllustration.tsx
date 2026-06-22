// IKMC-20-EC-Q20 — "covered numbers" board.
//
// Recovered from docs/reference/ocr-res/ikmc/contest/ecolier/2020.imgs/048.jpg:
// A wide blackboard frame holds 8 shapes (one per number 1–8).
// The numbers are hidden under the shapes.
// Layout mirrors the exam scan (scattered, not a rigid grid):
//
//   col:  L     M     R
// row 0: TRI   TRI   SQU
// row 1: SQU   TRI   SQU
// row 2: CIR         TRI
//
// (4 triangles, 3 squares, 1 circle — consistent with the problem statement.)
// The STATIC illustration never reveals which number is under which shape.
//
// Co-exports `BoardPrimitive` so the explainer can re-render the same board
// and animate the arithmetic overlay.

// ── shared layout & colour ──────────────────────────────────────────────────

export const SVG_W = 360
export const SVG_H = 220

// Board outer frame
export const BOARD = { x: 8, y: 8, w: 344, h: 180, rx: 6 } as const

// Chalk ledge at bottom
export const LEDGE = { x: 8, y: BOARD.y + BOARD.h, w: 344, h: 14, rx: 3 } as const

export const COLOR = {
  BOARD_BG: '#2E5740',      // dark green board
  BOARD_FRAME: '#8B5E3C',   // wooden frame
  LEDGE: '#A0714F',
  TRI_FILL: '#DC4E1A',      // orange-red triangle
  TRI_STROKE: '#A83010',
  SQU_FILL: '#E8B800',      // yellow square
  SQU_STROKE: '#A88000',
  CIR_FILL: '#1A1A1A',      // black circle
  CIR_STROKE: '#000000',
} as const

// Shape positions (cx, cy) in viewBox units — scattered to match the scan
export const SHAPES: ReadonlyArray<{ type: 'tri' | 'squ' | 'cir'; cx: number; cy: number }> = [
  { type: 'tri', cx: 68,  cy: 62 },   // row 0, col L
  { type: 'tri', cx: 162, cy: 54 },   // row 0, col M
  { type: 'squ', cx: 262, cy: 58 },   // row 0, col R
  { type: 'squ', cx: 56,  cy: 118 },  // row 1, col L
  { type: 'tri', cx: 158, cy: 118 },  // row 1, col M
  { type: 'squ', cx: 258, cy: 118 },  // row 1, col R
  { type: 'cir', cx: 80,  cy: 162 },  // row 2, col L
  { type: 'tri', cx: 280, cy: 160 },  // row 2, col R
]

const TRI_SIZE = 30   // half-base
const SQU_HALF = 24   // half-side
const CIR_R    = 22

function ShapeTriangle({ cx, cy }: { cx: number; cy: number }) {
  const h = (TRI_SIZE * Math.sqrt(3)) / 2
  const pts = [
    `${cx},${cy - h * 0.68}`,
    `${cx - TRI_SIZE},${cy + h * 0.32}`,
    `${cx + TRI_SIZE},${cy + h * 0.32}`,
  ].join(' ')
  return (
    <polygon
      points={pts}
      fill={COLOR.TRI_FILL}
      stroke={COLOR.TRI_STROKE}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  )
}

function ShapeSquare({ cx, cy }: { cx: number; cy: number }) {
  return (
    <rect
      x={cx - SQU_HALF}
      y={cy - SQU_HALF}
      width={SQU_HALF * 2}
      height={SQU_HALF * 2}
      fill={COLOR.SQU_FILL}
      stroke={COLOR.SQU_STROKE}
      strokeWidth={2}
      rx={2}
    />
  )
}

function ShapeCircle({ cx, cy }: { cx: number; cy: number }) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={CIR_R}
      fill={COLOR.CIR_FILL}
      stroke={COLOR.CIR_STROKE}
      strokeWidth={2}
    />
  )
}

// ── reusable primitive ──────────────────────────────────────────────────────

/**
 * The board with all 8 shapes placed on it.
 * `revealCircle` (optional): when true the black circle is replaced with
 * the answer number "6" so the explainer can show the reveal beat.
 */
export function BoardPrimitive({ revealCircle = false }: { revealCircle?: boolean }) {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: SVG_W }}
      aria-hidden="true"
    >
      {/* wooden frame */}
      <rect
        x={BOARD.x - 6}
        y={BOARD.y - 6}
        width={BOARD.w + 12}
        height={BOARD.h + 12}
        rx={BOARD.rx + 4}
        fill={COLOR.BOARD_FRAME}
      />
      {/* green board surface */}
      <rect
        x={BOARD.x}
        y={BOARD.y}
        width={BOARD.w}
        height={BOARD.h}
        rx={BOARD.rx}
        fill={COLOR.BOARD_BG}
      />
      {/* chalk ledge */}
      <rect
        x={LEDGE.x}
        y={LEDGE.y}
        width={LEDGE.w}
        height={LEDGE.h}
        rx={LEDGE.rx}
        fill={COLOR.LEDGE}
      />

      {/* shapes */}
      {SHAPES.map((s, i) => {
        if (s.type === 'tri') return <ShapeTriangle key={i} cx={s.cx} cy={s.cy} />
        if (s.type === 'squ') return <ShapeSquare key={i} cx={s.cx} cy={s.cy} />
        // circle
        if (revealCircle) {
          // show "6" where the circle was
          return (
            <g key={i}>
              <circle
                cx={s.cx}
                cy={s.cy}
                r={CIR_R}
                fill="#FFFFFF"
                stroke="#10B981"
                strokeWidth={3}
              />
              <text
                x={s.cx}
                y={s.cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={22}
                fontWeight={900}
                fill="#065F46"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                6
              </text>
            </g>
          )
        }
        return <ShapeCircle key={i} cx={s.cx} cy={s.cy} />
      })}
    </svg>
  )
}

// ── stem illustration (default export) ─────────────────────────────────────

export default function Covered20ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Papan tulis dengan delapan angka 1 sampai 8 yang masing-masing ditutupi oleh satu bentuk: empat segitiga merah, tiga persegi kuning, dan satu lingkaran hitam."
    >
      <BoardPrimitive />
    </div>
  )
}
