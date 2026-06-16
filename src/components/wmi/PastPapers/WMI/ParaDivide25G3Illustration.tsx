// WMI-25F3A-Q19 — "How many parallelograms and trapezoids are there in the figure in total?" (answer 14)
// In-card SVG reconstruction of the divided parallelogram from db/seed/wmi/figures/2025-final-g3-a-q19.jpg.
// Pure render, SSR-safe, deterministic, problem-only (never highlights the counted shapes).
// Geometry constants and the `paraPoint` / `ParaPolygon` primitives are co-exported so the
// step-explainer binds to the same lattice and can tint individual counted shapes after the answer.

const INK = '#1F2937'

/* ------------------------------------------------------------------ *
 * Geometry, in a skewed-parallelogram coordinate space.
 *
 * The outer figure is a right-leaning parallelogram. Points are addressed by a
 * unit-square coordinate (u across the base 0..1, v up the slanted side 0..1) and
 * projected with a horizontal skew so the top edge sits to the right of the bottom
 * edge, matching the scan.
 *
 * Named lattice points (u, v):
 *   Corners:      BL(0,0)  BR(1,0)  TR(1,1)  TL(0,1)
 *   Midline:      ML(0,0.5)  Q(0.20,0.5)  R(0.40,0.5)  S(0.62,0.5)  MR(1,0.5)
 *   Top edge:     A(0.40,1)  B(0.62,1)
 *   Bottom apex:  C(0.42,0)
 *
 * Dividing lines read from the scan (five internal strokes):
 *   1. Horizontal midline      ML —— MR        (full width: splits the figure into top / bottom band)
 *   2. Central vertical         A —— R          (top point A straight down to the midline node R)
 *   3. Upper-left slant         A —— Q          (down-left to midline node Q -> narrow top-left triangle A-Q-R)
 *   4. Lower "V" left arm        Q —— C         (midline node Q down to the bottom apex C)
 *   5. Lower "V" right arm       R —— C         (midline node R down to the bottom apex C)
 *   6. Upper-right vertical      B —— S          (splits the upper-right cell in two)
 *
 * So the upper-left holds a small triangle (A-Q-R) and the lower-centre holds the
 * downward "V" triangle (Q-R-C); the rest of the figure is the grid of cells.
 * ------------------------------------------------------------------ */

export type ParaUV = readonly [number, number]

// Projection constants (viewBox space).
const ORIGIN_X = 30 // bottom-left x
const BASE_Y = 158 // bottom edge y
const BASE_W = 300 // horizontal length of base
const SIDE_H = 120 // vertical rise of the slanted side
const SKEW = 70 // horizontal shift of the top edge (right lean)

/** Project a unit-square coordinate (u across, v up) into the skewed parallelogram. */
export function paraPoint([u, v]: ParaUV): { x: number; y: number } {
  return {
    x: ORIGIN_X + u * BASE_W + v * SKEW,
    y: BASE_Y - v * SIDE_H,
  }
}

// Named lattice points used by both the figure and the explainer.
export const PARA_POINTS = {
  BL: [0, 0] as ParaUV,
  BR: [1, 0] as ParaUV,
  TR: [1, 1] as ParaUV,
  TL: [0, 1] as ParaUV,
  ML: [0, 0.5] as ParaUV,
  Q: [0.2, 0.5] as ParaUV,
  R: [0.4, 0.5] as ParaUV,
  S: [0.62, 0.5] as ParaUV,
  MR: [1, 0.5] as ParaUV,
  A: [0.4, 1] as ParaUV,
  B: [0.62, 1] as ParaUV,
  C: [0.42, 0] as ParaUV,
} as const

export type ParaPointName = keyof typeof PARA_POINTS

// The internal dividing segments (the outer border is drawn separately).
export const PARA_DIVIDERS: Array<[ParaPointName, ParaPointName]> = [
  ['ML', 'MR'], // 1. horizontal midline
  ['A', 'R'], // 2. central vertical
  ['A', 'Q'], // 3. upper-left slant
  ['Q', 'C'], // 4. lower V left arm
  ['R', 'C'], // 5. lower V right arm
  ['B', 'S'], // 6. upper-right vertical
]

function project(name: ParaPointName) {
  return paraPoint(PARA_POINTS[name])
}

/** A filled polygon addressed by lattice-point names — used by the explainer to tint a counted shape. */
export function ParaPolygon({
  pts,
  fill,
  stroke = INK,
  strokeWidth = 2,
  opacity = 1,
}: {
  pts: ParaPointName[]
  fill: string
  stroke?: string
  strokeWidth?: number
  opacity?: number
}) {
  const d = pts
    .map((name) => {
      const p = project(name)
      return `${p.x},${p.y}`
    })
    .join(' ')
  return <polygon points={d} fill={fill} stroke={stroke} strokeWidth={strokeWidth} opacity={opacity} />
}

function Segment({ a, b, w = 2 }: { a: ParaPointName; b: ParaPointName; w?: number }) {
  const p1 = project(a)
  const p2 = project(b)
  return <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={INK} strokeWidth={w} strokeLinecap="round" />
}

/** The static problem figure (no shape highlighted). Reusable by the animator before reveal. */
export function ParaDivideFigure() {
  return (
    <svg viewBox="0 0 430 200" width="100%" style={{ maxWidth: 360, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {/* outer parallelogram */}
      <ParaPolygon pts={['BL', 'BR', 'TR', 'TL']} fill="none" stroke={INK} strokeWidth={2.4} />
      {/* internal dividing lines */}
      {PARA_DIVIDERS.map(([a, b], i) => (
        <Segment key={i} a={a} b={b} />
      ))}
    </svg>
  )
}

export function ParaDivide25G3Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Sebuah jajar genjang besar yang condong ke kanan, dibagi oleh garis-garis di dalamnya: satu garis tengah mendatar yang membaginya menjadi pita atas dan bawah, satu garis tegak di tengah dari sisi atas turun ke garis tengah, satu garis miring yang membentuk segitiga kecil di kiri atas, dua garis yang membentuk huruf V di bagian bawah, dan satu garis tegak di kanan atas. Hitung banyaknya jajar genjang dan trapesium di dalam gambar."
    >
      <ParaDivideFigure />
    </div>
  )
}

export default ParaDivide25G3Illustration
