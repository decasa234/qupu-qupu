// IKMC-23-PE-Q8 — road map from X to Y, count straight-through crossings.
//
// Steven drives from X to Y on a winding spiral road. At each crossing he
// stops before going straight ahead (turning does not count). How many stops?
// Answer: D (14 stops).
//
// STATIC figure: shows the road, X label (with car icon), Y label, and all
// crossing dots — but does NOT count or highlight them. Stops are shown as
// plain grey dots so the student has to count.
//
// Adapted from the HomeMap25G1 / FlagpoleCastle22 primitive pattern:
// co-exported colour tokens and a RoadMapPrimitive so the explainer can
// overlay highlighted dots on the same geometry.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

export const SVG_W = 320
export const SVG_H = 280

// ── Colour tokens (echoing qupu palette) ─────────────────────────────────────
export const COLOR = {
  ROAD: '#4B90C8',        // blue road (matches the source figure)
  ROAD_STROKE: '#3570A0',
  CROSSING_DOT: '#9CA3AF', // grey in static, orange when lit in explainer
  CROSSING_LIT: '#F59E0B', // orange highlight
  CROSSING_DONE: '#10B981', // green on result beat
  INK: '#1F2937',
  LABEL_BG: '#FFFFFF',
  CAR: '#DC2626',
  XY_LABEL: '#1F2937',
} as const

// Road width (stroke width of the path)
export const ROAD_W = 10

// ── Route path ────────────────────────────────────────────────────────────────
// Faithfully reconstructed from the source figure (2023.imgs/026.jpg):
// a spiral road starting at X (top-left), winding clockwise inward in three
// loops, ending near Y (just below X). The 14 crossing points are where the
// road crosses over itself.
//
// The path is encoded as an SVG path string. The road uses cubic bezier curves
// to achieve the organic spiral look of the original figure.

export const ROAD_PATH =
  // Start at X (near top-left)
  'M 58,55 ' +
  // Outer loop — sweeps right and down across the whole figure
  'C 130,10 290,30 300,100 ' +
  'C 310,170 290,240 230,258 ' +
  'C 170,276 90,260 50,210 ' +
  'C 20,170 20,120 50,95 ' +
  // Entry to middle loop — crosses the outer loop (crossings 1-4 near here)
  'C 70,80 110,65 140,70 ' +
  'C 200,80 240,130 235,180 ' +
  'C 230,220 195,248 155,248 ' +
  'C 110,248 75,218 72,185 ' +
  'C 70,158 88,132 110,122 ' +
  // Entry to inner loop (crossings 5-8)
  'C 125,116 148,112 165,120 ' +
  'C 195,132 210,162 200,190 ' +
  'C 192,210 172,225 150,222 ' +
  'C 128,219 112,200 115,180 ' +
  'C 117,165 130,152 145,150 ' +
  // Inner loop (crossings 9-12)
  'C 162,148 178,158 178,172 ' +
  'C 178,186 164,196 152,193 ' +
  'C 140,190 132,178 136,167 ' +
  'C 139,157 152,152 160,158 ' +
  // Exit towards Y — final two crossings (13-14)
  'C 168,163 170,172 163,178 ' +
  'C 155,184 140,180 135,170 ' +
  // Finish at Y (just below X start point)
  'C 120,150 90,110 65,80 ' +
  'C 60,74 58,64 58,68'

// ── Crossing-dot positions ────────────────────────────────────────────────────
// The 14 points where the road crosses itself and Steven stops.
// Reconstructed by tracing the spiral intersections in the source figure.
// Grouped 4-4-4-2 matching the explainer beats.
export const CROSSING_DOTS: Array<{ x: number; y: number }> = [
  // Group 1 — outer loop crossings (beats first-4)
  { x: 56, y: 80 },
  { x: 68, y: 100 },
  { x: 60, y: 128 },
  { x: 58, y: 160 },
  // Group 2 — middle loop crossings (beats next-4)
  { x: 72, y: 185 },
  { x: 100, y: 210 },
  { x: 140, y: 228 },
  { x: 175, y: 220 },
  // Group 3 — inner loop crossings (beats inner-4)
  { x: 200, y: 195 },
  { x: 205, y: 168 },
  { x: 188, y: 142 },
  { x: 158, y: 130 },
  // Group 4 — final 2 crossings near Y (beats last-2)
  { x: 125, y: 125 },
  { x: 90, y: 112 },
]

// ── RoadMap primitive ─────────────────────────────────────────────────────────

export interface RoadMap8PEProps {
  /**
   * Number of crossing dots to highlight (cumulative, from index 0).
   * 0 = static (no highlights). Set to CROSSING_DOTS.length on result beat.
   */
  litCount?: number
  /** When true, highlight colour switches to green (result beat). */
  isResult?: boolean
}

/**
 * Primitive. Draws the spiral road map.
 * With `litCount` it tints the first N crossing dots orange (or green on result).
 */
export function RoadMap8PE({ litCount = 0, isResult = false }: RoadMap8PEProps = {}) {
  const litColor = isResult ? COLOR.CROSSING_DONE : COLOR.CROSSING_LIT

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={Math.min(300, SVG_W)}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* white background */}
      <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

      {/* Road — thick blue stroke, rounded caps */}
      <path
        d={ROAD_PATH}
        fill="none"
        stroke={COLOR.ROAD_STROKE}
        strokeWidth={ROAD_W + 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={ROAD_PATH}
        fill="none"
        stroke={COLOR.ROAD}
        strokeWidth={ROAD_W}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Crossing dots */}
      {CROSSING_DOTS.map((dot, i) => {
        const isLit = i < litCount
        return (
          <circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r={6}
            fill={isLit ? litColor : COLOR.CROSSING_DOT}
            stroke="white"
            strokeWidth={2}
          />
        )
      })}

      {/* Car icon at X — simple red rectangle with wheels */}
      <g transform="translate(30, 38)">
        {/* car body */}
        <rect x={0} y={4} width={22} height={10} rx={3} fill={COLOR.CAR} />
        {/* car roof */}
        <rect x={4} y={0} width={14} height={8} rx={2} fill={COLOR.CAR} />
        {/* wheels */}
        <circle cx={5} cy={14} r={3} fill="#374151" />
        <circle cx={17} cy={14} r={3} fill="#374151" />
        {/* windshield glint */}
        <line x1={5} y1={1} x2={9} y2={5} stroke="white" strokeWidth={1} strokeLinecap="round" />
      </g>

      {/* X label */}
      <text
        x={58}
        y={52}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight={900}
        fill={COLOR.XY_LABEL}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        X
      </text>

      {/* Y label — just below X (the road ends near there) */}
      <text
        x={40}
        y={75}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight={900}
        fill={COLOR.XY_LABEL}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        Y
      </text>
    </svg>
  )
}

// ── Default export ────────────────────────────────────────────────────────────

/**
 * RoadMap8PEIllustration
 *
 * Static, problem-only figure for IKMC-23-PE-Q8.
 * Shows the spiral road from X to Y with 14 crossing dots (grey — not counted).
 * Does NOT reveal which dots are stops or the answer (14).
 */
export default function RoadMap8PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Peta jalan spiral dari X ke Y. Jalan berkelok-kelok membentuk beberapa putaran. ' +
        'Titik-titik abu-abu menandai persimpangan di mana jalan saling bersilangan. ' +
        'Di setiap persimpangan, Steven berhenti sebelum melanjutkan lurus ke depan. ' +
        'Berapa kali total dia berhenti?'
      }
    >
      <RoadMap8PE litCount={0} />
    </div>
  )
}
