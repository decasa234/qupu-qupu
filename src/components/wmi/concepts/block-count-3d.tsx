import type { ReactNode } from 'react'

interface BlockParams {
  front: number[]
  back: number[]
}

const S = 24
const O = S * 0.34 // depth offset for the top/right faces

function Cube({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <polygon points={`${x},${y} ${x + O},${y - O} ${x + S + O},${y - O} ${x + S},${y}`} className="fill-qupu-peach stroke-qupu-brand-blue" strokeWidth={1.5} />
      <polygon points={`${x + S},${y} ${x + S + O},${y - O} ${x + S + O},${y + S - O} ${x + S},${y + S}`} className="fill-qupu-cream-dark stroke-qupu-brand-blue" strokeWidth={1.5} />
      <rect x={x} y={y} width={S} height={S} className="fill-qupu-shell stroke-qupu-brand-blue" strokeWidth={1.5} />
    </g>
  )
}

export default function BlockCount3dIllustration({ params }: { params: unknown }) {
  const p = params as BlockParams
  const front = p.front ?? []
  const back = p.back ?? []
  const width = Math.max(front.length, back.length)
  const pitch = S + O + 8
  const maxFront = Math.max(0, ...front)
  const maxBack = Math.max(0, ...back)
  // back row is shifted up-and-right (into the gaps) so it reads as "behind"
  const backDX = pitch * 0.5
  const backDY = S * 0.9
  const padTop = O + 4
  const padLeft = 8
  const baseY = padTop + Math.max(maxFront, maxBack) * S + backDY
  const w = padLeft + width * pitch + backDX + O + 8
  const h = baseY + 8

  const back2: ReactNode[] = []
  back.forEach((height, col) => {
    for (let j = 0; j < height; j++) {
      back2.push(<Cube key={`b-${col}-${j}`} x={padLeft + col * pitch + backDX} y={baseY - backDY - (j + 1) * S} />)
    }
  })
  const front2: ReactNode[] = []
  front.forEach((height, col) => {
    for (let j = 0; j < height; j++) {
      front2.push(<Cube key={`f-${col}-${j}`} x={padLeft + col * pitch} y={baseY - (j + 1) * S} />)
    }
  })

  return (
    <div className="my-4 flex justify-center">
      <svg viewBox={`0 0 ${w} ${h}`} width={Math.min(320, w * 1.4)} role="img" aria-label="Balok ditumpuk dua baris">
        {/* back row first so the front row overlaps it */}
        {back2}
        {front2}
      </svg>
    </div>
  )
}
