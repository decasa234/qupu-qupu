// IKMC-19-PE-Q23 — "Here are nine squares..."
//
// PROBLEM ONLY: shows the static starting 3×3→actually 1×9 strip the student sees:
//   Black, Grey, White, Grey, White, White, Grey, Black, White
//
// Does NOT show the answer or the swaps.
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── shared layout constants (re-exported so the explainer can overlay in the same coords) ──────

/** Total SVG width. */
export const SVG_W = 300

/** Total SVG height. */
export const SVG_H = 80

/** Size of each square cell. */
export const CELL_SIZE = 28

/** Gap between cells. */
export const CELL_GAP = 4

/** Y offset for the grid strip (centred vertically). */
export const GRID_Y = (SVG_H - CELL_SIZE) / 2

/** X offset for the left edge of the first cell (centred horizontally). */
export const GRID_X = (SVG_W - 9 * CELL_SIZE - 8 * CELL_GAP) / 2

/** Colour tokens. */
export const COLOR = {
  BLACK_FILL: '#1C1917',
  GREY_FILL: '#9CA3AF',
  WHITE_FILL: '#FFFFFF',
  CELL_STROKE: '#6B7280',
} as const

// ── Cell primitive ────────────────────────────────────────────────────────────

/**
 * A single square cell.
 * `col` is 0-based index (0–8).
 */
export function GridCell({ col, fill }: { col: number; fill: string }) {
  const x = GRID_X + col * (CELL_SIZE + CELL_GAP)
  return (
    <rect
      x={x}
      y={GRID_Y}
      width={CELL_SIZE}
      height={CELL_SIZE}
      fill={fill}
      stroke={COLOR.CELL_STROKE}
      strokeWidth={1.5}
      rx={2}
    />
  )
}

/** Map a CellColor name to its SVG fill value. */
export function colorToFill(c: 'black' | 'grey' | 'white'): string {
  if (c === 'black') return COLOR.BLACK_FILL
  if (c === 'grey') return COLOR.GREY_FILL
  return COLOR.WHITE_FILL
}

// ── Grid strip primitive ──────────────────────────────────────────────────────

/**
 * A horizontal strip of 9 coloured cells.
 * `cells` is an array of 9 color names.
 */
export function GridStrip({ cells }: { cells: Array<'black' | 'grey' | 'white'> }) {
  return (
    <g>
      {cells.map((c, i) => (
        <GridCell key={i} col={i} fill={colorToFill(c)} />
      ))}
    </g>
  )
}

// ── Default export ────────────────────────────────────────────────────────────

/**
 * ColorSwap23Illustration
 *
 * Static, problem-only figure for IKMC-19-PE-Q23.
 * Shows the starting 9-square horizontal strip:
 *   Black, Grey, White, Grey, White, White, Grey, Black, White
 * Does NOT reveal the swaps or the answer.
 */
export default function ColorSwap23Illustration() {
  const cells: Array<'black' | 'grey' | 'white'> = [
    'black', 'grey', 'white', 'grey', 'white', 'white', 'grey', 'black', 'white',
  ]

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Nine squares in a row: black, grey, white, grey, white, white, grey, black, white.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(320, SVG_W)}
        style={{ display: 'block' }}
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* the nine starting squares */}
        <GridStrip cells={cells} />
      </svg>
    </div>
  )
}
