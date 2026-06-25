// HKIMO-24-P1H-Q19 — "According to the pattern shown below, what is the figure
// in the space provided?"
//
// The stem shows a horizontal bead chain with TWO bead sizes:
//   ● = large filled black bead (R=13)
//   ○ = small outlined white bead (R=9)
//
// Repeating unit (4 beads): ● ● ○ ○  (B B W W)
//
// Chain (18 slots, blank at index 9):
//   B B W W  B B W W  B [null]  W W B B  W W B B
//   0 1 2 3  4 5 6 7  8   9   10 11 12 13 14 15 16 17
//
// Blank = 10th bead (1-indexed). 10 ÷ 4 = 2 remainder 2 → 2nd in ●●○○ = ●
// Answer: ● (B — large black bead)
//
// Adapted from PatternChainHK18P1Q20Illustration (same structure, B-B-W-W cycle,
// two bead radii for faithful size distinction).
// No Math.random, no Date. SSR-safe.

// ─── Types & constants ───────────────────────────────────────────────────────

export type BeadType = 'B' | 'W'   // B = big black, W = small white

/** The 4-bead repeating unit. */
export const CYCLE: BeadType[] = ['B', 'B', 'W', 'W']

/**
 * Full 18-slot chain. null = blank to fill.
 * CHAIN[9] = null; 9 % 4 = 1 → CYCLE[1] = 'B' = ● (answer).
 */
export const CHAIN: (BeadType | null)[] = [
  'B', 'B', 'W', 'W',
  'B', 'B', 'W', 'W',
  'B', null,
  'W', 'W', 'B', 'B',
  'W', 'W', 'B', 'B',
]

export const BLANK_INDEX = 9
export const ANSWER: BeadType = 'B'

// ─── Layout ──────────────────────────────────────────────────────────────────

const R_BIG = 13   // radius of large black beads
const R_SML = 9    // radius of small white beads
const GAP   = 6    // pixel gap between adjacent bead edges
const HOOK  = 20   // horizontal space for end hooks
export const CY = 38   // vertical centre of bead row

/** Radius for a given bead type (null → use ANSWER radius for blank). */
export function beadR(type: BeadType | null): number {
  const t = type ?? ANSWER
  return t === 'B' ? R_BIG : R_SML
}

/** Pre-computed centre-x for each slot (cumulative, accounts for varying radii). */
const _CX: number[] = (() => {
  const list: number[] = []
  const seq = CHAIN.map((t) => t ?? ANSWER)   // treat blank as its answer type for layout
  let cx = HOOK + beadR(seq[0])
  list.push(cx)
  for (let i = 1; i < seq.length; i++) {
    cx += beadR(seq[i - 1]) + GAP + beadR(seq[i])
    list.push(cx)
  }
  return list
})()

export function beadCx(i: number): number { return _CX[i] }

const SVG_W = _CX[CHAIN.length - 1] + beadR(CHAIN[CHAIN.length - 1]) + HOOK
const SVG_H = 76

// ─── Colours ─────────────────────────────────────────────────────────────────

const C_BLACK  = '#1F2937'
const C_WHITE  = '#FFFFFF'
const C_STROKE = '#374151'
const C_WIRE   = '#6B7280'

// ─── Sub-component ───────────────────────────────────────────────────────────

export function BeadCircle({
  type,
  cx,
  cy,
  r,
  strokeWidth = 2,
  opacity = 1,
  strokeColor = C_STROKE,
}: {
  type: BeadType
  cx: number
  cy: number
  r?: number
  strokeWidth?: number
  opacity?: number
  strokeColor?: string
}) {
  const rr = r ?? beadR(type)
  return (
    <circle
      cx={cx}
      cy={cy}
      r={rr}
      fill={type === 'B' ? C_BLACK : C_WHITE}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      opacity={opacity}
    />
  )
}

// ─── Main illustration ────────────────────────────────────────────────────────

export default function BeadChainHK24P1Q19Illustration() {
  const x0  = beadCx(0)
  const x17 = beadCx(CHAIN.length - 1)

  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A horizontal bead chain: large filled black beads and small outlined white beads repeat in a ●●○○ pattern. A dashed box marks the missing bead."
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* Wire / chain string */}
        <line
          x1={x0 - beadR(CHAIN[0])}
          y1={CY}
          x2={x17 + beadR(CHAIN[CHAIN.length - 1])}
          y2={CY}
          stroke={C_WIRE}
          strokeWidth={2}
        />

        {/* Left end hook */}
        <path
          d={`M ${x0 - beadR(CHAIN[0])} ${CY} C ${x0 - beadR(CHAIN[0]) - 12} ${CY} ${x0 - beadR(CHAIN[0]) - 18} ${CY - 14} ${x0 - beadR(CHAIN[0]) - 14} ${CY - 22}`}
          fill="none"
          stroke={C_WIRE}
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* Right end hook */}
        <path
          d={`M ${x17 + beadR(CHAIN[CHAIN.length - 1])} ${CY} C ${x17 + beadR(CHAIN[CHAIN.length - 1]) + 12} ${CY} ${x17 + beadR(CHAIN[CHAIN.length - 1]) + 18} ${CY - 14} ${x17 + beadR(CHAIN[CHAIN.length - 1]) + 14} ${CY - 22}`}
          fill="none"
          stroke={C_WIRE}
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* Beads */}
        {CHAIN.map((type, i) => {
          const cx = beadCx(i)
          const r  = beadR(type)
          if (type === null) {
            return (
              <rect
                key={i}
                x={cx - r - 2}
                y={CY - r - 2}
                width={(r + 2) * 2}
                height={(r + 2) * 2}
                rx={4}
                fill="none"
                stroke={C_STROKE}
                strokeWidth={1.8}
                strokeDasharray="4 3"
              />
            )
          }
          return <BeadCircle key={i} type={type} cx={cx} cy={CY} />
        })}
      </svg>
    </div>
  )
}
