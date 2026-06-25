// HKIMO-20-P1H-Q5 — stem illustration.
//
// Shows groups 1–4 of * stars in growing L-shapes:
//   Group n → top row of n stars + left column of (n-1) stars below.
//   Total per group = 2n − 1 (odd numbers: 1, 3, 5, 7 …).
//
// Faithful to 2020.imgs/001.jpg (group 1) and 002.jpg (group 2): each group
// occupies an n×n grid bounding box with the top row and left column filled.
//
// Pure SVG, SSR-safe, no hooks, no framer-motion. Layout constants are
// exported so StarGroupHK20P1Q5Explainer can reuse them without re-deriving.
//
// Adapted from TriangleGroupsHK19P1Q5Illustration (same competition, same
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
 * Returns pixel {x, y} for every star cell in group n (1-indexed, 1–4).
 *  - Top row (row 0): columns 0 … n-1.
 *  - Left column below (rows 1 … n-1): column 0 only.
 * Total cells = n + (n-1) = 2n-1.
 */
export function groupCells(n: number): { x: number; y: number }[] {
  const gx = groupX(n - 1)
  const cells: { x: number; y: number }[] = []
  // Top row — all n columns
  for (let c = 0; c < n; c++) cells.push({ x: gx + c * CS, y: PAD_V })
  // Left column below top row
  for (let r = 1; r < n; r++) cells.push({ x: gx, y: PAD_V + r * CS })
  return cells
}

// ── Colour tokens ──────────────────────────────────────────────────────────────
const CELL_FILL   = '#F1F5F9'
const CELL_STROKE = '#94A3B8'
const SYMBOL_CLR  = '#1E3A5F'
const LABEL_CLR   = '#64748B'

interface Props {
  lang?: 'en' | 'id'
  /**
   * 1–4 → highlight that group; 0 → no highlight; -1 → all highlighted.
   * Used by the explainer to draw attention to specific groups beat-by-beat.
   */
  activeGroup?: number
}

export default function StarGroupHK20P1Q5Illustration({
  lang = 'en',
  activeGroup = 0,
}: Props) {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      height={SVG_H}
      style={{ display: 'block', maxWidth: '100%' }}
      aria-label="HKIMO 2020 P1 Q5 — L-shaped star groups"
    >
      {([1, 2, 3, 4] as const).map((n) => {
        const cells  = groupCells(n)
        const lit    = activeGroup === -1 || activeGroup === n
        const fill   = lit ? '#DBEAFE' : CELL_FILL
        const stroke = lit ? '#3B82F6' : CELL_STROKE
        const ink    = lit ? '#1D4ED8' : SYMBOL_CLR

        const labelX = groupX(n - 1) + (n * CS) / 2
        const labelY = PAD_V + N * CS + LABEL_H / 2 + 4
        const label  =
          lang === 'id'
            ? `Kelompok ke-${n}`
            : `${['1st', '2nd', '3rd', '4th'][n - 1]} Group`

        return (
          <g key={n}>
            {cells.map(({ x, y }, i) => (
              <g key={i}>
                <rect
                  x={x + 0.5}
                  y={y + 0.5}
                  width={CS - 1}
                  height={CS - 1}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={1.5}
                  rx={2}
                />
                <text
                  x={x + CS / 2}
                  y={y + CS / 2 + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={14}
                  fontFamily="serif"
                  fill={ink}
                >
                  *
                </text>
              </g>
            ))}
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
