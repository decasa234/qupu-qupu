// WMI-22F3A Q8 — Half-painted grid puzzle.
//
// Stem: a 3×3 grid where each cell is one of:
//   'full'      — entire cell shaded (area = 1)
//   'top'       — top half shaded (area = 0.5)
//   'bottom'    — bottom half shaded (area = 0.5)
//   'diag'      — lower-left triangle shaded (area = 0.5), hypotenuse top-left→bottom-right
//   'small'     — small centred square (~area = 0.25)  [not used in stem]
//   'empty'     — unshaded (area = 0)
//   'question'  — shows a "?" glyph
//
// Painted area of the 8 fixed cells:
//   (0,0) top       = 0.5
//   (0,1) empty     = 0
//   (0,2) bottom    = 0.5
//   (1,0) empty     = 0
//   (1,1) full      = 1
//   (1,2) full      = 1
//   (2,0) diag      = 0.5
//   (2,2) empty     = 0
// Sum of fixed cells = 0.5 + 0.5 + 1 + 1 + 0.5 = 3.5
//
// Total cells = 9; for painted = white we need painted = 4.5.
// Missing cell (2,1) must contribute exactly 4.5 − 3.5 = 1.0 → FULL square → option A.
//
// Options:
//   A = full square      (area 1)
//   B = diagonal half    (area 0.5, same orientation as stem (2,0))
//   C = empty            (area 0)
//   D = small centred square (area ~0.25)

export type CellFill = 'full' | 'top' | 'bottom' | 'diag' | 'small' | 'empty' | 'question'

/** Pixel size of a single grid cell in the ShadeGrid component. */
const CELL = 46
/** Stroke width for grid lines. */
const STROKE = 1.8
/** Purple fill colour for shaded regions. */
const PURPLE = '#b0a4d4'
/** Slightly deeper purple for the cell border. */
const BORDER = '#7c6fb0'
/** Ink colour for question-mark text. */
const INK = '#2d2d2d'

/**
 * Renders one cell's shaded shape at the given top-left (cx, cy) within a cell
 * of size `cell`. Everything is drawn in absolute SVG coordinates.
 */
function CellShape({ fill, cx, cy, cell }: { fill: CellFill; cx: number; cy: number; cell: number }) {
  if (fill === 'empty' || fill === 'question') return null

  if (fill === 'full') {
    return (
      <rect
        x={cx + STROKE / 2}
        y={cy + STROKE / 2}
        width={cell - STROKE}
        height={cell - STROKE}
        fill={PURPLE}
      />
    )
  }

  if (fill === 'top') {
    return (
      <rect
        x={cx + STROKE / 2}
        y={cy + STROKE / 2}
        width={cell - STROKE}
        height={cell / 2 - STROKE / 2}
        fill={PURPLE}
      />
    )
  }

  if (fill === 'bottom') {
    return (
      <rect
        x={cx + STROKE / 2}
        y={cy + cell / 2}
        width={cell - STROKE}
        height={cell / 2 - STROKE / 2}
        fill={PURPLE}
      />
    )
  }

  if (fill === 'diag') {
    // Lower-left triangle: corners are (cx, cy+cell), (cx+cell, cy+cell), (cx, cy)
    // Hypotenuse runs from top-left to bottom-right.
    const x0 = cx + STROKE / 2
    const y0 = cy + STROKE / 2
    const x1 = cx + cell - STROKE / 2
    const y1 = cy + cell - STROKE / 2
    return (
      <polygon
        points={`${x0},${y0} ${x0},${y1} ${x1},${y1}`}
        fill={PURPLE}
      />
    )
  }

  if (fill === 'small') {
    const margin = cell * 0.25
    return (
      <rect
        x={cx + margin}
        y={cy + margin}
        width={cell - margin * 2}
        height={cell - margin * 2}
        fill={PURPLE}
      />
    )
  }

  return null
}

/**
 * Primitive grid component.
 *
 * @param grid - 3×3 array of CellFill values (row-major, row 0 = top)
 * @param size - pixel size of each cell (default CELL = 46)
 */
export function ShadeGrid({ grid, size = CELL }: { grid: CellFill[][]; size?: number }) {
  const cols = 3
  const rows = 3
  const w = cols * size
  const h = rows * size

  return (
    <svg
      viewBox={`0 0 ${w + STROKE} ${h + STROKE}`}
      width={w + STROKE}
      height={h + STROKE}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* Shaded fills — drawn first so grid lines appear on top */}
      {grid.map((row, r) =>
        row.map((fill, c) => (
          <CellShape
            key={`${r}-${c}`}
            fill={fill}
            cx={c * size + STROKE / 2}
            cy={r * size + STROKE / 2}
            cell={size - STROKE / 2}
          />
        )),
      )}

      {/* Grid lines */}
      {Array.from({ length: rows + 1 }, (_, i) => (
        <line
          key={`h${i}`}
          x1={STROKE / 2}
          y1={i * size + STROKE / 2}
          x2={cols * size + STROKE / 2}
          y2={i * size + STROKE / 2}
          stroke={BORDER}
          strokeWidth={STROKE}
        />
      ))}
      {Array.from({ length: cols + 1 }, (_, i) => (
        <line
          key={`v${i}`}
          x1={i * size + STROKE / 2}
          y1={STROKE / 2}
          x2={i * size + STROKE / 2}
          y2={rows * size + STROKE / 2}
          stroke={BORDER}
          strokeWidth={STROKE}
        />
      ))}

      {/* Diagonal line for any 'diag' cell — drawn on top of fill */}
      {grid.map((row, r) =>
        row.map((fill, c) => {
          if (fill !== 'diag') return null
          const cx = c * size + STROKE / 2
          const cy = r * size + STROKE / 2
          return (
            <line
              key={`d${r}-${c}`}
              x1={cx}
              y1={cy}
              x2={cx + size - STROKE / 2}
              y2={cy + size - STROKE / 2}
              stroke={BORDER}
              strokeWidth={STROKE}
            />
          )
        }),
      )}

      {/* Question mark label for the '?' cell */}
      {grid.map((row, r) =>
        row.map((fill, c) => {
          if (fill !== 'question') return null
          const cx = c * size + STROKE / 2 + (size - STROKE / 2) / 2
          const cy = r * size + STROKE / 2 + (size - STROKE / 2) / 2
          return (
            <text
              key={`q${r}-${c}`}
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={size * 0.46}
              fontWeight={900}
              fill={INK}
            >
              ?
            </text>
          )
        }),
      )}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Stem grid (problem setup)
// ---------------------------------------------------------------------------

/** The 3×3 stem grid with "?" at (2,1). */
export const STEM_GRID: CellFill[][] = [
  ['top', 'empty', 'bottom'],
  ['empty', 'full', 'full'],
  ['diag', 'question', 'empty'],
]

// ---------------------------------------------------------------------------
// Option grids (A/B/C/D) — only the mystery cell changes
// ---------------------------------------------------------------------------

function makeOptionGrid(fill: CellFill): CellFill[][] {
  return [
    ['top', 'empty', 'bottom'],
    ['empty', 'full', 'full'],
    ['diag', fill, 'empty'],
  ]
}

const OPTION_FILLS: Record<string, CellFill> = {
  A: 'full',
  B: 'diag',
  C: 'empty',
  D: 'small',
}

const OPTION_ARIA: Record<string, string> = {
  A: 'kotak penuh ungu',
  B: 'segitiga diagonal ungu',
  C: 'kotak kosong',
  D: 'kotak kecil di tengah',
}

// ---------------------------------------------------------------------------
// Main illustration (in-card, stem only, no answer)
// ---------------------------------------------------------------------------

/**
 * WMI-22F3A Q8 stem illustration.
 *
 * Draws the 3×3 grid with a "?" in cell (2,1). Never reveals the answer.
 * Pure render — no state, no random, SSR-safe.
 */
export default function HalfShadeGrid22G3Illustration() {
  const ariaLabel =
    'Kisi 3×3 dengan sel berwarna ungu: baris 1 — setengah atas, kosong, setengah bawah; ' +
    'baris 2 — kosong, penuh, penuh; baris 3 — segitiga diagonal, tanda tanya, kosong. ' +
    'Area berwarna dan area putih harus sama.'

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ariaLabel}>
      <ShadeGrid grid={STEM_GRID} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Per-option choice renderer (used in CHOICE_RENDERERS)
// ---------------------------------------------------------------------------

import type { WmiChoice } from '../../../../types/wmi'

/**
 * Renders one A/B/C/D choice as a mini grid showing the full 3×3 pattern
 * with the candidate cell filled according to the option.
 *
 * The option label drives which cell fill is used; falls back to plain text
 * for any unexpected label.
 */
export function HalfShade22G3Option({ choice }: { choice: WmiChoice }) {
  const label = choice.label as string
  const fill = OPTION_FILLS[label]

  if (!fill) {
    return <span>{choice.text}</span>
  }

  const grid = makeOptionGrid(fill)

  return (
    <span
      role="img"
      aria-label={`Pilihan ${label}: ${OPTION_ARIA[label]}`}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <ShadeGrid grid={grid} size={26} />
    </span>
  )
}
