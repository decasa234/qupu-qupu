interface Props {
  current: number
  total: number
}

export default function WmiExamProgressBar({ current, total }: Props) {
  const pct = total > 0 ? ((current + 1) / total) * 100 : 0
  return (
    <div className="h-2 overflow-hidden rounded-full bg-qupu-cream">
      <div className="h-full bg-qupu-brand-blue transition-all" style={{ width: `${pct}%` }} />
    </div>
  )
}
