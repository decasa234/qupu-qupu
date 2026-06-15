// In-card illustration for WMI-21P2A-Q22 (2021 Semifinal Grade-2, multiplication cross-grid).
// Reconstructed faithfully from db/seed/wmi/figures/2021-semifinal-g2-a-q22.jpg.
//
// Scan layout (a plus/cross of bordered cells, on a 5-col × 5-row coordinate grid).
// The FOUR unknown boxes sit at the corners of a 2×2 sub-grid (TL/TR/BL/BR):
//
//   row 0:  [TL box] [×] [TR box] [=] [18]
//   row 1:  [×]      [gray center] [×]
//   row 2:  [BL box] [×] [BR box] [=] [8]
//   row 3:  [=]                    [=]
//   row 4:  [24]                   [6]
//
// Constraint rule (each box is a positive whole number):
//   top row:    TL × TR = 18
//   bottom row: BL × BR = 8
//   left col:   TL × BL = 24
//   right col:  TR × BR = 6
//
// Solution: TL must divide both 18 and 24 → TL = 3; TR = 18÷3 = 6;
//   BL = 24÷3 = 8; BR = 6÷6 = 1 (also 8×1 = 8 ✓).
//   Largest possible sum = 3 + 6 + 8 + 1 = 18 → answer B.
//
// The STATIC figure shows ONLY the problem: empty boxes, the × and = operators,
// and the given products 18, 8, 24, 6 — never the solved box values.
//
// Data exported so the explainer can bind to the same values without drift.

const INK = '#1F2937'
// Shaded centre block of the cross (matches the gray pad in the scan).
const SHADE = '#9CA3AF'
// Highlight ring colour for the focused box during the explainer walk.
const HIGHLIGHT = '#2f6df0'

// Given products.
export const PRODUCT_TOP = 18 // TL × TR
export const PRODUCT_BOTTOM = 8 // BL × BR
export const PRODUCT_LEFT = 24 // TL × BL
export const PRODUCT_RIGHT = 6 // TR × BR

// Solution box values.
export const SOLUTION = { TL: 3, TR: 6, BL: 8, BR: 1 } as const
export const SOLUTION_SUM = SOLUTION.TL + SOLUTION.TR + SOLUTION.BL + SOLUTION.BR // 18

export type BoxKey = 'TL' | 'TR' | 'BL' | 'BR'

const CELL = 52
const PAD = 14

// Coordinate grid: 5 columns (0..4) × 5 rows (0..4).
const COLS = 5
const ROWS = 5

// Pixel helpers for a cell at (row r, col c).
const cx = (c: number) => PAD + c * CELL + CELL / 2
const cy = (r: number) => PAD + r * CELL + CELL / 2
const rx = (c: number) => PAD + c * CELL
const ry = (r: number) => PAD + r * CELL

// Where each unknown box lives in the coordinate grid.
const BOX_POS: Record<BoxKey, { r: number; c: number }> = {
  TL: { r: 0, c: 0 },
  TR: { r: 0, c: 2 },
  BL: { r: 2, c: 0 },
  BR: { r: 2, c: 2 },
}

// A glyph cell that is part of the cross but is NOT an unknown box: operators,
// equals signs, and the given product numbers.
type GlyphCell = { r: number; c: number; text: string; boxed: boolean }

const GLYPHS: GlyphCell[] = [
  // top row: × between the two top boxes, then = 18
  { r: 0, c: 1, text: '×', boxed: false },
  { r: 0, c: 3, text: '=', boxed: false },
  { r: 0, c: 4, text: String(PRODUCT_TOP), boxed: true },
  // middle row: the two × under the top boxes (left col and right col operators)
  { r: 1, c: 0, text: '×', boxed: false },
  { r: 1, c: 2, text: '×', boxed: false },
  // bottom equation row: × between the two bottom boxes, then = 8
  { r: 2, c: 1, text: '×', boxed: false },
  { r: 2, c: 3, text: '=', boxed: false },
  { r: 2, c: 4, text: String(PRODUCT_BOTTOM), boxed: true },
  // column-equals row: = under each left/right column
  { r: 3, c: 0, text: '=', boxed: false },
  { r: 3, c: 2, text: '=', boxed: false },
  // given column products
  { r: 4, c: 0, text: String(PRODUCT_LEFT), boxed: true },
  { r: 4, c: 2, text: String(PRODUCT_RIGHT), boxed: true },
]

export interface CrossGridQ22Props {
  /** Optional values to fill into the unknown boxes (only those provided are shown). */
  values?: Partial<Record<BoxKey, number>>
  /** Optional box to ring-highlight (the box currently being reasoned about). */
  highlight?: BoxKey | null
  /** Optional sum to show beneath the grid, e.g. "3 + 6 + 8 + 1 = 18". */
  showSum?: string | null
}

/**
 * The shared cross-grid primitive. Draws the empty-box problem by default; pass
 * `values` to fill solved boxes, `highlight` to ring one, `showSum` to caption a
 * total beneath it. Never reveals a value that is not explicitly supplied.
 */
export function CrossGridQ22({ values, highlight = null, showSum = null }: CrossGridQ22Props) {
  const width = PAD * 2 + COLS * CELL
  // Reserve a little extra height when a sum line is shown.
  const baseHeight = PAD * 2 + ROWS * CELL
  const height = showSum ? baseHeight + 36 : baseHeight

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxWidth: 300, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* shaded centre block of the cross (row 1, col 1) */}
      <rect
        x={rx(1)}
        y={ry(1)}
        width={CELL}
        height={CELL}
        fill={SHADE}
        stroke={INK}
        strokeWidth={2}
      />

      {/* the four unknown boxes */}
      {(Object.keys(BOX_POS) as BoxKey[]).map((key) => {
        const { r, c } = BOX_POS[key]
        const val = values?.[key]
        const isHi = highlight === key
        return (
          <g key={key}>
            <rect
              x={rx(c)}
              y={ry(r)}
              width={CELL}
              height={CELL}
              fill="white"
              stroke={isHi ? HIGHLIGHT : INK}
              strokeWidth={isHi ? 4 : 2}
            />
            {val != null && (
              <text
                x={cx(c)}
                y={cy(r)}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={24}
                fontWeight={800}
                fill={isHi ? HIGHLIGHT : INK}
                className="font-display"
              >
                {val}
              </text>
            )}
          </g>
        )
      })}

      {/* operators, equals, and given products */}
      {GLYPHS.map((g) => (
        <g key={`g${g.r}-${g.c}`}>
          {g.boxed && (
            <rect
              x={rx(g.c)}
              y={ry(g.r)}
              width={CELL}
              height={CELL}
              fill="white"
              stroke={INK}
              strokeWidth={2}
            />
          )}
          <text
            x={cx(g.c)}
            y={cy(g.r)}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={g.boxed ? 24 : 22}
            fontWeight={g.boxed ? 800 : 700}
            fill={INK}
            className="font-display"
          >
            {g.text}
          </text>
        </g>
      ))}

      {/* optional sum line beneath the grid */}
      {showSum && (
        <text
          x={width / 2}
          y={baseHeight + 18}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={20}
          fontWeight={900}
          fill={HIGHLIGHT}
          className="font-display"
        >
          {showSum}
        </text>
      )}
    </svg>
  )
}

export default function P21G2Q22Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Susunan kotak berbentuk plus. Empat kotak kosong di sudut sebuah sub-kisi 2×2. Baris atas: kotak × kotak = 18. Baris bawah: kotak × kotak = 8. Kolom kiri: kotak × kotak = 24. Kolom kanan: kotak × kotak = 6. Cari jumlah terbesar dari keempat kotak."
    >
      <CrossGridQ22 />
    </div>
  )
}
