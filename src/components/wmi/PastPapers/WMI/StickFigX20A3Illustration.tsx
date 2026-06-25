// SEAMOX-20-A-Q3 — "Find the missing number."
//
// Three stick-figure diagrams. Each has:
//   - a circle (head) showing a number (or "?" for Figure 3)
//   - four limb-tip numbers: upper-left (UL), upper-right (UR),
//     lower-left (LL), lower-right (LR)
//
// Rule (NOT revealed in the illustration):
//   head = (UL + UR) − (LL + LR)
//
// Fig 1: head=7,  UL=8, UR=5, LL=2, LR=4
// Fig 2: head=3,  UL=9, UR=2, LL=5, LR=3
// Fig 3: head=?,  UL=6, UR=4, LL=2, LR=3
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── layout constants (exported so Explainer can reuse) ────────────────────────

/** Width of a single stick-figure panel. */
export const PANEL_W = 80
/** Height of a single stick-figure panel. */
export const PANEL_H = 100
/** Radius of the head circle. */
export const HEAD_R = 16
/** Y centre of the head circle. */
export const HEAD_CY = 22
/** Y of the torso/body junction (where all four limbs meet). */
export const BODY_Y = 52
/** X centre of each panel. */
export const CX = 40

/** Colour tokens. */
export const COLOR = {
  HEAD_FILL: '#3D5A80',
  HEAD_STROKE: '#1F3A5F',
  HEAD_TEXT: '#FFFFFF',
  LIMB: '#1F2937',
  LABEL: '#1F2937',
  HIGHLIGHT: '#DC2626',
  GREEN: '#10B981',
  TORSO: '#1F2937',
} as const

// ── sub-primitive: one stick figure ──────────────────────────────────────────

interface FigData {
  head: number | '?'
  ul: number
  ur: number
  ll: number
  lr: number
  headFill?: string
  headText?: string
}

/**
 * StickFigure — draws one stick figure inside its own PANEL_W × PANEL_H coord space.
 * Limb endpoints are placed at the four diagonal/horizontal extremities; the torso
 * is a short vertical line from head to the junction point.
 */
export function StickFigure({ head, ul, ur, ll, lr, headFill, headText }: FigData) {
  // Torso from bottom of head circle to body junction
  const torsoTopY = HEAD_CY + HEAD_R
  const junctY = BODY_Y

  // Limb endpoint positions (relative to junction)
  const ulX = CX - 26
  const ulY = junctY - 14
  const urX = CX + 26
  const urY = junctY - 14
  const llX = CX - 22
  const llY = junctY + 22
  const lrX = CX + 22
  const lrY = junctY + 22

  const fill = headFill ?? COLOR.HEAD_FILL
  const textFill = headText ?? COLOR.HEAD_TEXT

  return (
    <g fontFamily="ui-sans-serif, system-ui, sans-serif">
      {/* torso */}
      <line
        x1={CX} y1={torsoTopY}
        x2={CX} y2={junctY}
        stroke={COLOR.TORSO} strokeWidth={2.5} strokeLinecap="round"
      />

      {/* upper limbs (two diagonal arms from junction) */}
      <line x1={CX} y1={junctY} x2={ulX} y2={ulY} stroke={COLOR.LIMB} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={CX} y1={junctY} x2={urX} y2={urY} stroke={COLOR.LIMB} strokeWidth={2.5} strokeLinecap="round" />

      {/* lower limbs (two legs) */}
      <line x1={CX} y1={junctY} x2={llX} y2={llY} stroke={COLOR.LIMB} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={CX} y1={junctY} x2={lrX} y2={lrY} stroke={COLOR.LIMB} strokeWidth={2.5} strokeLinecap="round" />

      {/* head circle */}
      <circle cx={CX} cy={HEAD_CY} r={HEAD_R} fill={fill} stroke={COLOR.HEAD_STROKE} strokeWidth={1.5} />
      <text
        x={CX} y={HEAD_CY}
        textAnchor="middle" dominantBaseline="central"
        fontSize={head === '?' ? 16 : 13}
        fontWeight={800}
        fill={textFill}
      >
        {String(head)}
      </text>

      {/* limb-tip number labels */}
      <text x={ulX - 4} y={ulY - 2} textAnchor="end" dominantBaseline="auto" fontSize={11} fontWeight={700} fill={COLOR.LABEL}>{ul}</text>
      <text x={urX + 4} y={urY - 2} textAnchor="start" dominantBaseline="auto" fontSize={11} fontWeight={700} fill={COLOR.LABEL}>{ur}</text>
      <text x={llX - 4} y={llY + 3} textAnchor="end" dominantBaseline="hanging" fontSize={11} fontWeight={700} fill={COLOR.LABEL}>{ll}</text>
      <text x={lrX + 4} y={lrY + 3} textAnchor="start" dominantBaseline="hanging" fontSize={11} fontWeight={700} fill={COLOR.LABEL}>{lr}</text>
    </g>
  )
}

// ── Default export ────────────────────────────────────────────────────────────

const SVG_W = PANEL_W * 3 + 16   // three panels + gaps
const SVG_H = PANEL_H + 20       // panel height + label row

/**
 * StickFigX20A3Illustration
 *
 * Static problem figure for SEAMOX-20-A-Q3.
 * Shows three stick figures with their limb numbers and head values.
 * Figure 3 shows "?" — the student must find the rule and apply it.
 */
export default function StickFigX20A3Illustration() {
  const gap = 8

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Three stick figures. Figure 1: head 7, limbs 8, 5, 2, 4. ' +
        'Figure 2: head 3, limbs 9, 2, 5, 3. ' +
        'Figure 3: head unknown, limbs 6, 4, 2, 3. Find the missing head number.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(300, SVG_W * 1.5)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* Figure 1 */}
        <g transform={`translate(${0}, 10)`}>
          <StickFigure head={7} ul={8} ur={5} ll={2} lr={4} />
        </g>

        {/* Figure 2 */}
        <g transform={`translate(${PANEL_W + gap}, 10)`}>
          <StickFigure head={3} ul={9} ur={2} ll={5} lr={3} />
        </g>

        {/* Figure 3 — head unknown */}
        <g transform={`translate(${(PANEL_W + gap) * 2}, 10)`}>
          <StickFigure head="?" ul={6} ur={4} ll={2} lr={3} />
        </g>
      </svg>
    </div>
  )
}
