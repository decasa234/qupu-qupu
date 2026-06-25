// SEAMO-20-A-Q23 — "Dots are used to form a series of patterns as shown below.
// Find the number of dots in Figure 8."
//
// The figures show n×n dot grids: Fig 1 = 1 dot, Fig 2 = 4 dots, Fig 3 = 9 dots.
// The pattern is square numbers: Figure n has n² dots.
// Figure 8 = 8² = 64 dots.
//
// This illustration shows Figures 1, 2, and 3 side by side with labels,
// followed by "..." indicating continuation.
//
// Pure SVG, SSR-safe, no hooks, no framer-motion.

const INK = '#1F2937'
const DOT_R = 5      // dot radius in px
const GAP = 8        // gap between dots in the same grid (center-to-center extra)
const SPACING = 48   // horizontal space between figures
const LABEL_H = 20   // height reserved for "Figure n" label below each grid
const PAD = 20       // outer padding

/** Renders an n×n square dot grid centred at (cx, cy). */
function DotGrid({ n, cx, cy }: { n: number; cx: number; cy: number }) {
  const step = DOT_R * 2 + GAP
  const halfW = ((n - 1) * step) / 2
  const halfH = ((n - 1) * step) / 2

  return (
    <>
      {Array.from({ length: n }, (_, row) =>
        Array.from({ length: n }, (_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={cx - halfW + col * step}
            cy={cy - halfH + row * step}
            r={DOT_R}
            fill={INK}
          />
        ))
      )}
    </>
  )
}

/** Compute pixel height needed for an n×n dot grid. */
function gridHeight(n: number): number {
  return (n - 1) * (DOT_R * 2 + GAP) + DOT_R * 2
}

/** Compute pixel width needed for an n×n dot grid. */
function gridWidth(n: number): number {
  return (n - 1) * (DOT_R * 2 + GAP) + DOT_R * 2
}

const FIGURES = [1, 2, 3]

export default function DotSquares20A23Illustration() {
  // Layout: three figures side by side, then "…" dots.
  // Compute the max grid height across all shown figures.
  const maxGridH = Math.max(...FIGURES.map((n) => gridHeight(n)))

  // X positions: each figure is placed so grids are centred under their labels.
  const figWidths = FIGURES.map((n) => Math.max(gridWidth(n), 60)) // min 60 for label
  const totalFigsW = figWidths.reduce((s, w) => s + w, 0) + SPACING * (FIGURES.length - 1)
  const ellipsisW = 30
  const totalW = PAD * 2 + totalFigsW + SPACING + ellipsisW
  const totalH = PAD + maxGridH + LABEL_H + PAD

  // Figure centre X positions
  const figCxs: number[] = []
  let x = PAD
  for (let i = 0; i < FIGURES.length; i++) {
    figCxs.push(x + figWidths[i] / 2)
    x += figWidths[i] + SPACING
  }
  const ellipsisCx = x + ellipsisW / 2

  // Grid centre Y (vertically centred in the available space)
  const gridCy = PAD + maxGridH / 2
  // Label Y
  const labelY = PAD + maxGridH + LABEL_H / 2 + 6

  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Three dot patterns: Figure 1 has 1 dot (1×1), Figure 2 has 4 dots (2×2), ' +
        'Figure 3 has 9 dots (3×3). The pattern is n squared dots in Figure n, ' +
        'so Figure 8 has 64 dots.'
      }
    >
      <svg
        viewBox={`0 0 ${totalW} ${totalH}`}
        width="100%"
        style={{ maxWidth: Math.min(totalW, 380), display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {FIGURES.map((n, i) => (
          <g key={n}>
            {/* n×n dot grid */}
            <DotGrid n={n} cx={figCxs[i]} cy={gridCy} />
            {/* "Figure n" label */}
            <text
              x={figCxs[i]}
              y={labelY}
              textAnchor="middle"
              fontSize={11}
              fill={INK}
              fontFamily="sans-serif"
            >
              {`Figure ${n}`}
            </text>
          </g>
        ))}

        {/* Ellipsis to indicate continuation */}
        <text
          x={ellipsisCx}
          y={gridCy + 4}
          textAnchor="middle"
          fontSize={20}
          fill={INK}
          fontFamily="sans-serif"
          fontWeight="bold"
        >
          …
        </text>
      </svg>
    </div>
  )
}
