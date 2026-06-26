// SASMO 2020 Grade 4 Q19 — bar chart: museum visitors Jan–Jun 2019.
// Source: docs/reference/ocr-res/sasmo/contest/g4/2019-2020.imgs/029.jpg
// Bar units: Jan=2, Feb=4, Mar=5, Apr=3, May=1, Jun=5 (answer: 2000)
// Adapted from BarChartOSN09KQ23Illustration.tsx (same house style).
// Y-axis intentionally unlabeled — scale is determined by the problem condition.

export type MonthKey = 'jan' | 'feb' | 'mar' | 'apr' | 'may' | 'jun'
export type BarFocus = null | MonthKey | 'jan_may'

export interface MuseumBarChartFigureProps {
  focus?: BarFocus
  lang?: 'en' | 'id'
  /** Show the unit count above each bar (explainer only). */
  showUnits?: boolean
}

// ── Layout ───────────────────────────────────────────────────────────────────
const W       = 340
const H       = 230
const AXIS_X  = 28
const AXIS_Y  = 180
const PLOT_H  = 140   // pixel height for MAX_U units
const MAX_U   = 6     // one grid-line of headroom above the max bar (5)
const BAR_W   = 38
const BAR_GAP = 10

// ── Data ─────────────────────────────────────────────────────────────────────
const BARS: { key: MonthKey; label_id: string; label_en: string; units: number }[] = [
  { key: 'jan', label_id: 'Jan', label_en: 'Jan', units: 2 },
  { key: 'feb', label_id: 'Feb', label_en: 'Feb', units: 4 },
  { key: 'mar', label_id: 'Mar', label_en: 'Mar', units: 5 },
  { key: 'apr', label_id: 'Apr', label_en: 'Apr', units: 3 },
  { key: 'may', label_id: 'Mei', label_en: 'May', units: 1 },
  { key: 'jun', label_id: 'Jun', label_en: 'Jun', units: 5 },
]

const BAR_COLOR  = '#3B6CB5'
const FOCUS_COLOR = '#1D4ED8'
const DIM_COLOR  = '#93C5FD'
const Y_UNITS    = [1, 2, 3, 4, 5]

const PLOT_W  = W - AXIS_X - 10
const START_X = AXIS_X + (PLOT_W - (6 * BAR_W + 5 * BAR_GAP)) / 2

function barLeft(i: number) { return START_X + i * (BAR_W + BAR_GAP) }
function barCx(i: number)   { return barLeft(i) + BAR_W / 2 }
function unitH(u: number)   { return (u / MAX_U) * PLOT_H }

function isFocused(key: MonthKey, focus: BarFocus): boolean {
  if (focus === null) return false
  if (focus === 'jan_may') return key === 'jan' || key === 'may'
  return focus === key
}

function isDimmed(key: MonthKey, focus: BarFocus): boolean {
  if (focus === null) return false
  if (focus === 'jan_may') return key !== 'jan' && key !== 'may'
  return focus !== key
}

/** Shared SVG figure — used by both illustration and explainer. */
export function MuseumBarChartFigure({
  focus = null,
  lang = 'id',
  showUnits = false,
}: MuseumBarChartFigureProps) {
  const title = lang === 'id' ? 'Tamu di Museum Nasional' : 'Guests at National Museum'
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
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

      {/* Equally-spaced horizontal grid lines (no y-axis numbers — unlabeled scale) */}
      {Y_UNITS.map((u) => {
        const y = AXIS_Y - unitH(u)
        return (
          <line
            key={u}
            x1={AXIS_X}
            y1={y}
            x2={W - 8}
            y2={y}
            stroke="#D1D5DB"
            strokeWidth={1}
          />
        )
      })}

      {/* Bars */}
      {BARS.map((bar, i) => {
        const x       = barLeft(i)
        const cx      = barCx(i)
        const h       = unitH(bar.units)
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
            {/* Unit count above bar (explainer only) */}
            {showUnits && (
              <text
                x={cx}
                y={y - 4}
                textAnchor="middle"
                fontSize={10}
                fontWeight={800}
                fill={dimmed ? '#9CA3AF' : '#111827'}
              >
                {bar.units}
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

export default function MuseumBarChartSASMO20G4Q19Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Diagram batang tamu Museum Nasional Jan–Jun 2019: Jan=2 satuan, Feb=4 satuan, Mar=5 satuan, Apr=3 satuan, Mei=1 satuan, Jun=5 satuan. Skala sumbu-y tidak berlabel."
    >
      <MuseumBarChartFigure />
    </div>
  )
}
