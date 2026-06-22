// IKMC-20-PE-Q19 — Bee grid honeycomb illustration
//
// The problem: a flat-top honeycomb grid of 13 hexagons.
// Mark the bee walks only on grey cells. In how many ways can we colour
// exactly 2 white cells grey so he can reach from A to B?
//
// Grid layout (flat-top hexagons, ODD columns shifted DOWN by half hex-height):
//
//   Grey cells:  A(0,1)  G1(1,1)  G2(2,0)  G3(3,2)  G4(4,0)  G5(4,2)  B(5,1)
//   White cells: w1(1,0) w2(2,1)  w3(2,2)  w4(3,0)  w5(3,1)  w6(4,1)
//
// Visual (y positions account for odd-column half-step shift):
//
//   y=0.0:        [G2]        [G4]
//   y=0.5:  [w1]        [w4]
//   y=1.0: [A]   [w2]        [w6]
//   y=1.5:  [G1]        [w5]        [B]
//   y=2.0:        [w3]        [G5]
//   y=2.5:              [G3]
//
// The stem shows the problem only (no valid pairs highlighted).
// The <BeeGrid19PE> primitive accepts optional highlightedCells for the explainer.

// ---- Colours ----------------------------------------------------------------
const GREY_FILL = '#D1D5DB'
const GREY_STROKE = '#6B7280'
const WHITE_FILL = '#FFFFFF'
const WHITE_STROKE = '#D1D5DB'
const HIGHLIGHT_FILL = '#FCD34D'
const HIGHLIGHT_STROKE = '#F59E0B'
const PATH_STROKE = '#F59E0B'
const INK = '#1F2937'
const BEE_BODY = '#FBBF24'
const BEE_STRIPE = '#1F2937'
const BEE_WING = '#BAE6FD'

// ---- Geometry ---------------------------------------------------------------
// Flat-top hexagons: horizontal edges top/bottom, pointed left/right.
// HEX_W = point-to-point width (left-point to right-point).
// HEX_H = flat-to-flat height (top-edge to bottom-edge).
//
// For a regular flat-top hex: HEX_H = HEX_W * sqrt(3)/2
const HEX_W = 52
const HEX_H = 45   // ≈ HEX_W * 0.866
const HSTEP = HEX_W * 0.75     // horizontal centre-to-centre between columns
const VSTEP = HEX_H             // vertical centre-to-centre within a column

// Top-left padding so nothing clips
const PAD_X = 40
const PAD_Y = 30

/**
 * Centre (cx, cy) of hex at (col, row) in the flat-top offset grid.
 * ODD columns are shifted DOWN by HEX_H / 2.
 */
export function hexCentre(col: number, row: number): [number, number] {
  const cx = PAD_X + col * HSTEP
  const cy = PAD_Y + row * VSTEP + (col % 2 === 1 ? VSTEP / 2 : 0)
  return [cx, cy]
}

/** SVG points string for a flat-top hexagon centred at (cx, cy). */
export function hexPoints(cx: number, cy: number): string {
  const hw = HEX_W / 2   // half point-to-point width (left/right tip distance)
  const qw = HEX_W / 4   // quarter = half of the flat-edge horizontal run
  const hh = HEX_H / 2   // half height
  // 6 vertices of a flat-top hexagon, clockwise from right tip:
  const pts: Array<[number, number]> = [
    [cx + hw,  cy      ],   // right tip
    [cx + qw,  cy - hh ],   // top-right
    [cx - qw,  cy - hh ],   // top-left
    [cx - hw,  cy      ],   // left tip
    [cx - qw,  cy + hh ],   // bottom-left
    [cx + qw,  cy + hh ],   // bottom-right
  ]
  return pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
}

// ---- Grid definition --------------------------------------------------------

/** Every hex in the grid: (col, row, isGrey, label) */
type CellDef = { col: number; row: number; grey: boolean; label?: string }

export const GRID_CELLS: CellDef[] = [
  // Grey cells (pre-colored)
  { col: 0, row: 1, grey: true,  label: 'A' },
  { col: 1, row: 1, grey: true  },              // G1
  { col: 2, row: 0, grey: true  },              // G2
  { col: 3, row: 2, grey: true  },              // G3
  { col: 4, row: 0, grey: true  },              // G4
  { col: 4, row: 2, grey: true  },              // G5
  { col: 5, row: 1, grey: true,  label: 'B' },

  // White cells (candidates)
  { col: 1, row: 0, grey: false },   // w1
  { col: 2, row: 1, grey: false },   // w2
  { col: 2, row: 2, grey: false },   // w3 — the bridge cell
  { col: 3, row: 0, grey: false },   // w4
  { col: 3, row: 1, grey: false },   // w5
  { col: 4, row: 1, grey: false },   // w6
]

/** The walking path from A to B through the grey + w3 bridge. */
export const WALK_PATH: Array<[number, number]> = [
  [0, 1],   // A
  [1, 1],   // G1
  [2, 2],   // w3 (bridge)
  [3, 2],   // G3
  [4, 2],   // G5
  [5, 1],   // B
]

// ---- SVG helpers ------------------------------------------------------------

/** Compute viewBox dimensions to fit all 13 hexes. */
function computeViewBox(): { w: number; h: number } {
  let maxX = 0, maxY = 0
  for (const { col, row } of GRID_CELLS) {
    const [cx, cy] = hexCentre(col, row)
    maxX = Math.max(maxX, cx + HEX_W / 2)
    maxY = Math.max(maxY, cy + HEX_H / 2)
  }
  return { w: maxX + PAD_X * 0.5, h: maxY + PAD_Y * 0.5 }
}

const { w: VIEW_W, h: VIEW_H } = computeViewBox()

// ---- Bee glyph (SVG, not emoji) ---------------------------------------------

function BeeGlyph({ cx, cy }: { cx: number; cy: number }) {
  // Simple SVG bee: oval body with stripes, round head, two wings
  const bx = cx
  const by = cy - HEX_H * 0.75   // float above the cell centre
  return (
    <g transform={`translate(${bx},${by})`}>
      {/* wings — light blue ovals, slightly transparent */}
      <ellipse cx={-8} cy={-7} rx={7} ry={5} fill={BEE_WING} stroke="#7DD3FC" strokeWidth={1} opacity={0.85} />
      <ellipse cx={8}  cy={-7} rx={7} ry={5} fill={BEE_WING} stroke="#7DD3FC" strokeWidth={1} opacity={0.85} />
      {/* abdomen — rounded rectangle with stripes */}
      <ellipse cx={0} cy={5} rx={6} ry={8} fill={BEE_BODY} stroke={BEE_STRIPE} strokeWidth={1} />
      {/* stripes on abdomen */}
      <rect x={-6} y={2}  width={12} height={2.5} fill={BEE_STRIPE} rx={1} />
      <rect x={-6} y={6}  width={12} height={2.5} fill={BEE_STRIPE} rx={1} />
      {/* thorax */}
      <ellipse cx={0} cy={-3} rx={5} ry={4} fill={BEE_BODY} stroke={BEE_STRIPE} strokeWidth={1} />
      {/* head */}
      <circle cx={0} cy={-10} r={4} fill={BEE_BODY} stroke={BEE_STRIPE} strokeWidth={1} />
      {/* eyes */}
      <circle cx={-2} cy={-11} r={1} fill={BEE_STRIPE} />
      <circle cx={2}  cy={-11} r={1} fill={BEE_STRIPE} />
      {/* antennae */}
      <line x1={-2} y1={-14} x2={-5} y2={-18} stroke={BEE_STRIPE} strokeWidth={1} strokeLinecap="round" />
      <line x1={ 2} y1={-14} x2={ 5} y2={-18} stroke={BEE_STRIPE} strokeWidth={1} strokeLinecap="round" />
      <circle cx={-5} cy={-18} r={1} fill={BEE_STRIPE} />
      <circle cx={ 5} cy={-18} r={1} fill={BEE_STRIPE} />
    </g>
  )
}

// ---- BeeGrid19PE primitive --------------------------------------------------

export interface BeeGrid19PEProps {
  /**
   * Optional pair of white cells to highlight (drawn in amber).
   * Each element is [col, row].
   */
  highlightedCells?: Array<[number, number]>
  /**
   * Whether to draw the walking path overlay from A to B.
   * Used by the explainer to show each valid pair's route.
   */
  showPath?: boolean
  /** Show the bee glyph near A. Default true (stem always shows the bee). */
  showBee?: boolean
}

/**
 * BeeGrid19PE
 *
 * The shared honeycomb grid primitive for IKMC-20-PE-Q19.
 * Renders all 13 flat-top hexagons with their correct grey/white fills.
 * Accepts optional `highlightedCells` to colour up to 2 white cells in amber
 * (used by the explainer), and optional `showPath` to draw the bee's route.
 */
export function BeeGrid19PE({
  highlightedCells = [],
  showPath = false,
  showBee = true,
}: BeeGrid19PEProps) {
  const highlightSet = new Set(highlightedCells.map(([c, r]) => `${c},${r}`))

  // Walking path polyline points
  const pathPts = WALK_PATH
    .map(([c, r]) => {
      const [px, py] = hexCentre(c, r)
      return `${px},${py}`
    })
    .join(' ')

  // A cell position (for the bee)
  const [aCx, aCy] = hexCentre(0, 1)

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width={Math.min(340, VIEW_W)}
      style={{ display: 'block' }}
    >
      <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="white" />

      {/* Walking path — drawn under hexagons so cells render on top */}
      {showPath && (
        <polyline
          points={pathPts}
          fill="none"
          stroke={PATH_STROKE}
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.75}
        />
      )}

      {/* Hexagons */}
      {GRID_CELLS.map(({ col, row, grey, label }) => {
        const [cx, cy] = hexCentre(col, row)
        const key = `${col},${row}`
        const isHighlighted = highlightSet.has(key)

        const fill = isHighlighted ? HIGHLIGHT_FILL : grey ? GREY_FILL : WHITE_FILL
        const stroke = isHighlighted ? HIGHLIGHT_STROKE : grey ? GREY_STROKE : WHITE_STROKE
        const strokeWidth = isHighlighted ? 2.5 : grey ? 2 : 1.5

        return (
          <g key={key}>
            <polygon
              points={hexPoints(cx, cy)}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {label && (
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={16}
                fontWeight={800}
                fill={INK}
                fontFamily="Nunito, sans-serif"
              >
                {label}
              </text>
            )}
          </g>
        )
      })}

      {/* Bee glyph near A */}
      {showBee && <BeeGlyph cx={aCx} cy={aCy} />}
    </svg>
  )
}

// ---- Default export: stem illustration -------------------------------------

/**
 * BeeGrid19PEIllustration
 *
 * Static, problem-only figure for IKMC-20-PE-Q19 (2020 IKMC Pre-Ecolier, Q19).
 * Shows the 13-hexagon flat-top honeycomb with A (start) and B (end) labeled,
 * the pre-colored grey cells, and a bee glyph near A.
 * Never reveals which pairs are valid. That is the explainer's job.
 */
export default function BeeGrid19PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Sarang lebah dengan 13 sel segi enam. ' +
        'Sel abu-abu tidak bisa diubah; sel putih adalah kandidat pewarnaan. ' +
        'A (kiri) dan B (kanan) adalah sel abu-abu — titik start dan tujuan. ' +
        'Warnai tepat 2 sel putih menjadi abu-abu agar lebah bisa berjalan dari A ke B.'
      }
    >
      <BeeGrid19PE showBee showPath={false} />
    </div>
  )
}
