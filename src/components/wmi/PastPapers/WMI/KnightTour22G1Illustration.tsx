// WMI-22F1A-Q22 (Grade 1) — chess-Horse (knight) tour on an irregular board.
//
// A "Horse" moves like a chess knight (an L-shape: 2 in one direction + 1
// perpendicular). It starts on the cell marked "1", then jumps cell-to-cell —
// visiting every one of the 12 cells exactly once and numbering them 1..12 —
// finishing on the cell marked "12" after 11 jumps. The question asks which
// number lands on the star cell (★).
//
// BOARD (1-indexed [row, col]) — an irregular 12-cell shape reconstructed from
// the scan db/seed/wmi/figures/2022-final-g1-a-q22.jpg:
//   row1:                  (1,1)                       — holds "1"
//   row2:  (2,1)  (2,2)  (2,3)  (2,4)
//   row3:  (3,1)  (3,2)  (3,3)★ (3,4)                  — (3,3)=★, (3,4)="12"
//   row4:  (4,1)  (4,2)  (4,3)
//
// A backtracking knight's-tour solver over this exact board, fixed to start on
// (1,1)=1 and end on (3,4)=12, finds EXACTLY ONE tour (unique). On that tour the
// star cell (3,3) receives number 9 — matching the answer key (★ = 9).
//
// Verified tour, in visiting order 1..12:
//   1:(1,1) 2:(3,2) 3:(2,4) 4:(4,3) 5:(3,1) 6:(2,3) 7:(4,2) 8:(2,1) 9:(3,3)★
//   10:(4,1) 11:(2,2) 12:(3,4)
//
// The static figure draws ONLY the problem: the board with "1", "12", and "★"
// in their cells; every other cell stays blank — the tour numbers are never
// revealed. The animator imports KnightBoard to fill cells in tour order.
//
// SSR-safe + deterministic: no Math.random, no Date, pure render.

/** The 12 board cells as [row, col] (1-indexed). */
export const KNIGHT_BOARD: Array<[number, number]> = [
  [1, 1],
  [2, 1],
  [2, 2],
  [2, 3],
  [2, 4],
  [3, 1],
  [3, 2],
  [3, 3],
  [3, 4],
  [4, 1],
  [4, 2],
  [4, 3],
]

/**
 * The cells in visiting order (step 1 = index 0 ... step 12 = index 11),
 * VERIFIED by a backtracking knight's-tour solver. Start = (1,1), end = (3,4),
 * unique solution; the star cell (3,3) is step 9.
 */
export const KNIGHT_TOUR: Array<[number, number]> = [
  [1, 1], // 1  (start)
  [3, 2], // 2
  [2, 4], // 3
  [4, 3], // 4
  [3, 1], // 5
  [2, 3], // 6
  [4, 2], // 7
  [2, 1], // 8
  [3, 3], // 9  ★
  [4, 1], // 10
  [2, 2], // 11
  [3, 4], // 12 (end)
]

const STAR_CELL: [number, number] = [3, 3]

// --- layout -------------------------------------------------------------
const CELL = 60
const PAD = 10
// 4 columns wide, 4 rows tall.
const COLS = 4
const ROWS = 4
const GRID_W = COLS * CELL
const GRID_H = ROWS * CELL
const VIEW_W = GRID_W + PAD * 2
const VIEW_H = GRID_H + PAD * 2

const cellX = (col: number) => PAD + (col - 1) * CELL
const cellY = (row: number) => PAD + (row - 1) * CELL
const ctrX = (col: number) => cellX(col) + CELL / 2
const ctrY = (row: number) => cellY(row) + CELL / 2

const sameCell = (a: [number, number], b: [number, number]) => a[0] === b[0] && a[1] === b[1]

/** A drawn five-point star centred at (cx, cy) with outer radius r. */
function starPoints(cx: number, cy: number, r: number): string {
  const inner = r * 0.4
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : inner
    // start pointing up; -90deg offset
    const ang = (Math.PI / 5) * i - Math.PI / 2
    pts.push(`${cx + radius * Math.cos(ang)},${cy + radius * Math.sin(ang)}`)
  }
  return pts.join(' ')
}

/** One board cell: square outline plus optional centred content. */
function BoardCell({
  row,
  col,
  label,
  star,
  filled,
}: {
  row: number
  col: number
  label?: string
  star?: boolean
  filled?: boolean
}) {
  const x = cellX(col)
  const y = cellY(row)
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={CELL}
        height={CELL}
        className={filled ? 'fill-qupu-peach stroke-qupu-brand-orange' : 'fill-qupu-cream stroke-qupu-brand-orange'}
        strokeWidth={2.5}
      />
      {star && (
        <polygon
          points={starPoints(ctrX(col), ctrY(row), CELL * 0.3)}
          className="fill-qupu-brand-orange stroke-qupu-brand-orange"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      )}
      {label != null && label !== '' && (
        <text
          x={ctrX(col)}
          y={ctrY(row) + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={26}
          fontWeight="bold"
          className="fill-qupu-brand-blue"
        >
          {label}
        </text>
      )}
    </g>
  )
}

/** Arrow from one cell centre to another (a Horse jump). */
function MoveArrow({ from, to }: { from: [number, number]; to: [number, number] }) {
  const x1 = ctrX(from[1])
  const y1 = ctrY(from[0])
  const x2 = ctrX(to[1])
  const y2 = ctrY(to[0])
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  // pull the tip back a touch so the arrowhead sits inside the target cell
  const tipX = x2 - ux * (CELL * 0.18)
  const tipY = y2 - uy * (CELL * 0.18)
  const head = 9
  // perpendicular for the arrowhead base
  const px = -uy
  const py = ux
  const baseX = tipX - ux * head
  const baseY = tipY - uy * head
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={baseX}
        y2={baseY}
        className="stroke-qupu-brand-blue"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <polygon
        points={`${tipX},${tipY} ${baseX + px * head * 0.6},${baseY + py * head * 0.6} ${baseX - px * head * 0.6},${baseY - py * head * 0.6}`}
        className="fill-qupu-brand-blue"
      />
    </g>
  )
}

/**
 * Reusable primitive (for the animator): draws the irregular board and fills
 * cells with their tour numbers up to step `upto` (1..12). When `upto >= 2` it
 * also draws the Horse-jump arrow from step (upto-1) → step upto. `star` toggles
 * the ★ marker on the star cell (shown only while that cell is still blank).
 */
export function KnightBoard({ upto, star }: { upto?: number; star?: boolean }) {
  const reveal = typeof upto === 'number' ? Math.max(0, Math.min(KNIGHT_TOUR.length, upto)) : 0
  const showStar = star !== false

  // Map each board cell to its tour step (1-indexed) when revealed so far.
  const stepOf = (cell: [number, number]): number | null => {
    const idx = KNIGHT_TOUR.findIndex((c) => sameCell(c, cell))
    if (idx === -1) return null
    const step = idx + 1
    return step <= reveal ? step : null
  }

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={Math.min(280, VIEW_W)} aria-hidden="true">
      {KNIGHT_BOARD.map(([row, col]) => {
        const step = stepOf([row, col])
        const isStar = sameCell([row, col], STAR_CELL)
        const label = step != null ? String(step) : undefined
        return (
          <BoardCell
            key={`${row}-${col}`}
            row={row}
            col={col}
            label={label}
            star={isStar && showStar && step == null}
            filled={step != null}
          />
        )
      })}

      {/* most-recent Horse jump */}
      {reveal >= 2 && <MoveArrow from={KNIGHT_TOUR[reveal - 2]} to={KNIGHT_TOUR[reveal - 1]} />}
    </svg>
  )
}

/**
 * Question figure: the irregular board with "1", "12", and "★" placed in their
 * cells; every other cell blank. The tour numbers are NOT revealed.
 */
export default function KnightTour22G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Papan tidak beraturan berisi 12 kotak. Kuda catur mulai di kotak bertanda 1, melompat seperti huruf L mengunjungi setiap kotak satu kali, dan berhenti di kotak bertanda 12. Pertanyaannya: angka berapa yang jatuh di kotak bertanda bintang?"
    >
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={Math.min(280, VIEW_W)}>
        {KNIGHT_BOARD.map(([row, col]) => {
          const isStart = sameCell([row, col], KNIGHT_TOUR[0])
          const isEnd = sameCell([row, col], KNIGHT_TOUR[KNIGHT_TOUR.length - 1])
          const isStar = sameCell([row, col], STAR_CELL)
          const label = isStart ? '1' : isEnd ? '12' : undefined
          return (
            <BoardCell key={`${row}-${col}`} row={row} col={col} label={label} star={isStar} />
          )
        })}
      </svg>
    </div>
  )
}
