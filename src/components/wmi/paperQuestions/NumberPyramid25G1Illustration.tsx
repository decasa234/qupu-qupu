// Number pyramid for WMI-25F1A-Q25 (2025 Grade 1 Final).
//
// Recovered from db/seed/wmi/figures/2025-final-g1-a-q25.jpg: a triangular
// pyramid of 7 rows, where row k holds k squares each containing a single digit.
// You start at the top square and walk DOWN: each step lands on one of the two
// squares directly below (lower-left = same col, lower-right = col + 1). The
// unique path whose 7 squares are all DIFFERENT numbers reaches a bottom square.
//
// Pyramid as scanned (row 1 = top):
//   row 1: 5
//   row 2: 6 1
//   row 3: 2 5 4
//   row 4: 7 4 3 2
//   row 5: 5 6 2 6 4
//   row 6: 1 3 7 1 5 6
//   row 7: 3 2 4 6 7 1 5
//
// SOLVER-CONFIRMED (throwaway search over all 64 top->bottom paths): there is
// exactly ONE all-different path — 5 -> 1 -> 4 -> 3 -> 2 -> 7 -> 6 — landing on
// the bottom square holding 6. Cells (row,col, both 0-indexed):
//   [0,0] [1,1] [2,2] [3,2] [4,2] [5,2] [6,3].
//
// This file draws ONLY the bare pyramid (no path, no highlight, no answer). The
// co-exported primitive `NumberPyramid25G1` accepts an optional `litPath` so the
// animator can trace the all-different path AFTER the learner answers.

/** The pyramid numbers, row by row (row 0 = top). */
export const PYRAMID: number[][] = [
  [5],
  [6, 1],
  [2, 5, 4],
  [7, 4, 3, 2],
  [5, 6, 2, 6, 4],
  [1, 3, 7, 1, 5, 6],
  [3, 2, 4, 6, 7, 1, 5],
]

/** The unique all-different path, as [row, col] cells (row 0 = top). */
export const ALL_DIFFERENT_PATH: number[][] = [
  [0, 0],
  [1, 1],
  [2, 2],
  [3, 2],
  [4, 2],
  [5, 2],
  [6, 3],
]

/** Value in the bottom square the all-different path reaches. */
export const BOTTOM_ANSWER = 6

// --- colours (raw hex OK per brief) ------------------------------------------
const INK = '#1F2937' // square outlines + digits
const SQUARE_FILL = '#FFFFFF' // square interior
const PINK = '#E6007E' // scan's marker arrows (top + bottom)
const LIT_FILL = '#FFE08A' // qupu-brand-yellow-ish wash for the lit path
const LIT_STROKE = '#F59E0B' // qupu-brand-orange-ish outline for the lit path

// --- layout ------------------------------------------------------------------
const ROWS = PYRAMID.length // 7
const CELL = 50 // square side
const GAP = 0 // squares butt together, like the scan
const ARROW_H = 22 // headroom above + below for the pink arrows
const PAD = 8

const PITCH = CELL + GAP
const GRID_W = ROWS * PITCH - GAP
const GRID_H = ROWS * PITCH - GAP

const VIEW_W = GRID_W + PAD * 2
const VIEW_H = GRID_H + ARROW_H * 2 + PAD * 2

/** Top-left corner of square (row, col); row 0 = top, centred horizontally. */
function cellOrigin(row: number, col: number) {
  const count = row + 1
  const rowW = count * PITCH - GAP
  const x = (VIEW_W - rowW) / 2 + col * PITCH
  const y = PAD + ARROW_H + row * PITCH
  return { x, y }
}

/** Downward pink arrow glyph, centred on (cx) with its body starting at (top). */
function DownArrow({ cx, top }: { cx: number; top: number }) {
  const w = 9 // half-width of the shaft
  const head = 7 // half-width of the head
  const shaftH = 10
  const headH = 8
  const x0 = cx
  const yTop = top
  const yShaft = top + shaftH
  const yTip = yShaft + headH
  const d = [
    `M ${x0 - w} ${yTop}`,
    `H ${x0 + w}`,
    `V ${yShaft}`,
    `H ${x0 + head}`,
    `L ${x0} ${yTip}`,
    `L ${x0 - head} ${yShaft}`,
    `H ${x0 - w}`,
    'Z',
  ].join(' ')
  return <path d={d} fill={PINK} />
}

export interface NumberPyramid25G1Props {
  /**
   * Optional list of [row, col] cells (row 0 = top) to highlight, e.g. the
   * all-different path. Pass null/undefined for the bare problem figure.
   */
  litPath?: number[][] | null
}

/**
 * Bare primitive. Renders the 7-row digit pyramid plus the scan's pink marker
 * arrows. With `litPath`, tints those cells so the animator can trace a route.
 * Returns an <svg> (no wrapper) so it can be embedded in explainers/animations.
 */
export function NumberPyramid25G1({ litPath = null }: NumberPyramid25G1Props) {
  const lit = new Set((litPath ?? []).map(([r, c]) => `${r}-${c}`))

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width={Math.min(300, VIEW_W)}
      style={{ display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* top marker arrow over the apex square */}
      {(() => {
        const { x } = cellOrigin(0, 0)
        return <DownArrow cx={x + CELL / 2} top={PAD} />
      })()}

      {/* bottom marker arrows under every square in the last row */}
      {PYRAMID[ROWS - 1].map((_, col) => {
        const { x } = cellOrigin(ROWS - 1, col)
        return <DownArrow key={`barrow-${col}`} cx={x + CELL / 2} top={PAD + ARROW_H + GRID_H} />
      })}

      {/* the pyramid squares + digits */}
      {PYRAMID.map((rowVals, row) =>
        rowVals.map((value, col) => {
          const { x, y } = cellOrigin(row, col)
          const isLit = lit.has(`${row}-${col}`)
          return (
            <g key={`${row}-${col}`}>
              <rect
                x={x}
                y={y}
                width={CELL}
                height={CELL}
                fill={isLit ? LIT_FILL : SQUARE_FILL}
                stroke={isLit ? LIT_STROKE : INK}
                strokeWidth={isLit ? 3 : 2}
              />
              <text
                x={x + CELL / 2}
                y={y + CELL / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={24}
                fontWeight={700}
                fill={INK}
              >
                {value}
              </text>
            </g>
          )
        }),
      )}
    </svg>
  )
}

/**
 * WMI-25F1A-Q25 question figure: the bare number pyramid, no path drawn, no
 * answer revealed. Pure render, SSR-safe, deterministic.
 */
export default function NumberPyramid25G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Piramida angka 7 baris: baris 1 berisi 5; baris 2 berisi 6 dan 1; ' +
        'baris 3 berisi 2, 5, 4; baris 4 berisi 7, 4, 3, 2; baris 5 berisi 5, 6, 2, 6, 4; ' +
        'baris 6 berisi 1, 3, 7, 1, 5, 6; baris 7 (paling bawah) berisi 3, 2, 4, 6, 7, 1, 5. ' +
        'Mulai dari kotak teratas, turun ke salah satu dari dua kotak di bawahnya pada setiap ' +
        'langkah; cari jalur yang ke-7 kotaknya berbeda semua dan tentukan angka di kotak ' +
        'bawah yang dicapai.'
      }
    >
      <NumberPyramid25G1 />
    </div>
  )
}
