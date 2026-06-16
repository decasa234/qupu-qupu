// WMI-23P2A-Q4 (2023 Semifinal Grade 2, Paper A) — house-number range.
//
// Figure (db/seed/wmi/figures/2023-semifinal-g2-a-q4.jpg): a little house with a
// yellow body, a green gable roof + chimney, and a white number plate ("373").
// The paper draws nine such houses, one per number. The crop only captured one,
// so the nine are redrawn here in the same style on a 3×3 layout.
//
// Stem: landlord Jerry visits houses whose number is > 150 AND < 449.
// Numbers: 373, 441, 405, 210, 686, 133, 299, 178, 534.
//   in range (150,449): 373, 441, 405, 210, 299, 178  → 6 houses
//   out: 686 (too big), 133 (too small), 534 (too big)
// Answer D (6).
export const HOUSE_NUMBERS = [373, 441, 405, 210, 686, 133, 299, 178, 534] as const
export const LOW = 150
export const HIGH = 449
export const inRange = (n: number) => n > LOW && n < HIGH
export const VISIT_COUNT = HOUSE_NUMBERS.filter(inRange).length // 6

const BODY = '#F4CE3A'
const BODY_EDGE = '#C99A12'
const ROOF = '#5FA83C'
const ROOF_EDGE = '#3F7A26'
const ROOF_DARK = '#4A8A2E'
const PLATE = '#FFFFFF'
const PLATE_EDGE = '#3F7A26'
const INK = '#27331C'

export type HouseState = 'plain' | 'visit' | 'skip'

/**
 * One house icon with its number on a white plate, top-left corner at (x, y).
 * `state` tints the plate: a green check ring for visited, a faded grey for skipped.
 */
export function House({ x, y, n, state = 'plain' }: { x: number; y: number; n: number; state?: HouseState }) {
  const w = 132
  const bodyY = y + 58
  const bodyH = 86
  const dim = state === 'skip'
  return (
    <g opacity={dim ? 0.45 : 1}>
      {/* chimney (behind roof) */}
      <rect x={x + 92} y={y + 12} width={18} height={34} fill={ROOF_DARK} stroke={ROOF_EDGE} strokeWidth={2} />
      {/* roof gable */}
      <polygon
        points={`${x + 8},${bodyY} ${x + w - 8},${bodyY} ${x + w / 2},${y + 14}`}
        fill={ROOF}
        stroke={ROOF_EDGE}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {/* roof shading on the right half */}
      <polygon points={`${x + w / 2},${y + 14} ${x + w - 8},${bodyY} ${x + w / 2},${bodyY}`} fill={ROOF_DARK} opacity={0.55} />
      {/* body */}
      <rect x={x + 18} y={bodyY} width={w - 36} height={bodyH} fill={BODY} stroke={BODY_EDGE} strokeWidth={3} />
      {/* number plate */}
      <rect x={x + 34} y={bodyY + 22} width={w - 68} height={42} rx={6} fill={PLATE} stroke={PLATE_EDGE} strokeWidth={3} />
      <text
        x={x + w / 2}
        y={bodyY + 43}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={26}
        fontWeight={900}
        fill={INK}
        className="font-display"
      >
        {n}
      </text>
      {/* status badge */}
      {state === 'visit' && (
        <g>
          <circle cx={x + w - 20} cy={bodyY - 6} r={15} fill="#10B981" stroke="#065F46" strokeWidth={2.5} />
          <path
            d={`M ${x + w - 27} ${bodyY - 6} l 5 6 l 9 -11`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}
      {state === 'skip' && (
        <g>
          <circle cx={x + w - 20} cy={bodyY - 6} r={15} fill="#9CA3AF" stroke="#4B5563" strokeWidth={2.5} />
          <path
            d={`M ${x + w - 26} ${bodyY - 12} l 12 12 M ${x + w - 14} ${bodyY - 12} l -12 12`}
            stroke="#FFFFFF"
            strokeWidth={3.5}
            strokeLinecap="round"
          />
        </g>
      )}
    </g>
  )
}

export const HOUSES_VIEW_W = 540
export const HOUSES_VIEW_H = 510

const COL_X = [24, 204, 384]
const ROW_Y = [10, 178, 346]

export interface HouseGridProps {
  /** Per-house state, keyed by index 0..8 (reading order). Missing = 'plain'. */
  states?: Record<number, HouseState>
}

export function HouseGrid({ states = {} }: HouseGridProps) {
  return (
    <svg
      viewBox={`0 0 ${HOUSES_VIEW_W} ${HOUSES_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 520, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {HOUSE_NUMBERS.map((n, i) => (
        <House key={i} x={COL_X[i % 3]} y={ROW_Y[Math.floor(i / 3)]} n={n} state={states[i] ?? 'plain'} />
      ))}
    </svg>
  )
}

export default function P23G2Q4Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Nine houses, each with a yellow body, a green roof and a white number plate, showing the numbers 373, 441, 405, 210, 686, 133, 299, 178 and 534."
    >
      <HouseGrid />
    </div>
  )
}
