// IKMC-23-EC-Q24 — "Teacher Olena wants to write the numbers 1 to 7 in the circles."
//
// PROBLEM FIGURE: 7 circles arranged in a heptagon ring.
// Between each pair of adjacent circles a small number shows their required SUM.
// One circle (bottom-right) is the GREEN shaded target — left empty in the static figure.
//
// THE LAYOUT (clockwise from top, index 0):
//   n0=top, n1=upper-right, n2=right, n3=lower-right, n4=GREEN(bottom-right),
//   n5=bottom, n6=left
//
// Edge sums (clockwise, edge between index i and (i+1)%7):
//   7, 8, 9, 6, 9, 8, 9
//
// SOLUTION (revealed only by the animator via `revealAnswer`):
//   n0=6, n1=1, n2=7, n3=2, n4=GREEN=4, n5=5, n6=3
//
// The static illustration shows:
//   - 7 empty white circles (+ green shaded circle) in a ring
//   - 7 edge-sum labels between adjacent circles
//   - The green circle is EMPTY (the question asks what number goes there)
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── Shared layout (re-exported for the explainer) ─────────────────────────

/** SVG viewport size (square). */
export const VIEW = 260

/** Radius of the heptagon ring (distance from centre to each node centre). */
export const RING_R = 90

/** Centre of the SVG. */
export const CX = VIEW / 2
export const CY = VIEW / 2

/** Radius of each circle node. */
export const NODE_R = 20

/** Total number of nodes. */
export const N = 7

/** Index of the GREEN (shaded) node. */
export const GREEN_IDX = 4

/** Edge sums clockwise: edge between node[i] and node[(i+1)%N]. */
export const EDGE_SUMS = [7, 8, 9, 6, 9, 8, 9] as const

/** Solution values for each node (only revealed by animator). */
export const NODE_VALUES = [6, 1, 7, 2, 4, 5, 3] as const

// ── Colour tokens (qupu palette) ─────────────────────────────────────────

const INK = '#1F2937'
const BLUE = '#30598A'
const ORANGE = '#f0853a'
const SHADE_FILL = '#FDE3CF'
const WHITE = '#FFFFFF'
const EDGE_LABEL_COLOR = '#4B5563'

// ── Geometry helpers ──────────────────────────────────────────────────────

/**
 * Returns the (x,y) centre of node at index i.
 * Index 0 is at the top; indices increase clockwise.
 */
function nodePos(i: number): { x: number; y: number } {
  // Start at -90° (top), step clockwise by 360°/N
  const angleDeg = -90 + (360 / N) * i
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: CX + RING_R * Math.cos(rad),
    y: CY + RING_R * Math.sin(rad),
  }
}

/**
 * Returns the midpoint between two node centres, shifted slightly outward from
 * the ring centre so the edge label sits just outside the edge midpoint.
 */
function edgeLabelPos(i: number): { x: number; y: number } {
  const a = nodePos(i)
  const b = nodePos((i + 1) % N)
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  // Push label away from the ring centre by a small amount
  const dx = mx - CX
  const dy = my - CY
  const dist = Math.sqrt(dx * dx + dy * dy) || 1
  const push = 10
  return {
    x: mx + (dx / dist) * push,
    y: my + (dy / dist) * push,
  }
}

// ── Primitive (shared with explainer) ─────────────────────────────────────

export interface PairSums24ECProps {
  /**
   * When true, reveals the correct number (4) inside the green circle.
   * Default: false (question state — green circle shows "?").
   */
  revealAnswer?: boolean
  /**
   * Optional per-node highlight set for the animator.
   * Nodes whose index is in this set get a blue ring stroke.
   */
  highlightNodes?: Set<number>
  /**
   * Optional per-edge highlight set for the animator.
   * Edges whose index is in this set get an orange stroke.
   */
  highlightEdges?: Set<number>
}

/**
 * Core heptagon-ring primitive for IKMC-23-EC-Q24.
 * Co-exported so the explainer can re-use without re-drawing.
 */
export function PairSums24EC({
  revealAnswer = false,
  highlightNodes,
  highlightEdges,
}: PairSums24ECProps = {}) {
  return (
    <svg
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      width={Math.min(260, VIEW)}
      aria-hidden="true"
    >
      {/* ── ring edges ─────────────────────────────────────────────────── */}
      {Array.from({ length: N }, (_, i) => {
        const a = nodePos(i)
        const b = nodePos((i + 1) % N)
        const hiEdge = highlightEdges?.has(i)
        return (
          <line
            key={`edge-${i}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={hiEdge ? ORANGE : INK}
            strokeWidth={hiEdge ? 2.8 : 2}
            strokeOpacity={hiEdge ? 1 : 0.55}
          />
        )
      })}

      {/* ── edge-sum labels ──────────────────────────────────────────────── */}
      {EDGE_SUMS.map((sum, i) => {
        const lp = edgeLabelPos(i)
        const hiEdge = highlightEdges?.has(i)
        return (
          <text
            key={`elabel-${i}`}
            x={lp.x}
            y={lp.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={13}
            fontWeight={700}
            fill={hiEdge ? ORANGE : EDGE_LABEL_COLOR}
            className="font-display"
          >
            {sum}
          </text>
        )
      })}

      {/* ── node circles ──────────────────────────────────────────────────── */}
      {Array.from({ length: N }, (_, i) => {
        const { x, y } = nodePos(i)
        const isGreen = i === GREEN_IDX
        const hiNode = highlightNodes?.has(i)
        const fill = isGreen ? SHADE_FILL : WHITE
        const stroke = isGreen ? ORANGE : hiNode ? BLUE : INK
        const strokeW = isGreen || hiNode ? 3 : 2.2
        const value = isGreen
          ? revealAnswer
            ? NODE_VALUES[GREEN_IDX]
            : null
          : null
        return (
          <g key={`node-${i}`}>
            <circle
              cx={x}
              cy={y}
              r={NODE_R}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeW}
            />
            {value != null && (
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={17}
                fontWeight={800}
                fill={ORANGE}
                className="font-display"
              >
                {value}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ── Default export (stem illustration) ────────────────────────────────────

/**
 * Static stem illustration — shows the 7-circle ring with edge-sum labels and
 * the empty green shaded circle. Never reveals the answer.
 */
export default function PairSums24ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Tujuh lingkaran disusun melingkar seperti segi tujuh. Di antara setiap dua lingkaran yang berdekatan terdapat angka yang menunjukkan jumlah kedua lingkaran tersebut: 7, 8, 9, 6, 9, 8, 9 searah jarum jam. Satu lingkaran berwarna hijau di kanan bawah masih kosong — temukan angka yang harus ditulis di sana."
    >
      <PairSums24EC revealAnswer={false} />
    </div>
  )
}
