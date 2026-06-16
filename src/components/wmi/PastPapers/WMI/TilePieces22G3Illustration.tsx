// Tile-pieces puzzle for WMI-22F3A-Q20.
//
// Source figure: db/seed/wmi/figures/2022-final-g3-a-q20.jpg
// A row of five pieces: one red 1×1 square (leftmost) then four orange 2×1
// rectangles. The question asks how many distinct ways a 3×3 grid can be tiled
// with exactly one 1×1 square and four 2×1 dominoes (answer = 6, rotations
// counted as the same).
//
// This file draws ONLY the problem (the five piece shapes) — never the answer.
// The Tiling3x3 primitive is co-exported so the animator can render each of
// the 6 distinct tilings.

// ---------------------------------------------------------------------------
// Tiling3x3 primitive — reusable by the animator
// ---------------------------------------------------------------------------

/** A cell coordinate in the 3×3 grid (0-indexed row and col, 0..2). */
export type Cell = [row: number, col: number]

/**
 * A domino placement: exactly two adjacent cells the 2×1 piece covers.
 * The two cells must share an edge (horizontally or vertically adjacent).
 */
export type DominoPlacement = [Cell, Cell]

/** Complete description of one 3×3 tiling. */
export interface TilingDescription {
  /** The single cell covered by the 1×1 mono piece. */
  monoCell: Cell
  /** Four domino placements covering the remaining 8 cells. */
  dominoes: [DominoPlacement, DominoPlacement, DominoPlacement, DominoPlacement]
}

// Design tokens for the tiling renderer (same palette as the pieces).
const TILING_CELL = 44          // cell size in SVG user units
const TILING_STROKE = '#1F2937' // outline
const MONO_FILL = '#DC2626'     // red — matches the 1×1 piece
const DOMINO_FILL = '#F0853A'   // orange — matches the 2×1 pieces
const DOMINO_STROKE = '#C96B20' // slightly darker orange border on dominoes
const GRID_FILL = '#FFFFFF'

/**
 * Tiling3x3 — renders one valid tiling of a 3×3 grid.
 *
 * The grid is drawn as a 3×3 array of cells. The mono cell is filled red,
 * dominoes are drawn as orange rounded rectangles overlaid on the grid cells.
 *
 * Pure function — SSR-safe, no hooks.
 *
 * @param tiling  - Description of which cell is mono and where each domino sits.
 * @param cellSize - SVG user units per grid cell (default 44).
 * @param x        - SVG x offset for the whole group (default 0).
 * @param y        - SVG y offset for the whole group (default 0).
 */
export function Tiling3x3({
  tiling,
  cellSize = TILING_CELL,
  x = 0,
  y = 0,
}: {
  tiling: TilingDescription
  cellSize?: number
  x?: number
  y?: number
}) {
  const gridSize = cellSize * 3

  // Build a set of mono cell keys for quick lookup.
  const monoKey = `${tiling.monoCell[0]},${tiling.monoCell[1]}`

  // Draw the 9 background cells first.
  const cells: JSX.Element[] = []
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const isMono = `${r},${c}` === monoKey
      cells.push(
        <rect
          key={`cell-${r}-${c}`}
          x={x + c * cellSize}
          y={y + r * cellSize}
          width={cellSize}
          height={cellSize}
          fill={isMono ? MONO_FILL : GRID_FILL}
          stroke={TILING_STROKE}
          strokeWidth={1.5}
        />,
      )
    }
  }

  // Draw the four dominoes on top as rounded orange rectangles.
  const dominos: JSX.Element[] = tiling.dominoes.map(([[r1, c1], [r2, c2]], i) => {
    const isHorizontal = r1 === r2
    const minR = Math.min(r1, r2)
    const minC = Math.min(c1, c2)
    const rx = x + minC * cellSize + 3
    const ry = y + minR * cellSize + 3
    const w = isHorizontal ? cellSize * 2 - 6 : cellSize - 6
    const h = isHorizontal ? cellSize - 6 : cellSize * 2 - 6
    return (
      <rect
        key={`dom-${i}`}
        x={rx}
        y={ry}
        width={w}
        height={h}
        rx={6}
        ry={6}
        fill={DOMINO_FILL}
        stroke={DOMINO_STROKE}
        strokeWidth={2}
      />
    )
  })

  // Outer grid border on top.
  const border = (
    <rect
      x={x}
      y={y}
      width={gridSize}
      height={gridSize}
      fill="none"
      stroke={TILING_STROKE}
      strokeWidth={2.5}
    />
  )

  return (
    <g>
      {cells}
      {dominos}
      {border}
    </g>
  )
}

// ---------------------------------------------------------------------------
// In-card illustration — the five pieces from the scan, drawn faithfully.
// ---------------------------------------------------------------------------

// Layout constants (matches the scanned figure proportions).
const PIECE_PAD = 14      // outer padding around the row
const PIECE_GAP = 20      // horizontal gap between pieces
const UNIT = 46           // one grid-unit in SVG user units

// The 1×1 piece.
const MONO_W = UNIT
const MONO_H = UNIT

// The 2×1 pieces (wider than tall — the scan shows landscape orientation).
const DOM_W = UNIT * 2
const DOM_H = UNIT

const PIECE_H = UNIT      // all pieces share the same height
const TOTAL_PIECE_W =
  MONO_W + DOM_W * 4 + PIECE_GAP * 4   // one mono + four dominoes + gaps between them
const VIEW_W = PIECE_PAD * 2 + TOTAL_PIECE_W
const VIEW_H = PIECE_PAD * 2 + PIECE_H

// Precompute x positions for each piece.
const PIECE_Y = PIECE_PAD
const MONO_X = PIECE_PAD
const DOM_STARTS: number[] = []
for (let i = 0; i < 4; i++) {
  DOM_STARTS.push(MONO_X + MONO_W + PIECE_GAP + i * (DOM_W + PIECE_GAP))
}

const OUTLINE_COLOR = '#1F2937'
const RED_FILL = '#DC2626'
const ORANGE_FILL = '#F0853A'
const ORANGE_STROKE = '#C96B20'

/**
 * TilePieces22G3Illustration — in-card SVG for WMI-22F3A-Q20.
 *
 * Draws the five available pieces:
 *   • one 1×1 red square (the mono piece)
 *   • four 2×1 orange rectangles (the domino pieces)
 *
 * Draws ONLY the problem setup (available pieces); never shows a tiling solution.
 *
 * Pure function — SSR-safe, no hooks, no random, no Date.
 */
export default function TilePieces22G3Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Lima potongan ubin: satu persegi merah berukuran 1×1 dan empat persegi panjang oranye berukuran 2×1. Berapa cara berbeda mengisi kotak 3×3 dengan tepat satu potongan 1×1 dan empat potongan 2×1?"
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width={Math.min(360, VIEW_W)}
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        {/* 1×1 red square */}
        <rect
          x={MONO_X}
          y={PIECE_Y}
          width={MONO_W}
          height={MONO_H}
          rx={4}
          ry={4}
          fill={RED_FILL}
          stroke={OUTLINE_COLOR}
          strokeWidth={2.5}
        />

        {/* four 2×1 orange rectangles */}
        {DOM_STARTS.map((dx, i) => (
          <rect
            key={`dom-${i}`}
            x={dx}
            y={PIECE_Y}
            width={DOM_W}
            height={DOM_H}
            rx={4}
            ry={4}
            fill={ORANGE_FILL}
            stroke={ORANGE_STROKE}
            strokeWidth={2.5}
          />
        ))}
      </svg>
    </div>
  )
}
