interface VennParams {
  aOnly: number[]
  both: number[]
  bOnly: number[]
}

function column(nums: number[], x: number, cy: number, cls: string) {
  const gap = 20
  const startY = cy - ((nums.length - 1) * gap) / 2
  return nums.map((n, i) => (
    <text key={`${x}-${i}`} x={x} y={startY + i * gap + 5} textAnchor="middle" fontSize="15" fontWeight="bold" className={cls}>
      {n}
    </text>
  ))
}

export default function VennSetMembershipIllustration({ params }: { params: unknown }) {
  const p = params as VennParams
  const w = 260
  const h = 170
  const r = 70
  const cyc = h / 2
  const axc = 95
  const bxc = 165
  return (
    <div className="my-4 flex justify-center">
      <svg viewBox={`0 0 ${w} ${h}`} width="300" role="img" aria-label="Diagram Venn A dan B">
        <circle cx={axc} cy={cyc} r={r} fill="none" stroke="currentColor" strokeWidth={3} className="text-qupu-brand-blue" />
        <circle cx={bxc} cy={cyc} r={r} fill="none" stroke="currentColor" strokeWidth={3} className="text-qupu-brand-orange" />
        <text x={axc - r + 14} y={cyc - r + 6} fontSize="16" fontWeight="bold" className="fill-qupu-brand-blue">A</text>
        <text x={bxc + r - 22} y={cyc - r + 6} fontSize="16" fontWeight="bold" className="fill-qupu-brand-orange">B</text>
        {column(p.aOnly, axc - r / 2 - 6, cyc, 'fill-qupu-brand-blue')}
        {column(p.both, (axc + bxc) / 2, cyc, 'fill-slate-700')}
        {column(p.bOnly, bxc + r / 2 + 6, cyc, 'fill-qupu-brand-orange')}
      </svg>
    </div>
  )
}
