// IKMC-22-EC-Q17 — "Wanda's minimum chosen shapes"
//
// The problem figure shows 6 shapes in a single row:
//   1. Small white (outline-only) square
//   2. Large red filled square
//   3. Small red filled triangle (equilateral, pointing up)
//   4. Large white (outline-only) triangle (equilateral, pointing up)
//   5. Large white (outline-only) circle
//   6. Small red filled circle
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── exported constants (re-used by the explainer) ────────────────────────────

export const SVG_W = 480
export const SVG_H = 120
export const RED = '#DC2626'
export const FILL_NONE = '#FFFFFF'
export const STROKE = '#1F2937'

// ── shape geometry ────────────────────────────────────────────────────────────

// Large sizes: square 56×56, triangle base 60, circle r=28
// Small sizes: square 32×32, triangle base 34, circle r=16

type ShapeType = 'square' | 'triangle' | 'circle'

export interface ShapeItemProps {
  cx: number
  cy: number
  type: ShapeType
  large: boolean
  coloured: boolean
}

/**
 * Renders a single shape (square / triangle / circle) at the given centre.
 * Pure render — SSR-safe & deterministic.
 */
export function ShapeItem({ cx, cy, type, large, coloured }: ShapeItemProps) {
  const fill = coloured ? RED : FILL_NONE
  const sw = 2.5

  if (type === 'circle') {
    const r = large ? 28 : 16
    return <circle cx={cx} cy={cy} r={r} fill={fill} stroke={STROKE} strokeWidth={sw} />
  }

  if (type === 'square') {
    const side = large ? 56 : 32
    const x = cx - side / 2
    const y = cy - side / 2
    return <rect x={x} y={y} width={side} height={side} fill={fill} stroke={STROKE} strokeWidth={sw} />
  }

  // triangle — equilateral, pointing up
  const base = large ? 60 : 34
  const height = (base * Math.sqrt(3)) / 2
  const x1 = cx
  const y1 = cy - height * (2 / 3) // apex
  const x2 = cx - base / 2
  const y2 = cy + height * (1 / 3) // bottom-left
  const x3 = cx + base / 2
  const y3 = cy + height * (1 / 3) // bottom-right
  return (
    <polygon
      points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`}
      fill={fill}
      stroke={STROKE}
      strokeWidth={sw}
    />
  )
}

// ── the six shapes from the paper ────────────────────────────────────────────

export const SHAPES: ShapeItemProps[] = [
  { cx: 40,  cy: 60, type: 'square',   large: false, coloured: false }, // 1 small white square
  { cx: 120, cy: 60, type: 'square',   large: true,  coloured: true  }, // 2 large red square
  { cx: 200, cy: 60, type: 'triangle', large: false, coloured: true  }, // 3 small red triangle
  { cx: 280, cy: 60, type: 'triangle', large: true,  coloured: false }, // 4 large white triangle
  { cx: 360, cy: 60, type: 'circle',   large: true,  coloured: false }, // 5 large white circle
  { cx: 440, cy: 60, type: 'circle',   large: false, coloured: true  }, // 6 small red circle
]

// ── default export ────────────────────────────────────────────────────────────

export default function ShapeSet17ECIllustration() {
  return (
    <div className="my-4 flex justify-center">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(480, SVG_W)}
        style={{ display: 'block' }}
        role="img"
        aria-label="Six shapes in a row: small white square, large red square, small red triangle, large white triangle, large white circle, small red circle"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#FFFFFF" />
        {SHAPES.map((s, i) => (
          <ShapeItem key={i} {...s} />
        ))}
      </svg>
    </div>
  )
}
