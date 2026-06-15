// WMI-23F3A-Q4 (2023 Grade 3 Final) — two identical rectangles overlapping in a square.
//
// "Two identical rectangles overlap with each other, and the overlapping part is
// a square. Find the perimeter of this figure."  Answer: E = 312 (multiple choice).
//
// GEOMETRY / PROOF (for reference only — the static figure must NOT reveal 312
// nor the overlap-square side 20):
//   Each rectangle is 56 (long) × 42 (short). The two are point-symmetric about a
//   common centre and overlap in a square of side s. The shared edge geometry forces
//   s = 20, giving:
//       • the visible part of a long side  = 56 − s = 56 − 20 = 36   (the "36" arc)
//       • each interior "valley" notch edge = 42 − s = 42 − 20 = 22  (unlabelled)
//   The union outline is a point-symmetric octagon with edge run
//       56, 22, 36, 42,  56, 22, 36, 42.
//   Perimeter(union) = 2·(56 + 22 + 36 + 42) = 2·156 = 312.
//   Equivalently  2·(2·(56+42)) − 4·s = 2·196 − 80 = 392 − 80 = 312.  ✓
//
// The default export draws ONLY the problem setup: the tilted double-rectangle
// outline (green like the source) with the three printed measurements 56 / 42 / 36
// and their little arcs. It never shades the overlap square nor prints 20 / 22 / 312.
// Revealing the central square + the derived 20 / 22 lengths is the animator's job,
// via the co-exported OverlapRects23G3 primitive (showSquare / showDims).
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

const FILL = '#A8D8B9' // green body, matching the source figure
const OUTLINE = '#2F4F3E' // dark green-grey outline
const INK = '#1F2937' // measurement labels
const SQUARE_SHADE = '#7FC29B' // overlap-square shading (animator only)
const DIM = '#f0853a' // derived dimensions (animator only)

export const ANSWER = 312 // perimeter — never drawn in the static figure

// Rectangle dimensions and the forced overlap-square side (animator reference).
export const RECT_LONG = 56
export const RECT_SHORT = 42
export const OVERLAP_SIDE = 20 // s — never drawn in the static figure
export const VISIBLE_LONG = RECT_LONG - OVERLAP_SIDE // 36 — printed
export const NOTCH_EDGE = RECT_SHORT - OVERLAP_SIDE // 22 — animator only

/** Perimeter of the union octagon: 2·(56 + 22 + 36 + 42) = 312. */
export function unionPerimeter(): number {
  return 2 * (RECT_LONG + NOTCH_EDGE + VISIBLE_LONG + RECT_SHORT)
}

// ---- geometry --------------------------------------------------------------
// Two 56×42 rectangles, point-symmetric, overlapping in a 20×20 square. Built
// axis-aligned (A = [0,56]×[0,42], B = A reflected through the overlap centre),
// then rotated −45° to reproduce the source's tilted "double-diamond" look.
const CX = 46 // overlap-square centre (axis-aligned space)
const CY = 32
const THETA = (-45 * Math.PI) / 180
const COS = Math.cos(THETA)
const SIN = Math.sin(THETA)

function tilt(x: number, y: number): [number, number] {
  const dx = x - CX
  const dy = y - CY
  return [dx * COS - dy * SIN, dx * SIN + dy * COS]
}

// Union octagon, walked clockwise. Each vertex carries the length of the edge
// that LEAVES it (toward the next vertex) and whether that edge is printed.
const OCTAGON_RAW: Array<{ x: number; y: number }> = [
  { x: 0, y: 0 }, // v0  -> edge 56 (upper-left long, printed)
  { x: 56, y: 0 }, // v1  -> edge 22 (notch)
  { x: 56, y: 22 }, // v2  -> edge 36
  { x: 92, y: 22 }, // v3  -> edge 42
  { x: 92, y: 64 }, // v4  -> edge 56
  { x: 36, y: 64 }, // v5  -> edge 22
  { x: 36, y: 42 }, // v6  -> edge 36 (lower-middle, printed)
  { x: 0, y: 42 }, // v7  -> edge 42 (lower-left short, printed)
]
// Outline edge lengths (point-symmetric octagon): 56, 22, 36, 42, 56, 22, 36, 42 → perimeter 312.

// Overlap square corners (axis-aligned): [36,56]×[22,42].
const SQUARE_RAW: Array<{ x: number; y: number }> = [
  { x: 36, y: 22 },
  { x: 56, y: 22 },
  { x: 56, y: 42 },
  { x: 36, y: 42 },
]

const OCT = OCTAGON_RAW.map((p) => tilt(p.x, p.y))
const SQ = SQUARE_RAW.map((p) => tilt(p.x, p.y))

// Bounding box of the tilted outline (used to place into a padded canvas).
const XS = OCT.map((p) => p[0])
const YS = OCT.map((p) => p[1])
const MINX = Math.min(...XS)
const MINY = Math.min(...YS)
const MAXX = Math.max(...XS)
const MAXY = Math.max(...YS)

// Padding leaves headroom for the arc labels (heavier on the left/bottom where
// the 56 / 42 / 36 arcs swing out, exactly as in the source).
const PAD_L = 40
const PAD_R = 18
const PAD_T = 22
const PAD_B = 34
const OFFX = PAD_L - MINX
const OFFY = PAD_T - MINY
const VBW = (MAXX - MINX) + PAD_L + PAD_R
const VBH = (MAXY - MINY) + PAD_T + PAD_B

// Screen-space polygon point strings.
const POLY_POINTS = OCT.map((p) => `${(p[0] + OFFX).toFixed(2)},${(p[1] + OFFY).toFixed(2)}`).join(' ')
const SQ_POINTS = SQ.map((p) => `${(p[0] + OFFX).toFixed(2)},${(p[1] + OFFY).toFixed(2)}`).join(' ')

// Midpoint of edge i (the edge leaving vertex i), in screen space.
function edgeMid(i: number): [number, number] {
  const a = OCT[i]
  const b = OCT[(i + 1) % OCT.length]
  return [(a[0] + b[0]) / 2 + OFFX, (a[1] + b[1]) / 2 + OFFY]
}

// Outward normal of edge i (unit, pointing away from the centre), screen space.
function edgeNormal(i: number): [number, number] {
  const a = OCT[i]
  const b = OCT[(i + 1) % OCT.length]
  const ex = b[0] - a[0]
  const ey = b[1] - a[1]
  const len = Math.hypot(ex, ey) || 1
  // candidate normal (rotate edge by +90°)
  let nx = -ey / len
  let ny = ex / len
  // point it away from the figure centre (origin in tilted space ~ screen centre)
  const mx = (a[0] + b[0]) / 2
  const my = (a[1] + b[1]) / 2
  if (mx * nx + my * ny < 0) {
    nx = -nx
    ny = -ny
  }
  return [nx, ny]
}

/**
 * A measurement arc just outside edge `i`, with its number floated a little
 * further out along the outward normal. Mirrors the source's hand-drawn arcs.
 */
function MeasureArc({
  i,
  label,
  arcOut = 12,
  textOut = 22,
}: {
  i: number
  label: string
  arcOut?: number
  textOut?: number
}) {
  const a = OCT[i]
  const b = OCT[(i + 1) % OCT.length]
  const [nx, ny] = edgeNormal(i)
  const ax = a[0] + OFFX + nx * arcOut
  const ay = a[1] + OFFY + ny * arcOut
  const bx = b[0] + OFFX + nx * arcOut
  const by = b[1] + OFFY + ny * arcOut
  const [mx, my] = edgeMid(i)
  const r = Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.62
  return (
    <g>
      <path
        d={`M ${ax.toFixed(2)} ${ay.toFixed(2)} A ${r.toFixed(2)} ${r.toFixed(2)} 0 0 1 ${bx.toFixed(2)} ${by.toFixed(2)}`}
        fill="none"
        stroke={INK}
        strokeWidth={1.4}
        strokeLinecap="round"
        opacity={0.85}
      />
      <text
        x={(mx + nx * textOut).toFixed(2)}
        y={(my + ny * textOut).toFixed(2)}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={18}
        fontWeight={800}
        fill={INK}
      >
        {label}
      </text>
    </g>
  )
}

export interface OverlapRects23G3Props {
  /** Outline + shade the central 20×20 overlap square (animator only). */
  showSquare?: boolean
  /** Reveal the derived edge lengths 20 / 36 / 22 (animator only). */
  showDims?: boolean
}

/**
 * Primitive. Default (no props) is the plain problem figure: the tilted green
 * double-rectangle outline with the three printed arcs 56 / 42 / 36. The animator
 * passes `showSquare` to expose the overlap diamond and `showDims` to surface the
 * derived 20 / 22 lengths.
 */
export function OverlapRects23G3({ showSquare = false, showDims = false }: OverlapRects23G3Props = {}) {
  return (
    <svg viewBox={`0 0 ${VBW.toFixed(2)} ${VBH.toFixed(2)}`} width={Math.min(300, VBW)} aria-hidden="true">
      {/* the union body */}
      <polygon points={POLY_POINTS} fill={FILL} stroke={OUTLINE} strokeWidth={2.4} strokeLinejoin="round" />

      {/* central overlap square (animator only) */}
      {showSquare && (
        <polygon
          points={SQ_POINTS}
          fill={SQUARE_SHADE}
          stroke={OUTLINE}
          strokeWidth={1.8}
          strokeDasharray="4 3"
          strokeLinejoin="round"
        />
      )}

      {/* printed problem measurements: 56 (upper-left), 42 (lower-left), 36 (lower-middle) */}
      <MeasureArc i={0} label="56" arcOut={12} textOut={24} />
      <MeasureArc i={7} label="42" arcOut={12} textOut={22} />
      <MeasureArc i={6} label="36" arcOut={12} textOut={22} />

      {/* derived lengths (animator only): the overlap side 20 and the 22 notch edges */}
      {showDims && (
        <g>
          {/* 20 — along the overlap square's diagonal-aligned edge */}
          {(() => {
            const mx = (SQ[0][0] + SQ[1][0]) / 2 + OFFX
            const my = (SQ[0][1] + SQ[1][1]) / 2 + OFFY
            return (
              <text
                x={mx.toFixed(2)}
                y={my.toFixed(2)}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={14}
                fontWeight={800}
                fill={DIM}
              >
                20
              </text>
            )
          })()}
          {/* 22 on the two interior notch edges (edge 1 and edge 5) */}
          {[1, 5].map((i) => {
            const [mx, my] = edgeMid(i)
            const [nx, ny] = edgeNormal(i)
            return (
              <text
                key={i}
                x={(mx + nx * 14).toFixed(2)}
                y={(my + ny * 14).toFixed(2)}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={13}
                fontWeight={800}
                fill={DIM}
              >
                22
              </text>
            )
          })}
        </g>
      )}
    </svg>
  )
}

/**
 * Default export: the plain problem figure — two identical rectangles overlapping
 * in a square, tilted like the source, with only the printed measurements
 * 56 / 42 / 36. Reveals nothing about the overlap side (20) or the perimeter (312).
 */
export default function OverlapRects23G3Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Dua persegi panjang identik saling bertumpang tindih sehingga bagian yang bertumpang tindih membentuk sebuah persegi. Gambar miring berbentuk seperti dua belah ketupat hijau yang menyatu. Tertulis tiga ukuran: 56 pada sisi panjang kiri atas, 42 pada sisi pendek kiri bawah, dan 36 pada sisi tengah bawah. Cari keliling bangun ini."
    >
      <OverlapRects23G3 />
    </div>
  )
}
