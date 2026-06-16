/**
 * WMI-22F3A-Q5 — Painted-area matching puzzle.
 *
 * A 3×3 grid where each cell may contain an orange-painted shape.
 * The question asks: which option has the same painted (orange) area as the example?
 *
 * KEY MATH PRINCIPLE
 * ==================
 * A quarter-circle has area π/4 (contains π) while triangles and full squares
 * have rational areas. Because π is irrational, two grids can only have equal
 * total painted area if they have the SAME number of quarter-circle cells AND
 * the same total straight-edge (polygon) area.
 *
 * Area inventory per figure (cell size = 1):
 *   Example : 2 QC (π/4 each) + 2 half-triangles + 1 full  → π/2 + 2   ✓ tuple (2, 2)
 *   A       : 4 QC                        + 1 full           → π   + 1     ✗ tuple (4, 1)
 *   B       : 0 QC + 3 full + 3 half-tri                     → 0   + 9/2   ✗ tuple (0, 4.5)
 *   C       : large-radius QC (area π) spanning 2×2 cells + other pieces → ≠ example
 *   D       : 2 QC + 2 half-triangles + 1 full               → π/2 + 2   ✓ tuple (2, 2)  ← ANSWER
 *
 * Reconstructed cell-by-cell from scan files:
 *   db/seed/wmi/figures/2022-final-g3-a-q5.jpg  (example / stem)
 *   wmiPastPaper/2022 WMI Final G03 Paper A/images/f515be…  (option A)
 *   wmiPastPaper/2022 WMI Final G03 Paper A/images/369ab3…  (option B)
 *   wmiPastPaper/2022 WMI Final G03 Paper A/images/c9680b…  (option C)
 *   wmiPastPaper/2022 WMI Final G03 Paper A/images/eafbe0…  (option D)
 */

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Cell shape types
// ---------------------------------------------------------------------------

/** Quarter-circle orientation: which CORNER is the arc's centre. */
export type QcCorner = 'TL' | 'TR' | 'BL' | 'BR'

/** For a right-triangle half: which of the two halves is painted. */
export type TriHalf = 'lower-left' | 'lower-right' | 'upper-left' | 'upper-right'

export type CellShape =
  | { kind: 'empty' }
  | { kind: 'full' }
  | { kind: 'qc'; corner: QcCorner }          // quarter-circle, area = π/4
  | { kind: 'tri'; half: TriHalf }             // right-triangle half, area = 1/2
  | { kind: 'qc-large'; corner: QcCorner }    // quarter-circle with radius = 2×cell (spans 4 cells)

/** 3×3 grid of shapes, row-major (row 0 = top). */
export type Grid3x3 = [
  [CellShape, CellShape, CellShape],
  [CellShape, CellShape, CellShape],
  [CellShape, CellShape, CellShape],
]

// ---------------------------------------------------------------------------
// Grid definitions (from scan analysis)
// ---------------------------------------------------------------------------

const E: CellShape = { kind: 'empty' }
const FULL: CellShape = { kind: 'full' }
const qc = (corner: QcCorner): CellShape => ({ kind: 'qc', corner })
const tri = (half: TriHalf): CellShape => ({ kind: 'tri', half })
const qcL = (corner: QcCorner): CellShape => ({ kind: 'qc-large', corner })

/**
 * Example (stem):
 *   (0,1) quarter-circle, centre at bottom-left corner (BL) → fills NE (upper-right)
 *   (1,0) lower-left triangle
 *   (1,1) full square
 *   (2,0) lower-left triangle
 *   (2,1) quarter-circle, centre at top-left corner (TL) → fills SE (lower-right)
 *
 * Area = 2×(π/4) + 2×(1/2) + 1 = π/2 + 2    tuple (2, 2)
 */
export const EXAMPLE_GRID: Grid3x3 = [
  [E,                    qc('BL'),           E],
  [tri('lower-left'),    FULL,               E],
  [tri('lower-left'),    qc('TL'),           E],
]

/**
 * Option A:
 *   4 quarter-circles (one per corner cell) + full square at centre
 *   (0,0) qc BR → fills NW; (0,2) qc BL → fills NE
 *   (2,0) qc TR → fills SW; (2,2) qc TL → fills SE
 *   Area = 4×(π/4) + 1 = π + 1    tuple (4, 1)   ≠ example
 */
export const OPTION_A_GRID: Grid3x3 = [
  [qc('BR'),   E,      qc('BL')],
  [E,          FULL,   E],
  [qc('TR'),   E,      qc('TL')],
]

/**
 * Option B:
 *   Upper-centre upper triangle, full middle row, two lower triangles
 *   Area = 0 QC + 3 full + 3×(1/2) = 9/2    tuple (0, 4.5)   ≠ example
 */
export const OPTION_B_GRID: Grid3x3 = [
  [E,                    tri('upper-right'),  E],
  [FULL,                 FULL,                FULL],
  [tri('lower-left'),    E,                   tri('lower-right')],
]

/**
 * Option C:
 *   Large quarter-circle (radius = 2 cells, centre at top-left corner of grid)
 *   spanning the bottom-left 2×2 region, plus a small QC at top-right.
 *   Area = π (large arc) + π/4 (small) = 5π/4    tuple incompatible with example
 *
 * Rendered as a large-QC at TL origin + a normal QC at (0,2).
 */
export const OPTION_C_GRID: Grid3x3 = [
  [E,           E,     qc('BL')],
  [qcL('TL'),   E,     E],
  [E,           E,     E],
]

/**
 * Option D (ANSWER):
 *   (0,0) quarter-circle centre at BR → fills top-left of cell
 *   (0,2) quarter-circle centre at BL → fills top-right of cell
 *   (1,0) lower-left triangle
 *   (1,2) lower-right triangle
 *   (2,2) full square
 *
 *   Area = 2×(π/4) + 2×(1/2) + 1 = π/2 + 2    tuple (2, 2)   ✓ matches example
 */
export const OPTION_D_GRID: Grid3x3 = [
  [qc('BR'),          E,   qc('BL')],
  [tri('lower-left'), E,   tri('lower-right')],
  [E,                 E,   FULL],
]

// ---------------------------------------------------------------------------
// PaintedGrid — reusable SVG primitive
// ---------------------------------------------------------------------------

const ORANGE = '#ef8a2b'
const STROKE = '#1a1a1a'
const WHITE_BG = '#ffffff'

export interface PaintedGridProps {
  grid: Grid3x3
  /** Edge length of each cell in SVG user-units. Default 36. */
  cellSize?: number
  /** Extra padding around the grid. Default 4. */
  pad?: number
}

/**
 * Draws a 3×3 grid with painted shapes in each cell.
 * Used by both the stem illustration and the option renderer.
 * Pure SVG — no randomness, no side effects.
 */
export function PaintedGrid({ grid, cellSize = 36, pad = 4 }: PaintedGridProps) {
  const N = 3
  const gridSize = N * cellSize
  const svgSize = gridSize + 2 * pad

  return (
    <svg
      viewBox={`0 0 ${svgSize} ${svgSize}`}
      width={svgSize}
      height={svgSize}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* white background */}
      <rect x={0} y={0} width={svgSize} height={svgSize} fill={WHITE_BG} />

      {/* cells */}
      {grid.map((row, ri) =>
        row.map((cell, ci) => {
          const x = pad + ci * cellSize
          const y = pad + ri * cellSize
          const s = cellSize
          return (
            <CellRenderer
              key={`${ri}-${ci}`}
              cell={cell}
              x={x}
              y={y}
              s={s}
              gridOriginX={pad}
              gridOriginY={pad}
              gridSize={gridSize}
            />
          )
        }),
      )}

      {/* grid lines (drawn on top so they're always visible) */}
      {Array.from({ length: N + 1 }, (_, i) => (
        <line
          key={`h${i}`}
          x1={pad}
          y1={pad + i * cellSize}
          x2={pad + gridSize}
          y2={pad + i * cellSize}
          stroke={STROKE}
          strokeWidth={1.8}
        />
      ))}
      {Array.from({ length: N + 1 }, (_, i) => (
        <line
          key={`v${i}`}
          x1={pad + i * cellSize}
          y1={pad}
          x2={pad + i * cellSize}
          y2={pad + gridSize}
          stroke={STROKE}
          strokeWidth={1.8}
        />
      ))}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// CellRenderer
// ---------------------------------------------------------------------------

interface CellRendererProps {
  cell: CellShape
  /** SVG x of cell's top-left corner */
  x: number
  /** SVG y of cell's top-left corner */
  y: number
  /** Cell edge length */
  s: number
  /** SVG x of entire grid's top-left (for large QC) */
  gridOriginX: number
  /** SVG y of entire grid's top-left (for large QC) */
  gridOriginY: number
  /** Pixel size of the entire 3×3 grid */
  gridSize: number
}

function CellRenderer({ cell, x, y, s, gridOriginX, gridOriginY, gridSize }: CellRendererProps) {
  if (cell.kind === 'empty') return null

  if (cell.kind === 'full') {
    return <rect x={x} y={y} width={s} height={s} fill={ORANGE} />
  }

  if (cell.kind === 'tri') {
    let pts: string
    switch (cell.half) {
      case 'lower-left':
        // diagonal from top-right to bottom-left, orange = lower-left triangle
        pts = `${x},${y} ${x},${y + s} ${x + s},${y + s}`
        break
      case 'lower-right':
        // diagonal from top-left to bottom-right, orange = lower-right triangle
        pts = `${x + s},${y} ${x},${y + s} ${x + s},${y + s}`
        break
      case 'upper-left':
        // diagonal from top-right to bottom-left, orange = upper-left triangle
        pts = `${x},${y} ${x + s},${y} ${x},${y + s}`
        break
      case 'upper-right':
        // diagonal from top-left to bottom-right, orange = upper-right triangle
        pts = `${x},${y} ${x + s},${y} ${x + s},${y + s}`
        break
    }
    return <polygon points={pts} fill={ORANGE} />
  }

  if (cell.kind === 'qc') {
    // Arc path: quarter circle with radius = s, centre at one corner of the cell.
    // Area = π·s²/4 (one quarter of the full circle).
    let pathD: string
    switch (cell.corner) {
      case 'TL': {
        // centre at top-left (x, y), arc sweeps from right edge to bottom edge
        const rx = x + s
        const ry = y
        const ex = x
        const ey = y + s
        pathD = `M ${rx},${ry} A ${s},${s} 0 0,1 ${ex},${ey} L ${x},${y} Z`
        break
      }
      case 'TR': {
        // centre at top-right (x+s, y), arc sweeps from bottom edge to left edge
        const rx = x + s
        const ry = y + s
        const ex = x
        const ey = y
        pathD = `M ${rx},${ry} A ${s},${s} 0 0,0 ${ex},${ey} L ${x + s},${y} Z`
        break
      }
      case 'BL': {
        // centre at bottom-left (x, y+s), arc sweeps from top edge to right edge
        const rx = x
        const ry = y
        const ex = x + s
        const ey = y + s
        pathD = `M ${rx},${ry} A ${s},${s} 0 0,0 ${ex},${ey} L ${x},${y + s} Z`
        break
      }
      case 'BR': {
        // centre at bottom-right (x+s, y+s), arc sweeps from left edge to top edge
        const rx = x
        const ry = y + s
        const ex = x + s
        const ey = y
        pathD = `M ${rx},${ry} A ${s},${s} 0 0,1 ${ex},${ey} L ${x + s},${y + s} Z`
        break
      }
    }
    return <path d={pathD} fill={ORANGE} />
  }

  if (cell.kind === 'qc-large') {
    // Large quarter circle: radius = 2×cellSize, centre at one corner of the GRID.
    // Only 'TL' is used in practice (option C).
    const r = 2 * s
    switch (cell.corner) {
      case 'TL': {
        // centre at grid top-left corner; arc sweeps from right side to bottom side
        const cx = gridOriginX
        const cy = gridOriginY
        const endX = cx + r
        const endY = cy
        const startX = cx
        const startY = cy + r
        // Path: start at (cx + r, cy), arc to (cx, cy + r), close back to (cx, cy)
        const pathD = `M ${endX},${endY} A ${r},${r} 0 0,1 ${startX},${startY} L ${cx},${cy} Z`
        // Clip to the visible cells this overlaps (rows 1-2, cols 0-1 only)
        const clipId = `qcL-TL-${cx}-${cy}`
        return (
          <g>
            <defs>
              <clipPath id={clipId}>
                <rect
                  x={gridOriginX}
                  y={gridOriginY}
                  width={gridSize}
                  height={gridSize}
                />
              </clipPath>
            </defs>
            <path d={pathD} fill={ORANGE} clipPath={`url(#${clipId})`} />
          </g>
        )
      }
      default:
        return null
    }
  }

  return null
}

// ---------------------------------------------------------------------------
// Stem illustration (in-card figure shown with the question)
// ---------------------------------------------------------------------------

/**
 * PaintedArea22G3Illustration — draws the EXAMPLE 3×3 grid (stem figure).
 * Shows the problem setup; never reveals the answer.
 */
export default function PaintedArea22G3Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Contoh: grid 3×3 dengan dua busur seperempat lingkaran, dua segitiga setengah, dan satu kotak penuh berwarna oranye."
    >
      <PaintedGrid grid={EXAMPLE_GRID} cellSize={48} pad={6} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Choice renderer (A/B/C/D option drawings)
// ---------------------------------------------------------------------------

const OPTION_GRIDS: Record<string, Grid3x3> = {
  A: OPTION_A_GRID,
  B: OPTION_B_GRID,
  C: OPTION_C_GRID,
  D: OPTION_D_GRID,
}

const OPTION_ARIA: Record<string, string> = {
  A: 'Pilihan A: empat busur seperempat lingkaran dan satu kotak penuh.',
  B: 'Pilihan B: tiga kotak penuh dan tiga segitiga setengah.',
  C: 'Pilihan C: busur seperempat lingkaran besar dan satu busur kecil.',
  D: 'Pilihan D: dua busur seperempat lingkaran, dua segitiga setengah, dan satu kotak penuh.',
}

/**
 * PaintedArea22G3Option — renders one A/B/C/D choice as a drawn 3×3 grid.
 * Registered in CHOICE_RENDERERS for WMI-22F3A-Q5.
 */
export function PaintedArea22G3Option({ choice }: { choice: WmiChoice }) {
  const k = choice.label
  const grid = OPTION_GRIDS[k]
  if (!grid) return <span>{choice.text}</span>
  return (
    <span
      role="img"
      aria-label={OPTION_ARIA[k] ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 2 }}
    >
      <PaintedGrid grid={grid} cellSize={32} pad={4} />
    </span>
  )
}
