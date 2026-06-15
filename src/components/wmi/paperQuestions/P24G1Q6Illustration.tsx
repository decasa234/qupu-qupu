// In-card SVG illustration for WMI-24P1A-Q6 (2024 Grade-1 Semifinal, Paper A).
//
// "In the grid shown, which digit is to the left of the strawberry and below the
//  green apple?"  Answer: B (7).
//
// Source figure (db/seed/wmi/figures/2024-semifinal-g1-a-q6.jpg) is a 3 × 3 grid:
//   row 0:  pineapple   6          2
//   row 1:  0           green apple 5
//   row 2:  4           7          strawberry
//
// The strawberry sits in the bottom-right cell; the cell to its LEFT is the
// bottom-middle, which holds 7. The green apple sits in the centre; the cell
// BELOW it is also the bottom-middle, which holds 7. Both clues point to the same
// cell — the digit there is 7.
//
// This static figure draws ONLY the grid exactly as printed. It never marks the
// target cell and never reveals the answer letter. Post-answer, the explainer
// lights the clue arrows + the shared cell via the co-exported `Grid3x3`
// primitive's props.
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

const INK = '#1F2937'
const GRID_STROKE = '#1F2937'
const CELL_FILL = '#FFFFFF'
const DIGIT_FILL = '#1F2937'
const HILITE_FILL = '#FFF2DF' // qupu-cream — shared target cell (explainer)
const HILITE_STROKE = '#30598A' // qupu-brand-blue (explainer)
const STRAW_TINT = '#FCE4EC' // soft pink — strawberry clue cell (explainer)
const STRAW_STROKE = '#E11D48'
const APPLE_TINT = '#E8F5E9' // soft green — green-apple clue cell (explainer)
const APPLE_STROKE = '#16A34A'

/** A grid cell is either a digit (number) or a fruit emoji (single codepoint). */
export type CellKind = 'digit' | 'fruit'
export interface GridCell {
  kind: CellKind
  /** digit value, or the emoji glyph string */
  content: string
}

/** The 3 × 3 grid contents, row-major (row 0 = top). */
export const GRID: GridCell[][] = [
  [
    { kind: 'fruit', content: '\u{1F34D}' }, // pineapple
    { kind: 'digit', content: '6' },
    { kind: 'digit', content: '2' },
  ],
  [
    { kind: 'digit', content: '0' },
    { kind: 'fruit', content: '\u{1F34F}' }, // green apple
    { kind: 'digit', content: '5' },
  ],
  [
    { kind: 'digit', content: '4' },
    { kind: 'digit', content: '7' },
    { kind: 'fruit', content: '\u{1F353}' }, // strawberry
  ],
]

// Key cell coordinates [row, col].
export const STRAWBERRY_RC: [number, number] = [2, 2]
export const GREEN_APPLE_RC: [number, number] = [1, 1]
export const TARGET_RC: [number, number] = [2, 1] // left of strawberry AND below green apple → "7"
export const ANSWER_DIGIT = GRID[TARGET_RC[0]][TARGET_RC[1]].content // "7"

// ── Layout ──────────────────────────────────────────────────────────────────
const CELL = 64
const PAD = 14
const GRID_W = CELL * 3
const SVG_W = PAD * 2 + GRID_W
const SVG_H = PAD * 2 + GRID_W

export type CellMark = 'none' | 'strawberryClue' | 'appleClue' | 'target'

/**
 * The 3 × 3 grid.
 *
 * @param marks  optional 3 × 3 array of per-cell marks used by the explainer:
 *               'strawberryClue' (pink, the row scanned from the strawberry),
 *               'appleClue' (green, the column scanned from the green apple),
 *               'target' (cream + blue, the shared cell). With no marks it
 *               renders the bare problem grid.
 *
 * Malformed `marks` input is ignored cell-by-cell so previews always render.
 */
export function Grid3x3({ marks }: { marks?: CellMark[][] } = {}) {
  const getMark = (r: number, c: number): CellMark => {
    const row = Array.isArray(marks) ? marks[r] : undefined
    const m = Array.isArray(row) ? row[c] : undefined
    return m === 'strawberryClue' || m === 'appleClue' || m === 'target' ? m : 'none'
  }

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: 240, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {GRID.map((row, r) =>
        row.map((cell, c) => {
          const x = PAD + c * CELL
          const y = PAD + r * CELL
          const mark = getMark(r, c)

          let fill = CELL_FILL
          let stroke = GRID_STROKE
          let strokeW = 2.5
          if (mark === 'strawberryClue') {
            fill = STRAW_TINT
            stroke = STRAW_STROKE
            strokeW = 3
          } else if (mark === 'appleClue') {
            fill = APPLE_TINT
            stroke = APPLE_STROKE
            strokeW = 3
          }
          if (mark === 'target') {
            fill = HILITE_FILL
            stroke = HILITE_STROKE
            strokeW = 4
          }

          return (
            <g key={`${r}-${c}`}>
              <rect x={x} y={y} width={CELL} height={CELL} fill={fill} stroke={stroke} strokeWidth={strokeW} />
              {cell.kind === 'digit' ? (
                <text
                  x={x + CELL / 2}
                  y={y + CELL / 2 + 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={32}
                  fontWeight={800}
                  fill={DIGIT_FILL}
                  className="font-display"
                >
                  {cell.content}
                </text>
              ) : (
                <text
                  x={x + CELL / 2}
                  y={y + CELL / 2 + 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={34}
                >
                  {cell.content}
                </text>
              )}
            </g>
          )
        }),
      )}
      {/* redraw outer border crisply on top */}
      <rect x={PAD} y={PAD} width={GRID_W} height={GRID_W} fill="none" stroke={INK} strokeWidth={3} />
    </svg>
  )
}

/** Default export — the bare 3 × 3 grid (no marks). */
export default function P24G1Q6Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Kisi 3 kali 3. Baris atas: nanas, 6, 2. Baris tengah: 0, apel hijau, 5. Baris bawah: 4, 7, stroberi. Cari angka yang ada di kiri stroberi sekaligus di bawah apel hijau."
    >
      <Grid3x3 />
    </div>
  )
}
