// HKIMO-25-P2H-Q10 — Column addition cryptarithmetic
//
//     A  B
//   + A  B
//   ------
//   1  A  2
//
// A and B are different 1-digit numbers. Show the addition without
// revealing A=9, B=6 (the stem never shows the answer).
// No hooks, no Date, no Math.random — SSR-safe.

// ─── Layout constants ────────────────────────────────────────────────────────

export const SVG_W   = 200
export const SVG_H   = 155

/** x-centre of each digit column (hundreds / tens / units). */
export const COL_H   = 60   // hundreds (only appears in result)
export const COL_T   = 110  // tens  — A
export const COL_U   = 160  // units — B

/** y-baseline for each row. */
export const ROW1_Y  = 46   // first addend
export const ROW2_Y  = 86   // second addend
export const LINE_Y  = 100  // separator
export const RES_Y   = 135  // result

/** x of plus sign. */
export const PLUS_X  = 22

// ─── Colours ─────────────────────────────────────────────────────────────────

/** Digit colour — known literals (1, 2, +). */
export const C_KNOWN   = '#1F2937'  // gray-800
/** Digit colour — unknown letter variables (A, B). */
export const C_LETTER  = '#B45309'  // amber-700
/** Separator line. */
export const C_LINE    = '#374151'  // gray-700

// ─── Component ───────────────────────────────────────────────────────────────

export default function ColumnAddHK25P2Q10Illustration() {
  const fs  = 28   // font size
  const fw  = 'bold'
  const ff  = 'monospace'
  const ta  = 'middle' as const

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      style={{ width: '100%', maxWidth: SVG_W }}
      aria-label="Column addition: A B plus A B equals 1 A 2"
    >
      {/* ── Row 1: A B ──────────────────────────────────────────────── */}
      <text x={COL_T} y={ROW1_Y} textAnchor={ta} fontSize={fs} fontFamily={ff} fontWeight={fw} fill={C_LETTER}>A</text>
      <text x={COL_U} y={ROW1_Y} textAnchor={ta} fontSize={fs} fontFamily={ff} fontWeight={fw} fill={C_LETTER}>B</text>

      {/* ── Plus sign ───────────────────────────────────────────────── */}
      <text x={PLUS_X} y={ROW2_Y} textAnchor="middle" fontSize={fs} fontFamily={ff} fontWeight={fw} fill={C_KNOWN}>+</text>

      {/* ── Row 2: A B ──────────────────────────────────────────────── */}
      <text x={COL_T} y={ROW2_Y} textAnchor={ta} fontSize={fs} fontFamily={ff} fontWeight={fw} fill={C_LETTER}>A</text>
      <text x={COL_U} y={ROW2_Y} textAnchor={ta} fontSize={fs} fontFamily={ff} fontWeight={fw} fill={C_LETTER}>B</text>

      {/* ── Separator line ──────────────────────────────────────────── */}
      <line x1={14} y1={LINE_Y} x2={SVG_W - 14} y2={LINE_Y} stroke={C_LINE} strokeWidth={2} />

      {/* ── Result: 1 A 2 ───────────────────────────────────────────── */}
      <text x={COL_H} y={RES_Y} textAnchor={ta} fontSize={fs} fontFamily={ff} fontWeight={fw} fill={C_KNOWN}>1</text>
      <text x={COL_T} y={RES_Y} textAnchor={ta} fontSize={fs} fontFamily={ff} fontWeight={fw} fill={C_LETTER}>A</text>
      <text x={COL_U} y={RES_Y} textAnchor={ta} fontSize={fs} fontFamily={ff} fontWeight={fw} fill={C_KNOWN}>2</text>
    </svg>
  )
}
