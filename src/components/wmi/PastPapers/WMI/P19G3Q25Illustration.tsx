// 4x4 "fill 1-4, equal-sum pieces" grid for WMI-19P3A-Q25 (2019 WMI Semifinal G3).
//
// Reconstructed from db/seed/wmi/figures/2019-semifinal-g3-a-q25.jpg by reading the
// thick piece-walls edge-by-edge (verified by sampling wall thickness in the scan):
// a 4x4 grid carved into 5 contiguous pieces. The number 3 is given at cell (1,1).
// The four corner cells are labelled A (top-left), B (top-right), C (bottom-right),
// D (bottom-left). Fill 1,2,3,4 so every row and column has all four different
// (a Latin square) AND every piece sums to the same value. The whole grid sums to
// 4×(1+2+3+4)=40, and 5 equal pieces ⇒ each piece sums to 40÷5 = 8.
//
// Two completed grids satisfy all rules, but BOTH give A+B+C+D = 10, so the answer
// is uniquely 10 (choice D). This static figure shows ONLY the problem — the grid,
// the thick piece-walls, the given 3, and the corner labels. It never fills values.
//
// Pure render: no window/document, no Math.random/Date — SSR-safe & deterministic.

export const Q25_N = 4
export const Q25_ANSWER = 'D' // A + B + C + D = 10
export const Q25_PIECE_SUM = 8

export const Q25_VIEW = 360
const Q25_PAD = 10
export const Q25_CELL = (Q25_VIEW - Q25_PAD * 2) / Q25_N

const px = (col: number) => Q25_PAD + col * Q25_CELL
const py = (row: number) => Q25_PAD + row * Q25_CELL
const cx = (col: number) => px(col) + Q25_CELL / 2
const cy = (row: number) => py(row) + Q25_CELL / 2

const INK = '#1F2937'
const GREEN = '#10B981'
const GREEN_FILL = 'rgba(16,185,129,0.16)'
const GIVEN = '#6B7280'

/** The given cell (the printed 3). */
export const Q25_GIVEN = { row: 1, col: 1, value: 3 } as const

/** The five pieces, read from the scan's thick walls (row 0 top, col 0 left). */
export const Q25_PIECES: ReadonlyArray<ReadonlyArray<[number, number]>> = [
  [[0, 0], [0, 1], [0, 2]],
  [[0, 3], [1, 2], [1, 3]],
  [[1, 0], [2, 0], [3, 0], [3, 1]],
  [[1, 1], [2, 1], [2, 2]],
  [[2, 3], [3, 2], [3, 3]],
]

/** Corner answer cells in A,B,C,D order. */
export const Q25_CORNERS: ReadonlyArray<{ label: string; row: number; col: number }> = [
  { label: 'A', row: 0, col: 0 },
  { label: 'B', row: 0, col: 3 },
  { label: 'C', row: 3, col: 3 },
  { label: 'D', row: 3, col: 0 },
]

// One valid completed grid (row 0 top). Every row/col has 1-4 once, every piece sums
// to 8, the given (1,1)=3 holds, and the corners give A+B+C+D = 3+2+3+2 = 10.
// (A second valid grid exists; it gives 4+2+1+3 = 10 too — the corner sum is unique.)
export const Q25_SOLUTION: ReadonlyArray<ReadonlyArray<number>> = [
  [3, 4, 1, 2],
  [1, 3, 2, 4],
  [4, 2, 3, 1],
  [2, 1, 4, 3],
]

type Side = 'T' | 'R' | 'B' | 'L'

/** Outline segments around one piece (its perimeter edges). */
export function pieceEdges(
  cells: ReadonlyArray<[number, number]>,
): Array<{ x1: number; y1: number; x2: number; y2: number }> {
  const set = new Set(cells.map(([r, c]) => `${r},${c}`))
  const has = (r: number, c: number) => set.has(`${r},${c}`)
  const segs: Array<{ x1: number; y1: number; x2: number; y2: number }> = []
  const sides: Side[] = ['T', 'R', 'B', 'L']
  for (const [r, c] of cells) {
    for (const s of sides) {
      const nb = s === 'T' ? [r - 1, c] : s === 'B' ? [r + 1, c] : s === 'L' ? [r, c - 1] : [r, c + 1]
      if (has(nb[0], nb[1])) continue
      const x0 = px(c)
      const y0 = py(r)
      if (s === 'T') segs.push({ x1: x0, y1: y0, x2: x0 + Q25_CELL, y2: y0 })
      if (s === 'B') segs.push({ x1: x0, y1: y0 + Q25_CELL, x2: x0 + Q25_CELL, y2: y0 + Q25_CELL })
      if (s === 'L') segs.push({ x1: x0, y1: y0, x2: x0, y2: y0 + Q25_CELL })
      if (s === 'R') segs.push({ x1: x0 + Q25_CELL, y1: y0, x2: x0 + Q25_CELL, y2: y0 + Q25_CELL })
    }
  }
  return segs
}

const CORNER_SET = new Set(Q25_CORNERS.map((c) => `${c.row},${c.col}`))

export interface Q25GridProps {
  /** Cells solved so far: "row-col" -> digit. The given 3 always shows. */
  solved?: Record<string, number>
  /** Piece index (0..4) to tint green this beat, or -1 for none. */
  litPiece?: number
  /** Tint the four corner cells and tag A/B/C/D. */
  markCorners?: boolean
}

export function Q25Grid({ solved = {}, litPiece = -1, markCorners = false }: Q25GridProps) {
  const litCells = new Set(
    litPiece >= 0 && litPiece < Q25_PIECES.length ? Q25_PIECES[litPiece].map(([r, c]) => `${r},${c}`) : [],
  )
  const givenKey = `${Q25_GIVEN.row},${Q25_GIVEN.col}`
  const isShown = (r: number, c: number) => solved[`${r}-${c}`] !== undefined || (r === Q25_GIVEN.row && c === Q25_GIVEN.col)

  return (
    <svg
      viewBox={`0 0 ${Q25_VIEW} ${Q25_VIEW}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Thin cells, with corner / lit-piece tints. */}
      {Array.from({ length: Q25_N }).map((_, r) =>
        Array.from({ length: Q25_N }).map((__, c) => {
          const isCorner = markCorners && CORNER_SET.has(`${r},${c}`)
          const isLit = litCells.has(`${r},${c}`)
          const fill = isLit || isCorner ? GREEN_FILL : 'white'
          return (
            <rect
              key={`g-${r}-${c}`}
              x={px(c)}
              y={py(r)}
              width={Q25_CELL}
              height={Q25_CELL}
              fill={fill}
              stroke="#CBD5E1"
              strokeWidth={1}
            />
          )
        }),
      )}

      {/* Heavy piece outlines. */}
      {Q25_PIECES.map((cells, pi) =>
        pieceEdges(cells).map((seg, si) => (
          <line
            key={`pc-${pi}-${si}`}
            x1={seg.x1}
            y1={seg.y1}
            x2={seg.x2}
            y2={seg.y2}
            stroke={INK}
            strokeWidth={4}
            strokeLinecap="square"
          />
        )),
      )}

      {/* Cell digits: the given 3 always, plus any solved digits. */}
      {Array.from({ length: Q25_N }).map((_, r) =>
        Array.from({ length: Q25_N }).map((__, c) => {
          if (!isShown(r, c)) return null
          const key = `${r},${c}`
          const value = key === givenKey ? Q25_GIVEN.value : solved[`${r}-${c}`]
          const isGiven = key === givenKey
          const isCorner = markCorners && CORNER_SET.has(key)
          return (
            <text
              key={`v-${r}-${c}`}
              x={cx(c)}
              y={cy(r)}
              textAnchor="middle"
              dominantBaseline="central"
              className="font-display"
              fontSize={Q25_CELL * 0.5}
              fontWeight={isCorner ? 900 : 800}
              fill={isCorner ? '#065F46' : isGiven ? INK : INK}
            >
              {value}
            </text>
          )
        }),
      )}

      {/* Corner labels A/B/C/D on cells that are not yet filled. */}
      {Q25_CORNERS.filter((cell) => !isShown(cell.row, cell.col)).map((cell) => (
        <text
          key={`mark-${cell.label}`}
          x={cx(cell.col)}
          y={cy(cell.row)}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-display"
          fontSize={Q25_CELL * 0.42}
          fontWeight={700}
          fontStyle="italic"
          fill={GIVEN}
        >
          {cell.label}
        </text>
      ))}

      {/* Small corner tags once filled, so ABCD stay identified. */}
      {markCorners &&
        Q25_CORNERS.filter((cell) => isShown(cell.row, cell.col)).map((cell) => (
          <text
            key={`tag-${cell.label}`}
            x={px(cell.col) + Q25_CELL - 5}
            y={py(cell.row) + Q25_CELL - 4}
            textAnchor="end"
            className="font-display"
            fontSize={Q25_CELL * 0.24}
            fontWeight={800}
            fill={GREEN}
          >
            {cell.label}
          </text>
        ))}
    </svg>
  )
}

export default function P19G3Q25Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'A 4 by 4 grid split by thick walls into 5 pieces. The number 3 is given. ' +
        'Fill 1 to 4 so every row and column has all four different and every piece has the same sum. ' +
        'Corners A, B, C, D give the answer A + B + C + D.'
      }
    >
      <Q25Grid />
    </div>
  )
}
