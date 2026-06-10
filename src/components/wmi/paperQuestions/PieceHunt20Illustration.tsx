// Piece-hunt puzzle for WMI-20F1A-Q17.
//
// Source figures: wmiPastPaper/2020 WMI Final G01 Paper B — a 3×3 grid of boxed
// circles, two pieces to hunt for (rotation allowed), and a worked 2×2 example.
// Grid colours (row, col from 1):
//   (1,1) black  (1,2) white  (1,3) white
//   (2,1) PINK   (2,2) white  (2,3) black
//   (3,1) black  (3,2) white  (3,3) PINK
// Piece 1 = [pink][white] domino → 2 matches. Piece 2 = black-cornered
// L-tromino (black on top, white below, white to its right) → 3 matches.
// Answer: 2 + 3 = 5.

export type CircleColor = 'black' | 'white' | 'pink'

export const PINK = '#F9A8D4'
export const BLACK = '#1F2937'
const INK = '#1F2937'
const BOX = '#475569'

/** Grid colours, row-major, rows/cols 1..3. */
export const GRID: CircleColor[][] = [
  ['black', 'white', 'white'],
  ['pink', 'white', 'black'],
  ['black', 'white', 'pink'],
]

const FILL: Record<CircleColor, string> = {
  black: BLACK,
  white: '#FFFFFF',
  pink: PINK,
}

/** One boxed cell containing a circle, top-left at (x, y). */
export function BoxedCircle({ color, x, y, size = 40 }: { color: CircleColor; x: number; y: number; size?: number }) {
  const r = size * 0.34
  return (
    <g>
      <rect x={x} y={y} width={size} height={size} fill="#FFFFFF" stroke={BOX} strokeWidth={1.5} />
      <circle cx={x + size / 2} cy={y + size / 2} r={r} fill={FILL[color]} stroke={INK} strokeWidth={2} />
    </g>
  )
}

export const GRID_CELL = 44
export const GRID_SIZE = GRID_CELL * 3

/**
 * The 3×3 circle grid, top-left at (x, y). `highlight` outlines the given
 * cells ([row, col], 1-indexed) with a thick coloured ring-box.
 */
export function CircleGrid({
  x = 0,
  y = 0,
  highlight = [],
  highlightColor = '#F59E0B',
}: {
  x?: number
  y?: number
  highlight?: Array<[number, number]>
  highlightColor?: string
}) {
  return (
    <g>
      {GRID.map((row, ri) =>
        row.map((color, ci) => (
          <BoxedCircle key={`${ri}-${ci}`} color={color} x={x + ci * GRID_CELL} y={y + ri * GRID_CELL} size={GRID_CELL} />
        )),
      )}
      {highlight.map(([r, c], i) => (
        <rect
          key={i}
          x={x + (c - 1) * GRID_CELL + 2.5}
          y={y + (r - 1) * GRID_CELL + 2.5}
          width={GRID_CELL - 5}
          height={GRID_CELL - 5}
          fill="none"
          stroke={highlightColor}
          strokeWidth={4}
          rx={6}
        />
      ))}
    </g>
  )
}

/** Piece 1 — the [pink][white] horizontal domino, top-left at (x, y). */
export function PieceOne({ x, y, size = 28 }: { x: number; y: number; size?: number }) {
  return (
    <g>
      <BoxedCircle color="pink" x={x} y={y} size={size} />
      <BoxedCircle color="white" x={x + size} y={y} size={size} />
    </g>
  )
}

/** Piece 2 — L-tromino: black on top, white below it, white to that one's right. */
export function PieceTwo({ x, y, size = 28 }: { x: number; y: number; size?: number }) {
  return (
    <g>
      <BoxedCircle color="black" x={x} y={y} size={size} />
      <BoxedCircle color="white" x={x} y={y + size} size={size} />
      <BoxedCircle color="white" x={x + size} y={y + size} size={size} />
    </g>
  )
}

export const HUNT_VIEW_W = 340
export const HUNT_VIEW_H = 348

const EX_BLUE = '#3B82F6'
const EX_PINK = '#EC4899'
const EX_PURPLE = '#7C3AED'

/** The full in-card figure: worked example, the 3×3 grid, and the asked line. */
export function PieceHuntDiagram() {
  // ---- worked example (inside a dotted border, matching the source scan) ----
  const exCell = 26
  const exX = 48
  const exY = 26
  const exGridW = exCell * 2
  const exGridH = exCell * 2

  // blue dashed outline around the RIGHT COLUMN of the 2×2 grid
  const blueX = exX + exCell - 5
  const blueY = exY - 9
  const blueW = exCell + 14
  const blueH = exGridH + 18
  // pink dashed outline around the BOTTOM ROW of the 2×2 grid
  const pinkX = exX - 9
  const pinkY = exY + exCell - 5
  const pinkW = exGridW + 18
  const pinkH = exCell + 14

  // purple arrow, then the searched [black][white] domino with "= ( 2 )" below
  const arrowX = blueX + blueW + 18
  const arrowMidY = exY + exCell
  const domX = arrowX + 44
  const domY = exY
  const domW = exCell * 2

  // dotted example border
  const boxX = 12
  const boxY = 6
  const boxW = HUNT_VIEW_W - 24
  const boxH = 100

  // ---- main grid + asked line ----
  const gridX = (HUNT_VIEW_W - GRID_SIZE) / 2
  const gridY = boxY + boxH + 16

  const pcell = 26
  const askY = gridY + GRID_SIZE + 16
  const p1X = 64
  const plusX = p1X + pcell * 2 + 20
  const p2X = plusX + 20
  const eqX = p2X + pcell * 2 + 22

  return (
    <svg
      viewBox={`0 0 ${HUNT_VIEW_W} ${HUNT_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* worked example: 2×2 grid [black, black / black, white]; domino [black][white] found 2 times */}
      <rect x={boxX} y={boxY} width={boxW} height={boxH} fill="none" stroke={INK} strokeWidth={1.5} strokeDasharray="2 3" rx={8} />

      <BoxedCircle color="black" x={exX} y={exY} size={exCell} />
      <BoxedCircle color="black" x={exX + exCell} y={exY} size={exCell} />
      <BoxedCircle color="black" x={exX} y={exY + exCell} size={exCell} />
      <BoxedCircle color="white" x={exX + exCell} y={exY + exCell} size={exCell} />

      {/* found piece 1: blue dashed outline around the right column */}
      <rect x={blueX} y={blueY} width={blueW} height={blueH} fill="none" stroke={EX_BLUE} strokeWidth={2.5} strokeDasharray="6 4" rx={9} />
      <text x={blueX + blueW + 6} y={blueY + 4} fontSize={14} fontWeight={900} fill={EX_BLUE}>
        1
      </text>
      {/* found piece 2: pink dashed outline around the bottom row */}
      <rect x={pinkX} y={pinkY} width={pinkW} height={pinkH} fill="none" stroke={EX_PINK} strokeWidth={2.5} strokeDasharray="6 4" rx={9} />
      <text x={pinkX - 7} y={pinkY + pinkH / 2} textAnchor="end" dominantBaseline="central" fontSize={14} fontWeight={900} fill={EX_PINK}>
        2
      </text>

      {/* thick purple arrow pointing right */}
      <polygon
        points={`${arrowX},${arrowMidY - 5} ${arrowX + 16},${arrowMidY - 5} ${arrowX + 16},${arrowMidY - 11} ${arrowX + 30},${arrowMidY} ${arrowX + 16},${arrowMidY + 11} ${arrowX + 16},${arrowMidY + 5} ${arrowX},${arrowMidY + 5}`}
        fill={EX_PURPLE}
      />

      {/* the searched piece and how many times it was found */}
      <BoxedCircle color="black" x={domX} y={domY} size={exCell} />
      <BoxedCircle color="white" x={domX + exCell} y={domY} size={exCell} />
      <text x={domX + domW / 2} y={domY + exCell + 24} textAnchor="middle" fontSize={18} fontWeight={900} fill={INK}>
        = ( 2 )
      </text>

      {/* the main 3×3 grid */}
      <CircleGrid x={gridX} y={gridY} />

      {/* asked: piece 1 + piece 2 = ? */}
      <PieceOne x={p1X} y={askY + pcell / 2} size={pcell} />
      <text x={plusX} y={askY + pcell} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={900} fill={INK}>
        +
      </text>
      <PieceTwo x={p2X + 14} y={askY} size={pcell} />
      <text x={eqX + 14} y={askY + pcell} dominantBaseline="central" fontSize={22} fontWeight={900} fill={INK}>
        = ?
      </text>
    </svg>
  )
}

export default function PieceHunt20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A 3 by 3 grid of black, white and pink circles. Count how many times the pink-white domino and the black-cornered L piece appear; pieces may be turned."
    >
      <PieceHuntDiagram />
    </div>
  )
}
