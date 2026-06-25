// HKIMO-23-P1SF-Q2 — stem illustration.
//
// Shows groups 1–4 of * stars in growing cross/plus shapes:
//   Group n → center row of (2n−1) stars + center column of (2n−1) stars, sharing center.
//   Total per group = 4(n−1) + 1 = 4n − 3  (1, 5, 9, 13 …).
//
// Faithful to the Q2 figure in the 2023 HKIMO Primary 1 Semifinal paper:
// OCR tables confirm a staircase-style arrangement; the cross interpretation
// yields exactly 1, 5, 9, 13 for groups 1–4.
//
// Pure SVG, SSR-safe, no hooks, no framer-motion. Layout constants are
// exported so StarGroupsHK23P1SFQ2Explainer can reuse them without re-deriving.
//
// Adapted from StarGroupHK20P1Q5Illustration (same "growing star groups"
// structure — only the cell arrangement differs: cross vs L-shape).

/** Cell size in SVG px. */
export const CS = 18
/** Horizontal gap between groups. */
export const GAP = 20
/** Outer horizontal padding. */
export const PAD_H = 14
/** Outer vertical padding. */
export const PAD_V = 14
/** Height reserved below cells for group labels. */
const LABEL_H = 24
/** Number of groups displayed (groups 1–4). */
const N = 4

/**
 * Left x-coordinate of group g (0-indexed).
 * Width of group g = (2*(g+1)−1)*CS = (2g+1)*CS.
 */
export function groupX(g: number): number {
  let x = PAD_H
  for (let i = 0; i < g; i++) x += (2 * (i + 1) - 1) * CS + GAP
  return x
}

/** Total SVG width. */
export const SVG_W: number = groupX(N - 1) + (2 * N - 1) * CS + PAD_H

/** Total SVG height. */
export const SVG_H: number = PAD_V + (2 * N - 1) * CS + LABEL_H + PAD_V

/**
 * Returns pixel {x, y} for every star cell in group n (1-indexed, 1–4).
 * Cross pattern: cells where row === center OR col === center in a (2n−1)×(2n−1) grid.
 * Each group is vertically centred within the tallest group's height (group 4, 7 rows).
 */
export function groupCells(n: number): { x: number; y: number }[] {
  const gx = groupX(n - 1)
  const size = 2 * n - 1
  const center = n - 1
  const gridH = size * CS
  // Vertically centre within the 7-row (group 4) height
  const gy = PAD_V + ((2 * N - 1) * CS - gridH) / 2

  const cells: { x: number; y: number }[] = []
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (r === center || c === center) {
        cells.push({ x: gx + c * CS, y: gy + r * CS })
      }
    }
  }
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
   * Passed by the explainer to draw attention beat-by-beat.
   */
  activeGroup?: number
}

export default function StarGroupsHK23P1SFQ2Illustration({
  lang = 'en',
  activeGroup = 0,
}: Props) {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      height={SVG_H}
      style={{ display: 'block', maxWidth: '100%' }}
      aria-label="HKIMO 2023 P1 SF Q2 — cross-shaped star groups 1 to 4"
    >
      {([1, 2, 3, 4] as const).map((n) => {
        const cells  = groupCells(n)
        const lit    = activeGroup === -1 || activeGroup === n
        const fill   = lit ? '#DBEAFE' : CELL_FILL
        const stroke = lit ? '#3B82F6' : CELL_STROKE
        const ink    = lit ? '#1D4ED8' : SYMBOL_CLR

        const size   = 2 * n - 1
        const labelX = groupX(n - 1) + (size * CS) / 2
        const labelY = PAD_V + (2 * N - 1) * CS + LABEL_H / 2 + 4
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
                  fontSize={11}
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
              fontSize={10}
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
