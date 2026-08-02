/**
 * GridBoard — reusable N×M SVG grid primitive for WMI/IKMC illustration figures.
 *
 * Consolidates the repeating grid pattern found in:
 *   - GrayGrid24G2Illustration (8×9, per-cell fill)
 *   - ColorSquares14PEIllustration (2×3, per-cell fill + label)
 *   - Boxes13PEIllustration (6×5, per-cell fill + header labels)
 *   - SumGrid12ECIllustration (3×3, row/col sums + cell text + highlight rings)
 *   - CardsGrid17PEIllustration (3×3, per-cell highlight tints)
 *
 * Pure SVG render — no framer-motion, no React hooks, SSR-safe (no window/document).
 *
 * @example
 * // 3×3 number grid with row sums and a red-ringed mistake cell
 * <svg viewBox="0 0 …" width="…">
 *   <GridBoard
 *     rows={3}
 *     cols={3}
 *     cellSize={58}
 *     label={(r, c) => String(data[r][c])}
 *     highlight={(r, c) => (r === 1 && c === 0 ? 'red' : 'none')}
 *     rowSums={['15', '16', '15']}
 *     colSums={['16', '15', '15']}
 *   />
 * </svg>
 */

import type { SVGProps } from 'react'

// ── highlight colour tokens ────────────────────────────────────────────────────

const HIGHLIGHT_FILLS: Record<string, string> = {
  amber: '#FEF3C7',   // amber-100 tint wash
  green: '#D1FAE5',   // emerald-100 tint wash
  red:   '#FEE2E2',   // red-100 tint wash
}

const HIGHLIGHT_RING_STROKES: Record<string, string> = {
  ring:  '#374151',   // gray-700 — neutral border ring
  amber: '#D97706',   // amber-600
  green: '#10B981',   // emerald-500
  red:   '#EF4444',   // red-500
}

// ── Cage groups ───────────────────────────────────────────────────────────────

/**
 * A group of cells drawn with one bold outline around the union of its cells —
 * a KenKen/sudoku "cage" or a thick sudoku box. The group need not be a
 * rectangle: only the edges that separate a member cell from a non-member are
 * stroked, so any polyomino outlines correctly.
 */
export interface CageGroup {
  /** Member cells as `[row, col]` pairs, 0-indexed. Order does not matter. */
  cells: [number, number][]
  /**
   * Small clue printed in the top-left corner of the group's top-left cell
   * (e.g. `"5+"`). Omit for a plain outline such as a sudoku box.
   */
  label?: string
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface GridBoardProps extends Omit<SVGProps<SVGGElement>, 'fill'> {
  /** Number of rows. */
  rows: number
  /** Number of columns. */
  cols: number
  /**
   * Cell size in SVG units (square cells).
   * @default 40
   */
  cellSize?: number
  /**
   * Per-cell background fill. Return `undefined` to use the default white fill.
   * `(r, c)` are 0-indexed; r=0 is the top row, c=0 is the left column.
   */
  fill?: (r: number, c: number) => string | undefined
  /**
   * Per-cell text label drawn centred inside the cell.
   * Return `undefined` or `''` to leave the cell blank.
   */
  label?: (r: number, c: number) => string | undefined
  /**
   * Per-cell highlight mode.
   * - `'none'`  — no overlay (default).
   * - `'ring'`  — stroke-only ring inside the cell (neutral dark border).
   * - `'amber'` — amber tint fill + amber ring stroke.
   * - `'green'` — green tint fill + green ring stroke.
   * - `'red'`   — red tint fill + red ring stroke.
   */
  highlight?: (r: number, c: number) => 'none' | 'ring' | 'amber' | 'green' | 'red'
  /**
   * One label per row displayed to the right of the grid (e.g. row sums).
   * Length must equal `rows` if provided.
   */
  rowSums?: string[]
  /**
   * One label per column displayed below the grid (e.g. column sums).
   * Length must equal `cols` if provided.
   */
  colSums?: string[]
  /**
   * Gridline stroke colour.
   * @default '#d1d5db'
   */
  gridStroke?: string
  /**
   * Bold outlines around irregular groups of cells (KenKen cages, sudoku
   * boxes), drawn on top of the gridlines and under the cell labels. Purely
   * additive: omit it and the grid renders exactly as before.
   */
  cageBorders?: CageGroup[]
  /**
   * Stroke colour for `cageBorders`.
   * @default '#1F2937'
   */
  cageStroke?: string
  /**
   * Stroke width for `cageBorders`.
   * @default 3
   */
  cageStrokeWidth?: number
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * GridBoard — N×M SVG grid of cells with optional per-cell fill, label,
 * highlight overlay, and row/column sum labels.
 *
 * Renders as a `<g>` element so it can be composed inside any `<svg>` viewBox.
 * The caller is responsible for sizing the `<svg>` container; use
 * `gridBoardViewBox(rows, cols, cellSize?, rowSums?, colSums?)` to obtain a
 * correctly dimensioned viewBox string.
 *
 * @example
 * // Minimal 3×3 usage (all cells white, no labels)
 * const vb = gridBoardViewBox(3, 3)
 * <svg viewBox={vb} width="140" aria-hidden="true">
 *   <GridBoard rows={3} cols={3} />
 * </svg>
 */
export function GridBoard({
  rows,
  cols,
  cellSize = 40,
  fill,
  label,
  highlight,
  rowSums,
  colSums,
  gridStroke = '#d1d5db',
  cageBorders,
  cageStroke = '#1F2937',
  cageStrokeWidth = 3,
  ...rest
}: GridBoardProps) {
  const SUM_OFFSET = cellSize * 0.6   // distance from grid edge to sum label centre
  const FONT_SIZE  = Math.round(cellSize * 0.38)
  const SUM_FONT   = Math.round(cellSize * 0.36)
  const CAGE_FONT  = Math.round(cellSize * 0.26)
  const RING_INSET = 3
  const RING_RX    = 3

  return (
    <g {...rest}>
      {/* ── background fill rects ── */}
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (__, c) => {
          const cellFill = fill?.(r, c) ?? '#FFFFFF'
          return (
            <rect
              key={`bg-${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill={cellFill}
            />
          )
        }),
      )}

      {/* ── highlight overlays (tint + ring) ── */}
      {highlight &&
        Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (__, c) => {
            const mode = highlight(r, c)
            if (!mode || mode === 'none') return null
            const tintFill = HIGHLIGHT_FILLS[mode]   // undefined for 'ring' → no fill
            const ringStroke = HIGHLIGHT_RING_STROKES[mode]
            return (
              <g key={`hl-${r}-${c}`}>
                {tintFill && (
                  <rect
                    x={c * cellSize}
                    y={r * cellSize}
                    width={cellSize}
                    height={cellSize}
                    fill={tintFill}
                  />
                )}
                <rect
                  x={c * cellSize + RING_INSET}
                  y={r * cellSize + RING_INSET}
                  width={cellSize - RING_INSET * 2}
                  height={cellSize - RING_INSET * 2}
                  fill="none"
                  stroke={ringStroke}
                  strokeWidth={2.5}
                  rx={RING_RX}
                />
              </g>
            )
          }),
        )}

      {/* ── gridlines ── */}
      {/* horizontal lines */}
      {Array.from({ length: rows + 1 }, (_, i) => (
        <line
          key={`h-${i}`}
          x1={0}
          y1={i * cellSize}
          x2={cols * cellSize}
          y2={i * cellSize}
          stroke={gridStroke}
          strokeWidth={1}
        />
      ))}
      {/* vertical lines */}
      {Array.from({ length: cols + 1 }, (_, i) => (
        <line
          key={`v-${i}`}
          x1={i * cellSize}
          y1={0}
          x2={i * cellSize}
          y2={rows * cellSize}
          stroke={gridStroke}
          strokeWidth={1}
        />
      ))}

      {/* ── cage outlines (union boundary of each group) + corner clues ── */}
      {cageBorders?.map((group, g) => {
        const member = new Set(group.cells.map(([r, c]) => `${r},${c}`))
        const has = (r: number, c: number) => member.has(`${r},${c}`)
        // An edge belongs to the boundary exactly when the cell across it is
        // not in the group — that is what makes any polyomino outline right.
        const edges: { x1: number; y1: number; x2: number; y2: number }[] = []
        for (const [r, c] of group.cells) {
          const x = c * cellSize
          const y = r * cellSize
          if (!has(r - 1, c)) edges.push({ x1: x, y1: y, x2: x + cellSize, y2: y })
          if (!has(r + 1, c)) edges.push({ x1: x, y1: y + cellSize, x2: x + cellSize, y2: y + cellSize })
          if (!has(r, c - 1)) edges.push({ x1: x, y1: y, x2: x, y2: y + cellSize })
          if (!has(r, c + 1)) edges.push({ x1: x + cellSize, y1: y, x2: x + cellSize, y2: y + cellSize })
        }
        // Top-left member cell, in reading order — where the clue is printed.
        const anchor = group.cells.reduce(
          (best, cell) => (cell[0] < best[0] || (cell[0] === best[0] && cell[1] < best[1]) ? cell : best),
          group.cells[0] ?? [0, 0],
        )
        return (
          <g key={`cage-${g}`}>
            {edges.map((e, i) => (
              <line
                key={`ce-${i}`}
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                stroke={cageStroke}
                strokeWidth={cageStrokeWidth}
                strokeLinecap="square"
              />
            ))}
            {group.label && (
              <text
                x={anchor[1] * cellSize + cellSize * 0.13}
                y={anchor[0] * cellSize + cellSize * 0.2}
                textAnchor="start"
                dominantBaseline="central"
                fontSize={CAGE_FONT}
                fontWeight={800}
                fill={cageStroke}
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {group.label}
              </text>
            )}
          </g>
        )
      })}

      {/* ── cell labels ── */}
      {label &&
        Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (__, c) => {
            const text = label(r, c)
            if (!text) return null
            return (
              <text
                key={`lbl-${r}-${c}`}
                x={c * cellSize + cellSize / 2}
                y={r * cellSize + cellSize / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={FONT_SIZE}
                fontWeight={800}
                fill="#1F2937"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {text}
              </text>
            )
          }),
        )}

      {/* ── row sum labels (right of grid) ── */}
      {rowSums?.map((sum, r) => (
        <text
          key={`rs-${r}`}
          x={cols * cellSize + SUM_OFFSET}
          y={r * cellSize + cellSize / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={SUM_FONT}
          fontWeight={900}
          fill="#374151"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {sum}
        </text>
      ))}

      {/* ── column sum labels (below grid) ── */}
      {colSums?.map((sum, c) => (
        <text
          key={`cs-${c}`}
          x={c * cellSize + cellSize / 2}
          y={rows * cellSize + SUM_OFFSET}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={SUM_FONT}
          fontWeight={900}
          fill="#374151"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {sum}
        </text>
      ))}
    </g>
  )
}

// ── viewBox helper ─────────────────────────────────────────────────────────────

/**
 * Computes the correct SVG `viewBox` string for a GridBoard at the given
 * dimensions, automatically expanding for row/col sum labels when provided.
 *
 * @example
 * const vb = gridBoardViewBox(3, 3, 58, ['15','16','15'], ['16','15','15'])
 * // → "0 0 232 232"
 * <svg viewBox={vb} width="232" aria-hidden="true">
 *   <GridBoard rows={3} cols={3} cellSize={58} rowSums={…} colSums={…} />
 * </svg>
 */
export function gridBoardViewBox(
  rows: number,
  cols: number,
  cellSize = 40,
  rowSums?: string[],
  colSums?: string[],
): string {
  const SUM_GUTTER = Math.round(cellSize * 0.6)
  const extraW = rowSums && rowSums.length > 0 ? SUM_GUTTER * 2 : 0
  const extraH = colSums && colSums.length > 0 ? SUM_GUTTER * 2 : 0
  const w = cols * cellSize + extraW
  const h = rows * cellSize + extraH
  return `0 0 ${w} ${h}`
}
