// "How many squares?" figure for WMI-20F2A-Q3, reconstructed from the scan:
// a 2×6 grid of coloured shapes. Exactly 3 are squares — the tilted orange
// square, the pink diamond (a square standing on its corner), and the green
// square. The tilted pink shape and the tall purple shape are RECTANGLES
// (sides not all equal) — the classic traps.

const VIEW_W = 420
const CELL = 66
const X0 = (VIEW_W - 6 * CELL) / 2

export interface Cell {
  key: string
  isSquare: boolean
  /** Short reason keys rendered by the explainer captions. */
  kind: 'triangle' | 'square' | 'circle' | 'rect' | 'hexagon' | 'diamond' | 'pentagon'
  draw: (cx: number, cy: number) => React.ReactNode
}

const poly = (pts: Array<[number, number]>, fill: string) => (
  <polygon points={pts.map(([x, y]) => `${x},${y}`).join(' ')} fill={fill} />
)

const regular = (cx: number, cy: number, r: number, n: number, rot: number, fill: string) =>
  poly(
    Array.from({ length: n }, (_, i) => {
      const a = rot + (i * 2 * Math.PI) / n
      return [cx + r * Math.sin(a), cy - r * Math.cos(a)] as [number, number]
    }),
    fill,
  )

const rotRect = (cx: number, cy: number, w: number, h: number, deg: number, fill: string) => {
  const a = (deg * Math.PI) / 180
  const dx: [number, number] = [Math.cos(a) * w / 2, Math.sin(a) * w / 2]
  const dy: [number, number] = [-Math.sin(a) * h / 2, Math.cos(a) * h / 2]
  return poly(
    [
      [cx - dx[0] - dy[0], cy - dx[1] - dy[1]],
      [cx + dx[0] - dy[0], cy + dx[1] - dy[1]],
      [cx + dx[0] + dy[0], cy + dx[1] + dy[1]],
      [cx - dx[0] + dy[0], cy - dx[1] + dy[1]],
    ],
    fill,
  )
}

export const SHAPE_CELLS: Cell[] = [
  { key: 'tri1', isSquare: false, kind: 'triangle', draw: (x, y) => poly([[x - 18, y - 16], [x + 14, y - 16], [x - 18, y + 16]], '#86C166') },
  { key: 'sq1', isSquare: true, kind: 'square', draw: (x, y) => rotRect(x, y, 30, 30, 18, '#E8A33D') },
  { key: 'circ1', isSquare: false, kind: 'circle', draw: (x, y) => <circle cx={x} cy={y} r={17} fill="#F7D94C" /> },
  { key: 'rect1', isSquare: false, kind: 'rect', draw: (x, y) => rotRect(x, y, 38, 22, -20, '#F2A0C0') },
  { key: 'rect2', isSquare: false, kind: 'rect', draw: (x, y) => rotRect(x, y, 16, 36, 0, '#A99FD1') },
  { key: 'hex1', isSquare: false, kind: 'hexagon', draw: (x, y) => regular(x, y, 19, 6, Math.PI / 6, '#86C166') },
  { key: 'diam', isSquare: true, kind: 'diamond', draw: (x, y) => rotRect(x, y, 27, 27, 45, '#F2A0C0') },
  { key: 'tri2', isSquare: false, kind: 'triangle', draw: (x, y) => poly([[x, y - 18], [x - 18, y + 14], [x + 18, y + 14]], '#F7D94C') },
  { key: 'pent1', isSquare: false, kind: 'pentagon', draw: (x, y) => regular(x, y, 18, 5, 0, '#A99FD1') },
  { key: 'sq2', isSquare: true, kind: 'square', draw: (x, y) => rotRect(x, y, 28, 28, 0, '#86C166') },
  { key: 'pent2', isSquare: false, kind: 'pentagon', draw: (x, y) => regular(x, y, 18, 5, 0, '#E8A33D') },
  { key: 'circ2', isSquare: false, kind: 'circle', draw: (x, y) => <circle cx={x} cy={y} r={13} fill="#F2A0C0" /> },
]

export const SQUARE_COUNT = SHAPE_CELLS.filter((c) => c.isSquare).length // 3

export function ShapesGrid({ upto = -1, active = -1 }: { upto?: number; active?: number }) {
  return (
    <svg viewBox={`0 0 ${VIEW_W} 152`} width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {SHAPE_CELLS.map((cell, i) => {
        const row = Math.floor(i / 6)
        const col = i % 6
        const x = X0 + col * CELL
        const y = 8 + row * CELL
        const decided = i <= upto
        const isActive = i === active
        return (
          <g key={cell.key}>
            <rect
              x={x}
              y={y}
              width={CELL}
              height={CELL}
              fill={decided && cell.isSquare ? 'rgba(16,185,129,0.14)' : 'white'}
              stroke="#1F2937"
              strokeWidth={1.5}
            />
            {cell.draw(x + CELL / 2, y + CELL / 2)}
            {isActive && <rect x={x + 3} y={y + 3} width={CELL - 6} height={CELL - 6} rx={6} fill="none" stroke="#D97706" strokeWidth={2.5} strokeDasharray="6 4" />}
            {decided && (
              <text x={x + CELL - 9} y={y + 14} textAnchor="middle" fontSize={13} fontWeight={900} fill={cell.isSquare ? '#059669' : '#DC2626'}>
                {cell.isSquare ? '✓' : '✗'}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function ShapesSquaresG2Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`Twelve coloured shapes in a two-by-six grid: triangles, circles, rectangles, pentagons, a hexagon, and ${SQUARE_COUNT} squares (one tilted, one standing on its corner, one upright).`}
    >
      <ShapesGrid />
    </div>
  )
}
