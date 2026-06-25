// SEAMOX-20-B-Q14 — "The figure shown is made up of 3 identical rectangles.
// Find the perimeter of 1 rectangle."
//
// Figure layout (dimensions in cm):
//   ┌────┬────┐
//   │    │    │  } 6 cm  (upper portion, right two rects)
//   ├────┼────┤
//   │    │    │
//   │    │    │
//   ├────┴────┤
//   │         │   (left rect, landscape)
//   └─────────┘
//   ←── 18 cm ──→
//
// Each rectangle: l = 10 cm (length), w = 4 cm (width).
//   - Left rect: 10 wide × 4 tall (landscape, sits at bottom-left)
//   - Right two rects: each 4 wide × 10 tall (portrait, side-by-side)
//   - Total width: 10 + 4 + 4 = 18 cm  ✓
//   - 6 cm gap at top-left = 10 − 4 = 6 cm  ✓
//   - Perimeter = 2(10 + 4) = 28 cm  (not shown — that is the answer)
//
// Pure SVG, no hooks, SSR-safe.

const INK = '#1F2937'
const FILL = '#EFF6FF'     // light blue fill
const STROKE = '#3B82F6'   // blue border

// ── geometry (cm → px) ────────────────────────────────────────────────────────

const PX = 8            // pixels per cm
const L_CM = 10         // length (long side)
const W_CM = 4          // width (short side)

const L = L_CM * PX     // 80 px
const W = W_CM * PX     // 32 px

// We place the compound figure with its bottom-left at (PAD_L, PAD_T + 6cm*PX).
// Right side: 2 portrait rects side-by-side, total width 2W = 64, height L = 80.
// Left side: 1 landscape rect, width L = 80, height W = 32, anchored at bottom.
//
// Overall bounding box: (L + 2W) × L = (80+64) × 80 = 144 × 80 px

const FIG_W = L + 2 * W   // 144 px  (= 18 cm * PX)
const FIG_H = L            //  80 px  (= 10 cm * PX)

// The left rect's TOP aligns with the bottom of the upper-right gap (i.e., 6 cm down).
const LEFT_GAP = (L - W)   // = 6 cm * PX = 48 px (gap at top-left)

// Padding around the figure
const PAD_L = 56   // room for "6 cm" left label
const PAD_R = 20
const PAD_T = 20
const PAD_B = 40   // room for "18 cm" bottom label

const SVG_W = PAD_L + FIG_W + PAD_R   // 240 px
const SVG_H = PAD_T + FIG_H + PAD_B   // 140 px

// Absolute positions of figure pieces in SVG space
const FIG_X = PAD_L                   // left edge of figure
const FIG_Y = PAD_T                   // top edge of figure (top of right rects)

// Right two rectangles: x0 = FIG_X + L, y0 = FIG_Y
const R1X = FIG_X + L                 // first right rect x
const R2X = FIG_X + L + W             // second right rect x
const RY  = FIG_Y                     // top y of right rects
const RH  = L                         // height of right rects

// Left rectangle: x0 = FIG_X, y0 = FIG_Y + LEFT_GAP
const LX  = FIG_X                     // left rect x
const LY  = FIG_Y + LEFT_GAP          // left rect top y (starts 6cm down)
const LW  = L                         // left rect width
const LH  = W                         // left rect height

// ── helpers ───────────────────────────────────────────────────────────────────

function Tick({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={1.2} />
}

function DimLabel({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={700}
      fill={INK}
    >
      {text}
    </text>
  )
}

// ── compound outline polygon (clockwise from top-left of right column) ─────────
//
//   (R1X, FIG_Y) ──────────── (FIG_X + FIG_W, FIG_Y)
//        |                              |
//        |    (right col, full height)  |
//        |                              |
//   (R1X, FIG_Y+FIG_H) ─── (FIG_X+FIG_W, FIG_Y+FIG_H)
//        ↑ = (LX+LW, LY+LH)
//   (LX, LY+LH) ─── (LX+LW, LY+LH)
//        |
//   (LX, LY) ──── (LX+LW, LY)   ← top of left rect
//
// Walking clockwise:
//   top-right → right-bottom → left-bottom-right-corner →
//   left-bottom-left-corner → top of left rect (right side) →
//   top of left rect (left side) → left-top connects to right col top
//
// Actually the shape is a hexagon:
//   (R1X, RY) → (FIG_X+FIG_W, RY) → (FIG_X+FIG_W, RY+RH) →
//   (LX, RY+RH) → (LX, LY) → (R1X, LY) → back to start
//
// Simplified: top-right corner of right section, going clockwise.

function compoundPoints() {
  const x0 = R1X                   // left edge of right column
  const x1 = FIG_X + FIG_W         // right edge of figure
  const y0 = RY                    // top of right column
  const y1 = RY + RH               // bottom of right column = bottom of figure

  // Left rect
  const lLeft  = LX                // = FIG_X
  const lTop   = LY
  const lRight = LX + LW           // = FIG_X + L = R1X
  const lBot   = LY + LH           // = y1

  return [
    `${x0},${y0}`,           // top-left of right column
    `${x1},${y0}`,           // top-right of figure
    `${x1},${y1}`,           // bottom-right of figure
    `${lLeft},${y1}`,        // bottom-left of figure
    `${lLeft},${lTop}`,      // top-left of left rect
    `${lRight},${lTop}`,     // top-right of left rect = bottom-left of right column top
    `${lRight},${y0}`,       // back up to top of right column (closing the step)
  ].join(' ')
}

// ── main illustration component ────────────────────────────────────────────────

export default function ThreeRectsX20B14Illustration() {
  const TICK = 5
  const GAP  = 6   // arrow-to-shape gap

  // "6 cm" vertical label on the LEFT side of the right column
  const label6X  = R1X - GAP - 24
  const label6Y  = RY + LEFT_GAP / 2
  const arrow6X  = R1X - GAP - 4

  // "18 cm" horizontal label below the figure
  const label18Y = FIG_Y + FIG_H + GAP + 16
  const label18X = FIG_X + FIG_W / 2

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Tiga persegi panjang identik membentuk bangun: satu persegi panjang horizontal di kiri bawah, dua persegi panjang vertikal berdampingan di kanan. Lebar keseluruhan 18 cm, selisih tinggi 6 cm."
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(320, SVG_W)}
        style={{ display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* ── compound shape fill ── */}
        <polygon
          points={compoundPoints()}
          fill={FILL}
          stroke={STROKE}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* ── interior dividers (between the two right rects) ── */}
        {/* Vertical divider between right rect 1 and right rect 2 */}
        <line
          x1={R2X} y1={RY}
          x2={R2X} y2={RY + RH}
          stroke={STROKE}
          strokeWidth={2}
        />
        {/* Horizontal divider between left rect top and right rects (where left rect meets right col) */}
        <line
          x1={R1X} y1={LY}
          x2={FIG_X + FIG_W} y2={LY}
          stroke={STROKE}
          strokeWidth={2}
        />

        {/* ── "6 cm" label on left side of right column (the step height) ── */}
        <line
          x1={arrow6X} y1={RY}
          x2={arrow6X} y2={LY}
          stroke={INK}
          strokeWidth={1.2}
        />
        <Tick x1={arrow6X - TICK} y1={RY} x2={arrow6X + TICK} y2={RY} />
        <Tick x1={arrow6X - TICK} y1={LY} x2={arrow6X + TICK} y2={LY} />
        <DimLabel x={label6X - 4} y={label6Y} text="6 cm" />

        {/* ── "18 cm" label below the figure ── */}
        <line
          x1={FIG_X}          y1={label18Y - 4}
          x2={FIG_X + FIG_W}  y2={label18Y - 4}
          stroke={INK}
          strokeWidth={1.2}
        />
        <Tick x1={FIG_X}         y1={label18Y - 4 - TICK} x2={FIG_X}         y2={label18Y - 4 + TICK} />
        <Tick x1={FIG_X + FIG_W} y1={label18Y - 4 - TICK} x2={FIG_X + FIG_W} y2={label18Y - 4 + TICK} />
        <DimLabel x={label18X} y={label18Y + 6} text="18 cm" />
      </svg>
    </div>
  )
}
