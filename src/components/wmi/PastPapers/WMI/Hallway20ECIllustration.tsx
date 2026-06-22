// IKMC-19-EC-Q20 — "A hallway has the dimensions shown in the picture.
// A cat walks on the dashed line along the middle of the hallway.
// How many metres does the cat walk?"
//
// PROBLEM ONLY: shows the static floor-plan figure the student sees in the paper.
// The figure (docs/reference/ocr-res/ikmc/contest/ecolier/2019.imgs/053.jpg) shows
// a Z-shaped (staircase) hallway floor plan with outer dimensions labelled.
//
// Shape:
//   - Bottom arm : 40 m outer width × 8 m outer height  (lower-left)
//   - Step section: 4 m outer width × 20 m outer height (right column, inner)
//   - Top arm   : 28 m outer width × 6 m outer height  (upper-right)
//
// Inner dimensions labelled:
//   - 36 m inner horizontal (top wall of bottom arm, left to step)
//   - 20 m inner vertical   (left wall of step, bottom to top of arm)
//
// The dashed midline runs through the centre of each corridor arm.
//
// Does NOT show: the midline segment lengths, the sum, or the answer (83 m).
//
// Pure render — no Math.random, no Date.  SSR-safe and deterministic.
//
// Pool reuse: adapts the rectangle/path-dimension primitive pattern from
// Field24G2Illustration (labelled outer bounding shapes, dimension braces).

// ── Shared layout constants (re-exported so the explainer can use the same coords) ──

/** Scale factor: 1 metre = SCALE pixels. */
export const SCALE = 4.5

/** Outer dimension values in metres (the labelled measurements). */
export const DIM = {
  bottomW: 40,   // outer width of bottom arm
  bottomH:  8,   // outer height of bottom arm
  stepW:    4,   // outer width of vertical step section (= bottomW − innerH = 40 − 36)
  stepH:   20,   // outer height of vertical step section (inner vertical)
  topW:    28,   // outer width of top arm
  topH:     6,   // outer height of top arm
  innerH:  36,   // inner horizontal (top wall of bottom arm to step left wall)
  innerV:  20,   // inner vertical (same as stepH, labelled in figure)
} as const

// ── SVG coordinate system (Y increases downward, as in image) ────────────────
//
// The shape boundary (outer perimeter):
//   (0, bH)           bottom-left      ← origin placed at top-left of bounding box
//   (bW, bH)          bottom-right
//   (bW, 0)           top-right (outer right edge goes all the way to y=0)
//   (bW−tW, 0)        top of top arm, left
//   (bW−tW, bH+sH)    left wall of top arm, where it ends above bottom arm
//   (iH, bH+sH)       inner bottom of top arm, right junction (= inner H from left)
//   (iH, bH)          inner top wall of bottom arm, right side (inner corner)
//   (0, bH)           back to start
//
// In pixel space (Y pointing DOWN, with padding PAD_TOP added):

const bW  = DIM.bottomW * SCALE   // 180 px — bottom arm outer width
const bH  = DIM.bottomH * SCALE   //  36 px — bottom arm outer height
const sH  = DIM.stepH   * SCALE   //  90 px — step outer height
const tW  = DIM.topW    * SCALE   // 126 px — top arm outer width
const tH  = DIM.topH    * SCALE   //  27 px — top arm outer height
const iH  = DIM.innerH  * SCALE   // 162 px — inner horizontal

/** Step outer width in px (= bW − iH). */
const sW  = (DIM.bottomW - DIM.innerH) * SCALE  // 18 px

// Total bounding box of the Z shape
const SHAPE_W = bW          // 180 px
const SHAPE_H = bH + sH + tH // 36 + 90 + 27 = 153 px

// Padding around the shape (room for dimension labels)
const PAD_LEFT   = 28
const PAD_TOP    = 14
const PAD_RIGHT  = 28
const PAD_BOTTOM = 24

/** SVG total width. */
export const SVG_W = SHAPE_W + PAD_LEFT + PAD_RIGHT   // 236 px
/** SVG total height. */
export const SVG_H = SHAPE_H + PAD_TOP  + PAD_BOTTOM  // 191 px

// Shape origin in SVG space (top-left of bounding box of the Z)
const OX = PAD_LEFT
const OY = PAD_TOP

// ── Corner coordinates of the Z-shape (outer perimeter, Y-down) ──────────────
//
// Outer perimeter traversed clockwise from top-left of bottom arm:
//   P0: top-left of bottom arm     (OX,       OY + tH + sH)
//   P1: bottom-left of bottom arm  (OX,       OY + tH + sH + bH)
//   P2: bottom-right of bottom arm (OX + bW,  OY + tH + sH + bH)
//   P3: right of step (bottom)     (OX + bW,  OY + tH + sH)       ← step goes from P3 up
//   P4: right of step (top)        (OX + bW,  OY + tH)            ← top arm starts
//   P5: top of top arm (right)     (OX + bW,  OY)
//   P6: top of top arm (left)      (OX + bW − tW, OY)
//   P7: left of top arm (bottom)   (OX + bW − tW, OY + tH)
//   P8: inner junction (top)       (OX + iH,  OY + tH)
//   P9: inner junction (bottom)    (OX + iH,  OY + tH + sH)       ← inner corner
//   P10: top-right of bottom arm   (OX,       OY + tH + sH)       ← = P0
//
// Re-expressed with concrete values:

const x0  = OX              // left outer wall   (x=0 in shape coords)
const x1  = OX + iH         // inner step left wall
const x2  = OX + bW         // right outer wall
const xtL = OX + bW - tW    // top arm left outer wall (= OX + bW − tW = OX + iH − sW? No, OX+bW-tW)

// Y coordinates (top of bounding box = y0 = OY):
const y0  = OY                   // top of top arm outer
const y1  = OY + tH              // bottom of top arm outer / top of step outer
const y2  = OY + tH + sH         // bottom of step outer / top of bottom arm outer
const y3  = OY + tH + sH + bH    // bottom of bottom arm outer

/** The Z-shape polygon points (outer perimeter). */
export const Z_POINTS = [
  [x0,  y2],   // P0 — top-left of bottom arm
  [x0,  y3],   // P1 — bottom-left
  [x2,  y3],   // P2 — bottom-right
  [x2,  y1],   // P3 — bottom of right outer (step bottom)
  [x2,  y0],   // P4 (= P5 in earlier notation) — top of right outer
  [xtL, y0],   // P5 — top-left of top arm
  [xtL, y1],   // P6 — bottom-left of top arm
  [x1,  y1],   // P7 — inner junction top (= inner corner upper)
  [x1,  y2],   // P8 — inner junction bottom (= inner corner lower)
] as const

/** The Z-shape polygon string for SVG. */
export const Z_POLY = Z_POINTS.map(([x, y]) => `${x},${y}`).join(' ')

// ── Midline path waypoints (centre of each corridor arm, Y-down) ──────────────
//
// Bottom arm: corridor width = bH = 36px (= 8 m), midline at y = y2 + bH/2 = y2 + 18px
// Step      : corridor width = sW = 18px (= 4 m), midline at x = x1 + sW/2 = x1 + 9px
// Top arm   : corridor width = tH = 27px (= 6 m), midline at y = y0 + tH/2 = y0 + 13.5px
//
// Midline runs from LEFT OPEN END of bottom arm to LEFT OPEN END of top arm.

/** Y of bottom-arm midline (halfway between outer bottom and outer top of arm). */
export const MID_BOT_Y  = y2 + bH / 2       // halfway through bottom arm
/** X of step midline (halfway between inner left wall and outer right wall). */
export const MID_STEP_X = x1 + sW / 2
/** Y of top-arm midline (halfway between outer top and outer bottom of arm). */
export const MID_TOP_Y  = y0 + tH / 2

// Junction centres (where the midline turns):
/** Centre of bottom-right junction (where bottom arm meets step). */
export const JCT_BOT_X  = MID_STEP_X
export const JCT_BOT_Y  = MID_BOT_Y
/** Centre of top-right junction (where step meets top arm). */
export const JCT_TOP_X  = MID_STEP_X
export const JCT_TOP_Y  = MID_TOP_Y

// Midline start/end:
/** Left open-end of bottom arm (entry). */
export const ML_ENTRY_X = x0
export const ML_ENTRY_Y = MID_BOT_Y
/** Left open-end of top arm (exit). */
export const ML_EXIT_X  = xtL
export const ML_EXIT_Y  = MID_TOP_Y

/** Full midline path as SVG d-attribute. */
export const MIDLINE_D =
  `M ${ML_ENTRY_X} ${ML_ENTRY_Y}` +
  ` L ${JCT_BOT_X} ${JCT_BOT_Y}` +
  ` L ${JCT_TOP_X} ${JCT_TOP_Y}` +
  ` L ${ML_EXIT_X} ${ML_EXIT_Y}`

// ── Colour palette ─────────────────────────────────────────────────────────────
export const COLOR = {
  FILL:       '#E5E7EB',  // light grey floor fill (matching paper's grey)
  STROKE:     '#374151',  // outer wall stroke
  MIDLINE:    '#374151',  // dashed midline (matches paper's dashed style)
  LABEL:      '#1F2937',  // dimension label text
  BRACKET:    '#374151',  // dimension bracket lines
  BG:         '#FFFFFF',
} as const

// ── Dimension label helpers ───────────────────────────────────────────────────

/** Horizontal dimension brace with label below/above. */
function HDim({
  x1: lx, x2: rx, y, label, above = false, color = COLOR.LABEL,
}: {
  x1: number; x2: number; y: number; label: string; above?: boolean; color?: string
}) {
  const midX = (lx + rx) / 2
  const textY = above ? y - 9 : y + 9
  const tickLen = 5
  return (
    <g fontSize={9.5} fontWeight={700} fill={color} stroke={color} strokeWidth={1}
      fontFamily="ui-sans-serif, system-ui, sans-serif"
    >
      {/* horizontal brace line */}
      <line x1={lx} y1={y} x2={rx} y2={y} strokeWidth={1} />
      {/* left tick */}
      <line x1={lx} y1={y - tickLen} x2={lx} y2={y + tickLen} />
      {/* right tick */}
      <line x1={rx} y1={y - tickLen} x2={rx} y2={y + tickLen} />
      {/* label */}
      <text x={midX} y={textY} textAnchor="middle" dominantBaseline="central" stroke="none">
        {label}
      </text>
    </g>
  )
}

/** Vertical dimension brace with label to the right. */
function VDim({
  x, y1: ty, y2: by, label, toLeft = false, color = COLOR.LABEL,
}: {
  x: number; y1: number; y2: number; label: string; toLeft?: boolean; color?: string
}) {
  const midY = (ty + by) / 2
  const textX = toLeft ? x - 7 : x + 7
  const tickLen = 5
  return (
    <g fontSize={9.5} fontWeight={700} fill={color} stroke={color} strokeWidth={1}
      fontFamily="ui-sans-serif, system-ui, sans-serif"
    >
      <line x1={x} y1={ty} x2={x} y2={by} strokeWidth={1} />
      <line x1={x - tickLen} y1={ty} x2={x + tickLen} y2={ty} />
      <line x1={x - tickLen} y1={by} x2={x + tickLen} y2={by} />
      <text
        x={textX} y={midY}
        textAnchor={toLeft ? 'end' : 'start'}
        dominantBaseline="central"
        stroke="none"
      >
        {label}
      </text>
    </g>
  )
}

// ── Inner dimension labels (shown only in illustration, not in explainer raw SVG) ─

/** Inner horizontal label (36 m) — inside the bottom arm. */
function InnerHLabel() {
  // Arrow spans from x0 to x1 (= 0 to iH) at the TOP INNER WALL (y=y2)
  // Position slightly BELOW the inner top wall of the bottom arm
  return (
    <HDim x1={x0} x2={x1} y={y2 + 10} label="36 m" above={false} />
  )
}

/** Inner vertical label (20 m) — inside the step section. */
function InnerVLabel() {
  // Arrow spans from y1 to y2 (inner height of step) at x1 (inner left wall of step)
  return (
    <VDim x={x1 + sW + 4} y1={y1} y2={y2} label="20 m" />
  )
}

// ── Default export ─────────────────────────────────────────────────────────────

/**
 * Hallway20ECIllustration
 *
 * Static, problem-only floor-plan figure for IKMC-19-EC-Q20.
 *
 * Shows:
 *   • The Z-shaped hallway outline (grey fill, dark stroke)
 *   • Six outer dimension labels: 40 m, 8 m, 36 m (inner), 20 m (inner), 28 m, 6 m
 *   • The dashed midline running through the centre of each corridor arm
 *
 * Does NOT show:
 *   • The midline segment lengths (36, 20, 27 m)
 *   • The total path length (83 m) or the answer (E)
 */
export default function Hallway20ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Denah koridor berbentuk tangga (Z). ' +
        'Lengan bawah berukuran 40 m × 8 m; lengan atas 28 m × 6 m; ' +
        'bagian tengah (vertikal) memiliki tinggi 20 m. ' +
        'Garis putus-putus menunjukkan jalur kucing di tengah koridor. ' +
        'Berapa meter jarak yang ditempuh kucing?'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(320, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />

        {/* ── Z-shape hallway fill ── */}
        <polygon
          points={Z_POLY}
          fill={COLOR.FILL}
          stroke={COLOR.STROKE}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* ── Dashed midline ── */}
        <path
          d={MIDLINE_D}
          fill="none"
          stroke={COLOR.MIDLINE}
          strokeWidth={1.5}
          strokeDasharray="5 4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ── Outer dimension labels ── */}

        {/* 40 m — outer bottom of bottom arm */}
        <HDim x1={x0} x2={x2} y={y3 + 14} label="40 m" above={false} />

        {/* 8 m — outer left height of bottom arm */}
        <VDim x={x0 - 14} y1={y2} y2={y3} label="8 m" toLeft />

        {/* 28 m — outer top of top arm */}
        <HDim x1={xtL} x2={x2} y={y0 - 10} label="28 m" above />

        {/* 6 m — outer right height of top arm */}
        <VDim x={x2 + 14} y1={y0} y2={y1} label="6 m" />

        {/* ── Inner dimension labels (labelled on the concave side) ── */}

        {/* 36 m inner horizontal */}
        <InnerHLabel />

        {/* 20 m inner vertical */}
        <InnerVLabel />
      </svg>
    </div>
  )
}
