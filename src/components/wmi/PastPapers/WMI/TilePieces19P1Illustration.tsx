// Tiling-pieces figure for WMI-19P1A-Q19.
//
// Source figure: db/seed/wmi/figures/2019-semifinal-g1-a-q19.jpg —
// six grey pieces, numbered 1..6:
//   1  L-shape (corner)        2  tall rectangle      3  small square
//   4  trapezoid (flat bar)    5  long wide rectangle 6  T-shape (mushroom)
// plus an example "1 + 2 + 3 + 6 →" that tiles a rectangle.
//
// The static figure shows ONLY the pieces + the target rectangle — never which
// answer set fits.  The fill / placement is revealed by the explainer.

export const PIECE_FILL = '#C8CDD4' // grey, as in the source figure
export const PIECE_STROKE = '#1F2937'

/** Distinct tints used when a piece is "placed" inside the rectangle. */
export const PLACED_FILL: Record<number, string> = {
  1: '#FCA5A5',
  2: '#93C5FD',
  3: '#FCD34D',
  4: '#6EE7B7',
  6: '#C4B5FD',
}

export type PieceId = 1 | 2 | 3 | 4 | 5 | 6

const U = 18 // base unit (one grid square) for piece drawings

/**
 * Draws piece `id` with its bounding box top-left at (x, y). Shapes mirror the
 * source figure's silhouettes. `fill` overrides the default grey (used when a
 * piece is shown "placed" in the rectangle).
 */
export function TilePiece({
  id,
  x,
  y,
  fill = PIECE_FILL,
  label = true,
}: {
  id: PieceId
  x: number
  y: number
  fill?: string
  label?: boolean
}) {
  const common = { fill, stroke: PIECE_STROKE, strokeWidth: 2, strokeLinejoin: 'round' as const }
  let path = ''
  let labelAt: [number, number] = [x, y]

  switch (id) {
    case 1: {
      // L-shape: 2 wide at the foot, 3 tall on the left.
      const h = 3 * U
      path = `M ${x} ${y} h ${U} v ${2 * U} h ${2 * U} v ${U} h ${-3 * U} Z`
      labelAt = [x + U * 0.5, y + h - U * 0.6]
      break
    }
    case 2: {
      // Tall rectangle, 1 wide × 3 tall.
      path = `M ${x} ${y} h ${U} v ${3 * U} h ${-U} Z`
      labelAt = [x + U / 2, y + 1.5 * U]
      break
    }
    case 3: {
      // Small square, 1 × 1.
      path = `M ${x} ${y} h ${U} v ${U} h ${-U} Z`
      labelAt = [x + U / 2, y + U / 2]
      break
    }
    case 4: {
      // Trapezoid (flat bar, wider top).
      const w = 3.6 * U
      const h = U
      path = `M ${x + U * 0.5} ${y} h ${w - U} l ${U * 0.5} ${h} h ${-w} Z`
      labelAt = [x + w / 2, y + h / 2]
      break
    }
    case 5: {
      // Long wide rectangle, 4 × 1.
      const w = 4 * U
      path = `M ${x} ${y} h ${w} v ${U} h ${-w} Z`
      labelAt = [x + w / 2, y + U / 2]
      break
    }
    case 6: {
      // T-shape (mushroom): 3 wide bar on top, 1 wide stem down 2.
      path = `M ${x} ${y} h ${3 * U} v ${U} h ${-U} v ${2 * U} h ${-U} v ${-2 * U} h ${-U} Z`
      labelAt = [x + 1.5 * U, y + 0.5 * U]
      break
    }
  }

  return (
    <g>
      <path d={path} {...common} />
      {label && (
        <text
          x={labelAt[0]}
          y={labelAt[1]}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={15}
          fontWeight={800}
          fill={PIECE_STROKE}
        >
          {id}
        </text>
      )}
    </g>
  )
}

export const TILE_VIEW_W = 360
export const TILE_VIEW_H = 200

// Layout anchors for the six pieces (top-left of each bounding box).
const PIECE_POS: Record<PieceId, [number, number]> = {
  1: [18, 18],
  2: [108, 16],
  3: [168, 30],
  4: [214, 26],
  5: [40, 110],
  6: [200, 110],
}

export interface TileDiagramProps {
  /** Highlight the target rectangle outline (problem framing). */
  showTarget?: boolean
}

export function TileDiagram({ showTarget = true }: TileDiagramProps) {
  return (
    <svg
      viewBox={`0 0 ${TILE_VIEW_W} ${TILE_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* the six loose pieces */}
      {(Object.keys(PIECE_POS) as unknown as string[]).map((k) => {
        const id = Number(k) as PieceId
        const [px, py] = PIECE_POS[id]
        return <TilePiece key={id} id={id} x={px} y={py} />
      })}

      {/* the empty target rectangle to be filled */}
      {showTarget && (
        <g>
          <rect x={296} y={120} width={56} height={56} rx={3} fill="#FFFFFF" stroke="#2f6df0" strokeWidth={2.5} />
          <text x={324} y={148} textAnchor="middle" dominantBaseline="central" fontSize={26} fontWeight={800} fill="#2f6df0">
            ?
          </text>
        </g>
      )}
    </svg>
  )
}

export default function TilePieces19P1Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Six puzzle pieces numbered 1 to 6 (an L-shape, a tall rectangle, a small square, a flat trapezoid, a long rectangle and a T-shape) and an empty target rectangle to be filled."
    >
      <TileDiagram />
    </div>
  )
}
