// IKMC-20-PE-Q1 — "The kangaroo goes up 3 steps each time the rabbit goes down 2 steps.
// On which step do they meet?"
//
// STATIC PROBLEM FIGURE — a 10-step staircase ascending from bottom-left to top-right.
// The kangaroo stands at step 1 (bottom), the rabbit stands at step 9 (top).
// Step numbers 1–10 are labelled on the riser faces, matching the source figure.
// Does NOT reveal the meeting step (step 6 = answer D).
//
// Reuses the staircase geometry from P25G3Q14Illustration (stepped-squares pattern)
// and the animal glyph technique from Podium1ECIllustration (stick-figure bodies).
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── layout constants (re-exported so the explainer can share the same grid) ──

/** Number of stair steps shown in the figure. */
export const STEP_COUNT = 10

/** Width of each step tread (horizontal surface) in px. */
export const TREAD_W = 36

/** Height of each step riser (vertical face) in px. */
export const RISER_H = 24

/** Padding around the staircase. */
export const PAD = { left: 56, right: 48, top: 56, bottom: 32 }

/** Total SVG width. */
export const SVG_W = PAD.left + STEP_COUNT * TREAD_W + PAD.right

/** Total SVG height. */
export const SVG_H = PAD.top + STEP_COUNT * RISER_H + PAD.bottom

/** Returns the top-left corner (x, y) of step N's tread (1-indexed). */
export function stepTread(n: number): { x: number; y: number } {
  // Step 1 is at the bottom-left; step 10 is at the top-right.
  // x grows as n increases; y decreases as n increases.
  return {
    x: PAD.left + (n - 1) * TREAD_W,
    y: PAD.top + (STEP_COUNT - n) * RISER_H,
  }
}

/** Colour tokens. */
export const COLOR = {
  STEP_FILL: '#F3EFE7',       // warm cream for step faces
  STEP_STROKE: '#8B7355',     // warm brown outline
  TREAD_FILL: '#EDE8DC',      // slightly darker for tread tops
  GROUND_FILL: '#DDD3C0',
  RISER_NUMBER: '#5B4636',    // step number text
  KANGAROO: '#C17B3A',        // warm orange-brown
  RABBIT: '#9E92B5',          // soft lavender-grey
  LABEL_BG: '#30598A',
  LABEL_INK: '#FFFFFF',
  INK: '#2E3A30',
} as const

// ── Staircase primitive (re-exported for explainer overlays) ──────────────────

/** Props for the StaircaseGrid primitive. */
export interface StaircaseGridProps {
  /** Optional set of step numbers to highlight (1-indexed). */
  highlightSteps?: Set<number>
  /** Optional stroke colour for highlighted steps. */
  highlightColor?: string
}

/**
 * StaircaseGrid — the 10-step staircase as an SVG group.
 * Renders all riser rectangles + tread lines, plus step number labels on the risers.
 * Exported so the explainer can import it without reimplementing the geometry.
 */
export function StaircaseGrid({ highlightSteps, highlightColor = '#2C7BE5' }: StaircaseGridProps) {
  return (
    <g>
      {Array.from({ length: STEP_COUNT }, (_, i) => {
        const n = i + 1  // 1-indexed step number
        const { x, y } = stepTread(n)

        // Each step is drawn as a filled rect spanning the TREAD + a riser
        // below it. Step 1's riser descends to the bottom baseline.
        const riserTop = y + RISER_H  // top of the riser face = bottom of this tread
        const riserBot = PAD.top + STEP_COUNT * RISER_H  // common baseline

        const isHighlighted = highlightSteps?.has(n) ?? false
        const fill = isHighlighted ? '#DBEEFF' : COLOR.STEP_FILL

        return (
          <g key={n}>
            {/* Tread top horizontal surface */}
            <rect
              x={x}
              y={y}
              width={TREAD_W}
              height={RISER_H}
              fill={isHighlighted ? '#DBEEFF' : COLOR.TREAD_FILL}
              stroke={isHighlighted ? highlightColor : COLOR.STEP_STROKE}
              strokeWidth={isHighlighted ? 2.5 : 1.5}
            />
            {/* Riser face (vertical rectangle below the tread) */}
            <rect
              x={x}
              y={riserTop}
              width={TREAD_W}
              height={riserBot - riserTop}
              fill={fill}
              stroke={isHighlighted ? highlightColor : COLOR.STEP_STROKE}
              strokeWidth={isHighlighted ? 2.5 : 1.5}
            />
            {/* Step number label on the riser face */}
            <text
              x={x + TREAD_W / 2}
              y={riserTop + Math.min(16, (riserBot - riserTop) / 2)}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={10}
              fontWeight={700}
              fill={isHighlighted ? highlightColor : COLOR.RISER_NUMBER}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {n}
            </text>
          </g>
        )
      })}
    </g>
  )
}

// ── Animal silhouettes ────────────────────────────────────────────────────────

/** Simple kangaroo silhouette at a given step position.
 *  Faces right (toward the staircase). */
export function KangarooFigure({ step }: { step: number }) {
  const { x, y } = stepTread(step)
  const cx = x + TREAD_W / 2
  const baseY = y  // feet on top of the step tread

  // Body: upright rounded rectangle slightly offset to face right
  const bodyW = 16
  const bodyH = 24
  const headR = 9

  const bodyLeft = cx - bodyW / 2
  const bodyTop = baseY - bodyH
  const headCy = bodyTop - headR

  return (
    <g>
      {/* body */}
      <rect
        x={bodyLeft}
        y={bodyTop}
        width={bodyW}
        height={bodyH}
        rx={5}
        fill={COLOR.KANGAROO}
        stroke={COLOR.INK}
        strokeWidth={1.5}
      />
      {/* head */}
      <ellipse
        cx={cx + 3}
        cy={headCy}
        rx={headR}
        ry={headR - 2}
        fill={COLOR.KANGAROO}
        stroke={COLOR.INK}
        strokeWidth={1.5}
      />
      {/* ear (single triangular notch) */}
      <path
        d={`M ${cx + 5} ${headCy - 7} L ${cx + 12} ${headCy - 14} L ${cx + 15} ${headCy - 6} Z`}
        fill={COLOR.KANGAROO}
        stroke={COLOR.INK}
        strokeWidth={1}
      />
      {/* tail arc */}
      <path
        d={`M ${bodyLeft + 2} ${baseY - 4} Q ${bodyLeft - 8} ${baseY + 8} ${bodyLeft - 2} ${baseY + 6}`}
        fill="none"
        stroke={COLOR.KANGAROO}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </g>
  )
}

/** Simple rabbit silhouette at a given step position.
 *  Faces left (toward the descending direction). */
export function RabbitFigure({ step }: { step: number }) {
  const { x, y } = stepTread(step)
  const cx = x + TREAD_W / 2
  const baseY = y  // feet on the tread

  const bodyW = 14
  const bodyH = 20
  const headR = 8

  const bodyLeft = cx - bodyW / 2
  const bodyTop = baseY - bodyH
  const headCy = bodyTop - headR

  return (
    <g>
      {/* body */}
      <rect
        x={bodyLeft}
        y={bodyTop}
        width={bodyW}
        height={bodyH}
        rx={5}
        fill={COLOR.RABBIT}
        stroke={COLOR.INK}
        strokeWidth={1.5}
      />
      {/* head */}
      <circle
        cx={cx - 2}
        cy={headCy}
        r={headR}
        fill={COLOR.RABBIT}
        stroke={COLOR.INK}
        strokeWidth={1.5}
      />
      {/* long ear left */}
      <ellipse
        cx={cx - 6}
        cy={headCy - 12}
        rx={4}
        ry={10}
        fill={COLOR.RABBIT}
        stroke={COLOR.INK}
        strokeWidth={1}
      />
      {/* long ear right */}
      <ellipse
        cx={cx - 1}
        cy={headCy - 13}
        rx={4}
        ry={10}
        fill={COLOR.RABBIT}
        stroke={COLOR.INK}
        strokeWidth={1}
      />
    </g>
  )
}

// ── Animal label badges ───────────────────────────────────────────────────────

function AnimalBadge({ step, label, color }: { step: number; label: string; color: string }) {
  const { x, y } = stepTread(step)
  const cx = x + TREAD_W / 2
  const badgeW = 38
  const badgeH = 16
  const badgeY = y - 54  // above the animal figure

  return (
    <g>
      <rect x={cx - badgeW / 2} y={badgeY} width={badgeW} height={badgeH} rx={8} fill={color} />
      <text
        x={cx}
        y={badgeY + badgeH / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={9}
        fontWeight={800}
        fill="#FFFFFF"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Default export ────────────────────────────────────────────────────────────

/**
 * Staircase1PEIllustration
 *
 * Static problem figure for IKMC-20-PE-Q1.
 * A 10-step staircase with the kangaroo at step 1 (bottom) and the rabbit at
 * step 9 (top). Step numbers 1–10 are labelled on the riser faces.
 * Does NOT reveal the meeting step (step 6 = answer D).
 */
export default function Staircase1PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Tangga 10 anak tangga; kanguru berdiri di anak tangga 1 (bawah), ' +
        'kelinci berdiri di anak tangga 9 (atas). ' +
        'Di anak tangga keberapa mereka bertemu?'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ maxWidth: SVG_W, display: 'block' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* staircase grid */}
        <StaircaseGrid />

        {/* kangaroo at step 1 (bottom-left) */}
        <KangarooFigure step={1} />
        <AnimalBadge step={1} label="Kanguru" color={COLOR.KANGAROO} />

        {/* rabbit at step 9 (top area) */}
        <RabbitFigure step={9} />
        <AnimalBadge step={9} label="Kelinci" color={COLOR.RABBIT} />
      </svg>
    </div>
  )
}
