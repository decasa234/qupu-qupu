// OSN 2025 SD Kabupaten Q14 — vertical bar chart (diagram batang) for library book loans.
// Source: docs/reference/ocr-res/osn/kabupaten/sd/2025.imgs/009.jpg
// Data: Kelas 4 = 25 buku, Kelas 5 = 30 buku, Kelas 6 = 45 buku. Answer: D (total = 100).
// Copy-adapted from BarChartOSN09KQ23Illustration.

import type { BarKey } from './barChartOSN25KQ14Steps'

export interface BarChartFigureProps {
  /** Which bar is highlighted; null = all at full opacity. */
  focus?: BarKey | null
  lang?: 'en' | 'id'
}

// ── Layout constants ─────────────────────────────────────────────────────────
const W       = 300
const H       = 224
const AXIS_X  = 46   // left axis x
const AXIS_Y  = 170  // bottom axis y
const PLOT_H  = 126  // usable bar height (from AXIS_Y up)
const MAX_VAL = 50   // y-scale max (5-unit headroom above 45)
const BAR_W   = 52
const BAR_GAP = 26

// ── Bar definitions ──────────────────────────────────────────────────────────
const BARS = [
  { key: 'g4' as BarKey, label_id: 'Kelas 4', label_en: 'Grade 4', value: 25 },
  { key: 'g5' as BarKey, label_id: 'Kelas 5', label_en: 'Grade 5', value: 30 },
  { key: 'g6' as BarKey, label_id: 'Kelas 6', label_en: 'Grade 6', value: 45 },
]

const COLORS: Record<BarKey, string> = {
  g4: '#2563EB',
  g5: '#059669',
  g6: '#D97706',
}

const PLOT_W  = W - AXIS_X - 14
const START_X = AXIS_X + (PLOT_W - (3 * BAR_W + 2 * BAR_GAP)) / 2

function barLeft(i: number) { return START_X + i * (BAR_W + BAR_GAP) }
function barCx(i: number)   { return barLeft(i) + BAR_W / 2 }
function barH(v: number)    { return (v / MAX_VAL) * PLOT_H }

const Y_TICKS = [0, 10, 20, 30, 40, 50]

const TITLE_ID = 'Data Peminjaman Buku Perpustakaan'
const TITLE_EN = 'Library Book Borrowing Data'

/** Shared SVG figure — used by both illustration and explainer. */
export function BarChartFigure({ focus = null, lang = 'id' }: BarChartFigureProps) {
  const title = lang === 'id' ? TITLE_ID : TITLE_EN
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── Chart title ──────────────────────────────────────────────── */}
      <text
        x={W / 2}
        y={12}
        textAnchor="middle"
        fontSize={9.5}
        fontWeight={700}
        fill="#111827"
      >
        {title}
      </text>

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
        x={10}
        y={AXIS_Y - PLOT_H / 2}
        transform={`rotate(-90, 10, ${AXIS_Y - PLOT_H / 2})`}
        textAnchor="middle"
        fontSize={9}
        fontWeight={700}
        fill="#374151"
      >
        {lang === 'id' ? 'Banyak Buku' : 'Books Borrowed'}
      </text>

      {/* X-axis label */}
      <text
        x={(AXIS_X + W - 10) / 2}
        y={H - 2}
        textAnchor="middle"
        fontSize={9}
        fontWeight={700}
        fill="#374151"
      >
        {lang === 'id' ? 'Kelas' : 'Grade'}
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
        const label = lang === 'id' ? bar.label_id : bar.label_en

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
            {/* Category label */}
            <text
              x={cx}
              y={AXIS_Y + 15}
              textAnchor="middle"
              fontSize={9}
              fontWeight={600}
              fill={dimmed ? '#9CA3AF' : '#1F2937'}
            >
              {label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function BarChartOSN25KQ14Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Diagram batang peminjaman buku perpustakaan: Kelas 4 meminjam 25 buku, Kelas 5 meminjam 30 buku, Kelas 6 meminjam 45 buku."
    >
      <BarChartFigure />
    </div>
  )
}
