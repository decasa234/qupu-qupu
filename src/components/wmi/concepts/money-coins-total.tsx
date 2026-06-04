interface CoinParams {
  coins: number[]
}

export default function MoneyCoinsTotalIllustration({ params }: { params: unknown }) {
  const p = params as CoinParams
  const coins = p.coins ?? []
  const rPx = (v: number) => (v >= 25 ? 26 : v >= 10 ? 23 : v >= 5 ? 20 : 17)
  const slot = 56
  const perRow = 4
  const rows = Math.ceil(coins.length / perRow)
  const width = Math.min(coins.length, perRow) * slot + 12
  const height = rows * slot + 12
  return (
    <div className="my-4 flex justify-center">
      <svg viewBox={`0 0 ${width} ${height}`} width={Math.min(300, width)} role="img" aria-label="Koin-koin">
        {coins.map((v, i) => {
          const col = i % perRow
          const row = Math.floor(i / perRow)
          const cx = 6 + col * slot + slot / 2
          const cy = 6 + row * slot + slot / 2
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={rPx(v)} className="fill-qupu-peach stroke-qupu-brand-orange" strokeWidth={2.5} />
              <text x={cx} y={cy + 5} textAnchor="middle" fontSize="14" fontWeight="bold" className="fill-qupu-brand-blue">
                {v}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
