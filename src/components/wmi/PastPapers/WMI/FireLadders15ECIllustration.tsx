// IKMC-21-EC-Q15 — "On a tall building there are 4 fire escape ladders, as shown.
// The heights of 3 ladders are at their tops. What is the height of the shortest ladder?"
//
// PROBLEM ONLY: shows the static figure the student sees in the paper.
//   - A tall building with a uniform floor grid (12 floors, each 4 units = 48 total height)
//   - 4 vertical fire-escape ladders affixed to the facade, reaching different floors
//   - Labels at the top of 3 ladders: 48, 36, 32
//   - A "?" label at the top of the shortest unlabelled ladder (height = 20)
//
// Does NOT show:
//   - the answer (20)
//   - the floor count or scale annotation
//
// Ladder heights and positions (left → right): 32, ?, 36, 48
// The answer ladder ("?") is the second from left, reaching 5 floors (= 20 units).
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── shared layout constants (re-exported for the explainer to overlay) ──────────

export const SVG_W = 260
export const SVG_H = 280

/** Total number of floors (and also the max height in units) */
export const N_FLOORS = 12

/** Units per floor */
export const UNITS_PER_FLOOR = 4

/** Maximum building height in units */
export const MAX_HEIGHT = N_FLOORS * UNITS_PER_FLOOR // 48

/** Y coordinate of the ground line */
export const GROUND_Y = 248

/** Y coordinate of the building roof */
export const ROOF_Y = 24

/** Building left/right x */
export const BLDG_X = 28
export const BLDG_W = 200
export const BLDG_RIGHT = BLDG_X + BLDG_W // 228

/** Height of one floor in SVG pixels */
export const FLOOR_H_PX = (GROUND_Y - ROOF_Y) / N_FLOORS // ≈18.67 px

/** Convert height-in-units to Y coordinate */
export function heightToY(h: number): number {
  return GROUND_Y - (h / MAX_HEIGHT) * (GROUND_Y - ROOF_Y)
}

/** The four ladders: x-centre on facade, height in units, label */
export const LADDERS: { cx: number; height: number; label: string }[] = [
  { cx: BLDG_X + BLDG_W * 0.175, height: 32, label: '32' },
  { cx: BLDG_X + BLDG_W * 0.375, height: 20, label: '?'  },
  { cx: BLDG_X + BLDG_W * 0.625, height: 36, label: '36' },
  { cx: BLDG_X + BLDG_W * 0.825, height: 48, label: '48' },
]

/** Ladder stripe half-width (px) */
export const LADDER_HW = 7

export const COLOR = {
  BUILDING:       '#A8C4E0',   // soft blue façade
  BUILDING_STROKE:'#30598A',
  GRID:           '#7AA8CC',   // floor lines
  ROOF:           '#30598A',   // roof band
  LADDER:         '#C0392B',   // red ladder stripes
  LADDER_STROKE:  '#7B0000',
  RUNG:           '#E74C3C',
  LABEL:          '#1F2937',
  QUESTION:       '#30598A',
} as const

// ── Building primitive ───────────────────────────────────────────────────────────

export function BuildingShape() {
  const rows = Array.from({ length: N_FLOORS }, (_, i) => i)

  return (
    <g>
      {/* façade fill */}
      <rect x={BLDG_X} y={ROOF_Y} width={BLDG_W} height={GROUND_Y - ROOF_Y}
        fill={COLOR.BUILDING} stroke={COLOR.BUILDING_STROKE} strokeWidth={2} />

      {/* floor grid lines */}
      {rows.slice(1).map((i) => {
        const y = ROOF_Y + i * FLOOR_H_PX
        return (
          <line key={i} x1={BLDG_X} y1={y} x2={BLDG_RIGHT} y2={y}
            stroke={COLOR.GRID} strokeWidth={1} strokeDasharray="4 3" opacity={0.7} />
        )
      })}

      {/* roof band */}
      <rect x={BLDG_X} y={ROOF_Y - 6} width={BLDG_W} height={8}
        fill={COLOR.ROOF} rx={2} />
    </g>
  )
}

// ── Ladder primitive ─────────────────────────────────────────────────────────────

/**
 * A single fire-escape ladder: two vertical rails from GROUND_Y to topY,
 * with horizontal rungs every ~8 px.
 */
export function LadderShape({ cx, height, highlight = false }: { cx: number; height: number; highlight?: boolean }) {
  const topY = heightToY(height)
  const lx = cx - LADDER_HW
  const rx = cx + LADDER_HW
  const rungColor = highlight ? '#FF6B35' : COLOR.RUNG
  const railColor = highlight ? '#FF6B35' : COLOR.LADDER
  const strokeColor = highlight ? '#C44A00' : COLOR.LADDER_STROKE

  // rungs every 8 px from ground up
  const rungCount = Math.floor((GROUND_Y - topY) / 8)
  const rungs = Array.from({ length: rungCount }, (_, i) => GROUND_Y - 4 - i * 8).filter(y => y >= topY)

  return (
    <g>
      {/* left rail */}
      <rect x={lx} y={topY} width={3} height={GROUND_Y - topY}
        fill={railColor} stroke={strokeColor} strokeWidth={0.5} />
      {/* right rail */}
      <rect x={rx - 3} y={topY} width={3} height={GROUND_Y - topY}
        fill={railColor} stroke={strokeColor} strokeWidth={0.5} />
      {/* rungs */}
      {rungs.map((ry, i) => (
        <line key={i} x1={lx + 3} y1={ry} x2={rx - 3} y2={ry}
          stroke={rungColor} strokeWidth={2} strokeLinecap="round" />
      ))}
    </g>
  )
}

// ── Default export ────────────────────────────────────────────────────────────────

/**
 * FireLadders15ECIllustration
 *
 * Static, problem-only figure for IKMC-21-EC-Q15.
 * Shows: building with 12-floor grid, 4 fire-escape ladders at different heights.
 * Three ladders have height labels (48, 36, 32); the shortest shows "?".
 * Does NOT reveal the answer (20) or the floor scale annotation.
 */
export default function FireLadders15ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Sebuah gedung tinggi dengan 4 tangga darurat. ' +
        'Tiga tangga berlabel: 48, 36, 32. Satu tangga bertanda tanya (yang paling pendek).'
      }
    >
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={Math.min(280, SVG_W)} style={{ display: 'block' }}>
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* building */}
        <BuildingShape />

        {/* ladders (back to front: tallest first so shorter ones render on top) */}
        {[...LADDERS].reverse().map((l) => (
          <LadderShape key={l.label} cx={l.cx} height={l.height} />
        ))}

        {/* height labels at top of each ladder */}
        {LADDERS.map((l) => {
          const topY = heightToY(l.height)
          const isQ = l.label === '?'
          return (
            <text
              key={l.label}
              x={l.cx}
              y={topY - 5}
              textAnchor="middle"
              dominantBaseline="auto"
              fontSize={isQ ? 16 : 12}
              fontWeight={900}
              fill={isQ ? COLOR.QUESTION : COLOR.LABEL}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {l.label}
            </text>
          )
        })}

        {/* ground line */}
        <line x1={0} y1={GROUND_Y} x2={SVG_W} y2={GROUND_Y}
          stroke="#8B6914" strokeWidth={2} />
        <rect x={0} y={GROUND_Y} width={SVG_W} height={SVG_H - GROUND_Y}
          fill="#D4B896" />
      </svg>
    </div>
  )
}
