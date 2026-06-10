// Spinner most-likely-area figure for WMI-20F1A-Q9.
//
// Recovered from db/seed/wmi/figures/2020-final-g1-a-q9.jpg: a circular
// spinner with a black hand. Purple solid region = half the circle (50%),
// orange-with-dots region = 30%, green-with-stripes region = 20%. The biggest
// area is most likely to catch the hand, so the answer is B = Purple.

export type SpinnerFocus = 'none' | 'purple' | 'orange' | 'green' | 'answer'

const VIEW_W = 280
const VIEW_H = 250
const CX = 140
const CY = 122
const R = 100

const PURPLE = '#8B7CC8'
const ORANGE = '#F59E0B'
const ORANGE_BG = '#FDE68A'
const GREEN = '#86EFAC'
const GREEN_DARK = '#16A34A'
const DARK = '#1F2937'

// Sector angles measured clockwise from 12 o'clock.
// Orange 30% = 108°, green 20% = 72°, purple 50% = 180° (the left half).
const SECTORS: Array<{ key: 'purple' | 'orange' | 'green'; from: number; to: number; fill: string }> = [
  { key: 'orange', from: 0, to: 108, fill: 'url(#spinner20Dots)' },
  { key: 'green', from: 108, to: 180, fill: 'url(#spinner20Stripes)' },
  { key: 'purple', from: 180, to: 360, fill: PURPLE },
]

function polar(r: number, angleDeg: number): { x: number; y: number } {
  const a = (angleDeg * Math.PI) / 180
  return { x: CX + r * Math.sin(a), y: CY - r * Math.cos(a) }
}

function sectorPath(from: number, to: number): string {
  const p1 = polar(R, from)
  const p2 = polar(R, to)
  const largeArc = to - from > 180 ? 1 : 0
  return [
    `M ${CX} ${CY}`,
    `L ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `A ${R} ${R} 0 ${largeArc} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    'Z',
  ].join(' ')
}

/** Black spinner hand pointing into the orange sector (~70° clockwise from 12). */
function SpinnerHand() {
  const tip = polar(62, 70)
  const base1 = polar(8, 70 + 90)
  const base2 = polar(8, 70 - 90)
  const tail = polar(16, 70 + 180)
  const pts = [tip, base1, tail, base2].map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
  return (
    <g>
      <polygon points={pts} fill={DARK} />
      <circle cx={CX} cy={CY} r={4.5} fill={DARK} />
    </g>
  )
}

export interface SpinnerDiagramProps {
  /** Which sector to emphasise; the others dim. 'answer' highlights purple. */
  focus?: SpinnerFocus
}

export function SpinnerDiagram({ focus = 'none' }: SpinnerDiagramProps) {
  const focusKey = focus === 'answer' ? 'purple' : focus
  const opacityFor = (key: 'purple' | 'orange' | 'green') =>
    focusKey === 'none' || focusKey === key ? 1 : 0.25

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 290, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <defs>
        <pattern id="spinner20Dots" patternUnits="userSpaceOnUse" width={16} height={16}>
          <rect width={16} height={16} fill={ORANGE_BG} />
          <circle cx={4} cy={4} r={3.4} fill={ORANGE} />
          <circle cx={12} cy={12} r={3.4} fill={ORANGE} />
        </pattern>
        <pattern id="spinner20Stripes" patternUnits="userSpaceOnUse" width={10} height={10} patternTransform="rotate(45)">
          <rect width={10} height={10} fill={GREEN} />
          <rect width={4} height={10} fill={GREEN_DARK} />
        </pattern>
      </defs>

      {SECTORS.map((s) => (
        <path
          key={s.key}
          d={sectorPath(s.from, s.to)}
          fill={s.fill}
          stroke={DARK}
          strokeWidth={focusKey === s.key ? 3 : 1.5}
          strokeLinejoin="round"
          opacity={opacityFor(s.key)}
        />
      ))}

      {/* outer rim */}
      <circle cx={CX} cy={CY} r={R} fill="none" stroke={DARK} strokeWidth={3} />

      <SpinnerHand />
    </svg>
  )
}

export default function Spinner20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A circular spinner with a black hand. The solid purple area covers half the circle, the orange dotted area is smaller, and the green striped area is the smallest."
    >
      <SpinnerDiagram />
    </div>
  )
}
