// Rectilinear perimeter figure for WMI-20P3A-Q6 (2020 Semifinal G3, Q6).
// Reconstructed from db/seed/wmi/figures/2020-semifinal-g3-a-q6.jpg: a 15×15
// square with a small rectangular TAB poking out of the right side. All corners
// are right angles. Labels: top 15, left 15, bottom 15, and on the right the
// gaps 6 (top) + tab + 7 (bottom), tab = 5 out, 2 tall, 5 back.
//
// Outline clockwise from top-left, x→right, y→down (cm):
//   (0,0)→(15,0)→(15,6)→(20,6)→(20,8)→(15,8)→(15,15)→(0,15)→close
// Perimeter = 15+6+5+2+5+7+15+15 = 70 cm. Answer D.

export const P20G3Q6_PERIMETER = 70
export const P20G3Q6_ANSWER = 'D'

export const Q6_POINTS: ReadonlyArray<[number, number]> = [
  [0, 0],
  [15, 0],
  [15, 6],
  [20, 6],
  [20, 8],
  [15, 8],
  [15, 15],
  [0, 15],
]

type SegKind = 'top' | 'bottom' | 'left' | 'right' | 'tab'
export interface Q6Seg {
  x1: number
  y1: number
  x2: number
  y2: number
  len: number
  kind: SegKind
}

/** Walk the outline, classifying every edge and recording its length. */
export const Q6_SEGS: ReadonlyArray<Q6Seg> = Q6_POINTS.map((p, i) => {
  const q = Q6_POINTS[(i + 1) % Q6_POINTS.length]
  const len = Math.abs(q[0] - p[0]) + Math.abs(q[1] - p[1])
  let kind: SegKind
  if (p[1] === 0 && q[1] === 0) kind = 'top'
  else if (p[1] === 15 && q[1] === 15) kind = 'bottom'
  else if (p[0] === 0 && q[0] === 0) kind = 'left'
  else if (p[0] === 15 && q[0] === 15) kind = 'right'
  else if (p[0] === 20 && q[0] === 20) kind = 'right'
  else kind = 'tab' // the two horizontal tab edges (5 out, 5 back)
  return { x1: p[0], y1: p[1], x2: q[0], y2: q[1], len, kind }
})

const INK = '#1F2937'
const BLUE = '#2563EB'
const AMBER = '#D97706'
const FILL = '#EAF2FF'

export const Q6_VIEW_W = 360
export const Q6_VIEW_H = 300
const SCALE = 13
const OX = 46
const OY = 36
const px = (u: number) => OX + u * SCALE
const py = (v: number) => OY + v * SCALE

export type Q6Highlight = 'none' | 'square' | 'tab'

export interface Q6FigureProps {
  /** 'square' lights the four 15-edges; 'tab' lights the two 5-edges. */
  highlight?: Q6Highlight
  /** Show every edge's cm length (used on the sum beat). */
  showAllLengths?: boolean
}

export function PerimeterFigure({ highlight = 'none', showAllLengths = false }: Q6FigureProps) {
  const polyPts = Q6_POINTS.map(([u, v]) => `${px(u)},${py(v)}`).join(' ')

  const isHot = (s: Q6Seg) =>
    highlight === 'square'
      ? s.kind === 'top' || s.kind === 'bottom' || s.kind === 'left'
      : highlight === 'tab'
        ? s.kind === 'tab'
        : false

  const segColor = (s: Q6Seg) => (highlight === 'none' ? INK : isHot(s) ? (highlight === 'square' ? BLUE : AMBER) : '#CBD5E1')
  const segWidth = (s: Q6Seg) => (isHot(s) ? 4.5 : 2.5)

  return (
    <svg viewBox={`0 0 ${Q6_VIEW_W} ${Q6_VIEW_H}`} width="100%" style={{ maxWidth: Q6_VIEW_W, display: 'block', margin: '0 auto' }} aria-hidden="true">
      <polygon points={polyPts} fill={FILL} stroke="none" />

      {Q6_SEGS.map((s, i) => (
        <line key={i} x1={px(s.x1)} y1={py(s.y1)} x2={px(s.x2)} y2={py(s.y2)} stroke={segColor(s)} strokeWidth={segWidth(s)} strokeLinecap="square" />
      ))}

      {/* fixed dimension labels (always on) */}
      <text x={px(7.5)} y={py(0) - 10} textAnchor="middle" fontSize={15} fontWeight={900} fill={highlight === 'square' ? BLUE : INK} className="font-display">
        15
      </text>
      <text x={px(7.5)} y={py(15) + 20} textAnchor="middle" fontSize={15} fontWeight={900} fill={highlight === 'square' ? BLUE : INK} className="font-display">
        15
      </text>
      <text x={px(0) - 10} y={py(7.5)} textAnchor="end" dominantBaseline="central" fontSize={15} fontWeight={900} fill={highlight === 'square' ? BLUE : INK} className="font-display">
        15
      </text>

      {/* right-side gaps 6 and 7 */}
      <text x={px(15) + 8} y={py(3)} dominantBaseline="central" fontSize={12} fontWeight={800} fill={INK} className="font-display">
        6
      </text>
      <text x={px(15) + 8} y={py(11.5)} dominantBaseline="central" fontSize={12} fontWeight={800} fill={INK} className="font-display">
        7
      </text>

      {/* tab labels: 5 (top), 2 (end), 5 (bottom) */}
      <text x={px(17.5)} y={py(6) - 8} textAnchor="middle" fontSize={12} fontWeight={900} fill={highlight === 'tab' ? AMBER : INK} className="font-display">
        5
      </text>
      <text x={px(20) + 8} y={py(7)} dominantBaseline="central" fontSize={12} fontWeight={900} fill={INK} className="font-display">
        2
      </text>
      <text x={px(17.5)} y={py(8) + 16} textAnchor="middle" fontSize={12} fontWeight={900} fill={highlight === 'tab' ? AMBER : INK} className="font-display">
        5
      </text>

      {/* every-edge length overlay on the sum beat */}
      {showAllLengths && (
        <g className="font-display" fontWeight={900} fontSize={11} fill="#065F46">
          <text x={px(7.5)} y={py(7.5)} textAnchor="middle" fontSize={13}>
            = {P20G3Q6_PERIMETER}
          </text>
        </g>
      )}
    </svg>
  )
}

export default function P20G3Q6Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A 15 by 15 square with a small rectangular tab sticking out of the right side. All corners are right angles. Find the perimeter."
    >
      <PerimeterFigure />
    </div>
  )
}
