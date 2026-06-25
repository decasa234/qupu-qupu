// SEAMO-22-A-Q15 — "There are 5 steps to a flight of stairs. Chatdanai can take
// 1 or 2 steps up at a time. How many ways are there for him to do so?"
// Answer: B (8)
//
// STATIC PROBLEM FIGURE — a 5-step staircase ascending from bottom-left to
// top-right, matching the source OCR figure (2022.imgs/012.jpg). No step
// numbers on the risers (the source figure shows only the stair outline).
//
// Adapted from Staircase1PEIllustration (same step-tread/riser geometry and
// colour palette; no animal figures required for this question).
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── layout constants (re-exported so the explainer can share the same grid) ──

/** Number of stair steps. */
export const STEP_COUNT = 5

/** Width of each step tread (horizontal surface) in px. */
export const TREAD_W = 48

/** Height of each step riser (vertical face) in px. */
export const RISER_H = 32

/** Padding around the staircase. */
export const PAD = { left: 24, right: 24, top: 24, bottom: 24 }

/** Total SVG width. */
export const SVG_W = PAD.left + STEP_COUNT * TREAD_W + PAD.right

/** Total SVG height. */
export const SVG_H = PAD.top + STEP_COUNT * RISER_H + PAD.bottom

/** Baseline y (bottom of the staircase). */
export const BASELINE_Y = PAD.top + STEP_COUNT * RISER_H

/** Returns the top-left corner (x, y) of step N's tread (1-indexed).
 *  Step 1 is at the bottom-left; step 5 is at the top-right.
 */
export function stepTread(n: number): { x: number; y: number } {
  return {
    x: PAD.left + (n - 1) * TREAD_W,
    y: PAD.top + (STEP_COUNT - n) * RISER_H,
  }
}

/** Colour tokens. */
export const COLOR = {
  STEP_FILL:   '#F3EFE7',   // warm cream for step faces
  STEP_STROKE: '#8B7355',   // warm brown outline
  TREAD_FILL:  '#EDE8DC',   // slightly darker tread top
  HIGHLIGHT:   '#DBEEFF',   // highlight fill
  HIGHLIGHT_STROKE: '#2C7BE5',
  INK:         '#2E3A30',
} as const

// ── StaircaseGrid primitive (re-exported for the explainer) ──────────────────

export interface StaircaseGridProps {
  /** Steps to highlight (1-indexed). */
  highlightSteps?: Set<number>
  highlightColor?: string
}

/**
 * StaircaseGrid5 — the 5-step staircase as an SVG group.
 * Renders tread + riser rectangles without step number labels
 * (matching the source figure).
 */
export function StaircaseGrid5({ highlightSteps, highlightColor = COLOR.HIGHLIGHT_STROKE }: StaircaseGridProps) {
  return (
    <g>
      {Array.from({ length: STEP_COUNT }, (_, i) => {
        const n = i + 1
        const { x, y } = stepTread(n)
        const riserTop  = y + RISER_H
        const riserBot  = BASELINE_Y
        const isHl      = highlightSteps?.has(n) ?? false
        const tFill     = isHl ? COLOR.HIGHLIGHT : COLOR.TREAD_FILL
        const fill      = isHl ? COLOR.HIGHLIGHT : COLOR.STEP_FILL
        const stroke    = isHl ? highlightColor : COLOR.STEP_STROKE
        const sw        = isHl ? 2.5 : 1.5

        return (
          <g key={n}>
            {/* Tread top */}
            <rect x={x} y={y} width={TREAD_W} height={RISER_H}
              fill={tFill} stroke={stroke} strokeWidth={sw} />
            {/* Riser face */}
            <rect x={x} y={riserTop} width={TREAD_W} height={riserBot - riserTop}
              fill={fill} stroke={stroke} strokeWidth={sw} />
          </g>
        )
      })}
    </g>
  )
}

// ── Step-number label overlay (used by the explainer only) ───────────────────

export function StepLabel({ step, color = COLOR.HIGHLIGHT_STROKE }: { step: number; color?: string }) {
  const { x, y } = stepTread(step)
  const riserTop = y + RISER_H
  const riserBot = BASELINE_Y
  const midY     = riserTop + (riserBot - riserTop) / 2

  return (
    <text
      x={x + TREAD_W / 2}
      y={midY}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={700}
      fill={color}
      fontFamily="ui-sans-serif, system-ui, sans-serif"
    >
      {step}
    </text>
  )
}

// ── Default export ─────────────────────────────────────────────────────────────

/**
 * ClimbStairs22A15Illustration
 *
 * Static problem figure for SEAMO-22-A-Q15.
 * A 5-step staircase ascending from left to right. No answer revealed.
 */
export default function ClimbStairs22A15Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Tangga 5 anak tangga — ada berapa cara Chatdanai menaikinya dengan langkah 1 atau 2?"
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ maxWidth: SVG_W + 48, display: 'block' }}
        aria-hidden="true"
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />
        <StaircaseGrid5 />
      </svg>
    </div>
  )
}
