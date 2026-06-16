// Ordering25G2Illustration — WMI-25F2A-Q15
// Five blank ordering slots (largest → smallest) with a smiley drawn at the
// 2nd position.  Problem-only: no expression values, no answer revealed.

const INK = '#1F2937'
const SLOT_FILL = '#FFFFFF'
const SLOT_STROKE = INK
const SMILEY_YELLOW = '#F5C518'
const SMILEY_STROKE = '#B8860B'

// Exported so an eventual explainer can reuse these constants.
export const SLOT_COUNT = 5
/** 0-based index of the smiley-marked slot (2nd largest = index 1). */
export const SMILEY_SLOT_INDEX = 1

// Expressions + their computed values (for reference by explainer; never shown
// in the static figure).
export const EXPRESSIONS_25G2Q15 = [
  { label: 'A', expr: '7 × 7',       value: 49 },
  { label: 'B', expr: '44 + 18',     value: 62 },
  { label: 'C', expr: '5 × 9',       value: 45 },
  { label: 'D', expr: '205 − 128',   value: 77 },
  { label: 'E', expr: '16 + 37',     value: 53 },
] as const

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** A drawn smiley face, centred at (cx, cy) with radius r. */
function SmileGlyph({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  // face circle
  // eyes: two filled circles
  const eyeOffX = r * 0.32
  const eyeOffY = r * 0.22
  const eyeR = r * 0.12
  // smile arc: a small arc below centre
  const smileRad = r * 0.42
  const smileY = cy + r * 0.14
  // SVG arc from left to right
  const sx = cx - smileRad
  const sy = smileY
  const ex = cx + smileRad
  const ey = smileY
  const sweepR = smileRad * 1.05
  const d = `M ${sx} ${sy} A ${sweepR} ${sweepR} 0 0 1 ${ex} ${ey}`

  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={SMILEY_YELLOW} stroke={SMILEY_STROKE} strokeWidth={r * 0.12} />
      {/* left eye */}
      <circle cx={cx - eyeOffX} cy={cy - eyeOffY} r={eyeR} fill={INK} />
      {/* right eye */}
      <circle cx={cx + eyeOffX} cy={cy - eyeOffY} r={eyeR} fill={INK} />
      {/* smile */}
      <path d={d} fill="none" stroke={INK} strokeWidth={r * 0.13} strokeLinecap="round" />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Main illustration
// ---------------------------------------------------------------------------

/** Layout constants (all in SVG user units). */
const SLOT_W = 46
const SLOT_H = 28
const GAP_BETWEEN = 18   // horizontal gap for the ">" glyph
const SMILEY_R = 13
const SMILEY_GAP = 8     // vertical gap between smiley bottom and slot top
const SIDE_PAD = 16
const TOP_PAD = 14

// Total SVG dimensions
const totalSlotSpan = SLOT_COUNT * SLOT_W + (SLOT_COUNT - 1) * GAP_BETWEEN
const SVG_W = SIDE_PAD * 2 + totalSlotSpan
// top area = smiley diameter + gap, then slot, then some bottom padding
const SMILEY_CY = TOP_PAD + SMILEY_R
const SLOT_Y = SMILEY_CY + SMILEY_R + SMILEY_GAP
const SVG_H = SLOT_Y + SLOT_H + 14

// x-center of each slot
function slotCX(i: number): number {
  return SIDE_PAD + i * (SLOT_W + GAP_BETWEEN) + SLOT_W / 2
}

export default function Ordering25G2Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Lima kotak kosong berurutan dari terbesar ke terkecil, dipisahkan oleh tanda lebih besar. Kotak kedua ditandai dengan wajah senyum kuning."
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(340, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* Smiley above slot 1 (0-based) */}
        <SmileGlyph cx={slotCX(SMILEY_SLOT_INDEX)} cy={SMILEY_CY} r={SMILEY_R} />

        {/* Five ordering slots */}
        {Array.from({ length: SLOT_COUNT }, (_, i) => {
          const x = SIDE_PAD + i * (SLOT_W + GAP_BETWEEN)
          return (
            <rect
              key={i}
              x={x}
              y={SLOT_Y}
              width={SLOT_W}
              height={SLOT_H}
              rx={3}
              fill={SLOT_FILL}
              stroke={SLOT_STROKE}
              strokeWidth={2}
            />
          )
        })}

        {/* ">" separators between slots */}
        {Array.from({ length: SLOT_COUNT - 1 }, (_, i) => {
          const gx = SIDE_PAD + (i + 1) * SLOT_W + i * GAP_BETWEEN + GAP_BETWEEN / 2
          const gy = SLOT_Y + SLOT_H / 2
          return (
            <text
              key={i}
              x={gx}
              y={gy}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={16}
              fontWeight={700}
              fill={INK}
            >
              {'>'}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
