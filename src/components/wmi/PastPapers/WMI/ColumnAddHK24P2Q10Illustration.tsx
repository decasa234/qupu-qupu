// HKIMO-24-P2H-Q10 — "If A, B represent different 1-digit numbers,
// what is the maximum value of B if AB + BA = 165?"
//
// PROBLEM ONLY: shows the column addition the student sees in the paper.
//   A B
// + B A
// -----
// 1 6 5
//
// Does NOT reveal the answer (B = 9, A = 6) or A + B = 15.
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── layout constants (re-exported for the explainer) ──────────────────────────

export const SVG_W = 200
export const SVG_H = 160

/** X positions for the three digit columns (hundreds, tens, units). */
export const COL_H = 65   // hundreds column x (result only)
export const COL_T = 105  // tens column x
export const COL_U = 145  // units column x

/** Y positions for the three rows. */
export const ROW1_Y = 50   // first addend  (A B)
export const ROW2_Y = 82   // second addend (B A)
export const LINE_Y = 97   // separator line
export const ROW3_Y = 116  // result        (1 6 5)

/** X of the "+" operator. */
export const OP_X = 30

export const COLOR = {
  INK: '#1F2937',
  LINE: '#374151',
  VAR: '#1D4ED8',    // blue for variable letters
  DIGIT: '#1F2937',  // black for known digits
} as const

// ── shared primitive ──────────────────────────────────────────────────────────

/** The column addition grid — used by both Illustration and Explainer. */
export function ColumnAddPrimitive() {
  const font = 'ui-monospace, SFMono-Regular, Menlo, monospace'
  const varStyle = { fill: COLOR.VAR, fontSize: 26, fontWeight: 700, fontStyle: 'italic', fontFamily: font }
  const numStyle = { fill: COLOR.DIGIT, fontSize: 26, fontWeight: 700, fontFamily: font }
  const opStyle = { fill: COLOR.INK, fontSize: 26, fontWeight: 700, fontFamily: font }

  return (
    <g textAnchor="middle" dominantBaseline="auto">
      {/* Row 1: A B */}
      <text x={COL_T} y={ROW1_Y} {...varStyle}>A</text>
      <text x={COL_U} y={ROW1_Y} {...varStyle}>B</text>

      {/* Row 2: + B A */}
      <text x={OP_X} y={ROW2_Y} {...opStyle}>+</text>
      <text x={COL_T} y={ROW2_Y} {...varStyle}>B</text>
      <text x={COL_U} y={ROW2_Y} {...varStyle}>A</text>

      {/* Separator line */}
      <line
        x1={22} y1={LINE_Y}
        x2={SVG_W - 22} y2={LINE_Y}
        stroke={COLOR.LINE}
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      {/* Row 3: 1 6 5 */}
      <text x={COL_H} y={ROW3_Y} {...numStyle}>1</text>
      <text x={COL_T} y={ROW3_Y} {...numStyle}>6</text>
      <text x={COL_U} y={ROW3_Y} {...numStyle}>5</text>
    </g>
  )
}

// ── Illustration component (default export) ───────────────────────────────────

export default function ColumnAddHK24P2Q10Illustration() {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      style={{ display: 'block' }}
      aria-label="Column addition: A B + B A = 1 6 5"
    >
      <ColumnAddPrimitive />
    </svg>
  )
}
