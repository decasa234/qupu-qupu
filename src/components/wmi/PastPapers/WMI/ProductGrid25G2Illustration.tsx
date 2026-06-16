// In-card illustration for WMI-25F2A-Q19 (2025 Grade-2 Final, product grid).
// Reconstructed faithfully from db/seed/wmi/figures/2025-final-g2-a-q19.jpg.
//
// FLAG: the body asks for the SUM of TWO "?" values, but the captured scan
// shows only ONE "?" (a second sub-grid is missing from the OCR). This figure
// draws ONLY what is in the scan — the single cross-shaped grid with one "?".
// The missing second grid is NOT invented here.
//
// Scan layout (4x4 coordinate grid, only the plus/cross cells exist):
//   row 0:                 [42 shaded] at col 1                  (top spur)
//   row 1:        [white col1] [white col2] [30 shaded col3]     (right arm)
//   row 2:  [56 shaded col0] [white col1] [white col2]          (left arm)
//   row 3:                              [? shaded] at col 2      (bottom spur)
//
// Product rule (shaded = product of the two white cells in its row/column):
//   col 1: a*c = 42, row 1: a*b = 30, row 2: c*d = 56  ->  a=6,b=5,c=7,d=8
//   col 2: b*d = ? = 5*8 = 40   (the single visible "?")
//
// Data is exported so an explainer can bind to the same cells (no drift).

const INK = '#1F2937'
// Scan's shaded cells are a light mint-green; no qupu green token exists, so
// (as in puzzles20G2Illustrations.tsx) a scan-faithful raw hex is used here.
const SHADE = '#D6E8DC'

export type ProductCell =
  | { kind: 'shaded'; label: string | number }
  | { kind: 'white' }

// Sparse cross grid: only the cells present in the scan. Keyed by `${r}-${c}`.
export const PRODUCT_GRID25: Record<string, ProductCell> = {
  '0-1': { kind: 'shaded', label: 42 },
  '1-1': { kind: 'white' },
  '1-2': { kind: 'white' },
  '1-3': { kind: 'shaded', label: 30 },
  '2-0': { kind: 'shaded', label: 56 },
  '2-1': { kind: 'white' },
  '2-2': { kind: 'white' },
  '3-2': { kind: 'shaded', label: '?' },
}

// Solved white-cell values (for an explainer that wants to reveal them).
export const PRODUCT_SOLUTION25 = { a: 6, b: 5, c: 7, d: 8 }
// Visible "?" value (col 2 = b*d). The paper key totals 61 across TWO "?" —
// the second "?" lives in a sub-grid missing from the scan.
export const VISIBLE_Q_VALUE25 = 40

const CELL = 52
const PAD = 12

export function ProductGrid25Figure({
  whites,
  revealQ,
}: {
  whites?: Partial<Record<'a' | 'b' | 'c' | 'd', number>>
  revealQ?: boolean
}) {
  // Map white cell coordinates to the a/b/c/d names for optional reveals.
  const whiteName: Record<string, 'a' | 'b' | 'c' | 'd'> = {
    '1-1': 'a',
    '1-2': 'b',
    '2-1': 'c',
    '2-2': 'd',
  }
  const cols = 4
  const rows = 4
  const width = PAD * 2 + cols * CELL
  const height = PAD * 2 + rows * CELL
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxWidth: 250, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {Object.entries(PRODUCT_GRID25).map(([key, cell]) => {
        const [r, c] = key.split('-').map(Number)
        const x = PAD + c * CELL
        const y = PAD + r * CELL
        const isShaded = cell.kind === 'shaded'
        let text: string | number | null = isShaded ? cell.label : null
        if (cell.kind === 'white') {
          const name = whiteName[key]
          if (name && whites?.[name] != null) text = whites[name]!
        }
        if (isShaded && cell.label === '?' && revealQ) text = VISIBLE_Q_VALUE25
        return (
          <g key={key}>
            <rect
              x={x}
              y={y}
              width={CELL}
              height={CELL}
              fill={isShaded ? SHADE : 'white'}
              stroke={INK}
              strokeWidth={2}
            />
            {text != null && (
              <text
                x={x + CELL / 2}
                y={y + CELL / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={22}
                fontWeight={800}
                fill={INK}
                className="font-display"
              >
                {text}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export function ProductGrid25G2Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label="Sebuah susunan kotak berbentuk plus. Kotak arsiran adalah hasil kali dua kotak putih di baris atau kolomnya: kolom dengan 42, baris dengan 30, baris dengan 56, dan satu kotak arsiran bertanda tanya. Cari jumlah dari nilai tanda tanya.">
      <ProductGrid25Figure />
    </div>
  )
}

export default ProductGrid25G2Illustration
