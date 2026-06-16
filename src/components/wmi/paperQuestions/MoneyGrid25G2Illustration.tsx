// In-card illustration for WMI-25F2A-Q24 (2025 Grade-2 Final, HARD).
//
// Source figure: db/seed/wmi/figures/2025-final-g2-a-q24.jpg — a 4×4 grid where
// each square holds a $5, $10, or $50 bill. To the RIGHT of each row sits a
// peach "$" coin with that row's total; BELOW each column sits a peach coin with
// that column's total. Four squares are shaded pink and labelled A, B, C, D:
//   A = (row 1, col 0)   C = (row 1, col 2)
//   B = (row 2, col 1)   D = (row 2, col 3)   (0-indexed; row 0 = top)
//
// Row sums (top→bottom): 80, 70, 25, 20.  Column sums (left→right): 75, 65, 30, 25.
//
// The placement has a UNIQUE solution (brute-forced over the three bill values):
//   row 0 ($80): 10  50  10  10
//   row 1 ($70): 50A  5  10C  5     ← A=50, C=10
//   row 2 ($25): 10   5B  5  5D     ← B=5,  D=5
//   row 3 ($20):  5   5   5  5
// So A=$50, B=$5, C=$10, D=$5  →  A + B + C + D = 50 + 5 + 10 + 5 = 70  (answer).
//
// The STATIC figure shows only the problem: the four given (unshaded) bills,
// the eight row/column totals, and the four shaded label cells A–D as EMPTY
// (their values are the answer and stay hidden). The revealable `reveal` prop is
// for the post-answer animator; the default export never passes it.

const INK = '#1F2937'

export type Cell = { value: 5 | 10 | 50; label?: 'A' | 'B' | 'C' | 'D' }

// Full reconstructed grid (row-major, row 0 = top). `label` marks the shaded
// squares whose values are the answer and must stay hidden in the static figure.
export const MONEY_GRID25: Cell[][] = [
  [{ value: 10 }, { value: 50 }, { value: 10 }, { value: 10 }],
  [{ value: 50, label: 'A' }, { value: 5 }, { value: 10, label: 'C' }, { value: 5 }],
  [{ value: 10 }, { value: 5, label: 'B' }, { value: 5 }, { value: 5, label: 'D' }],
  [{ value: 5 }, { value: 5 }, { value: 5 }, { value: 5 }],
]

export const ROW_SUMS25 = [80, 70, 25, 20] as const
export const COL_SUMS25 = [75, 65, 30, 25] as const

// The four shaded squares and their solved bill values.
export const SHADED25: Record<'A' | 'B' | 'C' | 'D', number> = { A: 50, B: 5, C: 10, D: 5 }
export const SHADED25_TOTAL = SHADED25.A + SHADED25.B + SHADED25.C + SHADED25.D // 70

// ---- geometry ----
const CELL = 52
const X0 = 14 // left padding
const Y0 = 14 // top padding
const COIN_GAP = 20 // gap from grid edge to coin centre
const COIN_R = 22

function Coin({ cx, cy, amount }: { cx: number; cy: number; amount: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={COIN_R} className="fill-qupu-peach stroke-qupu-brand-orange" strokeWidth={2} />
      <text
        x={cx}
        y={cy + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={18}
        fontWeight={900}
        fill={INK}
        className="font-display"
      >
        {amount}
      </text>
    </g>
  )
}

/**
 * The grid primitive. By default it shows the four shaded squares as EMPTY
 * labelled cells (problem-only). Pass `reveal` to fill A/B/C/D with their solved
 * bill values (post-answer use by the animator).
 */
export function MoneyGrid25Figure({ reveal = false }: { reveal?: boolean }) {
  const gridW = 4 * CELL
  const gridH = 4 * CELL
  // viewBox leaves headroom for the right column of coins and the bottom row of
  // coins (each a coin radius + gap + a "$" marker), plus a top-right "$" marker.
  const width = X0 + gridW + COIN_GAP + 2 * COIN_R + 14
  const height = Y0 + gridH + COIN_GAP + 2 * COIN_R + 14

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={Math.min(300, width)}
      style={{ display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* top-right "$" marker, above the row coins */}
      <text
        x={X0 + gridW + COIN_GAP + COIN_R}
        y={Y0 - 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={20}
        fontWeight={900}
        fill={INK}
        className="font-display"
      >
        $
      </text>

      {MONEY_GRID25.map((row, r) =>
        row.map((cell, c) => {
          const x = X0 + c * CELL
          const y = Y0 + r * CELL
          const shaded = cell.label != null
          const showValue = !shaded || reveal
          return (
            <g key={`${r}-${c}`}>
              <rect
                x={x}
                y={y}
                width={CELL}
                height={CELL}
                fill={shaded ? '#F6C6C6' : 'white'}
                stroke={INK}
                strokeWidth={1.8}
              />
              {showValue && (
                <text
                  x={x + CELL / 2}
                  y={y + CELL / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={16}
                  fontWeight={800}
                  fill={shaded ? '#B23B3B' : INK}
                  className="font-display"
                >
                  {cell.value}
                </text>
              )}
              {shaded && (
                // The A/B/C/D label sits in the lower-right corner of the cell,
                // matching the printed figure.
                <text
                  x={x + CELL - 8}
                  y={y + CELL - 9}
                  textAnchor="end"
                  dominantBaseline="central"
                  fontSize={13}
                  fontStyle="italic"
                  fontWeight={700}
                  fill={INK}
                >
                  {cell.label}
                </text>
              )}
            </g>
          )
        }),
      )}

      {/* row-sum coins on the right */}
      {ROW_SUMS25.map((s, r) => (
        <Coin
          key={`row-${r}`}
          cx={X0 + gridW + COIN_GAP + COIN_R}
          cy={Y0 + r * CELL + CELL / 2}
          amount={s}
        />
      ))}

      {/* bottom-left "$" marker, left of the column coins */}
      <text
        x={X0 - 4}
        y={Y0 + gridH + COIN_GAP + COIN_R + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={20}
        fontWeight={900}
        fill={INK}
        className="font-display"
      >
        $
      </text>

      {/* column-sum coins below */}
      {COL_SUMS25.map((s, c) => (
        <Coin
          key={`col-${c}`}
          cx={X0 + c * CELL + CELL / 2}
          cy={Y0 + gridH + COIN_GAP + COIN_R}
          amount={s}
        />
      ))}
    </svg>
  )
}

const ARIA =
  'Kisi 4 kali 4. Setiap kotak berisi uang $5, $10, atau $50. Di kanan tiap baris ada koin jumlah baris: $80, $70, $25, $20. Di bawah tiap kolom ada koin jumlah kolom: $75, $65, $30, $25. Empat kotak berarsir merah muda diberi label A, B, C, dan D; nilai uangnya dirahasiakan. Tentukan jumlah nilai uang di kotak A, B, C, dan D.'

export default function MoneyGrid25G2Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <MoneyGrid25Figure />
    </div>
  )
}
