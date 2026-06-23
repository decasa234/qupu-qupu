// FamilyAges18A9Illustration.tsx
//
// Stem illustration for SEAMO-18-A-Q9:
//   "My grandmother is 56 years old.
//    My mum is 31 years old.
//    I am 7 years old.
//    In how many years is the sum of our ages 100?"
//
// Shows three figures (grandmother, mum, child) standing side by side,
// each with a name label and an age badge below them.
// A sum strip at the bottom reads "56 + 31 + 7 = 94" with a "→ need 100" tail.
//
// Classification: stem illustration (no picture options).
// CODE: SEAMO-18-A-Q9
//
// Primitives used: none (no exact match in primitives/).
// Copy-adapted: PersonGlyph pattern from AppleFamily16B20Illustration.tsx.
//
// Pure render — no Math.random, no Date, no browser globals. SSR-safe.

// ── Seed-bound constants ─────────────────────────────────────────────────────

export const GRANDMOTHER_AGE = 56
export const MUM_AGE          = 31
export const CHILD_AGE        = 7

export const CURRENT_SUM = GRANDMOTHER_AGE + MUM_AGE + CHILD_AGE // 94
export const TARGET_SUM  = 100
export const GAP         = TARGET_SUM - CURRENT_SUM               // 6
export const YEARS_NEEDED = GAP / 3                               // 2

// ── SVG canvas ──────────────────────────────────────────────────────────────

export const SVG_W = 380
export const SVG_H = 220

// ── Colour tokens ─────────────────────────────────────────────────────────────

const C = {
  // figure colours — distinct per person
  GRANDMA_BODY:  '#F59E0B', // amber-400  — grandma outfit
  GRANDMA_DARK:  '#92400E',
  MUM_BODY:      '#60A5FA', // blue-400   — mum outfit
  MUM_DARK:      '#1D4ED8',
  CHILD_BODY:    '#F472B6', // pink-400   — child outfit
  CHILD_DARK:    '#9D174D',

  // shared skin
  SKIN:          '#FBBF24', // amber-300
  SKIN_DARK:     '#B45309',
  HAIR_GRANDMA:  '#9CA3AF', // gray-400 — grey hair
  HAIR_MUM:      '#78350F', // brown
  HAIR_CHILD:    '#A16207', // lighter brown

  // badge
  BADGE_BG:      '#FEF9C3', // yellow-100
  BADGE_BORDER:  '#CA8A04', // yellow-600
  BADGE_TEXT:    '#1F2937',

  // sum strip
  STRIP_BG:      '#EFF6FF', // blue-50
  STRIP_BORDER:  '#3B82F6', // blue-500
  STRIP_TEXT:    '#1E3A5F',
  TARGET_TEXT:   '#7C3AED', // violet-600

  // label
  LABEL_TEXT:    '#374151',

  SHADOW:        '#E5E7EB',
} as const

// ── Figure heights (grandmother > mum > child) ───────────────────────────────

const HEIGHTS = {
  grandma: 72,
  mum:     64,
  child:   48,
} as const

// ── FigurePerson primitive ───────────────────────────────────────────────────
//
// A simplified stylised person:
//   - circle head + hair semi-ellipse
//   - rectangular body (dress/shirt)
//   - two leg lines
//   - optional cane (grandma only)
//
// baseY = bottom baseline of the figure (feet).
// cx    = horizontal centre.

export interface FigurePersonProps {
  cx: number
  baseY: number
  height: number
  bodyColor: string
  bodyDark: string
  hairColor: string
  showCane?: boolean
}

export function FigurePerson({
  cx, baseY, height,
  bodyColor, bodyDark, hairColor,
  showCane = false,
}: FigurePersonProps) {
  const h   = height
  // proportions
  const headR      = h * 0.14
  const headCY     = baseY - h + headR
  const neckY      = headCY + headR
  const bodyTop    = neckY + h * 0.02
  const bodyH      = h * 0.38
  const bodyW      = h * 0.28
  const bodyLeft   = cx - bodyW / 2
  const bodyBot    = bodyTop + bodyH
  const legH       = h * 0.28
  const footY      = bodyBot + legH

  const hairRx     = headR * 1.1
  const hairRy     = headR * 0.55

  // arm positions
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
      <ellipse
        cx={cx}
        cy={headCY - headR * 0.5}
        rx={hairRx}
        ry={hairRy}
        fill={hairColor}
      />

      {/* Head */}
      <circle
        cx={cx}
        cy={headCY}
        r={headR}
        fill={C.SKIN}
        stroke={C.SKIN_DARK}
        strokeWidth={0.8}
      />
      {/* Face details */}
      {/* Eyes */}
      <circle cx={cx - headR * 0.32} cy={headCY - headR * 0.05} r={headR * 0.12} fill={C.SKIN_DARK} />
      <circle cx={cx + headR * 0.32} cy={headCY - headR * 0.05} r={headR * 0.12} fill={C.SKIN_DARK} />
      {/* Smile */}
      <path
        d={`M ${cx - headR * 0.28} ${headCY + headR * 0.28} Q ${cx} ${headCY + headR * 0.52} ${cx + headR * 0.28} ${headCY + headR * 0.28}`}
        fill="none"
        stroke={C.SKIN_DARK}
        strokeWidth={0.7}
        strokeLinecap="round"
      />

      {/* Neck */}
      <rect
        x={cx - headR * 0.3}
        y={neckY}
        width={headR * 0.6}
        height={h * 0.05}
        fill={C.SKIN}
      />

      {/* Body (dress/shirt rectangle) */}
      <rect
        x={bodyLeft}
        y={bodyTop}
        width={bodyW}
        height={bodyH}
        rx={3}
        fill={bodyColor}
        stroke={bodyDark}
        strokeWidth={1}
      />

      {/* Left arm */}
      <line
        x1={bodyLeft} y1={shoulderY}
        x2={elbowX}   y2={elbowY}
        stroke={bodyDark} strokeWidth={2.5} strokeLinecap="round"
      />
      <line
        x1={elbowX}  y1={elbowY}
        x2={handX}   y2={handY}
        stroke={C.SKIN_DARK} strokeWidth={2} strokeLinecap="round"
      />

      {/* Right arm */}
      <line
        x1={rShoulderX} y1={shoulderY}
        x2={rElbowX}    y2={elbowY}
        stroke={bodyDark} strokeWidth={2.5} strokeLinecap="round"
      />
      <line
        x1={rElbowX}  y1={elbowY}
        x2={rHandX}   y2={handY}
        stroke={C.SKIN_DARK} strokeWidth={2} strokeLinecap="round"
      />

      {/* Legs */}
      <line
        x1={cx - bodyW * 0.2} y1={bodyBot}
        x2={cx - bodyW * 0.24} y2={footY}
        stroke={bodyDark} strokeWidth={2.5} strokeLinecap="round"
      />
      <line
        x1={cx + bodyW * 0.2} y1={bodyBot}
        x2={cx + bodyW * 0.24} y2={footY}
        stroke={bodyDark} strokeWidth={2.5} strokeLinecap="round"
      />

      {/* Cane for grandma */}
      {showCane && (
        <path
          d={`M ${handX + 1} ${handY} L ${handX - 6} ${footY} Q ${handX - 8} ${footY + 3} ${handX - 4} ${footY + 3}`}
          fill="none"
          stroke="#6B7280"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </g>
  )
}

// ── AgeBadge ─────────────────────────────────────────────────────────────────

export interface AgeBadgeProps {
  cx: number
  cy: number
  age: number
}

export function AgeBadge({ cx, cy, age }: AgeBadgeProps) {
  const label = `${age} yrs`
  const w = 40
  const h = 18
  return (
    <g>
      <rect
        x={cx - w / 2}
        y={cy - h / 2}
        width={w}
        height={h}
        rx={9}
        fill={C.BADGE_BG}
        stroke={C.BADGE_BORDER}
        strokeWidth={1.5}
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontWeight={700}
        fill={C.BADGE_TEXT}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Main diagram ──────────────────────────────────────────────────────────────

export interface FamilyAgesDiagramProps {
  /** When true, adds an annotation showing the 2-year solution. */
  showSolution?: boolean
}

const PERSONS = [
  {
    key:       'grandma',
    label:     'Grandma',
    age:       GRANDMOTHER_AGE,
    height:    HEIGHTS.grandma,
    bodyColor: C.GRANDMA_BODY,
    bodyDark:  C.GRANDMA_DARK,
    hairColor: C.HAIR_GRANDMA,
    showCane:  true,
  },
  {
    key:       'mum',
    label:     'Mum',
    age:       MUM_AGE,
    height:    HEIGHTS.mum,
    bodyColor: C.MUM_BODY,
    bodyDark:  C.MUM_DARK,
    hairColor: C.HAIR_MUM,
    showCane:  false,
  },
  {
    key:       'child',
    label:     'Me',
    age:       CHILD_AGE,
    height:    HEIGHTS.child,
    bodyColor: C.CHILD_BODY,
    bodyDark:  C.CHILD_DARK,
    hairColor: C.HAIR_CHILD,
    showCane:  false,
  },
] as const

export function FamilyAgesDiagram({ showSolution = false }: FamilyAgesDiagramProps) {
  // Baseline: all figures stand on the same ground line
  const groundY    = 162
  const stripY     = groundY + 14
  const stripH     = 28
  const stripPad   = 10

  // Horizontal positions — spread across width
  const positions  = [SVG_W * 0.18, SVG_W * 0.50, SVG_W * 0.82]

  const sumStr     = `${GRANDMOTHER_AGE} + ${MUM_AGE} + ${CHILD_AGE} = ${CURRENT_SUM}`
  const needStr    = showSolution
    ? `+${GAP}÷3 = ${YEARS_NEEDED} yrs`
    : `→ need ${TARGET_SUM}`

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Ground line */}
      <line
        x1={20} y1={groundY} x2={SVG_W - 20} y2={groundY}
        stroke={C.SHADOW} strokeWidth={2}
      />

      {/* Person figures */}
      {PERSONS.map((p, i) => {
        const cx = positions[i]
        const baseY = groundY

        return (
          <g key={p.key}>
            <FigurePerson
              cx={cx}
              baseY={baseY}
              height={p.height}
              bodyColor={p.bodyColor}
              bodyDark={p.bodyDark}
              hairColor={p.hairColor}
              showCane={p.showCane}
            />
            {/* Name label above figure */}
            <text
              x={cx}
              y={baseY - p.height - 14}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={10}
              fontWeight={700}
              fill={C.LABEL_TEXT}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {p.label}
            </text>
            {/* Age badge below figure */}
            <AgeBadge cx={cx} cy={baseY + 9} age={p.age} />
          </g>
        )
      })}

      {/* Sum strip */}
      <rect
        x={stripPad}
        y={stripY + 10}
        width={SVG_W - stripPad * 2}
        height={stripH}
        rx={6}
        fill={C.STRIP_BG}
        stroke={C.STRIP_BORDER}
        strokeWidth={1.5}
      />
      {/* Sum expression */}
      <text
        x={SVG_W / 2 - 38}
        y={stripY + 10 + stripH / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={700}
        fill={C.STRIP_TEXT}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {sumStr}
      </text>
      {/* Divider */}
      <line
        x1={SVG_W / 2 + 10} y1={stripY + 14}
        x2={SVG_W / 2 + 10} y2={stripY + 10 + stripH - 4}
        stroke={C.STRIP_BORDER} strokeWidth={1}
      />
      {/* "need 100" or solution */}
      <text
        x={SVG_W / 2 + 56}
        y={stripY + 10 + stripH / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={800}
        fill={showSolution ? C.TARGET_TEXT : C.STRIP_TEXT}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {needStr}
      </text>
    </svg>
  )
}

// ── Default export (stem illustration) ───────────────────────────────────────

export default function FamilyAges18A9Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Three family members standing side by side: Grandma (56 years old) with a cane, ' +
        'Mum (31 years old), and Me (7 years old). ' +
        `Below them a sum strip shows: ${GRANDMOTHER_AGE} + ${MUM_AGE} + ${CHILD_AGE} = ${CURRENT_SUM}, need ${TARGET_SUM}.`
      }
    >
      <FamilyAgesDiagram />
    </div>
  )
}
