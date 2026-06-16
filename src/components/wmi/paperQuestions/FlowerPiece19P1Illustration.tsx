/**
 * WMI-19P1A-Q24 — "The figure is formed by the four pieces below (pieces may
 * only be ROTATED, not flipped over). Which piece carries the flower mark?"
 * (2019 Semifinal Grade 1, answer D.)
 *
 * Redrawn from the source scan (db/seed/wmi/figures/2019-semifinal-g1-a-q24.jpg):
 *   - The assembled figure is a 4 × 4 grid of cells in a checkerboard of
 *     light-grey and white squares.
 *   - One extra cell pokes UP from the top, above the THIRD column, and that
 *     tab carries a black flower mark (✿).
 *
 * The four jigsaw pieces themselves are not legibly preserved in the crop, so
 * the four-piece dissection here is a self-consistent reconstruction: four
 * connected 4-cell pieces that tile the 4 × 4 grid exactly, each a chiral
 * (no-flip) tetromino, with the flower cell (top row, 3rd column) belonging to
 * piece D. The partition (verified connected + covering) is:
 *
 *     A A D D        A = J-tetromino (top-left, runs down the left)
 *     A D D B        B = S/Z-tetromino (right side)
 *     A C B B        C = J-tetromino (bottom)
 *     C C C B        D = S-tetromino across the top centre — holds the flower
 *
 * The flower cell is (row 0, col 2); it belongs to piece D, so the answer is D.
 *
 * Pure render — no Math.random, no Date, no window/document at module top.
 * SSR-safe and deterministic.
 */

// ─── colour tokens ──────────────────────────────────────────────────────────
const GRID_LINE = '#6B7280' // cell separators (grey, like the scan)
const OUTLINE = '#2B2118' // piece / figure outer outline
const SHADE = '#B8B8B8' // the checkerboard grey squares
const LIGHT = '#FFFFFF' // the checkerboard white squares
const FLOWER = '#1F2937' // the flower mark
const PIECE_FILL: Record<PieceId, string> = {
  A: '#BFD7F0', // soft blue
  B: '#FBE3B3', // soft amber
  C: '#CDE9D2', // soft green
  D: '#F6C9D6', // soft pink — the flower piece
}

export type PieceId = 'A' | 'B' | 'C' | 'D'

// ─── data ───────────────────────────────────────────────────────────────────
export const COLS = 4
export const ROWS = 4
export const CELL = 40 // px per grid cell
const PAD = 12

// The flower cell, in (row, col), 0-based from the top-left.
export const FLOWER_CELL = { row: 0, col: 2 }

// Which piece owns each cell (the verified tiling above). cellPiece[row][col].
export const CELL_PIECE: PieceId[][] = [
  ['A', 'A', 'D', 'D'],
  ['A', 'D', 'D', 'B'],
  ['A', 'C', 'B', 'B'],
  ['C', 'C', 'C', 'B'],
]

// The piece that carries the flower mark, derived from the data (never hardcoded).
export const FLOWER_PIECE: PieceId = CELL_PIECE[FLOWER_CELL.row][FLOWER_CELL.col] // 'D'

/** Cells belonging to a piece, as a list of {row,col}. */
export function pieceCells(id: PieceId): Array<{ row: number; col: number }> {
  const out: Array<{ row: number; col: number }> = []
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (CELL_PIECE[r][c] === id) out.push({ row: r, col: c })
  return out
}

// Checkerboard colour for a cell (matches the scan: (r+c) even = white in row 0?).
// Source row 0: white, grey, white, grey → cell is GREY when (r + c) is odd.
function cellShade(row: number, col: number): string {
  return (row + col) % 2 === 1 ? SHADE : LIGHT
}

// ─── assembled figure ───────────────────────────────────────────────────────

export const FIG_VIEW_W = PAD * 2 + COLS * CELL
export const FIG_VIEW_H = PAD * 2 + ROWS * CELL + CELL // + the flower tab on top

/**
 * The assembled 4×4 checkerboard with the flower tab on top. When
 * `placedPieces` is given, those pieces are tinted with their colour and given a
 * thick outline so the animator can drop them in one at a time; otherwise it is
 * the plain problem figure (checkerboard only, no piece colours).
 */
export function AssembledFigure({ placedPieces = [] as PieceId[] }: { placedPieces?: PieceId[] }) {
  const gx = PAD
  const gy = PAD + CELL // grid starts below the tab row
  const placed = new Set(placedPieces)

  return (
    <svg
      viewBox={`0 0 ${FIG_VIEW_W} ${FIG_VIEW_H}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 200 }}
      aria-hidden="true"
    >
      {/* the flower tab (sticks up above column 2) */}
      <rect
        x={gx + FLOWER_CELL.col * CELL}
        y={PAD}
        width={CELL}
        height={CELL}
        fill={placed.has(FLOWER_PIECE) ? PIECE_FILL[FLOWER_PIECE] : SHADE}
        stroke={GRID_LINE}
        strokeWidth={1.5}
      />
      <text
        x={gx + FLOWER_CELL.col * CELL + CELL / 2}
        y={PAD + CELL / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={20}
        fill={FLOWER}
      >
        {'✿'}
      </text>

      {/* the 4×4 grid */}
      {CELL_PIECE.map((rowArr, r) =>
        rowArr.map((id, c) => {
          const isPlaced = placed.has(id)
          return (
            <rect
              key={`${r}-${c}`}
              x={gx + c * CELL}
              y={gy + r * CELL}
              width={CELL}
              height={CELL}
              fill={isPlaced ? PIECE_FILL[id] : cellShade(r, c)}
              stroke={GRID_LINE}
              strokeWidth={1.5}
            />
          )
        }),
      )}

      {/* thick outline around each placed piece (its outer boundary) */}
      {(Object.keys(PIECE_FILL) as PieceId[])
        .filter((id) => placed.has(id))
        .map((id) => (
          <g key={`out-${id}`} fill="none" stroke={OUTLINE} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round">
            {pieceBoundaryEdges(id).map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={gx + x1 * CELL} y1={gy + y1 * CELL} x2={gx + x2 * CELL} y2={gy + y2 * CELL} />
            ))}
          </g>
        ))}

      {/* outer outline of the whole assembled figure (incl. the tab) */}
      <g fill="none" stroke={OUTLINE} strokeWidth={2.6} strokeLinejoin="round">
        <rect x={gx} y={gy} width={COLS * CELL} height={ROWS * CELL} />
        <rect x={gx + FLOWER_CELL.col * CELL} y={PAD} width={CELL} height={CELL} />
      </g>
    </svg>
  )
}

/** Outer boundary edges of a piece, as [x1,y1,x2,y2] in grid units (cells). */
function pieceBoundaryEdges(id: PieceId): Array<[number, number, number, number]> {
  const cells = new Set(pieceCells(id).map((c) => `${c.row},${c.col}`))
  const has = (r: number, c: number) => cells.has(`${r},${c}`)
  const edges: Array<[number, number, number, number]> = []
  for (const { row, col } of pieceCells(id)) {
    if (!has(row - 1, col)) edges.push([col, row, col + 1, row]) // top
    if (!has(row + 1, col)) edges.push([col, row + 1, col + 1, row + 1]) // bottom
    if (!has(row, col - 1)) edges.push([col, row, col, row + 1]) // left
    if (!has(row, col + 1)) edges.push([col + 1, row, col + 1, row + 1]) // right
  }
  return edges
}

// ─── a single piece, drawn on its own (for the piece tray) ──────────────────

const PIECE_CELL = 30

/**
 * Draws one piece by itself, normalized to its own bounding box, filled with its
 * colour. If `withFlower`, the flower cell shows the ✿ mark. Used both in the
 * static problem (the four-piece tray) and the explainer.
 */
export function PieceGlyph({ id, withFlower = false }: { id: PieceId; withFlower?: boolean }) {
  const cells = pieceCells(id)
  const minR = Math.min(...cells.map((c) => c.row))
  const minC = Math.min(...cells.map((c) => c.col))
  const maxR = Math.max(...cells.map((c) => c.row))
  const maxC = Math.max(...cells.map((c) => c.col))
  const w = (maxC - minC + 1) * PIECE_CELL
  const h = (maxR - minR + 1) * PIECE_CELL
  const pad = 4
  return (
    <svg
      viewBox={`0 0 ${w + pad * 2} ${h + pad * 2}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: w + pad * 2 }}
      aria-hidden="true"
    >
      {cells.map(({ row, col }) => {
        const x = pad + (col - minC) * PIECE_CELL
        const y = pad + (row - minR) * PIECE_CELL
        const isFlower = withFlower && row === FLOWER_CELL.row && col === FLOWER_CELL.col
        return (
          <g key={`${row}-${col}`}>
            <rect x={x} y={y} width={PIECE_CELL} height={PIECE_CELL} fill={PIECE_FILL[id]} stroke={GRID_LINE} strokeWidth={1.2} />
            {isFlower && (
              <text x={x + PIECE_CELL / 2} y={y + PIECE_CELL / 2} textAnchor="middle" dominantBaseline="central" fontSize={16} fill={FLOWER}>
                {'✿'}
              </text>
            )}
          </g>
        )
      })}
      {/* outer outline of the piece */}
      <g fill="none" stroke={OUTLINE} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round">
        {pieceBoundaryEdges(id).map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={pad + (x1 - minC) * PIECE_CELL}
            y1={pad + (y1 - minR) * PIECE_CELL}
            x2={pad + (x2 - minC) * PIECE_CELL}
            y2={pad + (y2 - minR) * PIECE_CELL}
          />
        ))}
      </g>
    </svg>
  )
}

export default function FlowerPiece19P1Illustration() {
  const ids: PieceId[] = ['A', 'B', 'C', 'D']
  return (
    <div
      className="my-4 flex flex-col items-center gap-3"
      role="img"
      aria-label="Sebuah figur dari kotak-kotak dengan satu tonjolan bertanda bunga di atas, disusun dari empat potongan yang hanya boleh diputar (tidak dibalik). Potongan mana yang membawa tanda bunga?"
    >
      <AssembledFigure />
      <div className="grid grid-cols-4 gap-2" style={{ maxWidth: 300 }}>
        {ids.map((id) => (
          <div key={id} className="flex flex-col items-center gap-1">
            <PieceGlyph id={id} />
            <span className="font-display text-xs font-extrabold text-qupu-brand-blue">{id}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
