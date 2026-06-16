// WMI-24F2A-Q23 (Grade 2 Final 2024) — Go stone 4×4 grid puzzle.
//
// Each of the 16 cells holds one black or white Go stone. Every stone must be
// adjacent (sharing a side) to at least one black stone AND at least one white
// stone. How many black stones can be placed at most?  (Answer: 10.)
//
// The STATIC figure shows only the PROBLEM: an empty 4×4 grid of cells with a
// legend illustrating what black and white Go stones look like, plus a small
// adjacency hint. It never reveals a placement or the answer — that is the
// animator's job post-answer.
//
// SSR-safe + deterministic: pure render, no Math.random, no Date, no state.

// --- data exports (animator / explainer may import these) -------------------

/** Number of rows and columns in the grid. */
export const GRID_SIZE = 4

/** Total cells on the board. */
export const TOTAL_CELLS = GRID_SIZE * GRID_SIZE // 16

/**
 * One optimal white-stone placement that satisfies the constraint with only 6
 * whites (leaving 10 blacks). Whites occupy the top-left 2 cells and the
 * bottom-left 2 cells (row 0 col 0-1, row 3 col 0-1) and the right edge of
 * rows 1-2 (col 3), so every cell — black or white — has at least one neighbour
 * of each colour.
 *
 * Layout (B = black, W = white):
 *   W W B B
 *   B B B W
 *   B B B W
 *   W W B B
 * Verified: 6 whites, 10 blacks, ALL 16 cells satisfy the adjacency rule.
 */
export const OPTIMAL_GRID: Array<'B' | 'W'> = [
  'W', 'W', 'B', 'B',
  'B', 'B', 'B', 'W',
  'B', 'B', 'B', 'W',
  'W', 'W', 'B', 'B',
]

/** Total black stones in the optimal layout. */
export const MAX_BLACK = OPTIMAL_GRID.filter((c) => c === 'B').length // 10

// --- layout constants (shared with primitive & illustration) ----------------
const CELL = 52          // cell side length
const PAD = 20           // outer padding so nothing clips
const BOARD = GRID_SIZE * CELL  // 208
const W_TOTAL = PAD * 2 + BOARD // 248
const H_TOTAL = PAD * 2 + BOARD + 72 // +72 for legend below

const LINE = '#1F2937'   // dark grid lines / stone outlines
const BLACK_FILL = '#1a1714'
const WHITE_FILL = '#ffffff'
const WHITE_STROKE = '#374151'

/** x-centre of cell at column c. */
const cx = (c: number) => PAD + c * CELL + CELL / 2
/** y-centre of cell at row r. */
const cy = (r: number) => PAD + r * CELL + CELL / 2

// --- sub-components ---------------------------------------------------------

/** The 4×4 grid lines only (no stones). */
function EmptyGrid() {
  const lines: React.ReactNode[] = []
  // internal horizontal lines
  for (let r = 0; r <= GRID_SIZE; r++) {
    const y = PAD + r * CELL
    lines.push(
      <line key={`h${r}`} x1={PAD} y1={y} x2={PAD + BOARD} y2={y}
        stroke={LINE} strokeWidth={r === 0 || r === GRID_SIZE ? 2.2 : 1.4} />
    )
  }
  // internal vertical lines
  for (let c = 0; c <= GRID_SIZE; c++) {
    const x = PAD + c * CELL
    lines.push(
      <line key={`v${c}`} x1={x} y1={PAD} x2={x} y2={PAD + BOARD}
        stroke={LINE} strokeWidth={c === 0 || c === GRID_SIZE ? 2.2 : 1.4} />
    )
  }
  return <g>{lines}</g>
}

/** One Go stone circle (black or white). */
function Stone({
  x, y, kind, r = 18, lit = false,
}: {
  x: number; y: number; kind: 'B' | 'W'; r?: number; lit?: boolean
}) {
  const isBlack = kind === 'B'
  return (
    <g>
      {lit && (
        <circle cx={x} cy={y} r={r + 5} fill="none"
          className="stroke-qupu-brand-orange" strokeWidth={2.5} />
      )}
      <circle
        cx={x} cy={y} r={r}
        fill={isBlack ? BLACK_FILL : WHITE_FILL}
        stroke={isBlack ? LINE : WHITE_STROKE}
        strokeWidth={isBlack ? 1.2 : 1.8}
      />
      {/* subtle glare on black stone */}
      {isBlack && (
        <ellipse cx={x - r * 0.28} cy={y - r * 0.28} rx={r * 0.22} ry={r * 0.15}
          fill="rgba(255,255,255,0.18)" />
      )}
    </g>
  )
}

// --- reusable primitive (for animator / explainer) --------------------------

/**
 * Primitive: the 4×4 grid with optional stone placement overlay.
 *
 * @param placement - 16-element array of 'B' | 'W' | null (null = empty cell).
 *   Index = row * 4 + col.  Defaults to all-empty.
 * @param litCells  - Set of cell indices to draw an orange ring around.
 */
export function GoGrid24G2({
  placement = Array<'B' | 'W' | null>(16).fill(null),
  litCells = new Set<number>(),
}: {
  placement?: Array<'B' | 'W' | null>
  litCells?: Set<number>
}) {
  return (
    <svg
      viewBox={`0 0 ${W_TOTAL} ${PAD * 2 + BOARD}`}
      width={Math.min(260, W_TOTAL)}
      aria-hidden="true"
    >
      {/* board background */}
      <rect x={PAD} y={PAD} width={BOARD} height={BOARD}
        fill="#FEF9F0" rx={3} />
      <EmptyGrid />
      {placement.map((kind, idx) => {
        if (kind == null) return null
        const r = Math.floor(idx / GRID_SIZE)
        const c = idx % GRID_SIZE
        return (
          <Stone
            key={idx}
            x={cx(c)} y={cy(r)}
            kind={kind}
            lit={litCells.has(idx)}
          />
        )
      })}
    </svg>
  )
}

// --- legend sub-component ---------------------------------------------------

/**
 * A small legend below the grid: black stone + label  /  white stone + label.
 * Positioned relative to (lx, ly) top-left.
 */
function Legend({ lx, ly }: { lx: number; ly: number }) {
  const r = 13
  const gap = 20
  // black stone entry
  const bx = lx + r + 2
  // white stone entry
  const wx = lx + 110 + r + 2

  return (
    <g>
      {/* black stone */}
      <Stone x={bx} y={ly + r} kind="B" r={r} />
      <text
        x={bx + r + 8} y={ly + r}
        dominantBaseline="central"
        fontSize={13} fontWeight={700} fill={LINE}
        className="font-display"
      >
        Hitam (B)
      </text>
      {/* white stone */}
      <Stone x={wx} y={ly + r} kind="W" r={r} />
      <text
        x={wx + r + 8} y={ly + r}
        dominantBaseline="central"
        fontSize={13} fontWeight={700} fill={LINE}
        className="font-display"
      >
        Putih (W)
      </text>
      {/* adjacency note */}
      <text
        x={lx} y={ly + gap + r + 8}
        fontSize={11} fill="#4B5563"
        className="font-display"
      >
        Tiap batu harus bersebelahan dengan batu hitam
      </text>
      <text
        x={lx} y={ly + gap + r + 22}
        fontSize={11} fill="#4B5563"
        className="font-display"
      >
        DAN batu putih. Paling banyak ada berapa batu hitam?
      </text>
    </g>
  )
}

// --- question illustration (default export) ---------------------------------

/**
 * Default export: in-card SVG illustration for WMI-24F2A-Q23.
 *
 * Shows the empty 4×4 grid (no stones placed) + a legend explaining the two
 * stone colours. Does NOT reveal any placement or the answer.
 *
 * Accepts `params: unknown` for API consistency; the grid is fully determined
 * by the question text so no dynamic params are needed. A SAMPLE constant
 * (the full problem spec) is provided for preview contexts.
 */
export interface Grid24G2Params {
  gridSize: number
  totalCells: number
}

export const SAMPLE: Grid24G2Params = {
  gridSize: GRID_SIZE,
  totalCells: TOTAL_CELLS,
}

export default function Grid24G2Illustration({ params }: { params: unknown }) {
  // params are informational; the figure is fully determined by the constants.
  void params // acknowledged but unused — grid is fixed by the question body

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        `Kisi 4 kali 4 dengan 16 kotak kosong. ` +
        `Setiap kotak akan diisi satu batu Go hitam atau putih. ` +
        `Setiap batu harus bersebelahan (berbagi sisi) dengan minimal satu batu hitam ` +
        `DAN minimal satu batu putih. ` +
        `Pertanyaan: paling banyak ada berapa batu hitam yang bisa diletakkan?`
      }
    >
      <svg viewBox={`0 0 ${W_TOTAL} ${H_TOTAL}`} width={Math.min(260, W_TOTAL)}>
        {/* board background */}
        <rect x={PAD} y={PAD} width={BOARD} height={BOARD}
          fill="#FEF9F0" rx={3} />

        {/* empty 4×4 grid */}
        <EmptyGrid />

        {/* row/col index labels (1–4) */}
        {Array.from({ length: GRID_SIZE }, (_, i) => (
          <g key={i}>
            {/* column numbers along top */}
            <text
              x={cx(i)} y={PAD - 7}
              textAnchor="middle" dominantBaseline="auto"
              fontSize={11} fill="#9CA3AF"
              className="font-display"
            >
              {i + 1}
            </text>
            {/* row numbers along left */}
            <text
              x={PAD - 7} y={cy(i)}
              textAnchor="end" dominantBaseline="central"
              fontSize={11} fill="#9CA3AF"
              className="font-display"
            >
              {i + 1}
            </text>
          </g>
        ))}

        {/* legend below the grid */}
        <Legend lx={PAD} ly={PAD + BOARD + 12} />
      </svg>
    </div>
  )
}
