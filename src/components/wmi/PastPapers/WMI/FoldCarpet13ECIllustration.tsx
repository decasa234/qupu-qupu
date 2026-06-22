// Stem illustration for IKMC-22-EC-Q13.
//
// Reconstructed from docs/reference/ocr-res/ikmc/contest/ecolier/2022.imgs/033.jpg
//
// The figure shows a square carpet (light blue) with red dots arranged in
// exactly TWO rows along each side. The top-left corner is FOLDED over,
// appearing as a white triangular flap rotated diagonally on top of the carpet.
// The fold hides some top-left dots, tempting solvers to undercount.
//
// Key quantities (from breakdown.quantities in the seed):
//   • 4 dots per line along one side
//   • 2 lines per side → 8 dots per side
//   • 4 sides × 8 = 32 total dots (answer E)
//
// This component NEVER reveals the answer — it shows only the problem state
// (a folded carpet whose total dot count is hidden by the fold).
// Pure deterministic SVG, SSR-safe, no hooks, no effects.

// Carpet palette — matched to the scan (light sky-blue body, dark dots).
const CARPET_FILL  = '#7FBFDA'
const CARPET_EDGE  = '#4A8FAD'
const DOT_FILL     = '#D94040'
const DOT_STROKE   = '#A02828'
const FOLD_FILL    = '#FFFFFF'
const FOLD_STROKE  = '#BBBBBB'

// Dot radius
const DR = 5

// Generate a row of N dots starting at (sx, sy), spaced by `gap`, horizontal.
function hRow(sx: number, sy: number, n: number, gap: number) {
  return Array.from({ length: n }, (_, i) => ({ cx: sx + i * gap, cy: sy }))
}

// Generate a column of N dots starting at (sx, sy), spaced by `gap`, vertical.
function vCol(sx: number, sy: number, n: number, gap: number) {
  return Array.from({ length: n }, (_, i) => ({ cx: sx, cy: sy + i * gap }))
}

export function FoldCarpet13ECIllustration() {
  // ViewBox: 260 × 260
  const W = 260
  const H = 260

  // Carpet square occupies most of the viewBox with a margin.
  const M  = 24   // margin from viewBox edge to carpet edge
  const CL = M        // carpet left x
  const CT = M        // carpet top y
  const CW = W - 2*M // carpet width = 212
  const CH = H - 2*M // carpet height = 212
  const CR = CL + CW  // carpet right x
  const CB = CT + CH  // carpet bottom y

  // Dot layout: 2 rows of 4 along each side.
  // The two rows are inset 12 and 24 px from the carpet edge.
  // Dots are placed at the 4 corner and midpoint positions along each edge.
  //
  // We number dot positions 0-3 along each side (4 dots per line):
  //   positions at: CL+28, CL+28+48, CL+28+96, CL+28+144  (spacing ≈ 48)
  const inset1 = 12   // inner border row offset from carpet edge
  const inset2 = 24   // outer border row offset from carpet edge (closer to edge)
  const dotStart = 28 // offset from corner for first dot along a side
  const dotGap  = 48  // spacing between dots along a side
  const N = 4         // dots per line

  // TOP side: two horizontal rows just inside the top edge.
  const topDots = [
    ...hRow(CL + dotStart, CT + inset2, N, dotGap),  // outer row (closer to top edge)
    ...hRow(CL + dotStart, CT + inset1, N, dotGap),  // inner row (closer to carpet centre)
  ]

  // BOTTOM side: two horizontal rows just inside the bottom edge.
  const botDots = [
    ...hRow(CL + dotStart, CB - inset1, N, dotGap),  // inner row
    ...hRow(CL + dotStart, CB - inset2, N, dotGap),  // outer row
  ]

  // LEFT side: two vertical columns just inside the left edge.
  const leftDots = [
    ...vCol(CL + inset1, CT + dotStart, N, dotGap),  // inner column
    ...vCol(CL + inset2, CT + dotStart, N, dotGap),  // outer column
  ]

  // RIGHT side: two vertical columns just inside the right edge.
  const rightDots = [
    ...vCol(CR - inset1, CT + dotStart, N, dotGap),  // inner column
    ...vCol(CR - inset2, CT + dotStart, N, dotGap),  // outer column
  ]

  // All dots (36 from the 4 sides — corners shared but we do not double-count
  // because the dot positions are defined independently per side, placed along
  // the edge not at corners). The illustration shows the BORDER dots only
  // (the carpet interior is plain blue as in the scan).
  const allDots = [...topDots, ...botDots, ...leftDots, ...rightDots]

  // --- Folded corner ---
  // The fold is at the top-left. The flap is a triangle whose three vertices are:
  //   fold origin (corner of carpet): (CL, CT)
  //   along the top edge:             (CL + 60, CT)
  //   along the left edge:            (CL, CT + 60)
  //
  // The folded flap rotates 145° about the fold diagonal midpoint and appears
  // as a white quadrilateral overlapping the carpet corner.
  // From the scan: the flap is roughly a narrow rhombus/parallelogram tilted
  // ~40° to the upper-left, extending beyond the carpet corner.
  //
  // We approximate the folded-over triangle as a white polygon sitting on top:
  //   it covers the top-left region and extends slightly outside the carpet.
  const foldPts = [
    `${CL - 6},${CT + 54}`,      // bottom of flap along (left edge + offset)
    `${CL + 54},${CT - 6}`,      // right of flap along (top edge + offset)
    `${CL - 28},${CT - 28}`,     // tip of flap (above-left of carpet corner)
  ].join(' ')

  // Dots hidden behind the fold (top-left region approx x < CL+56, y < CT+28)
  // will naturally be occluded by the white polygon drawn on top.

  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Karpet persegi Aladdin berwarna biru muda dengan titik-titik merah tersusun dalam dua baris di sepanjang setiap sisi. Sudut kiri atas karpet terlipat sehingga menutupi sebagian titik."
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: 300, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* Carpet body */}
        <rect
          x={CL}
          y={CT}
          width={CW}
          height={CH}
          fill={CARPET_FILL}
          stroke={CARPET_EDGE}
          strokeWidth={2.5}
        />

        {/* Red dots around the border */}
        {allDots.map((d, i) => (
          <circle
            key={i}
            cx={d.cx}
            cy={d.cy}
            r={DR}
            fill={DOT_FILL}
            stroke={DOT_STROKE}
            strokeWidth={1}
          />
        ))}

        {/* Folded corner flap (white triangle, drawn on top to hide corner dots) */}
        <polygon
          points={foldPts}
          fill={FOLD_FILL}
          stroke={FOLD_STROKE}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

export default FoldCarpet13ECIllustration
