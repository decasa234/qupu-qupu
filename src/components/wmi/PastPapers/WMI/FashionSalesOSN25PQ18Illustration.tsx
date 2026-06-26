// OSN 2025 SD Provinsi Q18 — fashion store weekly sales bar chart (diagram batang).
// Source: docs/reference/ocr-res/osn/provinsi/sd/2025.imgs/009.jpg
// Weekly totals: Kaos=82, Kemeja=44, Gamis=53, Celana=87, Kerudung=94.
// Copy-adapted from BarChartOSN25KQ14Illustration (5-bar total chart vs 3-bar source).

import { PRODUCT_DATA } from './salesBarOSN25PQ18Steps'
import type { FocusKey } from './salesBarOSN25PQ18Steps'

export interface FashionSalesFigureProps {
  /** Which product bar to highlight; null = all at full opacity. */
  focus?: FocusKey
  lang?: 'en' | 'id'
}

// ── Layout constants ──────────────────────────────────────────────────────────
const W       = 330
const H       = 240
const AXIS_X  = 52    // left axis x
const AXIS_Y  = 182   // bottom axis y
const PLOT_H  = 140   // usable bar height
const MAX_VAL = 100   // y-scale max (headroom above 94)
const BAR_W   = 38
const BAR_GAP = 14

// 5 bars: span = 5×38 + 4×14 = 246 px
const PLOT_W  = W - AXIS_X - 14        // 264 px
const START_X = AXIS_X + (PLOT_W - (5 * BAR_W + 4 * BAR_GAP)) / 2

function barLeft(i: number) { return START_X + i * (BAR_W + BAR_GAP) }
function barCx(i: number)   { return barLeft(i) + BAR_W / 2 }
function barH(v: number)    { return (v / MAX_VAL) * PLOT_H }

const Y_TICKS = [0, 20, 40, 60, 80, 100]

const COLORS: Record<string, string> = {
  kaos:     '#2563EB',
  kemeja:   '#7C3AED',
  gamis:    '#DB2777',
  celana:   '#059669',
  kerudung: '#D97706',
}

const TITLE_ID = 'Penjualan Barang Fashion'
const TITLE_EN = 'Fashion Store Weekly Sales'

/** Shared SVG figure — used by both illustration and explainer. */
export function FashionSalesFigure({ focus = null, lang = 'id' }: FashionSalesFigureProps) {
  const title = lang === 'id' ? TITLE_ID : TITLE_EN
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── Chart title ──────────────────────────────────────────────── */}
      <text x={W / 2} y={13} textAnchor="middle" fontSize={10} fontWeight={700} fill="#111827">
        {title}
      </text>

      {/* ── Axes ─────────────────────────────────────────────────────── */}
      <line x1={AXIS_X} y1={AXIS_Y - PLOT_H - 8} x2={AXIS_X} y2={AXIS_Y} stroke="#4B5563" strokeWidth={2} />
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
        x={11}
        y={AXIS_Y - PLOT_H / 2}
        transform={`rotate(-90, 11, ${AXIS_Y - PLOT_H / 2})`}
        textAnchor="middle"
        fontSize={9}
        fontWeight={700}
        fill="#374151"
      >
        {lang === 'id' ? 'Jumlah Terjual' : 'Units Sold'}
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
        {lang === 'id' ? 'Jenis Barang' : 'Product'}
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
      {PRODUCT_DATA.map((prod, i) => {
        const x         = barLeft(i)
        const cx        = barCx(i)
        const h         = barH(prod.value)
        const y         = AXIS_Y - h
        const color     = COLORS[prod.key]
        const dimmed    = focus !== null && focus !== prod.key
        const highlighted = focus === prod.key
        const label     = lang === 'id' ? prod.label_id : prod.label_en

        return (
          <g key={prod.key} opacity={dimmed ? 0.28 : 1}>
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
              fontSize={11}
              fontWeight={800}
              fill={dimmed ? '#9CA3AF' : '#111827'}
            >
              {prod.value}
            </text>
            {/* Category label */}
            <text
              x={cx}
              y={AXIS_Y + 15}
              textAnchor="middle"
              fontSize={8.5}
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

export default function FashionSalesOSN25PQ18Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Diagram batang penjualan barang fashion: Kaos 82, Kemeja 44, Gamis 53, Celana 87, Kerudung 94 buah."
    >
      <FashionSalesFigure />
    </div>
  )
}
