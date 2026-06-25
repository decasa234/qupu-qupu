// HKIMO-18-P1H-Q5 — "According to the pattern shown below, how many ⊕ are there in the 10th group?"
//
// STATIC PROBLEM FIGURE — four staircase groups of unit squares with ⊕ symbols inside.
// Group n has n rows; row r from the top has (r+1) cells right-aligned at cols (n-1-r)..(n-1).
// Total cells in group n = 1+2+…+n = n(n+1)/2 (triangular numbers).
// Shows groups 1–4 side by side with ordinal labels. Does NOT reveal the 10th-group answer (55).
//
// No primitive matches this multi-group side-by-side display. Fresh SVG.
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── Layout constants (re-exported so the explainer can share the same geometry) ──

/** Pixels per grid cell. */
export const CELL = 28
/** Horizontal gap between groups. */
export const GAP = 32
/** Left/right padding. */
export const PAD_X = 24
/** Top padding. */
export const PAD_TOP = 16
/** Bottom padding (includes space for ordinal labels). */
export const PAD_BOT = 40
/** Number of groups shown. */
export const N_GROUPS = 4

// Total content: 4 group widths + 3 gaps
// = (1+2+3+4)*CELL + 3*GAP = 10*28 + 3*32 = 280 + 96 = 376
export const SVG_W = PAD_X + (1 + 2 + 3 + 4) * CELL + 3 * GAP + PAD_X  // 424
export const SVG_H = PAD_TOP + N_GROUPS * CELL + PAD_BOT                  // 168

/** Bottom edge Y of all cells (groups are bottom-aligned at this line). */
export const BASELINE_Y = PAD_TOP + N_GROUPS * CELL  // 128

/** Colour tokens. */
export const COLOR = {
  CELL_FILL:        '#FFFBF0',  // warm cream
  CELL_STROKE:      '#5C4B2A',  // warm dark brown
  GLYPH:            '#1A3A6B',  // dark indigo for ⊕
  LABEL:            '#5C4B2A',
  HIGHLIGHT_FILL:   '#DBEEFF',
  HIGHLIGHT_STROKE: '#2C7BE5',
} as const

/** Returns the left-edge X of group g (0-indexed: g=0 is group 1). */
export function groupStartX(g: number): number {
  let x = PAD_X
  for (let i = 0; i < g; i++) {
    x += (i + 1) * CELL + GAP
  }
  return x
}

/** Returns the horizontal center X of group g (0-indexed). */
export function groupCenterX(g: number): number {
  return groupStartX(g) + ((g + 1) * CELL) / 2
}

// ── CellGroup primitive (re-exported for the explainer) ──────────────────────

export interface CellGroupProps {
  /** 1-indexed group number. */
  n: number
  /** Fill colour override. */
  fill?: string
  /** Stroke colour override. */
  stroke?: string
}

/**
 * CellGroup — renders one staircase group (group n) as an SVG <g>.
 *
 * Local coordinate origin: top-left of the group's bounding box.
 * Group n has n rows; row r (0=top) has (r+1) cells, right-aligned at cols (n-1-r)..(n-1).
 * Total width = n*CELL, total height = n*CELL.
 *
 * Wrap with: <g transform={`translate(${groupStartX(g)}, ${BASELINE_Y - n*CELL})`}>
 */
export function CellGroup({ n, fill = COLOR.CELL_FILL, stroke = COLOR.CELL_STROKE }: CellGroupProps) {
  const cells: Array<{ x: number; y: number }> = []

  for (let r = 0; r < n; r++) {
    // Row r from top: (r+1) cells at columns (n-1-r)..(n-1)
    for (let dc = 0; dc <= r; dc++) {
      const c = n - 1 - r + dc
      cells.push({ x: c * CELL, y: r * CELL })
    }
  }

  return (
    <g>
      {cells.map(({ x, y }, i) => (
        <g key={i}>
          <rect
            x={x}
            y={y}
            width={CELL}
            height={CELL}
            fill={fill}
            stroke={stroke}
            strokeWidth={1.5}
          />
          <text
            x={x + CELL / 2}
            y={y + CELL / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={13}
            fill={COLOR.GLYPH}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            ⊕
          </text>
        </g>
      ))}
    </g>
  )
}

// ── Default export ────────────────────────────────────────────────────────────

const ORDINALS = ['1st Group', '2nd Group', '3rd Group', '4th Group'] as const

/**
 * TriStepsHK18P1Q5Illustration
 *
 * Static problem figure for HKIMO-18-P1H-Q5.
 * Four staircase groups of unit squares (⊕ inside each cell), bottom-aligned and
 * labelled "1st Group" … "4th Group". The 10th-group answer (55) is not shown.
 */
export default function TriStepsHK18P1Q5Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Empat kelompok kotak bersimbol ⊕ dalam pola bertangga. ' +
        'Kelompok 1: 1 simbol. Kelompok 2: 3 simbol. Kelompok 3: 6 simbol. Kelompok 4: 10 simbol. ' +
        'Ada berapa simbol ⊕ pada kelompok ke-10?'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ maxWidth: SVG_W, display: 'block' }}
        aria-hidden="true"
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {Array.from({ length: N_GROUPS }, (_, g) => {
          const n = g + 1
          const ox = groupStartX(g)
          const oy = BASELINE_Y - n * CELL

          return (
            <g key={g} transform={`translate(${ox}, ${oy})`}>
              <CellGroup n={n} />
            </g>
          )
        })}

        {/* Ordinal labels below each group */}
        {Array.from({ length: N_GROUPS }, (_, g) => (
          <text
            key={g}
            x={groupCenterX(g)}
            y={BASELINE_Y + 22}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fontWeight={600}
            fill={COLOR.LABEL}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {ORDINALS[g]}
          </text>
        ))}
      </svg>
    </div>
  )
}
