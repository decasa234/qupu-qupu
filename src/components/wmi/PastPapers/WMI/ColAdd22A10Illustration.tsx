// SEAMO-22-A-Q10 — "Find 3-digit number ABC such that AA + BB + CC = ABC"
//
// PROBLEM ONLY: shows the column-addition layout exactly as in the paper figure:
//
//        A  A
//        B  B
//   +    C  C
//   ----------
//   A    B  C
//
// Does NOT show the answer (198), the derivation, or the digit values.
// Pure render — no hooks, no random, no Date. SSR-safe & deterministic.

// ── layout constants (exported so explainer can import) ─────────────────────

export const SVG_W = 220
export const SVG_H = 200

/** X centre of the right column (units column). */
export const COL_R = 150
/** X centre of the left column (tens column). */
export const COL_L = 110
/** X of the leftmost column (hundreds column — only used in the result row). */
export const COL_LL = 70

/** Row Y centres for the three addend rows. */
export const ROW_Y = [44, 80, 116] as const

/** Y of the addition rule line. */
export const LINE_Y = 140

/** Y of the result row. */
export const RES_Y = 162

/** Width of the rule line. */
export const LINE_X1 = 42
export const LINE_X2 = SVG_W - 20

/** Colour tokens. */
export const COLOR = {
  INK: '#1F2937',
  PLUS: '#374151',
  LINE: '#374151',
  LETTER: '#1F2937',
} as const

const FONT = 'ui-sans-serif, system-ui, sans-serif'

// ── sub-component ────────────────────────────────────────────────────────────

/** Single bold letter centred at (cx, cy). */
function L({ cx, cy, ch, color = COLOR.LETTER }: { cx: number; cy: number; ch: string; color?: string }) {
  return (
    <text
      x={cx}
      y={cy}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={22}
      fontWeight={800}
      fill={color}
      fontFamily={FONT}
    >
      {ch}
    </text>
  )
}

// ── default export ───────────────────────────────────────────────────────────

/**
 * ColAdd22A10Illustration
 *
 * Static, problem-only figure for SEAMO-22-A-Q10.
 * Shows the column addition layout:  AA + BB + CC = ABC.
 * Does NOT show the answer (198) or any digit values.
 */
export default function ColAdd22A10Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Column addition: A A plus B B plus C C equals A B C. Find the 3-digit number ABC."
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(260, SVG_W)}
        style={{ display: 'block' }}
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* plus sign */}
        <text
          x={46}
          y={ROW_Y[2]}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={22}
          fontWeight={700}
          fill={COLOR.PLUS}
          fontFamily={FONT}
        >
          +
        </text>

        {/* Row 0: A A */}
        <L cx={COL_L} cy={ROW_Y[0]} ch="A" />
        <L cx={COL_R} cy={ROW_Y[0]} ch="A" />

        {/* Row 1: B B */}
        <L cx={COL_L} cy={ROW_Y[1]} ch="B" />
        <L cx={COL_R} cy={ROW_Y[1]} ch="B" />

        {/* Row 2: C C */}
        <L cx={COL_L} cy={ROW_Y[2]} ch="C" />
        <L cx={COL_R} cy={ROW_Y[2]} ch="C" />

        {/* horizontal rule line */}
        <line x1={LINE_X1} y1={LINE_Y} x2={LINE_X2} y2={LINE_Y} stroke={COLOR.LINE} strokeWidth={2} strokeLinecap="round" />

        {/* Result row: A B C */}
        <L cx={COL_LL} cy={RES_Y} ch="A" />
        <L cx={COL_L} cy={RES_Y} ch="B" />
        <L cx={COL_R} cy={RES_Y} ch="C" />
      </svg>
    </div>
  )
}
