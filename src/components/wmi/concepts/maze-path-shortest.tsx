type Cell = [number, number]
interface MazeParams {
  cols: number
  rows: number
  walls: Cell[]
}

export default function MazePathShortestIllustration({ params }: { params: unknown }) {
  const p = params as MazeParams
  const walls = p.walls ?? []
  const blocked = new Set(walls.map(([x, y]) => `${x},${y}`))
  const cell = 30
  const pad = 6
  const w = p.cols * cell + pad * 2
  const h = p.rows * cell + pad * 2
  const cells = []
  for (let r = 0; r < p.rows; r++) {
    for (let c = 0; c < p.cols; c++) {
      const isWall = blocked.has(`${c},${r}`)
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={pad + c * cell}
          y={pad + r * cell}
          width={cell}
          height={cell}
          className={isWall ? 'fill-slate-700 stroke-qupu-brand-blue' : 'fill-qupu-shell stroke-qupu-brand-blue'}
          strokeWidth={1}
        />,
      )
    }
  }
  const cx = (gx: number) => pad + gx * cell + cell / 2
  const cy = (gy: number) => pad + gy * cell + cell / 2
  const ex = p.cols - 1
  const ey = p.rows - 1
  return (
    <div className="my-4 flex justify-center">
      <svg viewBox={`0 0 ${w} ${h}`} width={Math.min(280, w * 1.2)} role="img" aria-label="Labirin">
        {cells}
        <circle cx={cx(0)} cy={cy(0)} r={9} className="fill-qupu-brand-blue" />
        <line x1={cx(ex) - 7} y1={cy(ey) - 10} x2={cx(ex) - 7} y2={cy(ey) + 10} stroke="currentColor" strokeWidth={2} className="text-qupu-brand-orange" />
        <polygon points={`${cx(ex) - 7},${cy(ey) - 10} ${cx(ex) + 8},${cy(ey) - 5} ${cx(ex) - 7},${cy(ey)}`} className="fill-qupu-brand-orange" />
      </svg>
    </div>
  )
}
