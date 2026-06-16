// WMI-23F1A-Q21 (2023 Grade 1 Final) — "Fill 5, 6, 7, 8 into the empty squares
// so that every row increases left->right and every column increases top->bottom.
// How many different ways are there?"  Answer: 6 (fill-in).
//
// The 3x3 grid has the givens fixed and four blanks:
//        col0 col1 col2
//   r0 [  1    3   []  ]
//   r1 [  2    4   []  ]
//   r2 [ []   []    9  ]
// The four empty cells are r0c2, r1c2, r2c0, r2c1; fill with {5,6,7,8}.
//
// SOLVER PROOF (throwaway, since deleted): the only live constraints after the
// givens are that the right column must increase down (r0c2 < r1c2) and the
// bottom row must increase right (r2c0 < r2c1). Every other adjacency is already
// satisfied by 1<3, 2<4, 1<2, 3<4, plus 5..8 all > 4 and < 9. Choosing which two
// of {5,6,7,8} go to the right column (smaller on top) fixes everything, and the
// other two go to the bottom row (smaller on left). That is C(4,2) = 6 ways.
//
// The static figure draws ONLY the grid + givens, with the four cells blank. It
// NEVER reveals the count, any filling, or which pairs are constrained — that is
// the animator's job, via the co-exported GridFill23G1 primitive (fill /
// highlightCells props).
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

const INK = '#1F2937' // grid lines
const GIVEN = '#2B2622' // fixed given numbers (matches the scan's black ink)
const FILLED = '#30598a' // numbers the animator drops in (qupu brand blue)

export const GRID_N = 3

/** The fixed given numbers, keyed by cell ("r0c0" = top-left). Blank cells absent. */
export const GIVENS: Readonly<Record<string, number>> = {
  r0c0: 1,
  r0c1: 3,
  r1c0: 2,
  r1c1: 4,
  r2c2: 9,
}

/** The four empty cells to fill, in reading order. */
export const EMPTY_CELLS: ReadonlyArray<string> = ['r0c2', 'r1c2', 'r2c0', 'r2c1']

// ---- layout ----------------------------------------------------------------
const PAD = 16
const CELL = 56
const BOARD = GRID_N * CELL
const VIEW = BOARD + PAD * 2

const gx = (c: number) => PAD + c * CELL
const gy = (r: number) => PAD + r * CELL

function cellRC(key: string): { r: number; c: number } {
  // key shape "r<row>c<col>"
  const r = Number(key[1])
  const c = Number(key[3])
  return { r, c }
}

export interface GridFill23G1Props {
  /**
   * Numbers to drop into the empty cells, keyed like "r0c2". The animator fills
   * cells in to demonstrate one valid arrangement; omit for the bare problem.
   */
  fill?: Record<string, number> | null
  /**
   * Cell keys to outline (e.g. the two constrained pairs the animator is
   * reasoning about). Omit for no highlight.
   */
  highlightCells?: ReadonlyArray<string> | null
}

/**
 * Bare 3x3 grid + givens primitive, with optional fill/highlight overlays for the
 * post-answer animation. By itself it reveals nothing about the count or any
 * valid filling — only the printed givens.
 */
export function GridFill23G1({ fill = null, highlightCells = null }: GridFill23G1Props = {}) {
  const highlightSet = new Set(highlightCells ?? [])

  return (
    <svg viewBox={`0 0 ${VIEW} ${VIEW}`} width={Math.min(260, VIEW)} aria-hidden="true">
      {/* highlighted cells: faint orange wash behind the grid lines */}
      {[...highlightSet].map((key) => {
        const { r, c } = cellRC(key)
        return (
          <rect
            key={`h-${key}`}
            x={gx(c)}
            y={gy(r)}
            width={CELL}
            height={CELL}
            rx={3}
            fill="rgba(240,133,58,0.16)"
            stroke="#f0853a"
            strokeWidth={3.5}
          />
        )
      })}

      {/* outer board */}
      <rect x={PAD} y={PAD} width={BOARD} height={BOARD} fill="#FFFFFF" stroke={INK} strokeWidth={3} />

      {/* interior grid lines */}
      {Array.from({ length: GRID_N - 1 }, (_, i) => i + 1).map((i) => (
        <g key={`l-${i}`}>
          <line x1={gx(i)} y1={gy(0)} x2={gx(i)} y2={gy(GRID_N)} stroke={INK} strokeWidth={2.5} />
          <line x1={gx(0)} y1={gy(i)} x2={gx(GRID_N)} y2={gy(i)} stroke={INK} strokeWidth={2.5} />
        </g>
      ))}

      {/* given numbers (always shown) */}
      {Object.entries(GIVENS).map(([key, value]) => {
        const { r, c } = cellRC(key)
        return (
          <text
            key={`g-${key}`}
            x={gx(c) + CELL / 2}
            y={gy(r) + CELL / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="28"
            fontWeight="bold"
            fill={GIVEN}
          >
            {value}
          </text>
        )
      })}

      {/* filled-in numbers (animation only) */}
      {fill &&
        EMPTY_CELLS.filter((key) => typeof fill[key] === 'number').map((key) => {
          const { r, c } = cellRC(key)
          return (
            <text
              key={`f-${key}`}
              x={gx(c) + CELL / 2}
              y={gy(r) + CELL / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="28"
              fontWeight="bold"
              fill={FILLED}
            >
              {fill[key]}
            </text>
          )
        })}
    </svg>
  )
}

/** Default export: bare grid + givens, four cells empty, no answer revealed. */
export default function GridFill23G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Kisi 3 kali 3. Angka yang sudah ada: baris atas 1 dan 3, baris tengah 2 dan 4, dan angka 9 di kotak kanan bawah. Empat kotak kosong harus diisi 5, 6, 7, dan 8 agar setiap baris naik dari kiri ke kanan dan setiap kolom naik dari atas ke bawah. Hitung ada berapa cara berbeda."
    >
      <GridFill23G1 />
    </div>
  )
}
