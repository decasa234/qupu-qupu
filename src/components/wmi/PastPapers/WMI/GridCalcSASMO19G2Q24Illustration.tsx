// SASMO-19-G2-Q24 — "Complete the cross-calculation grid puzzle"
//
// Shows Picture 2 (the completed example that teaches the rule) and
// Picture 3 (the new puzzle with unknown "?") side-by-side.
//
// Rule (learned from Picture 2):
//   Rows 0,1:  cells[r][0] × cells[r][1] = cells[r][2]
//   Cols 0,1:  cells[0][c] × cells[1][c] = cells[2][c]
//   Col 2:     cells[0][2] + cells[1][2]  = cells[2][2]
//   Row 2:     cells[2][0] − cells[2][1]  = cells[2][2]
//
// Answer: ? = cells[2][1] in Pic 3 = 8  (NOT revealed in the stem)
// Pure render — no hooks, no framer-motion, SSR-safe.

// ── layout constants ──────────────────────────────────────────────────────────

/** Cell box side length (px). */
export const CELL = 40
/** Gap between adjacent cells (px) — operators live in this space. */
export const GAP  = 26
/** Total side length of one 3×3 panel. */
export const PANEL_DIM = 3 * CELL + 2 * GAP  // 172

/** Left edge of cell at column c (relative to panel origin). */
export const cellX = (c: number) => c * (CELL + GAP)
/** Top edge of cell at row r (relative to panel origin). */
export const cellY = (r: number) => r * (CELL + GAP)

// SVG layout
const PAD   = 10
const SEP   = 18   // horizontal gap between the two panels
const LBL_H = 22   // label area height above each panel

/** X offset of Picture-2 panel. */
export const P2_X  = PAD
/** X offset of Picture-3 panel. */
export const P3_X  = PAD + PANEL_DIM + SEP
/** Y offset shared by both panels (below the label row). */
export const PY    = LBL_H
/** Total SVG width. */
export const SVG_W = PAD + PANEL_DIM + SEP + PANEL_DIM + PAD  // 382
/** Total SVG height. */
export const SVG_H = LBL_H + PANEL_DIM + 10                   // 204

// ── operator tables (fixed for every cross-calc 3×3) ─────────────────────────

// Horizontal: [row, col_gap (0 = between c0–c1, 1 = between c1–c2), symbol]
const H_OPS: [number, number, string][] = [
  [0, 0, '×'], [0, 1, '='],
  [1, 0, '×'], [1, 1, '='],
  [2, 0, '−'], [2, 1, '='],
]

// Vertical: [col, row_gap (0 = between r0–r1, 1 = between r1–r2), symbol]
const V_OPS: [number, number, string][] = [
  [0, 0, '×'], [1, 0, '×'], [2, 0, '+'],
  [0, 1, '='], [1, 1, '='], [2, 1, '='],
]

// ── GridPanel (also imported by the explainer) ────────────────────────────────

export interface GridPanelProps {
  /** SVG translate-x for the panel origin. */
  ox: number
  /** SVG translate-y for the panel origin. */
  oy: number
  /**
   * cells[r][c]:
   *   string  = label (bold text inside cell)
   *   null    = blank / empty cell (white fill)
   *   '?'     = highlighted amber cell (the unknown to find)
   */
  cells: (string | null)[][]
}

export function GridPanel({ ox, oy, cells }: GridPanelProps) {
  return (
    <g transform={`translate(${ox},${oy})`}>
      {/* ── cells ── */}
      {cells.map((row, r) =>
        row.map((val, c) => {
          const x     = cellX(c)
          const y     = cellY(r)
          const isQ   = val === '?'
          const blank = val === null
          return (
            <g key={`c${r}${c}`}>
              <rect
                x={x} y={y} width={CELL} height={CELL} rx={4}
                fill={isQ ? '#fef3c7' : blank ? '#ffffff' : '#f1f5f9'}
                stroke={isQ ? '#f59e0b' : '#374151'}
                strokeWidth={isQ ? 2.5 : 1.5}
              />
              {val !== null && (
                <text
                  x={x + CELL / 2} y={y + CELL / 2}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={val.length >= 2 ? 13 : 18}
                  fontWeight="bold"
                  fill={isQ ? '#d97706' : '#1e293b'}
                  fontFamily="system-ui,sans-serif"
                >
                  {val}
                </text>
              )}
            </g>
          )
        }),
      )}

      {/* ── horizontal operators ── */}
      {H_OPS.map(([r, cg, op]) => (
        <text
          key={`h${r}${cg}`}
          x={cellX(cg) + CELL + GAP / 2} y={cellY(r) + CELL / 2}
          textAnchor="middle" dominantBaseline="central"
          fontSize={13} fontWeight="600" fill="#6b7280"
          fontFamily="system-ui,sans-serif"
        >
          {op}
        </text>
      ))}

      {/* ── vertical operators ── */}
      {V_OPS.map(([c, rg, op]) => (
        <text
          key={`v${c}${rg}`}
          x={cellX(c) + CELL / 2} y={cellY(rg) + CELL + GAP / 2}
          textAnchor="middle" dominantBaseline="central"
          fontSize={13} fontWeight="600" fill="#6b7280"
          fontFamily="system-ui,sans-serif"
        >
          {op}
        </text>
      ))}
    </g>
  )
}

// ── static data ───────────────────────────────────────────────────────────────

/** Picture 2 — all cells filled (the worked example). */
export const EXAMPLE_CELLS: string[][] = [
  ['4',  '2',  '8' ],
  ['6',  '2',  '12'],
  ['24', '4',  '20'],
]

/** Picture 3 — stem (unknown cells blank; ? = R2C1). */
export const PUZZLE_CELLS: (string | null)[][] = [
  ['10', null, null],
  [null, '8',  null],
  [null, '?',  '82'],
]

/** Picture 3 — fully solved (for the explainer's result beat). */
export const SOLVED_P3_CELLS: string[][] = [
  ['10', '1',  '10'],
  ['9',  '8',  '72'],
  ['90', '8',  '82'],
]

// ── illustration (default export) ────────────────────────────────────────────

export default function GridCalcSASMO19G2Q24Illustration() {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
      aria-label="Gambar 2 (contoh lengkap) dan Gambar 3 (teka-teki) untuk SASMO 2019 G2 Q24"
    >
      {/* ── panel labels ── */}
      <text
        x={P2_X + PANEL_DIM / 2} y={13}
        textAnchor="middle" fontSize={10} fontWeight="700"
        fill="#6b7280" fontFamily="system-ui,sans-serif" letterSpacing="0.5"
      >
        GAMBAR 2
      </text>
      <text
        x={P3_X + PANEL_DIM / 2} y={13}
        textAnchor="middle" fontSize={10} fontWeight="700"
        fill="#6b7280" fontFamily="system-ui,sans-serif" letterSpacing="0.5"
      >
        GAMBAR 3
      </text>

      {/* ── divider ── */}
      <line
        x1={PAD + PANEL_DIM + SEP / 2} y1={6}
        x2={PAD + PANEL_DIM + SEP / 2} y2={SVG_H - 6}
        stroke="#e5e7eb" strokeWidth={1}
      />

      {/* ── Picture 2 (solved example) ── */}
      <GridPanel ox={P2_X} oy={PY} cells={EXAMPLE_CELLS} />

      {/* ── Picture 3 (puzzle — ? not revealed) ── */}
      <GridPanel ox={P3_X} oy={PY} cells={PUZZLE_CELLS} />
    </svg>
  )
}
