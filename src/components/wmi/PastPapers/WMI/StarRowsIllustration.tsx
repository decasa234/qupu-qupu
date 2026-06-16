import { Star, starPositions, STAR_TOTAL, STAR_ROWS, VIEW_W, VIEW_H } from './starVisual'

export default function StarRowsIllustration() {
  const positions = starPositions()
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`${STAR_TOTAL} stars in rows of ${STAR_ROWS.join(', ')}`}
    >
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: 520, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {positions.map((p, i) => (
          <Star key={i} cx={p.cx} cy={p.cy} color={p.color} tilt={p.tilt} />
        ))}
      </svg>
    </div>
  )
}
