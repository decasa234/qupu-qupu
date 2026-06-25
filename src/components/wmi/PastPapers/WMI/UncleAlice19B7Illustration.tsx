// UncleAlice19B7Illustration.tsx
//
// Stem illustration for SEAMO-19-B-Q7:
//   "The sum of Alice and her uncle's ages is 33 years.
//    If her uncle will be twice her age in 3 years' time,
//    how old is Alice this year?"
//
// Answer: B (10 years old).
//
// Shows two figures: a taller uncle and a shorter Alice, each with a
// question-mark badge (ages unknown). Below them, a constraint strip shows
// "Alice + Uncle = 33" and a future strip shows "Uncle+3 = 2×(Alice+3)".
//
// Classification: stem illustration (no picture options).
// CODE: SEAMO-19-B-Q7
//
// Primitives used: none — FigurePerson pattern adapted from
//   FamilyAges18A9Illustration (same repo, two-person subset).
//
// Pure render — no Math.random, no Date, no browser globals. SSR-safe.

// ── Seed-bound constants ──────────────────────────────────────────────────────

export const ALICE_AGE  = 10   // answer
export const UNCLE_AGE  = 23   // 33 − 10
export const SUM_NOW    = 33
export const YEARS_FWD  = 3

// ── SVG canvas ────────────────────────────────────────────────────────────────

export const SVG_W = 360
export const SVG_H = 240

// ── Colour tokens ─────────────────────────────────────────────────────────────

const C = {
  // Uncle — navy / slate
  UNCLE_BODY:    '#3B82F6',  // blue-500
  UNCLE_DARK:    '#1D4ED8',  // blue-700
  UNCLE_HAIR:    '#1F2937',  // gray-800

  // Alice — rose / pink
  ALICE_BODY:    '#F472B6',  // pink-400
  ALICE_DARK:    '#9D174D',  // pink-800
  ALICE_HAIR:    '#A16207',  // yellow-800 (light brown)

  // Shared skin
  SKIN:          '#FBBF24',
  SKIN_DARK:     '#B45309',

  // Badges
  BADGE_Q_BG:    '#FEF3C7',  // amber-100
  BADGE_Q_BORD:  '#F59E0B',  // amber-400
  BADGE_TEXT:    '#1F2937',

  // Constraint strips
  STRIP_BG:      '#EFF6FF',
  STRIP_BORDER:  '#3B82F6',
  STRIP_TEXT:    '#1E3A5F',

  FUTURE_BG:     '#F5F3FF',
  FUTURE_BORDER: '#7C3AED',
  FUTURE_TEXT:   '#4C1D95',

  // Ground
  GROUND:        '#E5E7EB',
  LABEL:         '#374151',
} as const

// ── FigurePerson ─────────────────────────────────────────────────────────────
//
// Simplified stick figure (copied + trimmed from FamilyAges18A9Illustration).
// cx = horizontal centre; baseY = feet; height = total figure height.

function FigurePerson({
  cx,
  baseY,
  height,
  bodyColor,
  bodyDark,
  hairColor,
}: {
  cx: number
  baseY: number
  height: number
  bodyColor: string
  bodyDark: string
  hairColor: string
}) {
  const h        = height
  const headR    = h * 0.14
  const headCY   = baseY - h + headR
  const neckY    = headCY + headR
  const bodyTop  = neckY + h * 0.02
  const bodyH    = h * 0.38
  const bodyW    = h * 0.28
  const bodyLeft = cx - bodyW / 2
  const bodyBot  = bodyTop + bodyH
  const legH     = h * 0.28
  const footY    = bodyBot + legH

  const hairRx   = headR * 1.1
  const hairRy   = headR * 0.55

  const shoulderY  = bodyTop + bodyH * 0.18
  const elbowX     = bodyLeft - h * 0.18
  const elbowY     = shoulderY + h * 0.12
  const handX      = bodyLeft - h * 0.12
  const handY      = elbowY + h * 0.1
  const rShoulderX = cx + bodyW / 2
  const rElbowX    = rShoulderX + h * 0.18
  const rHandX     = rShoulderX + h * 0.12

  return (
    <g>
      {/* Hair */}
      <ellipse cx={cx} cy={headCY - headR * 0.5} rx={hairRx} ry={hairRy} fill={hairColor} />
      {/* Head */}
      <circle cx={cx} cy={headCY} r={headR} fill={C.SKIN} stroke={C.SKIN_DARK} strokeWidth={0.8} />
      {/* Eyes */}
      <circle cx={cx - headR * 0.32} cy={headCY - headR * 0.05} r={headR * 0.12} fill={C.SKIN_DARK} />
      <circle cx={cx + headR * 0.32} cy={headCY - headR * 0.05} r={headR * 0.12} fill={C.SKIN_DARK} />
      {/* Smile */}
      <path
        d={`M ${cx - headR * 0.28} ${headCY + headR * 0.28} Q ${cx} ${headCY + headR * 0.52} ${cx + headR * 0.28} ${headCY + headR * 0.28}`}
        fill="none" stroke={C.SKIN_DARK} strokeWidth={0.7} strokeLinecap="round"
      />
      {/* Neck */}
      <rect x={cx - headR * 0.3} y={neckY} width={headR * 0.6} height={h * 0.05} fill={C.SKIN} />
      {/* Body */}
      <rect x={bodyLeft} y={bodyTop} width={bodyW} height={bodyH} rx={3} fill={bodyColor} stroke={bodyDark} strokeWidth={1} />
      {/* Left arm */}
      <line x1={bodyLeft} y1={shoulderY} x2={elbowX} y2={elbowY} stroke={bodyDark} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={elbowX} y1={elbowY} x2={handX} y2={handY} stroke={C.SKIN_DARK} strokeWidth={2} strokeLinecap="round" />
      {/* Right arm */}
      <line x1={rShoulderX} y1={shoulderY} x2={rElbowX} y2={elbowY} stroke={bodyDark} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={rElbowX} y1={elbowY} x2={rHandX} y2={handY} stroke={C.SKIN_DARK} strokeWidth={2} strokeLinecap="round" />
      {/* Legs */}
      <line x1={cx - bodyW * 0.2} y1={bodyBot} x2={cx - bodyW * 0.24} y2={footY} stroke={bodyDark} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={cx + bodyW * 0.2} y1={bodyBot} x2={cx + bodyW * 0.24} y2={footY} stroke={bodyDark} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  )
}

// ── AgeBadge — shows "?" for the unknown stem ─────────────────────────────────

function QuestionBadge({ cx, cy }: { cx: number; cy: number }) {
  const w = 32
  const h = 18
  return (
    <g>
      <rect
        x={cx - w / 2} y={cy - h / 2}
        width={w} height={h} rx={9}
        fill={C.BADGE_Q_BG} stroke={C.BADGE_Q_BORD} strokeWidth={1.5}
      />
      <text
        x={cx} y={cy}
        textAnchor="middle" dominantBaseline="central"
        fontSize={11} fontWeight={800} fill={C.BADGE_TEXT}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        ?
      </text>
    </g>
  )
}

// ── Main diagram ──────────────────────────────────────────────────────────────

export interface UncleAliceDiagramProps {
  /** When true, replace "?" badges with the actual ages. */
  showSolution?: boolean
}

export function UncleAliceDiagram({ showSolution = false }: UncleAliceDiagramProps) {
  const groundY   = 148
  const uncleH    = 80
  const aliceH    = 52

  const uncleCX   = SVG_W * 0.32
  const aliceCX   = SVG_W * 0.68

  // Constraint strips
  const strip1Y   = groundY + 18
  const strip2Y   = groundY + 54
  const stripH    = 26
  const stripPad  = 10

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Ground line */}
      <line x1={20} y1={groundY} x2={SVG_W - 20} y2={groundY} stroke={C.GROUND} strokeWidth={2} />

      {/* Uncle figure */}
      <FigurePerson
        cx={uncleCX} baseY={groundY} height={uncleH}
        bodyColor={C.UNCLE_BODY} bodyDark={C.UNCLE_DARK} hairColor={C.UNCLE_HAIR}
      />
      <text
        x={uncleCX} y={groundY - uncleH - 12}
        textAnchor="middle" dominantBaseline="central"
        fontSize={11} fontWeight={700} fill={C.LABEL}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        Uncle
      </text>
      {showSolution ? (
        <g>
          <rect x={uncleCX - 16} y={groundY + 5} width={32} height={18} rx={9} fill={C.BADGE_Q_BG} stroke={C.BADGE_Q_BORD} strokeWidth={1.5} />
          <text x={uncleCX} y={groundY + 14} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={800} fill={C.BADGE_TEXT} fontFamily="ui-sans-serif, system-ui, sans-serif">
            {UNCLE_AGE}
          </text>
        </g>
      ) : (
        <QuestionBadge cx={uncleCX} cy={groundY + 10} />
      )}

      {/* Alice figure */}
      <FigurePerson
        cx={aliceCX} baseY={groundY} height={aliceH}
        bodyColor={C.ALICE_BODY} bodyDark={C.ALICE_DARK} hairColor={C.ALICE_HAIR}
      />
      <text
        x={aliceCX} y={groundY - aliceH - 12}
        textAnchor="middle" dominantBaseline="central"
        fontSize={11} fontWeight={700} fill={C.LABEL}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        Alice
      </text>
      {showSolution ? (
        <g>
          <rect x={aliceCX - 16} y={groundY + 5} width={32} height={18} rx={9} fill={C.BADGE_Q_BG} stroke={C.BADGE_Q_BORD} strokeWidth={1.5} />
          <text x={aliceCX} y={groundY + 14} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={800} fill={C.BADGE_TEXT} fontFamily="ui-sans-serif, system-ui, sans-serif">
            {ALICE_AGE}
          </text>
        </g>
      ) : (
        <QuestionBadge cx={aliceCX} cy={groundY + 10} />
      )}

      {/* Constraint strip 1: sum now */}
      <rect
        x={stripPad} y={strip1Y}
        width={SVG_W - stripPad * 2} height={stripH}
        rx={6} fill={C.STRIP_BG} stroke={C.STRIP_BORDER} strokeWidth={1.5}
      />
      <text
        x={SVG_W / 2} y={strip1Y + stripH / 2}
        textAnchor="middle" dominantBaseline="central"
        fontSize={11} fontWeight={700} fill={C.STRIP_TEXT}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {`Alice + Uncle = ${SUM_NOW} (now)`}
      </text>

      {/* Constraint strip 2: future doubling condition */}
      <rect
        x={stripPad} y={strip2Y}
        width={SVG_W - stripPad * 2} height={stripH}
        rx={6} fill={C.FUTURE_BG} stroke={C.FUTURE_BORDER} strokeWidth={1.5}
      />
      <text
        x={SVG_W / 2} y={strip2Y + stripH / 2}
        textAnchor="middle" dominantBaseline="central"
        fontSize={10} fontWeight={700} fill={C.FUTURE_TEXT}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {`In ${YEARS_FWD} years: Uncle+${YEARS_FWD} = 2×(Alice+${YEARS_FWD})`}
      </text>
    </svg>
  )
}

// ── Default export (stem illustration) ────────────────────────────────────────

export default function UncleAlice19B7Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Two figures: a taller Uncle and shorter Alice standing side by side, both with unknown age badges. ' +
        `Below: "Alice + Uncle = ${SUM_NOW} (now)" and "In ${YEARS_FWD} years: Uncle+${YEARS_FWD} = 2×(Alice+${YEARS_FWD})".`
      }
    >
      <UncleAliceDiagram />
    </div>
  )
}
