// Dot-grid "addition" pattern figure for WMI-24P1A-Q23
// (2024 Semifinal Grade 1 Paper A).
//
// Redrawn from db/seed/wmi/figures/2024-semifinal-g1-a-q23.jpg: two worked
// examples, each "gridA + gridB = result", followed by a third pair "= ?".
// Every grid is 3×3; each cell is either empty or holds a dot. The first
// example uses OPEN (hollow) dots in gridA, FILLED dots in gridB, then the
// result mixes them. The rule turns out to be XOR per cell:
//   where BOTH grids have a dot → result cell is empty (they cancel),
//   where EXACTLY ONE has a dot → the result keeps a dot.
//
// Example 1 grids (1 = dot), verified to satisfy the XOR rule:
//   A1 = [[1,0,0],[1,1,0],[0,1,0]]   (open dots)
//   B1 = [[1,1,1],[0,1,0],[0,0,0]]   (filled dots)
//   R1 = [[0,1,1],[1,0,0],[0,1,0]]   = A1 XOR B1  ✓
// Third pair (the one asked):
//   A3 = [[0,0,1],[0,1,1],[1,1,1]]   (open dots)
//   B3 = [[1,0,0],[0,1,1],[0,0,1]]   (filled dots)
//   R3 = A3 XOR B3 = [[1,0,1],[0,0,0],[1,1,0]]  → matches option C.
//
// Pure render, SSR-safe & deterministic: no params, no random, no state. The
// stem draws ONLY the two examples and the third pair with a "?" — never the
// computed third result. The explainer reveals the rule, then the result.

export type DotCell = 0 | 1
export type DotGrid = [
  [DotCell, DotCell, DotCell],
  [DotCell, DotCell, DotCell],
  [DotCell, DotCell, DotCell],
]
export type DotStyle = 'open' | 'filled'

// Example 1.
export const EX1_A: DotGrid = [
  [1, 0, 0],
  [1, 1, 0],
  [0, 1, 0],
]
export const EX1_B: DotGrid = [
  [1, 1, 1],
  [0, 1, 0],
  [0, 0, 0],
]
export const EX1_R: DotGrid = [
  [0, 1, 1],
  [1, 0, 0],
  [0, 1, 0],
]

// The third (asked) pair.
export const Q3_A: DotGrid = [
  [0, 0, 1],
  [0, 1, 1],
  [1, 1, 1],
]
export const Q3_B: DotGrid = [
  [1, 0, 0],
  [0, 1, 1],
  [0, 0, 1],
]

/** XOR two dot grids cell by cell (the discovered rule). */
export function xorGrids(a: DotGrid, b: DotGrid): DotGrid {
  return a.map((row, i) => row.map((v, j) => (v ^ b[i][j]) as DotCell)) as DotGrid
}

/** The computed third result (answer C) — used only by the explainer. */
export const Q3_RESULT: DotGrid = xorGrids(Q3_A, Q3_B)

export const Q23_ANSWER_LETTER = 'C'

const INK = '#2B2B2B'
const OPEN_FILL = '#FFFFFF'
const FILLED_FILL = '#2B2B2B'

const GRID_PX = 96 // a 3×3 grid is 96×96 user units
const SUB = GRID_PX / 3
const DOT_R = 11

/** A single 3×3 dot grid, top-left at (x, y). `style` chooses open vs filled
 * dots; `highlightCancel` faintly marks cells where both inputs had a dot. */
export function DotGridGlyph({
  x,
  y,
  grid,
  style = 'filled',
  cancelMask = null,
}: {
  x: number
  y: number
  grid: DotGrid
  style?: DotStyle
  /** Optional 3×3 mask: cells set to 1 get a soft cancel tint (explainer use). */
  cancelMask?: DotGrid | null
}) {
  return (
    <g>
      {/* cancel tint behind the lines */}
      {cancelMask &&
        cancelMask.map((row, r) =>
          row.map((v, c) =>
            v ? (
              <rect
                key={`cm${r}-${c}`}
                x={x + c * SUB}
                y={y + r * SUB}
                width={SUB}
                height={SUB}
                fill="#FDE68A"
              />
            ) : null,
          ),
        )}
      {/* grid lines */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <line x1={x} y1={y + i * SUB} x2={x + GRID_PX} y2={y + i * SUB} stroke={INK} strokeWidth={2} />
          <line x1={x + i * SUB} y1={y} x2={x + i * SUB} y2={y + GRID_PX} stroke={INK} strokeWidth={2} />
        </g>
      ))}
      {/* dots */}
      {grid.map((row, r) =>
        row.map((v, c) =>
          v ? (
            <circle
              key={`d${r}-${c}`}
              cx={x + c * SUB + SUB / 2}
              cy={y + r * SUB + SUB / 2}
              r={DOT_R}
              fill={style === 'open' ? OPEN_FILL : FILLED_FILL}
              stroke={INK}
              strokeWidth={2}
            />
          ) : null,
        ),
      )}
    </g>
  )
}

// Layout: each "row" is [gridA] + [gridB] = [result]; three grids + two
// operator glyphs across the width.
const PAD = 14
const OP_W = 30 // width reserved for "+" and "="
const ROW_GAP = 36

export const Q23_VIEW_W = PAD * 2 + GRID_PX * 3 + OP_W * 2
export const Q23_VIEW_H = PAD * 2 + GRID_PX * 2 + ROW_GAP

// x positions of the three grid columns and the two operator columns.
const GX0 = PAD
const OP1X = GX0 + GRID_PX + OP_W / 2
const GX1 = GX0 + GRID_PX + OP_W
const OP2X = GX1 + GRID_PX + OP_W / 2
const GX2 = GX1 + GRID_PX + OP_W

const ROW0_Y = PAD
const ROW1_Y = PAD + GRID_PX + ROW_GAP

function OpGlyph({ cx, cy, kind }: { cx: number; cy: number; kind: '+' | '=' | '?' }) {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={kind === '?' ? 34 : 30} fontWeight={900} fill={INK}>
      {kind}
    </text>
  )
}

export interface Q23DiagramProps {
  /** Reveal the computed third result grid (answer C) in the bottom-right slot. */
  showResult?: boolean
  /** Tint the cancelling cells (both-dot) in the third pair — explainer use. */
  showCancel?: boolean
}

export function Q23DotPatternDiagram({ showResult = false, showCancel = false }: Q23DiagramProps) {
  const midRow0 = ROW0_Y + GRID_PX / 2
  const midRow1 = ROW1_Y + GRID_PX / 2

  // cancel mask for the third pair: cells where BOTH A and B have a dot.
  const cancelMask: DotGrid = Q3_A.map((row, r) => row.map((v, c) => (v && Q3_B[r][c] ? 1 : 0))) as DotGrid

  return (
    <svg
      viewBox={`0 0 ${Q23_VIEW_W} ${Q23_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 460, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ---- Example row: A + B = R ---- */}
      <DotGridGlyph x={GX0} y={ROW0_Y} grid={EX1_A} style="open" />
      <OpGlyph cx={OP1X} cy={midRow0} kind="+" />
      <DotGridGlyph x={GX1} y={ROW0_Y} grid={EX1_B} style="filled" />
      <OpGlyph cx={OP2X} cy={midRow0} kind="=" />
      <DotGridGlyph x={GX2} y={ROW0_Y} grid={EX1_R} style="open" />

      {/* ---- Asked row: A + B = ? ---- */}
      <DotGridGlyph x={GX0} y={ROW1_Y} grid={Q3_A} style="open" cancelMask={showCancel ? cancelMask : null} />
      <OpGlyph cx={OP1X} cy={midRow1} kind="+" />
      <DotGridGlyph x={GX1} y={ROW1_Y} grid={Q3_B} style="filled" cancelMask={showCancel ? cancelMask : null} />
      <OpGlyph cx={OP2X} cy={midRow1} kind="=" />
      {showResult ? (
        <DotGridGlyph x={GX2} y={ROW1_Y} grid={Q3_RESULT} style="open" />
      ) : (
        <OpGlyph cx={GX2 + GRID_PX / 2} cy={midRow1} kind="?" />
      )}
    </svg>
  )
}

export default function P24G1Q23Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A worked example combines two 3 by 3 dot grids into a result grid, then a second pair of grids asks for the result. Find the option that follows the same rule."
    >
      <Q23DotPatternDiagram />
    </div>
  )
}
