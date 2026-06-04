interface ClockParams {
  hour: number
  minute: number
}

function hand(cx: number, cy: number, angleDeg: number, length: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x2: cx + length * Math.cos(rad), y2: cy + length * Math.sin(rad) }
}

export default function ClockReadTimeIllustration({ params }: { params: unknown }) {
  const p = params as ClockParams
  const size = 160
  const c = size / 2
  const r = c - 8
  // 12 o'clock is 0°, clockwise; hour hand also advances with the minutes.
  const minuteAngle = p.minute * 6
  const hourAngle = (p.hour % 12) * 30 + p.minute * 0.5
  const min = hand(c, c, minuteAngle, r * 0.8)
  const hr = hand(c, c, hourAngle, r * 0.55)
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = ((i * 30 - 90) * Math.PI) / 180
    return {
      x1: c + (r - 8) * Math.cos(a),
      y1: c + (r - 8) * Math.sin(a),
      x2: c + r * Math.cos(a),
      y2: c + r * Math.sin(a),
    }
  })

  return (
    <div className="my-4 flex justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} width="180" height="180" role="img" aria-label="Jam analog">
        <circle cx={c} cy={c} r={r} fill="white" stroke="currentColor" strokeWidth={4} className="text-qupu-brand-blue" />
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="currentColor" strokeWidth={i % 3 === 0 ? 3 : 1.5} className="text-qupu-muted" />
        ))}
        <line x1={c} y1={c} x2={hr.x2} y2={hr.y2} stroke="currentColor" strokeWidth={5} strokeLinecap="round" className="text-qupu-brand-blue" />
        <line x1={c} y1={c} x2={min.x2} y2={min.y2} stroke="currentColor" strokeWidth={3} strokeLinecap="round" className="text-qupu-brand-orange" />
        <circle cx={c} cy={c} r={4} className="fill-qupu-brand-blue" />
      </svg>
    </div>
  )
}
