// HKIMO-19-P1H-Q5 — stem illustration.
//
// Shows groups 1–4 of ⊕ symbols arranged in right-aligned staircases:
//   Group n → n rows, row k (top=1) has k cells aligned to the right.
//   Total per group = T(n) = n(n+1)/2.
//
// The STEM figure never reveals the answer (group 10); it only shows groups 1–4
// as labelled examples of the growing pattern.
//
// Pure SVG, SSR-safe, no hooks, no framer-motion.  All layout constants are
// exported so TriangleGroupsHK19P1Q5Explainer can reuse them.

/** Cell size in px. */
export const CS = 32
/** Horizontal gap between groups in px. */
export const GAP = 28
/** Outer horizontal padding in px. */
export const PAD_H = 18
/** Outer vertical padding in px. */
export const PAD_V = 16
/** Height reserved below cells for group labels. */
const LABEL_H = 28
/** Number of groups displayed. */
const N = 4

/**
 * Left x of group g (0-indexed, g=0 → group 1).
 * Width of group g = (g+1)*CS.
 */
export function groupX(g: number): number {
  let x = PAD_H
  for (let i = 0; i < g; i++) {
    x += (i + 1) * CS + GAP
  }
  return x
}

/** Total SVG width. */
export const SVG_W: number = groupX(N) + PAD_H  // right edge of group 4 + right pad

/** Total SVG height. */
export const SVG_H: number = PAD_V + N * CS + LABEL_H + PAD_V

/**
 * Returns pixel {x, y} for every cell in group n (1-indexed, 1–4).
 * Row r (1-indexed): r cells right-aligned, starting at col (n-r) to (n-1).
 */
export function groupCells(n: number): { x: number; y: number }[] {
  const gx = groupX(n - 1)
  const cells: { x: number; y: number }[] = []
  for (let r = 1; r <= n; r++) {
    // row r has r cells; right-aligned within n columns
    for (let c = n - r; c < n; c++) {
      cells.push({ x: gx + c * CS, y: PAD_V + (r - 1) * CS })
    }
  }
  return cells
}

// ── Colour tokens ──────────────────────────────────────────────────────────────
const CELL_FILL    = '#F1F5F9'
const CELL_STROKE  = '#94A3B8'
const SYMBOL_COLOR = '#1E3A5F'
const LABEL_COLOR  = '#64748B'

interface Props {
  lang?: 'en' | 'id'
  /** 1–4 to highlight that group's cells; 0 = no highlight; -1 = all highlighted. */
  activeGroup?: number
}

export default function TriangleGroupsHK19P1Q5Illustration({ lang = 'en', activeGroup = 0 }: Props) {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      height={SVG_H}
      style={{ display: 'block', maxWidth: '100%' }}
      aria-label="HKIMO 2019 P1 Q5 — triangular groups of ⊕"
    >
      {([1, 2, 3, 4] as const).map((n) => {
        const cells = groupCells(n)
        const lit = activeGroup === -1 || activeGroup === n
        const fill   = lit ? '#DBEAFE' : CELL_FILL
        const stroke = lit ? '#3B82F6' : CELL_STROKE
        const ink    = lit ? '#1D4ED8' : SYMBOL_COLOR

        // Label: centre of this group's column cluster
        const labelX = groupX(n - 1) + (n * CS) / 2
        const labelY = PAD_V + N * CS + LABEL_H / 2 + 4

        const label = lang === 'id'
          ? `Kelompok ke-${n}`
          : `${['1st','2nd','3rd','4th'][n - 1]} Group`

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
                  ⊕
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
              fill={LABEL_COLOR}
            >
              {label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
