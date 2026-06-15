// WMI-21P1A-Q16 (2021 Semifinal Grade 1) — "A row of fruit icons forms a
// repeating pattern. What should be filled into the bracket so that the marked
// fruit is the 10th fruit counting from the right?" (answer C).
//
// The scanned figure db/seed/wmi/figures/2021-semifinal-g1-a-q16.jpg only
// captured a single grape icon (the full pattern row and the four option icons
// were separate images that were not extracted). To keep the question
// self-contained we reconstruct a clean, verifiable instance:
//
//   • The repeating cycle (length 3) is  apple, grape, cherry.
//   • The row shows 12 fruits, positions 1..12 left → right, following the cycle.
//   • One cell is shown as an empty bracket "( )" — the cell to be filled.
//   • That bracket cell is the MARKED cell, and it is the 10th fruit counting
//     from the right (12 − 3 + 1 = 10, i.e. it sits at position 3 from the left).
//   • Continuing the repeating cycle, position 3 must be CHERRY.
//
// So the bracket must hold a cherry. The four answer options are
//   A apple · B grape · C cherry · D banana  →  the correct one is C (cherry).
//
// This file draws ONLY the problem: the repeating fruit row with one bracketed,
// marked cell, plus the four option icons A–D. It never reveals which option is
// correct. The co-exported FruitGlyph / CYCLE / OPTION constants let the
// explainer reuse the exact same icons.
//
// Pure render, SSR-safe & deterministic (no window/document at module top, no
// Math.random / Date.now, no state). Only single-codepoint fruit emoji are used.

export type Fruit = 'apple' | 'grape' | 'cherry' | 'banana'

export const FRUIT_EMOJI: Record<Fruit, string> = {
  apple: '🍎',
  grape: '🍇',
  cherry: '🍒',
  banana: '🍌',
}

/** The repeating cycle (length 3). Position p (1-indexed) → CYCLE[(p-1) % 3]. */
export const CYCLE: ReadonlyArray<Fruit> = ['apple', 'grape', 'cherry']

/** Total fruits drawn in the row. */
export const ROW_LEN = 12

/** The bracketed / marked cell (1-indexed from the left). It is the 10th from
 * the right because ROW_LEN − MARK_POS + 1 = 12 − 3 + 1 = 10. */
export const MARK_POS = ROW_LEN - 10 + 1 // = 3

/** The fruit the repeating cycle requires at the marked cell. */
export const ANSWER_FRUIT: Fruit = CYCLE[(MARK_POS - 1) % CYCLE.length] // cherry

/** Option label → fruit (the printed options were images). */
export const OPTIONS: Record<'A' | 'B' | 'C' | 'D', Fruit> = {
  A: 'apple',
  B: 'grape',
  C: 'cherry',
  D: 'banana',
}

/** The correct option letter (the one whose fruit matches ANSWER_FRUIT). */
export const ANSWER_LABEL = (Object.keys(OPTIONS) as Array<'A' | 'B' | 'C' | 'D'>).find(
  (k) => OPTIONS[k] === ANSWER_FRUIT,
) as 'A' | 'B' | 'C' | 'D' // = 'C'

const INK = '#1F2937'
const BRACKET = '#30598A'

/** One fruit icon centred at (cx, cy); `size` is the emoji font size. */
export function FruitGlyph({ fruit, cx, cy, size = 22 }: { fruit: Fruit; cx: number; cy: number; size?: number }) {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={size} aria-hidden="true">
      {FRUIT_EMOJI[fruit]}
    </text>
  )
}

/** An empty answer bracket "( )" centred at (cx, cy). */
export function BracketCell({ cx, cy, size = 24, color = BRACKET }: { cx: number; cy: number; size?: number; color?: string }) {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={size} fontWeight={900} fill={color} className="font-display">
      ( )
    </text>
  )
}

export const Q16_VIEW_W = 392
export const Q16_VIEW_H = 168

const ROW_Y = 48
const ROW_X0 = 24
const ROW_STEP = 30

const OPT_Y = 132
const OPT_X0 = 64
const OPT_STEP = 84

export default function P21G1Q16Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Sebaris ikon buah berpola berulang dengan satu sel kosong bertanda kurung yang juga ditandai. Buah pada sel itu harus menjadi buah ke-10 dihitung dari kanan. Isi tanda kurung dari pilihan A apel, B anggur, C ceri, D pisang."
    >
      <svg
        viewBox={`0 0 ${Q16_VIEW_W} ${Q16_VIEW_H}`}
        width="100%"
        style={{ maxWidth: 392, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* The repeating row. The marked cell shows a bracket + a star marker. */}
        {Array.from({ length: ROW_LEN }).map((_, i) => {
          const pos = i + 1
          const cx = ROW_X0 + i * ROW_STEP
          const isMark = pos === MARK_POS
          if (isMark) {
            return (
              <g key={pos}>
                {/* highlight ring on the marked cell */}
                <rect x={cx - 13} y={ROW_Y - 15} width={26} height={30} rx={5} fill="none" stroke={BRACKET} strokeWidth={2} strokeDasharray="3 3" />
                <BracketCell cx={cx} cy={ROW_Y} />
                {/* star marker above the marked cell */}
                <text x={cx} y={ROW_Y - 24} textAnchor="middle" dominantBaseline="central" fontSize={14} aria-hidden="true">
                  ⭐
                </text>
              </g>
            )
          }
          return <FruitGlyph key={pos} fruit={CYCLE[i % CYCLE.length]} cx={cx} cy={ROW_Y} />
        })}

        {/* "from the right →" hint arrow under the row */}
        <line x1={ROW_X0 - 6} y1={ROW_Y + 26} x2={ROW_X0 + (ROW_LEN - 1) * ROW_STEP + 6} y2={ROW_Y + 26} stroke="#9CA3AF" strokeWidth={1.4} />
        <text x={ROW_X0 + (ROW_LEN - 1) * ROW_STEP - 4} y={ROW_Y + 40} textAnchor="end" fontSize={11} fontWeight={700} fill="#6B7280" className="font-display">
          {'← hitung dari kanan'}
        </text>

        {/* The four answer options A–D. */}
        {(Object.keys(OPTIONS) as Array<'A' | 'B' | 'C' | 'D'>).map((label, i) => {
          const cx = OPT_X0 + i * OPT_STEP
          return (
            <g key={label}>
              <text x={cx - 22} y={OPT_Y} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={900} fill={INK} className="font-display">
                {`(${label})`}
              </text>
              <FruitGlyph fruit={OPTIONS[label]} cx={cx + 8} cy={OPT_Y} />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
