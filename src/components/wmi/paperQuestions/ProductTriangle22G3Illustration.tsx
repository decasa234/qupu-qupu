// Product-triangle puzzle for WMI-22F3A-Q17.
//
// Reconstructed from db/seed/wmi/figures/2022-final-g3-a-q17.jpg:
// A triangle with teal edges; empty circles at each vertex and a pale-yellow
// square on each side showing the PRODUCT of its two endpoint vertices.
//
//          (top)
//         /     \
//      [104]   [72]
//       /         \
// (bot-L) --[117]-- (bot-R)
//
// Vertices (animator-only — never drawn here):  top=8, bot-L=13, bot-R=9
//   8 × 13 = 104  (upper-left side)
//   8 ×  9 =  72  (upper-right side)
//  13 ×  9 = 117  (bottom side)
//   sum = 8 + 13 + 9 = 30

export interface ProductTriangleProps {
  /** Product on the upper-left side (top vertex × bottom-left vertex). Default 104. */
  sideTopLeft?: number
  /** Product on the upper-right side (top vertex × bottom-right vertex). Default 72. */
  sideTopRight?: number
  /** Product on the bottom side (bottom-left × bottom-right vertex). Default 117. */
  sideBottom?: number
  /**
   * Optional revealed vertex values [top, bottomLeft, bottomRight].
   * When provided (animator phase), the numbers are drawn inside the circles.
   * Leave undefined to show empty circles (question phase).
   */
  vertices?: [number, number, number] | null
}

// Layout constants — all coordinates within a 300 × 270 viewBox.
const VB_W = 300
const VB_H = 270

// Vertex positions (centred, with headroom on all sides).
const V_TOP: [number, number] = [150, 28]
const V_BOT_L: [number, number] = [34, 234]
const V_BOT_R: [number, number] = [266, 234]

// Circle radius for vertex nodes.
const V_R = 22

// Square half-size for side labels.
const SQ_HALF = 26

// Teal edge colour (matches the original figure's cyan/teal lines).
const TEAL = '#2bbfc8'
const EDGE_W = 4

// Pale-yellow fill for side squares (matches original figure).
const SQ_FILL = '#FEFCE8'
const SQ_STROKE = '#D97706'

// Dark ink for text.
const INK = '#1F2937'
const CIRCLE_STROKE = '#374151'

/** Midpoint helper. */
function mid(a: [number, number], b: [number, number]): [number, number] {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
}

/**
 * ProductTriangle — the reusable primitive.
 *
 * Draws the triangle structure (teal edges, circles at vertices, squares on
 * sides). Pass `vertices` to reveal the vertex values (animator phase).
 */
export function ProductTriangle({
  sideTopLeft = 104,
  sideTopRight = 72,
  sideBottom = 117,
  vertices = null,
}: ProductTriangleProps) {
  const [vTop, vBotL, vBotR] = vertices ?? [null, null, null]

  // Midpoints where the side squares sit.
  const midTL = mid(V_TOP, V_BOT_L)
  const midTR = mid(V_TOP, V_BOT_R)
  const midBot = mid(V_BOT_L, V_BOT_R)

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width="100%"
      style={{ maxWidth: 300, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Teal triangle edges — drawn behind everything */}
      <line
        x1={V_TOP[0]} y1={V_TOP[1]}
        x2={V_BOT_L[0]} y2={V_BOT_L[1]}
        stroke={TEAL} strokeWidth={EDGE_W} strokeLinecap="round"
      />
      <line
        x1={V_TOP[0]} y1={V_TOP[1]}
        x2={V_BOT_R[0]} y2={V_BOT_R[1]}
        stroke={TEAL} strokeWidth={EDGE_W} strokeLinecap="round"
      />
      <line
        x1={V_BOT_L[0]} y1={V_BOT_L[1]}
        x2={V_BOT_R[0]} y2={V_BOT_R[1]}
        stroke={TEAL} strokeWidth={EDGE_W} strokeLinecap="round"
      />

      {/* Side squares with product labels */}
      {/* Upper-left side: 104 */}
      <rect
        x={midTL[0] - SQ_HALF} y={midTL[1] - SQ_HALF}
        width={SQ_HALF * 2} height={SQ_HALF * 2}
        rx={4}
        fill={SQ_FILL} stroke={SQ_STROKE} strokeWidth={2}
      />
      <text
        x={midTL[0]} y={midTL[1]}
        textAnchor="middle" dominantBaseline="central"
        fontSize={17} fontWeight={700} fill={INK}
      >
        {sideTopLeft}
      </text>

      {/* Upper-right side: 72 */}
      <rect
        x={midTR[0] - SQ_HALF} y={midTR[1] - SQ_HALF}
        width={SQ_HALF * 2} height={SQ_HALF * 2}
        rx={4}
        fill={SQ_FILL} stroke={SQ_STROKE} strokeWidth={2}
      />
      <text
        x={midTR[0]} y={midTR[1]}
        textAnchor="middle" dominantBaseline="central"
        fontSize={17} fontWeight={700} fill={INK}
      >
        {sideTopRight}
      </text>

      {/* Bottom side: 117 */}
      <rect
        x={midBot[0] - SQ_HALF} y={midBot[1] - SQ_HALF}
        width={SQ_HALF * 2} height={SQ_HALF * 2}
        rx={4}
        fill={SQ_FILL} stroke={SQ_STROKE} strokeWidth={2}
      />
      <text
        x={midBot[0]} y={midBot[1]}
        textAnchor="middle" dominantBaseline="central"
        fontSize={17} fontWeight={700} fill={INK}
      >
        {sideBottom}
      </text>

      {/* Vertex circles — always drawn on top of the edges */}
      {/* Top vertex */}
      <circle
        cx={V_TOP[0]} cy={V_TOP[1]}
        r={V_R}
        fill="white" stroke={CIRCLE_STROKE} strokeWidth={2.5}
      />
      {vTop != null && (
        <text
          x={V_TOP[0]} y={V_TOP[1]}
          textAnchor="middle" dominantBaseline="central"
          fontSize={16} fontWeight={900} fill={INK}
        >
          {vTop}
        </text>
      )}

      {/* Bottom-left vertex */}
      <circle
        cx={V_BOT_L[0]} cy={V_BOT_L[1]}
        r={V_R}
        fill="white" stroke={CIRCLE_STROKE} strokeWidth={2.5}
      />
      {vBotL != null && (
        <text
          x={V_BOT_L[0]} y={V_BOT_L[1]}
          textAnchor="middle" dominantBaseline="central"
          fontSize={16} fontWeight={900} fill={INK}
        >
          {vBotL}
        </text>
      )}

      {/* Bottom-right vertex */}
      <circle
        cx={V_BOT_R[0]} cy={V_BOT_R[1]}
        r={V_R}
        fill="white" stroke={CIRCLE_STROKE} strokeWidth={2.5}
      />
      {vBotR != null && (
        <text
          x={V_BOT_R[0]} y={V_BOT_R[1]}
          textAnchor="middle" dominantBaseline="central"
          fontSize={16} fontWeight={900} fill={INK}
        >
          {vBotR}
        </text>
      )}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// SAMPLE fallback — used when params has the wrong shape.
// ---------------------------------------------------------------------------
interface Params22G3Q17 {
  sideTopLeft: number
  sideTopRight: number
  sideBottom: number
}

const SAMPLE: Params22G3Q17 = {
  sideTopLeft: 104,
  sideTopRight: 72,
  sideBottom: 117,
}

/**
 * ProductTriangle22G3Illustration
 *
 * The in-card question figure for WMI-22F3A-Q17. Shows only the puzzle setup:
 * three empty circles at the triangle vertices and three product labels on the
 * sides. Never reveals the vertex values (that is the animator's job).
 *
 * Pure render from `params`, SSR-safe, deterministic.
 */
export default function ProductTriangle22G3Illustration({ params }: { params?: unknown }) {
  const p = (params ?? {}) as Partial<Params22G3Q17>
  const sideTopLeft =
    typeof p.sideTopLeft === 'number' ? p.sideTopLeft : SAMPLE.sideTopLeft
  const sideTopRight =
    typeof p.sideTopRight === 'number' ? p.sideTopRight : SAMPLE.sideTopRight
  const sideBottom =
    typeof p.sideBottom === 'number' ? p.sideBottom : SAMPLE.sideBottom

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={`Segitiga dengan lingkaran kosong di setiap sudut. Sisi kiri atas bertuliskan ${sideTopLeft}, sisi kanan atas bertuliskan ${sideTopRight}, sisi bawah bertuliskan ${sideBottom}. Setiap angka adalah hasil kali dua sudut yang menghubungkannya.`}
    >
      <ProductTriangle
        sideTopLeft={sideTopLeft}
        sideTopRight={sideTopRight}
        sideBottom={sideBottom}
        vertices={null}
      />
    </div>
  )
}
