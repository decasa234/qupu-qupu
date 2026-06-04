import type { ReactNode } from 'react'

type Cell = [number, number]
interface NetParams {
  nets: Cell[][]
  validIndex: number
}

const S = 14

function dims(cells: Cell[]): [number, number] {
  return [Math.max(...cells.map((c) => c[0])) + 1, Math.max(...cells.map((c) => c[1])) + 1]
}

function net(cells: Cell[], slotX: number, slotY: number, slotW: number, slotH: number, key: string): ReactNode[] {
  const [bw, bh] = dims(cells)
  const ox = slotX + (slotW - bw * S) / 2
  const oy = slotY + (slotH - bh * S) / 2
  return cells.map(([x, y], i) => (
    <rect key={`${key}-${i}`} x={ox + x * S} y={oy + y * S} width={S} height={S} className="fill-qupu-shell stroke-qupu-brand-blue" strokeWidth={1.5} />
  ))
}

export default function DiceNetFoldIllustration({ params }: { params: unknown }) {
  const p = params as NetParams
  const nets = p.nets ?? []
  const labels = ['A', 'B', 'C', 'D']
  const slotW = 158
  const slotH = 96
  const width = slotW * 2
  const height = slotH * 2 + 12
  return (
    <div className="my-4 flex justify-center">
      <svg viewBox={`0 0 ${width} ${height}`} width="330" role="img" aria-label="Empat jaring-jaring">
        {nets.map((cells, i) => {
          const col = i % 2
          const row = Math.floor(i / 2)
          const sx = col * slotW
          const sy = row * (slotH + 6)
          return (
            <g key={i}>
              {net(cells, sx, sy, slotW, slotH - 16, `n${i}`)}
              <text x={sx + slotW / 2} y={sy + slotH - 2} textAnchor="middle" fontSize="14" fontWeight="bold" className="fill-qupu-brand-blue">
                {labels[i]}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
