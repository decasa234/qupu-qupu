// Sum-pyramid figure for WMI-24P2A-Q20 (2024 Grade-2 Semifinal, Paper A).
//
// Reconstructed from db/seed/wmi/figures/2024-semifinal-g2-a-q20.jpg: a small
// two-row sum-pyramid. FOUR empty bottom squares sit side by side; above each
// ADJACENT PAIR of bottom squares is a top number, joined by two short slanted
// legs (a /\ over each pair). Reading left to right the three top numbers are
//   15   12   13
// and each top number is the sum of the two bottom squares it caps.
//
// Problem (NOT shown by the static figure): every bottom square holds a DIFFERENT
// one-digit number; reading the bottom squares left to right as a 4-digit number,
// make it as LARGE as possible, then report the units digit.
//
// Deterministic solution (verified, hardcoded for the explainer):
//   a+b=15, b+c=12, c+d=13, all four different 1-digit.
//   a=9 -> b=6, c=6 (repeats b)            X
//   a=8 -> b=7, c=5, d=8 (d repeats a)     X
//   a=7 -> b=8, c=4, d=9  -> {7,8,4,9}     OK  -> 7849, units digit 9 -> answer E
export const TOP_SUMS = [15, 12, 13] as const
export const BOTTOM_MAX = [7, 8, 4, 9] as const // largest valid bottom row
export const UNITS_DIGIT = BOTTOM_MAX[BOTTOM_MAX.length - 1] // 9

const INK = '#1F2937'
const BOX_FILL = '#FFFFFF'
const BOX_STROKE = '#374151'
const ACTIVE_FILL = '#D1FAE5'
const ACTIVE_STROKE = '#10B981'
const TOP_INK = '#30598A'

export const Q20_VIEW_W = 360
export const Q20_VIEW_H = 210

// Bottom-square geometry.
const BOX = 56
const BOX_GAP = 14
const BOTTOM_Y = 122 // top edge of the bottom row
const N_BOTTOM = 4

const ROW_W = N_BOTTOM * BOX + (N_BOTTOM - 1) * BOX_GAP
const ROW_X0 = (Q20_VIEW_W - ROW_W) / 2 // left edge of the bottom row

/** Centre x of bottom square i (0..3). */
function bottomCx(i: number) {
  return ROW_X0 + i * (BOX + BOX_GAP) + BOX / 2
}

// Top-number positions: each caps the pair (i, i+1).
const TOP_Y = 40 // baseline-ish centre for the top numbers
const LEG_TOP_Y = 58 // where the legs start (just under the number)

export interface Q20PyramidProps {
  /** Values to write into the four bottom squares (index 0..3); undefined = blank. */
  bottom?: Array<number | undefined>
  /** Bottom-square indices to tint green (the cells the current beat reasons about). */
  activeBottom?: number[]
  /** Top-sum indices (0..2) to tint green. */
  activeTop?: number[]
}

/** Reusable sum-pyramid primitive — shared by the illustration and the explainer. */
export function Q20Pyramid({ bottom = [], activeBottom = [], activeTop = [] }: Q20PyramidProps) {
  const aB = new Set(activeBottom)
  const aT = new Set(activeTop)
  return (
    <svg
      viewBox={`0 0 ${Q20_VIEW_W} ${Q20_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 380, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* legs: each top number drops two slanted lines onto the pair below it */}
      {TOP_SUMS.map((_, p) => {
        const tx = (bottomCx(p) + bottomCx(p + 1)) / 2
        const leftX = bottomCx(p)
        const rightX = bottomCx(p + 1)
        const active = aT.has(p)
        const col = active ? ACTIVE_STROKE : BOX_STROKE
        return (
          <g key={`leg${p}`}>
            <line x1={tx} y1={LEG_TOP_Y} x2={leftX} y2={BOTTOM_Y - 4} stroke={col} strokeWidth={active ? 2.6 : 2} />
            <line x1={tx} y1={LEG_TOP_Y} x2={rightX} y2={BOTTOM_Y - 4} stroke={col} strokeWidth={active ? 2.6 : 2} />
          </g>
        )
      })}

      {/* top numbers (the given sums) */}
      {TOP_SUMS.map((s, p) => {
        const tx = (bottomCx(p) + bottomCx(p + 1)) / 2
        const active = aT.has(p)
        return (
          <text
            key={`top${p}`}
            x={tx}
            y={TOP_Y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={26}
            fontWeight={900}
            fill={active ? '#047857' : TOP_INK}
          >
            {s}
          </text>
        )
      })}

      {/* bottom squares */}
      {Array.from({ length: N_BOTTOM }, (_, i) => {
        const cx = bottomCx(i)
        const active = aB.has(i)
        const v = bottom[i]
        return (
          <g key={`box${i}`}>
            <rect
              x={cx - BOX / 2}
              y={BOTTOM_Y}
              width={BOX}
              height={BOX}
              rx={6}
              fill={active ? ACTIVE_FILL : BOX_FILL}
              stroke={active ? ACTIVE_STROKE : BOX_STROKE}
              strokeWidth={active ? 3 : 2.4}
            />
            {v !== undefined && (
              <text
                x={cx}
                y={BOTTOM_Y + BOX / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={28}
                fontWeight={900}
                fill={active ? '#047857' : INK}
              >
                {v}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function P24G2Q20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A two-row sum pyramid: four empty bottom squares, and above each pair of neighbouring squares a top number that is their sum — 15, 12 and 13 from left to right. Fill the squares with different one-digit numbers to make the largest four-digit number read along the bottom."
    >
      <Q20Pyramid />
    </div>
  )
}
