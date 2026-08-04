/**
 * TriLattice — reusable equilateral-triangle lattice ("triangle grid paper")
 * primitive for WMI/olympiad figures.
 *
 * The triangular sibling of `GridBoard`: same shape of API (a `<g>` plus a
 * viewBox helper), same purity guarantees. Pure SVG render — no framer-motion,
 * no React hooks, no Math.random / Date, SSR-safe (no window/document), so both
 * the illustration AND the explainer can render it and the explainer just adds
 * motion around it.
 *
 * Serves any figure drawn on a triangular / isometric-flat grid:
 *   - the `grid-shaded-area-count` concept (triangle-lattice mode) — the shaded
 *     region is overlaid as a polygon in the same coordinate space
 *   - "how many small triangles make this shape" counting figures
 *   - triangle-tiling / tangram-style dissections and honeycomb rows
 *
 * ## Coordinate system
 * Lattice points are integer pairs `[a, b]` in the skewed basis
 * `u = (1, 0)`, `v = (1/2, √3/2)`, with **b growing downwards** so row 0 is the
 * top row, exactly like `GridBoard`'s rows. Each parallelogram `(a, b)…(a+1, b+1)`
 * splits into two small triangles:
 *   - `up: false` — apex pointing DOWN: `(a,b) (a+1,b) (a,b+1)`
 *   - `up: true`  — apex pointing UP:   `(a+1,b) (a,b+1) (a+1,b+1)`
 * Reading order inside a row is `a` ascending, down-triangle before up-triangle.
 *
 * ## Usage
 * ```tsx
 * const cells = triParallelogram(4, 3)
 * <svg viewBox={triLatticeViewBox(cells, 26)} width={200} aria-hidden="true">
 *   <TriLattice cells={cells} size={26} fill={(c) => (c.up ? '#FFF' : '#FFF9F4')} />
 *   <polygon points={triPolygonPoints(region, 26)} fill="#FFD3B1" stroke="#30598A" />
 * </svg>
 * ```
 */

import type { SVGProps } from 'react'

/** Height of one lattice row, as a multiple of the triangle's side. */
const ROW_HEIGHT = Math.sqrt(3) / 2

/** A small triangle of the lattice. */
export interface TriCell {
  /** Column index in the skewed basis. */
  a: number
  /** Row index, 0 = top. */
  b: number
  /** True for the apex-up triangle of the `(a, b)` parallelogram. */
  up: boolean
}

/** A lattice point as `[a, b]` in the skewed basis. */
export type TriPoint = [number, number]

// ── geometry helpers (exported: callers overlay their own shapes) ─────────────

/** Pixel position of the lattice point `[a, b]` at the given triangle side length. */
export function triPoint(a: number, b: number, size: number): [number, number] {
  return [(a + b / 2) * size, b * ROW_HEIGHT * size]
}

/** The three lattice corners of a cell. */
export function triCellCorners(cell: TriCell): TriPoint[] {
  const { a, b, up } = cell
  return up
    ? [[a + 1, b], [a, b + 1], [a + 1, b + 1]]
    : [[a, b], [a + 1, b], [a, b + 1]]
}

/** An SVG `points` string for any lattice polygon (a cell, or a whole region). */
export function triPolygonPoints(points: readonly TriPoint[], size: number): string {
  return points
    .map(([a, b]) => {
      const [x, y] = triPoint(a, b, size)
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')
}

/** Every cell of a `cols × rows` block of the lattice, in reading order. */
export function triParallelogram(cols: number, rows: number, originA = 0, originB = 0): TriCell[] {
  const out: TriCell[] = []
  for (let b = originB; b < originB + rows; b++) {
    for (let a = originA; a < originA + cols; a++) {
      out.push({ a, b, up: false })
      out.push({ a, b, up: true })
    }
  }
  return out
}

/**
 * The viewBox that exactly frames `cells` (plus `pad` px on every side).
 * The origin is generally NOT `0 0` — a skewed lattice leans left as it goes
 * down — which is what lets callers draw in raw lattice-pixel coordinates.
 */
export function triLatticeViewBox(cells: readonly TriCell[], size: number, pad = 4): string {
  if (cells.length === 0) return `0 0 ${size} ${size}`
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const cell of cells) {
    for (const [a, b] of triCellCorners(cell)) {
      const [x, y] = triPoint(a, b, size)
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
  return `${(minX - pad).toFixed(2)} ${(minY - pad).toFixed(2)} ${(maxX - minX + pad * 2).toFixed(2)} ${(maxY - minY + pad * 2).toFixed(2)}`
}

// ── Props ────────────────────────────────────────────────────────────────────

export interface TriLatticeProps extends Omit<SVGProps<SVGGElement>, 'fill'> {
  /** The small triangles to draw. Build one with `triParallelogram`, or pass your own. */
  cells: TriCell[]
  /**
   * Side length of one small triangle, in SVG units.
   * @default 28
   */
  size?: number
  /**
   * Per-cell background fill. Return `undefined` for the default white.
   */
  fill?: (cell: TriCell) => string | undefined
  /**
   * Per-cell text label, centred at the cell's centroid. Return `undefined` or
   * `''` to leave the cell blank.
   */
  label?: (cell: TriCell) => string | undefined
  /**
   * Gridline stroke colour.
   * @default '#d1d5db'
   */
  gridStroke?: string
  /**
   * Gridline stroke width.
   * @default 1
   */
  gridStrokeWidth?: number
  /** Text colour for `label`. @default '#1F2937' */
  labelColor?: string
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * TriLattice — a field of small equilateral triangles with optional per-cell
 * fill and label.
 *
 * Renders as a `<g>` so it composes inside any `<svg>`; size the container with
 * `triLatticeViewBox(cells, size)`.
 */
export function TriLattice({
  cells,
  size = 28,
  fill,
  label,
  gridStroke = '#d1d5db',
  gridStrokeWidth = 1,
  labelColor = '#1F2937',
  ...rest
}: TriLatticeProps) {
  const fontSize = Math.round(size * 0.3)

  return (
    <g {...rest}>
      {cells.map((cell) => {
        const corners = triCellCorners(cell)
        const key = `${cell.a}-${cell.b}-${cell.up ? 'u' : 'd'}`
        return (
          <polygon
            key={`c-${key}`}
            points={triPolygonPoints(corners, size)}
            fill={fill?.(cell) ?? '#FFFFFF'}
            stroke={gridStroke}
            strokeWidth={gridStrokeWidth}
            strokeLinejoin="round"
          />
        )
      })}
      {label &&
        cells.map((cell) => {
          const text = label(cell)
          if (!text) return null
          const corners = triCellCorners(cell)
          const pixels = corners.map(([a, b]) => triPoint(a, b, size))
          const cx = (pixels[0][0] + pixels[1][0] + pixels[2][0]) / 3
          const cy = (pixels[0][1] + pixels[1][1] + pixels[2][1]) / 3
          return (
            <text
              key={`l-${cell.a}-${cell.b}-${cell.up ? 'u' : 'd'}`}
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={fontSize}
              fontWeight={800}
              fill={labelColor}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {text}
            </text>
          )
        })}
    </g>
  )
}

export default TriLattice
