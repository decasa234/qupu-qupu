// WMI-25F2A-Q2 (2025 Grade 2 Final)
// "Fill in the boxes with digits 1 to 9. Suppose the six digits in the equation
//  cannot repeat, what is the maximum digit that ★ could be?"
//
// The vertical addition shown in the scan (2025-final-g2-a-q2.jpg):
//
//       [★] 8
//    +  [ ] [ ]
//    ─────────
//         7 3
//
// The top number is a two-digit value whose tens digit is ★ and units digit is 8.
// The second addend is a two-digit number with both digits unknown (blank boxes).
// The sum is 73. All six digits in the equation must be distinct.
//
// The static figure draws ONLY the problem layout (boxes + star + 8 + 73).
// It never reveals the answer (★ = 4, second addend = 25) — that is the
// animator's job after the learner has answered.
//
// Pure render: no Math.random, no Date, SSR-safe and deterministic.

const INK = '#1F2937'
const BOX_FILL = '#FFFFFF'
const BOX_STROKE = '#1F2937'
const STAR_FILL = '#F2994A' // qupu-brand-orange

// ── geometry ────────────────────────────────────────────────────────────────
// The layout is a right-aligned two-row addition with a horizontal rule.
// We position three columns for the digit places (hundreds not present — these
// are two-digit numbers), with a ± glyph column to the left.
//
// Column x-coords (centres of each digit cell, right-to-left: units, tens):
//   units col: xU
//   tens  col: xT
//   plus  col: xP (operator)
//
// Row y-coords (centres):
//   top addend row:    yR1
//   bottom addend row: yR2
//   result row:        yR3
//   rule y:            yLine (between yR2 and yR3)

const CELL = 38          // digit cell size (square)
const GAP = 6            // gap between cells in a row
const PAD_X = 14
const PAD_Y = 14

// column centres (from right):
const xU = PAD_X + 30 + CELL * 2 + GAP   // units column centre
const xT = xU - CELL - GAP                // tens column centre
const xP = xT - CELL - 4                  // + sign centre

const yR1 = PAD_Y + CELL / 2             // top row
const yR2 = yR1 + CELL + GAP             // second row
const yLine = yR2 + CELL / 2 + 8         // rule line y
const yR3 = yLine + 18 + CELL / 2        // result row

const VB_W = xU + CELL / 2 + PAD_X
const VB_H = yR3 + CELL / 2 + PAD_Y

// ── star path helper ─────────────────────────────────────────────────────────
/** 5-pointed star centred at (cx, cy) with outer radius rOut. */
function starPath(cx: number, cy: number, rOut: number): string {
  const rIn = rOut * 0.42
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? rOut : rIn
    const a = (-90 + i * 36) * (Math.PI / 180)
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`)
  }
  return `M${pts.join('L')}Z`
}

// ── sub-components ───────────────────────────────────────────────────────────

/** A blank digit box centred at (cx, cy). */
function DigitBox({ cx, cy }: { cx: number; cy: number }) {
  return (
    <rect
      x={cx - CELL / 2}
      y={cy - CELL / 2}
      width={CELL}
      height={CELL}
      rx={4}
      fill={BOX_FILL}
      stroke={BOX_STROKE}
      strokeWidth={2.4}
    />
  )
}

/** A digit box that shows a drawn star (★) inside instead of a number. */
function StarBox({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <DigitBox cx={cx} cy={cy} />
      <path d={starPath(cx, cy, CELL * 0.32)} fill={STAR_FILL} />
    </g>
  )
}

/** A plain digit label centred at (cx, cy). */
function Digit({ cx, cy, value }: { cx: number; cy: number; value: string }) {
  return (
    <text
      x={cx}
      y={cy}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={26}
      fontWeight={900}
      fill={INK}
      fontFamily="sans-serif"
    >
      {value}
    </text>
  )
}

// ── exported primitive ───────────────────────────────────────────────────────

/**
 * Bare vertical-addition figure.
 *
 * Used by both the static illustration and the post-answer animator.
 * When `revealSecond` is provided (e.g. [2, 5]), the two blank boxes of the
 * second addend show those digits (animator only — the static export never
 * passes this prop).
 */
export function StarAddFigure({ revealSecond }: { revealSecond?: [number, number] | null } = {}) {
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={Math.min(240, VB_W)}
      aria-hidden="true"
      style={{ display: 'block', margin: '0 auto' }}
    >
      {/* ── row 1: [★] 8 ─────────────────────────────────────── */}
      <StarBox cx={xT} cy={yR1} />
      <Digit cx={xU} cy={yR1} value="8" />

      {/* ── row 2: + [□] [□] ─────────────────────────────────── */}
      <text
        x={xP}
        y={yR2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={28}
        fontWeight={700}
        fill={INK}
        fontFamily="sans-serif"
      >
        +
      </text>
      {revealSecond != null ? (
        <>
          <Digit cx={xT} cy={yR2} value={String(revealSecond[0])} />
          <Digit cx={xU} cy={yR2} value={String(revealSecond[1])} />
        </>
      ) : (
        <>
          <DigitBox cx={xT} cy={yR2} />
          <DigitBox cx={xU} cy={yR2} />
        </>
      )}

      {/* ── horizontal rule ──────────────────────────────────── */}
      <line
        x1={xP - CELL / 2 - 4}
        y1={yLine}
        x2={xU + CELL / 2 + 2}
        y2={yLine}
        stroke={INK}
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      {/* ── result: 7 3 ──────────────────────────────────────── */}
      <Digit cx={xT} cy={yR3} value="7" />
      <Digit cx={xU} cy={yR3} value="3" />
    </svg>
  )
}

// ── default export ────────────────────────────────────────────────────────────

/**
 * WMI-25F2A-Q2 in-card illustration.
 *
 * Shows the vertical addition:
 *   [★] 8
 * +  [ ] [ ]
 * ──────────
 *      7  3
 *
 * The star digit is unknown. The second addend's two digits are also unknown.
 * All six digits must be distinct (1-9). The question asks for the maximum
 * value ★ can take. This figure never reveals the answer.
 */
export default function StarAdd25G2Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Penjumlahan bersusun: bilangan dua angka bintang-8 ditambah bilangan dua angka dengan dua kotak kosong, hasilnya 73. Keenam angka harus berbeda. Cari nilai terbesar yang mungkin untuk bintang."
    >
      <StarAddFigure />
    </div>
  )
}
