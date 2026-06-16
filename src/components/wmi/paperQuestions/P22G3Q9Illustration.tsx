/**
 * P22G3Q9Illustration — WMI-22P3A-Q9 (2022 Grade 3 Semifinal)
 *
 * "Find the shapes with the longest and the shortest perimeters."  Answer B.
 *
 * Each shape's sides may be bowed IN or OUT by a matching arc, but an outward
 * bulge on one edge is always paired with an equal inward dent — the arcs cancel,
 * so every shape's perimeter equals its straight-edge outline.
 *
 *   P — rectangle 18 × 8        → perimeter 2·(18+8) = 52   (the SHORTEST)
 *   Q — pentagon (unlabelled in the paper; not numerically compared)
 *   R — triangle 10, 26, 24     → perimeter 10+26+24 = 60
 *   S — square side 16          → perimeter 16·4      = 64   (the LONGEST)
 *
 * The source figure (db/seed/wmi/figures/2022-semifinal-g3-a-q9.jpg) shows shape
 * P drawn with the matched-arc convention; the full question references all four
 * lettered shapes. This static figure draws ALL FOUR shapes with their given
 * dimensions and the bowed-arc decoration — the PROBLEM only, never the answer.
 * The original four answer options were pictures pairing a "longest" with a
 * "shortest" shape; the seed stores them as placeholders, so the explainer
 * derives the perimeters and points to option B.
 *
 * Pure render — no Math.random, no Date, no window/document. SSR-safe.
 */

const FILL = '#cfe8f5'
const STROKE = '#5b8fa8'
const ARC = '#5b8fa8'
const INK = '#1a3a4a'
const LABEL_BG = '#ffffff'

/** Perimeters that the explainer compares (Q is a non-numeric pentagon). */
export const PERIM = { P: 52, R: 60, S: 64 } as const
export const LONGEST = 'S' as const // square 64
export const SHORTEST = 'P' as const // rectangle 52

/**
 * A small dimension chip (number on a white pill) so labels never clash with the
 * shape outline. Shared with the explainer.
 */
export function DimChip({ x, y, text }: { x: number; y: number; text: string }) {
  const w = text.length * 8 + 8
  return (
    <g>
      <rect x={x - w / 2} y={y - 9} width={w} height={18} rx={4} fill={LABEL_BG} opacity={0.92} />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={700}
        fill={INK}
        fontFamily="sans-serif"
      >
        {text}
      </text>
    </g>
  )
}

/** Shape letter centred in its body. */
function ShapeLetter({ x, y, letter }: { x: number; y: number; letter: string }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={22}
      fontStyle="italic"
      fontWeight={700}
      fill={INK}
      fontFamily="serif"
    >
      {letter}
    </text>
  )
}

/**
 * Rectangle P (18 × 8) with bowed arcs: top/bottom bow OUT, left/right bow IN,
 * mirroring the source figure. The body fill follows the straight rectangle.
 */
export function ShapeP({ cx, cy }: { cx: number; cy: number }) {
  const w = 96
  const h = 48
  const x0 = cx - w / 2
  const y0 = cy - h / 2
  const x1 = cx + w / 2
  const y1 = cy + h / 2
  const bow = 12 // arc depth
  return (
    <g>
      <rect x={x0} y={y0} width={w} height={h} fill={FILL} stroke={STROKE} strokeWidth={1.6} />
      {/* top arc bows OUT (up) */}
      <path d={`M ${x0} ${y0} Q ${cx} ${y0 - bow} ${x1} ${y0}`} fill="none" stroke={ARC} strokeWidth={1.4} />
      {/* bottom arc bows OUT (down) */}
      <path d={`M ${x0} ${y1} Q ${cx} ${y1 + bow} ${x1} ${y1}`} fill="none" stroke={ARC} strokeWidth={1.4} />
      {/* left arc bows IN (right) */}
      <path d={`M ${x0} ${y0} Q ${x0 + bow} ${cy} ${x0} ${y1}`} fill="none" stroke={ARC} strokeWidth={1.4} />
      {/* right arc bows IN (left) */}
      <path d={`M ${x1} ${y0} Q ${x1 - bow} ${cy} ${x1} ${y1}`} fill="none" stroke={ARC} strokeWidth={1.4} />
      <ShapeLetter x={cx} y={cy} letter="P" />
      <DimChip x={cx} y={y0 - bow - 2} text="18" />
      <DimChip x={cx} y={y1 + bow + 2} text="18" />
      <DimChip x={x0 - 9} y={cy} text="8" />
      <DimChip x={x1 + 9} y={cy} text="8" />
    </g>
  )
}

/** Pentagon Q with one bowed-in / one bowed-out edge (no numeric labels). */
export function ShapeQ({ cx, cy }: { cx: number; cy: number }) {
  const r = 32
  // regular-ish pentagon, point up
  const pts = [0, 1, 2, 3, 4].map((i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const
  })
  const poly = pts.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' ')
  // one edge bowed out (right edge), one bowed in (left edge)
  const mid = (a: readonly [number, number], b: readonly [number, number]) =>
    [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as const
  const eRight = mid(pts[1], pts[2])
  const eLeft = mid(pts[3], pts[4])
  return (
    <g>
      <polygon points={poly} fill={FILL} stroke={STROKE} strokeWidth={1.6} />
      <path
        d={`M ${pts[1][0]} ${pts[1][1]} Q ${eRight[0] + 11} ${eRight[1]} ${pts[2][0]} ${pts[2][1]}`}
        fill="none"
        stroke={ARC}
        strokeWidth={1.4}
      />
      <path
        d={`M ${pts[3][0]} ${pts[3][1]} Q ${eLeft[0] + 11} ${eLeft[1]} ${pts[4][0]} ${pts[4][1]}`}
        fill="none"
        stroke={ARC}
        strokeWidth={1.4}
      />
      <ShapeLetter x={cx} y={cy + 2} letter="Q" />
    </g>
  )
}

/** Triangle R (sides 10, 26, 24) with bowed arcs. */
export function ShapeR({ cx, cy }: { cx: number; cy: number }) {
  // 10-24-26 right triangle scaled down; legs 24 (base) and 10 (height).
  const bw = 84 // base width on screen (= side 24)
  const hh = 35 // height on screen (= side 10)
  const A: [number, number] = [cx - bw / 2, cy + hh / 2] // bottom-left
  const B: [number, number] = [cx + bw / 2, cy + hh / 2] // bottom-right
  const C: [number, number] = [cx - bw / 2, cy - hh / 2] // top-left (right angle)
  const tri = `${A[0]},${A[1]} ${B[0]},${B[1]} ${C[0]},${C[1]}`
  return (
    <g>
      <polygon points={tri} fill={FILL} stroke={STROKE} strokeWidth={1.6} />
      {/* hypotenuse (26) bows OUT */}
      <path d={`M ${C[0]} ${C[1]} Q ${(C[0] + B[0]) / 2 + 9} ${(C[1] + B[1]) / 2 - 9} ${B[0]} ${B[1]}`} fill="none" stroke={ARC} strokeWidth={1.4} />
      {/* base (24) bows OUT down */}
      <path d={`M ${A[0]} ${A[1]} Q ${cx} ${A[1] + 11} ${B[0]} ${B[1]}`} fill="none" stroke={ARC} strokeWidth={1.4} />
      <ShapeLetter x={cx - 6} y={cy + 4} letter="R" />
      <DimChip x={A[0] - 12} y={cy} text="10" />
      <DimChip x={cx} y={A[1] + 12} text="24" />
      <DimChip x={(C[0] + B[0]) / 2 + 14} y={(C[1] + B[1]) / 2 - 12} text="26" />
    </g>
  )
}

/** Square S (side 16) with bowed arcs. */
export function ShapeS({ cx, cy }: { cx: number; cy: number }) {
  const s = 60
  const x0 = cx - s / 2
  const y0 = cy - s / 2
  const x1 = cx + s / 2
  const y1 = cy + s / 2
  const bow = 11
  return (
    <g>
      <rect x={x0} y={y0} width={s} height={s} fill={FILL} stroke={STROKE} strokeWidth={1.6} />
      <path d={`M ${x0} ${y0} Q ${cx} ${y0 - bow} ${x1} ${y0}`} fill="none" stroke={ARC} strokeWidth={1.4} />
      <path d={`M ${x0} ${y1} Q ${cx} ${y1 + bow} ${x1} ${y1}`} fill="none" stroke={ARC} strokeWidth={1.4} />
      <path d={`M ${x0} ${y0} Q ${x0 + bow} ${cy} ${x0} ${y1}`} fill="none" stroke={ARC} strokeWidth={1.4} />
      <path d={`M ${x1} ${y0} Q ${x1 - bow} ${cy} ${x1} ${y1}`} fill="none" stroke={ARC} strokeWidth={1.4} />
      <ShapeLetter x={cx} y={cy} letter="S" />
      <DimChip x={cx} y={y0 - bow - 2} text="16" />
      <DimChip x={x1 + 11} y={cy} text="16" />
    </g>
  )
}

export const VIEW_W = 420
export const VIEW_H = 220

/** All four shapes laid out in a 2×2 grid. Shared with the explainer. */
export function Shapes22G3Q9({ emphasis }: { emphasis?: 'P' | 'Q' | 'R' | 'S' | null }) {
  const ring = (letter: 'P' | 'Q' | 'R' | 'S', cx: number, cy: number, rx: number, ry: number) =>
    emphasis === letter ? (
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="#f59e0b" strokeWidth={3} strokeDasharray="6 4" />
    ) : null
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {ring('P', 110, 60, 74, 48)}
      {ring('Q', 320, 58, 48, 44)}
      {ring('R', 110, 162, 60, 40)}
      {ring('S', 320, 160, 48, 46)}
      <ShapeP cx={110} cy={60} />
      <ShapeQ cx={320} cy={58} />
      <ShapeR cx={110} cy={162} />
      <ShapeS cx={320} cy={160} />
    </svg>
  )
}

export default function P22G3Q9Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Empat bangun datar P, Q, R, S yang sisinya boleh melengkung ke dalam atau ke luar dengan busur yang sepadan. P persegi panjang 18 kali 8, Q segi lima, R segitiga dengan sisi 10, 26, 24, dan S persegi dengan sisi 16. Cari bangun dengan keliling terpanjang dan terpendek."
    >
      <Shapes22G3Q9 />
    </div>
  )
}
