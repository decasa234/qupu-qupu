// Composite-rectangle illustration for WMI-24F3A-Q6.
//
// Shape: a small rectangle (30 cm wide, ★ cm tall) sits on top of a large
// rectangle (50 cm wide, 22 cm tall), centred, creating 10 cm ledges on each
// side. The figure shows the four labelled dimensions + the ★ region; it does
// NOT reveal ★ = 12 (the answer).
//
// Exported primitives let the step-explainer re-use the same geometry.

const INK = '#1F2937'

// --- geometry -----------------------------------------------------------------

/** Pixel unit for 1 cm in the SVG coordinate space. */
export const PX_PER_CM = 4.4

/** Width of the bottom (large) rectangle in cm. */
export const BOTTOM_W_CM = 50
/** Height of the bottom (large) rectangle in cm. */
export const BOTTOM_H_CM = 22
/** Width of the top (small) rectangle in cm. */
export const TOP_W_CM = 30
/** The ledge that sticks out each side: (50 − 30) / 2 = 10 cm. */
export const LEDGE_CM = (BOTTOM_W_CM - TOP_W_CM) / 2 // 10

// --- colours ------------------------------------------------------------------
const FILL_BODY = '#F9C6C6'   // light pink – matches the scanned figure
const STROKE_BODY = '#C0474A' // darker red-pink border
const FILL_STAR = '#FDEBD0'   // warm cream for the ★ region highlight
const LABEL_COLOR = INK

// --- SVG viewport -------------------------------------------------------------
// We work in cm-space (scaled by PX_PER_CM) and add padding.
const PAD_L = 48  // space for the 22 cm and 10 cm left-side labels
const PAD_R = 56  // space for the ★ cm right-side label
const PAD_T = 36  // space for the 30 cm top label
const PAD_B = 32  // space for the 50 cm bottom label

const bW = BOTTOM_W_CM * PX_PER_CM   // bottom rect pixel width
const bH = BOTTOM_H_CM * PX_PER_CM   // bottom rect pixel height
const tW = TOP_W_CM    * PX_PER_CM   // top rect pixel width
// ★ height: we draw the top rect at a fixed height for the static figure.
// We choose 12 × PX_PER_CM so the proportions match the original,
// but the ★ label (not a number) is what the viewer reads.
const STAR_H_CM = 12 // visually representative — does NOT reveal the answer
const tH = STAR_H_CM * PX_PER_CM

const ledgeW = LEDGE_CM * PX_PER_CM

// Shape origin: top-left of the bottom rectangle in SVG space
const originX = PAD_L
const originY = PAD_T + tH  // bottom rect starts below the top rect

// Top rectangle origin (centred on the bottom rect)
const topX = originX + ledgeW
const topY = PAD_T

const svgW = PAD_L + bW + PAD_R
const svgH = PAD_T + tH + bH + PAD_B

// ---------------------------------------------------------------------------
// The composite outline as a single closed polygon (clockwise from top-left
// of the top rectangle).
//
//   (topX, topY) ─────── (topX+tW, topY)
//        |                         |
//   (topX, topY+tH)     (topX+tW, topY+tH)  ← step corners
//  /                                    \
// (originX, topY+tH)        (originX+bW, topY+tH)
//        |                                  |
// (originX, originY+bH) ─── (originX+bW, originY+bH)
function shapePoints(): string {
  const lx = topX,          ly = topY
  const rx = topX + tW,     ry = topY
  const lx2 = topX,         ly2 = topY + tH
  const rx2 = topX + tW,    ry2 = topY + tH
  const blx = originX,      bly = topY + tH
  const brx = originX + bW, bry = topY + tH
  const botlx = originX,    botly = originY + bH
  const botrx = originX + bW, botry = originY + bH

  return [
    `${lx},${ly}`,
    `${rx},${ry}`,
    `${rx2},${ry2}`,
    `${brx},${bry}`,
    `${botrx},${botry}`,
    `${botlx},${botly}`,
    `${blx},${bly}`,
    `${lx2},${ly2}`,
  ].join(' ')
}

// ---------------------------------------------------------------------------
// Small tick marks for dimension lines.
function Tick({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={LABEL_COLOR} strokeWidth={1.2} />
}

// Italic dimension label, centred at (x, y).
function DimLabel({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={13}
      fontWeight={700}
      fontStyle="italic"
      fill={LABEL_COLOR}
    >
      {text}
    </text>
  )
}

// ---------------------------------------------------------------------------

export function CompositeRectFigure({ showStarValue }: { showStarValue?: number }) {
  const starLabel = showStarValue != null ? `${showStarValue} cm` : '★ cm'

  // Arrow / bracket offset from the shape edge
  const arrowGap = 6
  const tickLen = 5

  // --- 30 cm top label (above the top rectangle, centred on it)
  const top30Y = topY - arrowGap - 8
  const top30X = topX + tW / 2

  // --- ★ cm right label (right side of the top rectangle)
  const starX = topX + tW + arrowGap + 22
  const starY = topY + tH / 2

  // --- 10 cm left ledge label (left side, spanning the ledge height)
  const ledge10X = originX - arrowGap - 18
  const ledge10Y = topY + tH / 2

  // --- 22 cm left label (left side of the bottom rectangle)
  const h22X = originX - arrowGap - 18
  const h22Y = originY + bH / 2

  // --- 50 cm bottom label (below the bottom rectangle)
  const bot50Y = originY + bH + arrowGap + 12
  const bot50X = originX + bW / 2

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      width={Math.min(300, svgW)}
      style={{ display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* composite shape fill */}
      <polygon
        points={shapePoints()}
        fill={FILL_BODY}
        stroke={STROKE_BODY}
        strokeWidth={2.2}
        strokeLinejoin="round"
      />

      {/* subtle highlight on the top (★) rectangle region */}
      <rect
        x={topX}
        y={topY}
        width={tW}
        height={tH}
        fill={FILL_STAR}
        opacity={0.45}
      />

      {/* --- dimension lines & labels --- */}

      {/* 30 cm: top edge of the top rectangle */}
      <line x1={topX} y1={top30Y} x2={topX + tW} y2={top30Y} stroke={LABEL_COLOR} strokeWidth={1.2} />
      <Tick x1={topX}      y1={top30Y - tickLen} x2={topX}      y2={top30Y + tickLen} />
      <Tick x1={topX + tW} y1={top30Y - tickLen} x2={topX + tW} y2={top30Y + tickLen} />
      <DimLabel x={top30X} y={top30Y - 10} text="30 cm" />

      {/* ★ cm: right side of the top rectangle */}
      <line x1={starX - 4} y1={topY} x2={starX - 4} y2={topY + tH} stroke={LABEL_COLOR} strokeWidth={1.2} />
      <Tick x1={starX - 4 - tickLen} y1={topY}      x2={starX - 4 + tickLen} y2={topY} />
      <Tick x1={starX - 4 - tickLen} y1={topY + tH} x2={starX - 4 + tickLen} y2={topY + tH} />
      <DimLabel x={starX + 8} y={starY} text={starLabel} />

      {/* 10 cm: left ledge height */}
      <line x1={ledge10X + 4} y1={topY} x2={ledge10X + 4} y2={topY + tH} stroke={LABEL_COLOR} strokeWidth={1.2} />
      <Tick x1={ledge10X + 4 - tickLen} y1={topY}      x2={ledge10X + 4 + tickLen} y2={topY} />
      <Tick x1={ledge10X + 4 - tickLen} y1={topY + tH} x2={ledge10X + 4 + tickLen} y2={topY + tH} />
      <DimLabel x={ledge10X - 8} y={ledge10Y} text="10 cm" />

      {/* 22 cm: left side of the bottom rectangle */}
      <line x1={h22X + 4} y1={originY} x2={h22X + 4} y2={originY + bH} stroke={LABEL_COLOR} strokeWidth={1.2} />
      <Tick x1={h22X + 4 - tickLen} y1={originY}      x2={h22X + 4 + tickLen} y2={originY} />
      <Tick x1={h22X + 4 - tickLen} y1={originY + bH} x2={h22X + 4 + tickLen} y2={originY + bH} />
      <DimLabel x={h22X - 8} y={h22Y} text="22 cm" />

      {/* 50 cm: bottom edge */}
      <line x1={originX} y1={bot50Y} x2={originX + bW} y2={bot50Y} stroke={LABEL_COLOR} strokeWidth={1.2} />
      <Tick x1={originX}      y1={bot50Y - tickLen} x2={originX}      y2={bot50Y + tickLen} />
      <Tick x1={originX + bW} y1={bot50Y - tickLen} x2={originX + bW} y2={bot50Y + tickLen} />
      <DimLabel x={bot50X} y={bot50Y + 12} text="50 cm" />
    </svg>
  )
}

export default function CompositeRect24G3Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Bangun gabungan dua persegi panjang: persegi panjang besar di bawah lebar 50 cm, tinggi 22 cm; persegi panjang kecil di atas lebar 30 cm, tinggi bintang cm; tepi samping 10 cm. Keliling 168 cm, cari bintang."
    >
      <CompositeRectFigure />
    </div>
  )
}
