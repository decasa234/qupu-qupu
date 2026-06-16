// WMI-22F1A-Q15 — "number snake" through a 3×3 egg grid.
//
// Nine eggs sit in a 3×3 grid (row-major positions 0..8, row 0 = top).
// Short orange links join consecutive cells of one snake path; the last link
// (pos3 → pos4, the centre "?") is drawn as an arrow pointing at the answer egg.
//
// Snake path (in order): 0 → 1 → 2 → 5 → 8 → 7 → 6 → 3 → 4(centre, "?").
// Printed givens: 1, 2, blank, 7, blank, 11, 16, 29, ?.  The "?" is the answer.
//
// Static figure shows ONLY the givens (blanks stay blank, centre stays "?") —
// it never reveals 37 or the two blank values. The animator imports SnakeEggGrid
// to light up cells and fill values in path order.

// Cells in pos order: 0,1,2 / 3,4,5 / 6,7,8. '' = blank egg.
const GIVENS: string[] = ['1', '2', '', '29', '?', '7', '', '16', '11']

// Fixed orange links between consecutive snake cells, in path order. Drawing
// these is independent of cell contents so the primitive is reusable.
const SNAKE_LINKS: ReadonlyArray<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 5],
  [5, 8],
  [8, 7],
  [7, 6],
  [6, 3],
  [3, 4], // arrow → centre "?"
]
const ARROW_LINK: [number, number] = [3, 4]

// Layout geometry.
const PAD = 6
const CELL = 116
const GRID = CELL * 3
const VIEW = GRID + PAD * 2

const colOf = (pos: number) => pos % 3
const rowOf = (pos: number) => Math.floor(pos / 3)
const cellX = (pos: number) => PAD + colOf(pos) * CELL
const cellY = (pos: number) => PAD + rowOf(pos) * CELL
const ctrX = (pos: number) => cellX(pos) + CELL / 2
const ctrY = (pos: number) => cellY(pos) + CELL / 2

const GRID_DARK = '#3A3A3A'
const ORANGE = '#F59E0B'
const EGG_DARK = '#2B2B2B'
const LIT_RING = '#F59E0B'
const LIT_FILL = '#FEF3C7'

const BAR_THICK = 22 // link bar width (across the gap)
const BAR_GAP = 26 // how far each bar extends from the shared cell border

/** A single white egg/oval with an optional centred label. */
function Egg({ pos, label, lit }: { pos: number; label: string; lit?: boolean }) {
  const cx = ctrX(pos)
  const cy = ctrY(pos)
  const rx = CELL * 0.34
  const ry = CELL * 0.42
  return (
    <g>
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill={lit ? LIT_FILL : '#FFFFFF'}
        stroke={lit ? LIT_RING : '#6B6B6B'}
        strokeWidth={lit ? 5 : 2.5}
      />
      {label !== '' && (
        <text
          x={cx}
          y={cy + 2}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-display"
          fontSize={CELL * 0.42}
          fontStyle="italic"
          fontWeight={800}
          fill={EGG_DARK}
        >
          {label}
        </text>
      )}
    </g>
  )
}

/** Orange connector bar (or arrow) drawn on the shared border of two cells. */
function Link({ a, b, arrow }: { a: number; b: number; arrow?: boolean }) {
  const horizontal = rowOf(a) === rowOf(b)
  // Midpoint of the shared border between the two cells.
  const mx = (ctrX(a) + ctrX(b)) / 2
  const my = (ctrY(a) + ctrY(b)) / 2

  if (arrow) {
    // Pointed bar: left→right or top→bottom toward cell b.
    const dir = horizontal ? Math.sign(ctrX(b) - ctrX(a)) : Math.sign(ctrY(b) - ctrY(a))
    const half = BAR_GAP
    const head = 16
    if (horizontal) {
      const x0 = mx - dir * half
      const xTip = mx + dir * half
      const xNeck = xTip - dir * head
      const hw = BAR_THICK / 2
      return (
        <polygon
          points={[
            `${x0},${my - hw * 0.6}`,
            `${xNeck},${my - hw * 0.6}`,
            `${xNeck},${my - hw}`,
            `${xTip},${my}`,
            `${xNeck},${my + hw}`,
            `${xNeck},${my + hw * 0.6}`,
            `${x0},${my + hw * 0.6}`,
          ].join(' ')}
          fill={ORANGE}
        />
      )
    }
    const y0 = my - dir * half
    const yTip = my + dir * half
    const yNeck = yTip - dir * head
    const hw = BAR_THICK / 2
    return (
      <polygon
        points={[
          `${mx - hw * 0.6},${y0}`,
          `${mx - hw * 0.6},${yNeck}`,
          `${mx - hw},${yNeck}`,
          `${mx},${yTip}`,
          `${mx + hw},${yNeck}`,
          `${mx + hw * 0.6},${yNeck}`,
          `${mx + hw * 0.6},${y0}`,
        ].join(' ')}
        fill={ORANGE}
      />
    )
  }

  if (horizontal) {
    return (
      <rect
        x={mx - BAR_GAP}
        y={my - BAR_THICK / 2}
        width={BAR_GAP * 2}
        height={BAR_THICK}
        rx={4}
        fill={ORANGE}
      />
    )
  }
  return (
    <rect
      x={mx - BAR_THICK / 2}
      y={my - BAR_GAP}
      width={BAR_THICK}
      height={BAR_GAP * 2}
      rx={4}
      fill={ORANGE}
    />
  )
}

/**
 * Reusable primitive: the 3×3 egg grid with the fixed orange snake connectors
 * (and the pos3→pos4 arrow). `cells` is 9 display strings in pos order
 * ('' = empty egg). `litIndex` optionally rings one egg in amber.
 */
export function SnakeEggGrid({ cells, litIndex }: { cells: string[]; litIndex?: number }) {
  const safeCells = Array.isArray(cells) && cells.length === 9 ? cells : GIVENS
  return (
    <svg
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 340 }}
      aria-hidden="true"
    >
      {/* Outer grid frame + inner divider lines. */}
      <rect x={PAD} y={PAD} width={GRID} height={GRID} fill="none" stroke={GRID_DARK} strokeWidth={3} />
      {[1, 2].map((i) => (
        <line
          key={`v-${i}`}
          x1={PAD + i * CELL}
          y1={PAD}
          x2={PAD + i * CELL}
          y2={PAD + GRID}
          stroke={GRID_DARK}
          strokeWidth={2}
        />
      ))}
      {[1, 2].map((i) => (
        <line
          key={`h-${i}`}
          x1={PAD}
          y1={PAD + i * CELL}
          x2={PAD + GRID}
          y2={PAD + i * CELL}
          stroke={GRID_DARK}
          strokeWidth={2}
        />
      ))}

      {/* Orange snake connectors (drawn over the grid lines). */}
      {SNAKE_LINKS.map(([a, b]) => {
        const isArrow = a === ARROW_LINK[0] && b === ARROW_LINK[1]
        return <Link key={`link-${a}-${b}`} a={a} b={b} arrow={isArrow} />
      })}

      {/* Eggs + labels on top. */}
      {safeCells.map((label, pos) => (
        <Egg key={`egg-${pos}`} pos={pos} label={label} lit={litIndex === pos} />
      ))}
    </svg>
  )
}

export default function NumberSnake22G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Kisi 3 kali 3 berisi telur yang dihubungkan tautan oranye menjadi satu ular angka: 1, 2, kosong, 7, kosong, 11, 16, 29, dan tanda tanya di tengah. Tiap langkah menambah satu lebih banyak dari langkah sebelumnya."
    >
      <SnakeEggGrid cells={GIVENS} />
    </div>
  )
}
