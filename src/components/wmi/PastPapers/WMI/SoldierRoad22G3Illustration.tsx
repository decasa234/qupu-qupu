/**
 * WMI-22F3A-Q23 — Soldier Road puzzle illustration.
 *
 * Source figure: db/seed/wmi/figures/2022-final-g3-a-q23.jpg (bottom row).
 *
 * A brown road has TWO deep holes. Each hole requires TWO stacked soldiers to
 * fill (depth = 2 soldier heights). Soldiers 1–5 stand on the road to the
 * right, with a blue left-pointing arrow showing they approach from the right.
 * A red dashed horizontal line partway down each hole shows the halfway depth.
 *
 * This file also exports `SoldierRoad`, a reusable primitive the animator can
 * import to show soldiers dropping in, stacking, and climbing out.
 *
 * MECHANISM (for the animator — the static figure shows only the start state):
 *   Hole A = rightmost hole, Hole B = leftmost hole (soldiers reach B second).
 *   1,2 drop into Hole A (fill it); 3,4,5 cross over.
 *   3,4 drop into Hole B (fill it); 5 crosses over.
 *   Hole A: top soldier=2 climbs out first, then 1. → ...2, 1
 *   Hole B: top soldier=4 climbs out first, then 3. → ...4, 3
 *   Final order (left to right): 5, 2, 1, 4, 3.
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

// ─── Layout ──────────────────────────────────────────────────────────────────

/** The SVG canvas size. Give generous headroom so nothing clips. */
export const VIEW_W = 500
export const VIEW_H = 210

/** Road band: it fills the lower portion of the canvas. */
const ROAD_TOP = 70       // y-coordinate where the road surface begins
const ROAD_BOTTOM = VIEW_H - 10  // y-coordinate of the road bottom
const ROAD_HEIGHT = ROAD_BOTTOM - ROAD_TOP  // 130

/** Hole geometry. Each hole is centered at specific x positions. */
const HOLE_WIDTH = 64
const HOLE_HEIGHT = 96  // 2× soldier height = deep enough for 2 stacked soldiers
const HOLE_TOP = ROAD_TOP  // holes open at road surface

/** Midpoint dashed line is at half the hole height — marks "1 soldier depth". */
const DEPTH_LINE_Y = HOLE_TOP + HOLE_HEIGHT / 2

/** x-centers of the two holes (left hole = Hole B, right hole = Hole A). */
export const HOLE_B_CX = 128   // left hole (second to fill)
export const HOLE_A_CX = 264   // right hole (first to fill)

/** Soldier body geometry — circle with rounded head on top. */
export const SOLDIER_BODY_R = 20    // half-width of body rectangle / radius of head
export const SOLDIER_BODY_H = 32    // height of the rectangular torso
export const SOLDIER_HEAD_R = 12    // head circle radius

// Total soldier height (head top to body bottom):
//   head diameter + torso = 2*headR + bodyH = 24 + 32 = 56
export const SOLDIER_HEIGHT = 2 * SOLDIER_HEAD_R + SOLDIER_BODY_H  // 56

/** Positions of the 5 soldiers on the road surface to the right (road-standing). */
const SOLDIER_SPACING = 44
const SOLDIERS_START_X = 340  // centre of soldier 1 (rightmost, closest to holes)
// Soldiers are labelled 1..5, soldier 1 is rightmost → leads into hole first.
// In the figure soldiers appear left-to-right as 1,2,3,4,5 with 1 at the front.

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
      {/* number label — centered on the torso vertically */}
      <text
        x={cx}
        y={bodyTop + SOLDIER_BODY_H / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={15}
        fontWeight={800}
        fill={SOLDIER_TEXT}
      >
        {label}
      </text>
    </g>
  )
}

// ─── Primitive: SoldierRoad ───────────────────────────────────────────────────

/** State of one soldier: on the road or inside a specific hole at a stack level. */
export interface SoldierPosition {
  /** Soldier number label (1–5). */
  label: number
  /**
   * Where the soldier is:
   * - `'road-right'`: approaching from the right at their natural road position
   * - `'road-left'`: past the holes, on the left portion of the road
   * - `'holeA'`: inside Hole A (right hole), at `stackLevel` (0 = bottom, 1 = top)
   * - `'holeB'`: inside Hole B (left hole), at `stackLevel` (0 = bottom, 1 = top)
   * - `'gone'`: crossed the road, no longer visible
   */
  location: 'road-right' | 'road-left' | 'holeA' | 'holeB' | 'gone'
  /**
   * Stack level inside a hole: 0 = bottom (soldier is at the deepest level),
   * 1 = top (soldier stands on the shoulders of level-0 soldier, reaches road level).
   * Only meaningful when location is 'holeA' or 'holeB'.
   */
  stackLevel?: 0 | 1
  /**
   * Override x position when location is 'road-right' or 'road-left'.
   * If not provided, default spacing from SOLDIERS_START_X is used.
   */
  overrideX?: number
}

/** Fill state of each hole (for drawing the depth line dimmer when filled). */
export interface HoleFillState {
  holeA: 0 | 1 | 2   // 0 = empty, 1 = one soldier, 2 = full
  holeB: 0 | 1 | 2
}

export interface SoldierRoadProps {
  /**
   * Array of soldier positions the animator controls.
   * Defaults to the initial state: all 5 soldiers standing on the road to the right.
   */
  soldiers?: SoldierPosition[]
  /** Current fill state of the two holes. */
  holeFill?: HoleFillState
  /** Whether to show the leftward blue arrow (hide when animation complete). */
  showArrow?: boolean
}

/**
 * SoldierRoad — draws the road, both holes, and soldiers at their given positions.
 *
 * Pure SVG `<g>` fragment; wrap in an `<svg>` with the correct viewBox.
 * The animator imports this and drives `soldiers` + `holeFill` per step.
 *
 * Exported so the animator can import it directly.
 */
export function SoldierRoad({
  soldiers = DEFAULT_SOLDIERS,
  holeFill = { holeA: 0, holeB: 0 },
  showArrow = true,
}: SoldierRoadProps) {
  // ── helpers ────────────────────────────────────────────────────────────────


  /**
   * Compute the feetY of a soldier inside a hole at a given stack level.
   * Level 0 = bottom of hole. Level 1 = standing on top of level-0 soldier.
   */
  const holeStackFeetY = (stackLevel: 0 | 1) =>
    HOLE_TOP + HOLE_HEIGHT - stackLevel * SOLDIER_HEIGHT

  /**
   * feetY for a soldier on the road (standing on road surface).
   */
  const roadFeetY = ROAD_TOP

  // ── road background (left section + right section, hole gaps punched out) ──
  // Draw the full road as one rect, then draw the holes as white cutouts.

  // ── soldier x-positions on road-right ─────────────────────────────────────
  const roadRightSoldiers = soldiers.filter((s) => s.location === 'road-right')
  const roadLeftSoldiers  = soldiers.filter((s) => s.location === 'road-left')

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

      {/* ── Hole A (right hole) — white cutout with border ──────────────── */}
      <rect
        x={HOLE_A_CX - HOLE_WIDTH / 2}
        y={HOLE_TOP}
        width={HOLE_WIDTH}
        height={HOLE_HEIGHT}
        fill={HOLE_FILL}
        stroke={HOLE_STROKE}
        strokeWidth={2}
      />
      {/* depth dashed line — midpoint of Hole A */}
      <line
        x1={HOLE_A_CX - HOLE_WIDTH / 2 + 3}
        y1={DEPTH_LINE_Y}
        x2={HOLE_A_CX + HOLE_WIDTH / 2 - 3}
        y2={DEPTH_LINE_Y}
        stroke={DEPTH_DASH_COLOR}
        strokeWidth={2.5}
        strokeDasharray="6 4"
        opacity={holeFill.holeA >= 1 ? 0.35 : 1}
      />

      {/* ── Hole B (left hole) — white cutout with border ───────────────── */}
      <rect
        x={HOLE_B_CX - HOLE_WIDTH / 2}
        y={HOLE_TOP}
        width={HOLE_WIDTH}
        height={HOLE_HEIGHT}
        fill={HOLE_FILL}
        stroke={HOLE_STROKE}
        strokeWidth={2}
      />
      {/* depth dashed line — midpoint of Hole B */}
      <line
        x1={HOLE_B_CX - HOLE_WIDTH / 2 + 3}
        y1={DEPTH_LINE_Y}
        x2={HOLE_B_CX + HOLE_WIDTH / 2 - 3}
        y2={DEPTH_LINE_Y}
        stroke={DEPTH_DASH_COLOR}
        strokeWidth={2.5}
        strokeDasharray="6 4"
        opacity={holeFill.holeB >= 1 ? 0.35 : 1}
      />

      {/* ── soldiers inside Hole A ─────────────────────────────────────── */}
      {soldiers
        .filter((s) => s.location === 'holeA')
        .map((s) => (
          <SoldierGlyph
            key={`soldier-${s.label}`}
            cx={HOLE_A_CX}
            feetY={holeStackFeetY((s.stackLevel ?? 0) as 0 | 1)}
            label={s.label}
          />
        ))}

      {/* ── soldiers inside Hole B ─────────────────────────────────────── */}
      {soldiers
        .filter((s) => s.location === 'holeB')
        .map((s) => (
          <SoldierGlyph
            key={`soldier-${s.label}`}
            cx={HOLE_B_CX}
            feetY={holeStackFeetY((s.stackLevel ?? 0) as 0 | 1)}
            label={s.label}
          />
        ))}

      {/* ── road-right soldiers: 5 approaching in a row from the right ── */}
      {roadRightSoldiers.map((s, idx) => {
        const cx =
          s.overrideX !== undefined
            ? s.overrideX
            : SOLDIERS_START_X + idx * SOLDIER_SPACING
        return (
          <SoldierGlyph
            key={`soldier-${s.label}`}
            cx={cx}
            feetY={roadFeetY}
            label={s.label}
          />
        )
      })}

      {/* ── road-left soldiers: those that have crossed ─────────────────── */}
      {roadLeftSoldiers.map((s, idx) => {
        const cx =
          s.overrideX !== undefined
            ? s.overrideX
            : 40 + idx * SOLDIER_SPACING
        return (
          <SoldierGlyph
            key={`soldier-${s.label}`}
            cx={cx}
            feetY={roadFeetY}
            label={s.label}
          />
        )
      })}

      {/* ── blue left-pointing arrow ─────────────────────────────────────── */}
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

// ─── Default initial state ────────────────────────────────────────────────────

/**
 * Default soldier positions: all 5 on the road to the right.
 * Soldier 1 is closest (index 0 → leftmost in the group, nearest the hole).
 */
export const DEFAULT_SOLDIERS: SoldierPosition[] = [1, 2, 3, 4, 5].map(
  (label, idx) => ({
    label,
    location: 'road-right' as const,
    overrideX: SOLDIERS_START_X + idx * SOLDIER_SPACING,
  }),
)

// ─── SAMPLE fallback (for preview when params is absent) ─────────────────────

interface SoldierRoadParams {
  _unused?: unknown
}

const SAMPLE: SoldierRoadParams = {}

// ─── Main illustration (default export) ──────────────────────────────────────

/**
 * SoldierRoad22G3Illustration
 *
 * Shows the initial state of the puzzle: a brown road with two deep holes and
 * five soldiers 1–5 lined up to the right with a blue left-pointing arrow.
 * Each hole has a red dashed depth line halfway down, showing it needs TWO
 * soldiers stacked to reach road level.
 *
 * Does NOT reveal the final order (52143) — that is the animator's job.
 *
 * `params` is accepted but unused (the puzzle setup is fully fixed).
 */
export default function SoldierRoad22G3Illustration({ params }: { params: unknown }) {
  // Defensive narrowing — params unused but accepted per standard signature.
  void ((params ?? {}) as Partial<SoldierRoadParams> ?? SAMPLE)

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Jalan cokelat dengan dua lubang dalam (kedalaman 2 tentara). ' +
        'Garis merah putus-putus di tengah setiap lubang menunjukkan dibutuhkan dua tentara bertumpuk untuk mencapai permukaan jalan. ' +
        'Tentara bernomor 1, 2, 3, 4, 5 berdiri di sebelah kanan dengan panah biru menunjuk ke kiri.'
      }
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width={Math.min(420, VIEW_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <SoldierRoad soldiers={DEFAULT_SOLDIERS} holeFill={{ holeA: 0, holeB: 0 }} showArrow />
      </svg>
    </div>
  )
}
