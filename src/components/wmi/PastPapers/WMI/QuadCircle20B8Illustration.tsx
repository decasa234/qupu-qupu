// SEAMO-20-B-Q8 — "Find the value of B."
//
// Source figures: 2020.imgs/016.jpg, 017.jpg, 018.jpg
//
// Three side-by-side circles, each divided into four quadrants by a cross
// (horizontal + vertical diameter lines).  Quadrant positions:
//   TL = top-left   TR = top-right
//   BL = bottom-left  BR = bottom-right
//
// Data:
//   Circle 1: TL=2,  TR=3,  BL=5,  BR=21  → (2+5)×3=21  ✓
//   Circle 2: TL=5,  TR=4,  BL=9,  BR=56  → (5+9)×4=56  ✓
//   Circle 3: TL=10, TR=6,  BL=2,  BR=B(?)→ (10+2)×6=72 → B=72 → answer A
//
// Rule: BR = (TL + BL) × TR
//
// No existing primitive covers this exact quadrant-circle layout.
// Adapted loosely from CircleNumbers20A9Illustration structure.
// Pure SVG, SSR-safe — no hooks, no framer-motion.

// ── Colours ──────────────────────────────────────────────────────────────────

const INK    = '#1F2937'
const BLUE   = '#30598A'
const ORANGE = '#f0853a'
const PEACH  = '#FDE3CF'
const WHITE  = '#FFFFFF'
const ROSE   = '#C94060'

// ── Data ─────────────────────────────────────────────────────────────────────

export interface QuadCircleEntry {
  tl: number
  tr: number
  bl: number
  br: number | null   // null = missing (shown as B or ?)
}

export const QUAD_CIRCLE_ENTRIES: QuadCircleEntry[] = [
  { tl: 2,  tr: 3,  bl: 5,  br: 21 },
  { tl: 5,  tr: 4,  bl: 9,  br: 56 },
  { tl: 10, tr: 6,  bl: 2,  br: null },
]

export const QUAD_CIRCLE_ANSWER = 72   // (10+2)×6

// ── Geometry ─────────────────────────────────────────────────────────────────

const R        = 44    // circle radius
const TEXT_OFF = 14    // offset from centre to quadrant label

const PAD  = 8
const TILE = (R + PAD) * 2
const GAP  = 24        // gap between circles

const VW = TILE * 3 + GAP * 2
const VH = TILE

// ── Sub-component: one quadrant circle ───────────────────────────────────────

interface QuadCircleProps {
  entry: QuadCircleEntry
  cx: number
  cy: number
  revealAnswer?: boolean
  highlightBR?: boolean
}

function QuadCircleShape({
  entry,
  cx,
  cy,
  revealAnswer = false,
  highlightBR  = false,
}: QuadCircleProps) {
  const isUnknown = entry.br === null
  const brText = isUnknown
    ? (revealAnswer ? String(QUAD_CIRCLE_ANSWER) : 'B')
    : String(entry.br)

  // Background fill for BR quadrant when it's the unknown
  const brFill = isUnknown ? PEACH : 'none'

  return (
    <g>
      {/* Main circle fill */}
      <circle cx={cx} cy={cy} r={R} fill={WHITE} stroke={ROSE} strokeWidth={2.5} />

      {/* Quadrant highlight for unknown BR */}
      {isUnknown && (
        <clipPath id={`br-clip-${cx}`}>
          <path d={`M${cx},${cy} L${cx + R + 4},${cy} A${R + 4},${R + 4} 0 0,1 ${cx},${cy + R + 4} Z`} />
        </clipPath>
      )}
      {isUnknown && (
        <circle
          cx={cx} cy={cy} r={R - 1}
          fill={brFill}
          clipPath={`url(#br-clip-${cx})`}
        />
      )}

      {/* Dividing lines (cross) */}
      <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} stroke={ROSE} strokeWidth={2} />
      <line x1={cx} y1={cy - R} x2={cx} y2={cy + R} stroke={ROSE} strokeWidth={2} />

      {/* Outer circle on top of lines so lines don't bleed */}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={ROSE} strokeWidth={2.5} />

      {/* TL label */}
      <text
        x={cx - TEXT_OFF} y={cy - TEXT_OFF}
        textAnchor="middle" dominantBaseline="central"
        fontSize={15} fontWeight={700} fill={BLUE}
      >
        {entry.tl}
      </text>

      {/* TR label */}
      <text
        x={cx + TEXT_OFF} y={cy - TEXT_OFF}
        textAnchor="middle" dominantBaseline="central"
        fontSize={15} fontWeight={700} fill={BLUE}
      >
        {entry.tr}
      </text>

      {/* BL label */}
      <text
        x={cx - TEXT_OFF} y={cy + TEXT_OFF}
        textAnchor="middle" dominantBaseline="central"
        fontSize={15} fontWeight={700} fill={BLUE}
      >
        {entry.bl}
      </text>

      {/* BR label (unknown = B or revealed answer) */}
      <text
        x={cx + TEXT_OFF} y={cy + TEXT_OFF}
        textAnchor="middle" dominantBaseline="central"
        fontSize={isUnknown && !revealAnswer ? 17 : 15}
        fontWeight={700}
        fill={isUnknown ? (revealAnswer ? ORANGE : INK) : (highlightBR ? ORANGE : BLUE)}
      >
        {brText}
      </text>
    </g>
  )
}

// ── Named reusable component (accepts revealAnswer) ───────────────────────────

export interface QuadCircle20B8Props {
  revealAnswer?: boolean
}

export function QuadCircle20B8({ revealAnswer = false }: QuadCircle20B8Props = {}) {
  const tileR = R + PAD
  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: VW, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {QUAD_CIRCLE_ENTRIES.map((entry, i) => {
        const cx = tileR + i * (TILE + GAP)
        const cy = tileR
        return (
          <QuadCircleShape
            key={i}
            entry={entry}
            cx={cx}
            cy={cy}
            revealAnswer={revealAnswer}
          />
        )
      })}
    </svg>
  )
}

// ── Default export: static illustration ──────────────────────────────────────

/** Static illustration for SEAMO-20-B-Q8 — BR cell of third circle is blank (shows B). */
export default function QuadCircle20B8Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Tiga lingkaran berjejer, masing-masing dibagi empat bagian oleh garis silang. ' +
        'Lingkaran 1: kiri atas 2, kanan atas 3, kiri bawah 5, kanan bawah 21. ' +
        'Lingkaran 2: kiri atas 5, kanan atas 4, kiri bawah 9, kanan bawah 56. ' +
        'Lingkaran 3: kiri atas 10, kanan atas 6, kiri bawah 2, kanan bawah B (tanda tanya).'
      }
    >
      <QuadCircle20B8 />
    </div>
  )
}
