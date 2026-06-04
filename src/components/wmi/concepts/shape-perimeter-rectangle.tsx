interface RectParams {
  w: number
  h: number
}

export default function ShapePerimeterRectangleIllustration({ params }: { params: unknown }) {
  const p = params as RectParams
  // Scale the longer side to a fixed length; keep the aspect ratio of w:h.
  const maxPx = 150
  const minPx = 60
  const longer = Math.max(p.w, p.h)
  const px = (v: number) => minPx + (maxPx - minPx) * ((v - 2) / 13) // 2..15 -> minPx..maxPx
  const rw = px(p.w)
  const rh = px(p.h)
  const pad = 34
  const vbW = rw + pad * 2
  const vbH = rh + pad * 2
  void longer
  return (
    <div className="my-4 flex justify-center">
      <svg viewBox={`0 0 ${vbW} ${vbH}`} width={Math.min(260, vbW)} height={Math.min(220, vbH)} role="img" aria-label={`Persegi panjang ${p.w} kali ${p.h}`}>
        <rect x={pad} y={pad} width={rw} height={rh} fill="none" stroke="currentColor" strokeWidth={4} className="text-qupu-brand-blue" />
        <text x={pad + rw / 2} y={pad - 10} textAnchor="middle" fontSize="16" fontWeight="bold" className="fill-qupu-brand-blue">
          {p.w} cm
        </text>
        <text x={pad - 10} y={pad + rh / 2} textAnchor="middle" fontSize="16" fontWeight="bold" transform={`rotate(-90 ${pad - 10} ${pad + rh / 2})`} className="fill-qupu-brand-blue">
          {p.h} cm
        </text>
      </svg>
    </div>
  )
}
