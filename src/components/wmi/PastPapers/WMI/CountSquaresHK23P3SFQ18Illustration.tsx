// CountSquaresHK23P3SFQ18Illustration.tsx
// HKIMO-23-P3SF-Q18 stem illustration.
// "How many squares are there in the figure below?"
//
// Shows the irregular 20-cell grid figure.  Does NOT reveal the answer.
// SSR-safe: no hooks, no framer-motion, no Math.random.
//
// Shape (0-indexed [row,col]):
//   Row 0: col 2
//   Row 1: cols 2 3 4
//   Rows 2-5: cols 0 1 2 3

// ── layout constants (re-exported so the explainer can share the same coordinates) ──────

/** Size of each unit cell in SVG pixels. */
export const CS = 34

/** Padding around the figure inside the SVG. */
export const PAD = 8

/** All 20 cells of the figure as [row, col] (0-indexed). */
export const CELLS: [number, number][] = [
  [0, 2],
  [1, 2], [1, 3], [1, 4],
  [2, 0], [2, 1], [2, 2], [2, 3],
  [3, 0], [3, 1], [3, 2], [3, 3],
  [4, 0], [4, 1], [4, 2], [4, 3],
  [5, 0], [5, 1], [5, 2], [5, 3],
]

/** Set of present cells for O(1) lookup. */
export const CELL_SET = new Set(CELLS.map(([r, c]) => `${r},${c}`))

/** SVG canvas dimensions. */
export const SVG_W = 5 * CS + 2 * PAD  // 5 cols wide
export const SVG_H = 6 * CS + 2 * PAD  // 6 rows tall

/** Pixel top-left corner of a cell at [row, col]. */
export function cellXY(row: number, col: number): { x: number; y: number } {
  return { x: PAD + col * CS, y: PAD + row * CS }
}

// ── component ────────────────────────────────────────────────────────────────

export default function CountSquaresHK23P3SFQ18Illustration() {
  return (
    <div
      className="mx-auto w-full max-w-[240px]"
      role="img"
      aria-label="Irregular grid figure for counting squares of all sizes"
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        aria-hidden="true"
      >
        {CELLS.map(([row, col]) => {
          const { x, y } = cellXY(row, col)
          return (
            <rect
              key={`${row},${col}`}
              x={x} y={y}
              width={CS} height={CS}
              fill="white"
              stroke="#374151"
              strokeWidth={1.4}
            />
          )
        })}
      </svg>
    </div>
  )
}
