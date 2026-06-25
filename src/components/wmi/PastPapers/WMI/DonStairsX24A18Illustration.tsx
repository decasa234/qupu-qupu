// SEAMOX-24-A-Q18 — "There are 8 steps on a flight of stairs at Don's apartment.
// There are 2 flights of stairs from one level to another. It takes Don 90 seconds
// to climb one flight of stairs. How many minutes does Don take to reach his home
// on the 6th floor?"
// Answer: 15 minutes (5 levels × 2 flights × 90 s = 900 s = 15 min)
//
// FIGURE: 6-floor apartment cross-section. A 2-flight staircase per level rises
// on the left; Don appears at floor 1; a house marks floor 6.
// OCR source: docs/reference/ocr-res/seamo-x/contest/paper-a/2024.md Q18
// Reference crop: 2024.imgs/012.jpg (stick figure on ascending staircase)
//
// Adapted from ClimbStairs22A15Illustration (same tread/riser geometry and
// colour palette). Re-exports layout constants for the explainer.
//
// Pure SVG, SSR-safe, no hooks, no framer-motion.

// ── Layout constants (re-exported so the explainer shares the grid) ───────────

/** Number of apartment floors shown. */
export const FLOOR_COUNT = 6
/** Vertical gap (px) between adjacent floor-slab lines. */
export const FLOOR_GAP   = 36
/** Padding above the topmost floor line (room for home icon + F6 label). */
export const PAD_T       = 32
/** Padding below the bottommost floor line (room for Don glyph). */
export const PAD_B       = 44
/** Left x of the zigzag staircase. */
export const STAIR_X0    = 5
/** Right x of the staircase (landing x between the 2 flights). */
export const STAIR_X1    = 35
/** X at which floor labels start. */
export const LABEL_X     = 60

export const SVG_W = 200
export const SVG_H = PAD_T + (FLOOR_COUNT - 1) * FLOOR_GAP + PAD_B  // 32+180+44 = 256

/** Y-coordinate of the floor-slab line for floor f (1 = ground, FLOOR_COUNT = top). */
export function floorLineY(f: number): number {
  return PAD_T + (FLOOR_COUNT - f) * FLOOR_GAP
}

// ── Colour tokens ──────────────────────────────────────────────────────────────
export const C = {
  FLOOR_LINE:   '#D1D5DB',
  STAIR_STROKE: '#8B7355',
  HL_STROKE:    '#2C7BE5',
  GREEN_STROKE: '#10B981',
  INK:          '#111827',
  LABEL_NORM:   '#374151',
  LABEL_DON:    '#1D4ED8',
  LABEL_HOME:   '#D97706',
} as const

// ── Staircase polyline (2 flights, 3 steps each, zigzag from y_bot→y_top) ────

/**
 * Returns SVG polyline `points` string for the 2-flight staircase between
 * floor `f` (bottom) and floor `f+1` (top).  1 ≤ f ≤ FLOOR_COUNT-1.
 */
export function stairPoints(f: number): string {
  const yBot = floorLineY(f)
  const yMid = yBot - FLOOR_GAP / 2   // landing between the 2 flights
  const yTop = yBot - FLOOR_GAP       // = floorLineY(f + 1)
  const L = STAIR_X0, R = STAIR_X1
  const d = FLOOR_GAP / 6             // riser height = 36/6 = 6 px
  const t = (R - L) / 3              // tread width  = 30/3 = 10 px

  // Flight 1: L→R, 3 steps, from yBot to yMid
  const f1: [number, number][] = [
    [L,       yBot],
    [L + t,   yBot],    [L + t,   yBot - d],
    [L + 2*t, yBot - d],[L + 2*t, yBot - 2*d],
    [R,       yBot - 2*d],[R,     yMid],
  ]
  // Flight 2: R→L, 3 steps, from yMid to yTop
  const f2: [number, number][] = [
    [L + 2*t, yMid],    [L + 2*t, yMid - d],
    [L + t,   yMid - d],[L + t,   yMid - 2*d],
    [L,       yMid - 2*d],[L,     yTop],
  ]
  return [...f1, ...f2].map(([x, y]) => `${x},${y}`).join(' ')
}

// ── PersonGlyph — Don at floor 1 ──────────────────────────────────────────────

function PersonGlyph({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g stroke="none">
      <circle cx={cx} cy={cy} r={5} fill={C.LABEL_DON} />
      <line
        x1={cx} y1={cy + 5} x2={cx} y2={cy + 15}
        stroke={C.LABEL_DON} strokeWidth={2.5} strokeLinecap="round"
      />
    </g>
  )
}

// ── HouseGlyph — home at floor 6 ─────────────────────────────────────────────

function HouseGlyph({ cx, cy }: { cx: number; cy: number }) {
  const r = 9
  return (
    <g>
      <polygon
        points={`${cx - r},${cy} ${cx},${cy - r * 0.85} ${cx + r},${cy}`}
        fill={C.LABEL_HOME}
        strokeLinejoin="round"
      />
      <rect
        x={cx - r * 0.55} y={cy}
        width={r * 1.1} height={r * 0.85}
        fill={C.LABEL_HOME} rx={1}
      />
    </g>
  )
}

// ── Props ──────────────────────────────────────────────────────────────────────

export interface DonStairsIllustrationProps {
  /** Staircase segments to highlight: 1 = F1→F2, …, 5 = F5→F6. */
  highlightFloors?: ReadonlySet<number>
  highlightColor?: string
}

// ── Default export ─────────────────────────────────────────────────────────────

/**
 * DonStairsX24A18Illustration
 *
 * Static problem figure for SEAMOX-24-A-Q18.
 * Shows a 6-floor apartment staircase with 2 zigzag flights per level.
 * Never reveals the answer (15 min).
 */
export default function DonStairsX24A18Illustration({
  highlightFloors,
  highlightColor = C.HL_STROKE,
}: DonStairsIllustrationProps = {}) {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Apartemen 6 lantai: Don di lantai 1 menuju rumah di lantai 6 melalui 2 penerbangan tangga per lantai."
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ maxWidth: SVG_W + 32, display: 'block' }}
        aria-hidden="true"
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* Floor-slab lines F1–F6 */}
        {Array.from({ length: FLOOR_COUNT }, (_, i) => {
          const f = i + 1
          return (
            <line
              key={f}
              x1={0} y1={floorLineY(f)} x2={SVG_W * 0.55} y2={floorLineY(f)}
              stroke={C.FLOOR_LINE} strokeWidth={1.5}
            />
          )
        })}

        {/* 2-flight staircase segments between consecutive floors */}
        {Array.from({ length: FLOOR_COUNT - 1 }, (_, i) => {
          const f = i + 1
          const isHl = highlightFloors?.has(f) ?? false
          return (
            <polyline
              key={f}
              points={stairPoints(f)}
              fill="none"
              stroke={isHl ? highlightColor : C.STAIR_STROKE}
              strokeWidth={isHl ? 2.5 : 1.5}
              strokeLinejoin="round"
            />
          )
        })}

        {/* Floor labels (right of staircase) */}
        {Array.from({ length: FLOOR_COUNT }, (_, i) => {
          const f = i + 1
          // Label sits midway between this floor line and the one above (or in PAD_T for F6)
          const labelY =
            f < FLOOR_COUNT
              ? (floorLineY(f) + floorLineY(f + 1)) / 2
              : floorLineY(FLOOR_COUNT) - PAD_T / 2
          const color =
            f === 1 ? C.LABEL_DON : f === FLOOR_COUNT ? C.LABEL_HOME : C.LABEL_NORM
          return (
            <text
              key={f}
              x={LABEL_X}
              y={labelY}
              fontSize={12}
              fontWeight={600}
              fill={color}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              dominantBaseline="central"
            >
              {`F${f}${f === FLOOR_COUNT ? '  ← Home' : f === 1 ? '  ← Don' : ''}`}
            </text>
          )
        })}

        {/* Don — stick figure below F1 line */}
        <PersonGlyph cx={20} cy={floorLineY(1) + 22} />

        {/* Home icon above F6 line */}
        <HouseGlyph cx={20} cy={floorLineY(FLOOR_COUNT) - 16} />
      </svg>
    </div>
  )
}
