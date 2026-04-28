interface Props {
  childName: string
  ageGroupName: string | null
  periodStart: string
  periodEnd: string
  avatarColor: string | null
}

function fmt(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function RaporHeader({ childName, ageGroupName, periodStart, periodEnd, avatarColor }: Props) {
  return (
    <header className="flex items-start justify-between gap-4 border-b-[3px] border-qupu-brand-blue pb-3">
      <div>
        <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-qupu-brand-orange">
          Rapor Belajar QUPU
        </div>
        <div className="mt-1 font-display text-2xl font-extrabold text-qupu-brand-blue">{childName}</div>
        <div className="mt-1 text-xs text-qupu-muted">
          {ageGroupName ? `Kelompok usia: ${ageGroupName} · ` : ''}Periode: {fmt(periodStart)} → {fmt(periodEnd)}
        </div>
      </div>
      <div className="text-right">
        <div
          className="inline-block h-12 w-12 rounded-full border-[3px] border-white"
          style={{ boxShadow: '0 0 0 2px #1F3A8A', backgroundColor: avatarColor ?? '#FB923C' }}
        />
        <div className="mt-1 text-[10px] font-extrabold text-qupu-muted">QUPU.ID</div>
      </div>
    </header>
  )
}
