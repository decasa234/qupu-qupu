/**
 * WMI-23F2A-Q4 — Peggy's walk to school (2023 Grade 2 Final).
 *
 * "Peggy walks to school from home. She first walks towards the west (W) for a
 * while, then turns towards the northwest (NW) and walks for a while, and finally
 * walks towards the south (S) for 200 m and arrives at school."
 *
 * This file draws ONLY the problem setup: Home, the three-leg route (W → NW → S),
 * School, a "200 m" label on the final southward leg, and a compass rose. It
 * never reveals the reverse-route answer (N → SE → E = C), which is the
 * animator's job.
 *
 * Exports:
 *   - `PeggyMap23G2`          — reusable primitive; accepts `highlightReverse?`
 *                               for the animator to overlay the return path.
 *   - `PeggyMap23G2Illustration` — default illustration (no highlight).
 *
 * Pure render: no Math.random, no Date, no useState/useEffect. SSR-safe &
 * deterministic. No params needed (geometry is fully determined by the question).
 */

// ─── geometry ────────────────────────────────────────────────────────────────
//
// Coordinate system: x grows right (East), y grows DOWN (South) as is standard
// for SVG. We place Home at a comfortable point and derive the three waypoints
// from the compass directions stated in the question.
//
//   Leg 1 → West   : move left  (–x)       starting at Home
//   Leg 2 → NW     : move left and UP       (–x, –y, 45°)
//   Leg 3 → South  : move DOWN (+y) 200 m  arriving at School
//
// We use a unit where 1 unit ≈ 4 px in the viewBox.

const HOME_X  = 300
const HOME_Y  = 180

// Leg lengths chosen to fill the viewBox nicely without distortion.
const LEG1_LEN = 110  // west
const LEG2_LEN =  96  // northwest (45°, so dx = dy = LEG2_LEN / √2)
const LEG3_LEN =  80  // south — labelled "200 m" in the question

const D45 = LEG2_LEN / Math.SQRT2  // ≈ 67.9

// Three waypoints along the route, derived from the directions:
const P1_X = HOME_X  - LEG1_LEN            // after W leg
const P1_Y = HOME_Y

const P2_X = P1_X - D45                    // after NW leg
const P2_Y = P1_Y - D45

const SCHOOL_X = P2_X                      // after S leg — x unchanged
const SCHOOL_Y = P2_Y + LEG3_LEN

// ViewBox with generous headroom so nothing clips.
const VB_W = 380
const VB_H = 340
const PAD   = 24   // extra clearance for labels / compass

// ─── compass-rose layout ─────────────────────────────────────────────────────
// Placed in the bottom-right quadrant to avoid overlapping the route.

const CX = 318   // compass centre x
const CY = 268   // compass centre y
const CR = 38    // compass outer radius

/** Eight compass-point definitions: label, angle from North (clockwise). */
const COMPASS_POINTS: Array<{ label: string; angle: number; major: boolean }> = [
  { label: 'N',  angle:   0, major: true  },
  { label: 'NE', angle:  45, major: false },
  { label: 'E',  angle:  90, major: true  },
  { label: 'SE', angle: 135, major: false },
  { label: 'S',  angle: 180, major: true  },
  { label: 'SW', angle: 225, major: false },
  { label: 'W',  angle: 270, major: true  },
  { label: 'NW', angle: 315, major: false },
]

/** Convert compass bearing (0 = N, clockwise) → SVG angle (0 = right, anti-CW). */
function bearingToRad(deg: number): number {
  // SVG: angle 0 → +x (East), counter-clockwise positive.
  // Compass: bearing 0 → North (–y in SVG), clockwise positive.
  // Conversion: svgRad = (bearing − 90) × π/180
  return ((deg - 90) * Math.PI) / 180
}

function compassPt(bearing: number, r: number): { x: number; y: number } {
  const a = bearingToRad(bearing)
  return { x: CX + Math.cos(a) * r, y: CY + Math.sin(a) * r }
}

// ─── colour tokens (Tailwind className equivalents as inline where needed) ────

const INK   = '#1F2937'   // near-black for labels
const ROAD  = '#6B7280'   // neutral grey road
const ROAD_W = 4

// ─── helper: house icon ───────────────────────────────────────────────────────

function HouseGlyph({
  cx,
  cy,
  size = 18,
  fillClass = 'fill-qupu-brand-blue',
  roofClass = 'fill-qupu-brand-blue-shadow',
}: {
  cx: number
  cy: number
  size?: number
  fillClass?: string
  roofClass?: string
}) {
  const w = size
  const h = size * 0.8
  const roofH = size * 0.42
  const x = cx - w / 2
  const y = cy - h / 2
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={2} className={fillClass} />
      <polygon
        points={`${cx},${y - roofH} ${x - 2},${y} ${x + w + 2},${y}`}
        className={roofClass}
      />
      {/* door */}
      <rect
        x={cx - w * 0.14}
        y={y + h * 0.55}
        width={w * 0.28}
        height={h * 0.45}
        rx={1}
        fill="rgba(255,255,255,0.4)"
      />
    </g>
  )
}

// ─── school icon ─────────────────────────────────────────────────────────────

function SchoolGlyph({ cx, cy, size = 18 }: { cx: number; cy: number; size?: number }) {
  const w = size
  const h = size * 0.85
  const x = cx - w / 2
  const y = cy - h / 2
  const flagH = size * 0.28
  return (
    <g>
      {/* body — orange for school */}
      <rect x={x} y={y} width={w} height={h} rx={2} className="fill-qupu-brand-orange" />
      {/* roof */}
      <polygon
        points={`${cx},${y - size * 0.38} ${x - 2},${y} ${x + w + 2},${y}`}
        className="fill-qupu-peach"
      />
      {/* flag pole */}
      <line
        x1={cx}
        y1={y - size * 0.38}
        x2={cx}
        y2={y - size * 0.38 - flagH}
        stroke={INK}
        strokeWidth={1.2}
      />
      {/* flag */}
      <polygon
        points={`${cx},${y - size * 0.38 - flagH} ${cx + size * 0.35},${y - size * 0.38 - flagH * 0.65} ${cx},${y - size * 0.38 - flagH * 0.3}`}
        className="fill-qupu-brand-orange"
      />
      {/* door */}
      <rect
        x={cx - w * 0.14}
        y={y + h * 0.55}
        width={w * 0.28}
        height={h * 0.45}
        rx={1}
        fill="rgba(255,255,255,0.4)"
      />
    </g>
  )
}

// ─── PeggyMap23G2 primitive ───────────────────────────────────────────────────

export interface PeggyMap23G2Props {
  /**
   * When true, the animator overlays the REVERSE route (N → SE → E) on the map
   * in a contrasting colour. Default false = plain problem setup only.
   */
  highlightReverse?: boolean
}

/**
 * Draws the Peggy-walks-to-school map. With `highlightReverse={false}` (the
 * default) it shows only the forward route (W → NW → S); with
 * `highlightReverse={true}` it additionally overlays the reverse legs (N → SE → E)
 * in orange, for use by the animator post-answer.
 */
export function PeggyMap23G2({ highlightReverse = false }: PeggyMap23G2Props = {}) {
  // Midpoints for direction labels along each leg.
  const mid1 = { x: (HOME_X + P1_X) / 2, y: (HOME_Y + P1_Y) / 2 }
  const mid2 = { x: (P1_X + P2_X) / 2,   y: (P1_Y + P2_Y) / 2 }
  const mid3 = { x: (P2_X + SCHOOL_X) / 2, y: (P2_Y + SCHOOL_Y) / 2 }

  return (
    <svg
      viewBox={`-${PAD} -${PAD} ${VB_W} ${VB_H}`}
      width={Math.min(340, VB_W)}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {/* ── road segments (forward route) ──────────────────────────────────── */}
      {/* Leg 1: Home → P1 (West) */}
      <line
        x1={HOME_X} y1={HOME_Y}
        x2={P1_X}   y2={P1_Y}
        stroke={ROAD}
        strokeWidth={ROAD_W}
        strokeLinecap="round"
      />
      {/* Leg 2: P1 → P2 (Northwest) */}
      <line
        x1={P1_X} y1={P1_Y}
        x2={P2_X} y2={P2_Y}
        stroke={ROAD}
        strokeWidth={ROAD_W}
        strokeLinecap="round"
      />
      {/* Leg 3: P2 → School (South) */}
      <line
        x1={P2_X}     y1={P2_Y}
        x2={SCHOOL_X} y2={SCHOOL_Y}
        stroke={ROAD}
        strokeWidth={ROAD_W}
        strokeLinecap="round"
      />

      {/* ── reverse-route overlay (animator only) ──────────────────────────── */}
      {highlightReverse && (
        <g opacity={0.85}>
          {/* Reverse leg 1: School → P2 (North) — drawn offset slightly */}
          <line
            x1={SCHOOL_X + 5} y1={SCHOOL_Y}
            x2={P2_X + 5}     y2={P2_Y}
            strokeWidth={ROAD_W}
            strokeLinecap="round"
            className="stroke-qupu-brand-orange"
          />
          {/* Reverse leg 2: P2 → P1 (Southeast) */}
          <line
            x1={P2_X + 5} y1={P2_Y}
            x2={P1_X + 5} y2={P1_Y}
            strokeWidth={ROAD_W}
            strokeLinecap="round"
            className="stroke-qupu-brand-orange"
          />
          {/* Reverse leg 3: P1 → Home (East) */}
          <line
            x1={P1_X}   y1={P1_Y - 5}
            x2={HOME_X} y2={HOME_Y - 5}
            strokeWidth={ROAD_W}
            strokeLinecap="round"
            className="stroke-qupu-brand-orange"
          />
        </g>
      )}

      {/* ── direction labels on each forward leg ───────────────────────────── */}
      {/* "W" above leg 1 */}
      <text
        x={mid1.x}
        y={mid1.y - 10}
        textAnchor="middle"
        fontSize={13}
        fontWeight="700"
        fill={INK}
      >
        W
      </text>
      {/* "NW" to the right of leg 2 */}
      <text
        x={mid2.x + 12}
        y={mid2.y - 4}
        textAnchor="start"
        fontSize={13}
        fontWeight="700"
        fill={INK}
      >
        NW
      </text>
      {/* "S" to the right of leg 3 */}
      <text
        x={mid3.x + 10}
        y={mid3.y}
        textAnchor="start"
        dominantBaseline="central"
        fontSize={13}
        fontWeight="700"
        fill={INK}
      >
        S
      </text>
      {/* "200 m" label on the south leg */}
      <text
        x={mid3.x + 10}
        y={mid3.y + 16}
        textAnchor="start"
        dominantBaseline="central"
        fontSize={11}
        fill={INK}
      >
        200 m
      </text>

      {/* ── arrow heads on each forward leg ────────────────────────────────── */}
      {/* Arrow on leg 1 (→ west, so pointing left) */}
      <polygon
        points={`${P1_X},${P1_Y - 5} ${P1_X},${P1_Y + 5} ${P1_X - 10},${P1_Y}`}
        fill={ROAD}
      />
      {/* Arrow on leg 2 (→ northwest) */}
      {(() => {
        const angle = Math.atan2(P2_Y - P1_Y, P2_X - P1_X)
        const tip = { x: P2_X, y: P2_Y }
        const back1 = {
          x: tip.x - Math.cos(angle - 0.3) * 12,
          y: tip.y - Math.sin(angle - 0.3) * 12,
        }
        const back2 = {
          x: tip.x - Math.cos(angle + 0.3) * 12,
          y: tip.y - Math.sin(angle + 0.3) * 12,
        }
        return (
          <polygon
            points={`${tip.x},${tip.y} ${back1.x},${back1.y} ${back2.x},${back2.y}`}
            fill={ROAD}
          />
        )
      })()}
      {/* Arrow on leg 3 (→ south, pointing down) */}
      <polygon
        points={`${SCHOOL_X - 5},${SCHOOL_Y} ${SCHOOL_X + 5},${SCHOOL_Y} ${SCHOOL_X},${SCHOOL_Y + 10}`}
        fill={ROAD}
      />

      {/* ── journey start / end markers ─────────────────────────────────────── */}
      {/* Home icon */}
      <HouseGlyph cx={HOME_X} cy={HOME_Y} size={22} />
      <text
        x={HOME_X + 16}
        y={HOME_Y}
        textAnchor="start"
        dominantBaseline="central"
        fontSize={13}
        fontWeight="700"
        fill={INK}
      >
        Rumah
      </text>

      {/* School icon */}
      <SchoolGlyph cx={SCHOOL_X} cy={SCHOOL_Y} size={22} />
      <text
        x={SCHOOL_X + 16}
        y={SCHOOL_Y}
        textAnchor="start"
        dominantBaseline="central"
        fontSize={13}
        fontWeight="700"
        fill={INK}
      >
        Sekolah
      </text>

      {/* ── compass rose ────────────────────────────────────────────────────── */}
      {/* outer circle */}
      <circle
        cx={CX}
        cy={CY}
        r={CR}
        fill="white"
        className="stroke-qupu-brand-blue-shadow"
        strokeWidth={1.5}
        opacity={0.85}
      />

      {/* eight spokes */}
      {COMPASS_POINTS.map(({ angle, major }) => {
        const inner = compassPt(angle, major ? 6 : 4)
        const outer = compassPt(angle, CR - 4)
        return (
          <line
            key={`spoke-${angle}`}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke={major ? INK : '#9CA3AF'}
            strokeWidth={major ? 1.6 : 1}
            strokeLinecap="round"
          />
        )
      })}

      {/* N/S/E/W four-point arrowheads */}
      {([0, 90, 180, 270] as const).map((bearing) => {
        const tip  = compassPt(bearing, CR - 2)
        const wing = compassPt(bearing + 90, 5)
        const wng2 = compassPt(bearing - 90, 5)
        const base = compassPt(bearing, CR - 11)
        return (
          <polygon
            key={`arrow-${bearing}`}
            points={`${tip.x},${tip.y} ${wing.x},${wing.y} ${base.x},${base.y} ${wng2.x},${wng2.y}`}
            className={bearing === 0 ? 'fill-qupu-brand-blue' : 'fill-qupu-shell'}
            stroke={INK}
            strokeWidth={0.8}
          />
        )
      })}

      {/* centre dot */}
      <circle cx={CX} cy={CY} r={3} fill={INK} />

      {/* direction labels */}
      {COMPASS_POINTS.map(({ label, angle }) => {
        const r_lbl = CR + 12
        const pt = compassPt(angle, r_lbl)
        return (
          <text
            key={`lbl-${label}`}
            x={pt.x}
            y={pt.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={label.length > 1 ? 9 : 11}
            fontWeight="700"
            fill={INK}
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}

// ─── default export: plain illustration ──────────────────────────────────────

/**
 * Default illustration — draws only the problem setup: the three-leg route from
 * Rumah (home) to Sekolah (school) going W → NW → S, plus a compass rose. The
 * return-route answer (N → SE → E) is NOT shown here.
 *
 * Accepts `params: unknown` (ignored) to satisfy the standard illustration
 * signature.
 */
export default function PeggyMap23G2Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Peta perjalanan Peggy: dari Rumah ia berjalan ke arah Barat (W), ' +
        'lalu berbelok ke Barat Laut (NW), kemudian ke arah Selatan (S) sejauh 200 m sampai di Sekolah. ' +
        'Mawar angin delapan arah ditampilkan di pojok kanan bawah.'
      }
    >
      <PeggyMap23G2 />
    </div>
  )
}
