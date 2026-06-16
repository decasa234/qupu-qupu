// WMI-23F3A-Q18 (2023 Grade 3 Final) — fan of shaded triangles over five squares.
//
// "Five squares are arranged side by side on a straight line. From the shortest
// to the longest, their side lengths are 2, 3, 4, 5, and 6. Find the area of the
// shaded region."  (fill-in; answer = 45.) The static figure must NOT reveal 45.
//
// FAITHFUL RECONSTRUCTION (verified against db/seed/wmi/figures/2023-final-g3-a-q18.jpg):
// Five squares sit on a common horizontal baseline. Their side lengths, read
// LEFT→RIGHT off the image, are [3, 5, 6, 4, 2] — the tallest (side 6) is the
// centre square. A single apex point P sits on the baseline at the bottom-left
// corner of that centre square. From P, straight lines fan out to the top corners
// of all five squares; the triangle from P up to each square's TOP EDGE is shaded
// light orange. So every square shows one orange triangle (apex P, base = that
// square's top edge) and the rest of the square is white.
//
// LATTICE MODEL (unit = one length unit; baseline y = 0, up is +y in math coords):
//   left edges, cumulative:  x0=0, then +3, +5, +6, +4  ->
//     sq0 s=3: x∈[0,3]     sq1 s=5: x∈[3,8]     sq2 s=6: x∈[8,14] (centre)
//     sq3 s=4: x∈[14,18]   sq4 s=2: x∈[18,20]
//   total width = 20, max height = 6.
//   P = bottom-left corner of the centre square = (8, 0).
//
// AREA PROOF (the answer — for reference only, NEVER drawn in the static figure):
// Each shaded triangle has its apex P ON the baseline and its base = a square's
// top edge, a horizontal segment of length s sitting at height s. So the triangle's
// base = s and its perpendicular height (baseline → top edge) = s, giving
//     area = ½ · base · height = ½ · s · s = s²/2 = HALF that square.
// This is independent of where P sits on the baseline (height is always s).
//   total shaded = ½·(2² + 3² + 4² + 5² + 6²)
//                = ½·(4 + 9 + 16 + 25 + 36) = ½·90 = 45.   ✓
//
// Pure render: no Math.random, no Date, no state — SSR-safe & deterministic.

export const ANSWER = 45 // total shaded area — NEVER drawn in the static figure

const INK = '#1F2937' // square outlines / baseline

/** Side lengths LEFT→RIGHT as they appear in the figure (tallest in centre). */
export const SIDES: readonly number[] = [3, 5, 6, 4, 2]

/** Left-edge x of each square (cumulative widths along the baseline). */
const LEFT_X: number[] = (() => {
  const xs: number[] = []
  let acc = 0
  for (const s of SIDES) {
    xs.push(acc)
    acc += s
  }
  return xs
})()

const TOTAL_W = SIDES.reduce((a, b) => a + b, 0) // 20
const MAX_S = Math.max(...SIDES) // 6

// Apex P = bottom-left corner of the centre (tallest) square.
const CENTRE_INDEX = SIDES.indexOf(MAX_S) // 2
const P_X = LEFT_X[CENTRE_INDEX] // 8
const P_Y = 0 // on the baseline

// ---- layout / math-units → SVG ---------------------------------------------
const UNIT = 17 // pixels per length unit
const PAD = 18 // headroom so nothing clips at the edges

const VIEW_W = TOTAL_W * UNIT + PAD * 2
const VIEW_H = MAX_S * UNIT + PAD * 2

const BASE_Y = PAD + MAX_S * UNIT // baseline y in SVG (y grows downward)

/** Math point (x up-positive) → SVG pixel { x, y } (y grows downward). */
function toSvg(x: number, y: number): { x: number; y: number } {
  return { x: PAD + x * UNIT, y: BASE_Y - y * UNIT }
}

function pointsAttr(pts: ReadonlyArray<{ x: number; y: number }>): string {
  return pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
}

const P_SVG = toSvg(P_X, P_Y)

/** Geometry of one square + its shaded triangle (apex P, base = top edge). */
function squareGeom(i: number) {
  const s = SIDES[i]
  const xL = LEFT_X[i]
  const xR = xL + s
  // square corners (math coords)
  const blM = { x: xL, y: 0 } // bottom-left
  const brM = { x: xR, y: 0 } // bottom-right
  const trM = { x: xR, y: s } // top-right
  const tlM = { x: xL, y: s } // top-left
  // shaded triangle: apex P, base = top edge (tl → tr)
  const tri = [{ x: P_X, y: P_Y }, tlM, trM].map((p) => toSvg(p.x, p.y))
  const square = [blM, brM, trM, tlM].map((p) => toSvg(p.x, p.y))
  return { s, tri, square, topLeft: toSvg(tlM.x, tlM.y), topRight: toSvg(trM.x, trM.y) }
}

const GEOMS = SIDES.map((_, i) => squareGeom(i))

export interface FiveSquares23G3Props {
  /**
   * Emphasize ONE square's shaded triangle (0..4, left→right) — deepens its
   * fill and bolds its outline so the animator can walk square-by-square.
   * Default = null (all triangles drawn uniformly).
   */
  highlightIndex?: number | null
  /**
   * Animator post-answer only. Annotates each shaded triangle with "s²/2" to
   * show it is exactly HALF its square. The per-square halves sum to the answer,
   * so this is OFF by default. Default = false (plain shaded figure).
   */
  showHalves?: boolean
}

/**
 * Core primitive. Draws the five squares on a common baseline, the fan of lines
 * from apex P to every top corner, and the orange triangle (apex P, base = top
 * edge) shaded inside each square. With `highlightIndex` it emphasizes one
 * triangle; with `showHalves` it labels each triangle as s²/2 (half its square).
 * By default it draws ONLY the setup and reveals nothing about the total (45).
 */
export function FiveSquares23G3({ highlightIndex = null, showHalves = false }: FiveSquares23G3Props = {}) {
  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={Math.min(280, VIEW_W)} aria-hidden="true">
      {/* shaded triangles (apex P → each square's top edge), drawn first */}
      {GEOMS.map((g, i) => {
        const on = highlightIndex === i
        return (
          <polygon
            key={`tri-${i}`}
            points={pointsAttr(g.tri)}
            className={on ? 'fill-qupu-orange-light' : 'fill-qupu-peach'}
            fillOpacity={on ? 1 : 0.92}
          />
        )
      })}

      {/* fan of lines from P to every top corner (over the shading) */}
      {GEOMS.map((g, i) => (
        <g key={`fan-${i}`}>
          <line
            x1={P_SVG.x}
            y1={P_SVG.y}
            x2={g.topLeft.x}
            y2={g.topLeft.y}
            stroke={INK}
            strokeWidth={1}
            strokeLinecap="round"
          />
          <line
            x1={P_SVG.x}
            y1={P_SVG.y}
            x2={g.topRight.x}
            y2={g.topRight.y}
            stroke={INK}
            strokeWidth={1}
            strokeLinecap="round"
          />
        </g>
      ))}

      {/* square outlines (over the fan so edges read crisp) */}
      {GEOMS.map((g, i) => {
        const on = highlightIndex === i
        return (
          <polygon
            key={`sq-${i}`}
            points={pointsAttr(g.square)}
            fill="none"
            stroke={INK}
            strokeWidth={on ? 2.4 : 1.4}
            strokeLinejoin="round"
          />
        )
      })}

      {/* common baseline */}
      <line
        x1={toSvg(0, 0).x}
        y1={BASE_Y}
        x2={toSvg(TOTAL_W, 0).x}
        y2={BASE_Y}
        stroke={INK}
        strokeWidth={1.6}
        strokeLinecap="round"
      />

      {/* apex point P on the baseline */}
      <circle cx={P_SVG.x} cy={P_SVG.y} r={2.6} className="fill-qupu-brand-blue" />

      {/* animator post-answer: each triangle = half its square (s²/2) */}
      {showHalves &&
        GEOMS.map((g, i) => {
          // label near the triangle's centroid, nudged up toward the apex
          const cx = (P_SVG.x + g.topLeft.x + g.topRight.x) / 3
          const cy = (P_SVG.y + g.topLeft.y + g.topRight.y) / 3 - 2
          return (
            <text
              key={`half-${i}`}
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={9}
              fontWeight={800}
              className="fill-qupu-brand-blue"
            >
              {`${g.s}²⁄2`}
            </text>
          )
        })}
    </svg>
  )
}

/**
 * Default export: the in-card setup figure — five squares on a common baseline,
 * a fan of lines from apex P up to every top corner, and the orange triangle
 * (apex P, base = each square's top edge) shaded inside each square. It shows
 * ONLY the setup; it never reveals the total shaded area (45).
 */
export default function FiveSquares23G3Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Lima persegi berdiri berdampingan pada satu garis datar, dengan panjang sisi dari kiri ke kanan 3, 5, 6, 4, dan 2 (persegi tertinggi di tengah). Dari satu titik P pada garis alas (sudut kiri-bawah persegi tengah) ditarik garis ke sudut-sudut atas setiap persegi, sehingga di tiap persegi terbentuk segitiga beralas sisi atas persegi yang diarsir oranye muda. Cari luas daerah yang diarsir."
    >
      <FiveSquares23G3 />
    </div>
  )
}
