// Block-pattern matrix figure for WMI-19P3A-Q11 (2019 Semifinal Grade 3).
//
// Reconstructed from db/seed/wmi/figures/2019-semifinal-g3-a-q11.jpg:
// a 3 × 3 matrix of panels, each panel holding a little arrangement of black
// squares on a 3 × 3 sub-grid. The bottom-right panel is "?".
//
// The block COUNT drops by exactly one across every row:
//   row 1:  5 → 4 → 3
//   row 2:  5 → 4 → 3
//   row 3:  6 → 5 → ?
// so the missing panel has 4 blocks. In the original the four answer choices
// were printed as separate images; the seed's answer is D, the 4-block figure.
//
// The static figure shows ONLY the eight given panels and the "?" panel — it
// never shows what option D looks like.
//
// Sub-grid cell coordinates are [row, col] with row 0 = top, col 0 = left.

export type Cell = [number, number]

export interface Panel {
  /** Filled sub-grid cells (black squares). */
  cells: Cell[]
}

// The eight given panels, reading order (row-major), then the "?" panel.
export const Q11_PANELS: (Panel | 'q')[] = [
  // row 1
  { cells: [[0, 0], [0, 2], [1, 0], [2, 0], [2, 1]] }, // 5
  { cells: [[0, 0], [1, 0], [2, 0], [2, 1]] }, // 4
  { cells: [[0, 0], [1, 0], [2, 0]] }, // 3
  // row 2
  { cells: [[0, 1], [1, 0], [1, 1], [2, 0], [2, 1]] }, // 5
  { cells: [[1, 0], [1, 1], [2, 0], [2, 1]] }, // 4
  { cells: [[1, 0], [2, 0], [2, 1]] }, // 3
  // row 3
  { cells: [[0, 1], [0, 2], [1, 1], [1, 2], [2, 0], [2, 1]] }, // 6
  { cells: [[0, 1], [1, 1], [1, 2], [2, 0], [2, 1]] }, // 5
  'q', // ?
]

/** Per-panel block counts (the pattern the explainer teaches). */
export const Q11_COUNTS = [5, 4, 3, 5, 4, 3, 6, 5] as const
/** The "?" panel's block count, by the −1-per-step rule (6, 5, → 4). */
export const Q11_ANSWER_COUNT = Q11_COUNTS[6] - 2 // 4

const INK = '#1F2937'
const BLOCK = '#111827'
const BLUE = '#2f6df0'

// Panel + sub-grid geometry.
const SUB = 3 // sub-grid is 3×3
const CELL = 18 // sub-grid cell size
const GAP = 4 // gap between blocks
const PANEL_PAD = 12 // inner padding of a panel
const PANEL = SUB * CELL + 2 * PANEL_PAD // panel edge length
const OUTER_PAD = 6

export const Q11_VIEW = OUTER_PAD * 2 + PANEL * 3

/** Draw the black squares of one panel at panel-origin (px, py). */
function PanelBlocks({ px, py, cells }: { px: number; py: number; cells: Cell[] }) {
  return (
    <>
      {cells.map(([r, c], i) => (
        <rect
          key={i}
          x={px + PANEL_PAD + c * CELL + GAP / 2}
          y={py + PANEL_PAD + r * CELL + GAP / 2}
          width={CELL - GAP}
          height={CELL - GAP}
          rx={2}
          fill={BLOCK}
        />
      ))}
    </>
  )
}

export interface Q11MatrixProps {
  /** Reveal the answer panel (4 blocks) instead of "?". */
  revealAnswer?: boolean
  /** Panel index (0..8) to ring with a highlight, or null. */
  highlightPanel?: number | null
  /** Show the per-panel block-count badge under each given panel. */
  showCounts?: boolean
}

/** The answer panel D: 4 blocks (an L-tromino plus one), matching the row rule. */
export const Q11_ANSWER_CELLS: Cell[] = [[1, 0], [1, 1], [2, 0], [2, 1]]

export function Q11Matrix({ revealAnswer = false, highlightPanel = null, showCounts = false }: Q11MatrixProps) {
  return (
    <svg
      viewBox={`0 0 ${Q11_VIEW} ${Q11_VIEW}`}
      width="100%"
      style={{ maxWidth: Q11_VIEW, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {Q11_PANELS.map((panel, idx) => {
        const row = Math.floor(idx / 3)
        const col = idx % 3
        const px = OUTER_PAD + col * PANEL
        const py = OUTER_PAD + row * PANEL
        const isQ = panel === 'q'
        const isHi = highlightPanel === idx
        return (
          <g key={idx}>
            <rect
              x={px}
              y={py}
              width={PANEL}
              height={PANEL}
              fill={isHi ? '#FEF3C7' : '#FFFFFF'}
              stroke={isHi ? '#F59E0B' : INK}
              strokeWidth={isHi ? 3 : 1.5}
            />
            {isQ ? (
              revealAnswer ? (
                <PanelBlocks px={px} py={py} cells={Q11_ANSWER_CELLS} />
              ) : (
                <text
                  x={px + PANEL / 2}
                  y={py + PANEL / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={30}
                  fontWeight={900}
                  fill={BLUE}
                >
                  ?
                </text>
              )
            ) : (
              <>
                <PanelBlocks px={px} py={py} cells={panel.cells} />
                {showCounts && (
                  <text
                    x={px + PANEL / 2}
                    y={py + PANEL - 4}
                    textAnchor="middle"
                    dominantBaseline="ideographic"
                    fontSize={11}
                    fontWeight={900}
                    fill="#92400E"
                  >
                    {panel.cells.length}
                  </text>
                )}
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function P19G3Q11Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A 3 by 3 matrix of panels of black squares. Across each row the number of squares decreases by one (5,4,3 then 5,4,3 then 6,5 and a question mark for the last panel)."
    >
      <Q11Matrix />
    </div>
  )
}
