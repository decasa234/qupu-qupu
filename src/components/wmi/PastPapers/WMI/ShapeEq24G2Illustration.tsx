// In-card illustration for WMI-24F2A-Q16 (2024 Grade-2 Final, Q16).
// Reconstructed from db/seed/wmi/figures/2024-final-g2-a-q16.jpg.
//
// Shows the three blank equations exactly as printed:
//   □ + ○ = 7
//   □ × ○ = 12
//   □ − ○ = 2
//
// The figure deliberately contains ONLY the problem setup — empty boxes and
// circles, the operators, and the right-hand side values. It never pre-fills
// any number into the shapes (that is the animator's job post-answer).
//
// Pure render — no Math.random, no Date, no useState/useEffect side-effects.
// SSR-safe and deterministic.

const INK = '#1F2937'

// ── exported data constants — explainer / animator bind to these ─────────────

/** The three equations that appear in WMI-24F2A-Q16, in display order. */
export const SHAPE_EQ_24G2_ROWS: ReadonlyArray<{
  op: string
  rhs: number
}> = [
  { op: '+', rhs: 7 },
  { op: '×', rhs: 12 },
  { op: '−', rhs: 2 },
] as const

/** Numbers 1–7 that the student distributes across the six slots. */
export const SHAPE_EQ_24G2_POOL = [1, 2, 3, 4, 5, 6, 7] as const

/**
 * Both valid solutions for WMI-24F2A-Q16.
 *   A: □=4 ○=3 for ×, □=6 ○=1 for +, □=7 ○=5 for −  → unused = 2
 *   B: □=6 ○=2 for ×, □=4 ○=3 for +, □=7 ○=5 for −  → unused = 1
 */
export const SHAPE_EQ_24G2_SOLUTIONS = [
  { plus: [6, 1], times: [4, 3], minus: [7, 5], unused: 2 },
  { plus: [4, 3], times: [6, 2], minus: [7, 5], unused: 1 },
] as const

// ── primitive SVG component ──────────────────────────────────────────────────

/**
 * Draws the three shape-equations as a clean vertical stack.
 *
 * @param boxValues  Optional map from row index → value to show inside □.
 *                   Pass an empty object (default) to render blank boxes.
 * @param circValues Optional map from row index → value to show inside ○.
 */
export function ShapeEqFigure({
  boxValues = {},
  circValues = {},
}: {
  boxValues?: Partial<Record<number, number>>
  circValues?: Partial<Record<number, number>>
}) {
  // ── layout ─────────────────────────────────────────────────────────────────
  // Three rows, each containing: □  op  ○  =  rhs
  // We use a fixed viewBox wide enough for two-digit RHS numbers.

  const VW = 280
  const ROW_H = 72      // vertical pitch between rows
  const PAD_T = 18      // top padding
  const SYM_R = 22      // radius / half-side for □ and ○

  // Horizontal x-positions for each element (centred on a 280-wide canvas).
  const X_BOX = 48      // centre of □
  const X_OP = 96       // centre of operator
  const X_CIRC = 144    // centre of ○
  const X_EQ = 192      // centre of "="
  const X_RHS = 232     // centre of right-hand side number

  const VH = PAD_T + SHAPE_EQ_24G2_ROWS.length * ROW_H + 8

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: 280, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {SHAPE_EQ_24G2_ROWS.map(({ op, rhs }, i) => {
        const cy = PAD_T + i * ROW_H + ROW_H / 2

        const boxVal = boxValues[i]
        const circVal = circValues[i]

        return (
          <g key={i}>
            {/* □ — square shape */}
            <rect
              x={X_BOX - SYM_R}
              y={cy - SYM_R}
              width={SYM_R * 2}
              height={SYM_R * 2}
              rx={3}
              fill="white"
              stroke={INK}
              strokeWidth={2.5}
            />
            {boxVal != null && (
              <text
                x={X_BOX}
                y={cy + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={18}
                fontWeight={900}
                fill={INK}
              >
                {boxVal}
              </text>
            )}

            {/* operator */}
            <text
              x={X_OP}
              y={cy + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={22}
              fontWeight={700}
              fill={INK}
            >
              {op}
            </text>

            {/* ○ — circle shape */}
            <circle
              cx={X_CIRC}
              cy={cy}
              r={SYM_R}
              fill="white"
              stroke={INK}
              strokeWidth={2.5}
            />
            {circVal != null && (
              <text
                x={X_CIRC}
                y={cy + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={18}
                fontWeight={900}
                fill={INK}
              >
                {circVal}
              </text>
            )}

            {/* "=" */}
            <text
              x={X_EQ}
              y={cy + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={22}
              fontWeight={700}
              fill={INK}
            >
              =
            </text>

            {/* right-hand side number */}
            <text
              x={X_RHS}
              y={cy + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={26}
              fontWeight={900}
              fill={INK}
            >
              {rhs}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── default export: in-card illustration ─────────────────────────────────────

/**
 * In-card illustration for WMI-24F2A-Q16.
 *
 * Displays three blank equations:
 *   □ + ○ = 7
 *   □ × ○ = 12
 *   □ − ○ = 2
 *
 * Never pre-fills any slot — that is the animator's job after the answer is
 * submitted.
 */
export default function ShapeEq24G2Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Tiga persamaan dengan kotak dan lingkaran kosong: kotak tambah lingkaran sama dengan 7; kotak kali lingkaran sama dengan 12; kotak kurang lingkaran sama dengan 2. Isi bilangan 1 sampai 7 tanpa pengulangan."
    >
      <ShapeEqFigure />
    </div>
  )
}
