// IKMC-19-EC-Q1 — "The higher the step on the podium, the higher the rank.
// Who finished third?"
//
// STATIC PROBLEM FIGURE — shows five runners (A–E) standing on a stepped
// podium at their respective heights. The answer (which runner is on the
// 3rd-tallest step) must NOT be labelled here; the student reads it off
// the figure themselves.
//
// Step heights (tallest → shortest):  C > D > E > B > A
// ↑ This is the faithful reconstruction from 2019.imgs/001.jpg.
// Answer: E is on the 3rd-tallest step → E finishes 3rd.
//
// Reuses the HeightBars primitive from HeightOrder22G1Illustration, adapted
// to 5 runners on a staircase podium instead of free-standing height bars.
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── shared layout constants (re-exported for the explainer) ──────────────

export const SVG_W = 340
export const SVG_H = 220

/** Y coordinate of the ground/base line. */
export const GROUND_Y = 200

/** Podium step configuration: left-to-right runner order A B C D E.
 *  height: height of the step in px (taller = higher rank).
 *  x: horizontal centre of the step.
 */
export const RUNNERS = [
  { label: 'A', stepH: 20,  cx: 44  },  // 5th / lowest
  { label: 'B', stepH: 60,  cx: 106 },  // 4th
  { label: 'C', stepH: 160, cx: 176 },  // 1st / tallest
  { label: 'D', stepH: 120, cx: 246 },  // 2nd
  { label: 'E', stepH: 80,  cx: 308 },  // 3rd ← ANSWER
] as const

export type RunnerLabel = 'A' | 'B' | 'C' | 'D' | 'E'

/** Width of each podium block. */
export const BLOCK_W = 52

/** Colour tokens echoing qupu palette. */
export const COLOR = {
  STEP_FILL: '#F3EFE7',       // cream / warm white
  STEP_STROKE: '#B5A58A',     // warm tan border
  GROUND_FILL: '#E8DDD0',     // ground strip
  GROUND_LINE: '#9A8870',
  BODY_FILL: '#E5E7EB',       // runner silhouette fill (neutral — problem fig)
  BODY_STROKE: '#374151',     // runner outline
  HEAD_FILL: '#FDE8C8',       // skin tone
  LABEL_INK: '#1F2937',       // letter on runner
  RUNNER_BG: '#30598A',       // label badge bg (blue)
  RUNNER_INK: '#FFFFFF',      // label letter on badge
} as const

// ── Podium step primitive ─────────────────────────────────────────────────

/** One podium step block (a vertical rectangle).
 *  Positioned so its bottom edge sits on GROUND_Y. */
function PodiumStep({ cx, stepH }: { cx: number; stepH: number }) {
  const x = cx - BLOCK_W / 2
  const y = GROUND_Y - stepH
  return (
    <rect
      x={x}
      y={y}
      width={BLOCK_W}
      height={stepH}
      fill={COLOR.STEP_FILL}
      stroke={COLOR.STEP_STROKE}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  )
}

// ── Runner stick-figure primitive ─────────────────────────────────────────

/** Simple stick-figure runner (head + tapered body) standing on a step.
 *  The label letter is shown on the body as in the source figure. */
export function RunnerFigure({
  cx,
  stepH,
  highlight = false,
}: {
  cx: number
  stepH: number
  highlight?: boolean
}) {
  const feetY = GROUND_Y - stepH      // top of the step block = feet level
  const bodyH = 44
  const headR = 12
  const bodyTopW = 10
  const bodyBotW = 16
  const bodyTopY = feetY - bodyH
  const headCy = bodyTopY - headR - 1

  // trapezoid body
  const bx0 = cx - bodyTopW / 2
  const bx1 = cx + bodyTopW / 2
  const bx2 = cx + bodyBotW / 2
  const bx3 = cx - bodyBotW / 2

  const bodyFill = highlight ? '#FCD34D' : COLOR.BODY_FILL  // amber if highlighted

  return (
    <g>
      {/* body */}
      <path
        d={`M ${bx0} ${bodyTopY} L ${bx1} ${bodyTopY} L ${bx2} ${feetY} L ${bx3} ${feetY} Z`}
        fill={bodyFill}
        stroke={COLOR.BODY_STROKE}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      {/* head */}
      <circle
        cx={cx}
        cy={headCy}
        r={headR}
        fill={COLOR.HEAD_FILL}
        stroke={COLOR.BODY_STROKE}
        strokeWidth={1.8}
      />
    </g>
  )
}

// ── Runner label badge ────────────────────────────────────────────────────

/** Letter badge (A–E) shown below the step block, at the base. */
function RunnerBadge({ cx, label }: { cx: number; label: string }) {
  const badgeW = 22
  const badgeH = 18
  const y = GROUND_Y + 4
  return (
    <g>
      <rect
        x={cx - badgeW / 2}
        y={y}
        width={badgeW}
        height={badgeH}
        rx={4}
        fill={COLOR.RUNNER_BG}
      />
      <text
        x={cx}
        y={y + badgeH / 2 + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={800}
        fill={COLOR.RUNNER_INK}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Default export ────────────────────────────────────────────────────────

/**
 * Podium1ECIllustration
 *
 * Static problem figure for IKMC-19-EC-Q1.
 * Five runners A–E stand on a stepped podium at heights corresponding to
 * their finishing rank. No rank labels are shown — the student reads the
 * figure to find the 3rd-tallest step.
 */
export default function Podium1ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Podium dengan lima tangga berbeda tinggi. Dari kiri ke kanan: pelari A di tangga terendah, ' +
        'B di tangga keempat, C di tangga tertinggi (tengah), D di tangga kedua, E di tangga ketiga. ' +
        'Siapa yang berada di tangga ketiga tertinggi?'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(340, SVG_W)}
        style={{ display: 'block' }}
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* ground strip */}
        <rect x={0} y={GROUND_Y} width={SVG_W} height={SVG_H - GROUND_Y} fill={COLOR.GROUND_FILL} />
        <line x1={0} y1={GROUND_Y} x2={SVG_W} y2={GROUND_Y} stroke={COLOR.GROUND_LINE} strokeWidth={2} />

        {/* podium steps (back-to-front: tallest first so shorter ones overlap correctly) */}
        {[...RUNNERS].sort((a, b) => b.stepH - a.stepH).map(({ label, cx, stepH }) => (
          <PodiumStep key={label} cx={cx} stepH={stepH} />
        ))}

        {/* step vertical dividers to create the staircase silhouette */}
        {/* (already achieved by the individual rect strokes) */}

        {/* runner figures */}
        {RUNNERS.map(({ label, cx, stepH }) => (
          <RunnerFigure key={label} cx={cx} stepH={stepH} />
        ))}

        {/* runner letter badges below ground */}
        {RUNNERS.map(({ label, cx }) => (
          <RunnerBadge key={label} cx={cx} label={label} />
        ))}
      </svg>
    </div>
  )
}
