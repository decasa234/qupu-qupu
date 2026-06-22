// AppleBags23PEIllustration.tsx
//
// Stem illustration for IKMC-23-PE-Q23:
//   "Maria has 19 apples in 3 bags. From each bag, she takes out the same
//    number. Now the bags have 3, 4 and 6 apples. How many did she take out?"
//
// The figure shows three paper bags side-by-side (brown / purple / blue), each
// holding their CURRENT (after-removal) apple count: 3, 4, 6.
// The total across bags (13) and the number taken (2) are NOT shown here —
// those are revealed only in the explainer.
//
// Reuses the Apple primitive from AppleAdd19P1Illustration (adapted inline so
// this file has zero extra runtime imports).
//
// SSR-safe: no Math.random, no Date, no window/document.

// ── Shared layout constants (re-exported for the explainer) ──────────────────

export const SVG_W = 420
export const SVG_H = 200

/** Apple counts in each bag after removal (what the figure shows). */
export const BAG_COUNTS_AFTER = [3, 4, 6] as const

/** Apple counts in each bag before removal (used by the explainer). */
export const BAG_COUNTS_BEFORE = [5, 6, 8] as const

/** Total apples before removal. */
export const TOTAL_BEFORE = 19

/** Remaining apples after removal. */
export const TOTAL_AFTER = 13

/** Total removed across all bags. */
export const TOTAL_REMOVED = 6

/** Apples removed from each bag. */
export const REMOVED_PER_BAG = 2

// Bag geometry
const BAG_W = 100
const BAG_H = 120
const BAG_GAP = 20
const BAG_Y = 52

// Three bags: brown, purple, blue — matching the real figure colours
export const BAG_COLORS = [
  { fill: '#F5E6D3', stroke: '#C47A3A' },   // brown
  { fill: '#F0E6F8', stroke: '#9B59B6' },   // purple
  { fill: '#E3F0FA', stroke: '#3498DB' },   // blue
] as const

// Total width: 3 bags + 2 gaps
const TOTAL_BAGS_W = 3 * BAG_W + 2 * BAG_GAP
const START_X = (SVG_W - TOTAL_BAGS_W) / 2

// Apple constants
const APPLE_RED = '#E63946'
const APPLE_DARK = '#B32430'
const LEAF_COLOR = '#4CA14E'
const STEM_COLOR = '#6B4226'
const APPLE_R = 10

// ── Apple primitive (adapted from AppleAdd19P1Illustration) ──────────────────

export function Apple({ cx, cy, r = APPLE_R, dim = false }: { cx: number; cy: number; r?: number; dim?: boolean }) {
  const opacity = dim ? 0.28 : 1
  return (
    <g opacity={opacity}>
      <circle cx={cx - r * 0.42} cy={cy} r={r} fill={APPLE_RED} />
      <circle cx={cx + r * 0.42} cy={cy} r={r} fill={APPLE_RED} />
      <ellipse cx={cx} cy={cy + r * 0.2} rx={r * 1.05} ry={r * 0.92} fill={APPLE_RED} />
      <ellipse cx={cx - r * 0.4} cy={cy - r * 0.4} rx={r * 0.22} ry={r * 0.3} fill="#FFFFFF" opacity={0.55} />
      <path
        d={`M ${cx - r} ${cy + r * 0.3} Q ${cx} ${cy + r * 1.25} ${cx + r} ${cy + r * 0.3}`}
        fill="none"
        stroke={APPLE_DARK}
        strokeWidth={1.2}
        opacity={0.45}
      />
      <rect x={cx - 1} y={cy - r * 1.25} width={2} height={r * 0.55} rx={1} fill={STEM_COLOR} />
      <ellipse
        cx={cx + r * 0.45}
        cy={cy - r * 1.05}
        rx={r * 0.4}
        ry={r * 0.2}
        fill={LEAF_COLOR}
        transform={`rotate(-28 ${cx + r * 0.45} ${cy - r * 1.05})`}
      />
    </g>
  )
}

// ── Bag primitive ─────────────────────────────────────────────────────────────

/**
 * A paper shopping bag — flat front-facing.
 * Drawn as a rounded rectangle body with a zigzag/ruffled top edge that
 * suggests a folded paper bag mouth (matches the real figure).
 */
export function Bag({
  x,
  y,
  w = BAG_W,
  h = BAG_H,
  fill,
  stroke,
}: {
  x: number
  y: number
  w?: number
  h?: number
  fill: string
  stroke: string
}) {
  // The mouth is a 10 px tall zigzag strip across the top of the bag
  const mouthH = 12
  const mouthY = y
  const bodyY = y + mouthH
  const bodyH = h - mouthH

  // Build a simple zigzag path for the mouth edge
  const zigCount = 8
  const segW = w / zigCount
  let mouthPath = `M ${x} ${mouthY + mouthH}`
  for (let i = 0; i <= zigCount; i++) {
    const px = x + i * segW
    const py = i % 2 === 0 ? mouthY + mouthH : mouthY
    mouthPath += ` L ${px} ${py}`
  }
  mouthPath += ` L ${x + w} ${mouthY + mouthH} Z`

  return (
    <g>
      {/* bag body */}
      <rect x={x} y={bodyY} width={w} height={bodyH} rx={6} fill={fill} stroke={stroke} strokeWidth={2.5} />
      {/* ruffled mouth strip */}
      <path d={mouthPath} fill={fill} stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
    </g>
  )
}

// ── Apple layout inside a bag ────────────────────────────────────────────────

/**
 * Returns SVG centres for `count` apples arranged in rows inside a bag at (bagX, bagY).
 * Max 3 per row so they fit inside BAG_W.
 */
export function appleCenters(bagX: number, count: number): Array<{ x: number; y: number }> {
  const cols = Math.min(3, count)
  const cellW = BAG_W / cols
  const cellH = 40
  const startY = BAG_Y + 20 + 16  // leave room for bag mouth

  const centers: Array<{ x: number; y: number }> = []
  for (let i = 0; i < count; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    centers.push({
      x: bagX + cellW * col + cellW / 2,
      y: startY + row * cellH,
    })
  }
  return centers
}

// ── Diagram component ────────────────────────────────────────────────────────

export interface BagDiagramProps {
  /** Apple count for each of the 3 bags. */
  counts?: [number, number, number]
  /** Whether to show a dim overlay on the apples being removed (explainer use). */
  dimCounts?: [number, number, number]
  /** Show a "taken out" badge above each bag (explainer use). */
  removedLabel?: string | null
  /** Highlight the total remaining (explainer caption, not part of the SVG). */
  showAnswer?: boolean
}

export function BagDiagram({
  counts = [...BAG_COUNTS_AFTER] as [number, number, number],
  dimCounts = [0, 0, 0],
  removedLabel = null,
  showAnswer = false,
}: BagDiagramProps) {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {BAG_COLORS.map((col, bi) => {
        const bx = START_X + bi * (BAG_W + BAG_GAP)
        const apples = appleCenters(bx, counts[bi])
        return (
          <g key={bi}>
            <Bag x={bx} y={BAG_Y} fill={col.fill} stroke={col.stroke} />
            {apples.map((c, ai) => (
              <Apple key={ai} cx={c.x} cy={c.y} r={APPLE_R} dim={ai < (dimCounts[bi] ?? 0)} />
            ))}

            {/* count badge at the bottom of the bag */}
            <text
              x={bx + BAG_W / 2}
              y={BAG_Y + BAG_H + 16}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={14}
              fontWeight={800}
              fill={showAnswer ? '#065F46' : col.stroke}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {counts[bi]}
            </text>

            {/* "−x" taken-out label above bag (explainer only) */}
            {removedLabel && (
              <text
                x={bx + BAG_W / 2}
                y={BAG_Y - 12}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={13}
                fontWeight={800}
                fill="#DC2626"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {removedLabel}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ── Default export (stem illustration) ───────────────────────────────────────

export default function AppleBags23PEIllustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Three paper bags (brown, purple, blue) each holding apples: bag 1 has 3 apples, bag 2 has 4 apples, bag 3 has 6 apples — after Maria took the same number from each."
    >
      <BagDiagram />
    </div>
  )
}
