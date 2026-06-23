// SEAMO-16-B-Q5 — Symbol system of equations stem figure.
//
// Three equations are given as picture-rows (images 004–006.jpg):
//   □ + ✦ = 78
//   □ + ● = 66
//   ✦ + ● = 70
// Find the value of ✦ (star).  Answer: 41 (choice E).
//
// Strategy: add all three → 2(□+✦+●) = 214 → total = 107.
// Then ✦ = 107 − (□+●) = 107 − 66 = 41.
//
// This file renders the three equation rows as a tidy SVG figure.
// No Math.random, no Date — SSR-safe & deterministic.

// ---- colours ---------------------------------------------------------------
const INK      = '#1F2937'  // default text / outline
const BLUE     = '#30598A'  // qupu-brand-blue — square symbol
const ORANGE   = '#f0853a'  // qupu-brand-orange — star symbol (the unknown)
const TEAL     = '#0E7490'  // teal — circle symbol
const BG       = '#FFFFFF'

// ---- geometry ---------------------------------------------------------------
const W = 280
const H = 170
const ROW_H = 46          // vertical space per row
const Y0 = 30             // y-centre of first row
const SYM_R = 14          // radius / half-size of the symbols
const PLUS_SIZE = 10      // arm length for "+" glyph
const EQ_GAP = 12         // gap between "=" and the number

// x positions for each token: SYM1  PLUS  SYM2  EQ  NUM
const X_SYM1 = 38
const X_PLUS = 78
const X_SYM2 = 118
const X_EQ   = 156
const X_NUM  = 178 + EQ_GAP

// ---- symbol sub-components --------------------------------------------------

/** Filled square for □ */
function SquareSym({ cx, cy }: { cx: number; cy: number }) {
  const s = SYM_R * 1.55
  return (
    <rect
      x={cx - s / 2}
      y={cy - s / 2}
      width={s}
      height={s}
      rx={3}
      fill={BLUE}
      opacity={0.15}
      stroke={BLUE}
      strokeWidth={2.2}
    />
  )
}

/** Five-pointed star for ✦ */
function StarSym({ cx, cy }: { cx: number; cy: number }) {
  const pts = Array.from({ length: 10 }, (_, k) => {
    const r = k % 2 === 0 ? SYM_R : SYM_R * 0.42
    const a = ((36 * k - 90) * Math.PI) / 180
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`
  }).join(' ')
  return <polygon points={pts} fill={ORANGE} opacity={0.9} stroke={ORANGE} strokeWidth={1} strokeLinejoin="round" />
}

/** Filled circle for ● */
function CircleSym({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r={SYM_R * 0.85} fill={TEAL} opacity={0.85} />
}

/** "+" glyph */
function PlusSign({ cx, cy }: { cx: number; cy: number }) {
  const s = PLUS_SIZE
  return (
    <g stroke={INK} strokeWidth={2.5} strokeLinecap="round">
      <line x1={cx - s} y1={cy} x2={cx + s} y2={cy} />
      <line x1={cx} y1={cy - s} x2={cx} y2={cy + s} />
    </g>
  )
}

/** "=" glyph */
function EqSign({ cx, cy }: { cx: number; cy: number }) {
  const s = 6
  return (
    <g stroke={INK} strokeWidth={2.2} strokeLinecap="round">
      <line x1={cx - s} y1={cy - 3} x2={cx + s} y2={cy - 3} />
      <line x1={cx - s} y1={cy + 3} x2={cx + s} y2={cy + 3} />
    </g>
  )
}

// ---- one row ----------------------------------------------------------------

type SymType = 'square' | 'star' | 'circle'

function EqRow({
  y,
  sym1,
  sym2,
  rhs,
  highlight,
}: {
  y: number
  sym1: SymType
  sym2: SymType
  rhs: number
  highlight?: boolean   // highlight when this is the "target" row
}) {
  const Sym1 = sym1 === 'square' ? SquareSym : sym1 === 'star' ? StarSym : CircleSym
  const Sym2 = sym2 === 'square' ? SquareSym : sym2 === 'star' ? StarSym : CircleSym

  return (
    <g>
      {/* subtle row tint on hover/highlight */}
      {highlight && (
        <rect x={8} y={y - ROW_H / 2 + 4} width={W - 16} height={ROW_H - 8} rx={6} fill="#FFF7ED" />
      )}
      <Sym1 cx={X_SYM1} cy={y} />
      <PlusSign cx={X_PLUS} cy={y} />
      <Sym2 cx={X_SYM2} cy={y} />
      <EqSign cx={X_EQ} cy={y} />
      <text
        x={X_NUM}
        y={y}
        textAnchor="start"
        dominantBaseline="central"
        fontSize={20}
        fontWeight={700}
        fill={INK}
        fontFamily="inherit"
      >
        {rhs}
      </text>
    </g>
  )
}

// ---- legend -----------------------------------------------------------------

function Legend({ y }: { y: number }) {
  const items: [SymType, string, string][] = [
    ['square', BLUE,   '□'],
    ['star',   ORANGE, '✦'],
    ['circle', TEAL,   '●'],
  ]
  const spacing = W / (items.length + 1)
  return (
    <g opacity={0.7}>
      {items.map(([sym, color, label], i) => {
        const cx = spacing * (i + 1)
        const Sym = sym === 'square' ? SquareSym : sym === 'star' ? StarSym : CircleSym
        return (
          <g key={label}>
            <Sym cx={cx - 10} cy={y} />
            <text
              x={cx + 6}
              y={y}
              dominantBaseline="central"
              fontSize={11}
              fill={color}
              fontWeight={600}
              fontFamily="inherit"
            >
              = ?
            </text>
          </g>
        )
      })}
    </g>
  )
}

// ---- main illustration ------------------------------------------------------

/**
 * Primitive figure — the three equation rows plus a legend strip.
 * Used by the default-export illustration card.
 */
export function SymbolEqs16B5({}: {} = {}) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <rect width={W} height={H} fill={BG} />

      {/* Dividing lines between rows */}
      <line x1={16} y1={Y0 + ROW_H - 4} x2={W - 16} y2={Y0 + ROW_H - 4} stroke="#E5E7EB" strokeWidth={1} />
      <line x1={16} y1={Y0 + ROW_H * 2 - 4} x2={W - 16} y2={Y0 + ROW_H * 2 - 4} stroke="#E5E7EB" strokeWidth={1} />

      {/* Row 1: □ + ✦ = 78 */}
      <EqRow y={Y0} sym1="square" sym2="star" rhs={78} />

      {/* Row 2: □ + ● = 66 */}
      <EqRow y={Y0 + ROW_H} sym1="square" sym2="circle" rhs={66} />

      {/* Row 3: ✦ + ● = 70 */}
      <EqRow y={Y0 + ROW_H * 2} sym1="star" sym2="circle" rhs={70} />

      {/* Legend */}
      <Legend y={H - 18} />
    </svg>
  )
}

/** Default export — illustration card for the question stem. */
export default function SymbolEqs16B5Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Three symbol equations: square plus star equals 78; square plus circle equals 66; star plus circle equals 70. Find the value of the star.'
      }
    >
      <SymbolEqs16B5 />
    </div>
  )
}
