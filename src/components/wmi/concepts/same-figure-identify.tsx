import type { ReactNode } from 'react'

type Cell = [number, number]
interface SameFigParams {
  target: Cell[]
  options: Cell[][]
  validIndex: number
}

const S = 16

function dims(cells: Cell[]): [number, number] {
  return [Math.max(...cells.map((c) => c[0])) + 1, Math.max(...cells.map((c) => c[1])) + 1]
}

function shape(cells: Cell[], ox: number, oy: number, keyPrefix: string): ReactNode[] {
  return cells.map(([x, y], i) => (
    <rect
      key={`${keyPrefix}-${i}`}
      x={ox + x * S}
      y={oy + y * S}
      width={S - 1}
      height={S - 1}
      rx={2}
      className="fill-qupu-shell stroke-qupu-brand-blue"
      strokeWidth={1.5}
    />
  ))
}

function centered(cells: Cell[], slotX: number, slotY: number, slotW: number, slotH: number, key: string): ReactNode[] {
  const [bw, bh] = dims(cells)
  const ox = slotX + (slotW - bw * S) / 2
  const oy = slotY + (slotH - bh * S) / 2
  return shape(cells, ox, oy, key)
}

export default function SameFigureIdentifyIllustration({ params }: { params: unknown }) {
  const p = params as SameFigParams
  const options = p.options ?? []
  const labels = ['A', 'B', 'C', 'D']
  const slotW = 78
  const width = 4 * slotW
  const optTop = 92
  const optH = 60
  return (
    <div className="my-4 flex justify-center">
      <svg viewBox={`0 0 ${width} 178`} width="320" role="img" aria-label="Cocokkan bentuk yang sama">
        {/* target */}
        {centered(p.target ?? [], 0, 8, width, 64, 't')}
        <line x1={20} y1={80} x2={width - 20} y2={80} stroke="currentColor" strokeWidth={1} className="text-qupu-muted" />
        {/* options A-D */}
        {options.map((cells, i) => (
          <g key={i}>
            {centered(cells, i * slotW, optTop, slotW, optH, `o${i}`)}
            <text x={i * slotW + slotW / 2} y={optTop + optH + 18} textAnchor="middle" fontSize="15" fontWeight="bold" className="fill-qupu-brand-blue">
              {labels[i]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
