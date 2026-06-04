interface AngleParams {
  degrees: number
}

export default function AngleTypeIllustration({ params }: { params: unknown }) {
  const p = params as AngleParams
  const w = 200
  const h = 150
  const vx = 40 // vertex
  const vy = h - 30
  const len = 130
  const rad = (p.degrees * Math.PI) / 180
  // ray 1 horizontal to the right; ray 2 rotated CCW (up) by `degrees`
  const x1 = vx + len
  const y1 = vy
  const x2 = vx + len * Math.cos(rad)
  const y2 = vy - len * Math.sin(rad)
  const arcR = 28
  const ax = vx + arcR
  const ay = vy
  const bx = vx + arcR * Math.cos(rad)
  const by = vy - arcR * Math.sin(rad)
  return (
    <div className="my-4 flex justify-center">
      <svg viewBox={`0 0 ${w} ${h}`} width="220" role="img" aria-label={`Sudut ${p.degrees} derajat`}>
        <line x1={vx} y1={vy} x2={x1} y2={y1} stroke="currentColor" strokeWidth={3} strokeLinecap="round" className="text-qupu-brand-blue" />
        <line x1={vx} y1={vy} x2={x2} y2={y2} stroke="currentColor" strokeWidth={3} strokeLinecap="round" className="text-qupu-brand-blue" />
        <path d={`M ${ax} ${ay} A ${arcR} ${arcR} 0 0 0 ${bx} ${by}`} fill="none" stroke="currentColor" strokeWidth={2} className="text-qupu-brand-orange" />
        <circle cx={vx} cy={vy} r={3} className="fill-qupu-brand-blue" />
      </svg>
    </div>
  )
}
