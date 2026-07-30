// Sum-grid figure for WMI-24F1A-Q25 (2024 Grade 1 Final). Answer: 10 (fill-in).
//
// Official stem: "Fill numbers 1~9 in the squares so that each row has numbers
// 1~9. Given that each number in the circle below is the sum of the three numbers
// in the squares directly above it, and the numbers in the three vertical squares
// are different as in 2+9+6=17. Find ●+◆−★."
//
// LAYOUT — 3 rows x 9 columns of squares, with a printed sum-circle under each
// column. Transcribed from the paper (·· = blank cell):
//
//   row 1:  ··  [●]  3   ··   6   9   ··   4   2
//   row 2:   6   ··  4  [◆]  ··  ··   1   ··   9
//   row 3:  ··   8   ··   9   4   ··  ··  [★]   6
//   circles 15   17  14   18  13   16   9   16  17
//
// TWO earlier defects, both fixed here:
//   1. row 1 was drawn shifted one column LEFT ([●] sat in column 1 instead of
//      column 2, and the trailing blank fell off the end), so the ● column never
//      lined up with its printed sum;
//   2. the nine circle sums were never transcribed at all — they were drawn as
//      empty circles. They are the binding constraint: rows-are-permutations plus
//      columns-are-distinct leaves the grid massively under-determined, but WITH
//      the printed sums the completion is UNIQUE (verified by exhaustive search
//      over column triples):
//
//        8 7 3 1 6 9 5 4 2
//        6 2 4 8 3 5 1 7 9
//        1 8 7 9 4 2 3 5 6
//
//      giving ● = 7, ◆ = 8, ★ = 5 and hence ● + ◆ − ★ = 7 + 8 − 5 = 10, which
//      matches the official key.
//
// The circle sums are QUESTION DATA, so they always render. The completion is the
// ANSWER, so it renders only when the animator passes `solved`.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

const INK = '#2B2622' // grid lines
const GIVEN = '#2B2622' // fixed given numbers (the scan's black ink)
const FILLED = '#30598A' // qupu brand blue — numbers the animator drops in
const MARK = '#F0853A' // qupu brand orange — the ●/◆/★ target glyphs & values
const CIRCLE_FILL = '#30598A' // brand blue sum-circle body (paper prints it solid)
const CIRCLE_LINE = '#24446A'
const CIRCLE_INK = '#FFFFFF' // the sum printed inside the circle

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
  [{}, { mark: 'bullet' }, { given: 3 }, {}, { given: 6 }, { given: 9 }, {}, { given: 4 }, { given: 2 }],
  [{ given: 6 }, {}, { given: 4 }, { mark: 'diamond' }, {}, {}, { given: 1 }, {}, { given: 9 }],
  [{}, { given: 8 }, {}, { given: 9 }, { given: 4 }, {}, {}, { mark: 'star' }, { given: 6 }],
]

/**
 * The nine sums printed in the circles under the columns. Question data — always
 * drawn. These are what pin the grid to a single completion.
 */
export const CIRCLE_SUMS: readonly number[] = [15, 17, 14, 18, 13, 16, 9, 16, 17]

/**
 * The UNIQUE completion (each row a permutation of 1–9, every column's three
 * entries distinct, every column summing to its printed circle). It gives
 * ● = 7, ◆ = 8, ★ = 5 so ● + ◆ − ★ = 10. Used ONLY when the animator passes
 * `solved`; the static question figure never shows these numbers.
 */
const SOLVED: ReadonlyArray<ReadonlyArray<number>> = [
  [8, 7, 3, 1, 6, 9, 5, 4, 2],
  [6, 2, 4, 8, 3, 5, 1, 7, 9],
  [1, 8, 7, 9, 4, 2, 3, 5, 6],
]

// --- layout -----------------------------------------------------------------
const PAD_X = 14
const PAD_TOP = 14
const CELL = 30
const GRID_W = COLS * CELL
const GRID_H = ROWS * CELL

const CIRCLE_R = 15 // r = CELL/2, so the circles tile the row exactly as printed

const VIEW_W = PAD_X * 2 + GRID_W
const VIEW_H = PAD_TOP + GRID_H + CIRCLE_R * 2 + 12

const gx = (c: number) => PAD_X + c * CELL
const gy = (r: number) => PAD_TOP + r * CELL
const circleCx = (c: number) => gx(c) + CELL / 2
const circleCy = PAD_TOP + GRID_H + CIRCLE_R

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

function MarkerGlyph({ mark, cx, cy }: { mark: Marker; cx: number; cy: number }) {
  if (mark === 'star') return <StarGlyph cx={cx} cy={cy} />
  if (mark === 'diamond') return <DiamondGlyph cx={cx} cy={cy} />
  return <BulletGlyph cx={cx} cy={cy} />
}

export interface SumGrid24G1Props {
  /**
   * When true, fill every square with the unique completion (the marked cells in
   * brand orange so ● / ◆ / ★ stay identifiable). Animator-only — the default
   * question figure shows the bare setup: givens, markers and the printed circle
   * sums, with every other square empty.
   */
  solved?: boolean
}

/**
 * 3x9 sum-grid primitive: the givens, the ●/◆/★ target markers, and the nine
 * printed column-sum circles. With `solved` it overlays the unique completion
 * (post-answer animation). By itself it reveals nothing about ● + ◆ − ★.
 */
export function SumGrid24G1({ solved = false }: SumGrid24G1Props = {}) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 320 }}
      aria-hidden="true"
    >
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
          // Solved overlay: print every square. Givens stay ink, the three marked
          // cells go orange so they can still be picked out, the rest brand blue.
          if (solved) {
            const colour = typeof cell.given === 'number' ? GIVEN : cell.mark ? MARK : FILLED
            return (
              <text
                key={`s-${r}-${c}`}
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                className="font-display"
                fontSize={17}
                fontWeight={800}
                fill={colour}
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
                className="font-display"
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

      {/* the nine printed column-sum circles — question data, always shown */}
      {CIRCLE_SUMS.map((sum, c) => (
        <g key={`c-${c}`}>
          <circle
            cx={circleCx(c)}
            cy={circleCy}
            r={CIRCLE_R}
            fill={CIRCLE_FILL}
            stroke={CIRCLE_LINE}
            strokeWidth={1.5}
          />
          <text
            x={circleCx(c)}
            y={circleCy}
            textAnchor="middle"
            dominantBaseline="central"
            className="font-display"
            fontSize={13}
            fontWeight={800}
            fill={CIRCLE_INK}
          >
            {sum}
          </text>
        </g>
      ))}
    </svg>
  )
}

// Indonesian aria description — the givens, the markers and the printed circle
// sums. It never states the completion or the answer.
const ARIA =
  'Kisi 3 baris dan 9 kolom. Setiap baris diisi bilangan 1 sampai 9. ' +
  'Baris atas: kosong, bulatan, 3, kosong, 6, 9, kosong, 4, 2. ' +
  'Baris tengah: 6, kosong, 4, belah ketupat, kosong, kosong, 1, kosong, 9. ' +
  'Baris bawah: kosong, 8, kosong, 9, 4, kosong, kosong, bintang, 6. ' +
  'Di bawah tiap kolom ada lingkaran berisi jumlah tiga bilangan di atasnya, berturut-turut ' +
  '15, 17, 14, 18, 13, 16, 9, 16, dan 17. Tiga bilangan dalam satu kolom semuanya berbeda. ' +
  'Cari bulatan tambah belah ketupat kurang bintang.'

/** Question figure — bare setup plus the printed sums, no answer revealed. */
export default function SumGrid24G1Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <SumGrid24G1 />
    </div>
  )
}
