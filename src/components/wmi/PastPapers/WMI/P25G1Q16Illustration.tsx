// Hand-row figure for WMI-25P1A-Q16 (2025 Semifinal Grade 1 Paper A).
//
// "How many fingers on the LEFT hands are stretched out?"  Choices 12 / 8 / 11 /
//  16 / 13; answer = C (11).
//
// Reconstructed from db/seed/wmi/figures/2025-semifinal-g1-a-q16.jpg as a clean
// SVG redraw (the JPG is NOT embedded). The scan is a single row of NINE cartoon
// hands, palms toward the viewer, each with some fingers stretched and some
// folded, and each one either a LEFT or a RIGHT hand. The trick: only count the
// stretched fingers on the LEFT hands.
//
// Stretched-finger counts read from the scan, left to right:
//   1, 5, 0, 2, 4, 1, 3, 4, 2   (the thumb counts as a finger when open)
// The LEFT hands (highlighted by the explainer) are hands 2, 8 and 9:
//   5 + 4 + 2 = 11  (answer C).
//
// The static figure shows ONLY the problem (the nine hands, no left/right marks,
// no total). Picking out the left hands and adding their open fingers is the
// explainer's job, via the co-exported HandRow primitive (its `litHands` prop).
//
// Pure render, SSR-safe, deterministic — no window/document/random/dates.

const INK = '#9A5B43'
const SKIN = '#FBE3D4'
const SKIN_SHADE = '#F3CDB6'

/** Per-hand spec: how many fingers are stretched, whether the thumb is open, and
 *  which hand it is. `left` is used only by the explainer to highlight + tally. */
export interface HandSpec {
  /** Number of NON-thumb fingers stretched out (0..4). */
  fingers: number
  /** Is the thumb stretched out too? */
  thumb: boolean
  /** Mirror the drawing (thumb on the other side). */
  mirror: boolean
  /** True if this is a LEFT hand (the ones that get counted). */
  left: boolean
}

/** Total stretched (thumb + fingers) for one hand. */
export function handCount(h: HandSpec): number {
  return h.fingers + (h.thumb ? 1 : 0)
}

// The nine hands, left to right. Stretched totals: 1,5,0,2,4,1,3,4,2.
// Left hands: indices 1, 7, 8 -> 5 + 4 + 2 = 11.
export const HANDS: HandSpec[] = [
  { fingers: 1, thumb: false, mirror: false, left: false }, // 1
  { fingers: 4, thumb: true, mirror: true, left: true }, // 5  (LEFT)
  { fingers: 0, thumb: false, mirror: false, left: false }, // 0
  { fingers: 2, thumb: false, mirror: false, left: false }, // 2
  { fingers: 4, thumb: false, mirror: false, left: false }, // 4
  { fingers: 1, thumb: false, mirror: true, left: false }, // 1
  { fingers: 3, thumb: false, mirror: false, left: false }, // 3
  { fingers: 4, thumb: false, mirror: true, left: true }, // 4  (LEFT)
  { fingers: 2, thumb: false, mirror: true, left: true }, // 2  (LEFT)
]

export const LEFT_COUNTS = HANDS.filter((h) => h.left).map(handCount) // [5,4,2]
export const LEFT_TOTAL = LEFT_COUNTS.reduce((a, b) => a + b, 0) // 11

const HAND_W = 88
const HAND_H = 120
const GAP = 6

/** Finger x-offsets (relative to palm centre) for up to 4 fingers, longest middle. */
const FINGER_X = [-21, -7, 7, 21]
const FINGER_LEN = [30, 38, 36, 28]

/**
 * One cartoon hand, palm toward the viewer. Stretched fingers point up; folded
 * fingers are short stubs on the palm. The thumb sits to one side (flipped by
 * `mirror`). When `lit`, the palm tints to mark it as a counted (left) hand.
 */
export function Hand({ spec, lit = false, x = 0 }: { spec: HandSpec; lit?: boolean; x?: number }) {
  const cx = x + HAND_W / 2
  const palmY = 78
  const dir = spec.mirror ? -1 : 1
  const palmFill = lit ? '#FFE7B3' : SKIN
  const palmStroke = lit ? '#E08A00' : INK

  return (
    <g>
      {/* fingers (4 slots): stretched = tall rounded bar, folded = short stub */}
      {FINGER_X.map((fx, i) => {
        const stretched = i < spec.fingers
        const px = cx + fx
        const len = stretched ? FINGER_LEN[i] : 12
        const top = palmY - 16 - len
        return (
          <rect
            key={`f${i}`}
            x={px - 7}
            y={top}
            width={14}
            height={len + 22}
            rx={7}
            fill={lit ? '#FFE7B3' : SKIN}
            stroke={palmStroke}
            strokeWidth={2}
          />
        )
      })}

      {/* palm */}
      <rect x={cx - 30} y={palmY - 20} width={60} height={52} rx={16} fill={palmFill} stroke={palmStroke} strokeWidth={2.4} />

      {/* thumb: a stub or an out-stretched bump on one side */}
      {spec.thumb ? (
        <ellipse
          cx={cx + dir * 36}
          cy={palmY + 2}
          rx={16}
          ry={10}
          fill={palmFill}
          stroke={palmStroke}
          strokeWidth={2.2}
          transform={`rotate(${dir * -35} ${cx + dir * 36} ${palmY + 2})`}
        />
      ) : (
        <ellipse
          cx={cx + dir * 30}
          cy={palmY + 14}
          rx={11}
          ry={8}
          fill={palmFill}
          stroke={palmStroke}
          strokeWidth={2.2}
          transform={`rotate(${dir * 20} ${cx + dir * 30} ${palmY + 14})`}
        />
      )}

      {/* palm crease (the "7" line) to give the palm-facing read */}
      <path
        d={`M ${cx - dir * 14} ${palmY + 2} L ${cx + dir * 14} ${palmY + 2} L ${cx + dir * 4} ${palmY + 22}`}
        fill="none"
        stroke={SKIN_SHADE}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  )
}

export interface HandRowProps {
  /** When set, only these hand indices are highlighted (left hands being counted). */
  litHands?: number[]
}

/**
 * The full row of nine hands. At its defaults (no highlights) it is the pristine
 * question figure — all nine hands, no left/right marks, no total. The explainer
 * passes `litHands` to glow the left hands while it adds their stretched fingers.
 */
export function HandRow({ litHands }: HandRowProps) {
  const totalW = HANDS.length * HAND_W + (HANDS.length - 1) * GAP
  const lit = new Set(litHands ?? [])
  return (
    <svg
      viewBox={`0 0 ${totalW} ${HAND_H}`}
      width="100%"
      style={{ maxWidth: 760, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {HANDS.map((spec, i) => (
        <g key={i} opacity={litHands && !lit.has(i) ? 0.4 : 1}>
          <Hand spec={spec} lit={lit.has(i)} x={i * (HAND_W + GAP)} />
        </g>
      ))}
    </svg>
  )
}

export default function P25G1Q16Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A row of nine cartoon hands, palms facing out. Each shows some fingers stretched and some folded; some are left hands and some are right hands. No total is shown."
    >
      <HandRow />
    </div>
  )
}
