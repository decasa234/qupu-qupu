// TIMO-22-P4H-Q20 — "How many rectangles with '*' are there in the figure below?"
//
// L-shaped grid: 3 cols × 4 rows, top-left 1×2 block absent.
//   Row 1:    [    ][col2][col3]
//   Row 2:    [    ][col2][col3]
//   Row 3:  [col1][ * ][col3]
//   Row 4:  [col1][col2][col3]
//
// * is at (row 3, col 2). Rectangles containing * = 8 (top in rows 1-2) + 8 (top at row 3) = 16.
//
// Pure SVG — no hooks, no framer-motion. SSR-safe.

export const CELL = 60
export const PAD  = 14

// Vertical grid lines
export const V0 = PAD                   // 14  — left edge of col 1
export const V1 = PAD + CELL            // 74  — between col 1 / col 2
export const V2 = PAD + 2 * CELL        // 134 — between col 2 / col 3
export const V3 = PAD + 3 * CELL        // 194 — right edge of col 3

// Horizontal grid lines
export const H0 = PAD                   // 14  — top of row 1
export const H1 = PAD + CELL            // 74  — between row 1 / row 2
export const H2 = PAD + 2 * CELL        // 134 — between row 2 / row 3
export const H3 = PAD + 3 * CELL        // 194 — between row 3 / row 4
export const H4 = PAD + 4 * CELL        // 254 — bottom of row 4

export const SVG_W = V3 + PAD           // 208
export const SVG_H = H4 + PAD           // 268

export const STROKE  = '#374151'
export const FILL_BG = '#FFFFFF'

// Centre of * cell (row 3, col 2)
export const STAR_X = (V1 + V2) / 2    // 104
export const STAR_Y = (H2 + H3) / 2    // 164

export default function StarGridTIMO22P4Q20Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Kisi berbentuk L: 3 kolom × 4 baris, sudut kiri atas 1×2 tidak ada. Tanda * di baris 3, kolom 2. Hitung persegi panjang yang mengandung *."
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(240, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={FILL_BG} />

        {/* ── horizontal lines ── */}
        {/* H0: top of rows 1–2 (only cols 2–3) */}
        <line x1={V1} y1={H0} x2={V3} y2={H0} stroke={STROKE} strokeWidth={1.5} />
        {/* H1: between row 1 and row 2 (cols 2–3) */}
        <line x1={V1} y1={H1} x2={V3} y2={H1} stroke={STROKE} strokeWidth={1.5} />
        {/* H2: between row 2 and row 3 (full width) */}
        <line x1={V0} y1={H2} x2={V3} y2={H2} stroke={STROKE} strokeWidth={1.5} />
        {/* H3: between row 3 and row 4 (full width) */}
        <line x1={V0} y1={H3} x2={V3} y2={H3} stroke={STROKE} strokeWidth={1.5} />
        {/* H4: bottom of row 4 (full width) */}
        <line x1={V0} y1={H4} x2={V3} y2={H4} stroke={STROKE} strokeWidth={1.5} />

        {/* ── vertical lines ── */}
        {/* V0: left edge of col 1 (only rows 3–4) */}
        <line x1={V0} y1={H2} x2={V0} y2={H4} stroke={STROKE} strokeWidth={1.5} />
        {/* V1: left edge of col 2 top-section / col-1|col-2 border bottom-section */}
        <line x1={V1} y1={H0} x2={V1} y2={H4} stroke={STROKE} strokeWidth={1.5} />
        {/* V2: between col 2 and col 3 (full height) */}
        <line x1={V2} y1={H0} x2={V2} y2={H4} stroke={STROKE} strokeWidth={1.5} />
        {/* V3: right edge of col 3 (full height) */}
        <line x1={V3} y1={H0} x2={V3} y2={H4} stroke={STROKE} strokeWidth={1.5} />

        {/* ── star marker ── */}
        <text
          x={STAR_X}
          y={STAR_Y + 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={26}
          fontWeight="bold"
          fill="#DC2626"
        >
          *
        </text>
      </svg>
    </div>
  )
}
