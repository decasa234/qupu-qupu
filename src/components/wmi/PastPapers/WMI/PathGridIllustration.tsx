// "Follow the path through the grid, find ★" figure for WMI-19F1-Q19.
// Reconstructed from the real figure: a 3-row x 5-column grid with a winding path.
// Walking the path one cell at a time, the value drops by 6 at every step,
// starting at 99 and ending at 15. The ★ sits 12th along the path -> 33.
//
// Path (row, col), row 0 = top, col 0 = left:
//   (2,0) (1,0) (0,0) (0,1) (0,2) (0,3) (1,3) (1,2) (1,1) (2,1) (2,2) (2,3)★ (2,4) (1,4) (0,4)
// Values:
//    99    93    87    81    75    69    63    57    51    45    39    33    27    21    15
export const PG_ROWS = 3
export const PG_COLS = 5
export const PG_START = 99
export const PG_STEP = -6

/** Ordered cells the path visits, from start (99) to end (15). */
export const PATH_CELLS: ReadonlyArray<[number, number]> = [
  [2, 0],
  [1, 0],
  [0, 0],
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 3],
  [1, 2],
  [1, 1],
  [2, 1],
  [2, 2],
  [2, 3], // ★
  [2, 4],
  [1, 4],
  [0, 4],
]

export const STAR_INDEX = 11 // PATH_CELLS index of the ★ cell
export const STAR_VALUE = PG_START + PG_STEP * STAR_INDEX // 33
export const [STAR_ROW, STAR_COL] = PATH_CELLS[STAR_INDEX]

/** Value carried at path step i. */
export const pathValue = (i: number): number => PG_START + PG_STEP * i

// The numbers actually printed in the real figure (the rest are blank squares).
const LABELLED_INDICES = [0, 1, 2, 5, 7, STAR_INDEX, 14] // 99 93 87 69 57 ★ 15
export const LABELLED = new Set(LABELLED_INDICES)

export const PG_VIEW_W = 360
export const PG_VIEW_H = 224
const PG_PAD = 8
export const PG_CELL = (PG_VIEW_W - PG_PAD * 2) / PG_COLS

const px = (col: number) => PG_PAD + col * PG_CELL
const py = (row: number) => PG_PAD + row * PG_CELL
const cx = (col: number) => px(col) + PG_CELL / 2
const cy = (row: number) => py(row) + PG_CELL / 2

const PATH_GRAY = '#D1D5DB'
const GREEN = '#10B981'
const GREEN_FILL = 'rgba(16,185,129,0.20)'
const STAR_STROKE = '#F59E0B'
const STAR_SHADE = '#FEF3C7'

function StarGlyph({ x, y, r, fill = '#1F2937' }: { x: number; y: number; r: number; fill?: string }) {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const ang = (Math.PI / 5) * i - Math.PI / 2
    const rad = i % 2 === 0 ? r : r * 0.42
    pts.push(`${x + rad * Math.cos(ang)},${y + rad * Math.sin(ang)}`)
  }
  return <polygon points={pts.join(' ')} fill={fill} />
}

export interface PathGridFigureProps {
  /** How many path cells are "lit" (walked so far). 0 = none, PATH_CELLS.length = all. */
  progress?: number
  /** Reveal the ★ cell's value (33) instead of the star glyph. */
  revealStar?: boolean
}

export function PathGridFigure({ progress = 0, revealStar = false }: PathGridFigureProps) {
  // Build the gray path ribbon connecting consecutive cell centres.
  const ribbon = PATH_CELLS.map(([r, c]) => `${cx(c)},${cy(r)}`).join(' ')

  return (
    <svg
      viewBox={`0 0 ${PG_VIEW_W} ${PG_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* The winding path ribbon (drawn under the grid lines). */}
      <polyline
        points={ribbon}
        fill="none"
        stroke={PATH_GRAY}
        strokeWidth={PG_CELL * 0.38}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Lit cells along the walked portion of the path. */}
      {PATH_CELLS.slice(0, Math.max(0, Math.min(progress, PATH_CELLS.length))).map(([r, c], i) => (
        <rect
          key={`lit-${i}`}
          x={px(c)}
          y={py(r)}
          width={PG_CELL}
          height={PG_CELL}
          fill={GREEN_FILL}
          stroke={GREEN}
          strokeWidth={2.5}
        />
      ))}

      {/* Grid cells + labels. */}
      {Array.from({ length: PG_ROWS }).map((_, r) =>
        Array.from({ length: PG_COLS }).map((__, c) => {
          const idx = PATH_CELLS.findIndex(([pr, pc]) => pr === r && pc === c)
          const isStar = r === STAR_ROW && c === STAR_COL
          const showLabel = idx >= 0 && LABELLED.has(idx) && !isStar
          return (
            <g key={`cell-${r}-${c}`}>
              <rect
                x={px(c)}
                y={py(r)}
                width={PG_CELL}
                height={PG_CELL}
                fill={isStar ? STAR_SHADE : 'none'}
                stroke="#1F2937"
                strokeWidth={2}
              />
              {showLabel && (
                <text
                  x={cx(c)}
                  y={cy(r)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="font-display"
                  fontSize={PG_CELL * 0.4}
                  fontWeight={800}
                  fill="#1F2937"
                >
                  {pathValue(idx)}
                </text>
              )}
            </g>
          )
        }),
      )}

      {/* ★ cell glyph or revealed value, on top. */}
      <rect
        x={px(STAR_COL)}
        y={py(STAR_ROW)}
        width={PG_CELL}
        height={PG_CELL}
        fill="none"
        stroke={revealStar ? GREEN : STAR_STROKE}
        strokeWidth={3}
      />
      {revealStar ? (
        <text
          x={cx(STAR_COL)}
          y={cy(STAR_ROW)}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-display"
          fontSize={PG_CELL * 0.4}
          fontWeight={900}
          fill={GREEN}
        >
          {STAR_VALUE}
        </text>
      ) : (
        <StarGlyph x={cx(STAR_COL)} y={cy(STAR_ROW)} r={PG_CELL * 0.26} />
      )}
    </svg>
  )
}

export default function PathGridIllustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`A 3 by 5 grid with a winding path. Each step along the path is 6 less than the last, starting at 99, so the ★ at the end equals ${STAR_VALUE}.`}
    >
      <PathGridFigure />
    </div>
  )
}
