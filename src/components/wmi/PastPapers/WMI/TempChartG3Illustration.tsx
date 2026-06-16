// Seasonal temperature line chart for WMI-19F3A-Q3.
// Reconstructed from db/seed/wmi/figures/2019-final-g3-a-q3.jpg: four city
// lines (A–D) across Spring/Summer/Fall/Winter in °F. City C swings from 13 up
// to 72 — by far the most distinct variation (answer C).

export type CityKey = 'A' | 'B' | 'C' | 'D'

export interface CitySeries {
  key: CityKey
  temps: [number, number, number, number] // Spring, Summer, Fall, Winter
  color: string
}

export const CITIES: ReadonlyArray<CitySeries> = [
  { key: 'A', temps: [60, 60, 60, 47], color: '#2563EB' },
  { key: 'B', temps: [45, 52, 42, 35], color: '#7C3AED' },
  { key: 'C', temps: [35, 72, 51, 13], color: '#DC2626' },
  { key: 'D', temps: [22, 35, 24, 19], color: '#059669' },
]

export const cityRange = (c: CitySeries) => Math.max(...c.temps) - Math.min(...c.temps)

export const TC_VIEW_W = 380
export const TC_VIEW_H = 240
const PLOT_X = 46
const PLOT_Y = 16
const PLOT_W = 310
const PLOT_H = 180
const MAX_F = 80

const seasonX = (i: number) => PLOT_X + 24 + i * ((PLOT_W - 48) / 3)
const tempY = (f: number) => PLOT_Y + PLOT_H - (f / MAX_F) * PLOT_H

const SEASONS_EN = ['Spring', 'Summer', 'Fall', 'Winter']
const SEASONS_ID = ['Semi', 'Panas', 'Gugur', 'Dingin']

export interface TempChartFigureProps {
  /** City currently in focus (others dim), or null for all. */
  focus?: CityKey | null
  /** Draw the focused city's min–max range bracket. */
  showRange?: boolean
  lang?: 'en' | 'id'
}

export function TempChartFigure({ focus = null, showRange = false, lang = 'en' }: TempChartFigureProps) {
  const seasons = lang === 'id' ? SEASONS_ID : SEASONS_EN
  return (
    <svg
      viewBox={`0 0 ${TC_VIEW_W} ${TC_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 400, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* axes + y ticks */}
      <line x1={PLOT_X} y1={PLOT_Y} x2={PLOT_X} y2={PLOT_Y + PLOT_H} stroke="#94A3B8" strokeWidth={2} />
      <line x1={PLOT_X} y1={PLOT_Y + PLOT_H} x2={PLOT_X + PLOT_W} y2={PLOT_Y + PLOT_H} stroke="#94A3B8" strokeWidth={2} />
      {[0, 20, 40, 60, 80].map((f) => (
        <g key={f}>
          <line x1={PLOT_X} y1={tempY(f)} x2={PLOT_X + PLOT_W} y2={tempY(f)} stroke="#EEF2F6" strokeWidth={1} />
          <text x={PLOT_X - 6} y={tempY(f)} textAnchor="end" dominantBaseline="central" fontSize={11} fill="#64748B">
            {f}
          </text>
        </g>
      ))}
      <text x={10} y={12} fontSize={11} fontWeight={700} fill="#64748B">°F</text>
      {seasons.map((s, i) => (
        <text key={s} x={seasonX(i)} y={PLOT_Y + PLOT_H + 18} textAnchor="middle" fontSize={12} fontWeight={700} fill="#1F2937">
          {s}
        </text>
      ))}

      {/* city lines */}
      {CITIES.map((c) => {
        const dimmed = focus !== null && focus !== c.key
        const pts = c.temps.map((f, i) => `${seasonX(i)},${tempY(f)}`).join(' ')
        return (
          <g key={c.key} opacity={dimmed ? 0.18 : 1}>
            <polyline points={pts} fill="none" stroke={c.color} strokeWidth={focus === c.key ? 3.5 : 2.5} strokeLinejoin="round" />
            {c.temps.map((f, i) => (
              <circle key={i} cx={seasonX(i)} cy={tempY(f)} r={3.5} fill={c.color} />
            ))}
            <text x={seasonX(0) - 14} y={tempY(c.temps[0])} textAnchor="end" dominantBaseline="central" fontSize={14} fontWeight={800} fill={c.color} className="font-display">
              {c.key}
            </text>
          </g>
        )
      })}

      {/* min–max range bracket for the focused city */}
      {focus !== null && showRange && (() => {
        const c = CITIES.find((x) => x.key === focus)!
        const hi = Math.max(...c.temps)
        const lo = Math.min(...c.temps)
        const x = PLOT_X + PLOT_W + 8
        return (
          <g>
            <line x1={x} y1={tempY(hi)} x2={x} y2={tempY(lo)} stroke={c.color} strokeWidth={2.5} />
            <line x1={x - 4} y1={tempY(hi)} x2={x + 4} y2={tempY(hi)} stroke={c.color} strokeWidth={2.5} />
            <line x1={x - 4} y1={tempY(lo)} x2={x + 4} y2={tempY(lo)} stroke={c.color} strokeWidth={2.5} />
            <text x={x + 2} y={(tempY(hi) + tempY(lo)) / 2} fontSize={12} fontWeight={900} fill={c.color} className="font-display" transform={`rotate(90 ${x + 2} ${(tempY(hi) + tempY(lo)) / 2})`} textAnchor="middle">
              {hi - lo}
            </text>
          </g>
        )
      })()}
    </svg>
  )
}

export default function TempChartG3Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A line chart of seasonal temperatures for four cities A to D. City A stays near 60, B and D change a little, and C swings from 13 up to 72 degrees."
    >
      <TempChartFigure />
    </div>
  )
}
