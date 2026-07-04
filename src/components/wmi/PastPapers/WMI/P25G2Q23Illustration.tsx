// Two-letters shape-count figure for WMI-25P2A-Q23 (2025 WMI Semifinal Grade 2 Paper A).
//
// Redrawn (NOT the jpg) from db/seed/wmi/figures/2025-semifinal-g2-a-q23.jpg.
// The source figure shows the letter A built on a side-6 triangular grid with a
// triangular hole in the middle and an open gap between the two legs. Counting
// the shaded unit triangles row by row (verified by sampling the jpg):
//   row1=1, row2=3, row3=4, row4=4, row5=9, row6=4  ->  A_TRIANGLES = 25.
//
// The letter I (built from unit squares) was cropped out of the seed image, so
// it is drawn here as a clean serif I — a top bar of 5 squares, a stem of 8, and
// a bottom bar of 5  ->  I_SQUARES = 18.
//
//   difference = 25 - 18 = 7  ->  option B.
//
// The STATIC figure shows ONLY the two letters (the problem), never the answer.

// ── Letter A: triangular grid (side 6) ────────────────────────────────────
// cell map per row, true = shaded unit triangle, false = empty.
// Each row r (1..6) has 2r-1 cells; even index = upward △, odd index = downward ▽.
export const A_ROWS: boolean[][] = [
  [true], // row 1: 1
  [true, true, true], // row 2: 3
  [true, true, false, true, true], // row 3: 4 (hole apex white)
  [true, true, false, false, false, true, true], // row 4: 4 (hole base white)
  [true, true, true, true, true, true, true, true, true], // row 5: 9 (crossbar)
  [true, true, false, false, false, false, false, false, false, true, true], // row 6: 4 (legs at the outer edges of the 11-cell row)
]
export const A_TRIANGLES = A_ROWS.reduce((s, row) => s + row.filter(Boolean).length, 0) // 25

// ── Letter I: serif I built from unit squares ──────────────────────────────
export const I_TOP = 5
export const I_STEM = 8
export const I_BOTTOM = 5
export const I_SQUARES = I_TOP + I_STEM + I_BOTTOM // 18

export const SHAPE_DIFFERENCE = Math.abs(A_TRIANGLES - I_SQUARES) // 7

const TRI_FILL = '#CDE9D6'
const TRI_LINE = '#374151'
const SQ_FILL = '#CDE2F3'
const SQ_LINE = '#374151'

// triangular-grid geometry
const TS = 26 // side of a unit triangle
const TH = TS * 0.8660254 // height of a unit triangle (√3/2)

/** Vertices of a unit triangle at grid (row r 0-based, cell index c). */
function triPoints(r: number, c: number, originX: number, originY: number): string {
  const up = c % 2 === 0
  const half = Math.floor(c / 2) // number of upward triangles to the left within row
  // leftmost vertex x of row r: centred — row r spans (r+1) units of width? Use apex-centred layout.
  // Row top y:
  const yTop = originY + r * TH
  const yBot = yTop + TH
  // The row of 2r+1 cells (0-based r) spans from xStart; each upward tri base = TS.
  const rowUnits = r + 1 // upward triangles in row r (0-based)
  const xStart = originX - (rowUnits * TS) / 2
  if (up) {
    const xl = xStart + half * TS
    return `${xl},${yBot} ${xl + TS},${yBot} ${xl + TS / 2},${yTop}`
  }
  // downward triangle sits between upward ones
  const xl = xStart + half * TS + TS / 2
  return `${xl},${yTop} ${xl + TS},${yTop} ${xl + TS / 2},${yBot}`
}

export interface LetterAProps {
  /** Number of shaded triangles revealed (in reading order, top->bottom, left->right). 0 = none, A_TRIANGLES = all. */
  revealed?: number
  originX?: number
  originY?: number
}

/** The letter A as a tiling of unit triangles (reusable primitive). */
export function LetterATriangles({ revealed = A_TRIANGLES, originX = 0, originY = 0 }: LetterAProps) {
  const cells: Array<{ r: number; c: number; idx: number }> = []
  let idx = 0
  A_ROWS.forEach((row, r) =>
    row.forEach((on, c) => {
      if (on) {
        cells.push({ r, c, idx })
        idx += 1
      }
    }),
  )
  return (
    <g>
      {cells.map(({ r, c, idx: i }) => (
        <polygon
          key={`a${r}-${c}`}
          points={triPoints(r, c, originX, originY)}
          fill={i < revealed ? TRI_FILL : '#FFFFFF'}
          stroke={TRI_LINE}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      ))}
    </g>
  )
}

const SQ = 22 // unit square side

export interface LetterIProps {
  /** Number of shaded squares revealed (top bar, then stem top->bottom, then bottom bar). */
  revealed?: number
  originX?: number
  originY?: number
}

/** Build the (col,row) grid of the serif I in reading order. */
export function letterICells(): Array<{ col: number; row: number }> {
  const cells: Array<{ col: number; row: number }> = []
  const barWidth = I_TOP // 5 wide
  const stemCol = Math.floor(barWidth / 2) // centre column = 2
  // top bar: row 0
  for (let col = 0; col < barWidth; col++) cells.push({ col, row: 0 })
  // stem: rows 1..I_STEM
  for (let row = 1; row <= I_STEM; row++) cells.push({ col: stemCol, row })
  // bottom bar: row I_STEM+1
  for (let col = 0; col < barWidth; col++) cells.push({ col, row: I_STEM + 1 })
  return cells
}

/** The letter I as a tiling of unit squares (reusable primitive). */
export function LetterISquares({ revealed = I_SQUARES, originX = 0, originY = 0 }: LetterIProps) {
  const cells = letterICells()
  return (
    <g>
      {cells.map(({ col, row }, i) => (
        <rect
          key={`i${i}`}
          x={originX + col * SQ}
          y={originY + row * SQ}
          width={SQ}
          height={SQ}
          fill={i < revealed ? SQ_FILL : '#FFFFFF'}
          stroke={SQ_LINE}
          strokeWidth={1.6}
        />
      ))}
    </g>
  )
}

const VIEW_W = 420
const VIEW_H = 260

export interface TwoLettersProps {
  /** Triangles shaded in A (0..25). */
  aRevealed?: number
  /** Squares shaded in I (0..18). */
  iRevealed?: number
  /** Optional count badges under each letter. */
  showCounts?: boolean
}

export function TwoLettersDiagram({ aRevealed = A_TRIANGLES, iRevealed = I_SQUARES, showCounts = false }: TwoLettersProps) {
  // A centred around x=120, I around x=320
  const aOriginX = 120
  const aOriginY = 30
  const iOriginX = 300
  const iOriginY = 36
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 420, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <LetterATriangles revealed={aRevealed} originX={aOriginX} originY={aOriginY} />
      <LetterISquares revealed={iRevealed} originX={iOriginX} originY={iOriginY} />

      {showCounts && (
        <g>
          <g>
            <rect x={aOriginX - 34} y={222} width={68} height={26} rx={8} fill="#ECFDF5" stroke="#10B981" strokeWidth={1.6} />
            <text x={aOriginX} y={235} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={900} fill="#065F46">
              {`A = ${aRevealed}`}
            </text>
          </g>
          <g>
            <rect x={iOriginX + 22 - 34} y={222} width={68} height={26} rx={8} fill="#EFF6FF" stroke="#2563EB" strokeWidth={1.6} />
            <text x={iOriginX + 22} y={235} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={900} fill="#1E3A8A">
              {`I = ${iRevealed}`}
            </text>
          </g>
        </g>
      )}
    </svg>
  )
}

export default function P25G2Q23Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="The letter A built from small triangles next to the letter I built from small squares. How many more shapes are in one letter than the other?"
    >
      <TwoLettersDiagram />
    </div>
  )
}
