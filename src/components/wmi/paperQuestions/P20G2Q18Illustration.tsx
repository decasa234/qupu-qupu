/**
 * P20G2Q18Illustration — WMI-20P2A-Q18 (2020 Grade 2 Semifinal, Paper A)
 *
 * "Jenny shoots arrows at a target. She gets 14 points the first time and 16
 *  points the second time. How many points does she get the third time?"
 *  Choices: A 17, B 18, C 19, D 20 — answer B (18).
 *
 * Recovered from db/seed/wmi/figures/2020-semifinal-g2-a-q18.jpg: a round
 * target of three concentric rings (grey outer, white middle, grey bull) with
 * two arrows flying in toward the centre. The per-throw scores (14, 16, ?) form
 * an arithmetic sequence that grows by +2 each throw, so the third throw is 18.
 *
 * The static figure draws ONLY the problem: the target + two incoming arrows,
 * with the two known throw scores 14 and 16 labelled beside it. It NEVER shows
 * the third score — that is the explainer's job.
 *
 * Pure render — no Math.random, no Date, no window/document at module scope.
 * SSR-safe & deterministic.
 */

// ── qupu colour tokens (raw hex echoes permitted) ──────────────────────────
const RING_OUTER = '#C9CDD2' // grey outer ring
const RING_MID = '#FFFFFF' // white middle ring
const RING_BULL = '#9CA3AF' // grey bullseye
const EDGE = '#3a3a3a'
const ARROW = '#1f2937'
const LABEL_BG = '#E1EFFB'
const LABEL_BORDER = '#30598A'
const LABEL_TEXT = '#30598A'

export const Q18_FIRST = 14
export const Q18_SECOND = 16
export const Q18_STEP = Q18_SECOND - Q18_FIRST // +2
export const Q18_THIRD = Q18_SECOND + Q18_STEP // 18 (answer B)

// ── A reusable concentric-ring target with two incoming arrows. ────────────
const CX = 120
const CY = 116
const R_OUTER = 86
const R_MID = 56
const R_BULL = 26

/** One arrow flying from outside toward the bull at angle `deg` (SVG degrees). */
function IncomingArrow({ deg }: { deg: number }) {
  const rad = (deg * Math.PI) / 180
  const ux = Math.cos(rad)
  const uy = Math.sin(rad)
  // tip just short of the bull centre, tail well outside the target
  const tipR = R_BULL - 4
  const tailR = R_OUTER + 44
  const tx = CX + tipR * ux
  const ty = CY + tipR * uy
  const ox = CX + tailR * ux
  const oy = CY + tailR * uy
  const px = -uy
  const py = ux
  return (
    <g>
      <line x1={tx} y1={ty} x2={ox} y2={oy} stroke={ARROW} strokeWidth={5} strokeLinecap="round" />
      {/* arrowhead at the tip */}
      <polygon
        points={`${tx},${ty} ${tx - 13 * ux - 7 * px},${ty - 13 * uy - 7 * py} ${tx - 13 * ux + 7 * px},${ty - 13 * uy + 7 * py}`}
        fill={ARROW}
      />
      {/* fletching ticks near the tail */}
      <line x1={ox - 10 * ux} y1={oy - 10 * uy} x2={ox - 10 * ux + 9 * px} y2={oy - 10 * uy + 9 * py} stroke={ARROW} strokeWidth={3} strokeLinecap="round" />
      <line x1={ox - 10 * ux} y1={oy - 10 * uy} x2={ox - 10 * ux - 9 * px} y2={oy - 10 * uy - 9 * py} stroke={ARROW} strokeWidth={3} strokeLinecap="round" />
    </g>
  )
}

export interface TargetBoardProps {
  /** Show the "1st = 14" score chip. */
  showFirst?: boolean
  /** Show the "2nd = 16" score chip. */
  showSecond?: boolean
  /** Show the "3rd = ?" / answer chip; pass a number to reveal it, true for "?". */
  third?: number | boolean
}

/** The concentric target + two arrows, with optional score chips on the right. */
export function TargetBoard({ showFirst = true, showSecond = true, third = false }: TargetBoardProps) {
  const chip = (y: number, label: string, value: string, accent = false) => (
    <g>
      <rect
        x={228}
        y={y}
        width={132}
        height={34}
        rx={9}
        fill={accent ? '#D1FAE5' : LABEL_BG}
        stroke={accent ? '#10B981' : LABEL_BORDER}
        strokeWidth={2}
      />
      <text x={244} y={y + 17} dominantBaseline="central" fontSize={13} fontWeight={700} fill={accent ? '#065F46' : LABEL_TEXT}>
        {label}
      </text>
      <text x={344} y={y + 17} textAnchor="end" dominantBaseline="central" fontSize={17} fontWeight={900} fill={accent ? '#065F46' : LABEL_TEXT}>
        {value}
      </text>
    </g>
  )
  return (
    <svg viewBox="0 0 380 240" width="100%" style={{ display: 'block', margin: '0 auto', maxWidth: 380 }} aria-hidden="true">
      {/* target rings */}
      <circle cx={CX} cy={CY} r={R_OUTER} fill={RING_OUTER} stroke={EDGE} strokeWidth={2.5} />
      <circle cx={CX} cy={CY} r={R_MID} fill={RING_MID} stroke={EDGE} strokeWidth={2} />
      <circle cx={CX} cy={CY} r={R_BULL} fill={RING_BULL} stroke={EDGE} strokeWidth={2} />
      {/* two arrows flying in toward the bull from the upper-left */}
      <IncomingArrow deg={232} />
      <IncomingArrow deg={258} />
      {/* score chips */}
      {showFirst && chip(58, '1st throw', String(Q18_FIRST))}
      {showSecond && chip(102, '2nd throw', String(Q18_SECOND))}
      {third !== false && chip(146, '3rd throw', third === true ? '?' : String(third), third !== true)}
    </svg>
  )
}

export default function P20G2Q18Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A round target of three concentric rings with two arrows flying in toward the centre. Jenny scored 14 points on her first throw and 16 on her second; her third throw is unknown."
    >
      <TargetBoard third={true} />
    </div>
  )
}
