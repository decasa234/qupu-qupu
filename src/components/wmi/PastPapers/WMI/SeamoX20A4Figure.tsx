/**
 * SEAMO-X 2020 Paper A Q4 — shared SVG primitive for the rectangle-counting figure.
 *
 * The figure is a large outer rectangle subdivided by internal lines:
 *   • A full-height vertical line at x = 2/3 W  (splits left vs right column)
 *   • Two horizontal lines at y = 1/3 H and y = 2/3 H on the LEFT column only
 *   • One horizontal line at y = 1/2 H on the RIGHT column only
 *   • One short vertical line at x = 5/6 W from y = 1/2 H to y = H (bottom-right)
 *
 * This gives 6 atomic cells and 12 total rectangles.
 *
 * Pure SVG, SSR-safe: no hooks, no framer-motion.
 */

// ── geometry constants ────────────────────────────────────────────────────────
export const VW = 360
export const VH = 200

// x-coordinates (SVG units)
export const X0 = 0          // left border
export const X1 = 240        // main vertical divider (2/3 of 360)
export const X2 = 300        // sub-vertical in bottom-right (5/6 of 360)
export const X3 = 360        // right border

// y-coordinates (SVG units)
export const YA = 0          // top border
export const YB = 67         // left-col first horizontal (~1/3 of 200)
export const YC = 100        // right-col horizontal midpoint (1/2 of 200)
export const YD = 133        // left-col second horizontal (~2/3 of 200)
export const YE = 200        // bottom border

// colours
const FILL_GOLD   = '#F59E0B'   // amber-400 — matches the source figure
const STROKE_DARK = '#1C1917'   // near-black for lines

// ── Props ─────────────────────────────────────────────────────────────────────

/** Which cells to highlight (amber tint + ring) for the explainer beats. */
export type CellId = 'L1' | 'L2' | 'L3' | 'R-top' | 'R-bl' | 'R-br'

export interface SeamoX20A4FigureSVGProps {
  /** Cells to highlight with an amber ring (explainer use). */
  highlighted?: CellId[]
  /** Rectangle span to highlight with a green ring (shows "this rectangle"). */
  rectHighlight?: { x: number; y: number; w: number; h: number } | null
}

// ── Shared SVG primitive ───────────────────────────────────────────────────────

export function SeamoX20A4FigureSVG({
  highlighted = [],
  rectHighlight = null,
}: SeamoX20A4FigureSVGProps) {
  // Atomic cells: [x, y, w, h, id]
  const cells: Array<{ x: number; y: number; w: number; h: number; id: CellId }> = [
    { x: X0, y: YA, w: X1 - X0, h: YB - YA, id: 'L1' },
    { x: X0, y: YB, w: X1 - X0, h: YD - YB, id: 'L2' },
    { x: X0, y: YD, w: X1 - X0, h: YE - YD, id: 'L3' },
    { x: X1, y: YA, w: X3 - X1, h: YC - YA, id: 'R-top' },
    { x: X1, y: YC, w: X2 - X1, h: YE - YC, id: 'R-bl' },
    { x: X2, y: YC, w: X3 - X2, h: YE - YC, id: 'R-br' },
  ]

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: VW, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Cell fills */}
      {cells.map(({ x, y, w, h, id }) => {
        const isHighlighted = highlighted.includes(id)
        return (
          <rect
            key={id}
            x={x}
            y={y}
            width={w}
            height={h}
            fill={isHighlighted ? '#FDE68A' : FILL_GOLD}
            stroke={STROKE_DARK}
            strokeWidth={3}
          />
        )
      })}

      {/* Rectangle highlight overlay (green ring — shown during explainer) */}
      {rectHighlight && (
        <rect
          x={rectHighlight.x + 4}
          y={rectHighlight.y + 4}
          width={rectHighlight.w - 8}
          height={rectHighlight.h - 8}
          fill="none"
          stroke="#10B981"
          strokeWidth={4}
          strokeDasharray="10 4"
          rx={2}
        />
      )}
    </svg>
  )
}

// re-export geometry so explainer can compose rectangle coords
export const CELLS = {
  L1:    { x: X0, y: YA, w: X1 - X0, h: YB - YA },
  L2:    { x: X0, y: YB, w: X1 - X0, h: YD - YB },
  L3:    { x: X0, y: YD, w: X1 - X0, h: YE - YD },
  'R-top': { x: X1, y: YA, w: X3 - X1, h: YC - YA },
  'R-bl':  { x: X1, y: YC, w: X2 - X1, h: YE - YC },
  'R-br':  { x: X2, y: YC, w: X3 - X2, h: YE - YC },
}

// All 12 valid rectangles as [x, y, w, h] — used to animate each during the explainer
export const ALL_RECTS: Array<{ x: number; y: number; w: number; h: number }> = [
  // 6 single cells
  { x: X0, y: YA, w: X1 - X0, h: YB - YA },   // L1
  { x: X0, y: YB, w: X1 - X0, h: YD - YB },   // L2
  { x: X0, y: YD, w: X1 - X0, h: YE - YD },   // L3
  { x: X1, y: YA, w: X3 - X1, h: YC - YA },   // R-top
  { x: X1, y: YC, w: X2 - X1, h: YE - YC },   // R-bl
  { x: X2, y: YC, w: X3 - X2, h: YE - YC },   // R-br
  // 3 left-column multi-row spans
  { x: X0, y: YA, w: X1 - X0, h: YD - YA },   // L1+L2
  { x: X0, y: YB, w: X1 - X0, h: YE - YB },   // L2+L3
  { x: X0, y: YA, w: X1 - X0, h: YE - YA },   // L1+L2+L3
  // 2 right-column multi-cell spans
  { x: X1, y: YC, w: X3 - X1, h: YE - YC },   // R-bl + R-br
  { x: X1, y: YA, w: X3 - X1, h: YE - YA },   // full right column
  // 1 whole-figure rectangle
  { x: X0, y: YA, w: X3 - X0, h: YE - YA },   // entire figure
]
