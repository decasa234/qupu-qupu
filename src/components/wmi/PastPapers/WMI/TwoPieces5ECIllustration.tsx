/**
 * IKMC-20-EC-Q5 — "Which one of the figures below can you make with these pieces?"
 * Answer: E (the bicycle figure).
 *
 * Stem (image 018): six loose geometric pieces displayed separately —
 *   1 rectangle (wide, landscape), 1 right triangle (small, apex left),
 *   1 large isosceles triangle, 1 large circle, 1 small triangle, 1 large circle.
 *
 * Options A–E (images 019–023) are assembled composite figures. Only E (bicycle)
 * can be built from exactly those six pieces:
 *   2 circles = wheels, rectangle = top frame bar, right triangle = front fork,
 *   large triangle = main frame body, small triangle = rear frame.
 *
 * Co-exports TwoPieces5ECOption (choice renderer A–E) which draws each assembled
 * figure using SVG shapes only — bound to choice.label, cannot drift.
 *
 * Pool reuse: adapts the PolyBoard pattern from Assemble25G3Illustration for the
 * piece-assembly concept; uses the same SVG primitive style (stroke + fill) as
 * CubeShapes14Illustration / CutPiece5ECIllustration.
 *
 * Pure SVG — no Math.random, no Date, no window/document. SSR-safe.
 */

import type { WmiChoice } from '../../../../types/wmi'

// ── colour tokens ────────────────────────────────────────────────────────────
const INK = '#1F2937'
const PIECE_FILL = '#EFF6FF'    // light blue for loose pieces in stem
const PIECE_STROKE = '#2563EB'
const OPT_FILL = '#FFFFFF'      // white fill for assembled option figures
const OPT_STROKE = INK
const OPT_BG = '#F8FAFC'

// ── shared SVG primitives ────────────────────────────────────────────────────

interface BasicProps {
  fill?: string
  stroke?: string
  sw?: number
}

/** Wide landscape rectangle centred at (cx, cy). */
function Rect({ cx, cy, w, h, fill = PIECE_FILL, stroke = PIECE_STROKE, sw = 2 }: BasicProps & {
  cx: number; cy: number; w: number; h: number
}) {
  return (
    <rect
      x={cx - w / 2} y={cy - h / 2} width={w} height={h}
      fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round"
    />
  )
}

/** Rotated rectangle: uses transform so the bounding box can tilt. */
function RotRect({ cx, cy, w, h, rotate, fill = PIECE_FILL, stroke = PIECE_STROKE, sw = 2 }: BasicProps & {
  cx: number; cy: number; w: number; h: number; rotate: number
}) {
  return (
    <rect
      x={-w / 2} y={-h / 2} width={w} height={h}
      fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round"
      transform={`translate(${cx},${cy}) rotate(${rotate})`}
    />
  )
}

/** Circle centred at (cx, cy). */
function Circle({ cx, cy, r, fill = PIECE_FILL, stroke = PIECE_STROKE, sw = 2 }: BasicProps & {
  cx: number; cy: number; r: number
}) {
  return <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={sw} />
}

/**
 * Isosceles triangle with centroid at (cx, cy).
 * Apex up by default; rotate=180 gives an inverted triangle.
 */
function IsosTriangle({ cx, cy, w, h, rotate = 0, fill = PIECE_FILL, stroke = PIECE_STROKE, sw = 2 }: BasicProps & {
  cx: number; cy: number; w: number; h: number; rotate?: number
}) {
  const apexY = -(2 * h) / 3
  const baseY = h / 3
  const pts = `0,${apexY} ${-w / 2},${baseY} ${w / 2},${baseY}`
  return (
    <polygon
      points={pts}
      fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round"
      transform={`translate(${cx},${cy}) rotate(${rotate})`}
    />
  )
}

/**
 * Right triangle with the right angle at bottom-left (or bottom-right if flip).
 * Centroid placed at (cx, cy).
 */
function RightTriangle({ cx, cy, w, h, flip = false, rotate = 0, fill = PIECE_FILL, stroke = PIECE_STROKE, sw = 2 }: BasicProps & {
  cx: number; cy: number; w: number; h: number; flip?: boolean; rotate?: number
}) {
  const offX = w / 3
  const offY = (2 * h) / 3
  const pts = flip
    ? `${w - offX},${-offY} ${-offX},${h - offY} ${w - offX},${h - offY}`
    : `${-offX},${-offY} ${-offX},${h - offY} ${w - offX},${h - offY}`
  return (
    <polygon
      points={pts}
      fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round"
      transform={`translate(${cx},${cy}) rotate(${rotate})`}
    />
  )
}

// ── stem illustration ────────────────────────────────────────────────────────
//
// Six pieces laid out in two rows (matching 018.jpg):
//   Row 1 top: rectangle (wide, centered top) | right triangle (left) | large triangle (centre) | large circle (right)
//   Row 2:     large circle (left) | small triangle (centre-right) | large circle (right)
//
// Adjusted to use only the actual 6 pieces visible in the source image.

const STEM_W = 320
const STEM_H = 215

export function TwoPieces5ECDiagram() {
  const col1 = 52, col2 = 160, col3 = 270
  const row1 = 74, row2 = 162

  return (
    <svg
      viewBox={`0 0 ${STEM_W} ${STEM_H}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── rectangle (top centre, landscape) ── */}
      <Rect cx={col2} cy={row1 - 34} w={114} h={28} />

      {/* ── right triangle (small, apex left) ── */}
      <RightTriangle cx={col1} cy={row1} w={42} h={42} />

      {/* ── large isosceles triangle ── */}
      <IsosTriangle cx={col2} cy={row1 + 6} w={62} h={56} />

      {/* ── large circle (right column, row 1) ── */}
      <Circle cx={col3} cy={row1} r={34} />

      {/* ── large circle (left column, row 2) ── */}
      <Circle cx={col1} cy={row2} r={34} />

      {/* ── small isosceles triangle ── */}
      <IsosTriangle cx={col2 + 22} cy={row2} w={38} h={34} />

      {/* ── large circle (right column, row 2) ── */}
      <Circle cx={col3} cy={row2} r={34} />
    </svg>
  )
}

export default function TwoPieces5ECIllustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Six geometric pieces: one wide rectangle at the top, ' +
        'one small right triangle, one large triangle, one large circle in the first row; ' +
        'one large circle, one small triangle, and one more large circle in the second row.'
      }
    >
      <TwoPieces5ECDiagram />
    </div>
  )
}

// ── option figures ───────────────────────────────────────────────────────────
//
// Each option (A–E) is an assembled figure, drawn to match the source images
// (019–023). All rendering is pure SVG shapes.

type OptionLabel = 'A' | 'B' | 'C' | 'D' | 'E'
const OPT_W = 160, OPT_H = 180

/** A (019): Fan/flower — rectangle, 3 triangles radiating from top, 2 circles, 1 inverted triangle. */
function OptionA() {
  const f = OPT_FILL, s = OPT_STROKE, sw = 2
  const cx = OPT_W / 2
  return (
    <>
      <Rect cx={cx} cy={92} w={72} h={18} fill={f} stroke={s} sw={sw} />
      <IsosTriangle cx={cx - 30} cy={56} w={36} h={44} fill={f} stroke={s} sw={sw} rotate={-32} />
      <IsosTriangle cx={cx} cy={48} w={36} h={44} fill={f} stroke={s} sw={sw} />
      <IsosTriangle cx={cx + 30} cy={56} w={36} h={44} fill={f} stroke={s} sw={sw} rotate={32} />
      <Circle cx={cx - 22} cy={122} r={20} fill={f} stroke={s} sw={sw} />
      <Circle cx={cx + 22} cy={122} r={20} fill={f} stroke={s} sw={sw} />
      <IsosTriangle cx={cx} cy={157} w={36} h={32} fill={f} stroke={s} sw={sw} rotate={180} />
    </>
  )
}

/** B (020): Snowman — uses a square hat + rectangle brim, so the piece set does not match. */
function OptionB() {
  const f = OPT_FILL, s = OPT_STROKE, sw = 2
  const cx = OPT_W / 2
  return (
    <>
      {/* square hat */}
      <Rect cx={cx} cy={22} w={36} h={32} fill={f} stroke={s} sw={sw} />
      {/* rectangle brim */}
      <Rect cx={cx} cy={43} w={68} h={14} fill={f} stroke={s} sw={sw} />
      {/* large circle body */}
      <Circle cx={cx} cy={100} r={34} fill={f} stroke={s} sw={sw} />
      {/* right triangle arm (pointing into the circle body) */}
      <RightTriangle cx={cx - 40} cy={94} w={26} h={24} flip={true} fill={f} stroke={s} sw={sw} />
      {/* small circle head */}
      <Circle cx={cx} cy={64} r={13} fill={f} stroke={s} sw={sw} />
      {/* triangle base */}
      <IsosTriangle cx={cx} cy={154} w={50} h={38} fill={f} stroke={s} sw={sw} />
    </>
  )
}

/** C (021): Totem — small circle, diagonal stick through large circle, right triangle, inverted small triangle. */
function OptionC() {
  const f = OPT_FILL, s = OPT_STROKE, sw = 2
  const cx = OPT_W / 2
  return (
    <>
      {/* small circle at top */}
      <Circle cx={cx} cy={20} r={13} fill={f} stroke={s} sw={sw} />
      {/* right triangle pointing right (two arms like arms of a scarecrow) */}
      <RightTriangle cx={cx - 24} cy={54} w={30} h={28} fill={f} stroke={s} sw={sw} />
      {/* diagonal stick / rectangle at angle */}
      <RotRect cx={cx + 12} cy={62} w={14} h={62} rotate={20} fill={f} stroke={s} sw={sw} />
      {/* large circle */}
      <Circle cx={cx} cy={112} r={34} fill={f} stroke={s} sw={sw} />
      {/* inverted small triangle at bottom */}
      <IsosTriangle cx={cx} cy={158} w={36} h={28} fill={f} stroke={s} sw={sw} rotate={180} />
    </>
  )
}

/** D (022): Cart — rectangle axle, 2 circles, large triangle + small inverted triangle (diamond roof). */
function OptionD() {
  const f = OPT_FILL, s = OPT_STROKE, sw = 2
  const cx = OPT_W / 2
  return (
    <>
      {/* large triangle body */}
      <IsosTriangle cx={cx} cy={82} w={88} h={66} fill={f} stroke={s} sw={sw} />
      {/* small inverted triangle forming diamond shape at top with large triangle */}
      <IsosTriangle cx={cx} cy={54} w={40} h={34} fill={f} stroke={s} sw={sw} rotate={180} />
      {/* rectangle axle bar */}
      <Rect cx={cx} cy={120} w={110} h={12} fill={f} stroke={s} sw={sw} />
      {/* left wheel */}
      <Circle cx={cx - 42} cy={138} r={20} fill={f} stroke={s} sw={sw} />
      {/* right wheel */}
      <Circle cx={cx + 42} cy={138} r={20} fill={f} stroke={s} sw={sw} />
    </>
  )
}

/**
 * E (023): Bicycle — uses exactly the 6 given pieces.
 *   2 large circles (wheels), rectangle (top frame bar),
 *   large triangle (main frame), right triangle (front fork),
 *   small triangle (rear seat / handlebar area).
 */
function OptionE() {
  const f = OPT_FILL, s = OPT_STROKE, sw = 2
  // Wheel positions (matching 023.jpg layout)
  const lCx = 46, rCx = 122, wheelY = 126, R = 30

  return (
    <>
      {/* left wheel */}
      <Circle cx={lCx} cy={wheelY} r={R} fill={f} stroke={s} sw={sw} />
      {/* right wheel */}
      <Circle cx={rCx} cy={wheelY} r={R} fill={f} stroke={s} sw={sw} />
      {/* rectangle — top horizontal frame bar */}
      <Rect cx={(lCx + rCx) / 2} cy={wheelY - 24} w={rCx - lCx + 8} h={10} fill={f} stroke={s} sw={sw} />
      {/* large triangle — main frame body between wheels */}
      <IsosTriangle cx={lCx + 36} cy={wheelY - 2} w={66} h={54} fill={f} stroke={s} sw={sw} />
      {/* right triangle — front fork (diagonal, upper right area) */}
      <RightTriangle cx={rCx - 14} cy={wheelY - 22} w={30} h={46} flip={true} fill={f} stroke={s} sw={sw} rotate={12} />
      {/* small triangle — rear area / seat post */}
      <IsosTriangle cx={lCx + 28} cy={wheelY - 52} w={28} h={24} fill={f} stroke={s} sw={sw} />
    </>
  )
}

const OPTION_RENDERERS: Record<OptionLabel, () => JSX.Element> = {
  A: OptionA,
  B: OptionB,
  C: OptionC,
  D: OptionD,
  E: OptionE,
}

const OPTION_ARIA: Record<OptionLabel, string> = {
  A: 'Option A: fan arrangement — rectangle in centre, three triangles radiating from the top, two circles and one inverted triangle below.',
  B: 'Option B: snowman — square hat on a rectangle brim, large circle body, right-triangle arm, small circle head, triangle base.',
  C: 'Option C: totem wand — small circle at top, diagonal stick through large circle, right triangle, inverted small triangle at bottom.',
  D: 'Option D: cart — large and small triangles forming a diamond roof, rectangle axle, two circles as wheels.',
  E: 'Option E: bicycle — two large circles as wheels, rectangle top bar, large triangle main frame, right triangle front fork, small triangle rear frame. This is the correct answer.',
}

/**
 * TwoPieces5ECOption — renders one A–E choice as an assembled figure picture.
 * Registered in CHOICE_RENDERERS for IKMC-20-EC-Q5.
 */
export function TwoPieces5ECOption({ choice }: { choice: WmiChoice }) {
  const label = (choice.label ?? '').trim().toUpperCase() as OptionLabel
  const render = OPTION_RENDERERS[label]
  const aria = OPTION_ARIA[label]
  if (!render) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={aria ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', padding: 2 }}
    >
      <svg
        viewBox={`0 0 ${OPT_W} ${OPT_H}`}
        width={OPT_W}
        height={OPT_H}
        style={{ display: 'block', background: OPT_BG, borderRadius: 4 }}
        aria-hidden="true"
      >
        {render()}
      </svg>
    </span>
  )
}
