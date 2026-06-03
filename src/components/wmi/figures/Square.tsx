interface SquareProps {
  side: number
  unit?: string
}

export default function Square({ side, unit }: SquareProps) {
  const size = 120
  const stroke = 4
  return (
    <div className="my-4 flex justify-center">
      <svg viewBox={`0 0 ${size + stroke} ${size + stroke}`} width="160" height="160" role="img" aria-label={`Persegi sisi ${side}`}>
        <rect
          x={stroke / 2}
          y={stroke / 2}
          width={size}
          height={size}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-qupu-brand-blue"
        />
        <text
          x={(size + stroke) / 2}
          y={(size + stroke) / 2 + 5}
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
          className="fill-qupu-brand-blue"
        >
          {side}{unit ? ` ${unit}` : ''}
        </text>
      </svg>
    </div>
  )
}
