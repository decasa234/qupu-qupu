// Option renderer for IKMC-23-PE-Q18.
//
// "Five children share a birthday and each child has their own cake.
//  Lea is two years older than Jose, but one year younger than Ali.
//  Vittorio is the youngest. Which is Sarah's cake?"
//
// The A–E options ARE the 5 cakes — each a layered birthday cake with ONE
// large numeral candle on top:
//   A → digit 8 (purple)   Ali
//   B → digit 7 (green)    Lea
//   C → digit 6 (dark)     Sarah ← answer
//   D → digit 5 (green)    Jose
//   E → digit 4 (lavender) Vittorio
//
// Reconstructed faithfully from OCR crops 052-056.jpg:
// three-layer chocolate cake with cream frosting, a single tall candle
// bearing a coloured digit glyph and lit flame.
//
// TYPE: options-only — no stem illustration (the cakes ARE the options).
// Named export `Cakes18PEOption` satisfies CHOICE_RENDERERS.
//
// Pure render — SSR-safe, no random, no Date.

import type { WmiChoice } from '../../../../types/wmi'

// ── Cake geometry ──────────────────────────────────────────────────────────
const VW = 120
const VH = 150

// Cake layers (y positions, bottom-up)
const PLATE_CY = 138
const PLATE_RX = 50
const PLATE_RY = 7

const CAKE_X0 = 16 // left edge of cake
const CAKE_X1 = 104 // right edge
const CAKE_W = CAKE_X1 - CAKE_X0

// Layer bottom y-coordinates (layers sit on the plate)
const L1_BOT = 132 // bottom layer bottom
const L1_H = 16 // height of layer 1 (chocolate)
const L1_TOP = L1_BOT - L1_H

const L2_BOT = L1_TOP // layer 2 starts where layer 1 ends
const L2_H = 16
const L2_TOP = L2_BOT - L2_H

const L3_BOT = L2_TOP
const L3_H = 16
const L3_TOP = L3_BOT - L3_H

// Ellipse rx for each layer (slight taper upwards)
const RX1 = CAKE_W / 2
const RX2 = RX1 - 2
const RX3 = RX2 - 2

const CAKE_CX = VW / 2

// Candle geometry
const CANDLE_X = CAKE_CX
const CANDLE_BOT = L3_TOP - 2
const CANDLE_H = 34
const CANDLE_TOP = CANDLE_BOT - CANDLE_H
const CANDLE_W = 10

// Wick + flame
const WICK_Y_BOT = CANDLE_TOP
const WICK_LEN = 7
const WICK_Y_TOP = WICK_Y_BOT - WICK_LEN

// ── Colour look-up per digit ───────────────────────────────────────────────
interface CandleTheme {
  /** Candle body fill */
  body: string
  /** Digit glyph fill */
  digit: string
  /** Digit outline / stroke */
  digitStroke: string
}

// Matched to source images:
// 8 → purple body, cream digit with purple outline
// 7 → pale body, green digit
// 6 → off-white body, dark/maroon digit with coloured spots (simplified to dark)
// 5 → pale body, forest-green digit
// 4 → lavender body, purple digit
const CANDLE_THEMES: Record<number, CandleTheme> = {
  8: { body: '#9B59B6', digit: '#F0ECF7', digitStroke: '#6C3483' },
  7: { body: '#F5F0E0', digit: '#27AE60', digitStroke: '#1A7A44' },
  6: { body: '#F5F0E0', digit: '#2C3E50', digitStroke: '#1A252F' },
  5: { body: '#F5F0E0', digit: '#1E8449', digitStroke: '#145A32' },
  4: { body: '#E8D5F5', digit: '#7D3C98', digitStroke: '#5B2C6F' },
}

const FLAME_OUT = '#F4B400'
const FLAME_IN = '#F0853A'
const CHOC = '#5C3317'
const CREAM = '#F5E6C8'
const FROSTING = '#FDEBD0'
const INK = '#2C2C2C'
const PLATE_FILL = '#FFFFFF'
const PLATE_SHADOW = '#E0E0E0'

// ── SVG digit paths (simple bold strokes, centred on 0,0, 20×26 box) ─────
// These are compact path-based glyphs, not text, for deterministic SSR rendering.
function DigitPath({ digit, cx, cy, theme }: { digit: number; cx: number; cy: number; theme: CandleTheme }) {
  // Each path is defined in a 20×26 coordinate space, then translated.
  const dx = cx - 10
  const dy = cy - 13

  const T = (x: number, y: number) => `${x + dx},${y + dy}`

  let d = ''
  switch (digit) {
    case 4:
      d = `M ${T(3,2)} L ${T(3,16)} M ${T(3,2)} L ${T(13,12)} L ${T(17,12)} M ${T(14,2)} L ${T(14,24)}`
      break
    case 5:
      d = `M ${T(15,2)} L ${T(4,2)} L ${T(4,13)} L ${T(13,13)} Q ${T(17,13)} ${T(17,18)} Q ${T(17,24)} ${T(10,24)} Q ${T(4,24)} ${T(4,20)}`
      break
    case 6:
      d = `M ${T(14,4)} Q ${T(10,1)} ${T(7,4)} Q ${T(3,7)} ${T(3,13)} Q ${T(3,20)} ${T(7,23)} Q ${T(11,26)} ${T(14,23)} Q ${T(17,20)} ${T(17,16)} Q ${T(17,11)} ${T(13,9)} Q ${T(9,7)} ${T(4,11)}`
      break
    case 7:
      d = `M ${T(3,2)} L ${T(17,2)} L ${T(9,24)}`
      break
    case 8:
      d = `M ${T(10,2)} Q ${T(16,2)} ${T(16,8)} Q ${T(16,13)} ${T(10,13)} Q ${T(4,13)} ${T(4,8)} Q ${T(4,2)} ${T(10,2)} Z M ${T(10,13)} Q ${T(17,13)} ${T(17,20)} Q ${T(17,26)} ${T(10,26)} Q ${T(3,26)} ${T(3,20)} Q ${T(3,13)} ${T(10,13)} Z`
      break
    default:
      d = ''
  }

  return (
    <path
      d={d}
      fill="none"
      stroke={theme.digit}
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

// ── One birthday cake (options A–E) ────────────────────────────────────────

function BirthdayCake({ n }: { n: number }) {
  const theme = CANDLE_THEMES[n] ?? CANDLE_THEMES[6]
  const digitCY = CANDLE_TOP + CANDLE_H * 0.52

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: VW, display: 'block' }}
      aria-hidden="true"
    >
      {/* ── Flame ── */}
      {/* outer flame */}
      <path
        d={`M ${CANDLE_X} ${WICK_Y_TOP}
            C ${CANDLE_X + 6} ${WICK_Y_TOP - 6} ${CANDLE_X + 5} ${WICK_Y_TOP - 15} ${CANDLE_X} ${WICK_Y_TOP - 20}
            C ${CANDLE_X - 5} ${WICK_Y_TOP - 15} ${CANDLE_X - 6} ${WICK_Y_TOP - 6} ${CANDLE_X} ${WICK_Y_TOP} Z`}
        fill={FLAME_OUT}
        stroke={INK}
        strokeWidth={0.6}
      />
      {/* inner flame */}
      <path
        d={`M ${CANDLE_X} ${WICK_Y_TOP - 2}
            C ${CANDLE_X + 3} ${WICK_Y_TOP - 6} ${CANDLE_X + 2.5} ${WICK_Y_TOP - 11} ${CANDLE_X} ${WICK_Y_TOP - 14}
            C ${CANDLE_X - 2.5} ${WICK_Y_TOP - 11} ${CANDLE_X - 3} ${WICK_Y_TOP - 6} ${CANDLE_X} ${WICK_Y_TOP - 2} Z`}
        fill={FLAME_IN}
      />
      {/* wick */}
      <line x1={CANDLE_X} y1={WICK_Y_BOT} x2={CANDLE_X} y2={WICK_Y_TOP} stroke={INK} strokeWidth={1.4} />

      {/* ── Candle ── */}
      <rect
        x={CANDLE_X - CANDLE_W / 2}
        y={CANDLE_TOP}
        width={CANDLE_W}
        height={CANDLE_H}
        rx={2.5}
        fill={theme.body}
        stroke={INK}
        strokeWidth={1.2}
      />
      {/* digit glyph on candle */}
      <DigitPath digit={n} cx={CANDLE_X} cy={digitCY} theme={theme} />

      {/* ── Cake layers (drawn after candle so the candle appears in front) ── */}

      {/* Plate shadow */}
      <ellipse cx={CAKE_CX} cy={PLATE_CY + 3} rx={PLATE_RX} ry={PLATE_RY} fill={PLATE_SHADOW} opacity={0.5} />
      {/* Plate */}
      <ellipse cx={CAKE_CX} cy={PLATE_CY} rx={PLATE_RX} ry={PLATE_RY} fill={PLATE_FILL} stroke={INK} strokeWidth={1.2} />

      {/* Layer 1 — chocolate base (bottom) */}
      <path
        d={`M ${CAKE_CX - RX1} ${L1_BOT} L ${CAKE_CX - RX1} ${L1_TOP} A ${RX1} 6 0 0 0 ${CAKE_CX + RX1} ${L1_TOP} L ${CAKE_CX + RX1} ${L1_BOT} A ${RX1} 6 0 0 1 ${CAKE_CX - RX1} ${L1_BOT} Z`}
        fill={CHOC}
        stroke={INK}
        strokeWidth={1.2}
      />
      {/* cream stripe between layers 1-2 */}
      <ellipse cx={CAKE_CX} cy={L1_TOP} rx={RX1} ry={5} fill={CREAM} stroke={INK} strokeWidth={1.0} />

      {/* Layer 2 — chocolate */}
      <path
        d={`M ${CAKE_CX - RX2} ${L2_BOT} L ${CAKE_CX - RX2} ${L2_TOP} A ${RX2} 5 0 0 0 ${CAKE_CX + RX2} ${L2_TOP} L ${CAKE_CX + RX2} ${L2_BOT} A ${RX2} 5 0 0 1 ${CAKE_CX - RX2} ${L2_BOT} Z`}
        fill={CHOC}
        stroke={INK}
        strokeWidth={1.2}
      />
      {/* cream stripe between layers 2-3 */}
      <ellipse cx={CAKE_CX} cy={L2_TOP} rx={RX2} ry={4.5} fill={CREAM} stroke={INK} strokeWidth={1.0} />

      {/* Layer 3 — frosting top */}
      <path
        d={`M ${CAKE_CX - RX3} ${L3_BOT} L ${CAKE_CX - RX3} ${L3_TOP} A ${RX3} 4 0 0 0 ${CAKE_CX + RX3} ${L3_TOP} L ${CAKE_CX + RX3} ${L3_BOT} A ${RX3} 4 0 0 1 ${CAKE_CX - RX3} ${L3_BOT} Z`}
        fill={FROSTING}
        stroke={INK}
        strokeWidth={1.2}
      />
      {/* top surface ellipse */}
      <ellipse cx={CAKE_CX} cy={L3_TOP} rx={RX3} ry={4} fill={FROSTING} stroke={INK} strokeWidth={1.2} />
    </svg>
  )
}

// ── Public exports ─────────────────────────────────────────────────────────

// Map choice label → candle digit (A=8, B=7, C=6, D=5, E=4)
const LABEL_TO_DIGIT: Record<string, number> = { A: 8, B: 7, C: 6, D: 5, E: 4 }

/** Choice renderer — renders ONE cake option (A–E). */
export function Cakes18PEOption({ choice }: { choice: WmiChoice }) {
  const key = (choice.label ?? '').trim().toUpperCase()
  const n = LABEL_TO_DIGIT[key]
  if (n == null) return <span>{choice.text}</span>
  const candleCount = n
  return (
    <div
      style={{ width: '100%', maxWidth: 100, margin: '0 auto' }}
      role="img"
      aria-label={`Birthday cake with number ${candleCount} candle`}
    >
      <BirthdayCake n={n} />
    </div>
  )
}

// Re-export for potential direct use
export { BirthdayCake }

export default Cakes18PEOption
