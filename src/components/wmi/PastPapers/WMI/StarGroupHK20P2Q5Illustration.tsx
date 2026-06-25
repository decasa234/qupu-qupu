// HKIMO-20-P2H-Q5 — stem illustration.
//
// Shows groups 1–4 of * stars in staircase grids:
//   Group n → top (n-1) rows fill cols 0..(n-2); bottom row fills cols 0..(n-3).
//   Total per group = (n-1)² + (n-2) = n²−n−1 for n≥2; Group 1 = 0.
//   Sequence: 0, 1, 5, 11 → … → Group 9 = 71.
//
// Faithful to 2020 P2 images: 001.jpg (group 1 = empty 1×1 box),
// 002.jpg (group 2 = 2×2 grid, single star in top-left corner).
//
// Pure SVG, SSR-safe, no hooks, no framer-motion. Layout constants are
// exported so StarGroupHK20P2Q5Explainer can reuse them.
//
// Adapted from StarGroupHK20P1Q5Illustration (same competition, same
// "growing groups" structure — only the cell arrangement differs).

/** Cell size in px. */
export const CS = 28
/** Horizontal gap between groups. */
export const GAP = 24
/** Outer horizontal padding. */
export const PAD_H = 16
/** Outer vertical padding. */
export const PAD_V = 16
/** Height reserved below cells for group labels. */
const LABEL_H = 28
/** Number of groups displayed (groups 1–4). */
const N = 4

/**
 * Left x-coordinate of group g (0-indexed).
 * g=0 → Group 1, g=1 → Group 2, etc.
 */
export function groupX(g: number): number {
  let x = PAD_H
  for (let i = 0; i < g; i++) x += (i + 1) * CS + GAP
  return x
}

/** Total SVG width (accounts for 4 groups + gaps + padding). */
export const SVG_W: number = groupX(N) + PAD_H

/** Total SVG height (4 rows max + label + padding). */
export const SVG_H: number = PAD_V + N * CS + LABEL_H + PAD_V

/**
 * Returns pixel {x, y} for every STAR cell in group n (1-indexed, 1–4).
 * Group n occupies an n×n bounding box:
 *   - Rows 0..(n-2): cols 0..(n-2) all starred.
 *   - Row (n-1): cols 0..(n-3) starred (only if n ≥ 3).
 * Total = (n-1)² + max(n-2, 0) = n²−n−1 for n≥2; 0 for n=1.
 */
export function groupCells(n: number): { x: number; y: number }[] {
  const gx = groupX(n - 1)
  const cells: { x: number; y: number }[] = []
  if (n <= 1) return cells
  // Upper block: rows 0..(n-2), cols 0..(n-2)
  for (let r = 0; r < n - 1; r++) {
    for (let c = 0; c < n - 1; c++) {
      cells.push({ x: gx + c * CS, y: PAD_V + r * CS })
    }
  }
  // Bottom partial row: cols 0..(n-3) (empty for n=2)
  for (let c = 0; c < n - 2; c++) {
    cells.push({ x: gx + c * CS, y: PAD_V + (n - 1) * CS })
  }
  return cells
}

// ── Colour tokens ──────────────────────────────────────────────────────────────
const CELL_FILL   = '#F1F5F9'
const CELL_STROKE = '#94A3B8'
const EMPTY_FILL  = '#FFFFFF'
const SYMBOL_CLR  = '#1E3A5F'
const LABEL_CLR   = '#64748B'

interface Props {
  lang?: 'en' | 'id'
  /**
   * 0 → no highlight; -1 → all highlighted; 1–4 → highlight that group.
   * Used by the explainer to draw attention beat-by-beat.
   */
  activeGroup?: number
}

export default function StarGroupHK20P2Q5Illustration({
  lang = 'en',
  activeGroup = 0,
}: Props) {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      height={SVG_H}
      style={{ display: 'block', maxWidth: '100%' }}
      aria-label="HKIMO 2020 P2 Q5 — staircase star groups"
    >
      {([1, 2, 3, 4] as const).map((n) => {
        const gx     = groupX(n - 1)
        const lit    = activeGroup === -1 || activeGroup === n
        const fill   = lit ? '#DBEAFE' : CELL_FILL
        const stroke = lit ? '#3B82F6' : CELL_STROKE
        const ink    = lit ? '#1D4ED8' : SYMBOL_CLR

        // Build a quick lookup set for filled cells
        const starSet = new Set(
          groupCells(n).map(({ x, y }) => `${x},${y}`),
        )

        const labelX = gx + (n * CS) / 2
        const labelY = PAD_V + N * CS + LABEL_H / 2 + 4
        const label  =
          lang === 'id'
            ? `Kelompok ke-${n}`
            : `${['1st', '2nd', '3rd', '4th'][n - 1]} Group`

        return (
          <g key={n}>
            {/* Full n×n grid — filled cells show *, empty cells show outline only */}
            {Array.from({ length: n }, (_, r) => r).flatMap((r) =>
              Array.from({ length: n }, (_, c) => {
                const cx     = gx + c * CS
                const cy     = PAD_V + r * CS
                const hasStar = starSet.has(`${cx},${cy}`)
                return (
                  <g key={`${r}-${c}`}>
                    <rect
                      x={cx + 0.5}
                      y={cy + 0.5}
                      width={CS - 1}
                      height={CS - 1}
                      fill={hasStar ? fill : EMPTY_FILL}
                      stroke={hasStar ? stroke : CELL_STROKE}
                      strokeWidth={1.5}
                      rx={2}
                    />
                    {hasStar && (
                      <text
                        x={cx + CS / 2}
                        y={cy + CS / 2 + 1}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={14}
                        fontFamily="serif"
                        fill={ink}
                      >
                        *
                      </text>
                    )}
                  </g>
                )
              }),
            )}
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fontFamily="sans-serif"
              fill={LABEL_CLR}
            >
              {label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
