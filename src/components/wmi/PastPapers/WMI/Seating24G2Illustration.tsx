// Static card illustration for WMI-24F2A-Q12 (2024 Grade-2 final).
//
// "Below is a seating map of a small show. Find the number of Samuel's seat."
// Answer: D (20).
//
// The seats fill a 6-row by 8-column block, numbered in a SNAKE (boustrophedon)
// pattern that starts at the bottom-left and turns direction every row:
//
//   top row    →  48 47 46 45 44 43 42 41   (right → left)
//                 33 34 35 36 37 38 39 40   (left → right)
//                 32 31 30 29 28 27 26 25   (right → left)
//                 17 18 19 20 21 22 23 24   (left → right)   ← Samuel is 20
//                 16 15 14 13 12 11 10  9   (right → left)
//   bottom row →   1  2  3  4  5  6  7  8   (left → right)
//
// The problem gives two reference seats, 11 and 37, plus Samuel's marked seat.
// This component draws ONLY the setup: the full block of blank circular seats
// with seats 11 and 37 labelled and Samuel's face on his cell — it never prints
// the other numbers, so it never reveals that Samuel sits in seat 20.
//
// Post-answer, the explainer/animator drives the co-exported `Seating24G2`
// primitive (and the pure `seatNumberAt` helper) to walk the snake numbering
// row by row up to Samuel's seat.
//
// Pure render — no random, no dates, SSR-safe & deterministic. Every primitive
// falls back to safe defaults when given the wrong shape so previews render.

const INK = '#1F2937'

// ── Geometry of the seating block ───────────────────────────────────────────
export const SEATING_ROWS = 6 // rows, top (0) → bottom (5)
export const SEATING_COLS = 8 // columns, left (0) → right (7)

/**
 * Snake (boustrophedon) seat number for a cell, given by its **top-down** row
 * index (0 = top row) and left-to-right column index (0 = leftmost).
 *
 * Numbering starts at 1 in the bottom-left corner and snakes upward, reversing
 * direction each row. This is the single source of truth the explainer drives
 * to walk the numbering; the figure itself only ever shows a few of these.
 */
export function seatNumberAt(rowFromTop: number, col: number): number {
  // Convert to a bottom-up row index: 0 = bottom row.
  const rowFromBottom = SEATING_ROWS - 1 - rowFromTop
  const base = rowFromBottom * SEATING_COLS // first seat number in this row, minus 1
  // Even rows (from the bottom) run left→right; odd rows run right→left.
  const within = rowFromBottom % 2 === 0 ? col : SEATING_COLS - 1 - col
  return base + within + 1
}

/** Samuel's marked cell (top-down row, column) — seat 20, the answer. */
export const SAMUEL_CELL = { row: 3, col: 3 } as const // seatNumberAt(3,3) === 20

/** The two reference seats printed on the map (top-down row, column). */
export const KNOWN_SEATS: Array<{ row: number; col: number; n: number }> = [
  { row: 4, col: 5, n: 11 }, // seatNumberAt(4,5) === 11
  { row: 1, col: 4, n: 37 }, // seatNumberAt(1,4) === 37
]

// ── Drawn glyphs ────────────────────────────────────────────────────────────

/** A small drawn child's face (Samuel) — head, hair, eyes, cheeks. No emoji. */
function SamuelFace({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} className="fill-qupu-peach stroke-qupu-brand-orange" strokeWidth={1.6} />
      {/* hair cap across the top */}
      <path
        d={`M ${cx - r} ${cy - r * 0.1}
            A ${r} ${r} 0 0 1 ${cx + r} ${cy - r * 0.1}
            L ${cx + r * 0.55} ${cy - r * 0.15}
            Q ${cx} ${cy - r * 0.55} ${cx - r * 0.55} ${cy - r * 0.15} Z`}
        className="fill-qupu-brand-orange"
      />
      <circle cx={cx - r * 0.34} cy={cy + r * 0.1} r={r * 0.12} fill={INK} />
      <circle cx={cx + r * 0.34} cy={cy + r * 0.1} r={r * 0.12} fill={INK} />
      <circle cx={cx - r * 0.45} cy={cy + r * 0.42} r={r * 0.13} className="fill-qupu-brand-orange" opacity={0.45} />
      <circle cx={cx + r * 0.45} cy={cy + r * 0.42} r={r * 0.13} className="fill-qupu-brand-orange" opacity={0.45} />
    </g>
  )
}

// ── Layout constants (shared by the primitive and the wrapper) ──────────────
const SEAT_R = 17 // seat circle radius
const STEP = 40 // cell-to-cell spacing
const PAD_X = 16
const PAD_Y = 16
const GRID_W = PAD_X * 2 + (SEATING_COLS - 1) * STEP + SEAT_R * 2
const GRID_H = PAD_Y * 2 + (SEATING_ROWS - 1) * STEP + SEAT_R * 2

const cx = (col: number) => PAD_X + SEAT_R + col * STEP
const cy = (row: number) => PAD_Y + SEAT_R + row * STEP

/**
 * The seating block.
 *
 * With no props it renders the bare problem: every seat blank except the two
 * reference seats (11, 37) and Samuel's marked cell.
 *
 * @param reveal      when true, prints the snake number in every cell — used by
 *                    the explainer/animator AFTER the answer.
 * @param upto        if set (a top-down row × col path length, 1-based count of
 *                    seats walked from seat 1), only prints numbers for seats up
 *                    to that count — lets the explainer animate the snake.
 * @param highlight   top-down {row, col} cell to ring in blue (the seat being
 *                    pointed at, e.g. Samuel's during the walk).
 * @param markSamuel  draw Samuel's face on his cell (default true). Set false
 *                    when the explainer wants to show seat 20 instead.
 */
export function Seating24G2({
  reveal = false,
  upto,
  highlight,
  markSamuel = true,
}: {
  reveal?: boolean
  upto?: number
  highlight?: { row: number; col: number }
  markSamuel?: boolean
} = {}) {
  const knownByCell = new Map(KNOWN_SEATS.map((k) => [`${k.row}-${k.col}`, k.n]))
  const samuelKey = `${SAMUEL_CELL.row}-${SAMUEL_CELL.col}`

  return (
    <svg
      viewBox={`0 0 ${GRID_W} ${GRID_H}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 360 }}
      aria-hidden="true"
    >
      {Array.from({ length: SEATING_ROWS }, (_, row) =>
        Array.from({ length: SEATING_COLS }, (__, col) => {
          const key = `${row}-${col}`
          const n = seatNumberAt(row, col)
          const isKnown = knownByCell.has(key)
          const isSamuel = key === samuelKey
          const isHighlight = !!highlight && highlight.row === row && highlight.col === col

          // Decide what number (if any) to print in this seat.
          let printedNumber: number | null = null
          if (isKnown) printedNumber = knownByCell.get(key)!
          else if (reveal) printedNumber = n
          else if (typeof upto === 'number' && n <= upto) printedNumber = n

          const showFace = isSamuel && markSamuel && printedNumber === null

          return (
            <g key={key}>
              <circle
                cx={cx(col)}
                cy={cy(row)}
                r={SEAT_R}
                className="fill-qupu-cream stroke-qupu-brand-orange"
                strokeWidth={isHighlight ? 3.4 : 2}
              />
              {/* blue ring on a highlighted cell (explainer pointer) */}
              {isHighlight && (
                <circle
                  cx={cx(col)}
                  cy={cy(row)}
                  r={SEAT_R + 3}
                  fill="none"
                  className="stroke-qupu-brand-blue"
                  strokeWidth={2.4}
                />
              )}
              {showFace && <SamuelFace cx={cx(col)} cy={cy(row)} r={SEAT_R - 3} />}
              {printedNumber !== null && (
                <text
                  x={cx(col)}
                  y={cy(row)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={15}
                  fontWeight={800}
                  fill={isHighlight ? '#30598A' : INK}
                  className="font-display"
                >
                  {printedNumber}
                </text>
              )}
            </g>
          )
        }),
      )}
    </svg>
  )
}

/** Default export — the bare seating map inside the card (no box). */
export default function Seating24G2Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Peta tempat duduk pertunjukan: blok kursi bundar berukuran 6 baris kali 8 kolom. Hanya dua kursi yang diberi nomor, yaitu 11 dan 37, sebagai patokan; kursi Samuel ditandai dengan wajah dan belum diberi nomor. Kursi dinomori dengan pola ular mulai dari pojok kiri bawah, berbalik arah tiap baris."
    >
      <Seating24G2 />
    </div>
  )
}
