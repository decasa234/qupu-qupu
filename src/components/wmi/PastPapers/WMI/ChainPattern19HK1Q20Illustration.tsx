// HKIMO-19-P1H-Q20 — "According to the pattern shown below, what is the figure
// in the space provided?"
//
// The stem shows a horizontal chain of open (○) and filled (●) circles.
// Repeating unit (6 beads): ○ ○ ○ ● ● ●
// 17 beads total visible; blank at position 14 (0-based index 13).
// Answer: ○ (open circle).
//
// Faithful to 2019.imgs/006.jpg: linear necklace chain, dashed-box blank.
// No Math.random, no Date — SSR-safe & deterministic.

// ---------------------------------------------------------------------------
// Bead colours (adapted from Necklace3Illustration)
// ---------------------------------------------------------------------------
export const BEAD_WHITE  = '#FFFFFF'
export const BEAD_BLACK  = '#1F2937'
export const BEAD_STROKE = '#374151'
export const DASHED_COLOR = '#6B7280'

export type BeadKind = 'W' | 'B' | 'BLANK'

export const COLOR_MAP: Record<'W' | 'B', string> = {
  W: BEAD_WHITE,
  B: BEAD_BLACK,
}

// ---------------------------------------------------------------------------
// Chain data — 17 beads, cycle ○○○●●●, blank at index 13 (pos 14)
// ---------------------------------------------------------------------------

/** One repeating unit of the chain. */
export const CHAIN_CYCLE: BeadKind[] = ['W', 'W', 'W', 'B', 'B', 'B']

/**
 * Full 17-bead sequence (left-to-right), starting at cycle position 0.
 * Index 13 (position 14) is the blank to be filled.
 */
export const CHAIN_BEADS: BeadKind[] = Array.from({ length: 17 }, (_, i) =>
  i === 13 ? 'BLANK' : CHAIN_CYCLE[i % CHAIN_CYCLE.length],
)

/** The answer bead (what fills the blank). */
export const BLANK_ANSWER: 'W' = 'W'

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------
const BEAD_R   = 10
const SPACING  = 28   // centre-to-centre
const PAD_X    = 14
const PAD_Y    = 16
const N        = CHAIN_BEADS.length   // 17
const SVG_W    = PAD_X * 2 + (N - 1) * SPACING + BEAD_R * 2
const SVG_H    = PAD_Y * 2 + BEAD_R * 2
const CY       = SVG_H / 2

export function beadCx(i: number): number {
  return PAD_X + BEAD_R + i * SPACING
}

// ---------------------------------------------------------------------------
// Single bead glyph
// ---------------------------------------------------------------------------
export function ChainBead({
  kind,
  cx,
  cy = CY,
  r = BEAD_R,
  strokeWidth = 2,
  opacity = 1,
}: {
  kind: 'W' | 'B'
  cx: number
  cy?: number
  r?: number
  strokeWidth?: number
  opacity?: number
}) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill={COLOR_MAP[kind]}
      stroke={BEAD_STROKE}
      strokeWidth={strokeWidth}
      opacity={opacity}
    />
  )
}

// ---------------------------------------------------------------------------
// Illustration — the stem (shows the chain with the blank box)
// ---------------------------------------------------------------------------

export default function ChainPattern19HK1Q20Illustration({
  revealAnswer = false,
}: {
  revealAnswer?: boolean
}) {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        revealAnswer
          ? 'Chain pattern: three open circles, three filled circles repeating. The blank is an open circle.'
          : 'Chain pattern with a blank space — determine the missing shape.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* Connecting line behind beads */}
        <line
          x1={PAD_X + BEAD_R}
          y1={CY}
          x2={PAD_X + BEAD_R + (N - 1) * SPACING}
          y2={CY}
          stroke={DASHED_COLOR}
          strokeWidth={2}
        />

        {/* Beads */}
        {CHAIN_BEADS.map((kind, i) => {
          const cx = beadCx(i)
          if (kind === 'BLANK') {
            if (revealAnswer) {
              // Show the answer bead
              return (
                <g key={i}>
                  <rect
                    x={cx - BEAD_R - 2}
                    y={CY - BEAD_R - 2}
                    width={(BEAD_R + 2) * 2}
                    height={(BEAD_R + 2) * 2}
                    rx={3}
                    fill="#D1FAE5"
                    stroke="#10B981"
                    strokeWidth={2}
                    strokeDasharray="none"
                  />
                  <ChainBead kind={BLANK_ANSWER} cx={cx} />
                </g>
              )
            }
            // Show dashed blank box
            return (
              <rect
                key={i}
                x={cx - BEAD_R - 2}
                y={CY - BEAD_R - 2}
                width={(BEAD_R + 2) * 2}
                height={(BEAD_R + 2) * 2}
                rx={3}
                fill="none"
                stroke={DASHED_COLOR}
                strokeWidth={2}
                strokeDasharray="4 3"
              />
            )
          }
          return <ChainBead key={i} kind={kind} cx={cx} />
        })}
      </svg>
    </div>
  )
}
