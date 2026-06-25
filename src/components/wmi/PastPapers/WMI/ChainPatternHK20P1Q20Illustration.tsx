// HKIMO-20-P1H-Q20 — "According to the pattern shown below, what is the figure
// in the space provided?"
//
// Stem figure: wavy horizontal chain of circles in a 3-bead repeating cycle:
//   large-open (○), large-filled (●), small-open (○̃)
// 16 beads total; blank at index 8 (position 9).
// 8 % 3 = 2 → cycle[2] = 'S' → answer: small circle.
//
// Adapted from ChainPattern19HK1Q20Illustration (2019 HKIMO P1 Q20 — same
// competition / question number, different cycle type and wavy layout).
// No Math.random, no Date — SSR-safe & deterministic.

// ---------------------------------------------------------------------------
// Types & cycle
// ---------------------------------------------------------------------------

export type BeadKind = 'LO' | 'LB' | 'S' | 'BLANK'

/** The repeating 3-bead cycle: large-open, large-black, small-open. */
export const CHAIN_CYCLE: ('LO' | 'LB' | 'S')[] = ['LO', 'LB', 'S']

const BLANK_IDX = 8   // 8 % 3 === 2 → 'S'  ✓
const N = 16

/** 16-bead sequence; index 8 is the blank. */
export const CHAIN_BEADS: BeadKind[] = Array.from({ length: N }, (_, i) =>
  i === BLANK_IDX ? 'BLANK' : CHAIN_CYCLE[i % 3],
)

/** The shape that fills the blank — "small circle". */
export const BLANK_ANSWER: 'S' = 'S'

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

const BEAD_R_LG = 10    // radius of large beads (LO / LB)
const BEAD_R_SM = 5     // radius of small beads (S)
const STEP_X    = 26    // horizontal centre-to-centre spacing
const PAD_X     = 14    // left/right padding
const SVG_H     = 64
const CY        = 32    // vertical centre of the SVG
const AMP       = 12    // wave amplitude (±px from CY)
const WAVE_P    = 4     // wave period in beads (one full oscillation every 4)

export const SVG_W = PAD_X * 2 + (N - 1) * STEP_X + BEAD_R_LG * 2

// ---------------------------------------------------------------------------
// Colours
// ---------------------------------------------------------------------------

export const BEAD_WHITE  = '#FFFFFF'
export const BEAD_BLACK  = '#1F2937'
export const BEAD_STROKE = '#374151'
export const DASHED_COLOR = '#6B7280'

// ---------------------------------------------------------------------------
// Geometry helpers (exported for explainer)
// ---------------------------------------------------------------------------

export function beadCx(i: number): number {
  return PAD_X + BEAD_R_LG + i * STEP_X
}

export function beadCy(i: number): number {
  return CY + AMP * Math.sin((2 * Math.PI * i) / WAVE_P)
}

export function beadR(kind: 'LO' | 'LB' | 'S'): number {
  return kind === 'S' ? BEAD_R_SM : BEAD_R_LG
}

// ---------------------------------------------------------------------------
// Single bead component
// ---------------------------------------------------------------------------

export function ChainBead20({
  kind,
  cx,
  cy,
  opacity = 1,
  strokeWidth = 2,
}: {
  kind: 'LO' | 'LB' | 'S'
  cx: number
  cy: number
  opacity?: number
  strokeWidth?: number
}) {
  const r = beadR(kind)
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill={kind === 'LB' ? BEAD_BLACK : BEAD_WHITE}
      stroke={BEAD_STROKE}
      strokeWidth={strokeWidth}
      opacity={opacity}
    />
  )
}

// ---------------------------------------------------------------------------
// Illustration (stem — never shows the answer)
// ---------------------------------------------------------------------------

export default function ChainPatternHK20P1Q20Illustration({
  revealAnswer = false,
}: {
  revealAnswer?: boolean
}) {
  const wavePts = Array.from({ length: N }, (_, i) => `${beadCx(i)},${beadCy(i)}`).join(' ')
  const box = BEAD_R_LG + 2

  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        revealAnswer
          ? 'Wavy chain pattern: large-open, large-filled, small-open repeating. The blank is a small open circle.'
          : 'Wavy chain pattern with a blank space — determine the missing shape.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* Wavy connecting rope */}
        <polyline
          points={wavePts}
          fill="none"
          stroke={DASHED_COLOR}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Beads */}
        {CHAIN_BEADS.map((kind, i) => {
          const cx = beadCx(i)
          const cy = beadCy(i)

          if (kind === 'BLANK') {
            if (revealAnswer) {
              return (
                <g key={i}>
                  <rect
                    x={cx - box}
                    y={cy - box}
                    width={box * 2}
                    height={box * 2}
                    rx={3}
                    fill="#D1FAE5"
                    stroke="#10B981"
                    strokeWidth={2}
                  />
                  <ChainBead20 kind="S" cx={cx} cy={cy} />
                </g>
              )
            }
            return (
              <rect
                key={i}
                x={cx - box}
                y={cy - box}
                width={box * 2}
                height={box * 2}
                rx={3}
                fill="none"
                stroke={DASHED_COLOR}
                strokeWidth={2}
                strokeDasharray="4 3"
              />
            )
          }

          return <ChainBead20 key={i} kind={kind} cx={cx} cy={cy} />
        })}
      </svg>
    </div>
  )
}
