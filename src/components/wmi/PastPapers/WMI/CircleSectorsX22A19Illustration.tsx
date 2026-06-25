/**
 * SEAMOX-22-A-Q19 — "Find the missing number."
 *
 * Three circles each divided into three 120° sectors by a Y-shaped divider:
 *   Circle 1: left=3,  right=1, bottom=8
 *   Circle 2: left=5,  right=4, bottom=9
 *   Circle 3: left=13, right=6, bottom=?  (answer: 133)
 *
 * Pattern: bottom = left² − right²  (difference of squares)
 *
 * Classification: STEM illustration — fill-in answer, no picture options.
 * Pure SVG/React, SSR-safe — no hooks, no framer-motion, no window/document.
 *
 * Named export `CirclePanel` is shared with the explainer.
 */

import React from 'react'

// Precompute √3 once — used for 60° arm geometry
const SQ3_OVER_2 = Math.sqrt(3) / 2   // ≈ 0.866

// ── CirclePanel ───────────────────────────────────────────────────────────────

export interface CirclePanelProps {
  cx: number
  cy: number
  r: number
  left: string | number
  right: string | number
  bottom: string | number
  /** Render the bottom label in question-mark blue. */
  bottomIsQuestion?: boolean
  /** Fill the bottom 120° sector with a pale highlight. */
  highlightBottom?: boolean
  /** Label font size. Defaults to round(r × 0.27). */
  fontSize?: number
}

/**
 * One circle divided into three equal sectors by a Y-shaped divider.
 *
 * Arm geometry (from centre, unit-circle angles measured from east CCW):
 *   • Top arm:          90°  → (cx,        cy − r)
 *   • Bottom-left arm: 210°  → (cx − r·√3/2, cy + r/2)
 *   • Bottom-right arm:330°  → (cx + r·√3/2, cy + r/2)
 *
 * Emits a `<g>` — wrap in an `<svg>` with an appropriate `viewBox`.
 */
export function CirclePanel({
  cx, cy, r,
  left, right, bottom,
  bottomIsQuestion = false,
  highlightBottom = false,
  fontSize,
}: CirclePanelProps) {
  const fs = fontSize ?? Math.round(r * 0.27)

  // Y-divider arm endpoints
  const topX  = cx,                topY  = cy - r
  const blX   = cx - SQ3_OVER_2 * r, blY = cy + r * 0.5
  const brX   = cx + SQ3_OVER_2 * r, brY = cy + r * 0.5

  // Sector label positions — visual centroid of each 120° wedge
  //   Left  sector midpoint: 150° → (cx − r·0.38, cy − r·0.15)
  //   Right sector midpoint:  30° → (cx + r·0.38, cy − r·0.15)
  //   Bottom sector midpoint:270° → (cx,           cy + r·0.55)
  const lx = cx - r * 0.38,  ly = cy - r * 0.15
  const rx = cx + r * 0.38,  ry = cy - r * 0.15
  const bx = cx,              by = cy + r * 0.55

  // Bottom sector highlight path:
  //   M centre → BL → arc (CW, small, through bottom) → BR → Z
  const blXf = blX.toFixed(2)
  const brXf = brX.toFixed(2)
  const highlightPath = `M ${cx} ${cy} L ${blXf} ${blY} A ${r} ${r} 0 0 1 ${brXf} ${brY} Z`

  const INK       = '#1F2937'
  const BLUE      = '#1E40AF'
  const GREEN_INK = '#065F46'

  const bottomFill = bottomIsQuestion
    ? BLUE
    : highlightBottom
      ? GREEN_INK
      : INK

  return (
    <g>
      {/* Bottom sector highlight (drawn before the circle so it clips naturally) */}
      {highlightBottom && (
        <path d={highlightPath} fill="#FEF9C3" />
      )}

      {/* Outer circle */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#374151" strokeWidth={1.8} />

      {/* Y-divider: three arms from centre */}
      <line x1={cx} y1={cy} x2={topX} y2={topY} stroke="#374151" strokeWidth={1.6} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={blX}  y2={blY}  stroke="#374151" strokeWidth={1.6} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={brX}  y2={brY}  stroke="#374151" strokeWidth={1.6} strokeLinecap="round" />

      {/* Sector labels */}
      <text
        x={lx} y={ly}
        textAnchor="middle" dominantBaseline="central"
        fontSize={fs} fontWeight={700} fill={INK}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {String(left)}
      </text>
      <text
        x={rx} y={ry}
        textAnchor="middle" dominantBaseline="central"
        fontSize={fs} fontWeight={700} fill={INK}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {String(right)}
      </text>
      <text
        x={bx} y={by}
        textAnchor="middle" dominantBaseline="central"
        fontSize={bottomIsQuestion ? fs + 2 : fs}
        fontWeight={bottomIsQuestion ? 900 : 700}
        fill={bottomFill}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {String(bottom)}
      </text>
    </g>
  )
}

// ── Default export: three-circle problem layout ───────────────────────────────

/**
 * SEAMO X 2022 Paper A Q19 stem figure.
 *
 * Renders three Y-sector circles side-by-side.
 * The third circle shows "?" in the bottom sector — the question mark
 * that the student must fill in (answer: 133).
 */
export default function CircleSectorsX22A19Illustration() {
  // Layout: cx = 50, 150, 250 | cy = 60 | r = 42 | viewBox 300 × 120
  return (
    <div
      className="my-4 rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Three circles each split into three sectors. ' +
        'Circle 1: left 3, right 1, bottom 8. ' +
        'Circle 2: left 5, right 4, bottom 9. ' +
        'Circle 3: left 13, right 6, bottom question mark.'
      }
    >
      <svg
        viewBox="0 0 300 120"
        width="100%"
        style={{ maxWidth: 360 }}
        aria-hidden="true"
      >
        <CirclePanel cx={50}  cy={60} r={42} left={3}  right={1} bottom={8} />
        <CirclePanel cx={150} cy={60} r={42} left={5}  right={4} bottom={9} />
        <CirclePanel cx={250} cy={60} r={42} left={13} right={6} bottom="?" bottomIsQuestion />
      </svg>
    </div>
  )
}
