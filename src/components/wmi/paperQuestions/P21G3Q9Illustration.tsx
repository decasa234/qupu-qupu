// Bar chart for WMI-21P3A-Q9 (2021 Semifinal Grade 3, Paper A).
//
// Redrawn from db/seed/wmi/figures/2021-semifinal-g3-a-q9.jpg:
// a bar chart of "Hits" by day of the week.
//   Sun=2, Mon=1, Tue=4, Wed=2, Thu=0, Fri=1, Sat=2
// y-axis 0..5 with gridlines. The question asks for Mon..Fri only,
// so the static figure shows every bar but reveals no answer.
import type { CSSProperties } from 'react'

export interface DayBar {
  /** Short label printed under the bar. */
  day: string
  /** Bar height in "hits". */
  hits: number
  /** Whether this day is inside the Mon..Fri window the question asks about. */
  inWindow: boolean
}

/** Mon..Fri are the days the question totals. Sun & Sat are decoys. */
export const DAY_BARS: DayBar[] = [
  { day: 'Sun.', hits: 2, inWindow: false },
  { day: 'Mon.', hits: 1, inWindow: true },
  { day: 'Tue.', hits: 4, inWindow: true },
  { day: 'Wed.', hits: 2, inWindow: true },
  { day: 'Thu.', hits: 0, inWindow: true },
  { day: 'Fri.', hits: 1, inWindow: true },
  { day: 'Sat.', hits: 2, inWindow: false },
]

export const MON_FRI_TOTAL = DAY_BARS.filter((d) => d.inWindow).reduce((a, d) => a + d.hits, 0) // 8
export const Y_MAX = 5

const BAR_FILL = '#7FB3E0'
const BAR_FILL_HI = '#2f6df0'
const AXIS = '#1F2937'
const GRID = '#9CA3AF'
const DIM = '#94A3B8'

// Geometry — generous headroom so axis labels and day labels never clip.
export const Q9_VIEW_W = 460
export const Q9_VIEW_H = 300
const PLOT_LEFT = 56
const PLOT_RIGHT = 444
const PLOT_TOP = 28
const PLOT_BOTTOM = 248
const BAR_W = 30

const plotH = PLOT_BOTTOM - PLOT_TOP
const colW = (PLOT_RIGHT - PLOT_LEFT) / DAY_BARS.length

function yFor(hits: number) {
  return PLOT_BOTTOM - (hits / Y_MAX) * plotH
}
function colCenter(i: number) {
  return PLOT_LEFT + colW * (i + 0.5)
}

export interface Q9ChartProps {
  /** Highlight the Mon..Fri bars (the window the question totals). */
  highlightWindow?: boolean
  /** Bars to mark as "counted" (by index into DAY_BARS); shows a value chip on top. */
  countedIdx?: number[]
  /** Optional running-total caption value shown at top-right. */
  runningTotal?: number | null
}

export function Q9Chart({ highlightWindow = false, countedIdx = [], runningTotal = null }: Q9ChartProps) {
  const counted = new Set(countedIdx)
  return (
    <svg
      viewBox={`0 0 ${Q9_VIEW_W} ${Q9_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 460, display: 'block', margin: '0 auto' } as CSSProperties}
      aria-hidden="true"
    >
      {/* y-axis title */}
      <text
        x={16}
        y={(PLOT_TOP + PLOT_BOTTOM) / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight={800}
        fill={AXIS}
        transform={`rotate(-90 16 ${(PLOT_TOP + PLOT_BOTTOM) / 2})`}
      >
        Hits
      </text>

      {/* gridlines + y labels 0..5 */}
      {Array.from({ length: Y_MAX + 1 }, (_, v) => {
        const y = yFor(v)
        return (
          <g key={`g${v}`}>
            <line x1={PLOT_LEFT} y1={y} x2={PLOT_RIGHT} y2={y} stroke={GRID} strokeWidth={1} />
            <text x={PLOT_LEFT - 12} y={y} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={700} fill={AXIS}>
              {v}
            </text>
          </g>
        )
      })}

      {/* axes */}
      <line x1={PLOT_LEFT} y1={PLOT_TOP} x2={PLOT_LEFT} y2={PLOT_BOTTOM} stroke={AXIS} strokeWidth={2.5} />
      <line x1={PLOT_LEFT} y1={PLOT_BOTTOM} x2={PLOT_RIGHT} y2={PLOT_BOTTOM} stroke={AXIS} strokeWidth={2.5} />

      {/* bars */}
      {DAY_BARS.map((d, i) => {
        const cx = colCenter(i)
        const lit = highlightWindow && d.inWindow
        const top = yFor(d.hits)
        const isCounted = counted.has(i)
        return (
          <g key={d.day}>
            {d.hits > 0 && (
              <rect
                x={cx - BAR_W / 2}
                y={top}
                width={BAR_W}
                height={PLOT_BOTTOM - top}
                fill={lit ? BAR_FILL_HI : highlightWindow ? DIM : BAR_FILL}
                stroke={AXIS}
                strokeWidth={1.5}
                rx={2}
              />
            )}
            {/* value chip on counted bars (height number) */}
            {isCounted && (
              <text
                x={cx}
                y={d.hits > 0 ? top - 12 : PLOT_BOTTOM - 14}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={15}
                fontWeight={900}
                fill={BAR_FILL_HI}
              >
                {d.hits}
              </text>
            )}
            <text
              x={cx}
              y={PLOT_BOTTOM + 20}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13}
              fontWeight={700}
              fill={lit || !highlightWindow ? AXIS : DIM}
            >
              {d.day}
            </text>
          </g>
        )
      })}

      {/* running total caption chip */}
      {runningTotal != null && (
        <g>
          <rect x={PLOT_RIGHT - 96} y={PLOT_TOP - 12} width={96} height={28} rx={8} fill="#E1EFFB" stroke={BAR_FILL_HI} strokeWidth={1.5} />
          <text x={PLOT_RIGHT - 48} y={PLOT_TOP + 2} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={900} fill={BAR_FILL_HI}>
            {`Mon–Fri: ${runningTotal}`}
          </text>
        </g>
      )}
    </svg>
  )
}

export default function P21G3Q9Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Bar chart of hits per day: Sunday 2, Monday 1, Tuesday 4, Wednesday 2, Thursday 0, Friday 1, Saturday 2."
    >
      <Q9Chart />
    </div>
  )
}
