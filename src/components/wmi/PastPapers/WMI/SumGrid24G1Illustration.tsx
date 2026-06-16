// Sum-grid figure for WMI-24F1A-Q25 (2024 Grade 1 Final).
//
// "Fill the numbers 1-9 into the squares so each ROW uses 1-9. Each CIRCLE below
// holds the sum of the three squares directly above it, and the three numbers
// stacked vertically in a column are all DIFFERENT (e.g. 2 + 9 + 6 = 17).
// Find ● + ◆ - ★."  Answer: 10 (fill-in).
//
// LAYOUT — 3 rows x 9 columns of squares; a sum-circle sits under each column.
// Givens transcribed from the source table (?? = blank cell, ●/◆/★ = the three
// unknown target cells the question asks about):
//
//   row 1:  [●]  3  [ ]  6   9  [ ]  4   2  [ ]
//   row 2:   6  [ ]  4  [◆] [ ] [ ]  1  [ ]  9
//   row 3:  [ ]  8  [ ]  9   4  [ ] [ ] [★]  6
//
// Each row is a permutation of 1..9; each column's three entries are distinct;
// the circle under a column is that column's sum.
//
// SOLVER NOTE (throwaway tsx solver, since deleted) — IMPORTANT for downstream
// roles: the transcribed givens above do NOT uniquely determine the grid. The
// row-permutation + column-distinctness constraints alone leave the grid
// massively under-constrained (>40k completions per row-1 alignment; ● + ◆ - ★
// ranges over -4..15). The genuinely binding constraint in the published puzzle
// is the printed VALUE inside each sum-circle, which was not transcribed. The
// canonical answer is 10 (e.g. ● = 8, ◆ = 3, ★ = 1 -> 8 + 3 - 1 = 10), and that
// triple IS achievable, but it is not forced by the data we have. So this figure
// draws ONLY the setup (givens + ●/◆/★ markers + EMPTY circles) and never asserts
// a solution. The `solved` reference filling below is one fully self-consistent
// completion (rows are 1..9 permutations, every column distinct) that yields
// 8 + 3 - 1 = 10; it is for the post-answer animation ONLY.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

const INK = '#1F2937' // grid lines + given numbers
const GIVEN = '#2B2622' // fixed given numbers (matches the scan's black ink)
const FILLED = '#30598a' // qupu brand blue — numbers the animator drops in
const MARK = '#f0853a' // qupu brand orange — the ●/◆/★ target glyphs
const CIRCLE_LINE = '#30598a' // sum-circle outline (qupu brand blue)

export const ROWS = 3
export const COLS = 9

/** A target marker living in an unknown cell. */
export type Marker = 'bullet' | 'diamond' | 'star'

/** A cell is either a given number, a target marker, or an empty blank. */
type CellSpec = { given?: number; mark?: Marker }

/**
 * The transcribed source grid, row-major. `given` = printed number; `mark` =
 * one of the three asked-about cells; an empty object = a blank square.
 */
export const GRID: ReadonlyArray<ReadonlyArray<CellSpec>> = [
  [{ mark: 'bullet' }, { given: 3 }, {}, { given: 6 }, { given: 9 }, {}, { given: 4 }, { given: 2 }, {}],
  [{ given: 6 }, {}, { given: 4 }, { mark: 'diamond' }, {}, {}, { given: 1 }, {}, { given: 9 }],
  [{}, { given: 8 }, {}, { given: 9 }, { given: 4 }, {}, {}, { mark: 'star' }, { given: 6 }],
]

/**
 * One fully self-consistent reference completion (rows are permutations of 1..9,
 * every column has three distinct entries) giving ● = 8, ◆ = 3, ★ = 1 so that
 * ● + ◆ - ★ = 10. Used ONLY when the animator passes `solved`. The static
 * question figure never shows these numbers.
 */
const SOLVED: ReadonlyArray<ReadonlyArray<number>> = [
  [8, 3, 5, 6, 9, 7, 4, 2, 1],
  [6, 2, 4, 3, 5, 8, 1, 7, 9],
  [2, 8, 3, 9, 4, 5, 7, 1, 6],
]

// --- layout -----------------------------------------------------------------
const PAD_X = 14
const PAD_TOP = 14
const CELL = 30
const GRID_W = COLS * CELL
const GRID_H = ROWS * CELL

const CIRCLE_GAP = 16 // vertical gap between grid bottom and circle centres
const CIRCLE_R = 13

const VIEW_W = PAD_X * 2 + GRID_W
const VIEW_H = PAD_TOP + GRID_H + CIRCLE_GAP + CIRCLE_R * 2 + 12

const gx = (c: number) => PAD_X + c * CELL
const gy = (r: number) => PAD_TOP + r * CELL
const circleCx = (c: number) => gx(c) + CELL / 2
const circleCy = PAD_TOP + GRID_H + CIRCLE_GAP + CIRCLE_R

/** A small filled five-pointed star centred at (cx, cy). */
function StarGlyph({ cx, cy }: { cx: number; cy: number }) {
  const R = 9
  const inner = R * 0.42
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rad = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 === 0 ? R : inner
    pts.push(`${(cx + rr * Math.cos(rad)).toFixed(2)},${(cy + rr * Math.sin(rad)).toFixed(2)}`)
  }
  return <polygon points={pts.join(' ')} fill={MARK} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
}

/** A small filled diamond centred at (cx, cy). */
function DiamondGlyph({ cx, cy }: { cx: number; cy: number }) {
  const R = 8.5
  const pts = [
    `${cx},${cy - R}`,
    `${cx + R},${cy}`,
    `${cx},${cy + R}`,
    `${cx - R},${cy}`,
  ].join(' ')
  return <polygon points={pts} fill={MARK} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
}

/** A small filled bullet (disc) centred at (cx, cy). */
function BulletGlyph({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r={8} fill={MARK} stroke={INK} strokeWidth={1.4} />
}

function MarkerGlyph({ mark, cx, cy }: { mark: Marker; cx: number; cy: number }) {
  if (mark === 'star') return <StarGlyph cx={cx} cy={cy} />
  if (mark === 'diamond') return <DiamondGlyph cx={cx} cy={cy} />
  return <BulletGlyph cx={cx} cy={cy} />
}

export interface SumGrid24G1Props {
  /**
   * When true, fill every square with the reference completion and print each
   * column's sum inside its circle. Animator-only — the default question figure
   * shows the bare setup (givens + markers + empty circles, no answer).
   */
  solved?: boolean
}

/**
 * Bare 3x9 sum-grid primitive: givens, the ●/◆/★ target markers, and the empty
 * column-sum circles. With `solved` it overlays one self-consistent completion
 * plus the column sums (post-answer animation). By itself it reveals nothing
 * about the filling or about ● + ◆ - ★.
 */
export function SumGrid24G1({ solved = false }: SumGrid24G1Props = {}) {
  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={Math.min(300, VIEW_W)} aria-hidden="true">
      {/* outer board */}
      <rect x={PAD_X} y={PAD_TOP} width={GRID_W} height={GRID_H} fill="#FFFFFF" stroke={INK} strokeWidth={2.5} />

      {/* interior vertical grid lines */}
      {Array.from({ length: COLS - 1 }, (_, i) => i + 1).map((i) => (
        <line key={`v-${i}`} x1={gx(i)} y1={gy(0)} x2={gx(i)} y2={gy(ROWS)} stroke={INK} strokeWidth={1.5} />
      ))}
      {/* interior horizontal grid lines */}
      {Array.from({ length: ROWS - 1 }, (_, i) => i + 1).map((i) => (
        <line key={`h-${i}`} x1={gx(0)} y1={gy(i)} x2={gx(COLS)} y2={gy(i)} stroke={INK} strokeWidth={1.5} />
      ))}

      {/* cell contents */}
      {GRID.map((row, r) =>
        row.map((cell, c) => {
          const cx = gx(c) + CELL / 2
          const cy = gy(r) + CELL / 2
          // Solved overlay: print every square's number in brand blue (givens stay ink).
          if (solved) {
            const isGiven = typeof cell.given === 'number'
            return (
              <text
                key={`s-${r}-${c}`}
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={17}
                fontWeight={800}
                fill={isGiven ? GIVEN : FILLED}
              >
                {SOLVED[r][c]}
              </text>
            )
          }
          // Bare figure: given number, target marker, or empty.
          if (typeof cell.given === 'number') {
            return (
              <text
                key={`g-${r}-${c}`}
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={17}
                fontWeight={800}
                fill={GIVEN}
              >
                {cell.given}
              </text>
            )
          }
          if (cell.mark) {
            return <MarkerGlyph key={`m-${r}-${c}`} mark={cell.mark} cx={cx} cy={cy} />
          }
          return null
        }),
      )}

      {/* column-sum circles under every column */}
      {Array.from({ length: COLS }, (_, c) => {
        const cx = circleCx(c)
        const sum = SOLVED[0][c] + SOLVED[1][c] + SOLVED[2][c]
        return (
          <g key={`c-${c}`}>
            {/* thin connector from the column down to its circle */}
            <line
              x1={cx}
              y1={PAD_TOP + GRID_H}
              x2={cx}
              y2={circleCy - CIRCLE_R}
              stroke={CIRCLE_LINE}
              strokeWidth={1.2}
            />
            <circle cx={cx} cy={circleCy} r={CIRCLE_R} fill="#FFFFFF" stroke={CIRCLE_LINE} strokeWidth={2} />
            {solved && (
              <text
                x={cx}
                y={circleCy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={13}
                fontWeight={800}
                fill={FILLED}
              >
                {sum}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// Indonesian aria description — names the givens + markers, never the answer.
const ARIA =
  'Kisi 3 baris dan 9 kolom. Setiap baris diisi bilangan 1 sampai 9. ' +
  'Baris atas: bulatan, 3, kosong, 6, 9, kosong, 4, 2, kosong. ' +
  'Baris tengah: 6, kosong, 4, belah ketupat, kosong, kosong, 1, kosong, 9. ' +
  'Baris bawah: kosong, 8, kosong, 9, 4, kosong, kosong, bintang, 6. ' +
  'Di bawah tiap kolom ada lingkaran berisi jumlah tiga bilangan di atasnya, ' +
  'dan tiga bilangan dalam satu kolom semuanya berbeda. Cari bulatan tambah belah ketupat kurang bintang.'

/** Question figure — bare setup, no answer revealed. Sits in the card, no box. */
export default function SumGrid24G1Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <SumGrid24G1 />
    </div>
  )
}
