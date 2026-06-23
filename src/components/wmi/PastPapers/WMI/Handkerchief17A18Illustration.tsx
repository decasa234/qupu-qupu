// Handkerchief flower-border illustration for SEAMO-17-A-Q18.
//
// Question: "My mother embroidered 5 flowers on each side of my handkerchief.
//            There was a flower on each corner. How many flowers altogether?"
//
// A square handkerchief has 4 corners + 3 inner flowers per side
// → 4 corners + 4 × 3 inner = 4 + 12 = 16 flowers total.
// The figure in the paper (2017.imgs/022.jpg) is a plain square outline;
// we render the square with labelled flower dots on each edge.

const SIZE = 200      // square side in SVG units
const OX   = 60      // left margin (leaves room for labels)
const OY   = 40      // top margin
const VIEW_W = SIZE + OX * 2
const VIEW_H = SIZE + OY * 2

// Five flower positions per side (t = 0..1 along the edge)
// t=0 and t=1 are the shared corner positions.
const SIDE_T = [0, 0.25, 0.5, 0.75, 1] as const

type Pt = { x: number; y: number; corner: boolean }

function buildDots(): Pt[] {
  const pts: Pt[] = []
  const seen = new Set<string>()

  const add = (x: number, y: number, corner: boolean) => {
    const key = `${Math.round(x)},${Math.round(y)}`
    if (!seen.has(key)) {
      seen.add(key)
      pts.push({ x, y, corner })
    }
  }

  // Top edge: left→right
  for (const t of SIDE_T) add(OX + t * SIZE, OY, t === 0 || t === 1)
  // Right edge: top→bottom
  for (const t of SIDE_T) add(OX + SIZE, OY + t * SIZE, t === 0 || t === 1)
  // Bottom edge: right→left
  for (const t of SIDE_T) add(OX + (1 - t) * SIZE, OY + SIZE, t === 0 || t === 1)
  // Left edge: bottom→top
  for (const t of SIDE_T) add(OX, OY + (1 - t) * SIZE, t === 0 || t === 1)

  return pts
}

const DOTS = buildDots()

const CORNER_FILL   = '#F59E0B'   // amber-400 — corner flowers
const INNER_FILL    = '#34D399'   // emerald-400 — inner flowers
const STROKE_COLOR  = '#1F2937'   // gray-800
const INK           = '#1F2937'

export interface HandkerchiefFigureProps {
  /** Highlight just corner flowers, all flowers, or nothing ('idle'). */
  mode?: 'idle' | 'corners' | 'all'
}

export function HandkerchiefFigure({ mode = 'all' }: HandkerchiefFigureProps) {
  const showDots = mode !== 'idle'

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Handkerchief outline */}
      <rect
        x={OX}
        y={OY}
        width={SIZE}
        height={SIZE}
        fill="#FEFCE8"
        stroke={INK}
        strokeWidth={2.5}
        rx={3}
      />

      {/* Flower dots */}
      {showDots && DOTS.map(({ x, y, corner }, i) => {
        const show = mode === 'all' || (mode === 'corners' && corner)
        if (!show) return null
        const fill   = corner ? CORNER_FILL : INNER_FILL
        const stroke = corner ? '#B45309' : '#059669'
        return (
          <g key={i}>
            {/* Petal ring (simplified 6-petal flower) */}
            {[0, 60, 120, 180, 240, 300].map((deg, pi) => {
              const rad = deg * Math.PI / 180
              const pr = 4.5
              return (
                <circle
                  key={pi}
                  cx={x + pr * Math.cos(rad)}
                  cy={y + pr * Math.sin(rad)}
                  r={3}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={0.5}
                />
              )
            })}
            {/* Centre */}
            <circle cx={x} cy={y} r={2.5} fill="#FDE68A" stroke={stroke} strokeWidth={0.5} />
          </g>
        )
      })}

      {/* Side labels: "5 flowers" on each side */}
      <text x={OX + SIZE / 2} y={OY - 10} textAnchor="middle" fontSize={13} fill={INK} fontWeight={700} className="font-display">5 flowers</text>
      <text x={OX + SIZE + 12} y={OY + SIZE / 2} textAnchor="start" dominantBaseline="central" fontSize={13} fill={INK} fontWeight={700} className="font-display">5</text>
      <text x={OX + SIZE / 2} y={OY + SIZE + 18} textAnchor="middle" fontSize={13} fill={INK} fontWeight={700} className="font-display">5 flowers</text>
      <text x={OX - 12} y={OY + SIZE / 2} textAnchor="end" dominantBaseline="central" fontSize={13} fill={INK} fontWeight={700} className="font-display">5</text>

      {/* Legend */}
      <circle cx={OX + 10} cy={OY + SIZE + 36} r={5} fill={CORNER_FILL} stroke="#B45309" strokeWidth={0.8} />
      <text x={OX + 20} y={OY + SIZE + 36} dominantBaseline="central" fontSize={11} fill={INK}>corner flower</text>
      <circle cx={OX + 110} cy={OY + SIZE + 36} r={5} fill={INNER_FILL} stroke="#059669" strokeWidth={0.8} />
      <text x={OX + 120} y={OY + SIZE + 36} dominantBaseline="central" fontSize={11} fill={INK}>inner flower</text>
    </svg>
  )
}

export default function Handkerchief17A18Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="A square handkerchief with 5 flowers embroidered on each side including one flower at each corner, showing 16 flowers total."
    >
      <HandkerchiefFigure mode="all" />
    </div>
  )
}
