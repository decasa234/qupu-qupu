/**
 * SEAMO-16-A-Q7 — "How many tiles do you need to cover the area shown below?"
 *
 * Stem figure (2016.imgs/005.jpg):
 *   LEFT  — a 4×4 checkerboard area (alternating teal / red cells).
 *   RIGHT — the tile shape: a T-hexomino outline (2 cells wide on top, 4 cells
 *           wide on the bottom; the "T" points up).
 *
 * Answer: A = 2 tiles.
 *
 * The STEM shows ONLY the problem: the area to be covered + the tile shape.
 * It does NOT show how the tiles fit or reveal the count.
 *
 * Primitives used:
 *   GridBoard (from ./primitives/GridBoard) — renders the 4×4 checkerboard.
 *   Custom T-hexomino path — drawn inline (simple enough not to need Polyomino).
 *
 * Pure SVG — no hooks, no framer-motion, no Math.random, no window/document.
 * SSR-safe and deterministic.
 */

import { GridBoard } from './primitives/GridBoard'

// ── colour tokens ─────────────────────────────────────────────────────────────

const COLOR = {
  TEAL:       '#4DB6AC',   // checkerboard cell A (teal)
  RED:        '#E57373',   // checkerboard cell B (red/coral)
  TILE_FILL:  '#FFFFFF',   // tile interior — white (outline style, matching paper)
  TILE_STROKE:'#1F2937',   // tile border — near-black
  LABEL:      '#E57373',   // "Tile" text — matches paper's red label
  BG:         '#FFFFFF',   // SVG background
} as const

// ── layout constants ──────────────────────────────────────────────────────────

/** Cell size for the checkerboard (px). */
const CELL = 36

/** Number of rows / cols in the checkerboard. */
const GRID_ROWS = 4
const GRID_COLS = 4

/**
 * Cell size used to draw the T-hexomino tile illustration (px).
 * Slightly larger than CELL so the tile reads clearly next to the board.
 */
const TILE_CELL = 30

/** Padding around the SVG content. */
const PAD = 12

/** Horizontal gap between the checkerboard and the tile diagram. */
const GAP = 32

// ── derived layout values ─────────────────────────────────────────────────────

/** Total width of the checkerboard area. */
const BOARD_W = GRID_COLS * CELL
/** Total height of the checkerboard area. */
const BOARD_H = GRID_ROWS * CELL

/**
 * T-hexomino tile: two cells wide on the top (centred), four cells wide at the
 * bottom — i.e., cells [row=0, col=1], [row=0, col=2], [row=1, col=0..3].
 *
 * Drawn as a single polygon path to give a clean solid outline.
 *
 * In tile-cell coordinates (each unit = TILE_CELL px):
 *
 *   column:  0    1    2    3    4
 *   row 0:   +----+----+----+----+
 *                  +----+----+
 *                  |   bump   |
 *             -----+    +-----
 *   row 1:   |              |
 *            |  full bar     |
 *   row 2:   +----+----+----+----+  (actually only 2 rows: row0=bump, row1=bar)
 *
 * Polygon corner points (going clockwise from top-left of bump):
 *   (1,0) → (3,0) → (3,1) → (4,1) → (4,2) → (0,2) → (0,1) → (1,1) → (1,0)
 *
 * In px (multiply each by TILE_CELL):
 */
function tilePoints(ox: number, oy: number): string {
  const s = TILE_CELL
  const pts: [number, number][] = [
    [1, 0], // top-left of bump
    [3, 0], // top-right of bump
    [3, 1], // inner-right corner (bump meets full bar)
    [4, 1], // bottom-right of full bar (outer)
    [4, 2], // bottom-right
    [0, 2], // bottom-left
    [0, 1], // top-left of full bar (outer)
    [1, 1], // inner-left corner (bump meets full bar)
  ]
  return pts.map(([cx, cy]) => `${ox + cx * s},${oy + cy * s}`).join(' ')
}

/** Total pixel size of the T-hexomino bounding box. */
const TILE_W = 4 * TILE_CELL
const TILE_H = 2 * TILE_CELL

// ── SVG dimensions ────────────────────────────────────────────────────────────

const SVG_W = PAD + BOARD_W + GAP + TILE_W + PAD
const SVG_H = PAD + Math.max(BOARD_H, TILE_H + 20 /* label */) + PAD

// ── positions ─────────────────────────────────────────────────────────────────

/** Top-left corner of the checkerboard in SVG coords. */
const BOARD_X = PAD
const BOARD_Y = PAD + (SVG_H - PAD * 2 - BOARD_H) / 2   // vertically centred

/** Top-left corner of the tile diagram in SVG coords. */
const TILE_X = PAD + BOARD_W + GAP
const TILE_Y = PAD + (SVG_H - PAD * 2 - TILE_H - 20) / 2 // centred above label

// ── GridBoard fill function ───────────────────────────────────────────────────

/** Checkerboard fill: (r+c) even → teal, odd → red. */
function checkerFill(r: number, c: number): string {
  return (r + c) % 2 === 0 ? COLOR.TEAL : COLOR.RED
}

// ── Co-export: the T-hexomino primitive for the explainer ─────────────────────

/**
 * THexomino — standalone SVG of the T-shaped tile for use in the explainer.
 * Origin is at (ox, oy) in the caller's coordinate system (default 0,0).
 */
export function THexomino({
  ox = 0,
  oy = 0,
  fill = COLOR.TILE_FILL,
  stroke = COLOR.TILE_STROKE,
  strokeWidth = 2,
}: {
  ox?: number
  oy?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
}) {
  return (
    <polygon
      points={tilePoints(ox, oy)}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  )
}

/** The cell size used in THexomino. Re-export for the explainer. */
export const TILE_CELL_SIZE = TILE_CELL

// ── Default export: stem illustration ────────────────────────────────────────

/**
 * TileArea16A7Illustration
 *
 * Stem figure for SEAMO-16-A-Q7.
 * Shows the 4×4 checkerboard area and the T-hexomino tile shape.
 * Does NOT reveal the answer (2 tiles) or show how they fit.
 */
export default function TileArea16A7Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Area kotak-kotak 4×4 dengan warna bergantian biru-hijau dan merah, ' +
        'di sebelahnya terdapat bentuk ubin T yang perlu digunakan untuk menutup area tersebut.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(360, SVG_W)}
        style={{ display: 'block' }}
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />

        {/* ── Checkerboard area ── */}
        <g transform={`translate(${BOARD_X}, ${BOARD_Y})`}>
          <GridBoard
            rows={GRID_ROWS}
            cols={GRID_COLS}
            cellSize={CELL}
            fill={checkerFill}
          />
        </g>

        {/* ── T-hexomino tile shape (outline) ── */}
        <THexomino
          ox={TILE_X}
          oy={TILE_Y}
          fill={COLOR.TILE_FILL}
          stroke={COLOR.TILE_STROKE}
          strokeWidth={2.5}
        />

        {/* ── "Tile" label below the tile ── */}
        <text
          x={TILE_X + TILE_W / 2}
          y={TILE_Y + TILE_H + 16}
          textAnchor="middle"
          dominantBaseline="auto"
          fontSize={13}
          fontWeight={700}
          fill={COLOR.LABEL}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          Tile
        </text>
      </svg>
    </div>
  )
}
