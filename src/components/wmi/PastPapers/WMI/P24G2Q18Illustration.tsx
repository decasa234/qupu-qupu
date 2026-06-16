// Fruit-grid figure for WMI-24P2A-Q18 (2024 Grade 2 Semifinal, Paper A).
//
// Redrawn from db/seed/wmi/figures/2024-semifinal-g2-a-q18.jpg: a 3-row × 5-col
// tray of fruit stickers on a light-blue panel. Reading order matches the scan:
//   row 1: pineapple, orange,     pear,       banana, pineapple
//   row 2: strawberry, apple,     banana,     banana, orange
//   row 3: pineapple,  pear,      strawberry, pear,   banana
//
// Tally → pineapple 3, orange 2, pear 3, banana 4, strawberry 2, apple 1 = 15.
// To keep just ONE kind, keep the biggest group (bananas, 4) and take away the
// other 15 − 4 = 11 fruits (answer C). The static figure shows only the fruit.
//
// Single-codepoint emoji only: 🍍 🍊 🍐 🍌 🍓 🍎.

export type FruitKind = 'pineapple' | 'orange' | 'pear' | 'banana' | 'strawberry' | 'apple'

export const FRUIT_GLYPH: Record<FruitKind, string> = {
  pineapple: '🍍',
  orange: '🍊',
  pear: '🍐',
  banana: '🍌',
  strawberry: '🍓',
  apple: '🍎',
}

// The grid exactly as it sits in the scan.
export const Q18_GRID: FruitKind[][] = [
  ['pineapple', 'orange', 'pear', 'banana', 'pineapple'],
  ['strawberry', 'apple', 'banana', 'banana', 'orange'],
  ['pineapple', 'pear', 'strawberry', 'pear', 'banana'],
]

// Counts (derived once so the explainer and tests stay in sync).
export const Q18_COUNTS: Record<FruitKind, number> = (() => {
  const c: Record<FruitKind, number> = { pineapple: 0, orange: 0, pear: 0, banana: 0, strawberry: 0, apple: 0 }
  for (const row of Q18_GRID) for (const f of row) c[f] += 1
  return c
})()
export const Q18_TOTAL = Q18_GRID.reduce((n, row) => n + row.length, 0) // 15
export const Q18_BIGGEST: FruitKind = 'banana'
export const Q18_REMOVE = Q18_TOTAL - Q18_COUNTS[Q18_BIGGEST] // 11

const PANEL = '#BFE0F2'
const COLS = 5
const ROWS = 3
const CELL = 78
const PAD = 18
export const Q18_VIEW_W = PAD * 2 + COLS * CELL // 426
export const Q18_VIEW_H = PAD * 2 + ROWS * CELL // 270

export interface FruitGridProps {
  /** Kinds to keep at full opacity; others are dimmed. Empty set = show all. */
  keep?: Set<FruitKind>
  /** Draw a soft ring around every fruit of this kind. */
  ringKind?: FruitKind | null
}

/** The 3×5 tray of fruit, optionally dimming all-but-one kind. */
export function FruitGrid({ keep, ringKind = null }: FruitGridProps = {}) {
  const hasKeep = !!keep && keep.size > 0
  return (
    <svg
      viewBox={`0 0 ${Q18_VIEW_W} ${Q18_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 426, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <rect x={0} y={0} width={Q18_VIEW_W} height={Q18_VIEW_H} rx={18} fill={PANEL} />
      {Q18_GRID.map((row, r) =>
        row.map((f, c) => {
          const cx = PAD + c * CELL + CELL / 2
          const cy = PAD + r * CELL + CELL / 2
          const kept = !hasKeep || keep!.has(f)
          return (
            <g key={`${r}-${c}`} opacity={kept ? 1 : 0.25}>
              {ringKind === f && (
                <circle cx={cx} cy={cy} r={30} fill="none" stroke="#16A34A" strokeWidth={4} />
              )}
              <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={42}>
                {FRUIT_GLYPH[f]}
              </text>
            </g>
          )
        }),
      )}
    </svg>
  )
}

export default function P24G2Q18Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A tray of 15 fruit in 3 rows of 5: pineapples, oranges, pears, bananas, strawberries and one apple."
    >
      <FruitGrid />
    </div>
  )
}
