/**
 * WMI-22F1A-Q23 — Soldier Road puzzle illustration (Grade 1).
 *
 * Source figure: db/seed/wmi/figures/2022-final-g1-a-q23.jpg (bottom row).
 *
 * A brown road has ONE deep hole. The hole is DEEP — it needs TWO stacked
 * soldiers to reach the road surface (depth = 2 soldier heights). A red dashed
 * horizontal line halfway down the hole marks the "one soldier deep" level.
 * Soldiers 1, 2, 3, 4 march LEFT along the road (blue left-pointing arrow),
 * with soldier 1 leading (closest to the hole).
 *
 * This file also exports `SoldierRoad`, a reusable primitive the animator can
 * import to show soldiers dropping in, stacking, marching over, and climbing
 * out the back.
 *
 * MECHANISM (for the animator — the static figure shows only the start state):
 *   1 then 2 drop into the deep hole (1 at the bottom, 2 stacked on top → fills
 *   it). 3 and 4 march over the top. The two in the hole climb out and join the
 *   BACK of the line, the TOP one first → 2 climbs out before 1.
 *   Final order (front → back, i.e. left → right): 3, 4, 2, 1 → "3421".
 *
 * Pure render — no Math.random, no Date, no useState/useEffect side effects.
 * SSR-safe and deterministic.
 */

// ─── Colours ─────────────────────────────────────────────────────────────────

/** Road tan/brown matching #c8a06e from the source figure. */
export const ROAD_FILL = '#c8a06e'
export const ROAD_STROKE = '#a07040'

/** Hole interior is white (empty). */
const HOLE_FILL = '#ffffff'
const HOLE_STROKE = '#a07040'

/** Dashed depth line: red (#e03030) from the figure. */
export const DEPTH_DASH_COLOR = '#e03030'

/** Soldier green fill (#2ea84e-ish) and outline. */
export const SOLDIER_FILL = '#2ea84e'
export const SOLDIER_OUTLINE = '#1d7235'
const SOLDIER_TEXT = '#ffffff'

/** Blue arrow (#3396e8-ish). */
const ARROW_COLOR = '#3396e8'

/** Caption text colour on the road. */
const LABEL_TEXT = '#1f2937'

// ─── Layout ──────────────────────────────────────────────────────────────────

/** The SVG canvas size. Give generous headroom so nothing clips. */
export const VIEW_W = 480
export const VIEW_H = 210

/** Road band: it fills the lower portion of the canvas. */
const ROAD_TOP = 70 // y-coordinate where the road surface begins
const ROAD_BOTTOM = VIEW_H - 10 // y-coordinate of the road bottom
const ROAD_HEIGHT = ROAD_BOTTOM - ROAD_TOP // 130

/** Hole geometry. A single deep hole, depth = 2 soldier heights. */
const HOLE_WIDTH = 64
const HOLE_HEIGHT = 96 // 2× soldier height — deep enough for 2 stacked soldiers
const HOLE_TOP = ROAD_TOP // hole opens at road surface

/** Midpoint dashed line is at half the hole height — marks "1 soldier depth". */
const DEPTH_LINE_Y = HOLE_TOP + HOLE_HEIGHT / 2

/** x-center of the single deep hole. */
export const HOLE_CX = 188

/** Soldier body geometry — rounded torso with a head circle on top. */
export const SOLDIER_BODY_R = 18 // half-width of body rectangle
export const SOLDIER_BODY_H = 30 // height of the rectangular torso
export const SOLDIER_HEAD_R = 11 // head circle radius

// Total soldier height (head top to feet): 2*headR + bodyH = 22 + 30 = 52
export const SOLDIER_HEIGHT = 2 * SOLDIER_HEAD_R + SOLDIER_BODY_H // 52

/** Spacing + start for soldiers standing on the road to the right of the hole. */
const SOLDIER_SPACING = 50
/** Centre x of the leftmost road-standing soldier (closest to the hole). */
const SOLDIERS_START_X = 280

// ─── Primitive: SoldierGlyph ─────────────────────────────────────────────────

/**
 * A single green soldier icon at a given position.
 * `cx` = horizontal centre; `feetY` = y-coordinate of the bottom of the feet.
 */
export function SoldierGlyph({
  cx,
  feetY,
  label,
  opacity = 1,
}: {
  cx: number
  feetY: number
  label: number
  opacity?: number
}) {
  const headCY = feetY - SOLDIER_BODY_H - SOLDIER_HEAD_R
  const bodyTop = feetY - SOLDIER_BODY_H
  return (
    <g opacity={opacity}>
      {/* torso — rounded rectangle */}
      <rect
        x={cx - SOLDIER_BODY_R}
        y={bodyTop}
        width={SOLDIER_BODY_R * 2}
        height={SOLDIER_BODY_H}
        rx={8}
        fill={SOLDIER_FILL}
        stroke={SOLDIER_OUTLINE}
        strokeWidth={2}
      />
      {/* head */}
      <circle
        cx={cx}
        cy={headCY}
        r={SOLDIER_HEAD_R}
        fill={SOLDIER_FILL}
        stroke={SOLDIER_OUTLINE}
        strokeWidth={2}
      />
      {/* number label — centred on the torso vertically */}
      <text
        x={cx}
        y={bodyTop + SOLDIER_BODY_H / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight={800}
        fill={SOLDIER_TEXT}
      >
        {label}
      </text>
    </g>
  )
}

// ─── Primitive: SoldierRoad ───────────────────────────────────────────────────

export interface SoldierRoadProps {
  /**
   * Soldier numbers standing ON the road, in left → right order. The leftmost
   * entry sits closest to the hole. Soldiers are laid out marching toward the
   * hole from the right.
   */
  onRoad?: number[]
  /**
   * Soldier numbers currently INSIDE the deep hole, in bottom → top order.
   * `inHole[0]` rests at the bottom, `inHole[1]` is stacked on its shoulders
   * (reaching road level). A 2-deep hole holds at most two.
   */
  inHole?: number[]
  /** Optional caption text shown on the road (e.g. the final "3421"). */
  label?: string
  /** Whether to show the leftward blue arrow (hide when animation complete). */
  showArrow?: boolean
}

/**
 * SoldierRoad — draws the road, the single deep hole, soldiers standing on the
 * road and soldiers stacked inside the hole, plus an optional road caption.
 *
 * Returns a `<g>` fragment; wrap in an `<svg>` with the correct viewBox.
 * The animator imports this and drives `onRoad` / `inHole` / `label` per step.
 *
 * - `onRoad`: soldier numbers on the road, left → right (leftmost nearest hole).
 * - `inHole`: soldier numbers in the hole, bottom → top.
 * - `label`: caption text drawn on the road surface.
 */
export function SoldierRoad({
  onRoad = [1, 2, 3, 4],
  inHole = [],
  label,
  showArrow = true,
}: SoldierRoadProps) {
  // feetY for a soldier standing on the road surface.
  const roadFeetY = ROAD_TOP

  // feetY of a soldier inside the hole at a given stack level.
  //   level 0 = bottom of hole, level 1 = standing on the level-0 soldier.
  const holeStackFeetY = (stackLevel: number) =>
    HOLE_TOP + HOLE_HEIGHT - stackLevel * SOLDIER_HEIGHT

  // The hole is "occupied" (dim the depth line) once anyone is inside.
  const holeOccupied = inHole.length >= 1

  // Lay road soldiers out marching toward the hole from the right.
  // index 0 (leftmost / front) sits at SOLDIERS_START_X.
  const roadX = (idx: number) => SOLDIERS_START_X + idx * SOLDIER_SPACING

  return (
    <g>
      {/* ── full road band ──────────────────────────────────────────────── */}
      <rect
        x={0}
        y={ROAD_TOP}
        width={VIEW_W}
        height={ROAD_HEIGHT}
        fill={ROAD_FILL}
        stroke={ROAD_STROKE}
        strokeWidth={1.5}
      />

      {/* ── deep hole — white cutout with border ────────────────────────── */}
      <rect
        x={HOLE_CX - HOLE_WIDTH / 2}
        y={HOLE_TOP}
        width={HOLE_WIDTH}
        height={HOLE_HEIGHT}
        fill={HOLE_FILL}
        stroke={HOLE_STROKE}
        strokeWidth={2}
      />
      {/* depth dashed line — halfway down (one soldier deep) */}
      <line
        x1={HOLE_CX - HOLE_WIDTH / 2 + 3}
        y1={DEPTH_LINE_Y}
        x2={HOLE_CX + HOLE_WIDTH / 2 - 3}
        y2={DEPTH_LINE_Y}
        stroke={DEPTH_DASH_COLOR}
        strokeWidth={2.5}
        strokeDasharray="6 4"
        opacity={holeOccupied ? 0.35 : 1}
      />

      {/* ── soldiers inside the hole (bottom → top) ──────────────────────── */}
      {inHole.map((n, level) => (
        <SoldierGlyph
          key={`hole-${n}`}
          cx={HOLE_CX}
          feetY={holeStackFeetY(level)}
          label={n}
        />
      ))}

      {/* ── soldiers standing on the road (left → right) ─────────────────── */}
      {onRoad.map((n, idx) => (
        <SoldierGlyph key={`road-${n}`} cx={roadX(idx)} feetY={roadFeetY} label={n} />
      ))}

      {/* ── optional road caption (e.g. final "3421") ────────────────────── */}
      {label && (
        <text
          x={HOLE_CX}
          y={ROAD_TOP + ROAD_HEIGHT / 2 + 6}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={36}
          fontWeight={800}
          letterSpacing={4}
          fill={LABEL_TEXT}
        >
          {label}
        </text>
      )}

      {/* ── blue left-pointing arrow above the marching line ─────────────── */}
      {showArrow && (
        <g>
          {/* arrow shaft */}
          <line
            x1={SOLDIERS_START_X - 14}
            y1={ROAD_TOP - 34}
            x2={SOLDIERS_START_X - 80}
            y2={ROAD_TOP - 34}
            stroke={ARROW_COLOR}
            strokeWidth={14}
            strokeLinecap="round"
          />
          {/* arrowhead pointing left */}
          <polygon
            points={`${SOLDIERS_START_X - 100},${ROAD_TOP - 34} ${SOLDIERS_START_X - 72},${ROAD_TOP - 50} ${SOLDIERS_START_X - 72},${ROAD_TOP - 18}`}
            fill={ARROW_COLOR}
          />
        </g>
      )}
    </g>
  )
}

// ─── SAMPLE fallback (for preview when params is absent) ─────────────────────

interface SoldierRoadParams {
  _unused?: unknown
}

const SAMPLE: SoldierRoadParams = {}

// ─── Main illustration (default export) ──────────────────────────────────────

/**
 * SoldierRoad22G1Illustration
 *
 * Shows the START state of the puzzle: a brown road with ONE deep hole and four
 * soldiers 1, 2, 3, 4 lined up to the right with a blue left-pointing arrow.
 * The hole has a red dashed depth line halfway down, showing it needs TWO
 * soldiers stacked to reach road level.
 *
 * Does NOT reveal the final order (3421) — that is the animator's job.
 *
 * `params` is accepted but unused (the puzzle setup is fully fixed).
 */
export default function SoldierRoad22G1Illustration({ params }: { params: unknown }) {
  // Defensive narrowing — params unused but accepted per the standard signature.
  void ((params ?? {}) as Partial<SoldierRoadParams> ?? SAMPLE)

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Jalan cokelat dengan satu lubang dalam (kedalaman 2 tentara). ' +
        'Garis merah putus-putus di tengah lubang menunjukkan dibutuhkan dua tentara bertumpuk untuk mencapai permukaan jalan. ' +
        'Tentara bernomor 1, 2, 3, 4 berbaris ke kiri menuju lubang, dengan tentara 1 di depan; panah biru menunjuk ke kiri.'
      }
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width={Math.min(420, VIEW_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <SoldierRoad onRoad={[1, 2, 3, 4]} inHole={[]} showArrow />
      </svg>
    </div>
  )
}
