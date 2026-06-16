// WMI-23F2A-Q21 (2023 Grade 2 Final) — matchstick square-grid illustration.
//
// "x identical matchsticks can be arranged as 1×a squares, 2×b squares, or
// 4×c squares. Find the smallest value of x."  Answer: x = 22.
//
// MATH (reference only — the static figure must NOT reveal a, b, c, or x):
// An m(rows) × n(cols) block of unit squares uses
//     sticks(m, n) = 2·m·n + m + n
// sticks (m+1 horizontal rows of n segments plus n+1 vertical columns of m
// segments, all shared between adjacent cells).
//
// Solved arrangements: 1×7 = 22, 2×4 = 22, 4×2 = 22.
//
// The default export (Matchsticks23G2Illustration) draws ONLY the setup: three
// labelled rows ("1×a", "2×b", "4×c") each showing a short generic block of
// matchstick squares ending with "…", with a curly-brace header above each
// group — matching the scan layout.  It commits to no value of a/b/c and
// never draws x.  Revealing the solved blocks + stick counts is the animator's
// job via the co-exported StickBlock23G2 primitive.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

const STICK = '#C8956C' // matchstick body — tan
const TIP = '#3B2B20' // matchstick head — dark brown
const INK = '#1F2937' // labels / text

/** Matchsticks used by an m(rows) × n(cols) block of unit squares. */
export function stickCount(rows: number, cols: number): number {
  return 2 * rows * cols + rows + cols
}

// ---- geometry ---------------------------------------------------------------
const CELL = 22 // unit-square edge in SVG user units
const STICK_W = 3.8 // matchstick stroke width
const TIP_R = 2.2 // matchstick-head radius

// ---- StickBlock23G2 ---------------------------------------------------------

export interface StickBlock23G2Props {
  /** Number of row of squares (height). */
  rows: number
  /** Number of columns of squares (width). */
  cols: number
  /** SVG top-left origin for the block. */
  ox: number
  oy: number
}

/**
 * Primitive: draws an `rows`×`cols` block of unit squares made from matchsticks,
 * with its top-left grid corner at (ox, oy).  Interior sticks are shared and
 * drawn once.  Junction dots mark every lattice point.
 *
 * Reusable by the explainer/animator to show the solved 1×7, 2×4, 4×2 forms.
 */
export function StickBlock23G2({ rows, cols, ox, oy }: StickBlock23G2Props) {
  // Collect all individual unit-length sticks.
  const sticks: Array<{ x1: number; y1: number; x2: number; y2: number }> = []

  // Horizontal sticks: (rows+1) lines, each split into `cols` unit segments.
  for (let r = 0; r <= rows; r++) {
    const y = oy + r * CELL
    for (let c = 0; c < cols; c++) {
      sticks.push({ x1: ox + c * CELL, y1: y, x2: ox + (c + 1) * CELL, y2: y })
    }
  }
  // Vertical sticks: (cols+1) columns, each split into `rows` unit segments.
  for (let c = 0; c <= cols; c++) {
    const x = ox + c * CELL
    for (let r = 0; r < rows; r++) {
      sticks.push({ x1: x, y1: oy + r * CELL, x2: x, y2: oy + (r + 1) * CELL })
    }
  }

  // Lattice-point dots (drawn once per point so shared ends look clean).
  const dots: Array<{ cx: number; cy: number }> = []
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      dots.push({ cx: ox + c * CELL, cy: oy + r * CELL })
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
      {dots.map((p, i) => (
        <circle key={`d-${i}`} cx={p.cx} cy={p.cy} r={TIP_R} fill={TIP} />
      ))}
    </g>
  )
}

// ---- Layout constants -------------------------------------------------------

const PAD = 14 // outer padding
const LABEL_W = 48 // left column width for the "m×n" tag
const ELLIPSIS_GAP = 24 // space for the trailing "…"
const ROW_GAP = 18 // vertical gap between the three arrangement rows

// Generic (preview) column counts — a handful of squares, then "…".
const PREVIEW_COLS: Record<string, number> = { '1xa': 3, '2xb': 3, '4xc': 2 }
const ROW_ROWS: Record<string, number> = { '1xa': 1, '2xb': 2, '4xc': 4 }
const ROW_LABEL: Record<string, string> = { '1xa': '1×a', '2xb': '2×b', '4xc': '4×c' }

type Cfg = '1xa' | '2xb' | '4xc'
const CFGS: Cfg[] = ['1xa', '2xb', '4xc']

// ---- ThreeRows (internal) ---------------------------------------------------

function ThreeRows() {
  // Pre-compute each row's block dimensions.
  const rows = CFGS.map((cfg) => ({
    cfg,
    nRows: ROW_ROWS[cfg],
    nCols: PREVIEW_COLS[cfg],
    blockW: PREVIEW_COLS[cfg] * CELL,
    blockH: ROW_ROWS[cfg] * CELL,
  }))

  const ox = PAD + LABEL_W
  const widest = Math.max(...rows.map((r) => r.blockW))
  const totalH =
    PAD * 2 +
    rows.reduce((s, r) => s + r.blockH, 0) +
    ROW_GAP * (rows.length - 1)
  const width = ox + widest + ELLIPSIS_GAP + PAD

  let cursorY = PAD

  return (
    <svg
      viewBox={`0 0 ${width} ${totalH}`}
      width={Math.min(260, width)}
      aria-hidden="true"
    >
      {rows.map((m) => {
        const oy = cursorY
        const midY = oy + m.blockH / 2
        cursorY += m.blockH + ROW_GAP
        return (
          <g key={m.cfg}>
            {/* "m×n" label on the left */}
            <text
              x={PAD}
              y={midY}
              dominantBaseline="central"
              fontSize={14}
              fontWeight={800}
              fill={INK}
            >
              {ROW_LABEL[m.cfg]}
            </text>

            {/* matchstick block */}
            <StickBlock23G2
              rows={m.nRows}
              cols={m.nCols}
              ox={ox}
              oy={oy}
            />

            {/* trailing "…" indicating the row continues */}
            <text
              x={ox + m.blockW + ELLIPSIS_GAP / 2}
              y={midY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={17}
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

// ---- Default export ---------------------------------------------------------

/**
 * In-card illustration for WMI-23F2A-Q21.
 *
 * Shows three generic labelled rows (1×a, 2×b, 4×c) of matchstick squares
 * ending with "…".  Does NOT reveal a, b, c, or x.
 */
export default function Matchsticks23G2Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Tiga baris susunan persegi dari batang korek api: baris 1×a (satu baris persegi), baris 2×b (dua baris persegi), dan baris 4×c (empat baris persegi), masing-masing diakhiri titik-titik. Setiap susunan memakai jumlah batang korek api yang sama yaitu x. Temukan nilai x terkecil."
    >
      <ThreeRows />
    </div>
  )
}
