// SASMO 2019 Grade 4 Q20 — vertical bar chart, Mary's spending Mon–Fri.
// Source: docs/reference/ocr-res/sasmo/contest/g4/2019-2020.imgs/017.jpg
// Bars (units): Mon=2, Tue=4, Wed=3, Thu=5, Fri=1. Y-axis unlabelled (student finds scale).
// Adapted from BarChartOSN09KQ23Illustration pattern.

import type { DayKey } from './barChartMarySpentSASMO19G4Q20Steps'
import { DAY_DATA } from './barChartMarySpentSASMO19G4Q20Steps'

export interface BarChartMaryFigureProps {
  /** Highlighted day keys (others dimmed). Null = all normal. */
  focus?: DayKey[] | null
  /** Show computed $ labels above bars. */
  showValues?: boolean
  lang?: 'en' | 'id'
}

// ── Layout constants ──────────────────────────────────────────────────────────
const W        = 340
const H        = 240
const AXIS_X   = 52    // left x for y-axis line
const AXIS_Y   = 186   // bottom y for x-axis line
const PLOT_H   = 150   // usable bar height
const UNIT_H   = 25    // px per unit (6 gridlines at 0–5; slight headroom)
const BAR_W    = 38
const BAR_GAP  = 12
const N        = DAY_DATA.length  // 5
const PLOT_W   = W - AXIS_X - 12

// Centre the 5-bar cluster
const CLUSTER_W = N * BAR_W + (N - 1) * BAR_GAP  // 5×38 + 4×12 = 238
const START_X   = AXIS_X + (PLOT_W - CLUSTER_W) / 2

function barLeft(i: number) { return START_X + i * (BAR_W + BAR_GAP) }
function barCx(i: number)   { return barLeft(i) + BAR_W / 2 }

const GRID_LINES = [0, 1, 2, 3, 4, 5] // equally spaced horizontal lines

const BAR_COLOR   = '#52525B'  // neutral zinc-600, matches source gray
const FOCUS_COLOR = '#2563EB'  // blue for highlighted bars

/** Shared SVG figure — used by both illustration and explainer. */
export function BarChartMaryFigure({
  focus = null,
  showValues = false,
  lang = 'id',
}: BarChartMaryFigureProps) {
  const isFocused = (key: DayKey) => focus !== null && focus.includes(key)
  const isDimmed  = (key: DayKey) => focus !== null && !focus.includes(key)

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── Y-axis (rotated label) ───────────────────────────────────── */}
      <text
        x={11}
        y={AXIS_Y - PLOT_H / 2}
        transform={`rotate(-90, 11, ${AXIS_Y - PLOT_H / 2})`}
        textAnchor="middle"
        fontSize={10}
        fontWeight={700}
        fill="#374151"
      >
        {lang === 'id' ? 'Jumlah ($)' : 'Amount spent ($)'}
      </text>

      {/* Y-axis line */}
      <line x1={AXIS_X} y1={AXIS_Y - PLOT_H - 6} x2={AXIS_X} y2={AXIS_Y} stroke="#4B5563" strokeWidth={2} />

      {/* X-axis line */}
      <line x1={AXIS_X} y1={AXIS_Y} x2={W - 10} y2={AXIS_Y} stroke="#4B5563" strokeWidth={2} />

      {/* ── Equally-spaced horizontal grid lines ─────────────────────── */}
      {GRID_LINES.map((u) => {
        const y = AXIS_Y - u * UNIT_H
        return (
          <g key={u}>
            {/* Tick mark */}
            <line x1={AXIS_X - 5} y1={y} x2={AXIS_X} y2={y} stroke="#4B5563" strokeWidth={1.5} />
            {/* Grid line */}
            <line x1={AXIS_X} y1={y} x2={W - 10} y2={y} stroke="#D1D5DB" strokeWidth={1} />
            {/* Only label "0" at the bottom (faithful to source) */}
            {u === 0 && (
              <text x={AXIS_X - 8} y={y} textAnchor="end" dominantBaseline="central" fontSize={9} fill="#6B7280">
                0
              </text>
            )}
          </g>
        )
      })}

      {/* ── Bars ─────────────────────────────────────────────────────── */}
      {DAY_DATA.map((day, i) => {
        const x       = barLeft(i)
        const cx      = barCx(i)
        const barH    = day.units * UNIT_H
        const y       = AXIS_Y - barH
        const focused = isFocused(day.key)
        const dimmed  = isDimmed(day.key)
        const color   = focused ? FOCUS_COLOR : BAR_COLOR
        const label   = lang === 'id' ? day.label_id : day.label_en

        return (
          <g key={day.key} opacity={dimmed ? 0.25 : 1}>
            {/* Bar body */}
            <rect
              x={x}
              y={y}
              width={BAR_W}
              height={barH}
              fill={color}
              rx={2}
              stroke={focused ? '#1E3A8A' : 'none'}
              strokeWidth={focused ? 2 : 0}
              opacity={0.9}
            />
            {/* Dollar value badge — shown in explainer beats */}
            {showValues && (
              <text
                x={cx}
                y={y - 5}
                textAnchor="middle"
                fontSize={11}
                fontWeight={800}
                fill={focused ? FOCUS_COLOR : '#111827'}
              >
                ${day.dollars}
              </text>
            )}
            {/* Day label — single word or split */}
            {label.split(' ').map((word, wi) => (
              <text
                key={wi}
                x={cx}
                y={AXIS_Y + 12 + wi * 11}
                textAnchor="middle"
                fontSize={9}
                fontWeight={600}
                fill={dimmed ? '#9CA3AF' : '#1F2937'}
              >
                {word}
              </text>
            ))}
          </g>
        )
      })}

      {/* X-axis label */}
      <text
        x={(AXIS_X + W - 10) / 2}
        y={H - 4}
        textAnchor="middle"
        fontSize={10}
        fontWeight={700}
        fill="#374151"
      >
        {lang === 'id' ? 'Hari' : 'Days'}
      </text>
    </svg>
  )
}

export default function BarChartMarySpentSASMO19G4Q20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Diagram batang pengeluaran Mary: Senin 2 satuan, Selasa 4 satuan, Rabu 3 satuan, Kamis 5 satuan, Jumat 1 satuan."
    >
      <BarChartMaryFigure />
    </div>
  )
}
