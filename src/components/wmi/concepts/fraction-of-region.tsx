interface FractionParams {
  parts: number
  shaded: number
}

export default function FractionOfRegionIllustration({ params }: { params: unknown }) {
  const p = params as FractionParams
  const parts = p.parts ?? 1
  const shaded = p.shaded ?? 0
  const partW = 36
  const h = 60
  const pad = 6
  const width = parts * partW + pad * 2
  const cells = Array.from({ length: parts }, (_, i) => (
    <rect
      key={i}
      x={pad + i * partW}
      y={pad}
      width={partW}
      height={h}
      className={i < shaded ? 'fill-qupu-brand-blue stroke-qupu-brand-blue' : 'fill-qupu-shell stroke-qupu-brand-blue'}
      strokeWidth={2}
    />
  ))
  return (
    <div className="my-4 flex justify-center">
      <svg viewBox={`0 0 ${width} ${h + pad * 2}`} width={Math.min(320, width)} role="img" aria-label={`Batang ${parts} bagian, ${shaded} diarsir`}>
        {cells}
      </svg>
    </div>
  )
}
