interface BarChartParams {
  items: { emoji: string; value: number }[]
  iA: number
  iB: number
}

export default function BarChartCompareIllustration({ params }: { params: unknown }) {
  const p = params as BarChartParams
  const items = p.items ?? []
  const unit = 16 // px per unit value
  const maxVal = Math.max(1, ...items.map((it) => it.value))
  const chartH = maxVal * unit
  const barW = 40
  const gap = 28
  const padX = 24
  const padTop = 18
  const labelH = 28
  const width = padX * 2 + items.length * barW + (items.length - 1) * gap
  const height = padTop + chartH + labelH

  return (
    <div className="my-4 flex justify-center">
      <svg viewBox={`0 0 ${width} ${height}`} width={Math.min(320, width * 1.4)} role="img" aria-label="Diagram batang">
        {/* baseline */}
        <line x1={padX - 6} y1={padTop + chartH} x2={width - padX + 6} y2={padTop + chartH} stroke="currentColor" strokeWidth={2} className="text-qupu-muted" />
        {items.map((it, i) => {
          const x = padX + i * (barW + gap)
          const barH = it.value * unit
          const y = padTop + chartH - barH
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} rx={4} className="fill-qupu-brand-blue" />
              <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize="14" fontWeight="bold" className="fill-qupu-brand-blue">
                {it.value}
              </text>
              <text x={x + barW / 2} y={padTop + chartH + 20} textAnchor="middle" fontSize="18">
                {it.emoji}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
