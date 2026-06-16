// Symbol sum-grid figure for WMI-24F2A-Q25 (2024 Grade 2 Final, HARD).
//
// "Fill the numbers 1-9 into the squares so each ROW uses 1-9. Each CIRCLE below
// holds the sum of the three squares directly above it, and the three numbers
// stacked vertically in a column are all DIFFERENT. The printed circle sums are
// 15, 17, 14, 18, 13, 16, 9, 16, 17. Find ● + ◆ - ★."  Answer: 10 (fill-in).
//
// LAYOUT — 3 rows x 9 columns of squares; a grey sum-circle sits under each
// column carrying that column's total. Transcribed faithfully from the source
// scan (`[ ]` = blank cell; ●/◆/★ = the three unknown target cells the question
// asks about). Column index | top | mid | bot | printed circle sum:
//
//   col 0:  [ ]   6   [ ]   -> 15
//   col 1:  [●]  [ ]   8    -> 17
//   col 2:   3    4   [ ]   -> 14
//   col 3:  [ ]  [◆]   9    -> 18
//   col 4:   6   [ ]   4    -> 13
//   col 5:   9   [ ]  [ ]   -> 16
//   col 6:  [ ]   1   [ ]   ->  9
//   col 7:   4   [ ]  [★]   -> 16
//   col 8:   2    9    6    -> 17
//
// Each row is a permutation of 1..9; each column's three entries are distinct;
// the grey circle under a column is that column's sum.
//
// SOLUTION (for the explainer / post-answer animation ONLY — never drawn in the
// bare question figure). The printed circle sums force the three marked cells:
//   col 1 sum 17:  ● + ? + 8 = 17  with the column distinct  ->  ● = 7  (mid = 2)
//   col 3 sum 18:  1 + ◆ + 9 = 18                            ->  ◆ = 8  (top = 1)
//   col 7 sum 16:  4 + 7 + ★ = 16                            ->  ★ = 5  (mid = 7)
// Hence ● + ◆ - ★ = 7 + 8 - 5 = 10.
//
// Pure render: no Math.random, no Date, no state — SSR-safe & deterministic.

// Palette — shared with the post-answer explainer (it mirrors this scene).
export const INK = '#1F2937' // grid lines + given numbers
export const GIVEN = '#2B2622' // fixed given numbers (matches the scan's black ink)
export const FILLED = '#30598a' // qupu brand blue — numbers the animator drops in
export const MARK = '#f0853a' // qupu brand orange — the ●/◆/★ target glyphs
export const SUM_FILL = '#9CA3AF' // grey sum-circle fill (matches the scan's shaded discs)
export const SUM_TEXT = '#FFFFFF' // sum number printed white on the grey disc

export const ROWS = 3
export const COLS = 9

/** A target marker living in an unknown cell. */
export type Marker = 'bullet' | 'diamond' | 'star'

/** A cell is either a given number, a target marker, or an empty blank. */
type CellSpec = { given?: number; mark?: Marker }

/**
 * The transcribed source grid, row-major (3 rows x 9 cols). `given` = printed
 * number; `mark` = one of the three asked-about cells; an empty object = a blank
 * square the solver fills.
 */
export const GRID: ReadonlyArray<ReadonlyArray<CellSpec>> = [
  [{}, { mark: 'bullet' }, { given: 3 }, {}, { given: 6 }, { given: 9 }, {}, { given: 4 }, { given: 2 }],
  [{ given: 6 }, {}, { given: 4 }, { mark: 'diamond' }, {}, {}, { given: 1 }, {}, { given: 9 }],
  [{}, { given: 8 }, {}, { given: 9 }, { given: 4 }, {}, {}, { mark: 'star' }, { given: 6 }],
]

/** The printed sum inside each column's grey circle (a given, not the answer). */
export const COL_SUMS: ReadonlyArray<number> = [15, 17, 14, 18, 13, 16, 9, 16, 17]

/**
 * The forced values of the three marked cells — for the EXPLAINER and the
 * post-answer animation ONLY. The static question figure never shows these.
 */
export const MARKER_VALUES: Record<Marker, number> = { bullet: 7, diamond: 8, star: 5 }

/** ● + ◆ - ★ = 7 + 8 - 5 = 10. The published answer. */
export const ANSWER = MARKER_VALUES.bullet + MARKER_VALUES.diamond - MARKER_VALUES.star

/**
 * The UNIQUE completion (every row a permutation of 1..9, every column's three
 * entries distinct, every column summing to its printed circle) giving ● = 7,
 * ◆ = 8, ★ = 5. Verified by brute force: exactly one grid satisfies all
 * constraints. Used ONLY when the animator passes `solved`; the bare question
 * figure never shows these numbers.
 *
 *   row 1:  8 7 3 1 6 9 5 4 2
 *   row 2:  6 2 4 8 3 5 1 7 9
 *   row 3:  1 8 7 9 4 2 3 5 6
 *   sums:  15 17 14 18 13 16 9 16 17
 */
export const SOLVED: ReadonlyArray<ReadonlyArray<number>> = [
  [8, 7, 3, 1, 6, 9, 5, 4, 2],
  [6, 2, 4, 8, 3, 5, 1, 7, 9],
  [1, 8, 7, 9, 4, 2, 3, 5, 6],
]

// --- layout (exported so the explainer can mirror this exact scene) ----------
export const PAD_X = 14
export const PAD_TOP = 14
export const CELL = 30
export const GRID_W = COLS * CELL
export const GRID_H = ROWS * CELL

export const CIRCLE_GAP = 16 // vertical gap between grid bottom and circle centres
export const CIRCLE_R = 13

export const VIEW_W = PAD_X * 2 + GRID_W
export const VIEW_H = PAD_TOP + GRID_H + CIRCLE_GAP + CIRCLE_R * 2 + 12

export const gx = (c: number) => PAD_X + c * CELL
export const gy = (r: number) => PAD_TOP + r * CELL
export const circleCx = (c: number) => gx(c) + CELL / 2
export const circleCy = PAD_TOP + GRID_H + CIRCLE_GAP + CIRCLE_R

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
  const pts = [`${cx},${cy - R}`, `${cx + R},${cy}`, `${cx},${cy + R}`, `${cx - R},${cy}`].join(' ')
  return <polygon points={pts} fill={MARK} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
}

/** A small filled bullet (disc) centred at (cx, cy). */
function BulletGlyph({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r={8} fill={MARK} stroke={INK} strokeWidth={1.4} />
}

export function MarkerGlyph({ mark, cx, cy }: { mark: Marker; cx: number; cy: number }) {
  if (mark === 'star') return <StarGlyph cx={cx} cy={cy} />
  if (mark === 'diamond') return <DiamondGlyph cx={cx} cy={cy} />
  return <BulletGlyph cx={cx} cy={cy} />
}

export interface SymbolGrid24G2Props {
  /**
   * When true, fill every square with the reference completion and tint the
   * three marked cells. Animator-only — the default question figure shows the
   * bare setup (givens + markers + grey sum-circles, no answer).
   */
  solved?: boolean
}

/**
 * Bare 3x9 symbol sum-grid primitive: givens, the ●/◆/★ target markers, and the
 * grey column-sum circles carrying the printed totals. With `solved` it overlays
 * one self-consistent completion (post-answer animation). By itself it reveals
 * nothing about the filling or about ● + ◆ - ★.
 */
export function SymbolGrid24G2({ solved = false }: SymbolGrid24G2Props = {}) {
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
          // Solved overlay: print every square's number; givens stay ink, the
          // rest brand blue. Lightly tint the three target cells.
          if (solved) {
            const isGiven = typeof cell.given === 'number'
            return (
              <g key={`s-${r}-${c}`}>
                {cell.mark && (
                  <rect
                    x={gx(c) + 1.5}
                    y={gy(r) + 1.5}
                    width={CELL - 3}
                    height={CELL - 3}
                    fill="#f0853a"
                    fillOpacity={0.16}
                  />
                )}
                <text
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
              </g>
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

      {/* grey column-sum circles, one under each column, carrying the printed total */}
      {Array.from({ length: COLS }, (_, c) => {
        const cx = circleCx(c)
        return (
          <g key={`c-${c}`}>
            {/* thin connector from the column down to its circle */}
            <line
              x1={cx}
              y1={PAD_TOP + GRID_H}
              x2={cx}
              y2={circleCy - CIRCLE_R}
              stroke={SUM_FILL}
              strokeWidth={1.2}
            />
            <circle cx={cx} cy={circleCy} r={CIRCLE_R} fill={SUM_FILL} stroke={INK} strokeWidth={1.4} />
            <text
              x={cx}
              y={circleCy}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13}
              fontWeight={800}
              fill={SUM_TEXT}
            >
              {COL_SUMS[c]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// Indonesian aria description — names the givens, markers, and printed sums,
// never the answer.
const ARIA =
  'Kisi 3 baris dan 9 kolom. Setiap baris diisi bilangan 1 sampai 9. ' +
  'Baris atas: kosong, bulatan, 3, kosong, 6, 9, kosong, 4, 2. ' +
  'Baris tengah: 6, kosong, 4, belah ketupat, kosong, kosong, 1, kosong, 9. ' +
  'Baris bawah: kosong, 8, kosong, 9, 4, kosong, kosong, bintang, 6. ' +
  'Di bawah tiap kolom ada lingkaran abu-abu berisi jumlah tiga bilangan di atasnya: ' +
  '15, 17, 14, 18, 13, 16, 9, 16, 17. Tiga bilangan dalam satu kolom semuanya berbeda. ' +
  'Cari bulatan tambah belah ketupat kurang bintang.'

/** Question figure — bare setup, no answer revealed. Sits in the card, no box. */
export default function SymbolGrid24G2Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <SymbolGrid24G2 />
    </div>
  )
}

export { SymbolGrid24G2Illustration }
