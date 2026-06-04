interface BlockParams {
  heights: number[]
}

// One isometric-ish cube: front square + top + right faces.
function Cube({ x, y, s }: { x: number; y: number; s: number }) {
  const o = s * 0.32
  return (
    <g>
      <polygon points={`${x},${y} ${x + o},${y - o} ${x + s + o},${y - o} ${x + s},${y}`} className="fill-qupu-peach stroke-qupu-brand-blue" strokeWidth={1.5} />
      <polygon points={`${x + s},${y} ${x + s + o},${y - o} ${x + s + o},${y + s - o} ${x + s},${y + s}`} className="fill-qupu-cream-dark stroke-qupu-brand-blue" strokeWidth={1.5} />
      <rect x={x} y={y} width={s} height={s} className="fill-qupu-shell stroke-qupu-brand-blue" strokeWidth={1.5} />
    </g>
  )
}

export default function BlockCount3dIllustration({ params }: { params: unknown }) {
  const p = params as BlockParams
  const heights = p.heights ?? []
  const s = 26
  const o = s * 0.32
  const pitch = s + o + 8
  const maxH = Math.max(1, ...heights)
  const padTop = o + 4
  const padBottom = 6
  const width = heights.length * pitch + o + 8
  const baseY = padTop + maxH * s
  const height = baseY + padBottom
  const cubes = []
  for (let col = 0; col < heights.length; col++) {
    for (let j = 0; j < heights[col]; j++) {
      const x = 6 + col * pitch
      const y = baseY - (j + 1) * s
      cubes.push(<Cube key={`${col}-${j}`} x={x} y={y} s={s} />)
    }
  }
  return (
    <div className="my-4 flex justify-center">
      <svg viewBox={`0 0 ${width} ${height}`} width={Math.min(320, width * 1.4)} role="img" aria-label="Tumpukan balok">
        {cubes}
      </svg>
    </div>
  )
}
