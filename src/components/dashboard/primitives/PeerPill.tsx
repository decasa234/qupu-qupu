import type { PeerComparison } from '../../../lib/dashboardData'

interface Props {
  peer: PeerComparison
}

const COPY: Record<PeerComparison, { label: string; bg: string; text: string; symbol: string }> = {
  above: { label: 'di atas rata-rata', bg: 'bg-emerald-100', text: 'text-emerald-700', symbol: '▲' },
  avg:   { label: 'rata-rata',          bg: 'bg-qupu-shell',  text: 'text-qupu-muted',  symbol: '·' },
  below: { label: 'di bawah rata-rata', bg: 'bg-rose-100',    text: 'text-rose-700',    symbol: '▼' },
}

export default function PeerPill({ peer }: Props) {
  const c = COPY[peer]
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${c.bg} ${c.text}`}
    >
      <span aria-hidden="true">{c.symbol}</span>
      {c.label}
    </span>
  )
}
