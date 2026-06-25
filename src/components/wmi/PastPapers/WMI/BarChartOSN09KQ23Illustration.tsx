// OSN 2009 SD Kabupaten Q23 — vertical bar chart (diagram batang).
// Source: docs/reference/ocr-res/osn/kabupaten/sd/2009.imgs/009.jpg
// Data: Bersepeda=75, Jalan kaki=100, Antar jemput=37. Answer: jalan kaki (100).
// No existing primitive covers vertical bar charts — built fresh.

export type BarKey = 'bike' | 'walk' | 'pickup'

export interface BarChartFigureProps {
  /** Which bar is highlighted; null = all at full opacity. */
  focus?: BarKey | null
  lang?: 'en' | 'id'
}

// ── Layout constants ─────────────────────────────────────────────────────────
const W       = 300
const H       = 218
const AXIS_X  = 50   // left axis x
const AXIS_Y  = 165  // bottom axis y
const PLOT_H  = 132  // usable bar height (from AXIS_Y up)
const MAX_VAL = 110  // y-scale max (10-unit headroom above 100)
const BAR_W   = 55
const BAR_GAP = 20

// ── Bar definitions ──────────────────────────────────────────────────────────
const BARS = [
  { key: 'bike'   as BarKey, label_id: 'Bersepeda',    label_en: 'Bicycle',  value: 75  },
  { key: 'walk'   as BarKey, label_id: 'Jalan kaki',   label_en: 'Walking',  value: 100 },
  { key: 'pickup' as BarKey, label_id: 'Antar jemput', label_en: 'Drop-off', value: 37  },
]

const COLORS: Record<BarKey, string> = {
  bike:   '#2563EB',
  walk:   '#059669',
  pickup: '#D97706',
}

// Total bars span = 3×55 + 2×20 = 205 px
const PLOT_W    = W - AXIS_X - 14  // ~236
const START_X   = AXIS_X + (PLOT_W - (3 * BAR_W + 2 * BAR_GAP)) / 2

function barLeft(i: number) { return START_X + i * (BAR_W + BAR_GAP) }
function barCx(i: number)   { return barLeft(i) + BAR_W / 2 }
function barH(v: number)    { return (v / MAX_VAL) * PLOT_H }

const Y_TICKS = [0, 25, 50, 75, 100]

/** Shared SVG figure — used by both illustration and explainer. */
export function BarChartFigure({ focus = null, lang = 'id' }: BarChartFigureProps) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── Axes ─────────────────────────────────────────────────────── */}
      {/* Y-axis */}
      <line x1={AXIS_X} y1={AXIS_Y - PLOT_H - 8} x2={AXIS_X} y2={AXIS_Y} stroke="#4B5563" strokeWidth={2} />
      {/* X-axis */}
      <line x1={AXIS_X} y1={AXIS_Y} x2={W - 10} y2={AXIS_Y} stroke="#4B5563" strokeWidth={2} />
      {/* Y arrowhead */}
      <polygon
        points={`${AXIS_X},${AXIS_Y - PLOT_H - 14} ${AXIS_X - 5},${AXIS_Y - PLOT_H - 2} ${AXIS_X + 5},${AXIS_Y - PLOT_H - 2}`}
        fill="#4B5563"
      />
      {/* X arrowhead */}
      <polygon
        points={`${W - 6},${AXIS_Y} ${W - 16},${AXIS_Y - 5} ${W - 16},${AXIS_Y + 5}`}
        fill="#4B5563"
      />

      {/* Y-axis label (rotated) */}
      <text
        x={12}
        y={AXIS_Y - PLOT_H / 2}
        transform={`rotate(-90, 12, ${AXIS_Y - PLOT_H / 2})`}
        textAnchor="middle"
        fontSize={10}
        fontWeight={700}
        fill="#374151"
      >
        Jumlah Siswa
      </text>

      {/* X-axis label */}
      <text
        x={(AXIS_X + W - 10) / 2}
        y={H - 2}
        textAnchor="middle"
        fontSize={10}
        fontWeight={700}
        fill="#374151"
      >
        Cara datang
      </text>

      {/* ── Y-axis ticks and grid lines ──────────────────────────────── */}
      {Y_TICKS.map((v) => {
        const y = AXIS_Y - barH(v)
        return (
          <g key={v}>
            <line x1={AXIS_X - 5} y1={y} x2={AXIS_X + 1} y2={y} stroke="#4B5563" strokeWidth={1.5} />
            <line x1={AXIS_X + 1} y1={y} x2={W - 10} y2={y} stroke="#E5E7EB" strokeWidth={1} strokeDasharray="3 3" />
            <text x={AXIS_X - 8} y={y} textAnchor="end" dominantBaseline="central" fontSize={9} fill="#6B7280">
              {v}
            </text>
          </g>
        )
      })}

      {/* ── Bars ─────────────────────────────────────────────────────── */}
      {BARS.map((bar, i) => {
        const x    = barLeft(i)
        const cx   = barCx(i)
        const h    = barH(bar.value)
        const y    = AXIS_Y - h
        const color = COLORS[bar.key]
        const dimmed      = focus !== null && focus !== bar.key
        const highlighted = focus === bar.key

        // Split two-word labels for legibility
        const [word1, word2] = (lang === 'id' ? bar.label_id : bar.label_en).split(' ')

        return (
          <g key={bar.key} opacity={dimmed ? 0.28 : 1}>
            {/* Bar body */}
            <rect
              x={x}
              y={y}
              width={BAR_W}
              height={h}
              fill={color}
              rx={3}
              stroke={highlighted ? '#1F2937' : color}
              strokeWidth={highlighted ? 2.5 : 0.5}
              opacity={0.88}
            />
            {/* Highlight ring when focused */}
            {highlighted && (
              <rect
                x={x - 2}
                y={y - 2}
                width={BAR_W + 4}
                height={h + 2}
                fill="none"
                stroke={color}
                strokeWidth={2.5}
                rx={4}
                opacity={0.5}
              />
            )}
            {/* Value label above bar */}
            <text
              x={cx}
              y={y - 5}
              textAnchor="middle"
              fontSize={12}
              fontWeight={800}
              fill={dimmed ? '#9CA3AF' : '#111827'}
            >
              {bar.value}
            </text>
            {/* Category label (line 1) */}
            <text
              x={cx}
              y={AXIS_Y + 14}
              textAnchor="middle"
              fontSize={9}
              fontWeight={600}
              fill={dimmed ? '#9CA3AF' : '#1F2937'}
            >
              {word1}
            </text>
            {/* Category label (line 2, if two-word) */}
            {word2 && (
              <text
                x={cx}
                y={AXIS_Y + 25}
                textAnchor="middle"
                fontSize={9}
                fontWeight={600}
                fill={dimmed ? '#9CA3AF' : '#1F2937'}
              >
                {word2}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function BarChartOSN09KQ23Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Diagram batang cara siswa menuju sekolah: Bersepeda 75 siswa, Jalan kaki 100 siswa, Antar jemput 37 siswa."
    >
      <BarChartFigure />
    </div>
  )
}
