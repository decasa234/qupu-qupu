import type { WmiChoice } from '../../../../types/wmi'

// Renders an answer option for WMI-22F1A-Q5 (Grade 1, 2022 Final Paper A).
//
// The four options A–D are pictures of fruit inside a circular frame. Each
// option's exact fruit counts are read from the source paper images and
// hardcoded in FRUIT_SETS, so the rendering can never drift from the paper.
// The puzzle rule is bananas = 2 × strawberries AND apples = bananas + 1;
// option D (1 strawberry, 2 bananas, 3 apples) is the only set that satisfies
// both — but this static option figure deliberately never reveals that.
//
// Fruit are drawn from basic shapes (no emoji):
//   strawberry = small red rounded-triangle body + green leaf + white seeds
//   banana     = yellow crescent
//   apple      = red circle + short stem + green leaf

type FruitCounts = { strawberry: number; banana: number; apple: number }
type OptionLabel = 'A' | 'B' | 'C' | 'D'

/** Per-option fruit counts read directly from the 2022 G1 Paper A option images. */
export const FRUIT_SETS: Record<OptionLabel, FruitCounts> = {
  A: { strawberry: 2, banana: 2, apple: 3 },
  B: { strawberry: 1, banana: 2, apple: 4 },
  C: { strawberry: 1, banana: 4, apple: 2 },
  D: { strawberry: 1, banana: 2, apple: 3 },
}

const FRAME = '#C7C9E0' // muted lilac ring like the source paper frame

const STRAWBERRY_FILL = '#EF4444'
const STRAWBERRY_STROKE = '#B91C1C'
const BANANA_FILL = '#FACC15'
const BANANA_STROKE = '#CA8A04'
const APPLE_FILL = '#EF4444'
const APPLE_STROKE = '#B91C1C'
const LEAF_FILL = '#16A34A'
const LEAF_STROKE = '#15803D'
const STEM = '#92400E'

/** A small red strawberry centred at (cx, cy); s ≈ overall size in px. */
function Strawberry({ cx, cy, s }: { cx: number; cy: number; s: number }) {
  const d = [
    `M ${cx - s * 0.5} ${cy - s * 0.1}`,
    `Q ${cx} ${cy - s * 0.55} ${cx + s * 0.5} ${cy - s * 0.1}`,
    `Q ${cx + s * 0.45} ${cy + s * 0.32} ${cx} ${cy + s * 0.62}`,
    `Q ${cx - s * 0.45} ${cy + s * 0.32} ${cx - s * 0.5} ${cy - s * 0.1}`,
    'Z',
  ].join(' ')
  const seeds: Array<[number, number]> = [
    [-0.2, 0.04],
    [0.2, 0.04],
    [0, 0.24],
    [-0.1, -0.14],
    [0.12, -0.14],
  ]
  const leaf = `${cx - s * 0.28},${cy - s * 0.36} ${cx},${cy - s * 0.72} ${cx + s * 0.28},${cy - s * 0.36} ${cx},${cy - s * 0.26}`
  return (
    <g>
      <path d={d} fill={STRAWBERRY_FILL} stroke={STRAWBERRY_STROKE} strokeWidth={1.5} />
      {seeds.map(([dx, dy], i) => (
        <circle key={i} cx={cx + dx * s} cy={cy + dy * s} r={Math.max(0.8, s * 0.05)} fill="#FFFFFF" />
      ))}
      <polygon points={leaf} fill={LEAF_FILL} stroke={LEAF_STROKE} strokeWidth={1} strokeLinejoin="round" />
    </g>
  )
}

/** A yellow banana crescent centred at (cx, cy). */
function Banana({ cx, cy, s }: { cx: number; cy: number; s: number }) {
  const d = [
    `M ${cx - s * 0.6} ${cy - s * 0.24}`,
    `Q ${cx} ${cy + s * 0.78} ${cx + s * 0.6} ${cy - s * 0.24}`,
    `Q ${cx + s * 0.42} ${cy + s * 0.2} ${cx} ${cy + s * 0.36}`,
    `Q ${cx - s * 0.42} ${cy + s * 0.2} ${cx - s * 0.6} ${cy - s * 0.24}`,
    'Z',
  ].join(' ')
  return <path d={d} fill={BANANA_FILL} stroke={BANANA_STROKE} strokeWidth={1.5} strokeLinejoin="round" />
}

/** A red apple (circle + stem + leaf) centred at (cx, cy). */
function Apple({ cx, cy, s }: { cx: number; cy: number; s: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy + s * 0.12} r={s * 0.5} fill={APPLE_FILL} stroke={APPLE_STROKE} strokeWidth={1.5} />
      <line
        x1={cx}
        y1={cy - s * 0.34}
        x2={cx}
        y2={cy - s * 0.66}
        stroke={STEM}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <ellipse
        cx={cx + s * 0.24}
        cy={cy - s * 0.52}
        rx={s * 0.2}
        ry={s * 0.1}
        fill={LEAF_FILL}
        stroke={LEAF_STROKE}
        strokeWidth={1}
        transform={`rotate(-28 ${cx + s * 0.24} ${cy - s * 0.52})`}
      />
    </g>
  )
}

const VIEW = 100 // square viewBox
const CENTER = VIEW / 2

// Up to 8 evenly-spread slots inside the circle (centre + ring of seven).
// Fruit are placed deterministically: strawberries, then bananas, then apples.
const SLOTS: Array<[number, number]> = (() => {
  const center: [number, number] = [CENTER, CENTER]
  const ring: Array<[number, number]> = []
  const ringR = VIEW * 0.27
  const n = 7
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n
    ring.push([CENTER + ringR * Math.cos(a), CENTER + ringR * Math.sin(a)])
  }
  return [center, ...ring]
})()

const FRUIT_SIZE = 13

/** Draws a group of fruit (strawberries, bananas, apples) laid out inside a circle. */
export function FruitGroup({ counts }: { counts: FruitCounts }) {
  const order: Array<'strawberry' | 'banana' | 'apple'> = []
  for (let i = 0; i < counts.strawberry; i++) order.push('strawberry')
  for (let i = 0; i < counts.banana; i++) order.push('banana')
  for (let i = 0; i < counts.apple; i++) order.push('apple')

  return (
    <g>
      {order.slice(0, SLOTS.length).map((kind, i) => {
        const [cx, cy] = SLOTS[i]
        if (kind === 'strawberry') return <Strawberry key={i} cx={cx} cy={cy} s={FRUIT_SIZE} />
        if (kind === 'banana') return <Banana key={i} cx={cx} cy={cy} s={FRUIT_SIZE} />
        return <Apple key={i} cx={cx} cy={cy} s={FRUIT_SIZE} />
      })}
    </g>
  )
}

export default function Fruit22G1Option({ choice }: { choice: WmiChoice }) {
  const label = (choice.label ?? '').trim().toUpperCase() as OptionLabel
  const counts = FRUIT_SETS[label]
  // Fallback to plain text if the choice isn't one of the four known options.
  if (!counts) return <span>{choice.text}</span>

  const aria = `Pilihan ${label}: ${counts.strawberry} stroberi, ${counts.banana} pisang, ${counts.apple} apel`

  return (
    <svg
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      width={72}
      height={72}
      style={{ display: 'block' }}
      role="img"
      aria-label={aria}
    >
      <circle cx={CENTER} cy={CENTER} r={VIEW / 2 - 4} fill="#FFFFFF" stroke={FRAME} strokeWidth={5} />
      <FruitGroup counts={counts} />
    </svg>
  )
}
