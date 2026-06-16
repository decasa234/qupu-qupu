// In-card illustration for WMI-25F3A-Q14 (2025 Grade-3 Final, multiplication grid).
// Reconstructed faithfully from db/seed/wmi/figures/2025-final-g3-a-q14.jpg.
//
// Scan layout (4×4 coordinate grid, only the plus/cross cells exist):
//   row 0:        [91 shaded] at col 1                     (top spur)
//   row 1: [56 shaded col 0] [white col 1] [white col 2]  (left arm)
//   row 2:        [white col 1] [white col 2] [? shaded col 3] (right arm)
//   row 3:                      [48 shaded] at col 2      (bottom spur)
//
// Product rule (shaded = product of the two white cells in its row/column):
//   col 1: A×C = 91 = 7×13,  row 1: A×B = 56 = 7×8   → A=7, B=8, C=13
//   col 2: B×D = 48 = 8×6                               → D=6
//   row 2: C×D = ? = 13×6 = 78   (digit sum 7+8 = 15, answer D)
//
// Data exported so an explainer can bind to the same values without drift.

const INK = '#1F2937'
// Shaded cells are mint-green in the scan (matching ProductGrid25G2Illustration.tsx).
const SHADE = '#D6E8DC'

export type MultCell =
  | { kind: 'shaded'; label: string | number }
  | { kind: 'white' }

// Sparse cross grid: only the cells present in the scan. Keyed by `${r}-${c}`.
export const MULT_GRID25G3: Record<string, MultCell> = {
  '0-1': { kind: 'shaded', label: 91 },
  '1-0': { kind: 'shaded', label: 56 },
  '1-1': { kind: 'white' },
  '1-2': { kind: 'white' },
  '2-1': { kind: 'white' },
  '2-2': { kind: 'white' },
  '2-3': { kind: 'shaded', label: '?' },
  '3-2': { kind: 'shaded', label: 48 },
}

// White-cell values: A=(1,1)=7, B=(1,2)=8, C=(2,1)=13, D=(2,2)=6
export const MULT_SOLUTION25G3 = { A: 7, B: 8, C: 13, D: 6 }
// The value of "?": C×D = 13×6 = 78; digit sum = 7+8 = 15 (answer D)
export const MULT_Q_VALUE25G3 = 78

const CELL = 52
const PAD = 12

export function MultGrid25G3Figure({
  whites,
  revealQ,
}: {
  whites?: Partial<Record<'A' | 'B' | 'C' | 'D', number>>
  revealQ?: boolean
}) {
  // Map white-cell coordinates to their factor names for optional reveals.
  const whiteName: Record<string, 'A' | 'B' | 'C' | 'D'> = {
    '1-1': 'A',
    '1-2': 'B',
    '2-1': 'C',
    '2-2': 'D',
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
      {Object.entries(MULT_GRID25G3).map(([key, cell]) => {
        const [r, c] = key.split('-').map(Number)
        const x = PAD + c * CELL
        const y = PAD + r * CELL
        const isShaded = cell.kind === 'shaded'

        let text: string | number | null = isShaded ? cell.label : null

        if (cell.kind === 'white') {
          const name = whiteName[key]
          if (name && whites?.[name] != null) text = whites[name]!
        }

        if (isShaded && cell.label === '?' && revealQ) text = MULT_Q_VALUE25G3

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

export function MultGrid25G3Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Susunan kotak berbentuk plus. Kotak berbayang adalah hasil kali dua kotak putih di baris atau kolomnya: 91 di atas (kolom kiri), 56 di kiri (baris atas), tanda tanya di kanan (baris bawah), dan 48 di bawah (kolom kanan). Cari nilai tanda tanya, lalu jumlahkan digitnya."
    >
      <MultGrid25G3Figure />
    </div>
  )
}

export default MultGrid25G3Illustration
