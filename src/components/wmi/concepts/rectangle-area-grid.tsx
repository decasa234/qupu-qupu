interface GridParams {
  w: number
  h: number
}

export default function RectangleAreaGridIllustration({ params }: { params: unknown }) {
  const p = params as GridParams
  const cell = 22
  const pad = 4
  const vbW = p.w * cell + pad * 2
  const vbH = p.h * cell + pad * 2
  const cells = []
  for (let r = 0; r < p.h; r++) {
    for (let c = 0; c < p.w; c++) {
      cells.push(<rect key={`${r}-${c}`} x={pad + c * cell} y={pad + r * cell} width={cell} height={cell} className="fill-qupu-shell stroke-qupu-brand-blue" strokeWidth={1.5} />)
    }
  }
  return (
    <div className="my-4 flex justify-center">
      <svg viewBox={`0 0 ${vbW} ${vbH}`} width={Math.min(300, vbW * 1.3)} role="img" aria-label={`Kisi ${p.w} kali ${p.h}`}>
        {cells}
      </svg>
    </div>
  )
}
