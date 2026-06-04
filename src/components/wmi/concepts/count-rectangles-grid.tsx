interface RectGridParams {
  cols: number
  rows: number
}

export default function CountRectanglesGridIllustration({ params }: { params: unknown }) {
  const p = params as RectGridParams
  const cell = 38
  const pad = 6
  const w = p.cols * cell + pad * 2
  const h = p.rows * cell + pad * 2
  const cells = []
  for (let r = 0; r < p.rows; r++) {
    for (let c = 0; c < p.cols; c++) {
      cells.push(<rect key={`${r}-${c}`} x={pad + c * cell} y={pad + r * cell} width={cell} height={cell} className="fill-qupu-shell stroke-qupu-brand-blue" strokeWidth={2} />)
    }
  }
  return (
    <div className="my-4 flex justify-center">
      <svg viewBox={`0 0 ${w} ${h}`} width={Math.min(260, w * 1.4)} role="img" aria-label={`Kisi ${p.cols} kali ${p.rows}`}>
        {cells}
      </svg>
    </div>
  )
}
