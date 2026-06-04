interface FanParams {
  segments: number
}

export default function CountShapesInFigureIllustration({ params }: { params: unknown }) {
  const p = params as FanParams
  const segments = p.segments ?? 2
  const w = 220
  const h = 150
  const apex: [number, number] = [w / 2, 14]
  const baseY = h - 16
  const baseX0 = 24
  const baseX1 = w - 24
  const rays = []
  for (let i = 0; i <= segments; i++) {
    const bx = baseX0 + ((baseX1 - baseX0) * i) / segments
    rays.push(<line key={i} x1={apex[0]} y1={apex[1]} x2={bx} y2={baseY} stroke="currentColor" strokeWidth={2} className="text-qupu-brand-blue" />)
  }
  return (
    <div className="my-4 flex justify-center">
      <svg viewBox={`0 0 ${w} ${h}`} width="240" role="img" aria-label="Gambar kipas segitiga">
        <line x1={baseX0} y1={baseY} x2={baseX1} y2={baseY} stroke="currentColor" strokeWidth={2.5} className="text-qupu-brand-blue" />
        {rays}
      </svg>
    </div>
  )
}
