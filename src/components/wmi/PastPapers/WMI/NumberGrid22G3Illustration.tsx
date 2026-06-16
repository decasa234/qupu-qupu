// WMI-22F3A-Q25 — Number grid logic puzzle.
//
// Fill 1..9 (each once) into a 3x3 grid of squares. The four circles sit on the
// four interior crossings; each equals the sum of its 4 surrounding squares.
// Squares sharing a background pattern sum to the number on the matching outside
// hexagon. Letters A, B, C mark three cells — the answer is the 3-digit number ABC.
//
// Cell indexing: grid[row][col], row top→bottom (0..2), col left→right (0..2).
//
// VERIFIED UNIQUE SOLUTION (solver-confirmed — for the animator only; do NOT
// draw the digits in the static figure):
//   grid = [[2,7,6],
//           [5,4,3],
//           [8,9,1]]
//
// Proof that this satisfies all 7 constraints:
//   Circle sums (each interior vertex = sum of its 4 touching cells):
//     top-left  = grid[0][0]+grid[0][1]+grid[1][0]+grid[1][1] = 2+7+5+4 = 18 ✓
//     top-right = grid[0][1]+grid[0][2]+grid[1][1]+grid[1][2] = 7+6+4+3 = 20 ✓
//     bot-left  = grid[1][0]+grid[1][1]+grid[2][0]+grid[2][1] = 5+4+8+9 = 26 ✓
//     bot-right = grid[1][1]+grid[1][2]+grid[2][1]+grid[2][2] = 4+3+9+1 = 17 ✓
//   Pattern sums:
//     striped (1,0),(2,0),(2,1) = 5+8+9 = 22 ✓  (hexagon 22)
//     gray    (0,2),(1,1),(1,2) = 6+4+3 = 13 ✓  (hexagon 13)
//     white   (0,0),(0,1),(2,2) = 2+7+1 = 10 ✓  (hexagon 10)
//   These 7 constraints over a permutation of 1..9 pin down a UNIQUE solution
//   (confirmed by exhaustive solver). Labels: A=(2,0)=8, B=(1,1)=4, C=(2,2)=1
//   ⇒ ABC = 841.

// ---- Pattern map (faithful to 2022-final-g3-a-q25.jpg) ---------------------
// Each entry is the row,col of a cell. Used by both the static figure and the
// primitive so shading stays in sync.

export type CellPattern = 'striped' | 'gray' | 'white'

// pattern of each [row][col]
const PATTERN: CellPattern[][] = [
  ['white', 'white', 'gray'],
  ['striped', 'gray', 'gray'],
  ['striped', 'striped', 'white'],
]

// Circles on the 4 interior crossings: [row, col] of the crossing's top-left
// cell, plus the printed sum.
const CIRCLES: { row: number; col: number; sum: number }[] = [
  { row: 0, col: 0, sum: 18 }, // top-left crossing
  { row: 0, col: 1, sum: 20 }, // top-right crossing
  { row: 1, col: 0, sum: 26 }, // bottom-left crossing
  { row: 1, col: 1, sum: 17 }, // bottom-right crossing
]

// Letter labels in their cells.
const LABELS: { row: number; col: number; letter: string }[] = [
  { row: 2, col: 0, letter: 'A' },
  { row: 1, col: 1, letter: 'B' },
  { row: 2, col: 2, letter: 'C' },
]

// Outside hexagons (top→bottom) and the pattern each targets.
const HEXES: { pattern: CellPattern; target: number }[] = [
  { pattern: 'white', target: 10 },
  { pattern: 'gray', target: 13 },
  { pattern: 'striped', target: 22 },
]

// ---- Layout -----------------------------------------------------------------

const CELL = 70 // square side
const PAD = 16 // outer padding (headroom so circles/strokes don't clip)
const GRID = CELL * 3
const HEX_GAP = 34 // gap between grid and hexagon column
const HEX_W = 56
const HEX_H = 50
const HEX_VGAP = (GRID - 3 * HEX_H) / 2 // even vertical spread of 3 hexes

const VIEW_W = PAD + GRID + HEX_GAP + HEX_W + PAD
const VIEW_H = PAD + GRID + PAD

const cellX = (col: number) => PAD + col * CELL
const cellY = (row: number) => PAD + row * CELL

// ---- Primitive: NumberGrid3x3 ----------------------------------------------

export interface NumberGrid3x3Props {
  /**
   * Optional 3x3 of digit values to print in the cells (row-major, top→bottom).
   * Use `null`/`undefined` for a blank cell. When the whole prop is omitted the
   * grid is empty (the puzzle state). The animator passes the solved digits.
   */
  values?: (number | null)[][] | null
  /** When true, draw the circles + sums on the interior crossings. */
  showCircles?: boolean
  /** When true, draw the A/B/C letter labels. */
  showLabels?: boolean
}

const STRIPE_FILL = 'url(#ng-stripes)'

/**
 * NumberGrid3x3 — the 3x3 square grid with background patterns, optional digit
 * values, optional interior-crossing circles, and optional A/B/C labels.
 *
 * Pure SVG fragment placed inside an <svg> by the caller (no outer div). Shared
 * by the static figure (values omitted → blank) and the animator (values =
 * solved digits).
 */
export function NumberGrid3x3({ values, showCircles = true, showLabels = true }: NumberGrid3x3Props) {
  const patternFill = (p: CellPattern): string =>
    p === 'striped' ? STRIPE_FILL : p === 'gray' ? '#D7DBE0' : '#FFFFFF'

  return (
    <g>
      {/* cell backgrounds */}
      {PATTERN.map((rowArr, r) =>
        rowArr.map((p, c) => (
          <rect
            key={`bg-${r}-${c}`}
            x={cellX(c)}
            y={cellY(r)}
            width={CELL}
            height={CELL}
            fill={patternFill(p)}
          />
        )),
      )}

      {/* grid lines */}
      <rect
        x={PAD}
        y={PAD}
        width={GRID}
        height={GRID}
        fill="none"
        className="stroke-qupu-ink"
        strokeWidth={3}
      />
      {[1, 2].map((i) => (
        <g key={`gl-${i}`}>
          <line
            x1={PAD + i * CELL}
            y1={PAD}
            x2={PAD + i * CELL}
            y2={PAD + GRID}
            className="stroke-qupu-ink"
            strokeWidth={2}
          />
          <line
            x1={PAD}
            y1={PAD + i * CELL}
            x2={PAD + GRID}
            y2={PAD + i * CELL}
            className="stroke-qupu-ink"
            strokeWidth={2}
          />
        </g>
      ))}

      {/* digit values (only when provided) */}
      {values &&
        values.map((rowArr, r) =>
          rowArr.map((v, c) =>
            v == null ? null : (
              <text
                key={`v-${r}-${c}`}
                x={cellX(c) + CELL / 2}
                y={cellY(r) + CELL / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={30}
                fontWeight={800}
                className="fill-qupu-brand-blue"
                fontFamily="Nunito, sans-serif"
              >
                {v}
              </text>
            ),
          ),
        )}

      {/* A/B/C labels */}
      {showLabels &&
        LABELS.map(({ row, col, letter }) => {
          // place the letter toward a free corner so it doesn't collide with a circle
          const lx = cellX(col) + (letter === 'C' ? CELL / 2 : CELL * 0.32)
          const ly = cellY(row) + CELL * 0.62
          return (
            <text
              key={`lab-${letter}`}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={26}
              fontWeight={800}
              className="fill-qupu-ink"
              fontFamily="Nunito, sans-serif"
            >
              {letter}
            </text>
          )
        })}

      {/* circles on interior crossings */}
      {showCircles &&
        CIRCLES.map(({ row, col, sum }, i) => {
          const cx = PAD + (col + 1) * CELL
          const cy = PAD + (row + 1) * CELL
          return (
            <g key={`circ-${i}`}>
              <circle
                cx={cx}
                cy={cy}
                r={22}
                fill="#FFFFFF"
                className="stroke-qupu-ink"
                strokeWidth={2.5}
              />
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={20}
                fontWeight={800}
                className="fill-qupu-ink"
                fontFamily="Nunito, sans-serif"
              >
                {sum}
              </text>
            </g>
          )
        })}
    </g>
  )
}

// ---- Hexagon helper ---------------------------------------------------------

function hexPoints(cx: number, cy: number, w: number, h: number): string {
  const hw = w / 2
  const hh = h / 2
  const inset = hw * 0.5
  // flat-left/right pointed hexagon
  return [
    [cx - inset, cy - hh],
    [cx + inset, cy - hh],
    [cx + hw, cy],
    [cx + inset, cy + hh],
    [cx - inset, cy + hh],
    [cx - hw, cy],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(' ')
}

// ---- SAMPLE fallback --------------------------------------------------------

interface NumberGridParams {
  /** No dynamic params for this question; the puzzle is fixed. */
  _unused?: unknown
}

const SAMPLE: NumberGridParams = {}

// ---- Default export: the static in-card puzzle figure -----------------------

/**
 * NumberGrid22G3Illustration
 *
 * Draws the PUZZLE only: empty 3x3 cells with their striped/gray/white
 * backgrounds, the four interior circle sums (18/20/26/17), the A/B/C labels,
 * and the three pattern-target hexagons (10 white, 13 gray, 22 striped). It
 * never fills the digit solution — that is the animator's job (NumberGrid3x3
 * with `values`).
 */
export default function NumberGrid22G3Illustration({ params }: { params: unknown }) {
  // params is not used (puzzle is fixed), but we narrow defensively.
  void ((params ?? {}) as Partial<NumberGridParams> ?? SAMPLE)

  const hexFill = (p: CellPattern): string =>
    p === 'striped' ? STRIPE_FILL : p === 'gray' ? '#D7DBE0' : '#FFFFFF'

  const hexColX = PAD + GRID + HEX_GAP + HEX_W / 2

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Teka-teki angka 3x3: isi 1 sampai 9. Empat lingkaran di persilangan dalam ' +
        'bernilai 18, 20, 26, 17 sama dengan jumlah 4 kotak di sekitarnya. ' +
        'Kotak berpola sama berjumlah angka pada segi enam: pola putih 10, abu-abu 13, garis miring 22. ' +
        'Huruf A, B, C menandai tiga kotak; cari bilangan tiga angka ABC.'
      }
    >
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={Math.min(340, VIEW_W)}>
        <defs>
          <pattern
            id="ng-stripes"
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width="14" height="14" fill="#FFFFFF" />
            <rect width="7" height="14" fill="#B9BFC7" />
          </pattern>
        </defs>

        {/* the grid + circles + labels (no digits) */}
        <NumberGrid3x3 showCircles showLabels />

        {/* hexagons on the right */}
        {HEXES.map(({ pattern, target }, i) => {
          const cy = PAD + HEX_VGAP + HEX_H / 2 + i * (HEX_H + HEX_VGAP)
          return (
            <g key={`hex-${i}`}>
              <polygon
                points={hexPoints(hexColX, cy, HEX_W, HEX_H)}
                fill={hexFill(pattern)}
                className="stroke-qupu-ink"
                strokeWidth={2.5}
              />
              <text
                x={hexColX}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={20}
                fontWeight={800}
                className="fill-qupu-ink"
                fontFamily="Nunito, sans-serif"
              >
                {target}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
