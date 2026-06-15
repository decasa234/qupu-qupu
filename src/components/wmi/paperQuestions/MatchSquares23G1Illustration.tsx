// WMI-23F1A-Q23 (2023 Grade 1 Final) — matchstick blocks of squares.
//
// "The same number of matchsticks, x, can be arranged to form a 1×a block of
// squares, a 2×b block of squares, or a 4×c block of squares. What is the
// smallest possible value of x?"  Answer: x = 22 (fill-in).
//
// MATH (for reference only — the static figure must NOT reveal a, b, c or x):
// an m×n block of unit squares uses (m+1) horizontal stick-runs of length n
// plus (n+1) vertical stick-runs of length m, i.e.
//     sticks(m, n) = 2·m·n + m + n.
// So  1×a = 3a+1,  2×b = 5b+2,  4×c = 9c+4.  The smallest x equal in all three:
//     x = 22  ->  a = 7 (1×7=22),  b = 4 (2×4=22),  c = 2 (4×2=22).
//
// The default export draws ONLY the setup: three labelled rows — "1×a", "2×b",
// "4×c" — each a short generic run of a few unit squares built from matchsticks,
// ending in "…" to show the block continues. It commits to NO value of a/b/c and
// never shows x. Revealing the solved 1×7 / 2×4 / 4×2 blocks + the stick counts
// is the animator's job, via the co-exported MatchSquares23G1 primitive.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

const STICK = '#C8956C' // matchstick body (tan)
const TIP = '#3B2B20' // matchstick head (dark)
const INK = '#1F2937' // labels / dots

export const ANSWER = 22 // x — never drawn in the static figure

// Solved blocks (animator only): the three arrangements that all use 22 sticks.
export const SOLVED: Record<'1xa' | '2xb' | '4xc', { rows: number; cols: number; label: string }> = {
  '1xa': { rows: 1, cols: 7, label: '1×7' },
  '2xb': { rows: 2, cols: 4, label: '2×4' },
  '4xc': { rows: 4, cols: 2, label: '4×2' },
}

/** Matchsticks in an m(rows) × n(cols) block of unit squares: 2mn + m + n. */
export function stickCount(rows: number, cols: number): number {
  return 2 * rows * cols + rows + cols
}

// ---- geometry --------------------------------------------------------------
const CELL = 22 // unit-square edge in user units
const STICK_W = 4 // matchstick stroke width
const TIP_R = 2.3 // matchstick-head radius

/**
 * Draw an m(rows) × n(cols) block of unit squares as matchsticks, with its
 * top-left grid corner at (ox, oy). Interior sticks are shared (drawn once).
 */
function MatchBlock({ rows, cols, ox, oy }: { rows: number; cols: number; ox: number; oy: number }) {
  const sticks: Array<{ x1: number; y1: number; x2: number; y2: number }> = []
  // horizontal sticks: (rows+1) lines, each split into `cols` unit segments
  for (let r = 0; r <= rows; r++) {
    const y = oy + r * CELL
    for (let c = 0; c < cols; c++) {
      const x = ox + c * CELL
      sticks.push({ x1: x, y1: y, x2: x + CELL, y2: y })
    }
  }
  // vertical sticks: (cols+1) lines, each split into `rows` unit segments
  for (let c = 0; c <= cols; c++) {
    const x = ox + c * CELL
    for (let r = 0; r < rows; r++) {
      const y = oy + r * CELL
      sticks.push({ x1: x, y1: y, x2: x, y2: y + CELL })
    }
  }
  // grid-corner heads (drawn once per lattice point so shared ends look right)
  const corners: Array<{ cx: number; cy: number }> = []
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      corners.push({ cx: ox + c * CELL, cy: oy + r * CELL })
    }
  }
  return (
    <g>
      {sticks.map((s, i) => (
        <line
          key={`s-${i}`}
          x1={s.x1}
          y1={s.y1}
          x2={s.x2}
          y2={s.y2}
          stroke={STICK}
          strokeWidth={STICK_W}
          strokeLinecap="round"
        />
      ))}
      {corners.map((p, i) => (
        <circle key={`c-${i}`} cx={p.cx} cy={p.cy} r={TIP_R} fill={TIP} />
      ))}
    </g>
  )
}

export interface MatchSquares23G1Props {
  /** Which arrangement to draw. Omit for the three generic labelled rows. */
  config?: '1xa' | '2xb' | '4xc'
  /** Override the column count (generic figure uses a few; solved uses 7/4/2). */
  cols?: number
  /** Show the matchstick count beside the block (animator post-answer only). */
  showCount?: boolean
}

// Generic preview column counts per row — a *few* squares, then "…".
const GENERIC_COLS: Record<'1xa' | '2xb' | '4xc', number> = { '1xa': 3, '2xb': 3, '4xc': 2 }
const ROW_ROWS: Record<'1xa' | '2xb' | '4xc', number> = { '1xa': 1, '2xb': 2, '4xc': 4 }
const ROW_LABEL: Record<'1xa' | '2xb' | '4xc', string> = { '1xa': '1×a', '2xb': '2×b', '4xc': '4×c' }

const PAD = 14
const LABEL_W = 46 // room for the "1×a" tag on the left
const ELLIPSIS_W = 26 // room for the trailing "…"
const COUNT_W = 64 // room for "= NN" when showCount

/**
 * Primitive. With a `config` it draws ONE block — generic (a few squares + "…")
 * by default, or the solved arrangement when `cols` is supplied (e.g. cols=7 for
 * the 1×7), optionally with its matchstick count. Without `config` it falls
 * through to the default three-row figure.
 */
export function MatchSquares23G1({ config, cols, showCount = false }: MatchSquares23G1Props = {}) {
  if (!config) return <ThreeRows />

  const rows = ROW_ROWS[config]
  const nCols = typeof cols === 'number' && cols > 0 ? cols : GENERIC_COLS[config]
  const generic = typeof cols !== 'number' // generic => append the "…"
  const blockW = nCols * CELL
  const blockH = rows * CELL

  const ox = PAD + LABEL_W
  const oy = PAD
  const width = ox + blockW + (generic ? ELLIPSIS_W : 0) + (showCount ? COUNT_W : 0) + PAD
  const height = oy + blockH + PAD

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={Math.min(280, width)} aria-hidden="true">
      {/* arrangement tag on the left */}
      <text
        x={PAD}
        y={oy + blockH / 2}
        dominantBaseline="central"
        fontSize={15}
        fontWeight={800}
        fill={INK}
      >
        {ROW_LABEL[config]}
      </text>

      <MatchBlock rows={rows} cols={nCols} ox={ox} oy={oy} />

      {/* trailing "…" for the generic (continues) view */}
      {generic && (
        <text
          x={ox + blockW + ELLIPSIS_W / 2}
          y={oy + blockH / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={18}
          fontWeight={800}
          fill={INK}
        >
          …
        </text>
      )}

      {/* matchstick count (animator post-answer) */}
      {showCount && (
        <text
          x={ox + blockW + (generic ? ELLIPSIS_W : 0) + 8}
          y={oy + blockH / 2}
          dominantBaseline="central"
          fontSize={15}
          fontWeight={800}
          fill="#f0853a"
        >
          {`= ${stickCount(rows, nCols)}`}
        </text>
      )}
    </svg>
  )
}

// ---- default figure: three generic labelled rows ---------------------------

const ROWS: Array<'1xa' | '2xb' | '4xc'> = ['1xa', '2xb', '4xc']

function ThreeRows() {
  // each row laid out independently then stacked; width = widest row
  const rowMetrics = ROWS.map((cfg) => {
    const rows = ROW_ROWS[cfg]
    const nCols = GENERIC_COLS[cfg]
    return { cfg, rows, nCols, blockW: nCols * CELL, blockH: rows * CELL }
  })

  const ox = PAD + LABEL_W
  const rowGap = 16
  const widest = Math.max(...rowMetrics.map((m) => m.blockW))
  const width = ox + widest + ELLIPSIS_W + PAD
  const height =
    PAD * 2 + rowMetrics.reduce((sum, m) => sum + m.blockH, 0) + rowGap * (rowMetrics.length - 1)

  // running y for the top of each row's block
  let cursorY = PAD

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={Math.min(280, width)} aria-hidden="true">
      {rowMetrics.map((m) => {
        const oy = cursorY
        const midY = oy + m.blockH / 2
        cursorY += m.blockH + rowGap
        return (
          <g key={m.cfg}>
            <text x={PAD} y={midY} dominantBaseline="central" fontSize={15} fontWeight={800} fill={INK}>
              {ROW_LABEL[m.cfg]}
            </text>
            <MatchBlock rows={m.rows} cols={m.nCols} ox={ox} oy={oy} />
            <text
              x={ox + m.blockW + ELLIPSIS_W / 2}
              y={midY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={18}
              fontWeight={800}
              fill={INK}
            >
              …
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/**
 * Default export: the three generic labelled rows (1×a, 2×b, 4×c), each a short
 * run of matchstick squares ending in "…". Reveals nothing about a/b/c or x.
 */
export default function MatchSquares23G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Tiga susunan persegi dari batang korek api: baris 1×a (satu baris persegi), 2×b (dua baris persegi), dan 4×c (empat baris persegi), masing-masing dilanjutkan dengan titik-titik. Setiap susunan memakai jumlah batang korek api yang sama, yaitu x. Cari nilai x terkecil."
    >
      <ThreeRows />
    </div>
  )
}
