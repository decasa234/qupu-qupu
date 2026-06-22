// In-card illustration for IKMC-2019-Ecolier-Q8 (arithmetic cross-grid).
// Reconstructed from the PDF scan: a cross/plus-shaped grid where four cells
// are unknown (A, B, C, and the ?), one cell is a structural black junction,
// and the givens are 0, 2, 1, 9.
//
// Cross layout (row, col) on a 7-col × 7-row coordinate grid (CELL=52, PAD=12):
//
//   r0c3: [0]        (given — top of right column)
//         +           (r1c3 operator between r0c3 and r2c3-result chain)
//   r2c0: [2]  +  r2c2:[1]  =  r2c4:[A=□]   (horizontal row: 2+1=A)
//              +              (r3c2 column operator)
//        r3c3: [■_black]     =   (r3c4 junction equals)
//   r4c2: [B=□]  -  r4c4:[C=□]  =  r4c6:[?]  (subtraction row)
//         =           (r5c2 column equals)
//   r6c2: [9]        (given — bottom of left-inner column)
//
// Arithmetic:
//   Row:      2 + 1 = A → A = 3
//   Left col: 1 + B = 9 → B = 8
//   Right col:0 + A = C → C = 0+3 = 3
//   Result:   B − C = 8 − 3 = 5 → answer B
//
// The static illustration shows ONLY the problem: empty boxes for A/B/C/?,
// black square for the junction, given numbers in boxes, operators as text.

const INK = '#1F2937'
const BLUE = '#30598A'
const GREEN = '#10B981'
const SHADE = '#1F2937' // black square fill

const CELL = 52
const PAD = 12

// Coordinate helpers for a 7-col × 7-row grid
const cx = (c: number) => PAD + c * CELL + CELL / 2
const cy = (r: number) => PAD + r * CELL + CELL / 2
const rx = (c: number) => PAD + c * CELL
const ry = (r: number) => PAD + r * CELL

// SVG dimensions: 7 cols + 2 pad-sides; 7 rows + 2 pad-sides
const SVG_W = PAD * 2 + 7 * CELL
const SVG_H = PAD * 2 + 7 * CELL

// ── Exported constants (used by explainer to stay in sync) ──────────────────

export const GIVEN_0 = 0
export const GIVEN_2 = 2
export const GIVEN_1 = 1
export const GIVEN_9 = 9
export const SOL_A = 3  // 2 + 1
export const SOL_B = 8  // 1 + B = 9
export const SOL_C = 3  // 0 + A = 3
export const SOL_Q = 5  // B - C = 8 - 3

// ── Primitive component ─────────────────────────────────────────────────────

export interface CalcGrid8ECFigureProps {
  /** Fill in A=3 at r2c4 */
  showA?: boolean
  /** Fill in B=8 at r4c2 */
  showB?: boolean
  /** Fill in C=3 at r4c4 */
  showC?: boolean
  /** Fill in ?=5 at r4c6 (only on result beat) */
  showQ?: boolean
  /** Ring-highlight one unknown box */
  highlight?: 'A' | 'B' | 'C' | 'Q' | null
  /** Optional equation pill text beneath the SVG */
  equation?: string | null
}

/** Shared cross-grid primitive. Draws the unsolved grid by default. */
export function CalcGrid8ECFigure({
  showA = false,
  showB = false,
  showC = false,
  showQ = false,
  highlight = null,
  equation = null,
}: CalcGrid8ECFigureProps) {
  const extraH = equation ? 36 : 0

  // Helper: draw a bordered box with optional text
  const Box = ({
    r, c, text, isUnknown, hiKey,
  }: {
    r: number
    c: number
    text?: string | null
    isUnknown?: boolean
    hiKey?: 'A' | 'B' | 'C' | 'Q' | null
  }) => {
    const isHi = hiKey != null && highlight === hiKey
    const isResult = hiKey === 'Q'
    const strokeColor = isHi
      ? isResult ? GREEN : BLUE
      : INK
    const fillColor = isHi
      ? isResult ? '#D1FAE5' : '#E1EFFB'
      : 'white'
    const textColor = isHi
      ? isResult ? '#065F46' : BLUE
      : INK
    return (
      <g>
        <rect
          x={rx(c)}
          y={ry(r)}
          width={CELL}
          height={CELL}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={isHi ? 4 : 2}
        />
        {text != null && (
          <text
            x={cx(c)}
            y={cy(r)}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={22}
            fontWeight={800}
            fill={isUnknown ? textColor : INK}
            className="font-display"
          >
            {text}
          </text>
        )}
      </g>
    )
  }

  // Helper: plain operator text (no box)
  const Op = ({ r, c, text }: { r: number; c: number; text: string }) => (
    <text
      x={cx(c)}
      y={cy(r)}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={20}
      fontWeight={700}
      fill={INK}
      className="font-display"
    >
      {text}
    </text>
  )

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H + extraH}`}
      width="100%"
      style={{ maxWidth: 340, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── Top column: given 0, then + operator ── */}
      {/* r0c3: [0] given */}
      <Box r={0} c={3} text={String(GIVEN_0)} />
      {/* r1c3: + operator (between 0 and the horizontal row) */}
      <Op r={1} c={3} text="+" />

      {/* ── Middle horizontal row: [2] + [1] = [A] ── */}
      {/* r2c0: [2] given */}
      <Box r={2} c={0} text={String(GIVEN_2)} />
      {/* r2c1: + */}
      <Op r={2} c={1} text="+" />
      {/* r2c2: [1] given */}
      <Box r={2} c={2} text={String(GIVEN_1)} />
      {/* r2c3: = */}
      <Op r={2} c={3} text="=" />
      {/* r2c4: [A=□] unknown */}
      <Box r={2} c={4} text={showA ? String(SOL_A) : null} isUnknown hiKey="A" />

      {/* ── Junction row: + on col2, black square on col3, = on col4 ── */}
      {/* r3c2: + (column operator between [1] and [B]) */}
      <Op r={3} c={2} text="+" />
      {/* r3c3: black filled square (structural junction) */}
      <rect
        x={rx(3)}
        y={ry(3)}
        width={CELL}
        height={CELL}
        fill={SHADE}
        stroke={INK}
        strokeWidth={2}
      />
      {/* r3c4: = (connects [A] column down toward [C]) */}
      <Op r={3} c={4} text="=" />

      {/* ── Subtraction row: [B] - [C] = [?] ── */}
      {/* r4c2: [B=□] unknown */}
      <Box r={4} c={2} text={showB ? String(SOL_B) : null} isUnknown hiKey="B" />
      {/* r4c3: - */}
      <Op r={4} c={3} text="−" />
      {/* r4c4: [C=□] unknown */}
      <Box r={4} c={4} text={showC ? String(SOL_C) : null} isUnknown hiKey="C" />
      {/* r4c5: = */}
      <Op r={4} c={5} text="=" />
      {/* r4c6: [?] question mark box */}
      <Box r={4} c={6} text={showQ ? String(SOL_Q) : '?'} isUnknown={showQ} hiKey="Q" />

      {/* ── Bottom column: = then given 9 ── */}
      {/* r5c2: = (under [B]) */}
      <Op r={5} c={2} text="=" />
      {/* r6c2: [9] given */}
      <Box r={6} c={2} text={String(GIVEN_9)} />

      {/* ── Optional equation pill ── */}
      {equation && (
        <text
          x={SVG_W / 2}
          y={SVG_H + 18}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={18}
          fontWeight={900}
          fill={highlight === 'Q' ? GREEN : BLUE}
          className="font-display"
        >
          {equation}
        </text>
      )}
    </svg>
  )
}

// ── Default export: static illustration (all unknown boxes blank) ───────────

export default function CalcGrid8ECIllustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Kisi aritmatika berbentuk salib. Baris: 2 + 1 = kotak. Kolom kiri-dalam: 1 + kotak = 9. Kolom kanan: 0 + kotak = kotak. Baris bawah: kotak − kotak = ?. Temukan angka pengganti tanda tanya."
    >
      <CalcGrid8ECFigure />
    </div>
  )
}
