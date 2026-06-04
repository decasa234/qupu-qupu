interface ScaleParams {
  max: number
  value: number
}

export default function ScaleReadIllustration({ params }: { params: unknown }) {
  const p = params as ScaleParams
  const top = 16
  const bottom = 236
  const x = 78
  const h = bottom - top
  const yAt = (v: number) => bottom - (v / p.max) * h // 0 at bottom, max at top
  const tenth = p.max / 10
  const ticks = []
  for (let i = 0; i <= 10; i++) {
    const v = i * tenth
    const major = i % 2 === 0
    ticks.push(
      <g key={i}>
        <line x1={x} y1={yAt(v)} x2={x + (major ? 18 : 10)} y2={yAt(v)} stroke="currentColor" strokeWidth={major ? 2.5 : 1.5} className="text-qupu-brand-blue" />
        {major && (
          <text x={x - 6} y={yAt(v) + 4} textAnchor="end" fontSize="13" fontWeight="bold" className="fill-qupu-brand-blue">
            {v}
          </text>
        )}
      </g>,
    )
  }
  const py = yAt(p.value)
  return (
    <div className="my-4 flex justify-center">
      <svg viewBox={`0 0 150 252`} width="150" role="img" aria-label="Skala bernomor">
        <line x1={x} y1={top - 4} x2={x} y2={bottom + 4} stroke="currentColor" strokeWidth={2.5} className="text-qupu-brand-blue" />
        {ticks}
        {/* arrow pointing left at the value */}
        <polygon points={`${x + 40},${py - 7} ${x + 22},${py} ${x + 40},${py + 7}`} className="fill-qupu-brand-orange" />
        <line x1={x + 40} y1={py} x2={x + 70} y2={py} stroke="currentColor" strokeWidth={3} className="text-qupu-brand-orange" />
      </svg>
    </div>
  )
}
