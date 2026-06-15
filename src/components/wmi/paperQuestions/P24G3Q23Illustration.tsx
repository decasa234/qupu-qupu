// WMI-24P3A-Q23 (2024 Semifinal Grade 3, question 23) — "add two dot grids".
//
// Redrawn from db/seed/wmi/figures/2024-semifinal-g3-a-q23.jpg: two rows, each a
// pair of 3x3 grids joined by "+" and "=". A cell may hold a white circle (○,
// from grid 1) or a black circle (●, from grid 2).
//
// RULE (read off the worked example in row 1, verified deterministically below):
// the grids ADD cell by cell as XOR / addition-mod-2 — a result cell holds a
// circle only when EXACTLY ONE of the two grids has a circle there; when BOTH
// have a circle they CANCEL and the cell is empty. The surviving circle keeps its
// source colour (white from grid 1, black from grid 2).
//
//   Worked example (row 1):
//     grid 1 (white ○): (0,0) (1,0) (1,1) (2,1)
//     grid 2 (black ●): (0,0) (0,1) (0,2) (1,1)
//     XOR result      : (0,1)● (0,2)● (1,0)○ (2,1)○   -> 4 cells  ✓ matches figure
//   (a plain OR/keep-everything would have kept (0,0) and (1,1) too — the figure
//    drops both, proving the cancel rule.)
//
// This static illustration draws ONLY the problem (row 2): the two source grids
// joined by "+" with a "?" result. It never shows the answer grid.

export type Mark = 'white' | 'black' | null

/** A 3x3 grid is a flat array of 9 marks, row-major (index = row*3 + col). */
export type Grid3 = Mark[]

const INK = '#1F2937'
const GRID_STROKE = '#1F2937'
const BLACK_FILL = '#262626'
const WHITE_FILL = '#FFFFFF'
const WHITE_STROKE = '#1F2937'
const CANCEL = '#EF4444'
const KEEP = '#10B981'

export const CELL = 42
export const G_PAD = 4
export const GRID_SIZE = CELL * 3 + G_PAD * 2 // outer box

function cellXY(i: number): [number, number] {
  const row = Math.floor(i / 3)
  const col = i % 3
  return [G_PAD + col * CELL, G_PAD + row * CELL]
}

/**
 * A single 3x3 dot grid drawn at the SVG origin (size GRID_SIZE). Wrap in a <g
 * transform> to place it. `highlight` rings chosen cells (keep=green, cancel=red).
 */
export function DotGrid3({
  grid,
  highlight,
}: {
  grid: Grid3
  highlight?: Record<number, 'keep' | 'cancel'>
}) {
  return (
    <g>
      <rect x={G_PAD} y={G_PAD} width={CELL * 3} height={CELL * 3} fill="#FFFFFF" stroke={GRID_STROKE} strokeWidth={2.5} />
      {/* inner grid lines */}
      {[1, 2].map((k) => (
        <g key={`gl${k}`}>
          <line x1={G_PAD + k * CELL} y1={G_PAD} x2={G_PAD + k * CELL} y2={G_PAD + CELL * 3} stroke={GRID_STROKE} strokeWidth={1.6} />
          <line x1={G_PAD} y1={G_PAD + k * CELL} x2={G_PAD + CELL * 3} y2={G_PAD + k * CELL} stroke={GRID_STROKE} strokeWidth={1.6} />
        </g>
      ))}
      {/* circles */}
      {grid.map((m, i) => {
        if (!m) return null
        const [cx0, cy0] = cellXY(i)
        const cx = cx0 + CELL / 2
        const cy = cy0 + CELL / 2
        return (
          <circle
            key={`c${i}`}
            cx={cx}
            cy={cy}
            r={12}
            fill={m === 'black' ? BLACK_FILL : WHITE_FILL}
            stroke={m === 'black' ? BLACK_FILL : WHITE_STROKE}
            strokeWidth={m === 'black' ? 0 : 2.2}
          />
        )
      })}
      {/* highlights */}
      {highlight &&
        Object.entries(highlight).map(([k, kind]) => {
          const i = Number(k)
          const [cx0, cy0] = cellXY(i)
          return (
            <rect
              key={`h${k}`}
              x={cx0 + 3}
              y={cy0 + 3}
              width={CELL - 6}
              height={CELL - 6}
              rx={6}
              fill="none"
              stroke={kind === 'cancel' ? CANCEL : KEEP}
              strokeWidth={3}
            />
          )
        })}
    </g>
  )
}

// ---- Row-2 (the question) data --------------------------------------------

// grid 1 (white circles)
export const Q23_GRID1: Grid3 = [
  null, null, 'white', // r0: top-right
  null, 'white', 'white', // r1: middle-center, middle-right
  'white', 'white', 'white', // r2: whole bottom row
]

// grid 2 (black circles)
export const Q23_GRID2: Grid3 = [
  'black', null, null, // r0: top-left
  null, 'black', 'black', // r1: middle-center, middle-right
  null, null, 'black', // r2: bottom-right
]

/** XOR / add-mod-2: keep a circle only where exactly one grid has one. */
export function xorGrids(a: Grid3, b: Grid3): Grid3 {
  return a.map((m, i) => {
    const ai = m != null
    const bi = b[i] != null
    if (ai === bi) return null // both empty OR both filled -> cancel
    return ai ? m : b[i] // the one that has it keeps its colour
  })
}

// Verified result for the question (the option-C grid): (0,0)● (0,2)○ (2,0)○ (2,1)○.
export const Q23_RESULT: Grid3 = xorGrids(Q23_GRID1, Q23_GRID2)

// Cells where the two grids BOTH have a circle (these cancel): (1,1) and (1,2),
// plus (2,2). Used by the explainer to teach the cancel rule.
export const Q23_CANCEL_CELLS = Q23_GRID1.map((m, i) => (m != null && Q23_GRID2[i] != null ? i : -1)).filter((i) => i >= 0)

export const Q23_ANSWER_LABEL = 'C'

export const Q23_VIEW_W = 460
export const Q23_VIEW_H = 200

export interface Q23DiagramProps {
  /** Which grids/result to show. */
  showResult?: boolean
  /** Cells to ring on grid 1 / grid 2 (e.g. cancel pairs during the explainer). */
  hi1?: Record<number, 'keep' | 'cancel'>
  hi2?: Record<number, 'keep' | 'cancel'>
  /** Override the result grid shown (used to reveal it cell by cell). */
  resultGrid?: Grid3
  /** Ring the answer letter to point at option C. */
  markAnswer?: boolean
}

export function Q23Diagram({ showResult = false, hi1, hi2, resultGrid, markAnswer = false }: Q23DiagramProps) {
  const g1x = 6
  const g2x = g1x + GRID_SIZE + 46
  const resX = g2x + GRID_SIZE + 46
  const gy = (Q23_VIEW_H - GRID_SIZE) / 2

  return (
    <svg
      viewBox={`0 0 ${Q23_VIEW_W} ${Q23_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 460, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <g transform={`translate(${g1x} ${gy})`}>
        <DotGrid3 grid={Q23_GRID1} highlight={hi1} />
      </g>

      <text x={g1x + GRID_SIZE + 23} y={Q23_VIEW_H / 2} textAnchor="middle" dominantBaseline="central" fontSize={28} fontWeight={900} fill={INK}>
        +
      </text>

      <g transform={`translate(${g2x} ${gy})`}>
        <DotGrid3 grid={Q23_GRID2} highlight={hi2} />
      </g>

      <text x={g2x + GRID_SIZE + 23} y={Q23_VIEW_H / 2} textAnchor="middle" dominantBaseline="central" fontSize={28} fontWeight={900} fill={INK}>
        =
      </text>

      {showResult ? (
        <g transform={`translate(${resX} ${gy})`}>
          <DotGrid3 grid={resultGrid ?? Q23_RESULT} />
          {markAnswer && (
            <text x={GRID_SIZE / 2} y={GRID_SIZE + 18} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={900} fill={KEEP}>
              = option {Q23_ANSWER_LABEL}
            </text>
          )}
        </g>
      ) : (
        <text x={resX + GRID_SIZE / 2} y={Q23_VIEW_H / 2} textAnchor="middle" dominantBaseline="central" fontSize={34} fontWeight={900} fill={INK}>
          ?
        </text>
      )}
    </svg>
  )
}

export default function P24G3Q23Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Add two 3 by 3 dot grids cell by cell. Grid one has white circles at top-right, middle-center, middle-right and the whole bottom row. Grid two has black circles at top-left, middle-center, middle-right and bottom-right. Which grid is the result?"
    >
      <Q23Diagram />
    </div>
  )
}
