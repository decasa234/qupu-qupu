// Seamo18B17Fig — SEAMO 2018 Paper B Q17
// "The diagram below shows a rectangle of length 36 cm. It contains two shaded
//  regions and 7 identical small rectangles. Find the area of one small rectangle."
//
// Answer: C — 144 cm²  (each small rectangle is 12 × 12 cm)
//
// Layout: The outer rectangle is 36 × 36 cm (square), arranged as a 3 × 3 grid of
// equal 12 × 12 cells.  Two corner cells are shaded; the remaining 7 are the
// "identical small rectangles" the question refers to.
//
//   ┌───────┬───────┬▓▓▓▓▓▓▓┐
//   │  R1   │  R2   │ shade │
//   ├───────┼───────┼───────┤
//   │  R3   │  R4   │  R5   │
//   ├───────┼───────┼───────┤
//   │▓▓▓▓▓▓▓│  R6   │  R7   │
//   └───────┴───────┴───────┘
//
// Classification: STEM (figure in question stem; answer choices are numbers)
//
// Pure SVG, SSR-safe — no hooks, no framer-motion, no window/document.

// ── Layout constants ──────────────────────────────────────────────────────────

const CELL_PX  = 72     // 1 cell = 12 cm = 72 px
const N_COLS   = 3
const N_ROWS   = 3

const PAD      = 16     // outer svg padding
const GRID_W   = N_COLS * CELL_PX   // 216 px
const GRID_H   = N_ROWS * CELL_PX   // 216 px
const DIM_GAP  = 24    // space reserved for dimension labels
const SVG_W    = PAD + GRID_W + DIM_GAP + PAD
const SVG_H    = PAD + GRID_H + DIM_GAP + PAD

const GRID_X   = PAD
const GRID_Y   = PAD

// ── Colours ───────────────────────────────────────────────────────────────────

const SHADE_FILL = '#5EEAD4'   // teal-300 — matches the image
const RECT_FILL  = '#FEF9EF'   // warm off-white for small rects
const STROKE_CLR = '#374151'   // border
const DIM_CLR    = '#2563EB'   // dimension label blue
const BG_CLR     = '#FFFBF0'   // card background

// ── Shaded cells: top-right (r=0,c=2) and bottom-left (r=2,c=0) ──────────────

function isShaded(row: number, col: number): boolean {
  return (row === 0 && col === 2) || (row === 2 && col === 0)
}

// ── Figure (reusable by explainer) ───────────────────────────────────────────

export interface Seamo18B17FigureProps {
  /** Highlight one of the 7 small rects (0-based, in reading order skipping shaded). */
  highlightRect?: number | null
  /** Overlay "144 cm²" label inside the first small rect. */
  showArea?: boolean
}

export function Seamo18B17Figure({
  highlightRect = null,
  showArea      = false,
}: Seamo18B17FigureProps) {
  // Build ordered list of non-shaded cells for highlight indexing.
  const smallCells: Array<{ row: number; col: number }> = []
  for (let r = 0; r < N_ROWS; r++) {
    for (let c = 0; c < N_COLS; c++) {
      if (!isShaded(r, c)) smallCells.push({ row: r, col: c })
    }
  }
  // smallCells.length === 7 ✓

  const cellX = (col: number) => GRID_X + col * CELL_PX
  const cellY = (row: number) => GRID_Y + row * CELL_PX

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Arrow markers for dimension lines */}
      <defs>
        <marker id="b17-arr-e" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill={DIM_CLR} />
        </marker>
        <marker id="b17-arr-w" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto-start-reverse">
          <path d="M0,0 L0,6 L6,3 z" fill={DIM_CLR} />
        </marker>
      </defs>

      <rect width={SVG_W} height={SVG_H} fill={BG_CLR} rx={8} />

      {/* Grid cells */}
      {Array.from({ length: N_ROWS }, (_, r) =>
        Array.from({ length: N_COLS }, (_, c) => {
          const shaded  = isShaded(r, c)
          const cx      = cellX(c)
          const cy      = cellY(r)
          const rectIdx = smallCells.findIndex((sc) => sc.row === r && sc.col === c)
          const hl      = !shaded && highlightRect !== null && rectIdx === highlightRect

          return (
            <g key={`cell-${r}-${c}`}>
              <rect
                x={cx} y={cy}
                width={CELL_PX} height={CELL_PX}
                fill={
                  shaded
                    ? SHADE_FILL
                    : hl
                      ? 'rgba(37,99,235,0.15)'
                      : RECT_FILL
                }
                stroke={STROKE_CLR}
                strokeWidth={1.8}
              />

              {/* Area label inside first small rect when explainer reveals it */}
              {showArea && rectIdx === 0 && (
                <text
                  x={cx + CELL_PX / 2}
                  y={cy + CELL_PX / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={12}
                  fontWeight={700}
                  fill={DIM_CLR}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  144 cm²
                </text>
              )}
            </g>
          )
        })
      )}

      {/* Dimension label — bottom side "36 cm" */}
      <line
        x1={GRID_X + 2} y1={GRID_Y + GRID_H + 10}
        x2={GRID_X + GRID_W - 2} y2={GRID_Y + GRID_H + 10}
        stroke={DIM_CLR} strokeWidth={1}
        markerEnd="url(#b17-arr-e)"
        markerStart="url(#b17-arr-w)"
      />
      <text
        x={GRID_X + GRID_W / 2}
        y={GRID_Y + GRID_H + 20}
        textAnchor="middle"
        dominantBaseline="hanging"
        fontSize={12}
        fontWeight={600}
        fill={DIM_CLR}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        36 cm
      </text>

      {/* Dimension label — right side "36 cm" */}
      <line
        x1={GRID_X + GRID_W + 10} y1={GRID_Y + 2}
        x2={GRID_X + GRID_W + 10} y2={GRID_Y + GRID_H - 2}
        stroke={DIM_CLR} strokeWidth={1}
        markerEnd="url(#b17-arr-e)"
        markerStart="url(#b17-arr-w)"
      />
      <text
        x={GRID_X + GRID_W + 20}
        y={GRID_Y + GRID_H / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
        fill={DIM_CLR}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        transform={`rotate(-90, ${GRID_X + GRID_W + 20}, ${GRID_Y + GRID_H / 2})`}
      >
        36 cm
      </text>
    </svg>
  )
}

// ── Default export — static illustration ─────────────────────────────────────

export default function Seamo18B17Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'A 36 cm square divided into a 3-by-3 grid of equal 12 cm cells. ' +
        'The top-right and bottom-left cells are shaded teal. ' +
        'The remaining 7 cells are the identical small rectangles whose area is to be found.'
      }
    >
      <Seamo18B17Figure />
    </div>
  )
}

// ── VISUALS entry (do NOT paste into registry.ts here — return in report) ─────
//
//   'SEAMO-18-B-Q17': {
//     type: 'stem',
//     illustration: () => import('./Seamo18B17Fig'),
//   },
