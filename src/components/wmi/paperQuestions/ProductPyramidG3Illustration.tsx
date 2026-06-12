// Product pyramid for WMI-19F3A-Q12. Reconstructed from
// db/seed/wmi/figures/2019-final-g3-a-q12.jpg:
//
//            [★]
//        (24)    [R]
//     (6)   [M]    (2)
//   (2)(3)       (2)(1)
//
// Circles are givens, boxes unknowns. Each number is the PRODUCT of the two
// directly below it. Givens check out: 6 = 2 × 3 and 2 = 2 × 1. Then
// M = 24 ÷ 6 = 4 (because 24 = 6 × M), R = M × 2 = 8, ★ = 24 × 8 = 192.

export const PP_M = 4
export const PP_R = 8
export const PP_STAR = 192

const INK = '#1F2937'
const GREEN = '#10B981'
const GRAY = '#9CA3AF'

export const PP_VIEW_W = 320
export const PP_VIEW_H = 270

interface Node {
  key: string
  x: number
  y: number
  shape: 'circle' | 'box'
  given?: number
}

export const PP_NODES: ReadonlyArray<Node> = [
  { key: 'star', x: 160, y: 36, shape: 'box' },
  { key: 'l24', x: 110, y: 100, shape: 'circle', given: 24 },
  { key: 'r', x: 210, y: 100, shape: 'box' },
  { key: 'l6', x: 62, y: 164, shape: 'circle', given: 6 },
  { key: 'm', x: 160, y: 164, shape: 'box' },
  { key: 'r2', x: 258, y: 164, shape: 'circle', given: 2 },
  { key: 'b2a', x: 32, y: 228, shape: 'circle', given: 2 },
  { key: 'b3', x: 92, y: 228, shape: 'circle', given: 3 },
  { key: 'b2b', x: 228, y: 228, shape: 'circle', given: 2 },
  { key: 'b1', x: 288, y: 228, shape: 'circle', given: 1 },
]

const EDGES: ReadonlyArray<[string, string]> = [
  ['star', 'l24'], ['star', 'r'],
  ['l24', 'l6'], ['l24', 'm'],
  ['r', 'm'], ['r', 'r2'],
  ['l6', 'b2a'], ['l6', 'b3'],
  ['r2', 'b2b'], ['r2', 'b1'],
]

const R_NODE = 24

export interface ProductPyramidFigureProps {
  /** Revealed unknowns: m (4), r (8), star (192). */
  m?: number | null
  r?: number | null
  star?: number | null
  /** Node keys being reasoned about (green ring). */
  activeKeys?: string[]
  /** Node keys being "looked at" (amber dashed ring). */
  litKeys?: string[]
}

export function ProductPyramidFigure({ m = null, r = null, star = null, activeKeys = [], litKeys = [] }: ProductPyramidFigureProps) {
  const active = new Set(activeKeys)
  const lit = new Set(litKeys)
  const valueOf = (n: Node): string | null => {
    if (n.given !== undefined) return String(n.given)
    if (n.key === 'm') return m != null ? String(m) : null
    if (n.key === 'r') return r != null ? String(r) : null
    if (n.key === 'star') return star != null ? String(star) : null
    return null
  }
  const pos = new Map(PP_NODES.map((n) => [n.key, n]))

  return (
    <svg viewBox={`0 0 ${PP_VIEW_W} ${PP_VIEW_H}`} width="100%" style={{ maxWidth: 340, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {EDGES.map(([a, b]) => {
        const na = pos.get(a)!
        const nb = pos.get(b)!
        return <line key={`${a}-${b}`} x1={na.x} y1={na.y + R_NODE - 4} x2={nb.x} y2={nb.y - R_NODE + 4} stroke={INK} strokeWidth={1.5} />
      })}

      {PP_NODES.map((n) => {
        const v = valueOf(n)
        const isActive = active.has(n.key)
        const isLit = lit.has(n.key)
        const solvedUnknown = n.given === undefined && v != null
        const stroke = isActive ? GREEN : isLit ? '#D97706' : INK
        const fill = isActive ? 'rgba(16,185,129,0.14)' : isLit ? 'rgba(245,158,11,0.10)' : '#FFFFFF'
        return (
          <g key={n.key}>
            {n.shape === 'circle' ? (
              <circle cx={n.x} cy={n.y} r={R_NODE} fill={fill} stroke={stroke} strokeWidth={isActive || isLit ? 3 : 2} strokeDasharray={isLit && !isActive ? '6 4' : undefined} />
            ) : (
              <rect x={n.x - R_NODE - 3} y={n.y - R_NODE + 4} width={(R_NODE + 3) * 2} height={(R_NODE - 4) * 2} rx={5} fill={fill} stroke={stroke} strokeWidth={isActive || isLit ? 3 : 2} strokeDasharray={isLit && !isActive ? '6 4' : undefined} />
            )}
            {n.key === 'star' && v == null ? (
              <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" fontSize={24} fill={INK}>★</text>
            ) : (
              <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" fontSize={n.key === 'star' ? 17 : 18} fontWeight={900} fill={solvedUnknown ? '#065F46' : v == null ? GRAY : INK} className="font-display">
                {v ?? '?'}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function ProductPyramidG3Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A pyramid of circles and boxes: a star on top, then 24 and a box, then 6, a box and 2, with 2 and 3 under the 6 and 2 and 1 under the 2. Each number is the product of the two directly below it."
    >
      <ProductPyramidFigure />
    </div>
  )
}
