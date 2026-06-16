// WMI-21P1A-Q10 (2021 WMI Semifinal Grade 1 Paper A) — "Count. How many more
// black squares are there than white squares?"
//
// Source figure (db/seed/wmi/figures/2021-semifinal-g1-a-q10.jpg): a 5×5
// chequerboard. The top-left corner cell is BLACK and colours alternate, so a
// cell (row, col) (0-indexed from the top-left) is BLACK when (row + col) is
// even. On a 5×5 board that gives 13 black and 12 white cells.
//   black − white = 13 − 12 = 1  → answer B.
//
// The static figure draws ONLY the board (the problem). It never tallies the
// colours or reveals "1". The reusable <Checkerboard> primitive accepts a
// `markColor` so the explainer can spotlight every black (or white) cell, and a
// `pairUp` flag to dim the 12+12 matched cells and leave the lone extra black.
//
// Pure render: no window/document at module top, no Math.random/Date — SSR-safe
// & deterministic.

const BLACK = '#1A1A1A'
const WHITE = '#FFFFFF'
const FRAME = '#1A1A1A'
const MARK = '#F0853A' // amber ring used to spotlight one colour

export const N = 5 // board is 5×5
export const CELL = 44
export const PAD = 18 // headroom so the frame stroke never clips

export const VIEW = N * CELL + PAD * 2 // square viewBox

/** A cell is black when (row + col) is even (top-left corner is black). */
export function isBlack(row: number, col: number): boolean {
  return (row + col) % 2 === 0
}

// Counts derived from the rule (animator-facing; never drawn statically).
export const BLACK_COUNT = (() => {
  let n = 0
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (isBlack(r, c)) n++
  return n
})() // 13
export const WHITE_COUNT = N * N - BLACK_COUNT // 12
export const ANSWER = BLACK_COUNT - WHITE_COUNT // 1 — answer B

export interface CheckerboardProps {
  /** Spotlight every cell of this colour with an amber ring (explainer only). */
  markColor?: 'black' | 'white' | null
  /**
   * Pairing reveal (explainer only): dim the 12 black + 12 white that pair off,
   * and ring the single leftover black cell — the bottom-right corner.
   */
  pairUp?: boolean
}

/** The lone extra black cell once 12 black pair with 12 white: bottom-right corner. */
const EXTRA_BLACK = { row: N - 1, col: N - 1 } // (4,4) — black, since 4+4 even

/**
 * Reusable primitive: draws the 5×5 chequerboard. `markColor` rings every cell
 * of that colour; `pairUp` dims the matched 12+12 and rings the one extra black.
 */
export function Checkerboard({ markColor = null, pairUp = false }: CheckerboardProps) {
  const cells = []
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const black = isBlack(r, c)
      const x = PAD + c * CELL
      const y = PAD + r * CELL
      const isExtra = pairUp && r === EXTRA_BLACK.row && c === EXTRA_BLACK.col
      const dimmed = pairUp && !isExtra
      const ringed = (markColor === 'black' && black) || (markColor === 'white' && !black) || isExtra

      cells.push(
        <g key={`c-${r}-${c}`}>
          <rect x={x} y={y} width={CELL} height={CELL} fill={black ? BLACK : WHITE} opacity={dimmed ? 0.28 : 1} />
          {ringed && (
            <rect
              x={x + 4}
              y={y + 4}
              width={CELL - 8}
              height={CELL - 8}
              fill="none"
              stroke={MARK}
              strokeWidth={3.5}
              rx={4}
            />
          )}
        </g>,
      )
    }
  }

  return (
    <svg
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      width="100%"
      style={{ maxWidth: 260, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {cells}
      {/* board frame */}
      <rect x={PAD} y={PAD} width={N * CELL} height={N * CELL} fill="none" stroke={FRAME} strokeWidth={2} />
    </svg>
  )
}

export default function P21G1Q10Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A 5 by 5 chequerboard of black and white squares, with a black square in the top-left corner. How many more black squares are there than white squares?"
    >
      <Checkerboard />
    </div>
  )
}
