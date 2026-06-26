// Illustration for SASMO-19-G2-Q4
// "Find the difference in length between the saw and the screwdriver."
//
// Figure (faithful to OCR 2019-2020.imgs/002.jpg):
//   Ruler 0–12 cm; saw spans 0–10 (10 cm); screwdriver spans 7–11 (4 cm).
//   Alignment dashed lines at 0, 7, 10, 11 cm.
//
// Primitive used: AxisLine + AxisTick imported from ./primitives/NumberLine.
// Sub-components SawShape, ScrewdriverShape, AlignDash, MeasureBrace are
// exported for reuse in RulerToolsSASMO19G2Q4Explainer.

import { AxisLine, AxisTick } from './primitives/NumberLine'

// ── Layout constants (exported for explainer) ─────────────────────────────────
export const SVG_W = 400
export const SVG_H = 200
export const RULER_Y = 165
const PAD_L = 30
const AXIS_W = SVG_W - PAD_L - 40 // right pad 30 + 10 for arrowhead
const RANGE = 12
export const PX_PER_UNIT = AXIS_W / RANGE

export function xAt(v: number): number {
  return PAD_L + v * PX_PER_UNIT
}

// Tool measurement positions (cm)
export const SAW_CM0 = 0
export const SAW_CM1 = 10
export const SDW_CM0 = 7
export const SDW_CM1 = 11

// Tool vertical bounds
export const SAW_TOP = 15
export const SAW_BOT = 82
export const SDW_TOP = 92
export const SDW_BOT = 133

// Colors
const INK = '#1F2937'
const FONT = 'ui-sans-serif, system-ui, sans-serif'
const SAW_BODY_FILL = '#6B7280'
const SAW_TEETH_FILL = '#374151'
const SAW_HANDLE_FILL = '#DC2626'
const SDW_HANDLE_FILL = '#F59E0B'
const SDW_SHAFT_FILL = '#9CA3AF'
const SDW_TIP_FILL = '#6B7280'

// ── Saw teeth path ────────────────────────────────────────────────────────────
function teethPath(x0: number, x1: number, baseY: number): string {
  const period = 9
  const depth = 8
  const parts: string[] = [`M ${x0.toFixed(1)},${baseY}`]
  let x = x0
  while (x + period <= x1 - 1) {
    parts.push(
      `L ${(x + period / 2).toFixed(1)},${baseY + depth} L ${(x + period).toFixed(1)},${baseY}`,
    )
    x += period
  }
  parts.push(`L ${x1.toFixed(1)},${baseY}`)
  return parts.join(' ')
}

// ── SawShape ──────────────────────────────────────────────────────────────────
export function SawShape({ highlight = false }: { highlight?: boolean }) {
  const x0 = xAt(SAW_CM0)
  const x1 = xAt(SAW_CM1)
  const handleW = 32
  const bodyTop = SAW_TOP + 14
  const bodyBot = SAW_BOT - 8
  const teeth = teethPath(x0 + handleW, x1, bodyBot)
  const ring = highlight ? '#2563EB' : undefined

  return (
    <g>
      {/* Body */}
      <rect
        x={x0 + handleW}
        y={bodyTop}
        width={x1 - x0 - handleW}
        height={bodyBot - bodyTop}
        fill={SAW_BODY_FILL}
        stroke={ring}
        strokeWidth={ring ? 2 : 0}
      />
      {/* Teeth */}
      <path d={teeth} fill={SAW_TEETH_FILL} />
      {/* Handle */}
      <rect
        x={x0}
        y={SAW_TOP + 6}
        width={handleW + 6}
        height={SAW_BOT - SAW_TOP - 12}
        rx={4}
        fill={SAW_HANDLE_FILL}
        stroke={ring}
        strokeWidth={ring ? 2 : 0}
      />
      {/* Label */}
      <text
        x={(x0 + x1) / 2}
        y={SAW_TOP - 1}
        textAnchor="middle"
        fontSize={11}
        fontWeight={600}
        fill={highlight ? '#2563EB' : INK}
        fontFamily={FONT}
      >
        gergaji
      </text>
    </g>
  )
}

// ── ScrewdriverShape ──────────────────────────────────────────────────────────
export function ScrewdriverShape({ highlight = false }: { highlight?: boolean }) {
  const x0 = xAt(SDW_CM0)
  const x1 = xAt(SDW_CM1)
  const handleW = 42
  const midY = (SDW_TOP + SDW_BOT) / 2
  const shaftH = 13
  const ring = highlight ? '#059669' : undefined

  return (
    <g>
      {/* Handle */}
      <rect
        x={x0}
        y={SDW_TOP + 5}
        width={handleW}
        height={SDW_BOT - SDW_TOP - 10}
        rx={5}
        fill={SDW_HANDLE_FILL}
        stroke={ring}
        strokeWidth={ring ? 2 : 0}
      />
      {/* Shaft */}
      <rect
        x={x0 + handleW}
        y={midY - shaftH / 2}
        width={x1 - x0 - handleW - 7}
        height={shaftH}
        fill={SDW_SHAFT_FILL}
        stroke={ring}
        strokeWidth={ring ? 1.5 : 0}
      />
      {/* Flat tip */}
      <rect
        x={x1 - 7}
        y={midY - 11}
        width={7}
        height={22}
        fill={SDW_TIP_FILL}
        stroke={ring}
        strokeWidth={ring ? 1.5 : 0}
      />
      {/* Label */}
      <text
        x={(x0 + x1) / 2}
        y={SDW_TOP - 1}
        textAnchor="middle"
        fontSize={11}
        fontWeight={600}
        fill={highlight ? '#059669' : INK}
        fontFamily={FONT}
      >
        obeng
      </text>
    </g>
  )
}

// ── Alignment dash ────────────────────────────────────────────────────────────
export function AlignDash({
  x,
  y0,
  y1,
  color = '#9CA3AF',
}: {
  x: number
  y0: number
  y1: number
  color?: string
}) {
  return (
    <line
      x1={x}
      y1={y0}
      x2={x}
      y2={y1}
      stroke={color}
      strokeWidth={1.5}
      strokeDasharray="4,3"
    />
  )
}

// ── Measurement brace (horizontal span with tick ends and label) ───────────────
export function MeasureBrace({
  x0,
  x1,
  y,
  label,
  color,
}: {
  x0: number
  x1: number
  y: number
  label: string
  color: string
}) {
  const TICK = 7
  return (
    <g>
      <line x1={x0} y1={y} x2={x1} y2={y} stroke={color} strokeWidth={2} />
      <line x1={x0} y1={y - TICK} x2={x0} y2={y + TICK} stroke={color} strokeWidth={2} />
      <line x1={x1} y1={y - TICK} x2={x1} y2={y + TICK} stroke={color} strokeWidth={2} />
      <text
        x={(x0 + x1) / 2}
        y={y + 18}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill={color}
        fontFamily={FONT}
      >
        {label}
      </text>
    </g>
  )
}

// ── Main illustration ─────────────────────────────────────────────────────────
export default function RulerToolsSASMO19G2Q4Illustration() {
  const ticks = Array.from({ length: 13 }, (_, i) => i) // 0 to 12
  const x0Axis = PAD_L - 10
  const x1Axis = PAD_L + AXIS_W

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      style={{ display: 'block' }}
      aria-label="Gergaji (10 cm) dan obeng (4 cm) di atas penggaris; selisih panjangnya 6 cm"
    >
      {/* Alignment dashed lines */}
      <AlignDash x={xAt(SAW_CM0)} y0={SAW_TOP + 6} y1={RULER_Y} />
      <AlignDash x={xAt(SDW_CM0)} y0={SDW_TOP + 4} y1={RULER_Y} />
      <AlignDash x={xAt(SAW_CM1)} y0={SAW_TOP + 6} y1={RULER_Y} />
      <AlignDash x={xAt(SDW_CM1)} y0={SDW_TOP + 4} y1={RULER_Y} />

      {/* Tools */}
      <SawShape />
      <ScrewdriverShape />

      {/* Ruler */}
      <AxisLine x0={x0Axis} x1={x1Axis} lineY={RULER_Y} />
      {ticks.map((v) => (
        <AxisTick key={v} x={xAt(v)} lineY={RULER_Y} label={String(v)} />
      ))}
      <text
        x={x1Axis + 14}
        y={RULER_Y + 4}
        textAnchor="start"
        fontSize={10}
        fill={INK}
        fontFamily={FONT}
      >
        cm
      </text>
    </svg>
  )
}
