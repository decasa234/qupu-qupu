// In-card figure for WMI-25P1A-Q22 (2025 Grade 1 Semifinal Paper A, question 22).
//
// Reconstructed from db/seed/wmi/figures/2025-semifinal-g1-a-q22.jpg:
//   A round fish tank divided by boards into 7 wedge-shaped areas around a
//   central hub. Each area holds ONE kind of fish; neighbouring areas hold
//   DIFFERENT kinds. A number in each area gives how many fish are there.
//   Some areas show a fish icon (so we know the kind); others show a dashed "?"
//   (kind unknown). The seven counts, clockwise from the top, are:
//
//     top         : 2   (kind unknown, "?")
//     upper-left  : 1   (yellow fish)
//     left        : 1   (blue fish)
//     lower-left  : 3   (kind unknown, "?")
//     bottom      : 1   (red fish)
//     lower-right : 1   (kind unknown, "?")
//     right       : 3   (kind unknown, "?")
//
//   Total = 2+1+1+3+1+1+3 = 12 fish, in 3 kinds.
//
// The puzzle: assign the 3 kinds so adjacent areas differ, then maximise the
// difference between two kinds' totals. Best 3-colouring of the 7-cycle gives
// kind sums {7, 4, 1}, so the largest difference is 7 − 1 = 6 → answer B.
//
// PROBLEM-ONLY: shows the tank, the 7 areas, their counts (as tally marks), the
// three known fish icons, and the "?" placeholders. It never reveals the
// grouping or the answer. SSR-safe + deterministic (no window / Date / random).

// ---------------------------------------------------------------------------
// Exported primitives (illustration + explainer bind to these)
// ---------------------------------------------------------------------------

export const VIEW = 320
export const CX = VIEW / 2
export const CY = VIEW / 2
export const R_OUT = 142 // outer tank radius
export const R_HUB = 11 // central hub radius

const INK = '#3A322E'
const WATER = '#CDE8F4'
const BOARD = '#9E9E9E'

/** Known fish kinds shown in the scan. */
export type FishKind = 'yellow' | 'blue' | 'red' | 'unknown'

export interface Area {
  /** Number of fish in this area. */
  count: number
  /** The kind shown by an icon, or 'unknown' for a dashed "?". */
  kind: FishKind
}

/**
 * The seven areas, clockwise starting from the TOP wedge.
 * Counts and known kinds read directly off the scan; the total is 12.
 */
export const AREAS: Area[] = [
  { count: 2, kind: 'unknown' }, // top
  { count: 1, kind: 'yellow' }, // upper-left
  { count: 1, kind: 'blue' }, // left
  { count: 3, kind: 'unknown' }, // lower-left
  { count: 1, kind: 'red' }, // bottom
  { count: 1, kind: 'unknown' }, // lower-right
  { count: 3, kind: 'unknown' }, // right
]

export const TOTAL_FISH = AREAS.reduce((a, s) => a + s.count, 0) // 12
export const N_AREAS = AREAS.length // 7

const KIND_FILL: Record<Exclude<FishKind, 'unknown'>, string> = {
  yellow: '#FFC107',
  blue: '#42A5F5',
  red: '#EF5350',
}

/** Angle (radians) of the centre of area i. Area 0 points straight up. */
export function areaMidAngle(i: number): number {
  // -90° puts area 0 at the top; clockwise as i increases.
  return (-90 + (360 / N_AREAS) * i) * (Math.PI / 180)
}

/** Point on a ray from the hub at the given area angle and radius. */
function polar(angleRad: number, radius: number): [number, number] {
  return [CX + radius * Math.cos(angleRad), CY + radius * Math.sin(angleRad)]
}

/** A simple fish glyph (body teardrop + tail + eye) facing left, tintable. */
export function Fish({ x, y, fill, scale = 1 }: { x: number; y: number; fill: string; scale?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`} aria-hidden="true">
      <ellipse cx={0} cy={0} rx={13} ry={8} fill={fill} stroke="#00000022" strokeWidth={1} />
      {/* tail */}
      <path d="M 11 0 L 21 -7 L 21 7 Z" fill={fill} stroke="#00000022" strokeWidth={1} />
      {/* eye */}
      <circle cx={-7} cy={-2} r={2.4} fill="#FFFFFF" />
      <circle cx={-7.6} cy={-2} r={1.2} fill="#1F2937" />
      {/* top fin */}
      <path d="M -2 -7 Q 2 -13 7 -7 Z" fill={fill} opacity={0.85} />
    </g>
  )
}

/** A dashed-circle "?" placeholder used where the kind is unknown. */
export function UnknownMark({ x, y }: { x: number; y: number }) {
  return (
    <g aria-hidden="true">
      <circle cx={x} cy={y} r={12} fill="none" stroke={INK} strokeWidth={1.6} strokeDasharray="3,3" />
      <text x={x} y={y + 0.5} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={800} fill={INK}>
        ?
      </text>
    </g>
  )
}

/** Tally-mark count drawn as 1..3 short vertical strokes (matches the scan). */
function Tally({ x, y, n }: { x: number; y: number; n: number }) {
  const gap = 5
  const start = x - ((n - 1) * gap) / 2
  return (
    <g aria-hidden="true">
      {Array.from({ length: n }).map((_, k) => (
        <line key={k} x1={start + k * gap} y1={y - 8} x2={start + k * gap} y2={y + 8} stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
      ))}
    </g>
  )
}

interface TankProps {
  /**
   * Optional per-area fill tint (by area index) — used by the explainer to
   * colour areas into kind groups. When omitted areas use the water fill.
   */
  groupFill?: Array<string | null>
  /** Optional ring highlight colour per area index. */
  ring?: Array<string | null>
}

/** The shared round fish-tank figure. */
export function FishTank({ groupFill, ring }: TankProps = {}) {
  const step = (2 * Math.PI) / N_AREAS
  return (
    <g>
      {/* area wedges */}
      {AREAS.map((area, i) => {
        const a0 = areaMidAngle(i) - step / 2
        const a1 = areaMidAngle(i) + step / 2
        const [x0, y0] = polar(a0, R_OUT)
        const [x1, y1] = polar(a1, R_OUT)
        const fill = groupFill?.[i] ?? WATER
        const d = `M ${CX} ${CY} L ${x0} ${y0} A ${R_OUT} ${R_OUT} 0 0 1 ${x1} ${y1} Z`
        return <path key={`wedge${i}`} d={d} fill={fill} fillOpacity={groupFill?.[i] ? 0.55 : 1} />
      })}

      {/* tank outline */}
      <circle cx={CX} cy={CY} r={R_OUT} fill="none" stroke={INK} strokeWidth={4} />

      {/* dividing boards (one ray per area boundary) */}
      {AREAS.map((_, i) => {
        const a = areaMidAngle(i) - step / 2
        const [ex, ey] = polar(a, R_OUT)
        return <line key={`board${i}`} x1={CX} y1={CY} x2={ex} y2={ey} stroke={BOARD} strokeWidth={5} strokeLinecap="round" />
      })}

      {/* optional per-area ring highlight */}
      {ring?.map((col, i) => {
        if (!col) return null
        const [mx, my] = polar(areaMidAngle(i), R_OUT * 0.62)
        return <circle key={`ring${i}`} cx={mx} cy={my} r={22} fill="none" stroke={col} strokeWidth={3} />
      })}

      {/* central hub */}
      <circle cx={CX} cy={CY} r={R_HUB} fill="#FFFFFF" stroke={INK} strokeWidth={3} />

      {/* contents of each area: a fish icon or "?" near the hub, count near the rim */}
      {AREAS.map((area, i) => {
        const [ix, iy] = polar(areaMidAngle(i), R_OUT * 0.5) // icon ring
        const [tx, ty] = polar(areaMidAngle(i), R_OUT * 0.82) // count ring
        return (
          <g key={`content${i}`}>
            {area.kind === 'unknown' ? (
              <UnknownMark x={ix} y={iy} />
            ) : (
              <Fish x={ix} y={iy} fill={KIND_FILL[area.kind]} scale={0.95} />
            )}
            <Tally x={tx} y={ty} n={area.count} />
          </g>
        )
      })}
    </g>
  )
}

export default function P25G1Q22Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A round fish tank split into 7 wedge-shaped areas. Each area shows its fish count as tally marks; three areas show a fish (yellow, blue, red) and the rest show a question mark for an unknown kind."
    >
      <svg viewBox={`0 0 ${VIEW} ${VIEW}`} width="100%" style={{ maxWidth: VIEW, display: 'block', margin: '0 auto' }} aria-hidden="true">
        <rect x={0} y={0} width={VIEW} height={VIEW} fill="white" />
        <FishTank />
      </svg>
    </div>
  )
}
