// OSN-07-SD-KAB-Q13 — persegi panjang ABCD dengan segitiga ECF yang diarsir.
//
// ABCD: lebar AB = 10 cm (AF=6 + FB=4), tinggi DA = 8 cm (DE=4 + EA=4).
// E berada di tengah sisi kiri DA; F di sisi bawah AB dengan AF=6 cm.
// Daerah yang diarsir: segitiga ECF.
//
// PROBLEM ONLY — tidak menampilkan jawaban (32 cm²).
// Pure SVG, SSR-safe, no hooks, no framer-motion.

// ── Shared layout constants (re-exported for the explainer) ──────────────────

/** Total SVG width. */
export const SVG_W = 260

/** Total SVG height. */
export const SVG_H = 218

/** Scale: px per cm. */
export const SCALE = 18

// Rectangle vertices (A bottom-left, B bottom-right, C top-right, D top-left)
export const AX = 40,  AY = 178   // A — kiri bawah
export const BX = 220, BY = 178   // B — kanan bawah  (AX + 10 × SCALE)
export const CX = 220, CY = 34    // C — kanan atas   (AY − 8 × SCALE)
export const DX = 40,  DY = 34    // D — kiri atas

// Special points
export const EX = 40,  EY = 106   // E on DA  (AY − 4 × SCALE = 178 − 72 = 106)
export const FX = 148, FY = 178   // F on AB  (AX + 6 × SCALE = 40 + 108 = 148)

/** Colour tokens. */
export const COL = {
  RECT:  '#1E5FA8',   // blue border
  SHADE: '#FBBCAA',   // salmon fill for shaded region
  TEXT:  '#1F2937',   // vertex labels
  DIM:   '#6B7280',   // dimension numbers
} as const

// ── Default export ─────────────────────────────────────────────────────────────

/**
 * RectTriOSN07KQ13Illustration
 *
 * Static problem figure for OSN-07-SD-KAB-Q13.
 * Shows: rectangle ABCD with E on the left side (DE=EA=4 cm) and F on the
 * bottom (AF=6 cm, FB=4 cm); shaded triangle ECF.
 * Does NOT reveal the answer (32 cm²) or the solution method.
 */
export default function RectTriOSN07KQ13Illustration() {
  // Triangle ECF vertices
  const triPts = `${EX},${EY} ${CX},${CY} ${FX},${FY}`

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Persegi panjang ABCD, panjang AB = 10 cm, tinggi DA = 8 cm. ' +
        'E berada di sisi kiri (DE = EA = 4 cm). ' +
        'F berada di sisi bawah (AF = 6 cm, FB = 4 cm). ' +
        'Daerah yang diarsir adalah segitiga ECF.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(300, SVG_W)}
        style={{ display: 'block' }}
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* Shaded triangle ECF (drawn before border so border overlaps) */}
        <polygon points={triPts} fill={COL.SHADE} stroke="none" />

        {/* Rectangle border */}
        <rect
          x={DX}
          y={DY}
          width={BX - AX}
          height={AY - DY}
          fill="none"
          stroke={COL.RECT}
          strokeWidth={2.5}
        />

        {/* Triangle outline */}
        <polygon
          points={triPts}
          fill="none"
          stroke={COL.RECT}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* ── Vertex labels ─────────────────────────────────────────────── */}
        <text x={DX - 7}  y={DY - 8}  fontSize={13} fontWeight={700} fill={COL.TEXT} textAnchor="end">D</text>
        <text x={CX + 7}  y={CY - 8}  fontSize={13} fontWeight={700} fill={COL.TEXT} textAnchor="start">C</text>
        <text x={AX - 7}  y={AY + 14} fontSize={13} fontWeight={700} fill={COL.TEXT} textAnchor="end">A</text>
        <text x={BX + 7}  y={BY + 14} fontSize={13} fontWeight={700} fill={COL.TEXT} textAnchor="start">B</text>
        <text x={EX - 10} y={EY + 5}  fontSize={13} fontWeight={700} fill={COL.TEXT} textAnchor="end">E</text>
        <text x={FX}      y={FY + 14} fontSize={13} fontWeight={700} fill={COL.TEXT} textAnchor="middle">F</text>

        {/* ── Dimension labels — left side ─────────────────────────────── */}
        {/* DE = 4: midpoint of D(40,34)→E(40,106) */}
        <text
          x={DX - 22}
          y={(DY + EY) / 2 + 4}
          fontSize={11}
          fill={COL.DIM}
          textAnchor="middle"
        >
          4
        </text>
        {/* EA = 4: midpoint of E(40,106)→A(40,178) */}
        <text
          x={EX - 22}
          y={(EY + AY) / 2 + 4}
          fontSize={11}
          fill={COL.DIM}
          textAnchor="middle"
        >
          4
        </text>

        {/* ── Dimension labels — bottom (below vertex labels) ─────────── */}
        {/* AF = 6: midpoint of A(40,178)→F(148,178) */}
        <text
          x={(AX + FX) / 2}
          y={AY + 28}
          fontSize={11}
          fill={COL.DIM}
          textAnchor="middle"
        >
          6
        </text>
        {/* FB = 4: midpoint of F(148,178)→B(220,178) */}
        <text
          x={(FX + BX) / 2}
          y={AY + 28}
          fontSize={11}
          fill={COL.DIM}
          textAnchor="middle"
        >
          4
        </text>
      </svg>
    </div>
  )
}
