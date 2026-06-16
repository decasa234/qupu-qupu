// In-card figure for WMI-22P3A-Q21 (2022 WMI Semifinal Grade 3, Paper A, Q21).
//
// Reconstructed from db/seed/wmi/figures/2022-semifinal-g3-a-q21.jpg:
// a 3x3 grid (light pink cells, dark red border). Three cells are given:
//   • a red dot (●) in the top-left,
//   • a bold "8" in the bottom-left (this is the ★ cell the question asks for),
//   • a red diamond (◆) in the bottom-right.
// Outside the grid: the row sums 16 (row 1) and 13 (row 2) on the RIGHT,
// and the column sums 12 (col 1) and 16 (col 2) along the BOTTOM.
//
// Fill 1-9 once each so every labelled row/column matches its total. The unique
// solution is verified by backtracking:  3 9 4 / 1 5 7 / 8 2 6.
// Question: ● + ◆ + ★ = 3 + 6 + 8 = 17 (answer B).  The static figure shows
// ONLY the givens and the sums — never the filled solution.

const FILL = '#F8DAD7'   // light pink cell fill
const BORDER = '#C0322B' // dark red grid border
const MARK = '#E23A2E'   // red dot / diamond
const INK = '#1F2937'

// --- the verified unique solution (used by the explainer, NOT shown statically)
export const Q21_SOLUTION: ReadonlyArray<ReadonlyArray<number>> = [
  [3, 9, 4],
  [1, 5, 7],
  [8, 2, 6],
]
// Labelled line sums (the two we are told). Row index / col index -> sum.
export const ROW_SUMS: Readonly<Record<number, number>> = { 0: 16, 1: 13 }
export const COL_SUMS: Readonly<Record<number, number>> = { 0: 12, 1: 16 }

export const DOT = Q21_SOLUTION[0][0]      // ● = 3 (top-left)
export const DIAMOND = Q21_SOLUTION[2][2]  // ◆ = 6 (bottom-right)
export const STAR = Q21_SOLUTION[2][0]     // ★ = 8 (bottom-left, given as "8")
export const Q21_ANSWER = DOT + DIAMOND + STAR // 17

// --- geometry ----------------------------------------------------------------
const CELL = 64
const PAD_L = 12
const PAD_T = 12
const PAD_R = 44 // room for the right-side row sums
const PAD_B = 40 // room for the bottom column sums

const GRID = CELL * 3
export const Q21_VIEW_W = PAD_L + GRID + PAD_R
export const Q21_VIEW_H = PAD_T + GRID + PAD_B

const OX = PAD_L
const OY = PAD_T

function cx(col: number) {
  return OX + col * CELL + CELL / 2
}
function cy(row: number) {
  return OY + row * CELL + CELL / 2
}

/** A red dot glyph. */
function Dot({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r={13} fill={MARK} />
}
/** A red diamond glyph. */
function Diamond({ x, y }: { x: number; y: number }) {
  const s = 14
  return <polygon points={`${x},${y - s} ${x + s},${y} ${x},${y + s} ${x - s},${y}`} fill={MARK} />
}

export interface SumGridFigureProps {
  /** Cell values to draw (row-major, 3x3). null = blank. */
  filled?: ReadonlyArray<ReadonlyArray<number | null>>
  /** Highlight a labelled total: 'row0' | 'row1' | 'col0' | 'col1'. */
  highlight?: 'row0' | 'row1' | 'col0' | 'col1' | null
}

const BLANK: ReadonlyArray<ReadonlyArray<number | null>> = [
  [null, null, null],
  [null, null, null],
  [null, null, null],
]

export function SumGridFigure({ filled = BLANK, highlight = null }: SumGridFigureProps) {
  return (
    <svg
      viewBox={`0 0 ${Q21_VIEW_W} ${Q21_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 280, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* highlight band for the active line */}
      {highlight === 'row0' && <rect x={OX} y={OY} width={GRID} height={CELL} fill="#FFF3B0" opacity={0.7} />}
      {highlight === 'row1' && <rect x={OX} y={OY + CELL} width={GRID} height={CELL} fill="#FFF3B0" opacity={0.7} />}
      {highlight === 'col0' && <rect x={OX} y={OY} width={CELL} height={GRID} fill="#FFF3B0" opacity={0.7} />}
      {highlight === 'col1' && <rect x={OX + CELL} y={OY} width={CELL} height={GRID} fill="#FFF3B0" opacity={0.7} />}

      {/* cells */}
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => (
          <rect key={`${r}-${c}`} x={OX + c * CELL} y={OY + r * CELL} width={CELL} height={CELL} fill={FILL} stroke={BORDER} strokeWidth={2.4} />
        )),
      )}

      {/* givens: ● top-left, ★(8) bottom-left, ◆ bottom-right — always shown */}
      <Dot x={cx(0)} y={cy(0)} />
      <Diamond x={cx(2)} y={cy(2)} />
      <text x={cx(0)} y={cy(2)} textAnchor="middle" dominantBaseline="central" fontSize={26} fontWeight={900} fill={INK}>
        8
      </text>

      {/* solver-filled values (explainer only): skip the three given cells */}
      {filled.map((row, r) =>
        row.map((v, c) => {
          if (v == null) return null
          if ((r === 0 && c === 0) || (r === 2 && c === 0) || (r === 2 && c === 2)) return null
          return (
            <text key={`f${r}-${c}`} x={cx(c)} y={cy(r)} textAnchor="middle" dominantBaseline="central" fontSize={24} fontWeight={800} fill="#1D4ED8">
              {v}
            </text>
          )
        }),
      )}

      {/* row sums on the right */}
      <text x={OX + GRID + 22} y={cy(0)} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={800} fill={INK}>
        {ROW_SUMS[0]}
      </text>
      <text x={OX + GRID + 22} y={cy(1)} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={800} fill={INK}>
        {ROW_SUMS[1]}
      </text>

      {/* column sums along the bottom */}
      <text x={cx(0)} y={OY + GRID + 22} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={800} fill={INK}>
        {COL_SUMS[0]}
      </text>
      <text x={cx(1)} y={OY + GRID + 22} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={800} fill={INK}>
        {COL_SUMS[1]}
      </text>
    </svg>
  )
}

export default function P22G3Q21Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A 3 by 3 grid. A red dot is in the top-left cell, the number 8 is in the bottom-left cell, a red diamond is in the bottom-right cell. The first two rows total 16 and 13 on the right; the first two columns total 12 and 16 along the bottom. Fill 1 to 9 once each, then find dot plus diamond plus star."
    >
      <SumGridFigure />
    </div>
  )
}
