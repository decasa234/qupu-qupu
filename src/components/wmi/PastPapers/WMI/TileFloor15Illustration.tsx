// IKMC-19-PE-Q15 — "A floor is covered with identical rectangular tiles."
//
// PROBLEM ONLY (stem illustration): shows the tile layout as given in the paper.
// The short side of each tile is 1 m. The "?" marks one side of the floor.
// Does NOT reveal the answer (12 m) or the tile's long side (3 m).
//
// Geometry rationale:
//   The cross-tiling pattern shows tiles in alternating orientations.
//   Where a column of 3 horizontal tiles (each 1 m tall) sits beside a vertical
//   tile (3 m tall), the long side of the tile = 3 × short side = 3 × 1 m = 3 m.
//   The "?" side has 4 vertical tiles stacked: 4 × 3 m = 12 m (answer E).
//
//   SVG scale: 1 m → 20 px  →  short = 20 px, long = 60 px.
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── layout constants (re-exported for the explainer overlay) ─────────────────

export const SVG_W = 260
export const SVG_H = 280

/** px per metre. */
export const PX_PER_M = 20

/** Short side of one tile in px. */
export const SHORT = 20    // 1 m

/** Long side of one tile in px. */
export const LONG = 60     // 3 m

/** Left padding before the tile grid. */
export const GRID_X = 30

/** Top padding above the tile grid. */
export const GRID_Y = 20

/**
 * The floor has 4 columns × 4 rows of tile "cells".
 * Each cell is LONG × SHORT (vertical orientation) OR SHORT × LONG (horizontal).
 *
 * Layout:
 *   Column A (x 0..59): 4 vertical tiles (60 px wide, 20 px tall each)
 *     — wait, we need a pattern that shows the cross-tiling clearly.
 *
 * Actual layout (columns of alternating orientation):
 *   Columns 0 & 2: vertical tiles (SHORT wide, LONG tall) — 1 m × 3 m upright
 *   Columns 1 & 3: horizontal tiles (LONG wide, SHORT tall) — 3 m × 1 m lying
 *
 * This gives a 4-wide × 4-tall repeating tile strip.
 *
 * BUT for the "?" to equal 12 m on the vertical side, the vertical side must
 * span tiles whose heights add to 12 m.  We arrange:
 *   4 vertical tiles along the left edge (each LONG = 3 m tall) → total 12 m.
 *   Adjacent horizontal tiles (each SHORT = 1 m tall) nest in between,
 *   fitting exactly 3 per vertical tile's height (3 × 1 m = 3 m = 1 long).
 *
 * Concrete tile grid (col, row indexing; each visual "slot" is SHORT × SHORT):
 *
 *   The floor is 4 tile-columns wide × 4 tile-rows tall, where each
 *   "tile row" is LONG px tall = 60 px.
 *
 *   Left two columns:
 *     col 0: single vertical tile, SHORT wide (20 px), LONG tall (60 px)
 *     col 1: three horizontal tiles stacked, LONG wide (60 px), SHORT tall (20 px)
 *
 *   This 80 px × 60 px block tiles the floor repeatedly.
 *   4 blocks tall → total height = 4 × 60 = 240 px = 12 m ✓
 *   3 blocks wide (each 80 px) → total width = 240 px = 12 m (square floor)
 *
 * For visual clarity we show 2 column-groups wide (160 px) × 4 rows tall (240 px).
 * The "?" label appears on the left side (vertical, 240 px = 12 m).
 */

/** Width of one repeating column group: SHORT + LONG = 20 + 60 = 80 px. */
export const GROUP_W = SHORT + LONG   // 80 px = 4 m

/** Height of one tile row (= LONG, the tall dimension of one vertical tile). */
export const ROW_H = LONG             // 60 px = 3 m

/** Number of column groups shown. */
export const N_COL_GROUPS = 2         // 2 × 4 m = 8 m wide

/** Number of tile rows shown. */
export const N_ROWS = 4               // 4 × 3 m = 12 m tall

/** Total grid width in px. */
export const GRID_W = N_COL_GROUPS * GROUP_W   // 160 px

/** Total grid height in px = the "?" side. */
export const GRID_H = N_ROWS * ROW_H           // 240 px = 12 m

/** Colour tokens. */
export const COLOR = {
  TILE_FILL: '#FDE68A',        // warm sand — not orange (paper tiles are plain)
  TILE_STROKE: '#92400E',
  FLOOR_BG: '#F9F3E3',
  LABEL: '#1F2937',
  BRACKET: '#30598A',
  SHORT_LABEL: '#0F4C81',
  Q_MARK: '#30598A',
} as const

// ── Tile primitives ──────────────────────────────────────────────────────────

/** Vertical tile: SHORT wide, LONG tall. */
export function VerticalTile({ x, y }: { x: number; y: number }) {
  return (
    <rect
      x={x}
      y={y}
      width={SHORT}
      height={LONG}
      fill={COLOR.TILE_FILL}
      stroke={COLOR.TILE_STROKE}
      strokeWidth={1.2}
    />
  )
}

/** Horizontal tile: LONG wide, SHORT tall. */
export function HorizontalTile({ x, y }: { x: number; y: number }) {
  return (
    <rect
      x={x}
      y={y}
      width={LONG}
      height={SHORT}
      fill={COLOR.TILE_FILL}
      stroke={COLOR.TILE_STROKE}
      strokeWidth={1.2}
    />
  )
}

// ── Floor grid primitive (re-used by the explainer) ──────────────────────────

/**
 * TileFloorPrimitive — draws the full tile grid without overlays.
 * The origin is (GRID_X, GRID_Y) in SVG coords.
 */
export function TileFloorPrimitive() {
  const tiles: React.ReactElement[] = []

  for (let row = 0; row < N_ROWS; row++) {
    const rowY = GRID_Y + row * ROW_H
    for (let g = 0; g < N_COL_GROUPS; g++) {
      const gx = GRID_X + g * GROUP_W

      // Left slot of group: one vertical tile
      tiles.push(
        <VerticalTile key={`v-${row}-${g}`} x={gx} y={rowY} />,
      )

      // Right slot of group: three stacked horizontal tiles (filling LONG height)
      for (let h = 0; h < 3; h++) {
        tiles.push(
          <HorizontalTile
            key={`h-${row}-${g}-${h}`}
            x={gx + SHORT}
            y={rowY + h * SHORT}
          />,
        )
      }
    }
  }

  return <g>{tiles}</g>
}

// ── Short-side label (shows "1 m" on one tile's short side) ─────────────────

/**
 * A small bracket + "1 m" label on the short side of the first vertical tile.
 */
function ShortSideLabel() {
  // Label along the top of the first vertical tile (width = SHORT = 20 px = 1 m)
  const tileX = GRID_X
  const tileY = GRID_Y
  const midX = tileX + SHORT / 2
  const labelY = tileY - 8
  const tick = 4

  return (
    <g fill="none" stroke={COLOR.SHORT_LABEL} strokeWidth={1.2} strokeLinecap="round">
      {/* horizontal bar */}
      <line x1={tileX} y1={labelY} x2={tileX + SHORT} y2={labelY} />
      {/* end ticks */}
      <line x1={tileX} y1={labelY - tick} x2={tileX} y2={labelY + tick} />
      <line x1={tileX + SHORT} y1={labelY - tick} x2={tileX + SHORT} y2={labelY + tick} />
      {/* label */}
      <text
        x={midX}
        y={labelY - 5}
        textAnchor="middle"
        dominantBaseline="auto"
        fontSize={10}
        fontWeight={700}
        fill={COLOR.SHORT_LABEL}
        stroke="none"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        1 m
      </text>
    </g>
  )
}

// ── Question-mark side label ─────────────────────────────────────────────────

/**
 * Bracket + "?" on the left side of the grid (the height = 12 m, unknown).
 */
function QuestionMarkLabel() {
  const x = GRID_X - 18
  const topY = GRID_Y
  const botY = GRID_Y + GRID_H
  const midY = (topY + botY) / 2
  const tick = 5

  return (
    <g fill="none" stroke={COLOR.Q_MARK} strokeWidth={1.5} strokeLinecap="round">
      {/* vertical line */}
      <line x1={x} y1={topY} x2={x} y2={botY} />
      {/* top tick */}
      <line x1={x - tick} y1={topY} x2={x + tick} y2={topY} />
      {/* bottom tick */}
      <line x1={x - tick} y1={botY} x2={x + tick} y2={botY} />
      {/* "?" text */}
      <text
        x={x - 6}
        y={midY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={20}
        fontWeight={900}
        fill={COLOR.Q_MARK}
        stroke="none"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        ?
      </text>
    </g>
  )
}

// ── Default export ───────────────────────────────────────────────────────────

/**
 * TileFloor15Illustration
 *
 * Static stem illustration for IKMC-19-PE-Q15.
 * Shows: the tile floor with alternating vertical and horizontal tiles;
 * "1 m" label on the short side of one tile; "?" bracket on the left side.
 * Does NOT show the tile long side (3 m) or the answer (12 m).
 */
export default function TileFloor15Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Lantai ditutupi ubin persegi panjang identik yang disusun bergantian. ' +
        'Sisi pendek setiap ubin diberi label 1 m. ' +
        'Tanda tanya menandai sisi kiri lantai yang panjangnya tidak diketahui.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(280, SVG_W)}
        style={{ display: 'block' }}
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* floor background */}
        <rect
          x={GRID_X}
          y={GRID_Y}
          width={GRID_W}
          height={GRID_H}
          fill={COLOR.FLOOR_BG}
        />

        {/* tile grid */}
        <TileFloorPrimitive />

        {/* "1 m" short-side label at the top of the first tile */}
        <ShortSideLabel />

        {/* "?" bracket on the left side */}
        <QuestionMarkLabel />
      </svg>
    </div>
  )
}
