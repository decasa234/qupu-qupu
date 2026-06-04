import type { ReactNode } from 'react'

interface Group {
  depth: number
  width: number
  heights: number[]
}
interface BlockParams {
  groups: Group[]
}

const TW = 20
const TH = 10
const TZ = 22

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
  const groups = p.groups ?? []
  const gap = 56 // wide gutter so each group reads as a fully separate pile
  let runningX = 0
  const els: ReactNode[] = []
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  groups.forEach((g, gi) => {
    const { depth, width, heights } = g
    const H = (r: number, c: number) => heights[r * width + c]
    const offsetX = runningX + depth * TW
    const offsetY = -((width - 1) + (depth - 1)) * TH // align each group's front-bottom to y=0
    const cubes: { r: number; c: number; z: number }[] = []
    for (let r = 0; r < depth; r++) {
      for (let c = 0; c < width; c++) {
        for (let z = 0; z < H(r, c); z++) cubes.push({ r, c, z })
      }
    }
    cubes.sort((a, b) => a.r + a.c - (b.r + b.c) || a.z - b.z)
    for (const { r, c, z } of cubes) {
      const cx = offsetX + (c - r) * TW
      const cy = offsetY + (c + r) * TH - z * TZ
      els.push(<Cube key={`${gi}-${r}-${c}-${z}`} cx={cx} cy={cy} keyId={`${gi}-${r}-${c}-${z}`} />)
      minX = Math.min(minX, cx - TW)
      maxX = Math.max(maxX, cx + TW)
      minY = Math.min(minY, cy - TH)
      maxY = Math.max(maxY, cy + TH + TZ)
    }
    runningX = runningX + (depth + width) * TW + gap
  })

  const pad = 5
  const vbX = minX - pad
  const vbY = minY - pad
  const vbW = maxX - minX + pad * 2
  const vbH = maxY - minY + pad * 2
  return (
    <div className="my-4 flex justify-center">
      <svg viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`} width={Math.min(460, Math.max(180, vbW))} role="img" aria-label="Beberapa kelompok balok yang terpisah">
        {els}
      </svg>
    </div>
  )
}
