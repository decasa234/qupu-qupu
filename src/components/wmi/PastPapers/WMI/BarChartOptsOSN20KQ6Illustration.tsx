// OSN-20-SD-KAB-Q6 — bar-chart picture options
// Stem: population table (2015=124, 2016=140, 2017=120, 2018=160)
// Choices A–D are four bar charts; correct = A.
// No separate stem illustration — choices ARE the only figures.
// Reused approach from BarChartOSN09KQ23Illustration; fresh SVG (4-bar year charts).

import type { WmiChoice } from '../../../../types/wmi'

// ── Layout constants ──────────────────────────────────────────────────────────
const W       = 200
const H       = 155
const AXIS_X  = 42   // left edge of plot area
const AXIS_Y  = 118  // baseline y
const PLOT_H  = 78   // max bar height in px
const MAX_V   = 175  // y-scale ceiling (headroom above 160)
const BAR_W   = 27
const BAR_GAP = 9
const START_X = AXIS_X + 6   // x of first bar

function barLeft(i: number) { return START_X + i * (BAR_W + BAR_GAP) }
function barH(v: number)    { return (v / MAX_V) * PLOT_H }

// ── Chart data for the 4 options ──────────────────────────────────────────────
interface BarDatum { year: string; v: number }

const CHART_DATA: Record<'A' | 'B' | 'C' | 'D', BarDatum[]> = {
  // A — correct: 124 → 140 → 120 → 160 (slight dip at 2017, clear peak 2018)
  A: [
    { year: "'15", v: 124 },
    { year: "'16", v: 140 },
    { year: "'17", v: 120 },
    { year: "'18", v: 160 },
  ],
  // B — wrong: 2016 much taller relative to 2015; 2017 dips deeper below 2015
  B: [
    { year: "'15", v: 118 },
    { year: "'16", v: 148 },
    { year: "'17", v: 96 },
    { year: "'18", v: 160 },
  ],
  // C — wrong: 2016 and 2018 equal as tallest (both peak together)
  C: [
    { year: "'15", v: 120 },
    { year: "'16", v: 155 },
    { year: "'17", v: 100 },
    { year: "'18", v: 155 },
  ],
  // D — wrong: 2016 is clearly the tallest, descending trend after
  D: [
    { year: "'15", v: 108 },
    { year: "'16", v: 160 },
    { year: "'17", v: 128 },
    { year: "'18", v: 116 },
  ],
}

// ── Shared SVG bar chart component ───────────────────────────────────────────
export interface PopBarChartProps {
  diagram: 'A' | 'B' | 'C' | 'D'
  /** Highlight one bar (explainer focus). null = all visible. */
  focusYear?: string | null
}

export function PopBarChart({ diagram, focusYear = null }: PopBarChartProps) {
  const bars = CHART_DATA[diagram]
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: 220, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Title */}
      <text x={W / 2} y={11} textAnchor="middle" fontSize={10} fontWeight={700} fill="#374151">
        Diagram {diagram}
      </text>

      {/* Y-axis line */}
      <line x1={AXIS_X} y1={14} x2={AXIS_X} y2={AXIS_Y} stroke="#374151" strokeWidth={1.8} />
      {/* Y arrowhead */}
      <polygon
        points={`${AXIS_X},10 ${AXIS_X - 4},18 ${AXIS_X + 4},18`}
        fill="#374151"
      />
      {/* X-axis line */}
      <line x1={AXIS_X} y1={AXIS_Y} x2={W - 8} y2={AXIS_Y} stroke="#374151" strokeWidth={1.8} />
      {/* X arrowhead */}
      <polygon
        points={`${W - 4},${AXIS_Y} ${W - 14},${AXIS_Y - 4} ${W - 14},${AXIS_Y + 4}`}
        fill="#374151"
      />

      {/* Y-axis label */}
      <text
        x={10}
        y={AXIS_Y - PLOT_H / 2}
        transform={`rotate(-90, 10, ${AXIS_Y - PLOT_H / 2})`}
        textAnchor="middle"
        fontSize={8}
        fontWeight={600}
        fill="#6B7280"
      >
        Jumlah Penduduk
      </text>

      {/* X-axis label */}
      <text x={(AXIS_X + W - 8) / 2} y={H - 2} textAnchor="middle" fontSize={8} fontWeight={600} fill="#6B7280">
        Tahun
      </text>

      {/* Bars */}
      {bars.map((bar, i) => {
        const x      = barLeft(i)
        const h      = barH(bar.v)
        const y      = AXIS_Y - h
        const cx     = x + BAR_W / 2
        const dimmed = focusYear !== null && focusYear !== bar.year

        return (
          <g key={bar.year} opacity={dimmed ? 0.28 : 1}>
            <rect
              x={x} y={y} width={BAR_W} height={h}
              fill="#93C5FD"
              stroke={focusYear === bar.year ? '#1D4ED8' : '#60A5FA'}
              strokeWidth={focusYear === bar.year ? 2 : 0.8}
              rx={2}
              opacity={0.9}
            />
            {/* Year label */}
            <text
              x={cx} y={AXIS_Y + 12}
              textAnchor="middle"
              fontSize={8} fontWeight={600}
              fill={dimmed ? '#9CA3AF' : '#374151'}
            >
              {bar.year}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Option renderer (CHOICE_RENDERERS entry) ─────────────────────────────────
export function BarChartOptsOSN20KQ6Option({ choice }: { choice: WmiChoice }) {
  const label = (choice.label ?? '').toUpperCase() as 'A' | 'B' | 'C' | 'D'
  const valid = label === 'A' || label === 'B' || label === 'C' || label === 'D'
  if (!valid) return null

  const ARIA: Record<'A' | 'B' | 'C' | 'D', string> = {
    A: 'Diagram A: batang 2016 sedikit lebih tinggi dari 2015, 2017 sedikit lebih pendek dari 2015, 2018 tertinggi.',
    B: 'Diagram B: batang 2016 jauh lebih tinggi dari 2015, 2017 lebih pendek dari 2015, 2018 tertinggi.',
    C: 'Diagram C: batang 2016 dan 2018 setinggi, keduanya tertinggi.',
    D: 'Diagram D: batang 2016 jelas tertinggi, turun setelah 2016.',
  }

  return (
    <span
      role="img"
      aria-label={ARIA[label]}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4, width: '100%' }}
    >
      <PopBarChart diagram={label} />
    </span>
  )
}

// ── Default export: 2×2 preview grid (no stem figure in this question) ───────
export default function BarChartOptsOSN20KQ6Illustration() {
  return (
    <div
      className="my-4 grid grid-cols-2 gap-2 rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Empat pilihan diagram batang jumlah penduduk (A, B, C, D)."
    >
      {(['A', 'B', 'C', 'D'] as const).map((d) => (
        <div key={d} className="flex flex-col items-center">
          <PopBarChart diagram={d} />
        </div>
      ))}
    </div>
  )
}
