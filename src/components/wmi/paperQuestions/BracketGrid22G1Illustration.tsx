// WMI-22F1A-Q16 — purple "corner bracket" puzzle over a 3×3 number grid.
//
// A tic-tac-toe style 3×3 grid holds nine fixed numbers:
//   row0: 6 9 1
//   row1: 2 4 8
//   row2: 3 7 5
// Each purple corner-bracket symbol "opens" toward exactly one grid cell and
// takes that cell's number; the closed square □ wraps the CENTRE cell.
//
//   ∟  corner at bottom-left, opening upper-right → TOP-RIGHT cell  (legend: ∟ = 1)
//   ¬  corner at top-right,   opening lower-left  → BOTTOM-LEFT cell (= 3)
//   ┌  corner at top-left,    opening lower-right → BOTTOM-RIGHT cell (= 5)
//   □  closed square                              → CENTRE cell (= 4)
//
// The puzzle asks  ¬ + □ + ┌ = ?   given the legend  ∟ = 1.
// (Answer 3 + 4 + 5 = 12 — NOT drawn here.)
//
// The static figure shows ONLY the puzzle: the grid, the equation of bracket
// glyphs, and the legend. It never highlights which cell a bracket maps to and
// never reveals the answer. The animator imports `BracketGrid` to ring a cell
// and overlay the matching purple bracket, post-answer.

// Fixed grid values, row-major. [row][col], row 0 = top.
const GRID: ReadonlyArray<ReadonlyArray<number>> = [
  [6, 9, 1],
  [2, 4, 8],
  [3, 7, 5],
]

// ---- shared geometry ------------------------------------------------------
const G_PAD = 14 // overhang of the tic-tac-toe cross lines past the numbers
const CELL = 64 // logical cell size for the grid
const GRID_SPAN = CELL * 3
const GRID_VIEW = GRID_SPAN + G_PAD * 2

const colCtr = (col: number) => G_PAD + col * CELL + CELL / 2
const rowCtr = (row: number) => G_PAD + row * CELL + CELL / 2

type Corner = 'topRight' | 'topLeft' | 'bottomLeft' | 'center'

/**
 * Purple corner-bracket glyph drawn AROUND a single cell, opening toward it.
 * `cx`,`cy` = cell centre; `s` = bracket half-extent (arm reach from centre).
 * `arm` = arm length along each leg of the L.
 *
 * - topRight:   corner sits top-right of the cell, arms go left + down.
 * - topLeft:    corner sits top-left of the cell, arms go right + down.
 * - bottomLeft: corner sits bottom-left of the cell, arms go right + up.
 * - center:     a closed square hugging the cell.
 */
function bracketPath(corner: Corner, cx: number, cy: number, s: number, arm: number): string {
  const l = cx - s
  const r = cx + s
  const t = cy - s
  const b = cy + s
  switch (corner) {
    // ¬ : horizontal arm along the top going LEFT, vertical arm on the RIGHT going DOWN.
    case 'topRight':
      return `M ${r - arm} ${t} L ${r} ${t} L ${r} ${t + arm}`
    // ┌ : vertical arm on the LEFT going DOWN, horizontal arm along the top going RIGHT.
    case 'topLeft':
      return `M ${l} ${t + arm} L ${l} ${t} L ${l + arm} ${t}`
    // ∟ : vertical arm on the LEFT going UP, horizontal arm along the bottom going RIGHT.
    case 'bottomLeft':
      return `M ${l} ${b - arm} L ${l} ${b} L ${l + arm} ${b}`
    // □ : closed square.
    case 'center':
      return `M ${l} ${t} L ${r} ${t} L ${r} ${b} L ${l} ${b} Z`
  }
}

/** Standalone purple bracket glyph used in the equation row and legend. */
function BracketGlyph({
  corner,
  cx,
  cy,
  s,
  arm,
  strokeWidth = 6,
}: {
  corner: Corner
  cx: number
  cy: number
  s: number
  arm: number
  strokeWidth?: number
}) {
  return (
    <path
      d={bracketPath(corner, cx, cy, s, arm)}
      fill="none"
      className="stroke-qupu-purple"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

/**
 * Reusable primitive: the fixed 3×3 number grid (tic-tac-toe style purple
 * cross-lines, dark numbers). `highlightCell` = [row,col] rings one cell.
 * `bracket` optionally overlays the matching purple corner glyph around the
 * highlighted cell (pointing at / wrapping it). Both are post-answer aids — the
 * default question figure passes neither.
 */
export function BracketGrid({
  highlightCell,
  bracket,
}: {
  highlightCell?: [number, number]
  bracket?: Corner
}) {
  const hl =
    Array.isArray(highlightCell) &&
    highlightCell.length === 2 &&
    Number.isInteger(highlightCell[0]) &&
    Number.isInteger(highlightCell[1]) &&
    highlightCell[0] >= 0 &&
    highlightCell[0] < 3 &&
    highlightCell[1] >= 0 &&
    highlightCell[1] < 3
      ? highlightCell
      : undefined

  return (
    <svg
      viewBox={`0 0 ${GRID_VIEW} ${GRID_VIEW}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 220 }}
      aria-hidden="true"
    >
      {/* tic-tac-toe cross lines (overhang the numbers, like the scan) */}
      {[1, 2].map((i) => (
        <line
          key={`v-${i}`}
          x1={G_PAD + i * CELL}
          y1={G_PAD * 0.4}
          x2={G_PAD + i * CELL}
          y2={GRID_VIEW - G_PAD * 0.4}
          className="stroke-qupu-purple"
          strokeWidth={5}
          strokeLinecap="round"
        />
      ))}
      {[1, 2].map((i) => (
        <line
          key={`h-${i}`}
          x1={G_PAD * 0.4}
          y1={G_PAD + i * CELL}
          x2={GRID_VIEW - G_PAD * 0.4}
          y2={G_PAD + i * CELL}
          className="stroke-qupu-purple"
          strokeWidth={5}
          strokeLinecap="round"
        />
      ))}

      {/* highlight ring on the chosen cell (behind the number) */}
      {hl && (
        <rect
          x={G_PAD + hl[1] * CELL + 5}
          y={G_PAD + hl[0] * CELL + 5}
          width={CELL - 10}
          height={CELL - 10}
          rx={10}
          fill="none"
          className="stroke-qupu-brand-orange"
          strokeWidth={4}
        />
      )}

      {/* the nine fixed numbers */}
      {GRID.map((rowVals, row) =>
        rowVals.map((val, col) => (
          <text
            key={`n-${row}-${col}`}
            x={colCtr(col)}
            y={rowCtr(row) + 1}
            textAnchor="middle"
            dominantBaseline="central"
            className="font-display fill-qupu-ink"
            fontSize={32}
            fontStyle="italic"
            fontWeight={800}
          >
            {val}
          </text>
        )),
      )}

      {/* optional purple bracket overlay around the highlighted cell */}
      {hl && bracket && (
        <BracketGlyph
          corner={bracket}
          cx={colCtr(hl[1])}
          cy={rowCtr(hl[0])}
          s={CELL * 0.42}
          arm={CELL * 0.34}
          strokeWidth={6}
        />
      )}
    </svg>
  )
}

export default function BracketGrid22G1Illustration() {
  // ---- equation + legend layout (its own horizontal strip) ----------------
  // glyph half-extent and arm length for the equation-row brackets
  const gs = 18
  const garm = 16
  const plusGap = 30
  const eqGap = 34

  return (
    <div
      className="my-4 flex flex-col items-center gap-4"
      role="img"
      aria-label={
        'Teka-teki kurung ungu pada kisi angka 3 kali 3. Baris atas 6, 9, 1; baris tengah 2, 4, 8; baris bawah 3, 7, 5. ' +
        'Setiap kurung sudut menunjuk satu sel. Persamaan: kurung sudut kanan-atas tambah persegi tambah kurung sudut kiri-atas sama dengan berapa? ' +
        'Petunjuk: kurung sudut kiri-bawah sama dengan 1.'
      }
    >
      {/* the 3×3 number grid */}
      <BracketGrid />

      {/* equation strip:  ¬ + □ + ┌ = ?    and a legend box  ∟ = 1 */}
      <svg
        viewBox="0 0 360 80"
        width="100%"
        style={{ display: 'block', margin: '0 auto', maxWidth: 320 }}
        aria-hidden="true"
      >
        {(() => {
          const cy = 36
          // running x cursor across the equation
          let x = gs + 4
          const nodes: React.ReactNode[] = []

          // ¬  (top-right corner glyph)
          nodes.push(<BracketGlyph key="b1" corner="topRight" cx={x} cy={cy} s={gs} arm={garm} />)
          x += gs + plusGap / 2
          nodes.push(
            <text key="p1" x={x} y={cy + 1} textAnchor="middle" dominantBaseline="central" className="font-display fill-qupu-ink" fontSize={30} fontWeight={800}>
              +
            </text>,
          )
          x += plusGap / 2 + gs

          // □  (closed square)
          nodes.push(<BracketGlyph key="b2" corner="center" cx={x} cy={cy} s={gs} arm={garm} />)
          x += gs + plusGap / 2
          nodes.push(
            <text key="p2" x={x} y={cy + 1} textAnchor="middle" dominantBaseline="central" className="font-display fill-qupu-ink" fontSize={30} fontWeight={800}>
              +
            </text>,
          )
          x += plusGap / 2 + gs

          // ┌  (top-left corner glyph)
          nodes.push(<BracketGlyph key="b3" corner="topLeft" cx={x} cy={cy} s={gs} arm={garm} />)
          x += gs + eqGap / 2
          nodes.push(
            <text key="eq" x={x} y={cy + 1} textAnchor="middle" dominantBaseline="central" className="font-display fill-qupu-ink" fontSize={30} fontWeight={800}>
              =
            </text>,
          )
          x += eqGap / 2
          nodes.push(
            <text key="q" x={x + 10} y={cy + 1} textAnchor="middle" dominantBaseline="central" className="font-display fill-qupu-brand-orange" fontSize={34} fontWeight={800}>
              ?
            </text>,
          )

          return nodes
        })()}

        {/* legend box (dotted border):  ∟ = 1 */}
        {(() => {
          const bx = 252
          const by = 12
          const bw = 96
          const bh = 48
          const lcx = bx + 26
          const lcy = by + bh / 2
          return (
            <g>
              <rect
                x={bx}
                y={by}
                width={bw}
                height={bh}
                rx={6}
                fill="none"
                className="stroke-qupu-muted"
                strokeWidth={2}
                strokeDasharray="3 4"
              />
              <BracketGlyph corner="bottomLeft" cx={lcx} cy={lcy} s={13} arm={12} strokeWidth={5} />
              <text x={lcx + 24} y={lcy + 1} textAnchor="middle" dominantBaseline="central" className="font-display fill-qupu-ink" fontSize={22} fontWeight={800}>
                =
              </text>
              <text x={lcx + 46} y={lcy + 1} textAnchor="middle" dominantBaseline="central" className="font-display fill-qupu-ink" fontSize={24} fontWeight={800}>
                1
              </text>
            </g>
          )
        })()}
      </svg>
    </div>
  )
}
