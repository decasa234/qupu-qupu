/**
 * P22G3Q10Illustration — WMI-22P3A-Q10 (2022 Grade 3 Semifinal)
 *
 * "Fold the net below into a cube. Find the minimum possible sum of the numbers
 *  on three faces that share a common vertex."  Answer B = 14.
 *
 * Source figure (db/seed/wmi/figures/2022-semifinal-g3-a-q10.jpg): a cross/T-ish
 * net of 6 numbered squares, light-green fill, dark outline:
 *
 *   (0,0) = 3                          ← top cap above the first middle cell
 *   (1,0)=5  (1,1)=8  (1,2)=3  (1,3)=9 ← middle strip (the four side faces)
 *   (2,0) = 4                          ← bottom cap below the first middle cell
 *
 * The static figure shows ONLY the problem (all six numbers, no faces paired,
 * no answer). The animator imports NetGrid + NET_CELLS to highlight opposite
 * pairs and reveal the minimum corner sum post-answer.
 *
 * Pure render — no Math.random, no Date, no window/document. SSR-safe.
 */

export interface NetCell {
  row: number
  col: number
  value: number
}

// Net laid out exactly as the source image (row increases downward).
export const NET_CELLS: NetCell[] = [
  { row: 0, col: 0, value: 3 }, // top cap
  { row: 1, col: 0, value: 5 },
  { row: 1, col: 1, value: 8 },
  { row: 1, col: 2, value: 3 },
  { row: 1, col: 3, value: 9 },
  { row: 2, col: 0, value: 4 }, // bottom cap
]

/**
 * The three opposite-face pairs once folded.
 *
 * The middle strip 5-8-3-9 wraps the four sides, so in a 4-cell band the 1st is
 * opposite the 3rd and the 2nd is opposite the 4th: 5 ↔ 3 and 8 ↔ 9.
 * The top cap 3 (the (0,0) value) folds opposite the bottom cap 4.
 *
 * Exported so the explainer derives the same pairing it animates.
 */
export const OPP_PAIRS: Array<[number, number]> = [
  [5, 3], // strip ends
  [8, 9], // strip middles
  [3, 4], // caps (top "3" vs bottom "4")
]

/** Min corner sum = take the smaller of each opposite pair: 3 + 8 + 3 = 14. */
export const MIN_CORNER_SUM = OPP_PAIRS.reduce((s, [a, b]) => s + Math.min(a, b), 0)

export const CELL = 54
export const BORDER_W = 1.6

const FILL = '#cdeacb'
const FILL_HI = '#fde68a'
const STROKE = '#3a3a33'
const LABEL = '#2a2a24'

export interface NetGridProps {
  cells?: NetCell[]
  /** "r,c" keys of cells to amber-highlight (used by the animator). */
  highlight?: Set<string>
  /** "r,c" keys of cells to dim (the discarded face of each pair). */
  dimmed?: Set<string>
  cell?: number
}

/** Shared primitive: draws the numbered net on a common grid. */
export function NetGrid({
  cells = NET_CELLS,
  highlight = new Set(),
  dimmed = new Set(),
  cell = CELL,
}: NetGridProps) {
  return (
    <g>
      {cells.map(({ row, col, value }) => {
        const key = `${row},${col}`
        const x = col * cell
        const y = row * cell
        const isHi = highlight.has(key)
        const isDim = dimmed.has(key)
        return (
          <g key={key} opacity={isDim ? 0.4 : 1}>
            <rect
              x={x}
              y={y}
              width={cell}
              height={cell}
              fill={isHi ? FILL_HI : FILL}
              stroke={STROKE}
              strokeWidth={BORDER_W}
            />
            <text
              x={x + cell / 2}
              y={y + cell / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={Math.round(cell * 0.46)}
              fontWeight={700}
              fill={LABEL}
              fontFamily="sans-serif"
            >
              {value}
            </text>
          </g>
        )
      })}
    </g>
  )
}

const PAD = 12
const GRID_COLS = 4
const GRID_ROWS = 3
export const VIEW_W = GRID_COLS * CELL + PAD * 2
export const VIEW_H = GRID_ROWS * CELL + PAD * 2
export const NET_PAD = PAD
const DISPLAY_W = Math.min(280, VIEW_W)

export default function P22G3Q10Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Jaring-jaring kubus dari enam persegi bernomor. Baris tengah: 5, 8, 3, 9. Persegi 3 di atas kotak pertama baris tengah, dan persegi 4 di bawahnya. Lipat menjadi kubus, lalu cari jumlah terkecil dari tiga sisi yang bertemu di satu titik sudut."
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width={DISPLAY_W}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <g transform={`translate(${PAD}, ${PAD})`}>
          <NetGrid />
        </g>
      </svg>
    </div>
  )
}
