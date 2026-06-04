interface JumpParams {
  start: number
  step: number
  jumps: number
}

export default function NumberLineJumpsIllustration({ params }: { params: unknown }) {
  const p = params as JumpParams
  const spacing = 56
  const padX = 28
  const baseY = 70
  const width = padX * 2 + p.jumps * spacing
  const height = 100
  const xAt = (i: number) => padX + i * spacing
  const arcs = []
  for (let i = 0; i < p.jumps; i++) {
    const x1 = xAt(i)
    const x2 = xAt(i + 1)
    const mid = (x1 + x2) / 2
    arcs.push(
      <g key={i}>
        <path d={`M ${x1} ${baseY} Q ${mid} ${baseY - 36} ${x2} ${baseY}`} fill="none" stroke="currentColor" strokeWidth={2} className="text-qupu-brand-orange" />
        <text x={mid} y={baseY - 38} textAnchor="middle" fontSize="12" fontWeight="bold" className="fill-qupu-brand-orange">
          +{p.step}
        </text>
      </g>,
    )
  }
  const ticks = []
  for (let i = 0; i <= p.jumps; i++) {
    const x = xAt(i)
    ticks.push(
      <g key={i}>
        <line x1={x} y1={baseY - 5} x2={x} y2={baseY + 5} stroke="currentColor" strokeWidth={2} className="text-qupu-brand-blue" />
        <text x={x} y={baseY + 22} textAnchor="middle" fontSize="14" fontWeight="bold" className="fill-qupu-brand-blue">
          {i === 0 ? p.start : i === p.jumps ? '?' : ''}
        </text>
      </g>,
    )
  }
  return (
    <div className="my-4 flex justify-center">
      <svg viewBox={`0 0 ${width} ${height}`} width={Math.min(340, width)} role="img" aria-label="Garis bilangan dengan lompatan">
        <line x1={padX - 16} y1={baseY} x2={width - padX + 16} y2={baseY} stroke="currentColor" strokeWidth={2} className="text-qupu-brand-blue" />
        {arcs}
        {ticks}
      </svg>
    </div>
  )
}
