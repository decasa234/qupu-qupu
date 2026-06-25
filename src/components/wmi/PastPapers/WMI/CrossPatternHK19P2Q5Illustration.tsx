// CrossPatternHK19P2Q5Illustration.tsx — HKIMO-19-P2H-Q5
//
// Stem figure: four growing plus/cross shapes (groups 1–4), each cell holds ⊗.
// Faithful to 2019.imgs/002.jpg.
//   Group 1: 1 cell (arm=0)
//   Group 2: 5 cells (arm=1, 3×3 bounding box)
//   Group 3: 9 cells (arm=2, 5×5 bounding box)
//   Group 4: 13 cells (arm=3, 7×7 bounding box)
// Formula: group n = 4n − 3. Group 12 = 45.
// No existing primitive covers arbitrary-arm cross shapes → custom SVG.
// SSR-safe (no hooks, no framer-motion).
// Co-exports: CrossShape, crossCells, groupX, groupDim, CENTER_Y, LABEL_Y, SVG_W, SVG_H.

const INK    = '#1F2937'
const FILL   = '#EFF6FF'   // light blue cell background
const STROKE = '#374151'

export const CELL = 24  // px per grid cell
const GAP         = 16  // px gap between group panels
const LEFT_PAD    = 10
const TOP_PAD     = 10

/** Bounding-box side length for group n (= (2n-1) cells). */
export function groupDim(n: number): number {
  return (2 * n - 1) * CELL
}

/** X offset (left edge) of group n's bounding box in the SVG. */
export function groupX(n: number): number {
  let x = LEFT_PAD
  for (let i = 1; i < n; i++) x += groupDim(i) + GAP
  return x
}

const MAX_N           = 4
const MAX_DIM         = groupDim(MAX_N)                    // 168 px (7 cells)
export const CENTER_Y = TOP_PAD + MAX_DIM / 2             // 94 — vertical centre of all panels
export const LABEL_Y  = TOP_PAD + MAX_DIM + 8             // 186 — y-baseline for group labels
export const SVG_W    = groupX(MAX_N) + groupDim(MAX_N) + LEFT_PAD   // 452
export const SVG_H    = LABEL_Y + 18 + 8                  // 212

/**
 * Returns [row, col] pairs (0-based, within (2n-1)×(2n-1) grid) for every
 * ⊗-cell in the group-n cross shape.
 * Horizontal row (row = arm) + vertical column (col = arm), de-duplicated.
 */
export function crossCells(n: number): [number, number][] {
  const arm = n - 1
  const cells: [number, number][] = []
  // Horizontal row
  for (let col = 0; col <= 2 * arm; col++) cells.push([arm, col])
  // Vertical column — skip centre cell (already in horizontal row)
  for (let row = 0; row < 2 * arm + 1; row++) {
    if (row !== arm) cells.push([row, arm])
  }
  return cells
}

export interface CrossShapeProps {
  /** Group number (1-indexed). */
  n: number
  /** Absolute SVG x of the bounding box's top-left corner. */
  xOff: number
  /** Absolute SVG y of the bounding box's top-left corner. */
  yOff: number
  fill?: string
}

/** Renders one cross/plus group as a <g> (no wrapping <svg>). */
export function CrossShape({ n, xOff, yOff, fill = FILL }: CrossShapeProps) {
  return (
    <g>
      {crossCells(n).map(([row, col]) => {
        const cx = xOff + col * CELL
        const cy = yOff + row * CELL
        return (
          <g key={`${row}-${col}`}>
            <rect
              x={cx}
              y={cy}
              width={CELL}
              height={CELL}
              fill={fill}
              stroke={STROKE}
              strokeWidth={1.2}
            />
            <text
              x={cx + CELL / 2}
              y={cy + CELL / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={CELL * 0.52}
              fill={INK}
              fontFamily="Georgia, serif"
            >
              ⊗
            </text>
          </g>
        )
      })}
    </g>
  )
}

const LABELS_EN = ['1st Group', '2nd Group', '3rd Group', '4th Group']
const LABELS_ID = ['Kelompok 1', 'Kelompok 2', 'Kelompok 3', 'Kelompok 4']

export default function CrossPatternHK19P2Q5Illustration({ lang = 'en' }: { lang?: string }) {
  const labels = lang === 'id' ? LABELS_ID : LABELS_EN
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
      role="img"
      aria-label={
        lang === 'id'
          ? 'Pola silang: kelompok 1 punya 1 simbol ⊗, kelompok 2 punya 5, kelompok 3 punya 9, kelompok 4 punya 13.'
          : 'Cross pattern: group 1 has 1 ⊗, group 2 has 5, group 3 has 9, group 4 has 13.'
      }
    >
      {[1, 2, 3, 4].map((n) => {
        const dim = groupDim(n)
        const xOff = groupX(n)
        const yOff = CENTER_Y - dim / 2
        return (
          <g key={n}>
            <CrossShape n={n} xOff={xOff} yOff={yOff} />
            <text
              x={xOff + dim / 2}
              y={LABEL_Y + 12}
              textAnchor="middle"
              fontSize={11}
              fill={INK}
              fontFamily="system-ui, sans-serif"
            >
              {labels[n - 1]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
