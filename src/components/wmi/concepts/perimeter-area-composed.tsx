interface LParams {
  W: number
  H: number
  cw: number
  ch: number
}

export default function PerimeterAreaComposedIllustration({ params }: { params: unknown }) {
  const p = params as LParams
  const cell = 22
  const pad = 4
  const vbW = p.W * cell + pad * 2
  const vbH = p.H * cell + pad * 2
  const cells = []
  for (let r = 0; r < p.H; r++) {
    for (let c = 0; c < p.W; c++) {
      // remove the top-right cw × ch corner
      const removed = c >= p.W - p.cw && r < p.ch
      if (removed) continue
      cells.push(<rect key={`${r}-${c}`} x={pad + c * cell} y={pad + r * cell} width={cell} height={cell} className="fill-qupu-shell stroke-qupu-brand-blue" strokeWidth={1.5} />)
    }
  }
  return (
    <div className="my-4 flex justify-center">
      <svg viewBox={`0 0 ${vbW} ${vbH}`} width={Math.min(300, vbW * 1.3)} role="img" aria-label="Bangun bentuk L">
        {cells}
      </svg>
    </div>
  )
}
