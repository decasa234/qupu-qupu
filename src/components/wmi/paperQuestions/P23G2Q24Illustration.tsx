// WMI-23P2A-Q24 (2023 Semifinal Grade 2 Paper A) — a fruit "product table".
//
// Source figure (db/seed/wmi/figures/2023-semifinal-g2-a-q24.jpg): a 3×3 grid of
// fruit pictures, each row's product printed at its right, with a legend below:
//   row 0:  apple  banana  banana   = 16
//   row 1:  apple  banana  cherry   = 56
//   row 2:  banana banana  cherry   = 28
//   legend: apple = (pink, unknown)   banana = 8   cherry = (blue, unknown)
// The question gives banana = 8 and asks for apple + cherry (answer letter D).
//
// The static figure draws ONLY the problem — the three fruit rows, their printed
// products, and the legend. It NEVER shows apple's or cherry's value or the sum;
// that is the explainer's job, via the co-exported FruitRow primitive.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic. Fruit glyphs
// are single-codepoint emoji (🍎 🍌 🍒).

export type Fruit = 'apple' | 'banana' | 'cherry'

export const FRUIT_GLYPH: Record<Fruit, string> = {
  apple: '🍎',
  banana: '🍌',
  cherry: '🍒',
}

/** The three rows exactly as printed, with the product at the row's right. */
export const ROWS: ReadonlyArray<{ cells: Fruit[]; product: number }> = [
  { cells: ['apple', 'banana', 'banana'], product: 16 },
  { cells: ['apple', 'banana', 'cherry'], product: 56 },
  { cells: ['banana', 'banana', 'cherry'], product: 28 },
]

/** The given value (printed in the legend). */
export const BANANA = 8

const INK = '#1F2937'
export const APPLE_CHIP = '#EC2C8E' // pink legend dot under the apple column
export const CHERRY_CHIP = '#16A7E0' // blue legend dot under the cherry column

// ---- layout ----------------------------------------------------------------
const PAD = 14
const CELL = 58
const COLS = 3
const ROWS_N = 3
const BOARD_W = COLS * CELL
const BOARD_H = ROWS_N * CELL
const PRODUCT_W = 64 // room for "= 56" at the right
const LEGEND_H = 64

const VIEW_W = PAD * 2 + BOARD_W + PRODUCT_W
const VIEW_H = PAD * 2 + BOARD_H + LEGEND_H

const gx = (c: number) => PAD + c * CELL
const gy = (r: number) => PAD + r * CELL

export interface FruitTable23Props {
  /** Rows whose product is currently outlined (the equations under discussion). */
  markRows?: ReadonlyArray<number> | null
  /**
   * Resolved fruit values to print in the legend, e.g. { apple: 24, cherry: 7 }.
   * Omit a fruit to leave its legend slot as the bare colour dot (unknown).
   */
  reveal?: Partial<Record<Fruit, number>> | null
}

/**
 * Bare fruit product-table + legend, with optional row-highlight / legend-reveal
 * overlays for the explainer. By itself it shows only the printed problem.
 */
export function FruitTable23({ markRows = null, reveal = null }: FruitTable23Props = {}) {
  const rowSet = new Set(markRows ?? [])

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* highlighted rows: faint blue wash across the cells + product */}
      {[...rowSet].map((r) => (
        <rect
          key={`hr-${r}`}
          x={gx(0) - 4}
          y={gy(r)}
          width={BOARD_W + PRODUCT_W}
          height={CELL}
          rx={6}
          fill="rgba(48,89,138,0.12)"
        />
      ))}

      {/* outer board + grid lines */}
      <rect x={gx(0)} y={gy(0)} width={BOARD_W} height={BOARD_H} fill="none" stroke={INK} strokeWidth={2.5} />
      {Array.from({ length: COLS - 1 }, (_, i) => i + 1).map((i) => (
        <line key={`v${i}`} x1={gx(i)} y1={gy(0)} x2={gx(i)} y2={gy(ROWS_N)} stroke={INK} strokeWidth={2} />
      ))}
      {Array.from({ length: ROWS_N - 1 }, (_, i) => i + 1).map((i) => (
        <line key={`h${i}`} x1={gx(0)} y1={gy(i)} x2={gx(COLS)} y2={gy(i)} stroke={INK} strokeWidth={2} />
      ))}

      {/* fruit glyphs */}
      {ROWS.map((row, r) =>
        row.cells.map((fruit, c) => (
          <text
            key={`f-${r}-${c}`}
            x={gx(c) + CELL / 2}
            y={gy(r) + CELL / 2 + 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={32}
          >
            {FRUIT_GLYPH[fruit]}
          </text>
        )),
      )}

      {/* printed products at the right of each row */}
      {ROWS.map((row, r) => (
        <text
          key={`p-${r}`}
          x={gx(COLS) + 12}
          y={gy(r) + CELL / 2}
          textAnchor="start"
          dominantBaseline="central"
          fontSize={22}
          fontWeight={900}
          fill={INK}
          className="font-display"
        >
          {`= ${row.product}`}
        </text>
      ))}

      {/* legend below: one entry per column (apple, banana, cherry) */}
      {(['apple', 'banana', 'cherry'] as Fruit[]).map((fruit, c) => {
        const cx = gx(c) + CELL / 2
        const cy = gy(ROWS_N) + 30
        return (
          <g key={`leg-${fruit}`}>
            {/* the "=" tie marks */}
            <text
              x={cx}
              y={gy(ROWS_N) + 8}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={16}
              fontWeight={900}
              fill={INK}
            >
              =
            </text>
            {fruit === 'banana' ? (
              <text
                x={cx}
                y={cy + 4}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={22}
                fontWeight={900}
                fill={INK}
                className="font-display"
              >
                {BANANA}
              </text>
            ) : (
              <>
                <circle cx={cx} cy={cy} r={15} fill={fruit === 'apple' ? APPLE_CHIP : CHERRY_CHIP} />
                {reveal && typeof reveal[fruit] === 'number' && (
                  <text
                    x={cx}
                    y={cy + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={15}
                    fontWeight={900}
                    fill="#FFFFFF"
                    className="font-display"
                  >
                    {reveal[fruit]}
                  </text>
                )}
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/** Default export: bare problem — fruit rows, products, legend; no answer. */
export default function P23G2Q24Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Tabel 3 baris buah; hasil kali tiap baris ditulis di kanannya: apel × pisang × pisang = 16, apel × pisang × ceri = 56, pisang × pisang × ceri = 28. Diberi pisang = 8; cari apel + ceri."
    >
      <FruitTable23 />
    </div>
  )
}
