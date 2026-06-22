// IKMC-20-EC-Q11 — "Dennis ties a dog 1 metre from a corner of a 7×5 m hut
//   using an 11 m leash. Dennis places 5 treats as shown.
//   How many treats can the dog reach?"  Answer: D (4 treats).
//
// SOURCE: OCR 2020.imgs/039.jpg — top-down plan view:
//   Rectangle (hut) in center; tie point is on the RIGHT wall, 1 m below the
//   top-right corner.  Dog is shown to the RIGHT of the hut.  Leash coils up.
//   5 bone treats are placed in a row BELOW the hut (from left to right).
//
// The illustration shows ONLY the problem setup — NOT the reachable arcs
// (those are shown in the explainer). No answer hints.
//
// Shared exports (used by the explainer):
//   HutRect        — the 7×5 m hut rectangle
//   TreatBone      — one bone treat glyph
//   LAYOUT         — all coordinate constants (px scale, origins, treat positions)
//
// Pure SVG, no random, no Date, SSR-safe.

// ── Scale & Layout ────────────────────────────────────────────────────────────

/** 1 metre in SVG pixels. */
export const PX_PER_M = 28

/** SVG canvas size. */
export const SVG_W = 340
export const SVG_H = 280

/** Hut top-left corner in SVG coords.
 *  Hut is 7 m wide × 5 m tall → 196 × 140 px.
 *  Centred horizontally, with room for dog to the right + treats below.
 */
export const HUT_X = 40
export const HUT_Y = 42
export const HUT_W = 7 * PX_PER_M   // 196 px
export const HUT_H = 5 * PX_PER_M   // 140 px

/** Tie point: 1 m below the top-right corner, on the right wall. */
export const TIE_X = HUT_X + HUT_W
export const TIE_Y = HUT_Y + 1 * PX_PER_M

/** Five treat positions (below the hut, evenly spread left→right).
 *  In the source figure the bones are roughly equal-spaced under the hut.
 *  We place them so: leftmost at ~HUT_X + 14px, rightmost at ~HUT_X + HUT_W - 14px.
 *  Vertical: ~18 px below the hut bottom.
 */
export const TREAT_Y = HUT_Y + HUT_H + 22

const TREAT_SPREAD = HUT_W - 28
const TREAT_BASE_X = HUT_X + 14

export const TREAT_XS: number[] = [0, 1, 2, 3, 4].map(
  (i) => TREAT_BASE_X + (i / 4) * TREAT_SPREAD,
)

// Colour tokens
export const COLOR = {
  HUT_FILL:    '#EDE9E1',
  HUT_STROKE:  '#6B7280',
  TICK:        '#9CA3AF',
  TIE_DOT:     '#1F2937',
  LEASH:       '#374151',
  DOG_BODY:    '#D1AA7A',
  DOG_STROKE:  '#7C5A2A',
  TREAT:       '#B0B0B0',
  TREAT_STROKE:'#555555',
  LABEL:       '#1F2937',
  GROUND:      '#F9F7F3',
} as const

// ── Metre tick marks ──────────────────────────────────────────────────────────

/** Tick marks on the hut walls (every 1 m) so the scale is visible. */
function HutTicks() {
  const ticks: React.ReactElement[] = []
  const TICK_LEN = 5

  // Top wall — 7 ticks across (skip corners)
  for (let i = 1; i < 7; i++) {
    const x = HUT_X + i * PX_PER_M
    ticks.push(
      <line key={`top-${i}`}
        x1={x} y1={HUT_Y - TICK_LEN}
        x2={x} y2={HUT_Y + TICK_LEN}
        stroke={COLOR.TICK} strokeWidth={1.2} />,
    )
  }
  // Bottom wall
  for (let i = 1; i < 7; i++) {
    const x = HUT_X + i * PX_PER_M
    const yb = HUT_Y + HUT_H
    ticks.push(
      <line key={`bot-${i}`}
        x1={x} y1={yb - TICK_LEN}
        x2={x} y2={yb + TICK_LEN}
        stroke={COLOR.TICK} strokeWidth={1.2} />,
    )
  }
  // Left wall — 5 ticks
  for (let i = 1; i < 5; i++) {
    const y = HUT_Y + i * PX_PER_M
    ticks.push(
      <line key={`left-${i}`}
        x1={HUT_X - TICK_LEN} y1={y}
        x2={HUT_X + TICK_LEN} y2={y}
        stroke={COLOR.TICK} strokeWidth={1.2} />,
    )
  }
  // Right wall — 5 ticks
  for (let i = 1; i < 5; i++) {
    const y = HUT_Y + i * PX_PER_M
    const xr = HUT_X + HUT_W
    ticks.push(
      <line key={`right-${i}`}
        x1={xr - TICK_LEN} y1={y}
        x2={xr + TICK_LEN} y2={y}
        stroke={COLOR.TICK} strokeWidth={1.2} />,
    )
  }
  return <g>{ticks}</g>
}

// ── Hut rectangle primitive ───────────────────────────────────────────────────

/** The 7×5 m hut drawn as a filled rectangle with tick marks. */
export function HutRect() {
  return (
    <g>
      <rect
        x={HUT_X} y={HUT_Y}
        width={HUT_W} height={HUT_H}
        fill={COLOR.HUT_FILL}
        stroke={COLOR.HUT_STROKE}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <HutTicks />
    </g>
  )
}

// ── Treat bone primitive ──────────────────────────────────────────────────────

/**
 * A simple dog-bone silhouette drawn from pure geometry.
 * Centered at (cx, cy), width ~26 px, height ~14 px.
 */
export function TreatBone({ cx, cy, fill = COLOR.TREAT, stroke = COLOR.TREAT_STROKE }:
  { cx: number; cy: number; fill?: string; stroke?: string }) {
  const bw = 13   // half bone length
  const bh = 4    // shaft half-height
  const r  = 5.5  // knob radius
  const kr = 3.5  // inner knob cut-in

  // Shaft
  const shaftPath =
    `M ${cx - bw} ${cy - bh} L ${cx + bw} ${cy - bh} ` +
    `L ${cx + bw} ${cy + bh} L ${cx - bw} ${cy + bh} Z`

  return (
    <g>
      {/* shaft */}
      <path d={shaftPath} fill={fill} stroke={stroke} strokeWidth={1.2} strokeLinejoin="round" />
      {/* left-top knob */}
      <circle cx={cx - bw} cy={cy - bh} r={r}  fill={fill} stroke={stroke} strokeWidth={1.2} />
      {/* left-bottom knob */}
      <circle cx={cx - bw} cy={cy + bh} r={r}  fill={fill} stroke={stroke} strokeWidth={1.2} />
      {/* right-top knob */}
      <circle cx={cx + bw} cy={cy - bh} r={r}  fill={fill} stroke={stroke} strokeWidth={1.2} />
      {/* right-bottom knob */}
      <circle cx={cx + bw} cy={cy + bh} r={r}  fill={fill} stroke={stroke} strokeWidth={1.2} />
      {/* cover shaft over knob area (clean join) */}
      <rect
        x={cx - bw + kr} y={cy - bh}
        width={(bw - kr) * 2} height={bh * 2}
        fill={fill}
      />
    </g>
  )
}

// ── Dog glyph ─────────────────────────────────────────────────────────────────

/** Simple cartoon dog facing left, sitting to the right of the hut. */
function DogGlyph({ x, y }: { x: number; y: number }) {
  // Body ellipse
  const bx = x, by = y, bRx = 14, bRy = 10
  // Head
  const hx = x - 16, hy = y - 14, hr = 9
  // Ear (floppy ear down-left)
  const ex = hx - 5, ey = hy + 6
  // Tail arc up-right
  const tx = x + 14, ty = y - 6

  return (
    <g fill={COLOR.DOG_BODY} stroke={COLOR.DOG_STROKE} strokeWidth={1.5}>
      {/* body */}
      <ellipse cx={bx} cy={by} rx={bRx} ry={bRy} />
      {/* tail */}
      <path
        d={`M ${tx} ${ty} Q ${tx + 10} ${ty - 14} ${tx + 4} ${ty - 22}`}
        fill="none" strokeWidth={3} strokeLinecap="round"
      />
      {/* head */}
      <circle cx={hx} cy={hy} r={hr} />
      {/* ear */}
      <ellipse cx={ex} cy={ey} rx={5} ry={8} transform={`rotate(-20,${ex},${ey})`} />
      {/* nose */}
      <circle cx={hx - hr + 2} cy={hy + 1} r={2} fill={COLOR.DOG_STROKE} stroke="none" />
    </g>
  )
}

// ── Leash glyph ───────────────────────────────────────────────────────────────

/** Curly leash from tie point to dog, matching the coiled look in the OCR figure. */
function LeashGlyph() {
  const dogX = TIE_X + 50
  const dogY = TIE_Y + 4

  // A wavy/looping path from tie point to dog
  const d =
    `M ${TIE_X} ${TIE_Y} ` +
    `C ${TIE_X + 22} ${TIE_Y - 28} ${TIE_X + 42} ${TIE_Y - 20} ${TIE_X + 38} ${TIE_Y + 6} ` +
    `C ${TIE_X + 34} ${TIE_Y + 30} ${dogX - 10} ${dogY + 18} ${dogX} ${dogY}`

  return (
    <path
      d={d}
      fill="none"
      stroke={COLOR.LEASH}
      strokeWidth={2}
      strokeLinecap="round"
    />
  )
}

// ── Dimension labels ──────────────────────────────────────────────────────────

function DimLabels() {
  const fontProps = {
    fontSize: 11,
    fontWeight: 700 as const,
    fill: COLOR.LABEL,
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
  }
  const midX = HUT_X + HUT_W / 2
  const midY = HUT_Y + HUT_H / 2
  const rightX = HUT_X + HUT_W + 8

  return (
    <g {...fontProps}>
      {/* 7 m — above the hut, horizontal */}
      <text x={midX} y={HUT_Y - 10} textAnchor="middle" dominantBaseline="central">7 m</text>
      {/* 5 m — right of the hut, vertical */}
      <text
        x={rightX + 10} y={midY}
        textAnchor="middle" dominantBaseline="central"
        transform={`rotate(90, ${rightX + 10}, ${midY})`}
      >5 m</text>
      {/* 1 m — label for the tie point distance from the corner */}
      <text x={TIE_X + 4} y={(HUT_Y + TIE_Y) / 2} textAnchor="start" dominantBaseline="central">1</text>
      {/* 11 m — leash label */}
      <text x={TIE_X + 26} y={TIE_Y - 30} textAnchor="start" dominantBaseline="central">11</text>
    </g>
  )
}

// ── Default export ────────────────────────────────────────────────────────────

/**
 * DogLeash11ECIllustration
 *
 * Problem-only figure for IKMC-20-EC-Q11.
 * Shows: the 7×5 m hut (top-down), the tie point (1 m from the top-right corner),
 * the dog with a coiled leash (11 m), and 5 bone treats below the hut.
 * Does NOT show the reachable arcs or which treats are reachable.
 */
export default function DogLeash11ECIllustration() {
  const dogX = TIE_X + 50
  const dogY = TIE_Y + 4

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Top-down view of a rectangular hut (7 m wide × 5 m tall). ' +
        'A dog is tied by an 11 m leash to a point on the right wall, 1 m below the top-right corner. ' +
        'Five bone treats are placed in a row below the hut. ' +
        'How many treats can the dog reach?'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(360, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.GROUND} />

        {/* hut rectangle + ticks */}
        <HutRect />

        {/* tie point dot */}
        <circle cx={TIE_X} cy={TIE_Y} r={4} fill={COLOR.TIE_DOT} />

        {/* leash */}
        <LeashGlyph />

        {/* dog */}
        <DogGlyph x={dogX} y={dogY} />

        {/* five bone treats */}
        {TREAT_XS.map((tx, i) => (
          <TreatBone key={i} cx={tx} cy={TREAT_Y} />
        ))}

        {/* dimension labels */}
        <DimLabels />
      </svg>
    </div>
  )
}
