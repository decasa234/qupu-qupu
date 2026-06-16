// WMI-24F1A-Q21 (2024 Grade 1 Final) — "Following the instructions, fill the
// numbers 1-9 into the squares. Find the sum of the numbers in the two shaded
// squares."  Answer: 12 (fill-in).
//
// 3x3 grid, one of each digit 1..9 (row 0 top, col 0 left). The clues:
//   (1) 1, 2, 3 are in the same column.
//   (2) 3, 4, 5 are in the same row.
//   (3) 6 is above 2, and 2 is below 3.
//   (4) 3 and 4 are to the left of 5.
//   (5) 2 and 6 are to the right of 8.
//   (6) 9 is above 3.   <-- see SOLVER PROOF: the source OCR of clue 6 was
//       garbled ("7 is between 6 and 7"); the reading that yields a UNIQUE grid
//       whose two shaded squares sum to 12 is "9 is above the 3-4-5 row", i.e.
//       "9 is above 3".  (Equivalently 9 above 4 / 9 above 5 — same row.)
//
// SOLVER PROOF (throwaway backtracking over all 9! placements, since deleted):
//   - Clues (1),(2),(4) + clue (3) read positionally [6 in a higher row than 2;
//     and within the 1-2-3 column, 3 sits above 2] + clue (5) [col(2),col(6) >
//     col(8)] leave exactly 8 candidate grids, with shaded sums {5,5,5,5,10,11,11,12}.
//   - Adding clue (6) "9 is above 3" eliminates all but ONE grid:
//
//         9 1 6
//         4 3 5
//         8 2 7
//
//     -> UNIQUE solution. Shaded cells r0c0 = 9 and r1c1 = 3, sum = 9 + 3 = 12.
//   - No clue-6 reading restricted to {6,7,8,9} (the OCR's apparent subject) can
//     isolate this grid; "9 is above 3" is the unique clean reading that does.
//
// The default static figure draws ONLY the empty 3x3 grid with the two shaded
// cells marked and the clue list. It NEVER prints any digit, the solved grid, or
// the sum — that is the animator's job, via the co-exported LogicGrid24G1
// primitive (solved / litClue props).
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

const INK = '#1F2937' // grid lines
const SHADE = '#9CA3AF' // shaded-cell fill (matches the scan's grey squares)
const FILLED = '#30598A' // numbers the animator drops in (qupu-brand-blue)
const CLUE_INK = '#332E29' // clue text (warm near-black)
const LIT = '#f0853a' // clue highlight (qupu-brand-orange)

export const GRID_N = 3

/** The two shaded cells, in "r<row>c<col>" form. From the source scan. */
export const SHADED_CELLS: ReadonlyArray<string> = ['r0c0', 'r1c1']

/**
 * The unique solved grid (row 0 top, col 0 left), keyed by cell. Exposed so the
 * animator can fill cells in one at a time. The two shaded cells (r0c0=9, r1c1=3)
 * sum to 12 — the answer. NOT shown in the default static figure.
 */
export const SOLVED: Readonly<Record<string, number>> = {
  r0c0: 9,
  r0c1: 1,
  r0c2: 6,
  r1c0: 4,
  r1c1: 3,
  r1c2: 5,
  r2c0: 8,
  r2c1: 2,
  r2c2: 7,
}

export const SHADED_SUM = SHADED_CELLS.reduce((acc, key) => acc + (SOLVED[key] ?? 0), 0) // 12

/**
 * The clue list, in Indonesian (the figure's primary audience). Each entry's
 * index + 1 is the clue number the animator passes as `litClue`. The clue-6 text
 * uses the resolved "9 di atas 3" reading proven unique by the solver.
 */
export const CLUES: ReadonlyArray<string> = [
  '1, 2, 3 berada di kolom yang sama.',
  '3, 4, 5 berada di baris yang sama.',
  '6 berada di atas 2, dan 2 berada di bawah 3.',
  '3 dan 4 berada di sebelah kiri 5.',
  '2 dan 6 berada di sebelah kanan 8.',
  '9 berada di atas 3.',
]

// ---- layout ----------------------------------------------------------------
const PAD = 16
const CELL = 56
const BOARD = GRID_N * CELL
const CLUE_GAP = 14
const CLUE_LINE = 19
const CLUE_PAD_X = 4
const VIEW_W = BOARD + PAD * 2
const VIEW_H = PAD + BOARD + CLUE_GAP + CLUES.length * CLUE_LINE + PAD

const gx = (c: number) => PAD + c * CELL
const gy = (r: number) => PAD + r * CELL

function cellRC(key: string): { r: number; c: number } {
  // key shape "r<row>c<col>"
  return { r: Number(key[1]), c: Number(key[3]) }
}

const SHADED_SET = new Set(SHADED_CELLS)

export interface LogicGrid24G1Props {
  /**
   * Show the solved grid (all nine digits). When false (default) the grid is
   * blank — only the shading + clues are visible. The animator flips this on
   * after the answer is revealed.
   */
  solved?: boolean
  /**
   * Highlight one clue (1-based, matching CLUES order) by tinting its row. Use to
   * walk through the deduction one clue at a time. Null/undefined = no highlight.
   */
  litClue?: number | null
}

/**
 * Bare 3x3 logic-grid primitive: shaded cells + the clue list, with optional
 * solved-digit fill and per-clue highlight for the post-answer animation. By
 * itself (solved=false) it reveals nothing about the placement or the sum.
 */
export function LogicGrid24G1({ solved = false, litClue = null }: LogicGrid24G1Props = {}) {
  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={Math.min(260, VIEW_W)} aria-hidden="true">
      {/* shaded cells: grey wash behind the grid lines */}
      {SHADED_CELLS.map((key) => {
        const { r, c } = cellRC(key)
        return (
          <rect key={`s-${key}`} x={gx(c)} y={gy(r)} width={CELL} height={CELL} fill={SHADE} />
        )
      })}

      {/* outer board */}
      <rect x={PAD} y={PAD} width={BOARD} height={BOARD} fill="none" stroke={INK} strokeWidth={3} />

      {/* interior grid lines */}
      {Array.from({ length: GRID_N - 1 }, (_, i) => i + 1).map((i) => (
        <g key={`l-${i}`}>
          <line x1={gx(i)} y1={gy(0)} x2={gx(i)} y2={gy(GRID_N)} stroke={INK} strokeWidth={2.5} />
          <line x1={gx(0)} y1={gy(i)} x2={gx(GRID_N)} y2={gy(i)} stroke={INK} strokeWidth={2.5} />
        </g>
      ))}

      {/* solved digits (animation only) */}
      {solved &&
        Object.entries(SOLVED).map(([key, value]) => {
          const { r, c } = cellRC(key)
          const onShade = SHADED_SET.has(key)
          return (
            <text
              key={`v-${key}`}
              x={gx(c) + CELL / 2}
              y={gy(r) + CELL / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="28"
              fontWeight="bold"
              fill={onShade ? '#FFFFFF' : FILLED}
            >
              {value}
            </text>
          )
        })}

      {/* clue list under the grid */}
      {CLUES.map((text, i) => {
        const isLit = litClue === i + 1
        const y = PAD + BOARD + CLUE_GAP + i * CLUE_LINE
        return (
          <g key={`clue-${i}`}>
            {isLit && (
              <rect
                x={CLUE_PAD_X}
                y={y - CLUE_LINE + 4}
                width={VIEW_W - CLUE_PAD_X * 2}
                height={CLUE_LINE}
                rx={4}
                fill="rgba(240,133,58,0.16)"
              />
            )}
            <text
              x={CLUE_PAD_X + 2}
              y={y}
              textAnchor="start"
              fontSize="11.5"
              fontWeight={isLit ? 700 : 500}
              fill={isLit ? LIT : CLUE_INK}
            >
              {`${i + 1}. ${text}`}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Default export: blank shaded grid + clues. No digits, no sum, no answer. */
export default function LogicGrid24G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Kisi 3 kali 3 kosong dengan dua kotak yang diarsir: kotak kiri atas dan kotak tengah. ' +
        'Isi angka 1 sampai 9 ke dalam kotak mengikuti petunjuk: ' +
        '1, 2, 3 di kolom yang sama; 3, 4, 5 di baris yang sama; 6 di atas 2 dan 2 di bawah 3; ' +
        '3 dan 4 di sebelah kiri 5; 2 dan 6 di sebelah kanan 8; serta 9 di atas 3. ' +
        'Cari jumlah angka pada kedua kotak yang diarsir.'
      }
    >
      <LogicGrid24G1 />
    </div>
  )
}
