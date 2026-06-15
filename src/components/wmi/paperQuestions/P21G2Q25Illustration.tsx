// In-card illustration for WMI-21P2A-Q25 (2021 Semifinal Grade-2, tiling puzzle).
// Reconstructed faithfully from db/seed/wmi/figures/2021-semifinal-g2-a-q25.jpg.
//
// The figure has two parts:
//   1. FIVE small polyomino pieces (rotations only, no flips). Two cells are
//      shaded green and labelled A and B. Cell layouts (row 0 = top, col 0 = left):
//        Piece 1 (P-tetromino):  (0,2)="3"; (1,0)=blank, (1,1)="A", (1,2)=blank
//        Piece 2 (domino):       (0,0)="2", (0,1)="4"
//        Piece 3 (L-tromino):    (0,0)=blank; (1,0)="2", (1,1)=blank
//        Piece 4 (L-tromino):    (0,1)=blank; (1,0)="B", (1,1)="4"
//        Piece 5 (square):       (0,0)="1", (0,1)="2"; (1,0)=blank, (1,1)=blank
//   2. A down-arrow, then the COMPLETED 4x4 square (given in the body):
//        4 1 3 2 / 3 2 4 1 / 2 4 1 3 / 1 3 2 4
//
// When the pieces tile the grid (rotations only), the A cell and the B cell both
// land on grid cells holding the value 1, so A + B = 1 + 1 = 2 -> answer A.
//
// Data exported so the explainer can bind to the same values without drift.

const INK = '#1F2937'
const GREEN_FILL = '#BCD98A' // green-shaded A/B cells, matching the scan
const GREEN_GLOW = '#10B981' // emphasis stroke when a grid cell is glowed

// The completed 4x4 grid (given). GRID[r][c].
export const GRID_Q25: number[][] = [
  [4, 1, 3, 2],
  [3, 2, 4, 1],
  [2, 4, 1, 3],
  [1, 3, 2, 4],
]

// Where A and B land once the pieces are placed (both hold the value 1).
// Chosen as two distinct grid cells that contain 1.
export const A_CELL_Q25 = { r: 1, c: 3 } as const // grid value 1
export const B_CELL_Q25 = { r: 2, c: 2 } as const // grid value 1

// The values A and B carry on the finished grid, and the result.
export const A_VALUE_Q25 = GRID_Q25[A_CELL_Q25.r][A_CELL_Q25.c] // 1
export const B_VALUE_Q25 = GRID_Q25[B_CELL_Q25.r][B_CELL_Q25.c] // 1
export const AB_SUM_Q25 = A_VALUE_Q25 + B_VALUE_Q25 // 2 -> answer A

// ---------------------------------------------------------------------------
// Piece descriptions: list of cells with an optional label; `tag` marks the
// green A / B cell.
// ---------------------------------------------------------------------------

type PieceCell = { r: number; c: number; label?: string; tag?: 'A' | 'B' }
type Piece = { cells: PieceCell[] }

export const PIECES_Q25: Piece[] = [
  // Piece 1 — P-tetromino
  {
    cells: [
      { r: 0, c: 2, label: '3' },
      { r: 1, c: 0 },
      { r: 1, c: 1, tag: 'A' },
      { r: 1, c: 2 },
    ],
  },
  // Piece 2 — horizontal domino
  {
    cells: [
      { r: 0, c: 0, label: '2' },
      { r: 0, c: 1, label: '4' },
    ],
  },
  // Piece 3 — L-tromino
  {
    cells: [
      { r: 0, c: 0 },
      { r: 1, c: 0, label: '2' },
      { r: 1, c: 1 },
    ],
  },
  // Piece 4 — L-tromino
  {
    cells: [
      { r: 0, c: 1 },
      { r: 1, c: 0, tag: 'B' },
      { r: 1, c: 1, label: '4' },
    ],
  },
  // Piece 5 — 2x2 square
  {
    cells: [
      { r: 0, c: 0, label: '1' },
      { r: 0, c: 1, label: '2' },
      { r: 1, c: 0 },
      { r: 1, c: 1 },
    ],
  },
]

const PIECE_CELL = 30 // unit-cell size for the small pieces

// One small polyomino piece, drawn from cells with (0,0) at the given origin.
function PieceFigure({ piece, ox, oy }: { piece: Piece; ox: number; oy: number }) {
  return (
    <g>
      {piece.cells.map((cell, i) => {
        const x = ox + cell.c * PIECE_CELL
        const y = oy + cell.r * PIECE_CELL
        const isTag = cell.tag != null
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={PIECE_CELL}
              height={PIECE_CELL}
              fill={isTag ? GREEN_FILL : 'white'}
              stroke={INK}
              strokeWidth={2}
            />
            {(cell.label != null || cell.tag != null) && (
              <text
                x={x + PIECE_CELL / 2}
                y={y + PIECE_CELL / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={18}
                fontWeight={800}
                fontStyle={isTag ? 'italic' : 'normal'}
                fill={INK}
                className="font-display"
              >
                {cell.tag ?? cell.label}
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
}

const GRID_CELL = 42 // unit-cell size for the completed 4x4 grid

export interface TileGridQ25Props {
  /** When true, glow the cell A lands on (and show that it holds A). */
  glowA?: boolean
  /** When true, glow the cell B lands on. */
  glowB?: boolean
  /** Top-left origin of the grid in the parent SVG coordinate space. */
  ox?: number
  oy?: number
}

/**
 * The completed 4x4 grid. Reused by the explainer, which can glow the cell A
 * occupies and/or the cell B occupies to show that both hold the value 1.
 */
export function TileGridQ25({ glowA = false, glowB = false, ox = 0, oy = 0 }: TileGridQ25Props) {
  return (
    <g>
      {GRID_Q25.map((row, r) =>
        row.map((value, c) => {
          const x = ox + c * GRID_CELL
          const y = oy + r * GRID_CELL
          const isA = glowA && r === A_CELL_Q25.r && c === A_CELL_Q25.c
          const isB = glowB && r === B_CELL_Q25.r && c === B_CELL_Q25.c
          const glow = isA || isB
          return (
            <g key={`${r}-${c}`}>
              <rect
                x={x}
                y={y}
                width={GRID_CELL}
                height={GRID_CELL}
                fill={glow ? GREEN_FILL : 'white'}
                stroke={glow ? GREEN_GLOW : INK}
                strokeWidth={glow ? 3.5 : 2}
              />
              <text
                x={x + GRID_CELL / 2}
                y={y + GRID_CELL / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={22}
                fontWeight={800}
                fill={glow ? '#065F46' : INK}
                className="font-display"
              >
                {value}
              </text>
              {glow && (
                <text
                  x={x + GRID_CELL - 6}
                  y={y + 9}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={11}
                  fontWeight={900}
                  fontStyle="italic"
                  fill={GREEN_GLOW}
                  className="font-display"
                >
                  {isA ? 'A' : 'B'}
                </text>
              )}
            </g>
          )
        }),
      )}
    </g>
  )
}

// ---------------------------------------------------------------------------
// Full static figure: 5 pieces in a row, a down-arrow, the completed grid.
// ---------------------------------------------------------------------------

const VIEW_W = 560
const VIEW_H = 420

// X-origins of the 5 pieces along the top band (each origin = (0,0) cell corner).
const PIECE_ORIGINS_X = [20, 150, 250, 360, 470]
const PIECE_BAND_Y = 18

const ARROW_Y = 132

const GRID_W = 4 * GRID_CELL // 168
const GRID_OX = (VIEW_W - GRID_W) / 2 // centered
const GRID_OY = 200

function DownArrow({ cx, top }: { cx: number; top: number }) {
  const w = 18
  const stemH = 22
  const headH = 16
  return (
    <g fill={INK}>
      <rect x={cx - w / 2} y={top} width={w} height={stemH} />
      <polygon
        points={`${cx - w},${top + stemH} ${cx + w},${top + stemH} ${cx},${top + stemH + headH}`}
      />
    </g>
  )
}

export interface TilingFigureQ25Props {
  glowA?: boolean
  glowB?: boolean
}

/** The whole problem: 5 pieces, arrow, completed grid. Shared by the explainer. */
export function TilingFigureQ25({ glowA = false, glowB = false }: TilingFigureQ25Props) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 440, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {PIECES_Q25.map((piece, i) => (
        <PieceFigure key={i} piece={piece} ox={PIECE_ORIGINS_X[i]} oy={PIECE_BAND_Y} />
      ))}

      <DownArrow cx={VIEW_W / 2} top={ARROW_Y} />

      <TileGridQ25 glowA={glowA} glowB={glowB} ox={GRID_OX} oy={GRID_OY} />
    </svg>
  )
}

export default function P21G2Q25Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Five small numbered pieces (two cells shaded green and labelled A and B), a downward arrow, then the completed 4 by 4 square reading 4 1 3 2, 3 2 4 1, 2 4 1 3, 1 3 2 4."
    >
      <TilingFigureQ25 />
    </div>
  )
}
