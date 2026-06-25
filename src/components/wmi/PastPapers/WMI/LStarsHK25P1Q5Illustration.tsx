// HKIMO-25-P1H-Q5 — "How many ★ in the 7th group?"
//
// The stem shows 4 groups of ★ arranged as L-shapes (bottom-aligned).
// Group n has 2n − 1 stars (odd-number sequence: 1, 3, 5, 7, …).
//
// L-shape geometry for group n ([row, col], row 0 = top):
//   • Left column : [0,0], [1,0], …, [n-1, 0]   (n cells)
//   • Bottom row  : [n-1, 1], …, [n-1, n-1]     (n-1 cells)
//   Total = 2n − 1 cells
//
// No Math.random, no Date, no hooks. SSR-safe.

// ─── Layout constants ────────────────────────────────────────────────────────

export const CELL    = 24   // px per grid square
export const PAD     = 16   // outer padding
export const GAP     = 20   // horizontal gap between groups
export const MAX_N   = 4    // how many groups to show
export const BOTTOM_Y = PAD + MAX_N * CELL  // 112 — shared baseline for all groups

/** X-coordinate of the left edge of each group's bounding box. */
export const GROUP_X: number[] = (() => {
  const xs: number[] = []
  let x = PAD
  for (let n = 1; n <= MAX_N; n++) {
    xs.push(x)
    x += n * CELL + GAP
  }
  return xs
})()

export const SVG_W = GROUP_X[MAX_N - 1] + MAX_N * CELL + PAD   // 332
export const SVG_H = BOTTOM_Y + 22                               // 134

// ─── Colours ─────────────────────────────────────────────────────────────────

export const C_FILL   = '#FCD34D'   // amber-300
export const C_STROKE = '#92400E'   // amber-900
export const C_LABEL  = '#6B7280'   // gray-500

// ─── Geometry helper ─────────────────────────────────────────────────────────

/** L-shape cells for group n as [row, col] pairs (row 0 = top). */
export function lCells(n: number): [number, number][] {
  const cells: [number, number][] = []
  for (let r = 0; r < n; r++) cells.push([r, 0])        // left column
  for (let c = 1; c < n; c++) cells.push([n - 1, c])    // bottom row
  return cells
}

const LABELS = ['1st', '2nd', '3rd', '4th']

// ─── Component ───────────────────────────────────────────────────────────────

export default function LStarsHK25P1Q5Illustration() {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      style={{ width: '100%', maxWidth: SVG_W }}
      aria-label="Star groups 1 to 4 shown as L-shaped arrangements"
    >
      {Array.from({ length: MAX_N }, (_, i) => {
        const n  = i + 1
        const gx = GROUP_X[i]
        const gy = BOTTOM_Y - n * CELL
        const cx = gx + (n * CELL) / 2   // horizontal centre of group

        return (
          <g key={n}>
            {lCells(n).map(([r, c]) => (
              <rect
                key={`${r}-${c}`}
                x={gx + c * CELL}
                y={gy + r * CELL}
                width={CELL}
                height={CELL}
                fill={C_FILL}
                stroke={C_STROKE}
                strokeWidth={1.5}
              />
            ))}
            {lCells(n).map(([r, c]) => (
              <text
                key={`s-${r}-${c}`}
                x={gx + c * CELL + CELL / 2}
                y={gy + r * CELL + CELL / 2 + 5}
                textAnchor="middle"
                fontSize={14}
                fontWeight="bold"
                fill={C_STROKE}
              >
                *
              </text>
            ))}
            <text
              x={cx}
              y={BOTTOM_Y + 15}
              textAnchor="middle"
              fontSize={11}
              fill={C_LABEL}
            >
              {LABELS[i]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
