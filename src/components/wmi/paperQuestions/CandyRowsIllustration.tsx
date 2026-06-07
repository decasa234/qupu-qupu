import { Candy, candyPositions, CANDY_TOTAL, CANDY_ROWS, VIEW_W, VIEW_H } from './candyVisual'

export default function CandyRowsIllustration() {
  const positions = candyPositions()
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`${CANDY_TOTAL} candies in rows of ${CANDY_ROWS.join(', ')}`}
    >
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: 460, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {positions.map((p, i) => (
          <Candy key={i} cx={p.cx} cy={p.cy} color={p.color} />
        ))}
      </svg>
    </div>
  )
}
