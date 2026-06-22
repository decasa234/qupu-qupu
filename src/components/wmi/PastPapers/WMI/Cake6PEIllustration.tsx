// Stem illustration for IKMC-23-PE-Q6.
//
// "This is my grandfather's birthday cake. A large candle stands for 10 years
//  and a small one for 1 year. How old is my grandfather?"
//
// Reconstructed from docs/reference/ocr-res/ikmc/contest/preecolier/2023.imgs/024.jpg:
// a round pink birthday cake with dripping frosting; 7 TALL dark candles and
// 6 SHORT white candles arranged alternately on top, each lit with a small flame.
//
// 7 large × 10 + 6 small × 1 = 70 + 6 = 76 → answer C.
// This component draws ONLY the cake + candles — never reveals the answer.
//
// Pure render — no random, no dates, SSR-safe & deterministic.
// Adapted from P25G1Q4Illustration (same candle-place-value pattern).

const INK = '#3A3A3A'
const FLAME_OUT = '#F4B400'
const FLAME_IN = '#F0853A'
const WICK = '#3A3A3A'

/** Candle height class */
export type CandleH = 'large' | 'small'

export interface CandlePlan {
  h: CandleH
  color: string
}

// 7 large (dark) + 6 small (white/cream), arranged alternating like the source image.
// Total 13 candles; large = dark grey/charcoal, small = off-white/cream.
export const CAKE6_CANDLES: CandlePlan[] = [
  { h: 'large', color: '#2A2A2A' }, // 1 dark
  { h: 'small', color: '#F5F0E0' }, // 2 cream
  { h: 'large', color: '#2A2A2A' }, // 3 dark
  { h: 'small', color: '#F5F0E0' }, // 4 cream
  { h: 'large', color: '#2A2A2A' }, // 5 dark
  { h: 'small', color: '#F5F0E0' }, // 6 cream
  { h: 'large', color: '#2A2A2A' }, // 7 dark
  { h: 'small', color: '#F5F0E0' }, // 8 cream
  { h: 'large', color: '#2A2A2A' }, // 9 dark
  { h: 'small', color: '#F5F0E0' }, // 10 cream
  { h: 'large', color: '#2A2A2A' }, // 11 dark
  { h: 'small', color: '#F5F0E0' }, // 12 cream
  { h: 'large', color: '#2A2A2A' }, // 13 dark
]

export const LARGE_COUNT = CAKE6_CANDLES.filter((c) => c.h === 'large').length // 7
export const SMALL_COUNT = CAKE6_CANDLES.filter((c) => c.h === 'small').length // 6

export const CAKE6_VIEW_W = 440
export const CAKE6_VIEW_H = 260

// Candle geometry
const LARGE_LEN = 80
const SMALL_LEN = 40
const CANDLE_W = 13
const CAKE_TOP_Y = 148 // y where candles enter the cake surface

const CANDLE_AREA_W = CAKE6_VIEW_W - 80
const ROW_X0 = 40
const ROW_STEP = CANDLE_AREA_W / (CAKE6_CANDLES.length - 1)

export function cake6CandleX(i: number): number {
  return ROW_X0 + i * ROW_STEP
}

/** One candle with body, stripe, wick, and flame. */
export function Cake6Candle({
  cx,
  plan,
  dim = false,
  ring = false,
}: {
  cx: number
  plan: CandlePlan
  dim?: boolean
  ring?: boolean
}) {
  const len = plan.h === 'large' ? LARGE_LEN : SMALL_LEN
  const top = CAKE_TOP_Y - len
  const x = cx - CANDLE_W / 2
  const opacity = dim ? 0.25 : 1
  const isLight = plan.color === '#F5F0E0'
  return (
    <g opacity={opacity}>
      {ring && (
        <rect
          x={x - 5}
          y={top - 22}
          width={CANDLE_W + 10}
          height={len + 24}
          rx={7}
          fill="none"
          stroke="#f0853a"
          strokeWidth={2.6}
        />
      )}
      {/* body */}
      <rect
        x={x}
        y={top}
        width={CANDLE_W}
        height={len}
        rx={2}
        fill={plan.color}
        stroke={INK}
        strokeWidth={isLight ? 1.2 : 0.6}
      />
      {/* waxy highlight stripe */}
      <rect
        x={x + 3}
        y={top + 3}
        width={3}
        height={len - 6}
        rx={1.5}
        fill={isLight ? '#FFFFFF' : '#FFFFFF'}
        opacity={isLight ? 0.5 : 0.2}
      />
      {/* wick */}
      <line x1={cx} y1={top} x2={cx} y2={top - 7} stroke={WICK} strokeWidth={1.6} />
      {/* outer flame */}
      <path
        d={`M ${cx} ${top - 7}
            C ${cx + 6} ${top - 13} ${cx + 5} ${top - 22} ${cx} ${top - 27}
            C ${cx - 5} ${top - 22} ${cx - 6} ${top - 13} ${cx} ${top - 7} Z`}
        fill={FLAME_OUT}
        stroke={INK}
        strokeWidth={0.8}
      />
      {/* inner flame */}
      <path
        d={`M ${cx} ${top - 10}
            C ${cx + 3} ${top - 14} ${cx + 2.5} ${top - 19} ${cx} ${top - 22}
            C ${cx - 2.5} ${top - 19} ${cx - 3} ${top - 14} ${cx} ${top - 10} Z`}
        fill={FLAME_IN}
      />
    </g>
  )
}

export interface Cake6Props {
  /** 'large' | 'small' | null — dim candles that are NOT this height */
  focus?: CandleH | null
  /** ring the candles of this height */
  ring?: CandleH | null
}

/** Round birthday cake with 7 large + 6 small candles. Co-exported for the explainer. */
export function Cake6({ focus = null, ring = null }: Cake6Props) {
  const cx = CAKE6_VIEW_W / 2
  return (
    <svg
      viewBox={`0 0 ${CAKE6_VIEW_W} ${CAKE6_VIEW_H}`}
      width="100%"
      style={{ maxWidth: CAKE6_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Candles drawn before cake so the base appears on top */}
      {CAKE6_CANDLES.map((plan, i) => (
        <Cake6Candle
          key={i}
          cx={cake6CandleX(i)}
          plan={plan}
          dim={focus != null && plan.h !== focus}
          ring={ring != null && plan.h === ring}
        />
      ))}

      {/* ── Cake body ── */}
      {/* Plate / base shadow */}
      <ellipse cx={cx} cy={238} rx={175} ry={14} fill="#E0E0E0" opacity={0.6} />
      {/* Plate */}
      <ellipse cx={cx} cy={235} rx={172} ry={13} fill="#FFFFFF" stroke={INK} strokeWidth={1.4} />

      {/* Chocolate base layer */}
      <path
        d={`M 68 205 L 68 222 A 152 14 0 0 0 372 222 L 372 205 Z`}
        fill="#5C3317"
        stroke={INK}
        strokeWidth={1.6}
      />
      {/* Pink frosting side */}
      <path
        d={`M 68 148 L 68 208 A 152 14 0 0 0 372 208 L 372 148 Z`}
        fill="#F08080"
        stroke={INK}
        strokeWidth={1.8}
      />
      {/* White cream band */}
      <path
        d={`M 68 190 A 152 14 0 0 0 372 190 L 372 200 A 152 14 0 0 1 68 200 Z`}
        fill="#FFFFFF"
        opacity={0.85}
      />
      {/* Top surface with frosting drips */}
      <path
        d={`M 68 148
            A 152 20 0 0 0 372 148
            C 363 163 354 153 342 161
            C 330 169 321 156 308 163
            C 295 170 284 155 270 163
            C 256 171 245 157 231 163
            C 217 169 206 156 192 163
            C 178 170 167 155 153 163
            C 139 171 128 157 114 163
            C 101 169 92 158 80 162
            C 74 164 70 157 68 148 Z`}
        fill="#F5A0A0"
        stroke={INK}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      {/* Top ellipse surface */}
      <ellipse cx={cx} cy={148} rx={152} ry={20} fill="#F8B4B4" stroke={INK} strokeWidth={1.8} />
    </svg>
  )
}

export default function Cake6PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="A birthday cake with thirteen candles on top: seven tall dark candles and six short white candles, alternating, each lit with a small flame."
    >
      <Cake6 />
    </div>
  )
}
