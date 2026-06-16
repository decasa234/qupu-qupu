// WMI-22P3A-Q7 (2022 Grade 3 Semifinal) — "how many US dollars in total?"
//
// Recovered from db/seed/wmi/figures/2022-semifinal-g3-a-q7.jpg: a five-column
// table. The header row lists a bill value per column; below each header sit that
// many little bills:
//   $100 × 7   $50 × 5   $20 × 0 (empty)   $10 × 3   $5 × 5
//   ⇒ 700 + 250 + 0 + 30 + 25 = 1005   (answer C).
//
// The static figure shows ONLY the table of bills — it never reveals any column
// subtotal or the grand total; that summing is the animator's job. Pure render,
// no params needed (a fixed paper figure), SSR-safe & deterministic (no
// Math.random / Date). A co-exported `MoneyTable` primitive lets the animator
// ring one column and surface its subtotal while reusing the identical glyphs.

// ---- the five columns, left → right ----------------------------------------
export interface MoneyColumn {
  value: number // bill denomination
  count: number // how many bills are stacked in this column
}

export const COLUMNS: MoneyColumn[] = [
  { value: 100, count: 7 },
  { value: 50, count: 5 },
  { value: 20, count: 0 },
  { value: 10, count: 3 },
  { value: 5, count: 5 },
]

export const GRAND_TOTAL = COLUMNS.reduce((s, c) => s + c.value * c.count, 0) // 1005

// Bill tint per denomination — soft, distinct, echoing the scan's coloured notes.
const BILL_FILL: Record<number, string> = {
  100: '#CDE8D2', // greenish (the $100 in the scan)
  50: '#E3D7F0', // lilac
  20: '#F6E2C2', // tan
  10: '#F3CBB6', // peach
  5: '#D6E0F2', // pale blue
}
const BILL_EDGE = '#7A6F63'
const HEADER_FILL = '#FBF6DC' // pale cream header cell (matches scan)
const GRID = '#3A3A3A'
const INK = '#2B2119'

// ---- layout constants ------------------------------------------------------
const COL_W = 96
const HEADER_H = 56
const BILL_W = 34
const BILL_H = 16
const BILL_VGAP = 7
const BILL_HGAP = 6
const BILLS_PER_ROW = 2
const BODY_TOP_PAD = 14
const BODY_BOT_PAD = 14
const MARGIN = 12

// The body must be tall enough for the fullest column (7 bills ⇒ 4 rows).
const maxRows = Math.max(1, ...COLUMNS.map((c) => Math.ceil(c.count / BILLS_PER_ROW)))
const BODY_H = BODY_TOP_PAD + maxRows * (BILL_H + BILL_VGAP) - BILL_VGAP + BODY_BOT_PAD

const SUBTOTAL_H = 24 // extra headroom below the table for the animator's subtotals
const VIEW_W = MARGIN * 2 + COLUMNS.length * COL_W
const VIEW_H = MARGIN * 2 + HEADER_H + BODY_H + SUBTOTAL_H

/** Centred x positions for `n` bills laid out in rows of BILLS_PER_ROW. */
function billLayout(n: number, colCx: number, bodyTop: number): Array<{ x: number; y: number }> {
  const out: Array<{ x: number; y: number }> = []
  let placed = 0
  let row = 0
  while (placed < n) {
    const inRow = Math.min(BILLS_PER_ROW, n - placed)
    const rowW = inRow * BILL_W + (inRow - 1) * BILL_HGAP
    const startX = colCx - rowW / 2
    const y = bodyTop + BODY_TOP_PAD + row * (BILL_H + BILL_VGAP)
    for (let i = 0; i < inRow; i++) {
      out.push({ x: startX + i * (BILL_W + BILL_HGAP), y })
    }
    placed += inRow
    row += 1
  }
  return out
}

export interface MoneyTableProps {
  /** Ring one column (0..4) with the brand-orange accent. */
  highlight?: number | null
  /** Show the column subtotal under each ringed/active column. */
  subtotalFor?: number | null
}

/**
 * MoneyTable — the shared five-column bill table. With the defaults it is the
 * plain problem figure (no ring, no subtotals). `highlight` rings one column;
 * `subtotalFor` prints that column's "value × count = subtotal" beneath it.
 */
export function MoneyTable({ highlight = null, subtotalFor = null }: MoneyTableProps = {}) {
  const bodyTop = MARGIN + HEADER_H

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* outer table border */}
      <rect
        x={MARGIN}
        y={MARGIN}
        width={COLUMNS.length * COL_W}
        height={HEADER_H + BODY_H}
        fill="#FFFFFF"
        stroke={GRID}
        strokeWidth={2.5}
      />

      {COLUMNS.map((col, i) => {
        const x = MARGIN + i * COL_W
        const cx = x + COL_W / 2
        const lit = highlight === i
        const bills = billLayout(col.count, cx, bodyTop)
        return (
          <g key={i}>
            {/* header cell */}
            <rect x={x} y={MARGIN} width={COL_W} height={HEADER_H} fill={HEADER_FILL} stroke={GRID} strokeWidth={1.5} />
            <text
              x={cx}
              y={MARGIN + HEADER_H / 2 + 9}
              textAnchor="middle"
              fontSize={26}
              fontWeight={800}
              fill={INK}
            >
              {`$${col.value}`}
            </text>

            {/* body cell divider */}
            <rect x={x} y={bodyTop} width={COL_W} height={BODY_H} fill="none" stroke={GRID} strokeWidth={1.5} />

            {/* bills */}
            {bills.map((b, k) => (
              <g key={k}>
                <rect
                  x={b.x}
                  y={b.y}
                  width={BILL_W}
                  height={BILL_H}
                  rx={2.5}
                  fill={BILL_FILL[col.value]}
                  stroke={BILL_EDGE}
                  strokeWidth={1.4}
                />
                {/* a tiny centre oval so the rectangle reads as a banknote */}
                <ellipse cx={b.x + BILL_W / 2} cy={b.y + BILL_H / 2} rx={5} ry={4} fill="none" stroke={BILL_EDGE} strokeWidth={1} />
              </g>
            ))}

            {/* highlight ring around the whole column (header + body) */}
            {lit && (
              <rect
                x={x - 2}
                y={MARGIN - 2}
                width={COL_W + 4}
                height={HEADER_H + BODY_H + 4}
                rx={6}
                fill="none"
                stroke="#f0853a"
                strokeWidth={3.5}
              />
            )}

            {/* column subtotal beneath, animator only */}
            {subtotalFor === i && (
              <text
                x={cx}
                y={MARGIN + HEADER_H + BODY_H + 14}
                textAnchor="middle"
                fontSize={15}
                fontWeight={800}
                fill="#9A3412"
              >
                {`= ${col.value * col.count}`}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

const ARIA =
  'Tabel lima kolom uang dolar AS. Kolom $100 berisi 7 lembar, $50 berisi 5 lembar, ' +
  '$20 kosong, $10 berisi 3 lembar, dan $5 berisi 5 lembar. Berapa total uangnya?'

/**
 * WMI-22P3A-Q7 question figure — the five-column bill table with no ring and no
 * subtotals. Reveals neither any subtotal nor the grand total.
 */
export default function P22G3Q7Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={ARIA}
    >
      <MoneyTable />
    </div>
  )
}
