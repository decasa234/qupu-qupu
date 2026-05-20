interface Props {
  pct: number       // 0-100
  size?: number
  trackColor?: string
  fillColor?: string
  label?: string    // optional center text override
}

export default function GoalRing({
  pct,
  size = 56,
  trackColor = '#FFD3B1',
  fillColor = '#F0853A',
  label,
}: Props) {
  const r = (size - 8) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, pct))
  const dashOffset = c * (1 - clamped / 100)
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth="6"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={fillColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="absolute font-display text-xs font-extrabold text-qupu-brand-blue">
        {label ?? `${clamped}%`}
      </span>
    </div>
  )
}
