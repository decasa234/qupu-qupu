// IKMC-22-EC-Q1 — Bee-to-flower grid maze (stem illustration only)
//
// "Buzz the bee wants to reach the flower. Which set of directions will get
//  him there?"
//
// Source scan: docs/reference/ocr-res/ikmc/contest/ecolier/2022.imgs/001.jpg
// Reconstruction: a 4×4 grid of cells (5×5 node lattice, col 0–4, row 0–4).
//   Bee    @ top-left  cell corner (col 0, row 0).
//   Flower @ bottom-right-ish cell (col 3, row 3).
//
// The five text/arrow options (A–E) are shown in the answer choices, not as
// figure pictures, so this is a STEM illustration only — no Option renderer.
// The stem draws ONLY the problem (bee, flower, grid) and never the route.
//
// Answer-A trace verification (→ ↓ → ↓ ↓ →) from (0,0):
//   (0,0) → (1,0) ↓ (1,1) → (2,1) ↓ (2,2) ↓ (2,3) → (3,3) ✓ flower
//
// Adapted from MazeGrid11PEIllustration (cell-based grid + trail overlay).

// ---- Palette ---------------------------------------------------------------
const CELL_BG      = '#FEFCE8'   // warm yellow (matches scan's pale-yellow cells)
const CELL_STROKE  = '#D1D5DB'   // dashed grey grid lines
const TRAIL_COLOR  = '#F59E0B'   // amber trail (consistent with other maze explainers)
const INK          = '#1F2937'

// ---- Geometry ---------------------------------------------------------------

const COLS = 4   // number of cell columns
const ROWS = 4   // number of cell rows
const CELL = 56  // cell size in px
const PAD  = 36  // padding around the grid

const VIEW_W = COLS * CELL + PAD * 2
const VIEW_H = ROWS * CELL + PAD * 2

/** Top-left corner of cell (col, row). */
const cellX = (col: number) => PAD + col * CELL
const cellY = (row: number) => PAD + row * CELL
/** Centre of cell (col, row). */
const cx = (col: number) => cellX(col) + CELL / 2
const cy = (row: number) => cellY(row) + CELL / 2

// ---- Positions -------------------------------------------------------------

/** Bee starts at top-left cell corner. */
export const BEE_POS: readonly [number, number] = [0, 0] as const
/** Flower sits at col 3, row 3. */
export const FLOWER_POS: readonly [number, number] = [3, 3] as const

// ---- Path encoder ----------------------------------------------------------

/**
 * Encode a sequence of [col, row] cells as a litPath string ("cr-cr-…").
 * The stem never calls this; the explainer uses it to highlight each route.
 */
export function encodeCellPath(cells: ReadonlyArray<readonly [number, number]>): string {
  return cells.map(([c, r]) => `${c}${r}`).join('-')
}

// ---- Pre-computed routes for options A–E -----------------------------------
// Each route is traced from (0,0) following the arrow sequence and encoded
// as a litPath string. Routes that miss the flower are shown in red by the
// explainer; route A reaches (3,3) and is shown in green.

/** A: → ↓ → ↓ ↓ → → (0,0)(1,0)(1,1)(2,1)(2,2)(2,3)(3,3) */
export const ROUTE_A = encodeCellPath([[0,0],[1,0],[1,1],[2,1],[2,2],[2,3],[3,3]])

/** B: ↓ ↓ → ↓ ↓ → (0,0)(0,1)(0,2)(1,2)(1,3)(1,4 — off grid stops at row 3 boundary) */
// (0,0)↓(0,1)↓(0,2)→(1,2)↓(1,3)↓ — col 1, row 4 is off-grid (only rows 0-4 exist
// but row 4 is the edge). The path ends at (1,3) ≠ flower.
export const ROUTE_B = encodeCellPath([[0,0],[0,1],[0,2],[1,2],[1,3]])

/** C: → ↓ → ↓ → → (0,0)(1,0)(1,1)(2,1)(2,2)(3,2) */
// (0,0)→(1,0)↓(1,1)→(2,1)↓(2,2)→(3,2) ≠ flower
export const ROUTE_C = encodeCellPath([[0,0],[1,0],[1,1],[2,1],[2,2],[3,2]])

/** D: → → ↓ ↓ → (0,0)(1,0)(2,0)(2,1)(2,2)(3,2) — only 4 moves → (2,2) */
// (0,0)→(1,0)→(2,0)↓(2,1)↓(2,2) ≠ flower
export const ROUTE_D = encodeCellPath([[0,0],[1,0],[2,0],[2,1],[2,2]])

/** E: ↓ → → ↓ ↓ ↓ → (0,0)(0,1)(1,1)(2,1)(2,2)(2,3)(2,4 — off edge at row 4) */
// (0,0)↓(0,1)→(1,1)→(2,1)↓(2,2)↓(2,3)↓ col2 row4 = edge, ≠ flower (3,3)
export const ROUTE_E = encodeCellPath([[0,0],[0,1],[1,1],[2,1],[2,2],[2,3]])

// ---- Bee glyph (SVG, no emoji) ---------------------------------------------

function BeeGlyph({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`} aria-hidden="true">
      {/* body */}
      <ellipse cx={0} cy={0} rx={9} ry={12} fill="#F59E0B" stroke="#92400E" strokeWidth={1.2} />
      {/* stripes */}
      <rect x={-9} y={-4} width={18} height={4} fill="#1F2937" opacity={0.6} rx={2} />
      <rect x={-9} y={3}  width={18} height={3} fill="#1F2937" opacity={0.6} rx={2} />
      {/* head */}
      <circle cx={0} cy={-14} r={7} fill="#F59E0B" stroke="#92400E" strokeWidth={1.2} />
      {/* eye */}
      <circle cx={2.5} cy={-15} r={1.5} fill={INK} />
      {/* antennae */}
      <line x1={-2} y1={-21} x2={-5} y2={-26} stroke="#92400E" strokeWidth={1.2} strokeLinecap="round" />
      <circle cx={-5} cy={-26} r={1.5} fill="#92400E" />
      <line x1={2} y1={-21} x2={5} y2={-26} stroke="#92400E" strokeWidth={1.2} strokeLinecap="round" />
      <circle cx={5} cy={-26} r={1.5} fill="#92400E" />
      {/* wings */}
      <ellipse cx={-12} cy={-6} rx={8} ry={5} fill="white" stroke="#93C5FD" strokeWidth={1} opacity={0.85} />
      <ellipse cx={ 12} cy={-6} rx={8} ry={5} fill="white" stroke="#93C5FD" strokeWidth={1} opacity={0.85} />
    </g>
  )
}

// ---- Flower glyph (SVG, no emoji) ------------------------------------------

function FlowerGlyph({ x, y }: { x: number; y: number }) {
  const petals = [0, 60, 120, 180, 240, 300]
  return (
    <g transform={`translate(${x},${y})`} aria-hidden="true">
      {/* stem */}
      <line x1={0} y1={8} x2={0} y2={20} stroke="#16A34A" strokeWidth={2.5} strokeLinecap="round" />
      {/* petals */}
      {petals.map((deg) => (
        <ellipse
          key={deg}
          cx={Math.round(Math.cos((deg * Math.PI) / 180) * 9)}
          cy={Math.round(Math.sin((deg * Math.PI) / 180) * 9)}
          rx={5}
          ry={8}
          fill="#F472B6"
          stroke="#DB2777"
          strokeWidth={0.8}
          transform={`rotate(${deg},${Math.round(Math.cos((deg * Math.PI) / 180) * 9)},${Math.round(Math.sin((deg * Math.PI) / 180) * 9)})`}
        />
      ))}
      {/* centre */}
      <circle cx={0} cy={0} r={6} fill="#FDE68A" stroke="#D97706" strokeWidth={1} />
    </g>
  )
}

// ---- BeeMaze1EC primitive ---------------------------------------------------

export interface BeeMaze1ECProps {
  /**
   * Optional route to highlight, encoded as `"cr-cr-…"` (cell centres).
   * The stem leaves this null; the explainer passes one option's route.
   */
  litPath?: string | null
  /**
   * Trail colour override — green for valid, red for invalid.
   * Defaults to amber (TRAIL_COLOR).
   */
  trailColor?: string
}

/**
 * BeeMaze1EC
 *
 * Shared 4×4 grid primitive for IKMC-22-EC-Q1.
 * Renders the warm-yellow cell grid, Buzz the bee (top-left), the flower
 * (col 3, row 3), and optionally a highlighted route overlay.
 */
export function BeeMaze1EC({ litPath = null, trailColor = TRAIL_COLOR }: BeeMaze1ECProps) {
  // Decode lit route: split "cr" tokens → cell centres for polyline
  const trailPoints = (() => {
    if (!litPath) return null
    const pts = litPath.split('-').map((tok) => {
      const col = Number(tok[0])
      const row = Number(tok[1])
      if (!Number.isFinite(col) || !Number.isFinite(row)) return null
      return `${cx(col)},${cy(row)}`
    })
    return pts.every((p) => p !== null) ? (pts as string[]).join(' ') : null
  })()

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width={Math.min(300, VIEW_W)}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {/* background */}
      <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="white" />

      {/* cell backgrounds */}
      {Array.from({ length: ROWS }, (_, r) =>
        Array.from({ length: COLS }, (_, c) => (
          <rect
            key={`cell-${c}-${r}`}
            x={cellX(c)}
            y={cellY(r)}
            width={CELL}
            height={CELL}
            fill={CELL_BG}
            stroke="none"
          />
        )),
      )}

      {/* Optional route trail (drawn under grid lines, over cell fill) */}
      {trailPoints && (
        <polyline
          points={trailPoints}
          fill="none"
          stroke={trailColor}
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.8}
        />
      )}

      {/* Grid lines (dashed, matching source scan) */}
      {Array.from({ length: COLS + 1 }, (_, c) => (
        <line
          key={`vl${c}`}
          x1={PAD + c * CELL}
          y1={PAD}
          x2={PAD + c * CELL}
          y2={PAD + ROWS * CELL}
          stroke={CELL_STROKE}
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
      ))}
      {Array.from({ length: ROWS + 1 }, (_, r) => (
        <line
          key={`hl${r}`}
          x1={PAD}
          y1={PAD + r * CELL}
          x2={PAD + COLS * CELL}
          y2={PAD + r * CELL}
          stroke={CELL_STROKE}
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
      ))}

      {/* Flower at (3,3) */}
      <FlowerGlyph x={cx(FLOWER_POS[0])} y={cy(FLOWER_POS[1])} />

      {/* Bee at (0,0) — drawn last so it sits on top */}
      <BeeGlyph x={cx(BEE_POS[0])} y={cy(BEE_POS[1])} />
    </svg>
  )
}

// ---- Default export: stem illustration -------------------------------------

/**
 * BeeMaze1ECIllustration
 *
 * Static problem-only figure for IKMC-22-EC-Q1 (2022 IKMC Ecolier, Q1).
 * Shows the 4×4 grid with Buzz the bee (top-left) and the flower (col 3, row 3).
 * Never reveals the valid route — that is the explainer's job.
 */
export default function BeeMaze1ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Kotak-kotak 4×4: lebah Buzz di pojok kiri atas, bunga di kolom 3 baris 3. Temukan urutan arah yang membawa Buzz ke bunga."
    >
      <BeeMaze1EC />
    </div>
  )
}
