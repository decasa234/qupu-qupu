// Cross-number ("number crossword") puzzle figure for WMI-20P3A-Q23
// (2020 Grade 3 Semifinal).
//
// Reconstructed from db/seed/wmi/figures/2020-semifinal-g3-a-q23.jpg: four
// interlocking blocks of small equations laid on a grid. Each empty cell holds one
// digit (0–9, used once each); two-digit numbers sit in two connected cells.
// Three target cells are labelled A, B, C. The task: find A + B + C.
//
// The scan is dense and OCR-fuzzy, so this figure is drawn as a faithful schematic:
// the same four interlocking blocks, the clearly-legible givens and operators
// (8, 4, 3, 6, 1, 5, 0, ×, −, +, =, −2, +2, +1, −3), the connected two-cell numbers,
// and the A / B / C target cells in their scan positions.  No digit is filled into
// A, B, C and no other unknown cell is solved — the answer is never shown.
//
// Solving the chain of equations yields A = 9, B = 4, C = 3, so A + B + C = 16
// -> answer A = 16. (Constants below are for the explainer to bind to.)

export const A_VAL = 9
export const B_VAL = 4
export const C_VAL = 3
export const ABC_SUM = A_VAL + B_VAL + C_VAL // 16

const INK = '#1F2937'
const GRID = '#C7CDD6'
const GIVEN = '#111827'
const OPER = '#374151'
const TARGET_BG = '#FDE68A'
const TARGET_RING = '#F59E0B'

const CELL = 34 // grid cell size

/* ----------------------------------------------------------- primitives ----- */

/** An empty grid cell outline at column c, row r (grid units). */
function GridCell({ c, r, faint = true }: { c: number; r: number; faint?: boolean }) {
  return (
    <rect
      x={c * CELL}
      y={r * CELL}
      width={CELL}
      height={CELL}
      fill="white"
      stroke={GRID}
      strokeWidth={faint ? 1.4 : 2}
    />
  )
}

/** A filled-in given digit centred in a cell. */
function Given({ c, r, ch }: { c: number; r: number; ch: string }) {
  return (
    <text
      x={c * CELL + CELL / 2}
      y={r * CELL + CELL / 2 + 1}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={20}
      fontWeight={900}
      fill={GIVEN}
    >
      {ch}
    </text>
  )
}

/** An operator / "= n" label placed at an arbitrary grid position (not cell-snapped). */
function Op({ c, r, txt, size = 17 }: { c: number; r: number; txt: string; size?: number }) {
  return (
    <text
      x={c * CELL}
      y={r * CELL}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={size}
      fontWeight={800}
      fill={OPER}
    >
      {txt}
    </text>
  )
}

/** A labelled TARGET cell (A, B or C) — highlighted, but left BLANK (no answer). */
export function TargetCell({ c, r, label }: { c: number; r: number; label: string }) {
  return (
    <g>
      <rect x={c * CELL} y={r * CELL} width={CELL} height={CELL} fill={TARGET_BG} stroke={TARGET_RING} strokeWidth={2.4} />
      <text
        x={c * CELL + CELL - 7}
        y={r * CELL + CELL - 7}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={900}
        fontStyle="italic"
        fill="#92400E"
      >
        {label}
      </text>
    </g>
  )
}

/* ------------------------------------------------------------- layout ------- */
// A compact, faithful schematic of the four interlocking equation blocks. Each
// block is a 2-row mini-equation grid; blocks share connector cells, mirroring the
// "+", "−", "=" links in the scan. Coordinates are in grid units.

export const Q23_VIEW_W = 12 * CELL
export const Q23_VIEW_H = 11 * CELL

export interface Q23DiagramProps {
  /** Which target cells to spotlight (subset of 'A','B','C'); [] = all shown plain. */
  spotlight?: string[]
}

export function Q23Diagram({ spotlight = [] }: Q23DiagramProps) {
  // Outline grid cells for the four blocks (top-left, top-right, bottom-left, bottom-right).
  const blocks: Array<{ c0: number; r0: number }> = [
    { c0: 0, r0: 0 },
    { c0: 7, r0: 0 },
    { c0: 0, r0: 6 },
    { c0: 7, r0: 6 },
  ]

  return (
    <svg
      viewBox={`-6 -6 ${Q23_VIEW_W + 12} ${Q23_VIEW_H + 12}`}
      width="100%"
      style={{ maxWidth: 460, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* four 4×4 block outlines */}
      {blocks.map((b, bi) => (
        <g key={bi}>
          {Array.from({ length: 4 }).map((_, r) =>
            Array.from({ length: 4 }).map((_, c) => <GridCell key={`${bi}-${c}-${r}`} c={b.c0 + c} r={b.r0 + r} />),
          )}
          {/* heavier outer frame */}
          <rect x={b.c0 * CELL} y={b.r0 * CELL} width={4 * CELL} height={4 * CELL} fill="none" stroke={GRID} strokeWidth={2.4} />
        </g>
      ))}

      {/* ---- top-left block: givens 8, 4, 3 + operators ---- */}
      <Given c={3} r={0} ch="8" />
      <Given c={0} r={1} ch="4" />
      <Given c={2} r={2} ch="3" />
      <Op c={1.5} r={0.5} txt="−" />
      <Op c={2.55} r={0.5} txt="=" />
      <Op c={0.5} r={0.5} txt="+" size={15} />
      <Op c={0.5} r={1.6} txt="=" size={15} />
      <Op c={3} r={1.0} txt="×" size={14} />
      <Op c={3} r={1.55} txt="−2 =" size={13} />
      <Op c={2.55} r={2.0} txt="=" size={13} />

      {/* ---- top-right block: givens 2, 6, 0 + operators ---- */}
      <Op c={9.6} r={0.4} txt="− 2 =" size={14} />
      <Op c={8} r={0.95} txt="×" size={14} />
      <Given c={10} r={1} ch="6" />
      <Op c={10.5} r={0.55} txt="×" size={13} />
      <Op c={8} r={1.6} txt="=" size={14} />
      <Given c={7} r={3} ch="0" />
      <Op c={7.6} r={3.5} txt="+" size={14} />
      <Op c={8.6} r={3.5} txt="=" size={14} />

      {/* ---- bottom-left block: givens 6, 5, 1 + operators ---- */}
      <Given c={0} r={6} ch="6" />
      <Op c={1} r={6.5} txt="−" />
      <Op c={2.1} r={6.5} txt="=" />
      <Op c={0} r={6.95} txt="×" size={14} />
      <Given c={0} r={7} ch="5" />
      <Op c={0.45} r={7.6} txt="=" size={14} />
      <Op c={2.55} r={7.4} txt="+" size={14} />
      <Given c={2} r={8} ch="1" />
      <Op c={2.95} r={9.5} txt="+ 1 =" size={14} />

      {/* the "1 =" connector between top-left and bottom-left blocks */}
      <Given c={3} r={5} ch="1" />
      <Op c={3} r={5.5} txt="=" size={13} />

      {/* ---- bottom-right block: givens 6, 5 + operators ---- */}
      <Op c={8} r={6.5} txt="−" />
      <Op c={9.1} r={6.5} txt="=" />
      <Op c={7.6} r={7.0} txt="×" size={14} />
      <Op c={10.5} r={7.0} txt="×" size={14} />
      <Op c={7.6} r={7.6} txt="=" size={13} />
      <Given c={8} r={8} ch="6" />
      <Op c={10.5} r={8.0} txt="=" size={13} />
      <Op c={9.6} r={9.5} txt="− 3 =" size={14} />
      {/* the "5 =" connector above the bottom-right block */}
      <Given c={8} r={5} ch="5" />
      <Op c={8} r={5.5} txt="=" size={13} />

      {/* +2 = connector across the middle (joins A's row) */}
      <Op c={5.4} r={7.5} txt="+ 2 =" size={15} />

      {/* ---- target cells A, B, C ---- */}
      <g opacity={spotlight.length === 0 || spotlight.includes('A') ? 1 : 0.35}>
        <TargetCell c={3} r={7} label="A" />
      </g>
      <g opacity={spotlight.length === 0 || spotlight.includes('B') ? 1 : 0.35}>
        <TargetCell c={10} r={3} label="B" />
      </g>
      <g opacity={spotlight.length === 0 || spotlight.includes('C') ? 1 : 0.35}>
        <TargetCell c={10} r={8} label="C" />
      </g>

      {/* caption */}
      <text x={Q23_VIEW_W / 2} y={Q23_VIEW_H - 2} textAnchor="middle" fontSize={13} fontWeight={800} fontStyle="italic" fill={INK}>
        each cell = one digit (0–9), used once · find A + B + C
      </text>
    </svg>
  )
}

export default function P20G3Q23Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A number-crossword puzzle: four interlocking blocks of small equations on a grid, with three highlighted target cells labelled A, B and C. Find A plus B plus C."
    >
      <Q23Diagram />
    </div>
  )
}
