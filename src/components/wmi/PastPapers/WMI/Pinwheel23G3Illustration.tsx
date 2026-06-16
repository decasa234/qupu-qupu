// WMI-23F3A-Q19 (2023 Grade 3 Final) — pinwheel of 4 identical rectangles.
//
// "The figure is made up of 4 identical rectangles. The perimeter of the whole
// figure is 48 cm and its area is 90 cm². Find the perimeter of one rectangle."
// Answer: 19.5 cm (fill-in).
//
// GEOMETRY (header proof — the static figure must NOT reveal L, W, or 19.5):
// Four identical L×W rectangles are arranged rotationally (pinwheel) around a
// small square hole. The arrangement gives:
//     outer bounding square side = L + W
//     central square hole side    = L − W
// Whole-figure AREA   = 4·L·W = 90        ⇒  L·W = 22.5
// Whole-figure PERIM  = 4(L+W) + 4(L−W) = 8L = 48  ⇒  L = 6,  W = 22.5/6 = 3.75
// One rectangle's PERIMETER = 2(L+W) = 2(6 + 3.75) = 2·9.75 = 19.5 ✓
// (Outer square side = 9.75, inner hole side = L−W = 2.25.)
//
// The default export draws ONLY the pinwheel setup — no dimensions, no answer.
// The co-exported `Pinwheel23G3` primitive optionally labels L/W and the
// outer/inner squares (animator post-answer only) via `showDims`.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

// True proportions L:W = 6:3.75 = 8:5 (faithful to source figure, values hidden).
const L = 6 // long side (cm) — NEVER printed unless showDims
const W = 3.75 // short side (cm) — NEVER printed unless showDims
const OUTER = L + W // 9.75 — outer bounding square side
const INNER = L - W // 2.25 — central square hole side

export const ANSWER = 19.5 // one rectangle's perimeter — never drawn statically

// Light-pink rectangle fill + dark outline matching the source figure.
// No qupu-* token maps to this pink (cf. BlockPack22G1 using #FBCFE8); kept as a
// named constant for faithfulness to the printed paper.
const PINK = '#F6D6E4' // rectangle fill (source ~light pink)
const OUTLINE = '#3B3340' // dark rectangle outline
const INK = '#1F2937' // dimension labels (showDims only)
const ACCENT = '#f0853a' // fill-qupu-brand-orange — outer/inner callouts (showDims)

// ---- layout ----------------------------------------------------------------
const SCALE = 26 // user units per cm
const PAD = 18 // padding around the pinwheel
const DIM_PAD = 40 // extra room for dimension labels when showDims

// The four rectangles, in a coordinate box [0,OUTER]×[0,OUTER] (y points down).
// Pinwheel arrangement faithful to db/seed/wmi/figures/2023-final-g3-a-q19.jpg:
//   top:    vertical bar, top-left      right edge meets the hole's left edge
//   right:  horizontal bar, top-right   bottom edge meets the hole's top edge
//   bottom: vertical bar, bottom-right  left edge meets the hole's right edge
//   left:   horizontal bar, bottom-left top edge meets the hole's bottom edge
// All four share corners pinwheel-style around the central INNER×INNER hole.
const RECTS: ReadonlyArray<{ x: number; y: number; w: number; h: number }> = [
  { x: 0, y: 0, w: W, h: L }, // top (vertical)
  { x: OUTER - L, y: 0, w: L, h: W }, // right (horizontal)
  { x: OUTER - W, y: OUTER - L, w: W, h: L }, // bottom (vertical)
  { x: 0, y: OUTER - W, w: L, h: W }, // left (horizontal)
]

export interface Pinwheel23G3Props {
  /**
   * When true, label L, W, the outer square side (L+W) and the inner hole side
   * (L−W) — for the animator's post-answer reveal only. Default draws the plain
   * pinwheel (no dimensions, no answer leak).
   */
  showDims?: boolean
}

/**
 * Pinwheel primitive. Draws the 4-rectangle pinwheel with its central square
 * hole. With `showDims`, annotates the long/short sides and the outer/inner
 * squares; otherwise it commits to no values.
 */
export function Pinwheel23G3({ showDims = false }: Pinwheel23G3Props = {}) {
  const sx = (cm: number) => PAD + cm * SCALE
  const sy = (cm: number) => PAD + cm * SCALE

  const figW = OUTER * SCALE + PAD * 2 + (showDims ? DIM_PAD : 0)
  const figH = OUTER * SCALE + PAD * 2 + (showDims ? DIM_PAD : 0)

  // Central hole bounds (for the optional inner-square callout).
  const holeX = sx(W)
  const holeY = sy(W)
  const holeSide = INNER * SCALE

  return (
    <svg viewBox={`0 0 ${figW} ${figH}`} width={Math.min(280, figW)} aria-hidden="true">
      {/* the four identical rectangles forming the pinwheel */}
      {RECTS.map((r, i) => (
        <rect
          key={`r-${i}`}
          x={sx(r.x)}
          y={sy(r.y)}
          width={r.w * SCALE}
          height={r.h * SCALE}
          fill={PINK}
          stroke={OUTLINE}
          strokeWidth={2}
          strokeLinejoin="miter"
        />
      ))}

      {showDims && (
        <g>
          {/* inner square hole outline + side label */}
          <rect
            x={holeX}
            y={holeY}
            width={holeSide}
            height={holeSide}
            fill="none"
            stroke={ACCENT}
            strokeWidth={2}
            strokeDasharray="4 3"
          />
          <text
            x={holeX + holeSide / 2}
            y={holeY + holeSide / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fontWeight={800}
            fill={ACCENT}
          >
            {INNER}
          </text>

          {/* long side L on the top rectangle's left edge */}
          <text
            x={sx(0) - 11}
            y={sy(L / 2)}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={13}
            fontWeight={800}
            fill={INK}
          >
            {`L=${L}`}
          </text>

          {/* short side W along the top rectangle's top edge */}
          <text
            x={sx(W / 2)}
            y={sy(0) - 9}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={13}
            fontWeight={800}
            fill={INK}
          >
            {`W=${W}`}
          </text>

          {/* outer square side (L+W) along the bottom edge */}
          <text
            x={sx(OUTER / 2)}
            y={sy(OUTER) + 18}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={13}
            fontWeight={800}
            fill={ACCENT}
          >
            {`L+W=${OUTER}`}
          </text>
        </g>
      )}
    </svg>
  )
}

/**
 * Default export: the plain 4-rectangle pinwheel with its central square hole.
 * Reveals no dimensions and never shows the 19.5 answer — only the setup.
 */
export default function Pinwheel23G3Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Bangun yang tersusun dari 4 persegi panjang identik yang disusun memutar (pinwheel) mengelilingi sebuah lubang persegi kecil di tengah: satu persegi panjang tegak di atas, satu mendatar di kanan, satu tegak di bawah, dan satu mendatar di kiri. Keliling seluruh bangun 48 cm dan luasnya 90 cm². Cari keliling satu persegi panjang."
    >
      <Pinwheel23G3 />
    </div>
  )
}
