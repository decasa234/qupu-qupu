interface PolygonParams {
  sides: number
}

export default function CountPolygonSidesIllustration({ params }: { params: unknown }) {
  const p = params as PolygonParams
  const size = 160
  const c = size / 2
  const r = c - 16
  const pts = Array.from({ length: p.sides }, (_, k) => {
    const angle = (-90 + (k * 360) / p.sides) * (Math.PI / 180)
    return `${(c + r * Math.cos(angle)).toFixed(1)},${(c + r * Math.sin(angle)).toFixed(1)}`
  }).join(' ')
  return (
    <div className="my-4 flex justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} width="170" height="170" role="img" aria-label={`Bangun dengan ${p.sides} sisi`}>
        <polygon points={pts} className="fill-qupu-shell stroke-qupu-brand-blue" strokeWidth={4} strokeLinejoin="round" />
      </svg>
    </div>
  )
}
