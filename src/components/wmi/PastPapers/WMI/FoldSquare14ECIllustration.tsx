// IKMC-22-EC-Q14 — "Joanna folds the number square twice as shown. Then she
// punches a hole through the black spot shown by the arrow. Which numbers does
// she also punch through?" Answer B: 14, 17, 20, 23.
//
// Source figure: docs/reference/ocr-res/ikmc/contest/ecolier/2022.imgs/034.jpg
// A 6×6 grid numbered 1–36 (row-major), two fold lines:
//   Fold 1 (horizontal): top 3 rows fold DOWN over bottom 3 rows (red line between
//           rows 2 and 3, 0-indexed). Arrow curves downward-right on the left side.
//   Fold 2 (vertical): left 3 cols fold RIGHT over right 3 cols (green line between
//           cols 2 and 3). Arrow curves rightward on top edge.
//
// After both folds the result is a 3×3 quarter-sheet. The punch hole is at folded
// position (f_row=0, f_col=1), i.e. top row, second column in the folded quarter.
// That single hole goes through 4 original cells:
//   (2-f_row, 2-f_col) = (2, 1) = 14   ← top-left quadrant
//   (2-f_row, 3+f_col) = (2, 4) = 17   ← top-right quadrant
//   (3+f_row, 2-f_col) = (3, 1) = 20   ← bottom-left quadrant
//   (3+f_row, 3+f_col) = (3, 4) = 23   ← bottom-right quadrant
//
// The static illustration (default export, stage 0) shows ONLY the flat grid with
// fold-line guides — it NEVER reveals the answer. The co-exported FoldSquare14EC
// primitive accepts a `stage` prop (0 flat, 1 after fold 1, 2 after fold 2,
// 3 result) so the explainer can drive the same figure through each fold step.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

// ─── colours ────────────────────────────────────────────────────────────────
const PAPER = '#F9F5EC'       // warm cream (matches scan)
const EDGE = '#4A4A4A'        // grid lines / outer border
const INK = '#1A1A1A'         // printed numbers
const FOLD_H = '#D94343'      // horizontal fold line (red, matching scan)
const FOLD_V = '#3A7D44'      // vertical fold line (green, matching scan)
const HOLE = '#1A1A1A'        // punch hole dot
const HOLE_RING = '#D94343'   // ring around the hole
const HIT = '#FBBF24'         // highlight for punched cells in result stage

// ─── grid constants ─────────────────────────────────────────────────────────
const CELL = 28           // cell side length in px
const COLS = 6
const ROWS = 6
const GRID_W = CELL * COLS  // 168
const GRID_H = CELL * ROWS  // 168
const PAD = 16

// The 6×6 grid numbers, row-major, 0-indexed.
const GRID: number[][] = Array.from({ length: 6 }, (_, r) =>
  Array.from({ length: 6 }, (_, c) => r * 6 + c + 1),
)

// Cells that will be punched (0-indexed row, col in the original flat grid).
export const PUNCHED_CELLS: readonly [number, number][] = [
  [2, 1],  // 14
  [2, 4],  // 17
  [3, 1],  // 20
  [3, 4],  // 23
]
export const PUNCHED_NUMBERS = [14, 17, 20, 23] as const

// Hole position in the folded quarter (f_row=0, f_col=1).
// In stage 2 (folded result) we render the visible face = rows 3–5, cols 3–5,
// and place the hole at (f_row, f_col) relative to that 3×3 block.
const HOLE_F_ROW = 0
const HOLE_F_COL = 1

// ─── viewBox ─────────────────────────────────────────────────────────────────
const VB_W = GRID_W + PAD * 2
const VB_H = GRID_H + PAD * 2

// ─── export types ────────────────────────────────────────────────────────────
export type FoldSquareStage = 0 | 1 | 2 | 3

export interface FoldSquare14ECProps {
  /** 0=flat grid, 1=after horizontal fold, 2=after vertical fold (folded quarter),
   *  3=flat grid with all 4 punched cells highlighted + hole dot */
  stage?: FoldSquareStage
  /** For stage 3: which cells to highlight (defaults to PUNCHED_CELLS) */
  highlight?: readonly [number, number][]
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function cellX(col: number) { return PAD + col * CELL }
function cellY(row: number) { return PAD + row * CELL }

/** Single cell rectangle (no text). */
function CellRect({
  row, col, fill = PAPER, stroke = EDGE, sw = 0.75, opacity = 1,
}: { row: number; col: number; fill?: string; stroke?: string; sw?: number; opacity?: number }) {
  return (
    <rect
      x={cellX(col)} y={cellY(row)}
      width={CELL} height={CELL}
      fill={fill} stroke={stroke} strokeWidth={sw}
      opacity={opacity}
    />
  )
}

/** Centred number label inside a cell. */
function CellNum({
  row, col, n, dim = false,
}: { row: number; col: number; n: number; dim?: boolean }) {
  return (
    <text
      x={cellX(col) + CELL / 2}
      y={cellY(row) + CELL / 2 + 5}
      textAnchor="middle"
      fontSize="10"
      fontWeight="bold"
      fill={INK}
      opacity={dim ? 0.3 : 1}
    >
      {n}
    </text>
  )
}

// ─── Stage 0: flat 6×6 grid with fold guide lines ────────────────────────────
function FlatGrid() {
  return (
    <g>
      {/* outer border */}
      <rect
        x={PAD} y={PAD}
        width={GRID_W} height={GRID_H}
        fill={PAPER} stroke={EDGE} strokeWidth={1.5} rx={2}
      />
      {/* cells + numbers */}
      {GRID.map((row, r) =>
        row.map((n, c) => (
          <g key={`${r}-${c}`}>
            <CellRect row={r} col={c} />
            <CellNum row={r} col={c} n={n} />
          </g>
        )),
      )}
      {/* horizontal fold guide (between row 2 and 3) */}
      <line
        x1={PAD} y1={cellY(3)}
        x2={PAD + GRID_W} y2={cellY(3)}
        stroke={FOLD_H} strokeWidth={2} strokeDasharray="5 3"
      />
      {/* vertical fold guide (between col 2 and 3) */}
      <line
        x1={cellX(3)} y1={PAD}
        x2={cellX(3)} y2={PAD + GRID_H}
        stroke={FOLD_V} strokeWidth={2} strokeDasharray="5 3"
      />
      {/* fold-direction arrow labels */}
      <text x={PAD + 2} y={PAD + 10} fontSize="8" fill={FOLD_H} fontWeight="bold">↓ Fold 1</text>
      <text x={cellX(3) + 2} y={PAD + 10} fontSize="8" fill={FOLD_V} fontWeight="bold">→ Fold 2</text>
    </g>
  )
}

// ─── Stage 1: after fold 1 (top rows flip down) ──────────────────────────────
// Shows a 3×6 half-sheet. The visible face is the bottom half (rows 3–5); the
// flipped top half (rows 2–0, reversed) lies underneath. We draw the bottom rows
// only (numbers), plus a slight "flap" peek at the top edge to signal the fold.
function AfterHFold() {
  const halfH = CELL * 3
  const x0 = PAD
  const y0 = PAD + (GRID_H - halfH) / 2  // vertically centred in the viewBox

  return (
    <g>
      {/* folded-under flap peeking at top edge */}
      <path
        d={`M${x0 + 4} ${y0} L${x0 + 16} ${y0 - 10} L${x0 + GRID_W - 16} ${y0 - 10} L${x0 + GRID_W - 4} ${y0} Z`}
        fill={PAPER} stroke={EDGE} strokeWidth={1} opacity={0.7}
      />
      {/* half-sheet border */}
      <rect
        x={x0} y={y0}
        width={GRID_W} height={halfH}
        fill={PAPER} stroke={EDGE} strokeWidth={1.5} rx={2}
      />
      {/* cell grid lines */}
      {Array.from({ length: 6 }, (_, r) =>
        Array.from({ length: 6 }, (_, c) => (
          <CellRect
            key={`${r}-${c}`}
            row={0} col={c}
            // just draw the strokes; position via transform
          />
        )),
      )}
      {/* bottom-half cells + numbers (rows 3–5, displayed at half-sheet rows 0–2) */}
      {[3, 4, 5].map((origRow, dispRow) =>
        GRID[origRow].map((n, c) => (
          <g key={`${origRow}-${c}`}>
            <rect
              x={x0 + c * CELL} y={y0 + dispRow * CELL}
              width={CELL} height={CELL}
              fill={PAPER} stroke={EDGE} strokeWidth={0.75}
            />
            <text
              x={x0 + c * CELL + CELL / 2}
              y={y0 + dispRow * CELL + CELL / 2 + 5}
              textAnchor="middle"
              fontSize="10" fontWeight="bold" fill={INK}
            >
              {n}
            </text>
          </g>
        )),
      )}
      {/* vertical fold guide for the next fold */}
      <line
        x1={x0 + CELL * 3} y1={y0}
        x2={x0 + CELL * 3} y2={y0 + halfH}
        stroke={FOLD_V} strokeWidth={2} strokeDasharray="5 3"
      />
      <text x={x0 + CELL * 3 + 2} y={y0 + 10} fontSize="8" fill={FOLD_V} fontWeight="bold">→ Fold 2</text>
    </g>
  )
}

// ─── Stage 2: after fold 2 (left cols fold right) — 3×3 quarter visible ──────
// The visible face is the bottom-right quadrant (rows 3–5, cols 3–5).
// Punch hole shown at (HOLE_F_ROW, HOLE_F_COL) relative to this 3×3 block.
function AfterVFold() {
  const qSide = CELL * 3
  const x0 = PAD + (GRID_W - qSide) / 2
  const y0 = PAD + (GRID_H - qSide) / 2

  return (
    <g>
      {/* flap peeks at top (first fold) */}
      <path
        d={`M${x0 + 4} ${y0} L${x0 + 16} ${y0 - 8} L${x0 + qSide - 16} ${y0 - 8} L${x0 + qSide - 4} ${y0} Z`}
        fill={PAPER} stroke={EDGE} strokeWidth={1} opacity={0.7}
      />
      {/* flap peeks at left (second fold) */}
      <path
        d={`M${x0} ${y0 + 4} L${x0 - 8} ${y0 + 16} L${x0 - 8} ${y0 + qSide - 16} L${x0} ${y0 + qSide - 4} Z`}
        fill={PAPER} stroke={EDGE} strokeWidth={1} opacity={0.7}
      />
      {/* quarter-sheet border */}
      <rect
        x={x0} y={y0} width={qSide} height={qSide}
        fill={PAPER} stroke={EDGE} strokeWidth={1.5} rx={2}
      />
      {/* cells + numbers (bottom-right quadrant: rows 3–5, cols 3–5) */}
      {[3, 4, 5].map((origRow, dr) =>
        [3, 4, 5].map((origCol, dc) => (
          <g key={`${origRow}-${origCol}`}>
            <rect
              x={x0 + dc * CELL} y={y0 + dr * CELL}
              width={CELL} height={CELL}
              fill={PAPER} stroke={EDGE} strokeWidth={0.75}
            />
            <text
              x={x0 + dc * CELL + CELL / 2}
              y={y0 + dr * CELL + CELL / 2 + 5}
              textAnchor="middle"
              fontSize="10" fontWeight="bold" fill={INK}
            >
              {GRID[origRow][origCol]}
            </text>
          </g>
        )),
      )}
      {/* punch hole */}
      {(() => {
        const hx = x0 + HOLE_F_COL * CELL + CELL / 2
        const hy = y0 + HOLE_F_ROW * CELL + CELL / 2
        return (
          <g>
            <circle cx={hx} cy={hy} r={6} fill={PAPER} stroke={HOLE_RING} strokeWidth={1.5} />
            <circle cx={hx} cy={hy} r={3.5} fill={HOLE} />
          </g>
        )
      })()}
    </g>
  )
}

// ─── Stage 3: flat grid with 4 punched cells highlighted ─────────────────────
function ResultGrid({ highlight = PUNCHED_CELLS }: { highlight?: readonly [number, number][] }) {
  const hitSet = new Set(highlight.map(([r, c]) => `${r},${c}`))
  return (
    <g>
      {/* outer border */}
      <rect
        x={PAD} y={PAD}
        width={GRID_W} height={GRID_H}
        fill={PAPER} stroke={EDGE} strokeWidth={1.5} rx={2}
      />
      {GRID.map((row, r) =>
        row.map((n, c) => {
          const isHit = hitSet.has(`${r},${c}`)
          return (
            <g key={`${r}-${c}`}>
              <CellRect row={r} col={c} fill={isHit ? HIT : PAPER} />
              <CellNum row={r} col={c} n={n} />
              {isHit && (
                <circle
                  cx={cellX(c) + CELL / 2}
                  cy={cellY(r) + CELL / 2}
                  r={4}
                  fill={HOLE}
                  opacity={0.7}
                />
              )}
            </g>
          )
        }),
      )}
      {/* fold guides (dimmed in result) */}
      <line
        x1={PAD} y1={cellY(3)}
        x2={PAD + GRID_W} y2={cellY(3)}
        stroke={FOLD_H} strokeWidth={1.5} strokeDasharray="5 3" opacity={0.4}
      />
      <line
        x1={cellX(3)} y1={PAD}
        x2={cellX(3)} y2={PAD + GRID_H}
        stroke={FOLD_V} strokeWidth={1.5} strokeDasharray="5 3" opacity={0.4}
      />
    </g>
  )
}

// ─── Primitive (shared with explainer) ───────────────────────────────────────
/**
 * FoldSquare14EC({ stage }) — pure function of stage, drives all four beats of the
 * fold animation. Default export pins it to stage=0 (question card, no answer).
 */
export function FoldSquare14EC({ stage = 0, highlight }: FoldSquare14ECProps = {}) {
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={Math.min(220, VB_W)}
      aria-hidden="true"
    >
      {stage === 0 && <FlatGrid />}
      {stage === 1 && <AfterHFold />}
      {stage === 2 && <AfterVFold />}
      {stage === 3 && <ResultGrid highlight={highlight} />}
    </svg>
  )
}

// ─── Default export: stem illustration (flat grid, no answer) ────────────────
export default function FoldSquare14ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'A 6 by 6 number grid with numbers 1 to 36. ' +
        'A red dashed horizontal line crosses between rows 3 and 4, and a green dashed vertical line ' +
        'crosses between columns 3 and 4. The grid is folded twice along these lines and a hole is punched.'
      }
    >
      <FoldSquare14EC stage={0} />
    </div>
  )
}
