// Pyramid19A15Illustration — SEAMO 2019 Paper A Q15
// "A number pyramid is shown below. Evaluate a + b + c + d."
//
// Figure (2019.imgs/007.jpg): Pascal's Triangle rows 1–6.
// The bottom row is: 1  [a]  [b]  [c]  [d]  1
// where a=5, b=10, c=10, d=5. Answer: a+b+c+d = 30, option D.
//
// Classification: STEM  (figure in question stem; choices are numbers)
// Pure SVG, SSR-safe — no hooks, no framer-motion, no window/document.

// ── Layout constants ──────────────────────────────────────────────────────────

const VW = 320
const VH = 240
const PAD_X = 14
const PAD_TOP = 18
const PAD_BOT = 24

const N_ROWS = 6
const LAST_ROW = N_ROWS - 1  // index 5

const ROW_H = (VH - PAD_TOP - PAD_BOT) / (N_ROWS - 1)

// Bottom row has 6 cells; anchor outermost at the padded edges.
const BOTTOM_CELLS = 6
const CELL_STEP = (VW - 2 * PAD_X) / (BOTTOM_CELLS - 1)

// Pascal's Triangle rows 1–6
const ROWS: readonly (readonly number[])[] = [
  [1],
  [1, 1],
  [1, 2, 1],
  [1, 3, 3, 1],
  [1, 4, 6, 4, 1],
  [1, 5, 10, 10, 5, 1],
] as const

// ── Colour palette ────────────────────────────────────────────────────────────

const BG       = '#FFFBF0'
const FILL_STD = '#FEF3C7'
const FILL_BOX = '#FFFFFF'
const STROKE   = '#92400E'
const TEXT_C   = '#78350F'

// ── Geometry helpers ──────────────────────────────────────────────────────────

function rowY(r: number): number {
  return PAD_TOP + r * ROW_H
}

function cellX(r: number, c: number): number {
  const nCells = ROWS[r].length
  const offset = ((BOTTOM_CELLS - nCells) / 2) * CELL_STEP
  return PAD_X + offset + c * CELL_STEP
}

// ── Cell component ────────────────────────────────────────────────────────────

const HALF_W = 15
const HALF_H = 12
const BOX_RX  = 5

interface CellProps {
  x: number
  y: number
  value: number
  boxed?: boolean
  letter?: string
}

function Cell({ x, y, value, boxed = false, letter }: CellProps) {
  const twoDigit = value >= 10
  const fontSize = twoDigit ? 10 : 13

  return (
    <g>
      {boxed ? (
        <rect
          x={x - HALF_W}
          y={y - HALF_H}
          width={HALF_W * 2}
          height={HALF_H * 2}
          fill={FILL_BOX}
          stroke={STROKE}
          strokeWidth={1.5}
          rx={BOX_RX}
        />
      ) : (
        <ellipse
          cx={x}
          cy={y}
          rx={HALF_W}
          ry={HALF_H}
          fill={FILL_STD}
          stroke="none"
        />
      )}
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={fontSize}
        fontWeight="600"
        fontFamily="'Nunito', 'Segoe UI', system-ui, sans-serif"
        fill={TEXT_C}
      >
        {value}
      </text>
      {letter && (
        <text
          x={x}
          y={y + HALF_H + 9}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={9}
          fontWeight="700"
          fontFamily="'Nunito', 'Segoe UI', system-ui, sans-serif"
          fill={STROKE}
        >
          {letter}
        </text>
      )}
    </g>
  )
}

// ── Figure component (reusable by explainer) ──────────────────────────────────

export interface Pyramid19A15FigureProps {
  /** When true, highlight the computed cells in explainer mode (reserved). */
  revealBottom?: boolean
}

export function Pyramid19A15Figure({
  revealBottom: _revealBottom = false,
}: Pyramid19A15FigureProps) {
  const LETTERS = ['a', 'b', 'c', 'd']

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: VW, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <rect width={VW} height={VH} fill={BG} rx={8} />

      {ROWS.map((row, r) =>
        row.map((value, c) => {
          const x = cellX(r, c)
          const y = rowY(r)

          const isLastRow = r === LAST_ROW
          const isFirstOrLast = c === 0 || c === row.length - 1
          const isBoxed = isLastRow && !isFirstOrLast
          const letter = isBoxed ? LETTERS[c - 1] : undefined

          return (
            <Cell
              key={`${r}-${c}`}
              x={x}
              y={y}
              value={value}
              boxed={isBoxed}
              letter={letter}
            />
          )
        })
      )}
    </svg>
  )
}

// ── Default export — static illustration ─────────────────────────────────────

export default function Pyramid19A15Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        "Pascal's Triangle with 6 rows. Bottom row: 1, box a, box b, box c, box d, 1. " +
        "Find a + b + c + d."
      }
    >
      <Pyramid19A15Figure />
    </div>
  )
}

// ── Registry wiring (paste into registry.ts — do NOT copy here) ───────────────
//
//   'SEAMO-19-A-Q15': {
//     illustration: () => import('./Pyramid19A15Illustration'),
//   },
