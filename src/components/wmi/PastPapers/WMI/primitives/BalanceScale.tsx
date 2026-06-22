/**
 * BalanceScale — reusable single-scale SVG primitive for WMI / IKMC past-paper
 * illustrations.
 *
 * Renders one balance scale: a blue triangular pivot, a tilted (or level) beam,
 * and two shallow pans with V-hangers. The caller supplies pan contents as
 * ReactNode so any glyph (shapes, balls, labels, custom SVG) can be placed on
 * each pan without modifying this primitive.
 *
 * Design reference: BalanceScales25G1Illustration, ThreeScales24ECIllustration,
 * DogToys12ECIllustration, BallScales8ECIllustration — all share identical beam
 * geometry, pan geometry, and pivot style. This primitive extracts that shared
 * core verbatim.
 *
 * SSR-safe: pure SVG, no framer-motion, no hooks, no randomness, no Date.
 *
 * ── Props ──────────────────────────────────────────────────────────────────
 *
 * @prop left     ReactNode — content drawn centred above the left pan tray.
 *                Coordinate origin: the caller receives no explicit offset;
 *                the `<g>` is translated so (0, 0) maps to (leftPanX, trayTopY).
 *                Use relative coordinates within the group (e.g. circles at
 *                cy = -R sit on the tray surface).
 *
 * @prop right    ReactNode — same convention, translated to (rightPanX, trayTopY).
 *
 * @prop tilt     -1 | 0 | 1 (default 0)
 *                  1 = left pan lower (left side heavier)
 *                 -1 = right pan lower (right side heavier)
 *                  0 = level beam (balanced)
 *
 * @prop panW     number (default 90) — width of the pan tray in SVG units.
 *                Increase when pan content is wide (e.g. multiple large shapes).
 *
 * @prop scale    number (default 1) — uniform CSS scale applied to the outer
 *                <svg> via `transform`. Useful when embedding in a tight layout
 *                without changing the viewBox.
 *
 * ── Geometry (all in SVG units) ────────────────────────────────────────────
 *
 *  viewBox: 0 0 300 190
 *  Pivot centre: (150, 100)
 *  Beam half-length: 106  → left end at (44, ...), right end at (256, ...)
 *  Tilt delta Y: 28 units per side (beam end rises/falls 28 px when tilt ≠ 0)
 *  Pan drop: 14 units below beam end → tray top at beamEndY + 14
 *
 * ── Usage example ──────────────────────────────────────────────────────────
 *
 * ```tsx
 * // Single tilted scale: left pan (heavier) holds a 5 kg block; right holds 3 kg.
 * <BalanceScale
 *   tilt={1}
 *   left={<WeightBlock kg={5} />}
 *   right={<WeightBlock kg={3} />}
 * />
 *
 * // Balanced scale with custom SVG shapes:
 * <BalanceScale
 *   tilt={0}
 *   left={<circle cx={0} cy={-15} r={15} fill="green" />}
 *   right={<rect x={-12} y={-24} width={24} height={24} fill="gold" />}
 *   panW={70}
 * />
 * ```
 */

import React from 'react'

// ── Shared palette (matches all four reference illustrations) ─────────────
const INK = '#1F2937'
const BASE_FILL = '#5BC0EB'  // blue triangular pivot base
const BEAM_COLOR = '#9AA0A6' // grey beam
const PAN_COLOR = '#FFFFFF'  // pan tray fill

// ── Fixed geometry ─────────────────────────────────────────────────────────
const VIEW_W = 300
const VIEW_H = 190
const PIVOT_X = VIEW_W / 2   // 150
const PIVOT_Y = 100
const BEAM_HALF = 106         // beam end distance from pivot centre
const TILT_DY = 28            // beam end vertical displacement when tilt ≠ 0
const PAN_DROP = 14           // pan tray top sits this far below the beam end
const GROUND_Y = VIEW_H - 10  // pivot base bottom

// ── Props interface ────────────────────────────────────────────────────────

export interface BalanceScaleProps {
  /** Content drawn centred above the LEFT pan tray. Coordinate (0,0) = tray top-centre. */
  left: React.ReactNode
  /** Content drawn centred above the RIGHT pan tray. Coordinate (0,0) = tray top-centre. */
  right: React.ReactNode
  /**
   * Which pan is lower:
   *  1 = left pan lower (left side heavier)
   * -1 = right pan lower (right side heavier)
   *  0 = level / balanced (default)
   */
  tilt?: -1 | 0 | 1
  /** Pan tray width in SVG units. Default 90. Widen for large content. */
  panW?: number
  /** Uniform CSS scale factor applied to the outer <svg>. Default 1. */
  scale?: number
}

// ── Internal: single pan ───────────────────────────────────────────────────

interface PanProps {
  /** Beam-end position: where the hanger lines originate. */
  bx: number
  by: number
  /** Pan tray half-width. */
  hw: number
  children: React.ReactNode
}

function Pan({ bx, by, hw, children }: PanProps) {
  const trayTop = by + PAN_DROP
  return (
    <g>
      {/* V-hanger lines from beam end to tray rim */}
      <line x1={bx} y1={by} x2={bx - hw + 8} y2={trayTop} stroke={INK} strokeWidth={1.5} />
      <line x1={bx} y1={by} x2={bx + hw - 8} y2={trayTop} stroke={INK} strokeWidth={1.5} />

      {/* Pan contents — translated so caller origin (0,0) = tray top-centre.
          Children sit ABOVE the tray surface: use negative Y coords (e.g. cy=-R). */}
      <g transform={`translate(${bx},${trayTop})`}>
        {children}
      </g>

      {/* Shallow bowl: quadratic arc + ellipse rim drawn OVER the content base */}
      <path
        d={`M ${bx - hw} ${trayTop} Q ${bx} ${trayTop + 14} ${bx + hw} ${trayTop}`}
        fill="none"
        stroke={INK}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <ellipse cx={bx} cy={trayTop} rx={hw} ry={4.5} fill={PAN_COLOR} stroke={INK} strokeWidth={2.5} />
    </g>
  )
}

// ── Main export ────────────────────────────────────────────────────────────

/**
 * One balance scale. Drop-in SVG primitive for WMI / IKMC past-paper illustrations.
 *
 * When to use: any question that shows a single tilted or balanced beam scale
 * (weight comparisons, mystery-weight puzzles). Compose multiple `<BalanceScale>`
 * elements inside a shared `<svg>` for multi-scale figures — see the four
 * reference illustrations for the multi-cell layout pattern.
 */
export function BalanceScale({
  left,
  right,
  tilt = 0,
  panW = 90,
  scale = 1,
}: BalanceScaleProps) {
  const hw = panW / 2
  const leftX = PIVOT_X - BEAM_HALF
  const rightX = PIVOT_X + BEAM_HALF
  const leftY = PIVOT_Y + tilt * TILT_DY
  const rightY = PIVOT_Y - tilt * TILT_DY

  const svgStyle: React.CSSProperties =
    scale !== 1 ? { transform: `scale(${scale})`, transformOrigin: 'top left' } : {}

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto', ...svgStyle }}
      aria-hidden="true"
    >
      {/* Left pan */}
      <Pan bx={leftX} by={leftY} hw={hw}>
        {left}
      </Pan>

      {/* Right pan */}
      <Pan bx={rightX} by={rightY} hw={hw}>
        {right}
      </Pan>

      {/* Beam — drawn after pans so it overlaps hanger attachment points */}
      <line
        x1={leftX}
        y1={leftY}
        x2={rightX}
        y2={rightY}
        stroke={BEAM_COLOR}
        strokeWidth={8}
        strokeLinecap="round"
      />

      {/* Blue triangular pivot base */}
      <polygon
        points={`${PIVOT_X},${PIVOT_Y - 4} ${PIVOT_X - 32},${GROUND_Y} ${PIVOT_X + 32},${GROUND_Y}`}
        fill={BASE_FILL}
        stroke={INK}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* Pivot bolt */}
      <circle cx={PIVOT_X} cy={PIVOT_Y} r={6} fill={PAN_COLOR} stroke={INK} strokeWidth={2.5} />
    </svg>
  )
}

// ── WeightBlock helper ─────────────────────────────────────────────────────

export interface WeightBlockProps {
  /**
   * Numeric weight shown on the block label (e.g. 12 → "12 kg").
   * Use for fixed reference weights on a pan.
   */
  kg: number
}

/**
 * Rounded cast-iron weight block with a knob on top and "N kg" label.
 * Designed for use as `left` / `right` content inside `<BalanceScale>`.
 *
 * Coordinate origin matches BalanceScale's pan convention: (0, 0) is the
 * tray top-centre. The block bottom sits at y = 0 (on the tray surface).
 *
 * @example
 * <BalanceScale tilt={-1} left={<WeightBlock kg={5} />} right={<WeightBlock kg={12} />} />
 */
export function WeightBlock({ kg }: WeightBlockProps) {
  const bw = 46
  const bh = 50
  const knobW = 12
  const knobH = 10
  // block bottom at y=0; top at y=-bh; knob top at y=-(bh+knobH)
  return (
    <g>
      {/* knob */}
      <rect
        x={-knobW / 2}
        y={-(bh + knobH)}
        width={knobW}
        height={knobH + 4}
        rx={3}
        fill={INK}
      />
      {/* body */}
      <rect
        x={-bw / 2}
        y={-bh}
        width={bw}
        height={bh}
        rx={6}
        fill={INK}
      />
      {/* number */}
      <text
        x={0}
        y={-bh / 2 - 6}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={15}
        fontWeight={900}
        fill="#FFFFFF"
      >
        {kg}
      </text>
      {/* "kg" unit */}
      <text
        x={0}
        y={-bh / 2 + 11}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={700}
        fill="#FFFFFF"
      >
        kg
      </text>
    </g>
  )
}
