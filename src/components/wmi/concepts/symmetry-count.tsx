interface SymParams {
  kind: string
}

const SIDES: Record<string, number> = {
  'equilateral-triangle': 3,
  square: 4,
  'regular-pentagon': 5,
  'regular-hexagon': 6,
}

function regularPolygon(n: number, cx: number, cy: number, r: number, rotateDeg = -90): string {
  return Array.from({ length: n }, (_, k) => {
    const a = (rotateDeg + (k * 360) / n) * (Math.PI / 180)
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`
  }).join(' ')
}

export default function SymmetryCountIllustration({ params }: { params: unknown }) {
  const p = params as SymParams
  const size = 160
  const c = size / 2
  const r = c - 18
  let points: string
  if (p.kind in SIDES) {
    points = regularPolygon(SIDES[p.kind], c, c, r)
  } else if (p.kind === 'rectangle') {
    points = `${c - r},${c - r * 0.55} ${c + r},${c - r * 0.55} ${c + r},${c + r * 0.55} ${c - r},${c + r * 0.55}`
  } else {
    // isosceles triangle: apex top, wider-than-tall base, not equilateral
    points = `${c},${c - r} ${c - r * 0.7},${c + r * 0.7} ${c + r * 0.7},${c + r * 0.7}`
  }
  return (
    <div className="my-4 flex justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} width="170" height="170" role="img" aria-label="Bangun datar">
        <polygon points={points} className="fill-qupu-shell stroke-qupu-brand-blue" strokeWidth={4} strokeLinejoin="round" />
      </svg>
    </div>
  )
}
