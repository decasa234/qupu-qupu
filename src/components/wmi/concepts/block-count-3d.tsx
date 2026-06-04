import type { ReactNode } from 'react'

interface BlockParams {
  depth: number
  width: number
  heights: number[]
}

const TW = 22 // tile half-width
const TH = 11 // tile half-height (2:1 isometric)
const TZ = 24 // cube height in px

function Cube({ cx, cy, keyId }: { cx: number; cy: number; keyId: string }) {
  const top = `${cx},${cy - TH} ${cx + TW},${cy} ${cx},${cy + TH} ${cx - TW},${cy}`
  const left = `${cx - TW},${cy} ${cx},${cy + TH} ${cx},${cy + TH + TZ} ${cx - TW},${cy + TZ}`
  const right = `${cx + TW},${cy} ${cx},${cy + TH} ${cx},${cy + TH + TZ} ${cx + TW},${cy + TZ}`
  return (
    <g key={keyId}>
      <polygon points={left} className="fill-qupu-cream-dark stroke-qupu-brand-blue" strokeWidth={1.5} />
      <polygon points={right} className="fill-qupu-shell stroke-qupu-brand-blue" strokeWidth={1.5} />
      <polygon points={top} className="fill-qupu-peach stroke-qupu-brand-blue" strokeWidth={1.5} />
    </g>
  )
}

export default function BlockCount3dIllustration({ params }: { params: unknown }) {
  const p = params as BlockParams
  const depth = p.depth ?? 0
  const width = p.width ?? 0
  const heights = p.heights ?? []
  const H = (r: number, c: number) => heights[r * width + c] ?? 0
  const maxH = Math.max(1, ...heights)

  const ox = depth * TW + 4
  const oy = (maxH - 1) * TZ + TH + 6
  const cubes: { r: number; c: number; z: number }[] = []
  for (let r = 0; r < depth; r++) {
    for (let c = 0; c < width; c++) {
      for (let z = 0; z < H(r, c); z++) cubes.push({ r, c, z })
    }
  }
  // painter order: back-to-front (smaller r+c first), then bottom-to-top
  cubes.sort((a, b) => a.r + a.c - (b.r + b.c) || a.z - b.z)

  const els: ReactNode[] = cubes.map(({ r, c, z }) => {
    const cx = ox + (c - r) * TW
    const cy = oy + (c + r) * TH - z * TZ
    return <Cube key={`${r}-${c}-${z}`} cx={cx} cy={cy} keyId={`${r}-${c}-${z}`} />
  })

  const vbW = ox + width * TW + 6
  const vbH = oy + (width + depth - 2) * TH + TH + TZ + 6
  return (
    <div className="my-4 flex justify-center">
      <svg viewBox={`0 0 ${vbW} ${vbH}`} width={Math.min(300, vbW * 1.3)} role="img" aria-label="Tumpukan balok 3D">
        {els}
      </svg>
    </div>
  )
}
