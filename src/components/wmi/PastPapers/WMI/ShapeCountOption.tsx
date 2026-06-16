import type { WmiChoice } from '../../../types/wmi'
import { SHAPE_ROWS } from './ShapeCountChartIllustration'

// Renders an answer option for the shape-count question (WMI-19F1A-Q15) as a
// small bar chart, instead of plain text. The four bar heights are read from
// the choice text (e.g. "Circle 10, Square 7, Triangle 4, Bar 6" →
// "Lingkaran 10, Persegi 7, Segitiga 4, Batang 6"), so it always matches the
// authored choice and can never drift from it.
const AXIS_MAX = 12
const TICKS = [0, 2, 4, 6, 8, 10, 12]
const W = 230
const H = 138
const PLOT_X = 22
const PLOT_TOP = 8
const PLOT_H = 100
const PLOT_W = 188
const BAR_W = 28
const N = 4
const GAP = (PLOT_W - N * BAR_W) / (N + 1)

export default function ShapeCountOption({ choice }: { choice: WmiChoice }) {
  const nums = (choice.text.match(/\d+/g) ?? []).slice(0, N).map(Number)
  // Fallback to plain text if the choice isn't the expected 4-number shape tally.
  if (nums.length < N) return <span>{choice.text}</span>

  const baseY = PLOT_TOP + PLOT_H
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: 250, display: 'block' }}
      role="img"
      aria-label={`Bar chart — ${choice.text}`}
    >
      {/* y gridlines + tick labels */}
      {TICKS.map((t) => {
        const y = baseY - (t / AXIS_MAX) * PLOT_H
        return (
          <g key={t}>
            <line x1={PLOT_X} y1={y} x2={PLOT_X + PLOT_W} y2={y} stroke="#EEF2F6" strokeWidth={1} />
            <text x={PLOT_X - 5} y={y} textAnchor="end" dominantBaseline="central" fontSize={9} fill="#94A3B8">
              {t}
            </text>
          </g>
        )
      })}

      {/* axes */}
      <line x1={PLOT_X} y1={PLOT_TOP} x2={PLOT_X} y2={baseY} stroke="#94A3B8" strokeWidth={1.5} />
      <line x1={PLOT_X} y1={baseY} x2={PLOT_X + PLOT_W} y2={baseY} stroke="#94A3B8" strokeWidth={1.5} />

      {/* bars + x-axis shape symbols */}
      {SHAPE_ROWS.map((row, i) => {
        const v = nums[i]
        const h = (v / AXIS_MAX) * PLOT_H
        const x = PLOT_X + GAP + i * (BAR_W + GAP)
        return (
          <g key={row.kind}>
            <rect x={x} y={baseY - h} width={BAR_W} height={h} rx={2} fill={row.color} />
            <text x={x + BAR_W / 2} y={baseY + 16} textAnchor="middle" fontSize={15} fontWeight={800} fill={row.color}>
              {row.symbol}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
