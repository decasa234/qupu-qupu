/**
 * Polyomino — generic, SSR-safe SVG primitive for cell-list shapes.
 *
 * Pure SVG. No framer-motion, no hooks, no Math.random, no window/document.
 *
 * @example Filled L-tetromino
 * ```tsx
 * <Polyomino cells={[[0,0],[1,0],[2,0],[2,1]]} cellSize={36} fill="#FFD3B1" stroke="#30598A" />
 * ```
 *
 * @example Matchstick outline of the same shape
 * ```tsx
 * <Polyomino cells={[[0,0],[1,0],[2,0],[2,1]]} mode="matchstick" cellSize={28} />
 * ```
 *
 * ## Coordinate system
 * `cells` are `[row, col]` pairs (row 0 = top, col 0 = left). The viewBox is
 * auto-normalised to the cells' bounding box plus `pad` on each side.
 *
 * ## Props
 * | Prop        | Type                        | Default        | Description |
 * |-------------|-----------------------------|-  ------------|-------------|
 * | cells       | [number,number][]           | required       | Cell list as [row, col] pairs |
 * | cellSize    | number                      | 32             | Pixels per grid cell |
 * | pad         | number                      | 6              | Padding inside the SVG |
 * | fill        | string                      | "#FFD3B1"      | Cell background (filled mode) |
 * | stroke      | string                      | "#30598A"      | Cell/edge outline colour |
 * | strokeWidth | number                      | 2              | Stroke weight in px |
 * | mode        | "filled" \| "matchstick"    | "filled"       | Rendering style |
 * | showGrid    | boolean                     | true (filled)  | Draw internal cell borders in filled mode |
 * | label       | string                      | undefined      | aria-label on the <svg> |
 */

export type PolyominoCell = [number, number] // [row, col]

export interface PolyominoProps {
  /** Shape cells as [row, col] pairs (row 0 = top, col 0 = left). */
  cells: PolyominoCell[]
  /** Pixels per grid cell. @default 32 */
  cellSize?: number
  /** Padding around the shape inside the SVG. @default 6 */
  pad?: number
  /** Fill colour for cells in "filled" mode. @default "#FFD3B1" */
  fill?: string
  /** Stroke colour for outlines / matchstick edges. @default "#30598A" */
  stroke?: string
  /** Stroke width in px. @default 2 */
  strokeWidth?: number
  /**
   * Rendering mode.
   * - "filled" — every cell is a filled rectangle (optionally with inner grid borders).
   * - "matchstick" — only the outer-boundary edges are drawn as lines (deduped),
   *   with small circles at each node vertex.
   * @default "filled"
   */
  mode?: 'filled' | 'matchstick'
  /**
   * Draw internal cell borders in "filled" mode.
   * Has no effect in "matchstick" mode.
   * @default true
   */
  showGrid?: boolean
  /** aria-label for the <svg> element. */
  label?: string
}

// ─── Geometry helpers ────────────────────────────────────────────────────────

function bbox(cells: PolyominoCell[]): { minR: number; minC: number; maxR: number; maxC: number } {
  let minR = Infinity, minC = Infinity, maxR = -Infinity, maxC = -Infinity
  for (const [r, c] of cells) {
    if (r < minR) minR = r
    if (c < minC) minC = c
    if (r > maxR) maxR = r
    if (c > maxC) maxC = c
  }
  return { minR, minC, maxR, maxC }
}

/**
 * Returns the deduplicated set of outer boundary edges for `cells`.
 *
 * Each edge is expressed in **grid coordinates** as [x1,y1,x2,y2] where
 * x = column-corner offset and y = row-corner offset (both in cell units).
 *
 * Algorithm: collect all four edges of each cell. An edge is shared by two
 * adjacent cells iff it appears twice — emit only those that appear exactly once.
 *
 * @example
 * ```ts
 * const edges = cellEdges([[0,0],[1,0]])
 * // 7 edges (two squares share one bottom/top edge, so 4+4-1 = 7)
 * ```
 */
export function cellEdges(cells: PolyominoCell[]): Array<[number, number, number, number]> {
  // Key a segment so order of endpoints doesn't matter
  function edgeKey(x1: number, y1: number, x2: number, y2: number): string {
    return x1 < x2 || (x1 === x2 && y1 <= y2)
      ? `${x1},${y1};${x2},${y2}`
      : `${x2},${y2};${x1},${y1}`
  }

  const counts = new Map<string, { edge: [number, number, number, number]; count: number }>()

  for (const [r, c] of cells) {
    // Four edges in (col, row) corner coords: top, right, bottom, left
    const edges: Array<[number, number, number, number]> = [
      [c,   r,   c+1, r  ], // top
      [c+1, r,   c+1, r+1], // right
      [c,   r+1, c+1, r+1], // bottom
      [c,   r,   c,   r+1], // left
    ]
    for (const [x1, y1, x2, y2] of edges) {
      const k = edgeKey(x1, y1, x2, y2)
      const existing = counts.get(k)
      if (existing) {
        existing.count++
      } else {
        counts.set(k, { edge: [x1, y1, x2, y2], count: 1 })
      }
    }
  }

  // Keep only boundary edges (appeared exactly once = not shared between two cells)
  return Array.from(counts.values())
    .filter(({ count }) => count === 1)
    .map(({ edge }) => edge)
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Renders a polyomino (or any cell-list shape) as a self-contained SVG.
 * The viewBox auto-normalises to the cells' bounding box.
 *
 * @example Filled with internal grid lines
 * ```tsx
 * <Polyomino cells={[[0,0],[1,0],[2,0],[2,1]]} fill="#FFD3B1" stroke="#30598A" />
 * ```
 *
 * @example Matchstick outline only
 * ```tsx
 * <Polyomino cells={[[0,0],[1,0],[2,0],[2,1]]} mode="matchstick" stroke="#C8956C" />
 * ```
 */
export function Polyomino({
  cells,
  cellSize = 32,
  pad = 6,
  fill = '#FFD3B1',
  stroke = '#30598A',
  strokeWidth = 2,
  mode = 'filled',
  showGrid = true,
  label,
}: PolyominoProps) {
  if (cells.length === 0) return null

  const { minR, minC, maxR, maxC } = bbox(cells)
  const spanR = maxR - minR + 1
  const spanC = maxC - minC + 1

  const vbW = spanC * cellSize + pad * 2
  const vbH = spanR * cellSize + pad * 2

  // Translate a grid [row, col] corner to SVG pixel coords
  const px = (c: number) => pad + (c - minC) * cellSize
  const py = (r: number) => pad + (r - minR) * cellSize

  if (mode === 'matchstick') {
    const edges = cellEdges(cells)

    // Collect unique corner nodes for dot markers
    const nodeSeen = new Set<string>()
    const nodes: Array<[number, number]> = []
    for (const [r, c] of cells) {
      for (const [cx, cy] of [[c, r], [c+1, r], [c+1, r+1], [c, r+1]] as [number,number][]) {
        const k = `${cx},${cy}`
        if (!nodeSeen.has(k)) {
          nodeSeen.add(k)
          nodes.push([cx, cy])
        }
      }
    }

    const dotR = Math.max(2, strokeWidth * 0.9)

    return (
      <svg
        viewBox={`0 0 ${vbW} ${vbH}`}
        width={vbW}
        height={vbH}
        role="presentation"
        aria-label={label}
        style={{ display: 'block' }}
      >
        {edges.map(([x1, y1, x2, y2], i) => (
          <line
            key={`e${i}`}
            x1={px(x1)}
            y1={py(y1)}
            x2={px(x2)}
            y2={py(y2)}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        ))}
        {nodes.map(([cx, cy], i) => (
          <circle
            key={`n${i}`}
            cx={px(cx)}
            cy={py(cy)}
            r={dotR}
            fill={stroke}
          />
        ))}
      </svg>
    )
  }

  // mode === 'filled'
  return (
    <svg
      viewBox={`0 0 ${vbW} ${vbH}`}
      width={vbW}
      height={vbH}
      role="presentation"
      aria-label={label}
      style={{ display: 'block' }}
    >
      {cells.map(([r, c], i) => (
        <rect
          key={i}
          x={px(c)}
          y={py(r)}
          width={cellSize}
          height={cellSize}
          fill={fill}
          stroke={showGrid ? stroke : 'none'}
          strokeWidth={showGrid ? strokeWidth : 0}
        />
      ))}
      {/* When showGrid is off, draw only the outer boundary edges */}
      {!showGrid && cellEdges(cells).map(([x1, y1, x2, y2], i) => (
        <line
          key={`b${i}`}
          x1={px(x1)}
          y1={py(y1)}
          x2={px(x2)}
          y2={py(y2)}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="square"
        />
      ))}
    </svg>
  )
}

export default Polyomino
