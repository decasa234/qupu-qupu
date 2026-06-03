interface DotArrayProps {
  totalDots: number
  grouping?: number[]
}

export default function DotArray({ totalDots, grouping }: DotArrayProps) {
  const rows = grouping ?? [totalDots]
  const dotSize = 24
  return (
    <div className="my-4 flex flex-col items-center gap-2 rounded-lg border-2 border-qupu-peach bg-white p-4">
      {rows.map((count, rowIdx) => (
        <div key={rowIdx} className="flex gap-2">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              style={{ width: dotSize, height: dotSize }}
              className="rounded-full bg-qupu-brand-blue"
              aria-hidden
            />
          ))}
        </div>
      ))}
      <span className="sr-only">{totalDots} dots</span>
    </div>
  )
}
