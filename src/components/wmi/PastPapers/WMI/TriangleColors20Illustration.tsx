// Venn-style shape picture for WMI-20F1A-Q20 — "how many triangles are NOT black?"
//
// Recovered from db/seed/wmi/figures/2020-final-g1-a-q20.jpg: two large
// overlapping outlined circles.
//   left-only region : black circle, black square, black circle  (3 non-triangles)
//   overlap region   : 2 black triangles
//   right-only region: 1 white (outline) triangle on top, 3 gray triangles
// Triangles in all: 2 black + 1 white + 3 gray = 6. Not black: 1 + 3 = 4.

export type ShapeFill = 'black' | 'white' | 'gray'
export type ShapeForm = 'circle' | 'square' | 'triangle'

export interface VennShape {
  key: string
  form: ShapeForm
  fill: ShapeFill
  cx: number
  cy: number
}

// Stable keys for every small shape in the picture.
export const VENN_SHAPES: VennShape[] = [
  // left-only region (all black, none are triangles)
  { key: 'circle-1', form: 'circle', fill: 'black', cx: 72, cy: 70 },
  { key: 'square-1', form: 'square', fill: 'black', cx: 96, cy: 124 },
  { key: 'circle-2', form: 'circle', fill: 'black', cx: 80, cy: 180 },
  // overlap region (2 black triangles)
  { key: 'tri-black-1', form: 'triangle', fill: 'black', cx: 205, cy: 92 },
  { key: 'tri-black-2', form: 'triangle', fill: 'black', cx: 205, cy: 156 },
  // right-only region (1 white on top, 3 gray below)
  { key: 'tri-white', form: 'triangle', fill: 'white', cx: 312, cy: 58 },
  { key: 'tri-gray-1', form: 'triangle', fill: 'gray', cx: 348, cy: 116 },
  { key: 'tri-gray-2', form: 'triangle', fill: 'gray', cx: 296, cy: 152 },
  { key: 'tri-gray-3', form: 'triangle', fill: 'gray', cx: 352, cy: 178 },
]

export const TRIANGLE_KEYS = VENN_SHAPES.filter((s) => s.form === 'triangle').map((s) => s.key)
export const NON_BLACK_TRIANGLE_KEYS = VENN_SHAPES.filter((s) => s.form === 'triangle' && s.fill !== 'black').map(
  (s) => s.key,
)
export const ANSWER = NON_BLACK_TRIANGLE_KEYS.length // 4

export const VENN_VIEW_W = 420
export const VENN_VIEW_H = 248

const LEFT_CIRCLE = { cx: 132, cy: 124, r: 108 }
const RIGHT_CIRCLE = { cx: 288, cy: 124, r: 108 }

const INK = '#1F2937'
const GRAY = '#9CA3AF'
const AMBER = '#F59E0B'
const GREEN = '#10B981'
const RED = '#EF4444'
const SHAPE_R = 17

/** One small shape glyph centred at (cx, cy). */
function SmallShape({ shape, dim }: { shape: VennShape; dim: boolean }) {
  const { form, fill, cx, cy } = shape
  const r = SHAPE_R
  const fillColor = fill === 'black' ? INK : fill === 'gray' ? GRAY : '#FFFFFF'
  const stroke = INK
  const opacity = dim ? 0.25 : 1

  if (form === 'circle') {
    return <circle cx={cx} cy={cy} r={r - 1} fill={fillColor} stroke={stroke} strokeWidth={2} opacity={opacity} />
  }
  if (form === 'square') {
    const s = r * 1.7
    return <rect x={cx - s / 2} y={cy - s / 2} width={s} height={s} fill={fillColor} stroke={stroke} strokeWidth={2} opacity={opacity} />
  }
  const pts = `${cx},${cy - r} ${cx - r * 1.05},${cy + r * 0.85} ${cx + r * 1.05},${cy + r * 0.85}`
  return <polygon points={pts} fill={fillColor} stroke={stroke} strokeWidth={2} strokeLinejoin="round" opacity={opacity} />
}

/** Green check (counted) or red X (excluded) badge at a shape's top-right. */
function Badge({ shape, counted }: { shape: VennShape; counted: boolean }) {
  const bx = shape.cx + SHAPE_R - 2
  const by = shape.cy - SHAPE_R + 2
  return (
    <g>
      <circle cx={bx} cy={by} r={9} fill={counted ? GREEN : RED} stroke="#FFFFFF" strokeWidth={1.5} />
      {counted ? (
        <path d={`M ${bx - 4} ${by} l 3 3.5 l 5.5 -6.5`} fill="none" stroke="#FFFFFF" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <g stroke="#FFFFFF" strokeWidth={2.2} strokeLinecap="round">
          <line x1={bx - 3.5} y1={by - 3.5} x2={bx + 3.5} y2={by + 3.5} />
          <line x1={bx + 3.5} y1={by - 3.5} x2={bx - 3.5} y2={by + 3.5} />
        </g>
      )}
    </g>
  )
}

export interface VennDiagramProps {
  /** Shapes (by key) to ring in amber. */
  highlightKeys?: string[]
  /** Fade the big circles, the black circles and the square — triangles only. */
  dimNonTriangles?: boolean
  /** key → true shows a green check (counted), false a red X (excluded). */
  badges?: Record<string, boolean>
}

export function VennDiagram({ highlightKeys = [], dimNonTriangles = false, badges = {} }: VennDiagramProps) {
  const ringSet = new Set(highlightKeys)
  return (
    <svg
      viewBox={`0 0 ${VENN_VIEW_W} ${VENN_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 420, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* the two big outlined circles */}
      <g opacity={dimNonTriangles ? 0.3 : 1}>
        <circle cx={LEFT_CIRCLE.cx} cy={LEFT_CIRCLE.cy} r={LEFT_CIRCLE.r} fill="none" stroke={INK} strokeWidth={2.5} />
        <circle cx={RIGHT_CIRCLE.cx} cy={RIGHT_CIRCLE.cy} r={RIGHT_CIRCLE.r} fill="none" stroke={INK} strokeWidth={2.5} />
      </g>

      {VENN_SHAPES.map((shape) => (
        <g key={shape.key}>
          <SmallShape shape={shape} dim={dimNonTriangles && shape.form !== 'triangle'} />
          {ringSet.has(shape.key) && (
            <circle cx={shape.cx} cy={shape.cy} r={SHAPE_R + 8} fill="none" stroke={AMBER} strokeWidth={3} />
          )}
          {shape.key in badges && <Badge shape={shape} counted={badges[shape.key]} />}
        </g>
      ))}
    </svg>
  )
}

export default function TriangleColors20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Two overlapping circles holding small shapes. Left part: two black circles and a black square. Overlap: two black triangles. Right part: one white triangle and three gray triangles."
    >
      <VennDiagram />
    </div>
  )
}
