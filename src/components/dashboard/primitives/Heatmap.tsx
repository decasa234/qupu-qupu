interface Props {
  data: number[]   // 28 cells, intensity 0-4
  todayIdx?: number
}

const RAMP = ['#FFF2DF', '#FFE6C2', '#FFC988', '#F0853A', '#D66B23']

export default function Heatmap({ data, todayIdx = 27 }: Props) {
  return (
    <div
      className="grid gap-[5px]"
      style={{
        gridTemplateRows: 'repeat(7, 22px)',
        gridAutoFlow: 'column',
        gridAutoColumns: '22px',
      }}
      aria-label="Aktivitas 28 hari terakhir"
    >
      {data.map((value, i) => {
        const intensity = Math.max(0, Math.min(4, Math.round(value)))
        const isToday = i === todayIdx
        return (
          <div
            key={i}
            title={`Hari ${i + 1}: intensitas ${intensity}`}
            className={`h-[22px] w-[22px] rounded-[6px] ${isToday ? 'ring-2 ring-qupu-brand-blue ring-offset-1' : ''}`}
            style={{ backgroundColor: RAMP[intensity] }}
          />
        )
      })}
    </div>
  )
}

export function HeatmapLegend() {
  return (
    <div className="mt-3 flex items-center justify-end gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-qupu-muted">
      <span>Sepi</span>
      <div className="flex gap-[3px]">
        {RAMP.map((color) => (
          <span key={color} className="h-[10px] w-[10px] rounded-[3px]" style={{ backgroundColor: color }} />
        ))}
      </div>
      <span>Aktif</span>
    </div>
  )
}
