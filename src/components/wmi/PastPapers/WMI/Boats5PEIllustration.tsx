// IKMC-23-PE-Q5 — "Which boat is mine?"
//
// The A–E answer choices ARE the figure — five sailboats decorated with
// geometric shapes on the sail and portholes on the hull.  There is no
// separate stem illustration; this file exports ONLY the choice renderer.
//
// Shape counts read directly from the source paper (2023.imgs/021-023.jpg):
//
//   Boat | sail colour | circles | triangles | squares | circles>1 | Δ−□=2
//   ─────┼─────────────┼─────────┼───────────┼─────────┼───────────┼──────
//    A   |  red        |    2    |     1     |    1    |   yes     |   no  (0)
//    B   |  yellow     |    3    |     3     |    2    |   yes     |   no  (1)
//    C   |  purple     |    1    |     4     |    2    |   no      |  yes
//    D   |  blue       |    2    |     1     |    3    |   yes     |   no  (−2)
//    E   |  green      |    3    |     4     |    2    |   yes     |  yes  ← ANSWER
//
// Conditions:
//   1) circles > 1
//   2) triangles − squares = 2
//
// Only boat E satisfies BOTH conditions → answer E.
//
// Pure SVG, no raster, no random, no Date, SSR-safe.

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------

const HULL_WOOD  = '#C17F3C'  // wooden-brown hull planks
const HULL_DARK  = '#8B5E28'  // hull lower trim / stroke
const HULL_STRIPE = '#A0682A' // hull plank stripe
const MAST_CLR   = '#5C3A12'  // mast / boom
const FLAG_YELLOW = '#F5C518' // flag (all boats share a yellow pennant)
const CIRCLE_FILL = '#F472B6' // pink porthole (matches source)
const CIRCLE_STROKE = '#BE185D'
const TRI_FILL   = '#16A34A'  // green triangle on sail
const TRI_STROKE = '#14532D'
const SQ_FILL    = '#F5C518'  // yellow square on sail
const SQ_STROKE  = '#CA8A04'
const WAVE_CLR   = '#60A5FA'  // blue wave under hull
const INK        = '#1F2937'

// Sail colours per option
const SAIL_COLORS: Record<string, { fill: string; stroke: string }> = {
  A: { fill: '#EF4444', stroke: '#B91C1C' },   // red
  B: { fill: '#FACC15', stroke: '#CA8A04' },   // yellow
  C: { fill: '#7C3AED', stroke: '#4C1D95' },   // purple
  D: { fill: '#3B82F6', stroke: '#1D4ED8' },   // blue
  E: { fill: '#22C55E', stroke: '#166534' },   // green
}

// Shape counts per option — single source of truth, anti-drift
interface BoatData {
  circles: number
  triangles: number
  squares: number
}
const BOAT_DATA: Record<string, BoatData> = {
  A: { circles: 2, triangles: 1, squares: 1 },
  B: { circles: 3, triangles: 3, squares: 2 },
  C: { circles: 1, triangles: 4, squares: 2 },
  D: { circles: 2, triangles: 1, squares: 3 },
  E: { circles: 3, triangles: 4, squares: 2 },
}

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

/** A small equilateral-ish triangle centred at (cx, cy) with half-width w. */
function SmallTriangle({ cx, cy, w }: { cx: number; cy: number; w: number }) {
  const h = w * 1.0
  const pts = `${cx},${cy - h * 0.62} ${cx - w},${cy + h * 0.38} ${cx + w},${cy + h * 0.38}`
  return (
    <polygon
      points={pts}
      fill={TRI_FILL}
      stroke={TRI_STROKE}
      strokeWidth={0.8}
      strokeLinejoin="round"
    />
  )
}

/** A small square centred at (cx, cy) with half-side s. */
function SmallSquare({ cx, cy, s }: { cx: number; cy: number; s: number }) {
  return (
    <rect
      x={cx - s}
      y={cy - s}
      width={s * 2}
      height={s * 2}
      fill={SQ_FILL}
      stroke={SQ_STROKE}
      strokeWidth={0.8}
    />
  )
}

// ---------------------------------------------------------------------------
// Shape-layout helpers
// ---------------------------------------------------------------------------

/**
 * Lay out `count` shapes (triangles or squares) inside a region, returning
 * [cx, cy] pairs using a simple fixed grid pattern (2 per row from the top).
 */
function shapeSlots(count: number, areaX: number, areaY: number, areaW: number, areaH: number): Array<[number, number]> {
  const slots: Array<[number, number]> = []
  const cols = count <= 2 ? count : 2
  const rows = Math.ceil(count / cols)
  const cellW = areaW / cols
  const cellH = areaH / rows
  for (let i = 0; i < count; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    slots.push([
      areaX + cellW * col + cellW * 0.5,
      areaY + cellH * row + cellH * 0.5,
    ])
  }
  return slots
}

/**
 * Place `n` circles horizontally along the hull.
 * Hull porthole area: centred around hy, spread from hx.
 */
function hullCircleSlots(n: number, hullCx: number, hullCy: number, hullW: number): Array<[number, number]> {
  const step = Math.min(hullW * 0.28, 14)
  const start = hullCx - step * (n - 1) / 2
  return Array.from({ length: n }, (_, i) => [start + step * i, hullCy] as [number, number])
}

// ---------------------------------------------------------------------------
// The boat — drawn in a 100×100 viewBox
// ---------------------------------------------------------------------------

/**
 * One sailboat option, drawn faithfully to the source paper.
 *
 * Layout (100×100 viewBox):
 *   - mast at x=40, from y=14 to y=62
 *   - sail: triangle from (40,14) to (86,55) to (40,62) [right-facing sail]
 *   - hull: rounded rect roughly y=62..80, full width (15..85)
 *   - portholes on hull centred at y=72
 *   - flag: small pennant at top of mast
 *   - waves: wavy line at y≈82
 *   - triangles + squares scattered across the sail face
 */
function BoatSVG({ label }: { label: string }) {
  const sail = SAIL_COLORS[label] ?? SAIL_COLORS.A
  const data = BOAT_DATA[label] ?? BOAT_DATA.A

  // Mast
  const MAST_X = 38
  const MAST_TOP = 14
  const MAST_BOT = 63

  // Sail polygon (the broad right-facing triangle)
  // Left edge along the mast; right point at mid-height
  const sailPts = `${MAST_X},${MAST_TOP} 84,${(MAST_TOP + MAST_BOT) / 2} ${MAST_X},${MAST_BOT}`

  // Hull: trapezoid (wider at top than bottom, resting on a keel)
  const hullTop = MAST_BOT + 1
  const hullBot = hullTop + 16
  const hullL = 12
  const hullR = 88
  const hullPts = `${hullL + 3},${hullTop} ${hullR - 3},${hullTop} ${hullR - 8},${hullBot} ${hullL + 8},${hullBot}`

  // Hull centroids
  const hullCy = (hullTop + hullBot) / 2 + 1
  const hullCx = (hullL + hullR) / 2

  // Sail area for shape layout (inside the triangular sail, left side)
  // Shapes go in the right half of the sail (the broader area)
  const shapeAreaX = MAST_X + 4
  const shapeAreaY = MAST_TOP + 8
  const shapeAreaW = 30    // span across sail (stays inside the triangle)
  const shapeAreaH = MAST_BOT - MAST_TOP - 16

  // Triangles in the top part of the sail area
  const triSlots = shapeSlots(data.triangles, shapeAreaX, shapeAreaY, shapeAreaW, shapeAreaH * 0.55)
  // Squares in the bottom part
  const sqSlots = shapeSlots(data.squares, shapeAreaX, shapeAreaY + shapeAreaH * 0.55, shapeAreaW, shapeAreaH * 0.45)

  // Portholes along the hull
  const circleSlots = hullCircleSlots(data.circles, hullCx, hullCy, hullR - hullL - 16)

  // Wave path (simple S-curves)
  const waveY = hullBot + 3
  const wavePath = `M 8,${waveY} Q 18,${waveY - 3} 28,${waveY} Q 38,${waveY + 3} 48,${waveY} Q 58,${waveY - 3} 68,${waveY} Q 78,${waveY + 3} 88,${waveY} Q 93,${waveY - 1.5} 96,${waveY}`

  // Flag at mast top
  const flagPts = `${MAST_X},${MAST_TOP} ${MAST_X + 12},${MAST_TOP + 4} ${MAST_X},${MAST_TOP + 8}`

  return (
    <svg
      viewBox="0 0 100 100"
      width={80}
      height={80}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {/* Mast */}
      <line x1={MAST_X} y1={MAST_TOP} x2={MAST_X} y2={MAST_BOT} stroke={MAST_CLR} strokeWidth={2.2} strokeLinecap="round" />

      {/* Sail */}
      <polygon points={sailPts} fill={sail.fill} stroke={sail.stroke} strokeWidth={1.2} strokeLinejoin="round" />

      {/* Shapes on the sail — triangles first, then squares */}
      {triSlots.map(([cx, cy], i) => (
        <SmallTriangle key={`tri-${i}`} cx={cx} cy={cy} w={5.5} />
      ))}
      {sqSlots.map(([cx, cy], i) => (
        <SmallSquare key={`sq-${i}`} cx={cx} cy={cy} s={4.5} />
      ))}

      {/* Hull */}
      <polygon points={hullPts} fill={HULL_WOOD} stroke={HULL_DARK} strokeWidth={1.2} strokeLinejoin="round" />
      {/* Plank stripe */}
      <line
        x1={hullL + 5}
        y1={(hullTop + hullBot) / 2}
        x2={hullR - 5}
        y2={(hullTop + hullBot) / 2}
        stroke={HULL_STRIPE}
        strokeWidth={1}
        opacity={0.6}
      />

      {/* Portholes */}
      {circleSlots.map(([cx, cy], i) => (
        <circle key={`p-${i}`} cx={cx} cy={cy} r={5.2} fill={CIRCLE_FILL} stroke={CIRCLE_STROKE} strokeWidth={1} />
      ))}

      {/* Flag */}
      <polygon points={flagPts} fill={FLAG_YELLOW} stroke={INK} strokeWidth={0.6} strokeLinejoin="round" />

      {/* Waves */}
      <path d={wavePath} fill="none" stroke={WAVE_CLR} strokeWidth={2.2} strokeLinecap="round" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Exported option renderer
// ---------------------------------------------------------------------------

type OptionLabel = 'A' | 'B' | 'C' | 'D' | 'E'

/**
 * Boats5PEOption — renders one A–E choice for IKMC-23-PE-Q5.
 * Used via CHOICE_RENDERERS['IKMC-23-PE-Q5'].
 */
export default function Boats5PEOption({ choice }: { choice: WmiChoice }) {
  const label = (choice.label ?? '').trim().toUpperCase() as OptionLabel
  const data = BOAT_DATA[label]
  if (!data) return <span>{choice.text}</span>

  const aria = `Boat ${label}: ${data.circles} circle${data.circles !== 1 ? 's' : ''}, ${data.triangles} triangle${data.triangles !== 1 ? 's' : ''}, ${data.squares} square${data.squares !== 1 ? 's' : ''}`

  return (
    <span role="img" aria-label={aria} style={{ display: 'inline-block' }}>
      <BoatSVG label={label} />
    </span>
  )
}

// Also export the underlying BoatSVG for reuse in the explainer
export { BoatSVG, BOAT_DATA }
export type { BoatData }
