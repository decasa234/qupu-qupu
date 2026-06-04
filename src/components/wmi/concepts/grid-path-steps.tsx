interface PathParams {
  cols: number
  rows: number
  sx: number
  sy: number
  ex: number
  ey: number
}

export default function GridPathStepsIllustration({ params }: { params: unknown }) {
  const p = params as PathParams
  const cell = 30
  const pad = 6
  const w = p.cols * cell + pad * 2
  const h = p.rows * cell + pad * 2
  const cells = []
  for (let r = 0; r < p.rows; r++) {
    for (let c = 0; c < p.cols; c++) {
      cells.push(<rect key={`${r}-${c}`} x={pad + c * cell} y={pad + r * cell} width={cell} height={cell} className="fill-qupu-shell stroke-qupu-brand-blue" strokeWidth={1} />)
    }
  }
  const cx = (gx: number) => pad + gx * cell + cell / 2
  const cy = (gy: number) => pad + gy * cell + cell / 2
  return (
    <div className="my-4 flex justify-center">
      <svg viewBox={`0 0 ${w} ${h}`} width={Math.min(280, w * 1.2)} role="img" aria-label="Kisi dengan titik awal dan bendera">
        {cells}
        <circle cx={cx(p.sx)} cy={cy(p.sy)} r={9} className="fill-qupu-brand-blue" />
        {/* flag */}
        <line x1={cx(p.ex) - 7} y1={cy(p.ey) - 10} x2={cx(p.ex) - 7} y2={cy(p.ey) + 10} stroke="currentColor" strokeWidth={2} className="text-qupu-brand-orange" />
        <polygon points={`${cx(p.ex) - 7},${cy(p.ey) - 10} ${cx(p.ex) + 8},${cy(p.ey) - 5} ${cx(p.ex) - 7},${cy(p.ey)}`} className="fill-qupu-brand-orange" />
      </svg>
    </div>
  )
}
