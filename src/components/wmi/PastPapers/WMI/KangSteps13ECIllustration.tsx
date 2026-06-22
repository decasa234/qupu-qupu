// IKMC-20-EC-Q13 — "Every time the kangaroo goes up 7 steps, the rabbit goes down 3 steps.
// The kangaroo starts at step 1 going up and the rabbit starts at step 100 going down.
// On which step do they meet?"
//
// STATIC PROBLEM FIGURE — a staircase showing the bottom 3 steps (1–3) and the top 3
// steps (98–100), with a dashed gap in the middle indicating the 100-step staircase.
// Kangaroo at step 1 (bottom-left), rabbit at step 100 (top-right).
// Does NOT reveal the meeting step (step 70 = answer D).
//
// Adapted from Staircase1PEIllustration (same staircase primitives, animal figures, and
// badge labels). The layout uses a split-staircase approach: visible steps at each end
// with an ellipsis gap, faithfully matching the source OCR figure (2020.imgs/041.jpg +
// 042.jpg).
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── layout constants (re-exported so the explainer can share the same grid) ──

/** Number of visible steps at the kangaroo end (bottom). */
export const BOTTOM_VISIBLE = 3

/** Number of visible steps at the rabbit end (top). */
export const TOP_VISIBLE = 3

/** Width of each step tread (horizontal surface) in px. */
export const TREAD_W = 44

/** Height of each step riser (vertical face) in px. */
export const RISER_H = 30

/** Gap in px between the two visible step clusters (the dashed-ellipsis zone). */
export const GAP_W = 80

/** Padding around the staircase. */
export const PAD = { left: 60, right: 52, top: 64, bottom: 32 }

// Height = tallest visible column (top cluster, 3 risers from baseline)
const VISIBLE_H = (BOTTOM_VISIBLE + TOP_VISIBLE) * RISER_H

/** Total SVG width. */
export const SVG_W =
  PAD.left +
  BOTTOM_VISIBLE * TREAD_W +
  GAP_W +
  TOP_VISIBLE * TREAD_W +
  PAD.right

/** Total SVG height. */
export const SVG_H = PAD.top + VISIBLE_H + PAD.bottom

/** Baseline y (bottom of the staircase). */
const BASELINE_Y = PAD.top + VISIBLE_H

/**
 * Returns the top-left corner (x, y) of a step tread for the BOTTOM cluster.
 * Bottom cluster: steps 1–3 going up from left.
 * n is 1-indexed within this cluster (n=1 is the lowest visible step).
 */
export function bottomStepTread(n: number): { x: number; y: number } {
  return {
    x: PAD.left + (n - 1) * TREAD_W,
    y: BASELINE_Y - n * RISER_H,
  }
}

/**
 * Returns the top-left corner (x, y) of a step tread for the TOP cluster.
 * Top cluster: the highest visible steps.
 * offset 0 = the topmost step (step 100), offset 1 = step 99, etc.
 */
export function topStepTread(offset: number): { x: number; y: number } {
  // The top cluster occupies the right portion.
  // offset=0 is the highest step, rising from the right of the gap.
  const clusterLeft = PAD.left + BOTTOM_VISIBLE * TREAD_W + GAP_W
  // offset 0 is at the top, so visually it's the topmost tread
  // The top cluster has TOP_VISIBLE steps total.
  // index within cluster (0 = bottom of cluster, TOP_VISIBLE-1 = top of cluster)
  const clusterIndex = TOP_VISIBLE - 1 - offset  // offset 0 → highest → last column
  return {
    x: clusterLeft + clusterIndex * TREAD_W,
    y: BASELINE_Y - (clusterIndex + BOTTOM_VISIBLE + 1) * RISER_H,
  }
}

/** Colour tokens (same palette as Staircase1PEIllustration). */
export const COLOR = {
  STEP_FILL: '#F3EFE7',
  STEP_STROKE: '#8B7355',
  TREAD_FILL: '#EDE8DC',
  GROUND_FILL: '#DDD3C0',
  RISER_NUMBER: '#5B4636',
  KANGAROO: '#C17B3A',
  RABBIT: '#9E92B5',
  LABEL_BG: '#30598A',
  LABEL_INK: '#FFFFFF',
  INK: '#2E3A30',
  GAP_DASH: '#A09080',
} as const

// ── Step block (tread + riser + label) ──────────────────────────────────────

interface StepBlockProps {
  x: number
  y: number
  label: string | number
  highlight?: boolean
  highlightColor?: string
}

function StepBlock({ x, y, label, highlight = false, highlightColor = '#2C7BE5' }: StepBlockProps) {
  const fill = highlight ? '#DBEEFF' : COLOR.STEP_FILL
  const treadFill = highlight ? '#DBEEFF' : COLOR.TREAD_FILL
  const stroke = highlight ? highlightColor : COLOR.STEP_STROKE
  const strokeWidth = highlight ? 2.5 : 1.5

  const riserTop = y + RISER_H
  const riserBot = BASELINE_Y

  return (
    <g>
      {/* Tread */}
      <rect x={x} y={y} width={TREAD_W} height={RISER_H} fill={treadFill} stroke={stroke} strokeWidth={strokeWidth} />
      {/* Riser */}
      <rect x={x} y={riserTop} width={TREAD_W} height={riserBot - riserTop} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      {/* Label */}
      <text
        x={x + TREAD_W / 2}
        y={riserTop + Math.min(14, (riserBot - riserTop) / 2)}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontWeight={700}
        fill={highlight ? highlightColor : COLOR.RISER_NUMBER}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Bottom cluster (steps 1–3) ───────────────────────────────────────────────

export interface StaircaseBottomProps {
  highlightSteps?: Set<number>
  highlightColor?: string
}

export function StaircaseBottom({ highlightSteps, highlightColor = '#2C7BE5' }: StaircaseBottomProps) {
  const steps = [1, 2, 3]
  return (
    <g>
      {steps.map((stepNum, i) => {
        const { x, y } = bottomStepTread(i + 1)
        return (
          <StepBlock
            key={stepNum}
            x={x}
            y={y}
            label={stepNum}
            highlight={highlightSteps?.has(stepNum) ?? false}
            highlightColor={highlightColor}
          />
        )
      })}
    </g>
  )
}

// ── Top cluster (steps 98–100) ───────────────────────────────────────────────

export interface StaircaseTopProps {
  highlightSteps?: Set<number>
  highlightColor?: string
}

export function StaircaseTop({ highlightSteps, highlightColor = '#2C7BE5' }: StaircaseTopProps) {
  // offset 0 = step 100 (topmost), offset 1 = 99, offset 2 = 98
  const topStepNumbers = [100, 99, 98]
  return (
    <g>
      {topStepNumbers.map((stepNum, offset) => {
        const { x, y } = topStepTread(offset)
        return (
          <StepBlock
            key={stepNum}
            x={x}
            y={y}
            label={stepNum}
            highlight={highlightSteps?.has(stepNum) ?? false}
            highlightColor={highlightColor}
          />
        )
      })}
    </g>
  )
}

// ── Dashed gap ellipsis ──────────────────────────────────────────────────────

/**
 * DashedGap — dashed staircase silhouette in the middle to indicate the hidden
 * steps 4–97. Mirrors the source figure's dashed continuation lines.
 */
export function DashedGap() {
  // The gap spans from the right edge of the bottom cluster to the left edge of
  // the top cluster.
  const gapLeft = PAD.left + BOTTOM_VISIBLE * TREAD_W
  const gapRight = PAD.left + BOTTOM_VISIBLE * TREAD_W + GAP_W

  // Draw a dashed diagonal continuation indicating the stair ascent.
  // We draw two dashed lines: one for the top of the ascending tread edges,
  // and one for the bottom of the riser section (baseline).
  const topY = BASELINE_Y - BOTTOM_VISIBLE * RISER_H   // top of bottom cluster's last step
  const midTopY = BASELINE_Y - (BOTTOM_VISIBLE + 1) * RISER_H  // where top cluster begins

  const dashProps = {
    stroke: COLOR.GAP_DASH,
    strokeWidth: 1.5,
    strokeDasharray: '5 4',
    fill: 'none',
  }

  // Upper dashed line (stair top continuation)
  const upperLeft = { x: gapLeft, y: topY }
  const upperRight = { x: gapRight, y: midTopY }

  // Lower dashed line (riser baseline continuation)
  const lowerLeft = { x: gapLeft, y: BASELINE_Y }
  const lowerRight = { x: gapRight, y: BASELINE_Y }

  // Three dots in middle of gap as ellipsis
  const dotCx = (gapLeft + gapRight) / 2
  const dotY = BASELINE_Y - (BOTTOM_VISIBLE + 1.5) * RISER_H

  return (
    <g>
      {/* upper stair edge continuation */}
      <line
        x1={upperLeft.x}
        y1={upperLeft.y}
        x2={upperRight.x}
        y2={upperRight.y}
        {...dashProps}
      />
      {/* lower baseline continuation */}
      <line
        x1={lowerLeft.x}
        y1={lowerLeft.y}
        x2={lowerRight.x}
        y2={lowerRight.y}
        {...dashProps}
      />
      {/* ellipsis dots */}
      {[-12, 0, 12].map((dx, i) => (
        <circle key={i} cx={dotCx + dx} cy={dotY} r={2.5} fill={COLOR.GAP_DASH} />
      ))}
    </g>
  )
}

// ── Animal silhouettes (adapted from Staircase1PEIllustration) ────────────────

/** Kangaroo silhouette placed relative to a tread (x, y = tread top-left). */
export function KangFigure({ x, y }: { x: number; y: number }) {
  const cx = x + TREAD_W / 2
  const baseY = y

  const bodyW = 16
  const bodyH = 24
  const headR = 9

  const bodyLeft = cx - bodyW / 2
  const bodyTop = baseY - bodyH
  const headCy = bodyTop - headR

  return (
    <g>
      {/* body */}
      <rect x={bodyLeft} y={bodyTop} width={bodyW} height={bodyH} rx={5} fill={COLOR.KANGAROO} stroke={COLOR.INK} strokeWidth={1.5} />
      {/* head */}
      <ellipse cx={cx + 3} cy={headCy} rx={headR} ry={headR - 2} fill={COLOR.KANGAROO} stroke={COLOR.INK} strokeWidth={1.5} />
      {/* ear */}
      <path d={`M ${cx + 5} ${headCy - 7} L ${cx + 12} ${headCy - 14} L ${cx + 15} ${headCy - 6} Z`} fill={COLOR.KANGAROO} stroke={COLOR.INK} strokeWidth={1} />
      {/* tail */}
      <path d={`M ${bodyLeft + 2} ${baseY - 4} Q ${bodyLeft - 8} ${baseY + 8} ${bodyLeft - 2} ${baseY + 6}`} fill="none" stroke={COLOR.KANGAROO} strokeWidth={3} strokeLinecap="round" />
    </g>
  )
}

/** Rabbit silhouette placed relative to a tread (x, y = tread top-left). */
export function RabbitFig({ x, y }: { x: number; y: number }) {
  const cx = x + TREAD_W / 2
  const baseY = y

  const bodyW = 14
  const bodyH = 20
  const headR = 8

  const bodyLeft = cx - bodyW / 2
  const bodyTop = baseY - bodyH
  const headCy = bodyTop - headR

  return (
    <g>
      {/* body */}
      <rect x={bodyLeft} y={bodyTop} width={bodyW} height={bodyH} rx={5} fill={COLOR.RABBIT} stroke={COLOR.INK} strokeWidth={1.5} />
      {/* head */}
      <circle cx={cx - 2} cy={headCy} r={headR} fill={COLOR.RABBIT} stroke={COLOR.INK} strokeWidth={1.5} />
      {/* ear left */}
      <ellipse cx={cx - 6} cy={headCy - 12} rx={4} ry={10} fill={COLOR.RABBIT} stroke={COLOR.INK} strokeWidth={1} />
      {/* ear right */}
      <ellipse cx={cx - 1} cy={headCy - 13} rx={4} ry={10} fill={COLOR.RABBIT} stroke={COLOR.INK} strokeWidth={1} />
    </g>
  )
}

// ── Badge labels ─────────────────────────────────────────────────────────────

function AnimalBadge({ x, y, label, color }: { x: number; y: number; label: string; color: string }) {
  const cx = x + TREAD_W / 2
  const badgeW = 44
  const badgeH = 16
  const badgeY = y - 56

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
 * KangSteps13ECIllustration
 *
 * Static problem figure for IKMC-20-EC-Q13.
 * A 100-step staircase (bottom steps 1–3 visible, top steps 98–100 visible, dashed
 * gap in the middle). Kangaroo at step 1 (bottom-left), rabbit at step 100 (top-right).
 * Does NOT reveal the meeting step (step 70 = answer D).
 */
export default function KangSteps13ECIllustration() {
  const kangTread = bottomStepTread(1)
  const rabbitTread = topStepTread(0)

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Tangga 100 anak tangga; kanguru berdiri di anak tangga 1 (bawah), ' +
        'kelinci berdiri di anak tangga 100 (atas). ' +
        'Di anak tangga berapa mereka bertemu?'
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

        {/* bottom cluster: steps 1-3 */}
        <StaircaseBottom />

        {/* dashed gap */}
        <DashedGap />

        {/* top cluster: steps 98-100 */}
        <StaircaseTop />

        {/* kangaroo at step 1 */}
        <KangFigure x={kangTread.x} y={kangTread.y} />
        <AnimalBadge x={kangTread.x} y={kangTread.y} label="Kanguru" color={COLOR.KANGAROO} />

        {/* rabbit at step 100 */}
        <RabbitFig x={rabbitTread.x} y={rabbitTread.y} />
        <AnimalBadge x={rabbitTread.x} y={rabbitTread.y} label="Kelinci" color={COLOR.RABBIT} />
      </svg>
    </div>
  )
}
