// SASMO 2020 Grade 3 Q19 — bar chart: museum guests Jan–Jun 2019.
// Source: docs/reference/ocr-res/sasmo/contest/g3/2019-2020.imgs/046.jpg
// Bar values: Jan=100, Feb=200, Mar=250, Apr=150, May=50, Jun=250 (answer: 1000)
// Adapted from MuseumBarChartSASMO20G4Q19Illustration (same museum-visitors house style).
// Y-axis labeled (0–300, step 50) — G3 has a labeled y-axis; G4 version is unlabeled.

export type MonthKey = 'jan' | 'feb' | 'mar' | 'apr' | 'may' | 'jun'
export type BarFocus = null | MonthKey

export interface MuseumBarChartG3FigureProps {
  focus?: BarFocus
  lang?: 'en' | 'id'
  /** Show the guest count above each bar (explainer only). */
  showValues?: boolean
}

// ── Layout ───────────────────────────────────────────────────────────────────
const W       = 360
const H       = 240
const AXIS_X  = 38    // wider left margin to fit y-axis labels
const AXIS_Y  = 190
const PLOT_H  = 150   // pixel height for MAX_VAL
const MAX_VAL = 300
const BAR_W   = 36
const BAR_GAP = 10

// ── Data ─────────────────────────────────────────────────────────────────────
const BARS: { key: MonthKey; label_id: string; label_en: string; value: number }[] = [
  { key: 'jan', label_id: 'Jan', label_en: 'Jan', value: 100 },
  { key: 'feb', label_id: 'Feb', label_en: 'Feb', value: 200 },
  { key: 'mar', label_id: 'Mar', label_en: 'Mar', value: 250 },
  { key: 'apr', label_id: 'Apr', label_en: 'Apr', value: 150 },
  { key: 'may', label_id: 'Mei', label_en: 'May', value: 50  },
  { key: 'jun', label_id: 'Jun', label_en: 'Jun', value: 250 },
]

const BAR_COLOR   = '#3B6CB5'
const FOCUS_COLOR = '#1D4ED8'
const DIM_COLOR   = '#93C5FD'
const Y_LABELS    = [50, 100, 150, 200, 250, 300]

const PLOT_W  = W - AXIS_X - 10
const START_X = AXIS_X + (PLOT_W - (6 * BAR_W + 5 * BAR_GAP)) / 2

function barLeft(i: number) { return START_X + i * (BAR_W + BAR_GAP) }
function barCx(i: number)   { return barLeft(i) + BAR_W / 2 }
function valH(v: number)    { return (v / MAX_VAL) * PLOT_H }

function isFocused(key: MonthKey, focus: BarFocus): boolean {
  return focus === key
}
function isDimmed(key: MonthKey, focus: BarFocus): boolean {
  if (focus === null) return false
  return focus !== key
}

/** Shared SVG figure — used by both illustration and explainer. */
export function MuseumBarChartG3Figure({
  focus = null,
  lang = 'id',
  showValues = false,
}: MuseumBarChartG3FigureProps) {
  const title = lang === 'id' ? 'Tamu di Museum Nasional' : 'Guests at National Museum'
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: 380, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Chart title */}
      <text x={W / 2} y={16} textAnchor="middle" fontSize={11} fontWeight={700} fill="#111827">
        {title}
      </text>

      {/* Y-axis */}
      <line x1={AXIS_X} y1={AXIS_Y - PLOT_H - 8} x2={AXIS_X} y2={AXIS_Y} stroke="#4B5563" strokeWidth={2} />
      {/* X-axis */}
      <line x1={AXIS_X} y1={AXIS_Y} x2={W - 8} y2={AXIS_Y} stroke="#4B5563" strokeWidth={2} />
      {/* Y-axis arrowhead */}
      <polygon
        points={`${AXIS_X},${AXIS_Y - PLOT_H - 14} ${AXIS_X - 5},${AXIS_Y - PLOT_H - 2} ${AXIS_X + 5},${AXIS_Y - PLOT_H - 2}`}
        fill="#4B5563"
      />

      {/* Y-axis grid lines and labels */}
      {Y_LABELS.map((v) => {
        const y = AXIS_Y - valH(v)
        return (
          <g key={v}>
            <line x1={AXIS_X} y1={y} x2={W - 8} y2={y} stroke="#D1D5DB" strokeWidth={1} />
            <text x={AXIS_X - 4} y={y + 4} textAnchor="end" fontSize={8} fill="#6B7280">
              {v}
            </text>
          </g>
        )
      })}

      {/* Bars */}
      {BARS.map((bar, i) => {
        const x       = barLeft(i)
        const cx      = barCx(i)
        const h       = valH(bar.value)
        const y       = AXIS_Y - h
        const focused = isFocused(bar.key, focus)
        const dimmed  = isDimmed(bar.key, focus)
        const color   = dimmed ? DIM_COLOR : focused ? FOCUS_COLOR : BAR_COLOR

        return (
          <g key={bar.key}>
            {/* Bar body */}
            <rect x={x} y={y} width={BAR_W} height={h} fill={color} rx={2} />
            {/* Focus ring */}
            {focused && (
              <rect
                x={x - 2}
                y={y - 2}
                width={BAR_W + 4}
                height={h + 2}
                fill="none"
                stroke={FOCUS_COLOR}
                strokeWidth={2}
                rx={3}
                opacity={0.5}
              />
            )}
            {/* Value above bar (explainer only) */}
            {showValues && (
              <text
                x={cx}
                y={y - 4}
                textAnchor="middle"
                fontSize={9}
                fontWeight={800}
                fill={dimmed ? '#9CA3AF' : '#111827'}
              >
                {bar.value}
              </text>
            )}
            {/* Month label */}
            <text
              x={cx}
              y={AXIS_Y + 14}
              textAnchor="middle"
              fontSize={9}
              fontWeight={600}
              fill={dimmed ? '#9CA3AF' : '#1F2937'}
            >
              {lang === 'id' ? bar.label_id : bar.label_en}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function MuseumBarChartSASMO20G3Q19Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Diagram batang tamu Museum Nasional Jan–Jun 2019: Jan=100, Feb=200, Mar=250, Apr=150, Mei=50, Jun=250 tamu."
    >
      <MuseumBarChartG3Figure />
    </div>
  )
}
