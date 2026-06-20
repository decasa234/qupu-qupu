// IKMC-19-PE-Q7 — "Jorge pairs his socks so that the numbers match.
//                  How many pairs can he make?"
//
// Reconstructed from docs/reference/ocr-res/ikmc/contest/preecolier/2019.imgs/012.jpg:
// 12 teal socks scattered in a pile, each carrying one number:
//   top row:    5  2  1  8  7  3
//   bottom row: 1  3  7  2  6  5
// Pairs: (1,1) (2,2) (3,3) (5,5) (7,7) → 5 pairs. Singletons: 8, 6.
//
// PROBLEM ONLY: shows all 12 socks with numbers — does NOT highlight any pair,
// does NOT reveal the count 5.
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

export const SVG_W = 380
export const SVG_H = 200

/** Sock fill colour (matching the teal in the source scan). */
export const SOCK_FILL = '#00BCD4'
export const SOCK_STROKE = '#0097A7'
export const SOCK_INK = '#004D5C'

/** Layout: 6 socks per row, two rows. */
export const SOCK_NUMBERS_TOP = [5, 2, 1, 8, 7, 3] as const
export const SOCK_NUMBERS_BOT = [1, 3, 7, 2, 6, 5] as const

// Slight rotation offsets (degrees) per slot — deterministic "tumbled" feel.
const ROTATIONS_TOP = [-18, 12, 25, -8, 15, -22]
const ROTATIONS_BOT = [20, -14, -6, 18, -20, 10]

const COL_COUNT = 6
const ROW_GAP = 92
const TOP_Y = 42
const LEFT_X = 28
const COL_STEP = (SVG_W - LEFT_X * 2) / (COL_COUNT - 1)

// ── Sock primitive ─────────────────────────────────────────────────────────────
//
// A simple ankle-sock silhouette drawn in path units (fits in a ~46×60 box).
// Origin is the centre-top of the leg tube.

const SOCK_SCALE = 0.68

/**
 * One sock, centred at (cx, cy), rotated `deg` degrees.
 * The number is printed in the leg area of the sock.
 */
export function SockShape({
  cx,
  cy,
  deg,
  num,
  fill = SOCK_FILL,
  stroke = SOCK_STROKE,
  ink = SOCK_INK,
  numSize = 16,
  paired = false,
}: {
  cx: number
  cy: number
  deg: number
  num: number
  fill?: string
  stroke?: string
  ink?: string
  numSize?: number
  paired?: boolean
}) {
  // Sock outline (path in a local coordinate system centred at 0,0):
  // The leg tube goes from y=-28 to y=+10 (width 20 px).
  // At y=+10 it bends right 90° into a foot tube (length 34 px).
  // Heel is a rounded corner at the bend.
  // Toe cap closes the foot.
  const s = SOCK_SCALE
  const lw = 20 * s  // leg half-width
  const fh = 14 * s  // foot tube half-height
  const fl = 36 * s  // foot tube length
  const lt = 38 * s  // leg tube length (above bend)
  const hr = 9 * s   // heel curve radius

  // Leg: rect from (-lw, -lt) to (+lw, 0)
  // Heel: round from (+lw, 0) curving down-right to (lw+hr, hr)
  // Foot: extends right to (lw+fl, hr), with top/bottom closing arcs
  const legT = -lt
  const ankleY = 0
  const heelX = lw
  const heelY = fh
  const footR = lw + fl

  const d = [
    `M ${-lw},${legT}`,
    `L ${-lw},${ankleY}`,
    // inner heel curve (bottom-left of bend)
    `Q ${-lw},${heelY + hr} ${-lw + hr},${heelY + hr * 2}`,
    // sole going right
    `L ${footR - hr},${heelY + hr * 2}`,
    // toe cap
    `Q ${footR + hr},${heelY + hr * 2} ${footR + hr},${heelY}`,
    `Q ${footR + hr},${heelY - fh} ${footR - hr * 0.5},${heelY - fh}`,
    // top of foot going left
    `L ${heelX + hr},${heelY - fh}`,
    // outer heel curve (top-right of bend)
    `Q ${heelX},${heelY - fh} ${heelX},${ankleY}`,
    `L ${heelX},${legT}`,
    'Z',
  ].join(' ')

  return (
    <g transform={`translate(${cx},${cy}) rotate(${deg})`}>
      {/* highlight ring when paired */}
      {paired && (
        <ellipse
          cx={0}
          cy={-lt * 0.3}
          rx={lw + 8}
          ry={lt * 0.5 + 6}
          fill="#FFF176"
          opacity={0.6}
        />
      )}
      <path
        d={d}
        fill={fill}
        stroke={stroke}
        strokeWidth={paired ? 2.5 : 1.8}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Number in the upper leg area */}
      <text
        x={0}
        y={-lt * 0.52}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={numSize}
        fontWeight={900}
        fill={ink}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {num}
      </text>
    </g>
  )
}

// ── SockPile primitive ─────────────────────────────────────────────────────────

export interface SockPileProps {
  /** Set of numbers whose socks should be highlighted (used by explainer). */
  litNumbers?: Set<number>
}

/**
 * All 12 socks arranged in 2 rows, scattered with slight rotations.
 * Export this so the explainer can reuse the same layout.
 */
export function SockPile({ litNumbers }: SockPileProps = {}) {
  const lit = litNumbers ?? new Set<number>()
  return (
    <>
      {SOCK_NUMBERS_TOP.map((num, i) => {
        const cx = LEFT_X + i * COL_STEP
        const cy = TOP_Y
        const isPaired = lit.has(num)
        return (
          <SockShape
            key={`t${i}`}
            cx={cx}
            cy={cy}
            deg={ROTATIONS_TOP[i]}
            num={num}
            fill={isPaired ? '#E0F7FA' : SOCK_FILL}
            stroke={isPaired ? '#00838F' : SOCK_STROKE}
            ink={isPaired ? '#004D5C' : SOCK_INK}
            numSize={16}
            paired={isPaired}
          />
        )
      })}
      {SOCK_NUMBERS_BOT.map((num, i) => {
        const cx = LEFT_X + i * COL_STEP
        const cy = TOP_Y + ROW_GAP
        const isPaired = lit.has(num)
        return (
          <SockShape
            key={`b${i}`}
            cx={cx}
            cy={cy}
            deg={ROTATIONS_BOT[i]}
            num={num}
            fill={isPaired ? '#E0F7FA' : SOCK_FILL}
            stroke={isPaired ? '#00838F' : SOCK_STROKE}
            ink={isPaired ? '#004D5C' : SOCK_INK}
            numSize={16}
            paired={isPaired}
          />
        )
      })}
    </>
  )
}

// ── Default export ─────────────────────────────────────────────────────────────

/**
 * Socks7Illustration
 *
 * Static problem figure for IKMC-19-PE-Q7.
 * Shows 12 numbered socks in a pile — the student must find the matching pairs.
 * Does NOT reveal which socks match or the answer (5).
 */
export default function Socks7Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Twelve numbered socks scattered in a pile. ' +
        'Numbers shown: 5, 2, 1, 8, 7, 3 (top row) and 1, 3, 7, 2, 6, 5 (bottom row). ' +
        'Jorge pairs socks with matching numbers. How many pairs can he make?'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ maxWidth: SVG_W, display: 'block' }}
        aria-hidden="true"
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />
        <SockPile />
      </svg>
    </div>
  )
}
