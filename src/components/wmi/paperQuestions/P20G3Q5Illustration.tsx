// Dots-over-trees figure for WMI-20P3A-Q5 (2020 Semifinal G3, Q5).
// Reconstructed from db/seed/wmi/figures/2020-semifinal-g3-a-q5.jpg: a top band
// of diagonal dotted strips sits above a bottom row of 8 fir trees in 8 cells.
// The question asks what fraction the dot count is of the tree count.
// Keyed answer: C = 1/8.
//
// The figure shows ONLY the picture (8 trees + the diagonal dot strips). The
// explainer does the counting and lands on the keyed option C.

export const TREE_COUNT = 8
export const STRIP_COUNT = 7
export const P20G3Q5_ANSWER = 'C'
export const P20G3Q5_FRACTION = '1/8'

const INK = '#1F2937'
const DOT = '#1F2937'
const TREE = '#1F2937'
const HOT = '#10B981'

export const Q5_VIEW_W = 480
export const Q5_VIEW_H = 170
const PAD = 6
const BAND_H = 78 // top dotted band height
const CELL_W = (Q5_VIEW_W - PAD * 2) / TREE_COUNT
const TREE_TOP = PAD + BAND_H

/** One fir tree centred at (x) inside a cell, drawn with basic triangles + trunk. */
function FirTree({ x, baseY, hot = false }: { x: number; baseY: number; hot?: boolean }) {
  const c = hot ? HOT : TREE
  const top = baseY - 56
  return (
    <g>
      {/* three stacked triangle tiers */}
      <polygon points={`${x},${top} ${x - 14},${top + 22} ${x + 14},${top + 22}`} fill={c} />
      <polygon points={`${x},${top + 12} ${x - 17},${top + 36} ${x + 17},${top + 36}`} fill={c} />
      <polygon points={`${x},${top + 24} ${x - 20},${top + 50} ${x + 20},${top + 50}`} fill={c} />
      {/* trunk */}
      <rect x={x - 4} y={top + 50} width={8} height={9} fill={c} />
    </g>
  )
}

/** A diagonal strip of dots: a big dot, a small, a big, a small (decreasing). */
function DotStrip({ x0, hot = false }: { x0: number; hot?: boolean }) {
  const c = hot ? HOT : DOT
  // positions relative to the strip top-left, going down-right.
  const dots: Array<[number, number, number]> = [
    [4, 6, 2.5],
    [10, 14, 6],
    [22, 24, 3],
    [30, 32, 2],
    [38, 42, 5.5],
    [48, 52, 3],
    [56, 62, 2],
  ]
  return (
    <g>
      {dots.map(([dx, dy, r], i) => (
        <circle key={i} cx={x0 + dx} cy={PAD + 8 + dy} r={r} fill={c} />
      ))}
    </g>
  )
}

export interface DotsTreesFigureProps {
  /** Highlight the dot strips (counting beat). */
  hotDots?: boolean
  /** Highlight the trees (counting beat). */
  hotTrees?: boolean
}

export function DotsTreesFigure({ hotDots = false, hotTrees = false }: DotsTreesFigureProps) {
  const stripGap = (Q5_VIEW_W - PAD * 2) / STRIP_COUNT
  return (
    <svg viewBox={`0 0 ${Q5_VIEW_W} ${Q5_VIEW_H}`} width="100%" style={{ maxWidth: Q5_VIEW_W, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {/* outer frame */}
      <rect x={PAD} y={PAD} width={Q5_VIEW_W - PAD * 2} height={Q5_VIEW_H - PAD * 2} fill="white" stroke={INK} strokeWidth={2} />
      {/* divider between dot band and tree row */}
      <line x1={PAD} y1={TREE_TOP} x2={Q5_VIEW_W - PAD} y2={TREE_TOP} stroke={INK} strokeWidth={2} />

      {/* dot strips */}
      {Array.from({ length: STRIP_COUNT }).map((_, i) => (
        <DotStrip key={i} x0={PAD + 8 + i * stripGap} hot={hotDots} />
      ))}

      {/* tree cells + trees */}
      {Array.from({ length: TREE_COUNT }).map((_, i) => {
        const x = PAD + i * CELL_W + CELL_W / 2
        return (
          <g key={i}>
            {i > 0 && <line x1={PAD + i * CELL_W} y1={TREE_TOP} x2={PAD + i * CELL_W} y2={Q5_VIEW_H - PAD} stroke={INK} strokeWidth={1.5} />}
            <FirTree x={x} baseY={Q5_VIEW_H - PAD - 8} hot={hotTrees} />
          </g>
        )
      })}
    </svg>
  )
}

export default function P20G3Q5Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`A band of diagonal dotted strips above a row of ${TREE_COUNT} fir trees. The question asks what fraction the dot count is of the tree count.`}
    >
      <DotsTreesFigure />
    </div>
  )
}
