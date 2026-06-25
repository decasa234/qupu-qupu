// HKIMO-18-P1H-Q20 — "According to the pattern shown below, what is the figure
// in the space provided?"
//
// The stem shows a horizontal bead chain with a repeating ○○●● pattern
// and a dashed blank slot at position 9 (0-indexed).
//
// Chain (14 slots, blank at index 9):
//   W W B B  W W B B  W [null] B B W W
//   0 1 2 3  4 5 6 7  8   9   10 11 12 13
//
// Answer: ○ (W) — index 9 is the 2nd bead in the 4-bead cycle → W
//
// No Math.random, no Date. SSR-safe.

// ─── Bead constants ──────────────────────────────────────────────────────────

export type BeadType = 'W' | 'B'   // W = open/white, B = filled/black

/** The 4-bead repeating unit. */
export const CYCLE: BeadType[] = ['W', 'W', 'B', 'B']

/**
 * Full 14-slot chain. null = blank to fill.
 * Verified: CHAIN[9] = null; index 9 % 4 = 1 → CYCLE[1] = 'W' = ○ (answer).
 */
export const CHAIN: (BeadType | null)[] = [
  'W', 'W', 'B', 'B',
  'W', 'W', 'B', 'B',
  'W', null,
  'B', 'B', 'W', 'W',
]

export const BLANK_INDEX = 9
export const ANSWER: BeadType = 'W'

// ─── Layout ──────────────────────────────────────────────────────────────────

const R    = 12   // bead radius
const GAP  = 8    // gap between bead edges
const CELL = 2 * R + GAP   // center-to-center distance = 32
const HOOK = 20   // space for end hooks
const CY   = 38   // vertical center of bead row

const SVG_W = HOOK + R + (CHAIN.length - 1) * CELL + R + HOOK  // 480
const SVG_H = 76

/** X-center of bead at slot index i. */
export function beadCx(i: number): number {
  return HOOK + R + i * CELL
}

const C_WHITE  = '#FFFFFF'
const C_BLACK  = '#1F2937'
const C_STROKE = '#374151'
const C_WIRE   = '#6B7280'

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Filled bead circle at (cx, cy). */
export function BeadCircle({
  type,
  cx,
  cy,
  r = R,
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
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill={type === 'W' ? C_WHITE : C_BLACK}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      opacity={opacity}
    />
  )
}

// ─── Main illustration ────────────────────────────────────────────────────────

export default function PatternChainHK18P1Q20Illustration() {
  const x0 = beadCx(0)
  const x13 = beadCx(CHAIN.length - 1)

  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A horizontal bead chain repeating the pattern: open, open, filled, filled — a dashed box marks the missing bead."
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* Wire / chain string */}
        <line
          x1={x0 - R}
          y1={CY}
          x2={x13 + R}
          y2={CY}
          stroke={C_WIRE}
          strokeWidth={2}
        />

        {/* Left end hook */}
        <path
          d={`M ${x0 - R} ${CY} C ${x0 - R - 12} ${CY} ${x0 - R - 18} ${CY - 14} ${x0 - R - 14} ${CY - 22}`}
          fill="none"
          stroke={C_WIRE}
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* Right end hook */}
        <path
          d={`M ${x13 + R} ${CY} C ${x13 + R + 12} ${CY} ${x13 + R + 18} ${CY - 14} ${x13 + R + 14} ${CY - 22}`}
          fill="none"
          stroke={C_WIRE}
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* Beads */}
        {CHAIN.map((type, i) => {
          const cx = beadCx(i)
          if (type === null) {
            // Dashed blank slot
            return (
              <rect
                key={i}
                x={cx - R - 2}
                y={CY - R - 2}
                width={(R + 2) * 2}
                height={(R + 2) * 2}
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
