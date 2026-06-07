const GRAY = '#94A3B8'
const OUTLINE = '#64748B'

/** The figure: a white circle centered inside a gray rounded square. */
export function WhiteCircleSquare() {
  return (
    <svg viewBox="0 0 120 120" width={120} height={120} aria-hidden="true">
      {/* Gray rounded square */}
      <rect x={12} y={12} width={96} height={96} rx={14} fill={GRAY} />
      {/* White circle with a thin outline so it reads on white backgrounds */}
      <circle cx={60} cy={60} r={30} fill="white" stroke={OUTLINE} strokeWidth={2} />
    </svg>
  )
}

export default function WhiteCircleSquareIllustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A white circle inside a gray square"
    >
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <WhiteCircleSquare />
      </div>
    </div>
  )
}
