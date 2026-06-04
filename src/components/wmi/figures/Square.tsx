interface SquareProps {
  side: number
  unit?: string
}

export default function Square({ side, unit }: SquareProps) {
  const size = 120
  const stroke = 4
  const vb = size + stroke
  const dimY = vb + 12 // dimension line sits below the bottom edge
  const totalH = dimY + 22
  const x0 = stroke / 2
  const x1 = size + stroke / 2
  return (
    <div className="my-4 flex justify-center">
      <svg
        viewBox={`0 0 ${vb} ${totalH}`}
        width="170"
        height={Math.round((170 * totalH) / vb)}
        role="img"
        aria-label={`Persegi dengan panjang sisi ${side}`}
      >
        <rect
          x={x0}
          y={stroke / 2}
          width={size}
          height={size}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-qupu-brand-blue"
        />
        {/* dimension line labelling ONE side as the side length (not the area) */}
        <line x1={x0} y1={dimY} x2={x1} y2={dimY} stroke="currentColor" strokeWidth={1.5} className="text-qupu-muted" />
        <line x1={x0} y1={dimY - 4} x2={x0} y2={dimY + 4} stroke="currentColor" strokeWidth={1.5} className="text-qupu-muted" />
        <line x1={x1} y1={dimY - 4} x2={x1} y2={dimY + 4} stroke="currentColor" strokeWidth={1.5} className="text-qupu-muted" />
        <text x={vb / 2} y={dimY + 17} textAnchor="middle" fontSize="16" fontWeight="bold" className="fill-qupu-brand-blue">
          {side}
          {unit ? ` ${unit}` : ''}
        </text>
      </svg>
    </div>
  )
}
