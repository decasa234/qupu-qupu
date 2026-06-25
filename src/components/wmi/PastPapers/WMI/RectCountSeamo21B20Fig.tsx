// RectCountSeamo21B20Fig — SEAMO 2021 Paper B Q20
// "How many rectangles are there in the figure?"
//
// Source figure (2021.imgs/007.jpg): an L-shaped arrangement of unit squares.
//   – Top section: 2 columns × 3 rows (upper-left block, rows 0-2, cols 0-1)
//   – Bottom row:  6 columns × 1 row  (row 3, cols 0-5)
//
// The two sub-regions share the left 2 columns at row 3.
// Total unit squares = 2×3 + 6×1 = 12.  Total rectangles = 24 (answer B).
//
// Classification: STEM (figure in question stem; answer choices are numbers)
//
// Pure SVG, SSR-safe — no React hooks, no framer-motion, no window/document.

// ── Layout constants ──────────────────────────────────────────────────────────

const CELL = 44       // side length of each unit square (px)
const PAD  = 12       // outer padding

// Grid dimensions:
//   Top block:   2 cols × 3 rows  (rows 0-2, cols 0-1)
//   Bottom row:  6 cols × 1 row   (row 3,   cols 0-5)
const TOP_COLS   = 2
const TOP_ROWS   = 3
const BOT_COLS   = 6
const TOTAL_ROWS = TOP_ROWS + 1   // 4

const GRID_W = BOT_COLS * CELL    // 264 — widest part
const GRID_H = TOTAL_ROWS * CELL  // 176

const SVG_W = GRID_W + PAD * 2
const SVG_H = GRID_H + PAD * 2

// ── Colour tokens ─────────────────────────────────────────────────────────────

const CELL_FILL   = '#FFFBF0'
const GRID_STROKE = '#374151'
const SW          = 1.5

// ── Helpers ───────────────────────────────────────────────────────────────────

function px(col: number, row: number): [number, number] {
  return [PAD + col * CELL, PAD + row * CELL]
}

// ── L-shaped outer boundary path ──────────────────────────────────────────────
//
// Traced clockwise (grid units) then converted to px:
//   (0,0) → (TOP_COLS,0) → (TOP_COLS,TOP_ROWS) →
//   (BOT_COLS,TOP_ROWS) → (BOT_COLS,TOTAL_ROWS) → (0,TOTAL_ROWS) → close

function lShapePath(): string {
  const corners: [number, number][] = [
    px(0,        0),
    px(TOP_COLS, 0),
    px(TOP_COLS, TOP_ROWS),
    px(BOT_COLS, TOP_ROWS),
    px(BOT_COLS, TOTAL_ROWS),
    px(0,        TOTAL_ROWS),
  ]
  const d = corners
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`)
    .join(' ')
  return `${d} Z`
}

// ── Grid sub-region: background fills ────────────────────────────────────────

function CellFills() {
  const rects: { col: number; row: number }[] = []
  for (let row = 0; row < TOP_ROWS; row++) {
    for (let col = 0; col < TOP_COLS; col++) rects.push({ col, row })
  }
  for (let col = 0; col < BOT_COLS; col++) {
    rects.push({ col, row: TOP_ROWS })
  }
  return (
    <>
      {rects.map(({ col, row }) => {
        const [x, y] = px(col, row)
        return (
          <rect
            key={`c-${col}-${row}`}
            x={x}
            y={y}
            width={CELL}
            height={CELL}
            fill={CELL_FILL}
          />
        )
      })}
    </>
  )
}

// ── Internal grid lines ───────────────────────────────────────────────────────
//
// Horizontal:
//   – Rows 1 and 2 inside the top block (cols 0 → TOP_COLS)
//   – Row TOP_ROWS between top block and bottom row (cols 0 → TOP_COLS only)
//     (This is the horizontal segment of the inner L notch)
//
// Vertical:
//   – Col 1 full height of top block (rows 0 → TOP_ROWS)
//   – Cols 2-5 only in the bottom row (rows TOP_ROWS → TOTAL_ROWS)

function GridLines() {
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = []

  // Horizontal lines inside top block (interior rows 1, 2 + shared bottom edge)
  for (let row = 1; row <= TOP_ROWS; row++) {
    const [x1, y1] = px(0,        row)
    const [x2]     = px(TOP_COLS, row)
    lines.push({ x1, y1, x2, y2: y1 })
  }

  // Vertical line col=1, spanning full top block height (rows 0 → TOP_ROWS)
  {
    const [x1, y1] = px(1, 0)
    const [,   y2] = px(1, TOP_ROWS)
    lines.push({ x1, y1, x2: x1, y2 })
  }

  // Vertical lines cols 2-5, bottom row only (rows TOP_ROWS → TOTAL_ROWS)
  for (let col = 2; col < BOT_COLS; col++) {
    const [x1, y1] = px(col, TOP_ROWS)
    const [,   y2] = px(col, TOTAL_ROWS)
    lines.push({ x1, y1, x2: x1, y2 })
  }

  return (
    <>
      {lines.map((ln, i) => (
        <line
          key={`l-${i}`}
          x1={ln.x1}
          y1={ln.y1}
          x2={ln.x2}
          y2={ln.y2}
          stroke={GRID_STROKE}
          strokeWidth={SW}
        />
      ))}
    </>
  )
}

// ── Default export — static illustration ──────────────────────────────────────

export default function RectCountSeamo21B20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'An L-shaped arrangement of unit squares. ' +
        'The top-left section is 2 columns wide and 3 rows tall. ' +
        'A bottom row of 6 squares completes the L shape. ' +
        'Count all rectangles including those spanning multiple cells. ' +
        'The total is 24 rectangles (answer B).'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={SVG_W}
        height={SVG_H}
        aria-hidden="true"
        style={{ display: 'block', maxWidth: '100%' }}
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#FFFFFF" />
        <CellFills />
        <GridLines />
        {/* L-shaped outer boundary */}
        <path
          d={lShapePath()}
          fill="none"
          stroke={GRID_STROKE}
          strokeWidth={SW * 1.5}
          strokeLinejoin="miter"
        />
      </svg>
    </div>
  )
}

// ── Registry entry (paste into registry.ts — do NOT edit here) ───────────────
//
//   'SEAMO-21-B-Q20': {
//     type: 'stem',
//     illustration: () => import('./RectCountSeamo21B20Fig'),
//   },
