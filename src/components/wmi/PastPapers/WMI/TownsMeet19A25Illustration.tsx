// SEAMO-19-A-Q25 — "Two vehicles travel toward each other; find meeting time."
//
// Stem figure: a horizontal road with Town A (left) and Town B (right).
// A yellow truck (cab + red cargo box) starts at Town A and drives right (→).
// A black sedan starts at Town B and drives left (←).
// Direction arrows show each vehicle's heading; the stem NEVER shows the
// meeting point (that is the explainer's job).
//
// Co-exported primitive: TownsMeetRoad — the road + both vehicles at arbitrary
// fractional positions along [0, 1], re-used by TownsMeet19A25Explainer.
//
// Copy-adapted from CarsLane9ECIllustration (road strip, direction indicators)
// with bespoke truck + sedan glyphs matching the scan (2019.imgs/008.jpg).
//
// Pure render — no Math.random, no Date.now, SSR-safe.

const INK = '#1F2937'
const ROAD_BG = '#F1F5F9'   // light slate road surface
const ROAD_EDGE = '#94A3B8'  // slate border

// ── geometry ────────────────────────────────────────────────────────────────
export const SVG_W = 400
export const SVG_H = 120

const ROAD_Y = 38            // top of road strip
const ROAD_H = 46            // height of road strip
const PAD_X = 32             // horizontal margin before Town A / after Town B
const ROAD_X1 = PAD_X       // left edge of road segment
const ROAD_X2 = SVG_W - PAD_X // right edge
const ROAD_CY = ROAD_Y + ROAD_H / 2  // vertical centre of road

// Vehicle sizes
const TRUCK_W = 54           // total width: cab 20 + box 34
const TRUCK_H = 24
const CAR_W = 40
const CAR_H = 22

// ── glyphs ──────────────────────────────────────────────────────────────────

/**
 * A simplified side-view truck (cab left, cargo box right), facing right.
 * For the explainer the truck travels right, so it always faces right;
 * the mirrored version (scaleX -1) is not needed for the stem or explainer.
 *
 * cx / cy = centre of the whole vehicle.
 */
function Truck({ cx, cy }: { cx: number; cy: number }) {
  const half = TRUCK_W / 2
  const hh = TRUCK_H / 2
  const boxW = 34
  const cabW = TRUCK_W - boxW
  const boxX = cx - half           // box starts at left
  const cabX = boxX + boxW         // cab is right of the box (truck faces right)
  const topY = cy - hh
  const baseY = cy + hh

  const wheelR = 4
  const wheel1X = boxX + boxW * 0.3
  const wheel2X = boxX + boxW * 0.75
  const wheel3X = cabX + cabW * 0.5
  const wheelY = baseY - wheelR * 0.6

  return (
    <g>
      {/* cargo box — red/orange */}
      <rect
        x={boxX}
        y={topY}
        width={boxW}
        height={TRUCK_H}
        rx={2}
        fill="#F87171"
        stroke="#DC2626"
        strokeWidth={1.5}
      />
      {/* cab — yellow */}
      <rect
        x={cabX}
        y={topY + 4}
        width={cabW}
        height={TRUCK_H - 4}
        rx={3}
        fill="#FCD34D"
        stroke="#D97706"
        strokeWidth={1.5}
      />
      {/* cab windscreen */}
      <rect
        x={cabX + 3}
        y={topY + 7}
        width={cabW - 5}
        height={TRUCK_H - 14}
        rx={2}
        fill="#BAE6FD"
        stroke="#7DD3FC"
        strokeWidth={1}
        opacity={0.85}
      />
      {/* wheels */}
      {[wheel1X, wheel2X, wheel3X].map((wx, i) => (
        <circle key={i} cx={wx} cy={wheelY} r={wheelR} fill="#374151" stroke="#1F2937" strokeWidth={1} />
      ))}
    </g>
  )
}

/**
 * A simple side-view sedan, facing left (← direction).
 *
 * cx / cy = centre of the whole vehicle.
 */
function Sedan({ cx, cy }: { cx: number; cy: number }) {
  const half = CAR_W / 2
  const hh = CAR_H / 2
  const topY = cy - hh
  const baseY = cy + hh

  const wheelR = 4
  const wheel1X = cx - half + CAR_W * 0.25
  const wheel2X = cx - half + CAR_W * 0.75
  const wheelY = baseY - wheelR * 0.6

  return (
    <g>
      {/* body */}
      <rect
        x={cx - half}
        y={topY + 5}
        width={CAR_W}
        height={CAR_H - 5}
        rx={3}
        fill="#374151"
        stroke="#111827"
        strokeWidth={1.5}
      />
      {/* roof cabin */}
      <rect
        x={cx - half + 6}
        y={topY}
        width={CAR_W - 12}
        height={10}
        rx={5}
        fill="#374151"
        stroke="#111827"
        strokeWidth={1.5}
      />
      {/* windscreens */}
      <rect
        x={cx - half + 7}
        y={topY + 1}
        width={10}
        height={8}
        rx={2}
        fill="#BAE6FD"
        opacity={0.75}
      />
      <rect
        x={cx + half - 17}
        y={topY + 1}
        width={10}
        height={8}
        rx={2}
        fill="#BAE6FD"
        opacity={0.75}
      />
      {/* wheels */}
      {[wheel1X, wheel2X].map((wx, i) => (
        <circle key={i} cx={wx} cy={wheelY} r={wheelR} fill="#374151" stroke="#1F2937" strokeWidth={1} />
      ))}
    </g>
  )
}

/** Solid arrowhead pointing in dir at (cx, cy). */
function Arrowhead({ cx, cy, dir }: { cx: number; cy: number; dir: 'left' | 'right' }) {
  const hw = 7
  const hh = 5
  const pts =
    dir === 'right'
      ? `${cx + hw},${cy} ${cx - hw * 0.3},${cy - hh} ${cx - hw * 0.3},${cy + hh}`
      : `${cx - hw},${cy} ${cx + hw * 0.3},${cy - hh} ${cx + hw * 0.3},${cy + hh}`
  return <polygon points={pts} fill="#475569" />
}

// ── shared road primitive ────────────────────────────────────────────────────

export interface TownsMeetRoadProps {
  /**
   * Truck fractional position along the road [0 = Town A, 1 = Town B].
   * At 0 the truck sits at the Town A end.
   */
  truckFrac?: number
  /**
   * Sedan fractional position along the road [0 = Town A, 1 = Town B].
   * At 1 the sedan sits at the Town B end.
   */
  sedanFrac?: number
  /** Show the distance label on the road. */
  showDistance?: boolean
  /** Show the meeting marker (vertical dashed line at truckFrac when equal to sedanFrac). */
  showMeet?: boolean
  /** Optional progress arrow count (not used in the static stem). */
  lang?: 'en' | 'id'
}

/**
 * Road strip with truck (Town A side) + sedan (Town B side) at arbitrary
 * fractional positions, reusable by both the stem and the explainer.
 *
 * Emits a root `<svg>` — import and render directly.
 */
export function TownsMeetRoad({
  truckFrac = 0,
  sedanFrac = 1,
  showDistance = false,
  showMeet = false,
  lang = 'en',
}: TownsMeetRoadProps) {
  const truckCX = ROAD_X1 + (ROAD_X2 - ROAD_X1) * truckFrac
  const sedanCX = ROAD_X1 + (ROAD_X2 - ROAD_X1) * sedanFrac
  const meetX = (truckCX + sedanCX) / 2

  const labelDist = lang === 'id' ? '650 km' : '650 km'
  const labelA = lang === 'id' ? 'Kota A' : 'Town A'
  const labelB = lang === 'id' ? 'Kota B' : 'Town B'

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── road strip ── */}
      <rect
        x={ROAD_X1}
        y={ROAD_Y}
        width={ROAD_X2 - ROAD_X1}
        height={ROAD_H}
        fill={ROAD_BG}
        stroke={ROAD_EDGE}
        strokeWidth={1.5}
      />
      {/* centre dashed divider */}
      <line
        x1={ROAD_X1 + 8}
        y1={ROAD_CY}
        x2={ROAD_X2 - 8}
        y2={ROAD_CY}
        stroke={ROAD_EDGE}
        strokeWidth={1.5}
        strokeDasharray="10 7"
        strokeLinecap="round"
      />

      {/* ── town labels below the road ── */}
      <text
        x={ROAD_X1}
        y={ROAD_Y + ROAD_H + 14}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill={INK}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {labelA}
      </text>
      <text
        x={ROAD_X2}
        y={ROAD_Y + ROAD_H + 14}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill={INK}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {labelB}
      </text>

      {/* ── distance label on road (optional) ── */}
      {showDistance && (
        <text
          x={SVG_W / 2}
          y={ROAD_Y - 8}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill="#64748B"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {labelDist}
        </text>
      )}

      {/* ── truck with right-pointing arrow ── */}
      <Truck cx={truckCX} cy={ROAD_Y + 16} />
      {/* arrow above truck */}
      <line
        x1={truckCX + TRUCK_W / 2 + 2}
        y1={ROAD_Y + 10}
        x2={truckCX + TRUCK_W / 2 + 14}
        y2={ROAD_Y + 10}
        stroke="#475569"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Arrowhead cx={truckCX + TRUCK_W / 2 + 14} cy={ROAD_Y + 10} dir="right" />

      {/* ── sedan with left-pointing arrow ── */}
      <Sedan cx={sedanCX} cy={ROAD_Y + ROAD_H - 16} />
      {/* arrow above sedan */}
      <line
        x1={sedanCX - CAR_W / 2 - 2}
        y1={ROAD_CY + 4}
        x2={sedanCX - CAR_W / 2 - 14}
        y2={ROAD_CY + 4}
        stroke="#475569"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Arrowhead cx={sedanCX - CAR_W / 2 - 14} cy={ROAD_CY + 4} dir="left" />

      {/* ── meeting marker (dashed vertical line) ── */}
      {showMeet && (
        <line
          x1={meetX}
          y1={ROAD_Y - 2}
          x2={meetX}
          y2={ROAD_Y + ROAD_H + 2}
          stroke="#10B981"
          strokeWidth={2}
          strokeDasharray="4 3"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

// ── default export: static stem ───────────────────────────────────────────────

const ARIA_EN =
  'Road between Town A (left) and Town B (right), 650 km apart. ' +
  'A yellow truck with red cargo box starts at Town A, arrow pointing right. ' +
  'A black car starts at Town B, arrow pointing left. They travel toward each other.'

const ARIA_ID =
  'Jalan antara Kota A (kiri) dan Kota B (kanan), berjarak 650 km. ' +
  'Sebuah truk kuning dengan boks merah berangkat dari Kota A, panah ke kanan. ' +
  'Sebuah mobil hitam berangkat dari Kota B, panah ke kiri. Keduanya bergerak saling mendekat.'

export default function TownsMeet19A25Illustration({ lang = 'en' }: { lang?: 'en' | 'id' }) {
  const aria = lang === 'id' ? ARIA_ID : ARIA_EN
  return (
    <div className="my-4 flex flex-col items-center" role="img" aria-label={aria}>
      <TownsMeetRoad lang={lang} showDistance />
    </div>
  )
}
