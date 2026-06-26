/**
 * SIMOC 2019 Grade 2 Q16 — Number diagram illustration.
 *
 * Layout: centre square (8) ↔ four arm circles (3,2,6,5) ↔ four corner diamonds (43,50,22,?/29).
 * Rule (derived from seed quantities): diamond = centre × (centre − edge) + edge.
 *
 * Named export `NumberDiagramCore` is consumed by the explainer with highlight + showAnswer props.
 * Default export renders the plain stem (no highlight, bottom diamond shows "?").
 */

// ── Seed-bound constants ──────────────────────────────────────────────────────
// All values sourced from db/seed/simoc/papers/2019-contest-g2.json Q16 quantities.
export const CENTRE   = 8
export const TOP_E    = 3;   export const TOP_D    = 43
export const LEFT_E   = 2;   export const LEFT_D   = 50
export const RIGHT_E  = 6;   export const RIGHT_D  = 22
export const BOT_E    = 5;   export const BOT_ANSWER = 29  // 8×(8−5)+5

// ── Palette ───────────────────────────────────────────────────────────────────
const BLUE     = '#30598A'
const BLUE_LT  = '#EBF2FA'
const AMBER_BG = '#FDE68A'
const DIA_BG   = '#EDE9FE'
const GREEN    = '#10B981'
const GREEN_BG = '#D1FAE5'
const INK      = '#1F2937'
const STROKE_W = 2.2

// ── Types ─────────────────────────────────────────────────────────────────────
export type DiagramArm = 'top' | 'left' | 'right' | 'bottom' | 'center' | ''

export interface NumberDiagramCoreProps {
  /** Which arm to visually highlight (green). Empty string = none. */
  highlight?: DiagramArm
  /** When true, the bottom diamond shows the answer (29) instead of "?". */
  showAnswer?: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function hl(arm: DiagramArm, current: DiagramArm) {
  return current === arm
}

function armStroke(arm: DiagramArm, current: DiagramArm) {
  return hl(arm, current) ? GREEN : BLUE
}

function armFill(arm: DiagramArm, current: DiagramArm, base: string) {
  return hl(arm, current) ? GREEN_BG : base
}

// ── Core diagram (shared with explainer) ─────────────────────────────────────
export function NumberDiagramCore({
  highlight = '',
  showAnswer = false,
}: NumberDiagramCoreProps) {
  const h = highlight

  // Connector lines (drawn first so nodes sit on top)
  const connectors: [number, number, number, number, DiagramArm][] = [
    [130, 110, 130,  93, 'top'],    // centre → top arm
    [130,  57, 130,  43, 'top'],    // top arm → top diamond
    [130, 150, 130, 167, 'bottom'], // centre → bottom arm
    [130, 203, 130, 217, 'bottom'], // bottom arm → bottom diamond
    [110, 130,  93, 130, 'left'],   // centre → left arm
    [ 57, 130,  43, 130, 'left'],   // left arm → left diamond
    [150, 130, 167, 130, 'right'],  // centre → right arm
    [203, 130, 217, 130, 'right'],  // right arm → right diamond
  ]

  return (
    <svg
      viewBox="0 0 260 260"
      width={260}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* ── Connector lines ── */}
      {connectors.map(([x1, y1, x2, y2, arm], i) => (
        <line
          key={i}
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={armStroke(arm, h)}
          strokeWidth={STROKE_W}
          strokeLinecap="round"
        />
      ))}

      {/* ── Centre square ── */}
      <rect
        x={110} y={110} width={40} height={40} rx={4}
        fill={armFill('center', h, AMBER_BG)}
        stroke={armStroke('center', h)}
        strokeWidth={STROKE_W}
      />
      <text
        x={130} y={130}
        textAnchor="middle" dominantBaseline="central"
        fontSize={17} fontWeight={800} fill={INK}
        className="font-display"
      >{CENTRE}</text>

      {/* ── Arm circles ── */}
      {/* top */}
      <circle cx={130} cy={75} r={18}
        fill={armFill('top', h, BLUE_LT)}
        stroke={armStroke('top', h)}
        strokeWidth={STROKE_W}
      />
      <text x={130} y={75} textAnchor="middle" dominantBaseline="central"
        fontSize={15} fontWeight={700} fill={INK} className="font-display"
      >{TOP_E}</text>

      {/* bottom */}
      <circle cx={130} cy={185} r={18}
        fill={armFill('bottom', h, BLUE_LT)}
        stroke={armStroke('bottom', h)}
        strokeWidth={STROKE_W}
      />
      <text x={130} y={185} textAnchor="middle" dominantBaseline="central"
        fontSize={15} fontWeight={700} fill={INK} className="font-display"
      >{BOT_E}</text>

      {/* left */}
      <circle cx={75} cy={130} r={18}
        fill={armFill('left', h, BLUE_LT)}
        stroke={armStroke('left', h)}
        strokeWidth={STROKE_W}
      />
      <text x={75} y={130} textAnchor="middle" dominantBaseline="central"
        fontSize={15} fontWeight={700} fill={INK} className="font-display"
      >{LEFT_E}</text>

      {/* right */}
      <circle cx={185} cy={130} r={18}
        fill={armFill('right', h, BLUE_LT)}
        stroke={armStroke('right', h)}
        strokeWidth={STROKE_W}
      />
      <text x={185} y={130} textAnchor="middle" dominantBaseline="central"
        fontSize={15} fontWeight={700} fill={INK} className="font-display"
      >{RIGHT_E}</text>

      {/* ── Corner diamonds ── */}
      {/* top */}
      <polygon
        points="130,7 148,25 130,43 112,25"
        fill={armFill('top', h, DIA_BG)}
        stroke={armStroke('top', h)}
        strokeWidth={STROKE_W}
      />
      <text x={130} y={25} textAnchor="middle" dominantBaseline="central"
        fontSize={13} fontWeight={800} fill={INK} className="font-display"
      >{TOP_D}</text>

      {/* left */}
      <polygon
        points="25,112 43,130 25,148 7,130"
        fill={armFill('left', h, DIA_BG)}
        stroke={armStroke('left', h)}
        strokeWidth={STROKE_W}
      />
      <text x={25} y={130} textAnchor="middle" dominantBaseline="central"
        fontSize={12} fontWeight={800} fill={INK} className="font-display"
      >{LEFT_D}</text>

      {/* right */}
      <polygon
        points="235,112 253,130 235,148 217,130"
        fill={armFill('right', h, DIA_BG)}
        stroke={armStroke('right', h)}
        strokeWidth={STROKE_W}
      />
      <text x={235} y={130} textAnchor="middle" dominantBaseline="central"
        fontSize={13} fontWeight={800} fill={INK} className="font-display"
      >{RIGHT_D}</text>

      {/* bottom — shows "?" until showAnswer */}
      <polygon
        points="130,217 148,235 130,253 112,235"
        fill={showAnswer ? GREEN_BG : armFill('bottom', h, DIA_BG)}
        stroke={showAnswer ? GREEN : armStroke('bottom', h)}
        strokeWidth={STROKE_W}
      />
      <text x={130} y={235} textAnchor="middle" dominantBaseline="central"
        fontSize={13} fontWeight={800}
        fill={showAnswer ? '#065F46' : INK}
        className="font-display"
      >{showAnswer ? BOT_ANSWER : '?'}</text>
    </svg>
  )
}

// ── Default export = stem (no highlight, bottom = "?") ────────────────────────
export default function NumberDiagramSIMOC19G2Q16Illustration() {
  return (
    <div className="flex justify-center py-2">
      <NumberDiagramCore />
    </div>
  )
}
