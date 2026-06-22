// IKMC-23-EC-Q12 — "There are 7 houses north of Road A, 8 houses east of Road B
// and 5 houses south of Road A. How many houses are west of Road B?"
// Answer: A (4)
//
// Strategy: Road A splits all 12 houses into North (7) and South (5).
// Road B splits all 12 houses into East (8) and West. West = 12 − 8 = 4.
//
// Figure: green oval map; Road A (horizontal, brown) and Road B (vertical,
// brown) cross near the center. 7 house icons in the NW+NE quadrant; 5 in the
// SW+SE quadrant; 8 total in the east half; 4 in the west half (not labeled
// in the stem — student must calculate). Compass rose in the lower-right.
//
// Adapted from VillageMap10PEIllustration — reuses the House sub-component
// and the same SVG-only / SSR-safe conventions.
//
// Co-exported shared primitive: RoadHouses12EC, used by both this stem
// illustration and by RoadHouses12ECExplainer.

import type { JSX } from 'react'

// ── Layout constants ──────────────────────────────────────────────────────────

export const SVG_W = 320
export const SVG_H = 200

/** Centre of the oval map. */
export const MAP_CX = 155
export const MAP_CY = 98

/** Oval radii. */
export const OVR_X = 148
export const OVR_Y = 90

/** Road A: horizontal band y-coordinate (slightly above centre). */
export const ROAD_A_Y = 96

/** Road B: vertical band x-coordinate (slightly right of centre). */
export const ROAD_B_X = 164

/** Road width in px. */
export const ROAD_W = 14

/** Colour palette. */
export const C = {
  GRASS:       '#4C9A2A',
  GRASS_DARK:  '#3A7820',
  ROAD:        '#B57A3A',
  ROAD_EDGE:   '#8B5C1C',
  HOUSE_FILL:  '#3B82F6',
  HOUSE_STK:   '#1E3A5F',
  HOUSE_ROOF:  '#3B82F6',
  LABEL:       '#1F2937',
  COMPASS:     '#1F2937',
  NORTH_HL:    '#DC2626',
  GREEN:       '#10B981',
  AMBER:       '#F59E0B',
} as const

// ── House positions ────────────────────────────────────────────────────────────
// 12 houses total: 7 north of Road A, 5 south. 8 east of Road B, 4 west.
// Quadrant counts: NW=3, NE=4, SW=1, SE=4 → North=7, South=5, East=8, West=4 ✓
// x < ROAD_B_X = west; x > ROAD_B_X = east; y < ROAD_A_Y = north; y > ROAD_A_Y = south

export type Pt = readonly [number, number]

export const HOUSES: Pt[] = [
  // NW (3 houses, north+west)
  [70,  42], [44,  70], [90,  62],
  // NE (4 houses, north+east)
  [198, 38], [240, 55], [218, 72], [270, 68],
  // SW (1 house, south+west)
  [82, 148],
  // SE (4 houses, south+east)
  [200,128], [240,142], [215,158], [264,150],
]

// ── Sub-components ────────────────────────────────────────────────────────────

/** Small house icon centred at (cx, cy). */
export function House({ cx, cy, size = 14, fill = C.HOUSE_FILL }: { cx: number; cy: number; size?: number; fill?: string }): JSX.Element {
  const hw = size / 2
  const bodyH = size * 0.55
  const roofH = size * 0.50
  const bx = cx - hw
  const by = cy - bodyH / 2 + roofH * 0.4

  return (
    <g>
      {/* roof */}
      <polygon
        points={`${cx},${cy - hw - roofH * 0.6} ${cx - hw},${cy - hw + roofH * 0.4} ${cx + hw},${cy - hw + roofH * 0.4}`}
        fill={fill}
        stroke={C.HOUSE_STK}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      {/* body */}
      <rect
        x={bx}
        y={by}
        width={size}
        height={bodyH}
        fill={fill}
        stroke={C.HOUSE_STK}
        strokeWidth={1.2}
      />
    </g>
  )
}

/** Compass rose in the lower-right corner. */
function Compass({ cx, cy }: { cx: number; cy: number }): JSX.Element {
  const r = 16
  const INK = C.COMPASS

  return (
    <g fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight={800}>
      {/* circle */}
      <circle cx={cx} cy={cy} r={r} fill="white" stroke={INK} strokeWidth={1.2} opacity={0.88} />
      {/* N/S/E/W arrows */}
      {/* North (red) */}
      <line x1={cx} y1={cy} x2={cx} y2={cy - r + 3} stroke={C.NORTH_HL} strokeWidth={2} strokeLinecap="round" />
      <polygon points={`${cx},${cy - r + 2} ${cx - 3},${cy - r + 9} ${cx + 3},${cy - r + 9}`} fill={C.NORTH_HL} />
      {/* South */}
      <line x1={cx} y1={cy} x2={cx} y2={cy + r - 3} stroke={INK} strokeWidth={1.5} strokeLinecap="round" />
      {/* East */}
      <line x1={cx} y1={cy} x2={cx + r - 3} y2={cy} stroke={INK} strokeWidth={1.5} strokeLinecap="round" />
      {/* West */}
      <line x1={cx} y1={cy} x2={cx - r + 3} y2={cy} stroke={INK} strokeWidth={1.5} strokeLinecap="round" />
      {/* Labels */}
      <text x={cx}     y={cy - r - 3} textAnchor="middle" dominantBaseline="auto"     fontSize={8} fill={C.NORTH_HL}>N</text>
      <text x={cx}     y={cy + r + 8} textAnchor="middle" dominantBaseline="auto"     fontSize={8} fill={INK}>S</text>
      <text x={cx + r + 3} y={cy + 1}  textAnchor="start"  dominantBaseline="central" fontSize={8} fill={INK}>E</text>
      <text x={cx - r - 3} y={cy + 1}  textAnchor="end"    dominantBaseline="central" fontSize={8} fill={INK}>W</text>
    </g>
  )
}

// ── Highlight mode type ────────────────────────────────────────────────────────

export type HighlightMode =
  | null
  | 'road-a'          // tint Road A amber
  | 'road-b'          // tint Road B amber
  | 'north-count'     // show "7" badge north of Road A
  | 'south-count'     // show "5" badge south of Road A
  | 'east-count'      // show "8" badge east of Road B
  | 'total'           // show "12" total badge
  | 'west-answer'     // show "4" badge west of Road B in green

export interface RoadHouses12ECProps {
  highlight?: HighlightMode
  className?: string
}

// ── Shared primitive ──────────────────────────────────────────────────────────

/**
 * Cross-road map for IKMC-23-EC-Q12.
 * Used by both the static Illustration and the animated Explainer.
 */
export function RoadHouses12EC({
  highlight = null,
  className,
}: RoadHouses12ECProps): JSX.Element {
  const roadAColor = (highlight === 'road-a') ? C.AMBER : C.ROAD
  const roadBColor = (highlight === 'road-b') ? C.AMBER : C.ROAD

  // Road A: horizontal stripe
  const roadAY1 = ROAD_A_Y - ROAD_W / 2
  const roadAH  = ROAD_W

  // Road B: vertical stripe
  const roadBX1 = ROAD_B_X - ROAD_W / 2
  const roadBW  = ROAD_W

  // Label badge helper
  const showBadge = (mode: HighlightMode): JSX.Element | null => {
    if (highlight !== mode) return null
    let bx = 0, by = 0, text = '', color: string = C.AMBER
    if (mode === 'north-count') { bx = ROAD_B_X - 40; by = 35; text = '7 rumah'; color = C.AMBER }
    if (mode === 'south-count') { bx = ROAD_B_X - 40; by = SVG_H - 30; text = '5 rumah'; color = C.AMBER }
    if (mode === 'east-count')  { bx = ROAD_B_X + 28; by = 65;  text = '8 rumah'; color = C.AMBER }
    if (mode === 'total')       { bx = 20;             by = 18;  text = '7+5 = 12'; color = '#1E3A5F' }
    if (mode === 'west-answer') { bx = 22;             by = 65;  text = '4 rumah'; color = C.GREEN }
    if (!text) return null
    return (
      <text
        x={bx}
        y={by}
        fontSize={11}
        fontWeight={800}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fill={color}
        textAnchor="start"
      >
        {text}
      </text>
    )
  }

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className={className}
      aria-hidden="true"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {/* ── Oval green map ──────────────────────────────── */}
      <ellipse cx={MAP_CX} cy={MAP_CY} rx={OVR_X} ry={OVR_Y} fill={C.GRASS} stroke={C.GRASS_DARK} strokeWidth={3} />

      {/* ── Roads drawn as clipped stripes ─────────────── */}
      {/* Road A: horizontal */}
      <clipPath id="mapClip-ec12">
        <ellipse cx={MAP_CX} cy={MAP_CY} rx={OVR_X} ry={OVR_Y} />
      </clipPath>
      <g clipPath="url(#mapClip-ec12)">
        <rect x={0} y={roadAY1} width={SVG_W} height={roadAH} fill={roadAColor} />
        {/* Road B: vertical */}
        <rect x={roadBX1} y={0} width={roadBW} height={SVG_H} fill={roadBColor} />
      </g>

      {/* ── Road edge outlines (inner lines for depth) ── */}
      <g clipPath="url(#mapClip-ec12)" stroke={C.ROAD_EDGE} strokeWidth={0.8} fill="none">
        <line x1={0} y1={roadAY1}        x2={SVG_W} y2={roadAY1} />
        <line x1={0} y1={roadAY1 + roadAH} x2={SVG_W} y2={roadAY1 + roadAH} />
        <line x1={roadBX1}       y1={0} x2={roadBX1}       y2={SVG_H} />
        <line x1={roadBX1 + roadBW} y1={0} x2={roadBX1 + roadBW} y2={SVG_H} />
      </g>

      {/* ── Road labels ─────────────────────────────────── */}
      {/* Road A label — on the road, left side */}
      <text
        x={22}
        y={ROAD_A_Y + 1}
        textAnchor="start"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={800}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fill="#FFFFFF"
        stroke={C.ROAD_EDGE}
        strokeWidth={0.5}
        paintOrder="stroke"
      >
        Road A
      </text>
      {/* Road B label — rotated, on the road */}
      <text
        x={ROAD_B_X}
        y={SVG_H - 15}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={800}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fill="#FFFFFF"
        stroke={C.ROAD_EDGE}
        strokeWidth={0.5}
        paintOrder="stroke"
        transform={`rotate(-90, ${ROAD_B_X}, ${SVG_H - 15})`}
      >
        Road B
      </text>

      {/* ── Houses ─────────────────────────────────────── */}
      {HOUSES.map(([hx, hy], i) => (
        <House key={i} cx={hx} cy={hy} />
      ))}

      {/* ── Compass rose ───────────────────────────────── */}
      <Compass cx={SVG_W - 30} cy={SVG_H - 30} />

      {/* ── Highlight badges ───────────────────────────── */}
      {(['north-count', 'south-count', 'east-count', 'total', 'west-answer'] as const).map((m) =>
        showBadge(m)
      )}
    </svg>
  )
}

// ── Default export: static stem illustration ───────────────────────────────────

/**
 * Static problem figure for IKMC-23-EC-Q12 (no highlights, no animation).
 */
export default function RoadHouses12ECIllustration(): JSX.Element {
  return (
    <div className="mx-auto w-full max-w-[360px]">
      <RoadHouses12EC />
    </div>
  )
}
