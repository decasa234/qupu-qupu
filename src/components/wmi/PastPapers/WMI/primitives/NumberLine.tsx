/**
 * NumberLine — reusable horizontal number-line SVG primitive for WMI/IKMC illustration figures.
 *
 * Consolidates the repeating number-line pattern found in:
 *   - NumberLine5ECIllustration (0–4 with jump arcs, kangaroo problem)
 *   - Metro14ECIllustration (station track, A–F labelled dots)
 *   - AnimalLine17ECIllustration (labelled animal positions on a linear axis)
 *
 * Pure SVG render — no framer-motion, no React hooks, SSR-safe (no window/document).
 *
 * @example
 * // 0–20 number line with two kangaroo-style jump arcs
 * <NumberLine
 *   min={0}
 *   max={20}
 *   step={2}
 *   marks={[{ value: 0, label: 'Start', color: '#3B82F6' }, { value: 16, label: '16', color: '#10B981' }]}
 *   jumps={[
 *     { from: 0, to: 2, label: '+2' },
 *     { from: 2, to: 3, label: '+1' },
 *   ]}
 *   width={380}
 * />
 */

// ── Prop types ─────────────────────────────────────────────────────────────────

/** A marked dot drawn on the number line. */
export interface NumberLineMark {
  /** The numeric position on the line. */
  value: number
  /** Optional text rendered below the dot (overrides the axis tick label). */
  label?: string
  /** Fill colour for the dot. Defaults to '#3B82F6' (blue). */
  color?: string
}

/** A hop arc drawn above the number line with an arrowhead at landing. */
export interface NumberLineJump {
  /** Start position (must be within [min, max]). */
  from: number
  /** End position (must be within [min, max]). */
  to: number
  /** Optional text centred above the arc apex. */
  label?: string
  /** Stroke colour. Defaults to '#374151'. */
  color?: string
}

/** Explicit tick override — value + optional display label. */
export interface NumberLineTick {
  value: number
  label?: string
}

export interface NumberLineProps {
  /** Minimum value shown on the axis. */
  min: number
  /** Maximum value shown on the axis (the axis arrow extends slightly past this). */
  max: number
  /**
   * Tick spacing. Generates evenly spaced ticks from `min` to `max`.
   * Ignored when `ticks` is provided. Defaults to 1.
   */
  step?: number
  /**
   * Explicit tick list. Overrides `step` when provided.
   * Each tick shows a short vertical mark; `label` defaults to the numeric value.
   */
  ticks?: NumberLineTick[]
  /** Dots drawn on the line (coloured circles with optional labels). */
  marks?: NumberLineMark[]
  /**
   * Arc hops rendered above the line, each with an arrowhead at the landing point.
   * Arc height is proportional to the span of the jump so short hops stay compact
   * and long hops rise naturally without colliding with the baseline.
   */
  jumps?: NumberLineJump[]
  /**
   * Total SVG width in pixels. Height is derived automatically from the tallest arc.
   * Defaults to 360.
   */
  width?: number
  /**
   * Optional axis label rendered below the right-hand arrowhead
   * (e.g. "bilangan" or "meter").
   */
  label?: string
}

// ── Layout helpers (pure functions, no hooks) ──────────────────────────────────

/** Horizontal padding on each side of the drawn axis. */
const PAD_LEFT = 28
const PAD_RIGHT = 32
/** Vertical padding above the highest arc and below the tick labels. */
const PAD_TOP = 14
const PAD_BOTTOM = 28
/** Height of each tick above / below the baseline. */
const TICK_HALF = 5
/** Radius of mark dots. */
const MARK_R = 5
/** Font family used for all text. */
const FONT = 'ui-sans-serif, system-ui, sans-serif'
/** Ink colour for the axis, ticks, and labels. */
const INK = '#1F2937'
/** Default jump arc colour. */
const ARC_DEFAULT = '#374151'
/** Default mark colour. */
const MARK_DEFAULT = '#3B82F6'

/** Arc height in pixels for a jump that spans `spanPx` pixels. Scales sub-linearly. */
function arcHeight(spanPx: number): number {
  // Tallest arc when span is widest; minimum 16 px so single-unit hops stay visible.
  return Math.max(16, spanPx * 0.45)
}

// ── Sub-components (exported so illustration files can reuse them) ─────────────

/**
 * Horizontal axis line from x0 to x1 at y=lineY, with an arrowhead at the right.
 */
export function AxisLine({
  x0,
  x1,
  lineY,
  color = INK,
}: {
  x0: number
  x1: number
  lineY: number
  color?: string
}) {
  return (
    <g>
      <line x1={x0} y1={lineY} x2={x1} y2={lineY} stroke={color} strokeWidth={2} />
      <polygon
        points={`${x1},${lineY - 5} ${x1 + 10},${lineY} ${x1},${lineY + 5}`}
        fill={color}
      />
    </g>
  )
}

/**
 * Single tick mark + numeric label at position x on the axis.
 */
export function AxisTick({
  x,
  lineY,
  label,
  color = INK,
}: {
  x: number
  lineY: number
  label: string
  color?: string
}) {
  return (
    <g>
      <line
        x1={x}
        y1={lineY - TICK_HALF}
        x2={x}
        y2={lineY + TICK_HALF}
        stroke={color}
        strokeWidth={1.8}
      />
      <text
        x={x}
        y={lineY + TICK_HALF + 14}
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

/**
 * Coloured dot at position x on the axis with an optional label below the tick area.
 */
export function MarkDot({
  x,
  lineY,
  label,
  color = MARK_DEFAULT,
}: {
  x: number
  lineY: number
  label?: string
  color?: string
}) {
  return (
    <g>
      <circle cx={x} cy={lineY} r={MARK_R} fill={color} stroke="white" strokeWidth={1.5} />
      {label != null && (
        <text
          x={x}
          y={lineY + MARK_R + 16}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill={color}
          fontFamily={FONT}
        >
          {label}
        </text>
      )}
    </g>
  )
}

/**
 * Quadratic bezier arc from (x1, lineY) to (x2, lineY) rising `height` px above the baseline,
 * with an arrowhead polygon at the landing point and an optional centred label.
 */
export function JumpArc({
  x1,
  x2,
  lineY,
  height,
  label,
  color = ARC_DEFAULT,
  strokeWidth = 2,
}: {
  x1: number
  x2: number
  lineY: number
  height: number
  label?: string
  color?: string
  strokeWidth?: number
}) {
  const midX = (x1 + x2) / 2
  const cy = lineY - height
  const d = `M ${x1} ${lineY} Q ${midX} ${cy} ${x2} ${lineY}`

  // Compute arrowhead direction from control-point tangent at t=1
  const ang = Math.atan2(lineY - cy, x2 - midX)
  const ax = x2 - 7 * Math.cos(ang)
  const ay = lineY - 7 * Math.sin(ang)

  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth} />
      <polygon
        points={`${x2},${lineY} ${ax - 4 * Math.sin(ang)},${ay + 4 * Math.cos(ang)} ${ax + 4 * Math.sin(ang)},${ay - 4 * Math.cos(ang)}`}
        fill={color}
      />
      {label != null && (
        <text
          x={midX}
          y={cy - 5}
          textAnchor="middle"
          fontSize={10}
          fontWeight={600}
          fill={color}
          fontFamily={FONT}
        >
          {label}
        </text>
      )}
    </g>
  )
}

// ── Main export ────────────────────────────────────────────────────────────────

/**
 * NumberLine
 *
 * Generic, prop-driven horizontal number-line primitive. Renders a labelled axis
 * with optional coloured mark dots and arc hop arrows above the line.
 *
 * When to use:
 *   - Any problem that has animals, people, or objects positioned on a numbered axis.
 *   - Jump / hop sequences (kangaroo, frog, bouncing ball) where arcs must be shown.
 *   - Train / station layouts where the Metro14EC pattern repeats (use `marks` as stations).
 *
 * @example
 * <NumberLine
 *   min={0} max={20} step={2}
 *   marks={[{ value: 0, color: '#3B82F6' }, { value: 16, color: '#10B981' }]}
 *   jumps={[{ from: 0, to: 2, label: '+2' }, { from: 2, to: 3, label: '+1' }]}
 * />
 */
export default function NumberLine({
  min,
  max,
  step = 1,
  ticks: ticksProp,
  marks = [],
  jumps = [],
  width = 360,
  label,
}: NumberLineProps) {
  // ── Derive tick list ─────────────────────────────────────────────────────────
  const ticks: NumberLineTick[] =
    ticksProp ??
    (() => {
      const list: NumberLineTick[] = []
      // Use a small epsilon to avoid float rounding missing the last tick
      for (let v = min; v <= max + step * 0.001; v += step) {
        const rounded = Math.round(v * 1e6) / 1e6
        if (rounded <= max) list.push({ value: rounded })
      }
      return list
    })()

  // ── Layout maths ─────────────────────────────────────────────────────────────
  const axisWidth = width - PAD_LEFT - PAD_RIGHT - 10 // 10 px for arrowhead overhang
  const range = max - min || 1
  const pxPerUnit = axisWidth / range

  /** Convert a domain value to SVG x-coordinate. */
  function xAt(value: number): number {
    return PAD_LEFT + (value - min) * pxPerUnit
  }

  // Compute the tallest arc to set SVG height
  const maxArcH =
    jumps.length > 0
      ? Math.max(...jumps.map((j) => arcHeight(Math.abs(j.to - j.from) * pxPerUnit)))
      : 0

  const lineY = PAD_TOP + maxArcH + 8 // 8 px breathing room above tallest arc
  const svgH = lineY + TICK_HALF + PAD_BOTTOM + (marks.some((m) => m.label) ? 6 : 0)

  const x0 = PAD_LEFT - 10
  const x1 = PAD_LEFT + axisWidth

  return (
    <svg
      viewBox={`0 0 ${width} ${svgH}`}
      width={width}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {/* Axis */}
      <AxisLine x0={x0} x1={x1} lineY={lineY} />

      {/* Optional axis label */}
      {label != null && (
        <text
          x={x1 + 14}
          y={lineY + 4}
          textAnchor="start"
          fontSize={10}
          fill={INK}
          fontFamily={FONT}
        >
          {label}
        </text>
      )}

      {/* Ticks */}
      {ticks.map((t) => (
        <AxisTick
          key={t.value}
          x={xAt(t.value)}
          lineY={lineY}
          label={t.label ?? String(t.value)}
        />
      ))}

      {/* Jump arcs (rendered before marks so dots sit on top) */}
      {jumps.map((j, i) => {
        const spanPx = Math.abs(j.to - j.from) * pxPerUnit
        return (
          <JumpArc
            key={i}
            x1={xAt(j.from)}
            x2={xAt(j.to)}
            lineY={lineY}
            height={arcHeight(spanPx)}
            label={j.label}
            color={j.color ?? ARC_DEFAULT}
          />
        )
      })}

      {/* Mark dots */}
      {marks.map((m, i) => (
        <MarkDot
          key={i}
          x={xAt(m.value)}
          lineY={lineY}
          label={m.label}
          color={m.color ?? MARK_DEFAULT}
        />
      ))}
    </svg>
  )
}
