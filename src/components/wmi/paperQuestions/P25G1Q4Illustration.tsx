// Static card illustration for WMI-25P1A-Q4 (2025 Grade-1 Semifinal, Q4).
//
// "A long candle represents 10 years, a short candle represents 1 year.
//  How old is Grandmother?"
// Reconstructed from db/seed/wmi/figures/2025-semifinal-g1-a-q4.jpg:
// a birthday cake with candles of two heights stuck in the top. There are
// 6 LONG candles and 4 SHORT candles (10 candles in all), in mixed colours,
// each with a small flame.
//
// 6 long x 10 + 4 short x 1 = 60 + 4 = 64 => answer D. This component draws
// ONLY the cake + candles — it never writes any number or marks a value on a
// candle, so the answer is never revealed.
//
// Pure render — no random, no dates, SSR-safe & deterministic.

const INK = '#3A3A3A'
const FLAME_OUT = '#F4B400'
const FLAME_IN = '#F0853A'
const WICK = '#3A3A3A'

// Candle plan, left -> right across the cake top. height: 'long' | 'short'.
// 6 long + 4 short, colours mixed like the scan. Order is decorative only;
// the count (6 long, 4 short) is what matters and never leaks a value.
export type CandleH = 'long' | 'short'
export interface CandlePlan {
  h: CandleH
  color: string
}
export const CANDLES: CandlePlan[] = [
  { h: 'long', color: '#E0556B' }, // red
  { h: 'long', color: '#2E9BD6' }, // blue
  { h: 'short', color: '#2FA84F' }, // green
  { h: 'long', color: '#E0556B' }, // red
  { h: 'short', color: '#F4C20D' }, // yellow
  { h: 'long', color: '#2FA84F' }, // green
  { h: 'long', color: '#E0556B' }, // red
  { h: 'short', color: '#2E9BD6' }, // blue
  { h: 'short', color: '#F4C20D' }, // yellow
  { h: 'long', color: '#2FA84F' }, // green
]

export const LONG_COUNT = CANDLES.filter((c) => c.h === 'long').length // 6
export const SHORT_COUNT = CANDLES.filter((c) => c.h === 'short').length // 4

export const Q4_VIEW_W = 420
export const Q4_VIEW_H = 250

// candle geometry
const LONG_LEN = 78
const SHORT_LEN = 38
const CANDLE_W = 14
const CAKE_TOP_Y = 150 // y where candles enter the cake
const ROW_X0 = 56
const ROW_STEP = (Q4_VIEW_W - ROW_X0 * 2) / (CANDLES.length - 1)

export function candleX(i: number): number {
  return ROW_X0 + i * ROW_STEP
}

/** One candle (body + stripe + flame). Optionally tinted by a highlight group. */
export function Candle({
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
  const len = plan.h === 'long' ? LONG_LEN : SHORT_LEN
  const top = CAKE_TOP_Y - len
  const x = cx - CANDLE_W / 2
  const opacity = dim ? 0.28 : 1
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
      <rect x={x} y={top} width={CANDLE_W} height={len} rx={2} fill={plan.color} stroke={INK} strokeWidth={1.4} />
      {/* a lighter stripe for a waxy look */}
      <rect x={x + 3} y={top + 3} width={3} height={len - 6} rx={1.5} fill="#FFFFFF" opacity={0.4} />
      {/* wick */}
      <line x1={cx} y1={top} x2={cx} y2={top - 7} stroke={WICK} strokeWidth={1.6} />
      {/* flame */}
      <path
        d={`M ${cx} ${top - 7}
            C ${cx + 6} ${top - 13} ${cx + 5} ${top - 22} ${cx} ${top - 27}
            C ${cx - 5} ${top - 22} ${cx - 6} ${top - 13} ${cx} ${top - 7} Z`}
        fill={FLAME_OUT}
        stroke={INK}
        strokeWidth={1}
      />
      <path
        d={`M ${cx} ${top - 10}
            C ${cx + 3} ${top - 14} ${cx + 2.5} ${top - 19} ${cx} ${top - 22}
            C ${cx - 2.5} ${top - 19} ${cx - 3} ${top - 14} ${cx} ${top - 10} Z`}
        fill={FLAME_IN}
      />
    </g>
  )
}

export interface Q4CakeProps {
  /** 'long' | 'short' | null — dim every candle that is NOT this height. */
  focus?: CandleH | null
  /** ring the candles of this height. */
  ring?: CandleH | null
}

/** The cake with candles. Co-exported so the explainer reuses the geometry. */
export function Q4Cake({ focus = null, ring = null }: Q4CakeProps) {
  return (
    <svg
      viewBox={`0 0 ${Q4_VIEW_W} ${Q4_VIEW_H}`}
      width="100%"
      style={{ maxWidth: Q4_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* candles (behind the cake top edge) */}
      {CANDLES.map((plan, i) => (
        <Candle
          key={i}
          cx={candleX(i)}
          plan={plan}
          dim={focus != null && plan.h !== focus}
          ring={ring != null && plan.h === ring}
        />
      ))}

      {/* --- cake --- */}
      {/* plate */}
      <ellipse cx={Q4_VIEW_W / 2} cy={232} rx={170} ry={16} fill="#FFFFFF" stroke={INK} strokeWidth={1.6} />
      {/* lower frosting (pink) */}
      <path
        d={`M 70 150 L 70 210 A 140 18 0 0 0 350 210 L 350 150 Z`}
        fill="#F2B7B7"
        stroke={INK}
        strokeWidth={1.8}
      />
      {/* white cream band */}
      <path d={`M 70 188 A 140 18 0 0 0 350 188 L 350 200 A 140 18 0 0 1 70 200 Z`} fill="#FFFFFF" opacity={0.9} />
      {/* top (cream) with drips */}
      <path
        d={`M 70 150
            A 140 22 0 0 0 350 150
            C 340 168 330 158 318 166
            C 306 174 298 158 286 164
            C 274 170 264 156 250 164
            C 236 172 226 158 212 164
            C 198 170 188 158 174 164
            C 160 170 150 156 136 164
            C 122 172 110 158 96 164
            C 84 169 78 158 70 150 Z`}
        fill="#FAE0AE"
        stroke={INK}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      {/* top surface ellipse */}
      <ellipse cx={Q4_VIEW_W / 2} cy={150} rx={140} ry={22} fill="#FBEBC8" stroke={INK} strokeWidth={1.8} />
    </svg>
  )
}

export default function P25G1Q4Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="A birthday cake with ten candles on top: six tall candles and four short candles, in mixed colours, each lit with a small flame."
    >
      <Q4Cake />
    </div>
  )
}
