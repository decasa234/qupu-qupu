/**
 * WMI-22F3A-Q3 — Nested Triangle puzzle illustration.
 *
 * Three panels, each showing a green triangle that maps to a number via a
 * purple arrow. The rule is: read digit labels from the most-nested triangle
 * outward and concatenate.
 *
 *   Panel 1 — plain triangle labeled 4  →  "4"
 *   Panel 2 — outer triangle (2) containing inner triangle (1)  →  "12"
 *   Panel 3 — outer (6), middle single (5, lower-left),
 *              innermost double-outlined (2, top-centre)  →  "?"
 *
 * This file also exports LabeledTriangle, a reusable primitive the animator
 * can import to build the reveal animation.
 *
 * Pure render — no Math.random, no Date, no useState/useEffect side effects.
 * SSR-safe and deterministic.
 */

// ─── geometry helpers ────────────────────────────────────────────────────────

/** Equilateral-triangle vertex points centred at (cx, cy). */
function triPts(cx: number, cy: number, halfW: number): string {
  const h = (halfW * 2 * Math.sqrt(3)) / 2 // full height
  const top = cy - h * 0.62
  const bot = cy + h * 0.38
  return `${cx},${top} ${cx - halfW},${bot} ${cx + halfW},${bot}`
}

// ─── colours (no raw hex where a token exists; purple/green are problem-
//     specific so we use carefully chosen literals consistent with the source) ─
const TRI_FILL = '#d9ead3'    // light green, matches source figure
const TRI_STROKE = '#3d5a34'  // dark green outline
const ARROW_COLOR = '#9c7fc0' // muted purple, matches source figure
const LABEL_COLOR = '#1a2e18' // near-black green-tinted for readability

// ─── LabeledTriangle primitive ───────────────────────────────────────────────

export interface TriangleSpec {
  /** Centre x in the local SVG coordinate space. */
  cx: number
  /** Centre y. */
  cy: number
  /** Half-width of the triangle base. */
  halfW: number
  /** Digit label shown near the bottom-right interior of the triangle. */
  label: string
  /**
   * Number of outline strokes drawn (1 = normal, 2 = double-outlined).
   * Double-outline marks the innermost triangle in panel 3.
   */
  outlines?: 1 | 2
  /** Extra strokeWidth override (default 1.8). */
  strokeWidth?: number
}

/**
 * LabeledTriangle — a green equilateral triangle with a digit label inside.
 * Can be double-outlined (outlines=2) to indicate the innermost nesting level.
 *
 * Exported so the animator can import and reuse it.
 */
export function LabeledTriangle({
  cx,
  cy,
  halfW,
  label,
  outlines = 1,
  strokeWidth = 1.8,
}: TriangleSpec) {
  const pts = triPts(cx, cy, halfW)
  const h = (halfW * 2 * Math.sqrt(3)) / 2
  const labelX = cx + halfW * 0.22
  const labelY = cy + h * 0.18
  const fs = Math.max(10, halfW * 0.52)

  return (
    <g>
      <polygon
        points={pts}
        fill={TRI_FILL}
        stroke={TRI_STROKE}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      {outlines === 2 && (
        <polygon
          points={triPts(cx, cy, halfW - strokeWidth * 1.8)}
          fill="none"
          stroke={TRI_STROKE}
          strokeWidth={strokeWidth * 0.85}
          strokeLinejoin="round"
        />
      )}
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fs}
        fontWeight="bold"
        fill={LABEL_COLOR}
      >
        {label}
      </text>
    </g>
  )
}

// ─── PurpleArrow ─────────────────────────────────────────────────────────────

function PurpleArrow({ x, y, length = 28 }: { x: number; y: number; length?: number }) {
  const x2 = x + length
  const headSize = 7
  return (
    <g>
      <line
        x1={x}
        y1={y}
        x2={x2 - headSize * 0.55}
        y2={y}
        stroke={ARROW_COLOR}
        strokeWidth={3}
        strokeLinecap="round"
      />
      {/* arrowhead */}
      <polygon
        points={`${x2},${y} ${x2 - headSize},${y - headSize * 0.55} ${x2 - headSize},${y + headSize * 0.55}`}
        fill={ARROW_COLOR}
      />
    </g>
  )
}

// ─── ResultLabel ─────────────────────────────────────────────────────────────

function ResultLabel({ x, y, text, isQuestion = false }: { x: number; y: number; text: string; isQuestion?: boolean }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={isQuestion ? 22 : 17}
      fontWeight="900"
      fill={isQuestion ? '#1a2e18' : '#1a2e18'}
    >
      {text}
    </text>
  )
}

// ─── VerticalDivider ─────────────────────────────────────────────────────────

function VerticalDivider({ x, y1, y2 }: { x: number; y1: number; y2: number }) {
  return (
    <line
      x1={x}
      y1={y1}
      x2={x}
      y2={y2}
      stroke="#b0c4b0"
      strokeWidth={1.2}
      strokeDasharray="4 3"
    />
  )
}

// ─── Main illustration ────────────────────────────────────────────────────────

const VIEW_W = 380
const VIEW_H = 120

// Panel centres (x of the big triangle in each panel)
const P_CY = 58            // vertical centre of every triangle
const P1_CX = 44
const P2_CX = 160
const P3_CX = 300

// Big triangle half-width
const BIG_HW = 38
// Arrow dimensions
const ARROW_GAP = 6        // gap from triangle right edge to arrow start
const ARROW_LEN = 26

// Helper: right edge of a triangle centred at cx with halfW
function triRight(cx: number, hw: number) {
  return cx + hw + ARROW_GAP
}

export default function NestedTri22G3Illustration() {
  // This illustration has no runtime params — the figure is fully determined
  // by the problem statement. _params is accepted but unused so the component
  // fits the standard `{ params: unknown }` signature.

  const divTop = P_CY - (BIG_HW * Math.sqrt(3)) / 2 - 6
  const divBot = P_CY + (BIG_HW * Math.sqrt(3)) / 2 + 6

  // Panel 1: single big triangle labelled "4"
  // Panel 2: big outer triangle labelled "2", inner smaller triangle labelled "1"
  // Panel 3: big outer triangle labelled "6",
  //          medium inner triangle (lower-left) labelled "5",
  //          small innermost double-outlined triangle (top-centre) labelled "2"

  // Panel 2 inner triangle: placed lower-left inside outer, label "1"
  const p2InnerHW = 16
  const p2InnerCX = P2_CX - 10
  const p2InnerCY = P_CY + 6

  // Panel 3 inner triangles:
  //   - middle (single, lower-left): halfW ~17, labelled "5"
  //   - innermost (double-outlined, top-centre): halfW ~12, labelled "2"
  const p3MidHW = 17
  const p3MidCX = P3_CX - 10
  const p3MidCY = P_CY + 7

  const p3InnHW = 11
  const p3InnCX = P3_CX + 2
  const p3InnCY = P_CY - 6

  // Result label x positions (after each arrow)
  function resultX(panelCX: number) {
    return triRight(panelCX, BIG_HW) + ARROW_LEN + 18
  }

  const ariaLabel =
    'Tiga panel segitiga bersarang. Panel 1: segitiga besar berlabel 4, panah ungu ke angka 4. ' +
    'Panel 2: segitiga besar berlabel 2 berisi segitiga kecil berlabel 1, panah ungu ke angka 12. ' +
    'Panel 3: segitiga besar berlabel 6 berisi segitiga tengah berlabel 5 dan segitiga terkecil (garis ganda) berlabel 2, panah ungu ke tanda tanya.'

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width={Math.min(380, VIEW_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* ── Panel 1 ── */}
        <LabeledTriangle cx={P1_CX} cy={P_CY} halfW={BIG_HW} label="4" strokeWidth={2} />
        <PurpleArrow
          x={triRight(P1_CX, BIG_HW)}
          y={P_CY}
          length={ARROW_LEN}
        />
        <ResultLabel x={resultX(P1_CX)} y={P_CY} text="4" />

        {/* ── Divider 1 ── */}
        <VerticalDivider x={116} y1={divTop} y2={divBot} />

        {/* ── Panel 2 ── */}
        {/* outer big triangle, label "2" — label near lower-right so it doesn't
            collide with the inner triangle sitting lower-left */}
        <LabeledTriangle cx={P2_CX} cy={P_CY} halfW={BIG_HW} label="2" strokeWidth={2} />
        {/* inner triangle, label "1" */}
        <LabeledTriangle cx={p2InnerCX} cy={p2InnerCY} halfW={p2InnerHW} label="1" strokeWidth={1.6} />
        <PurpleArrow
          x={triRight(P2_CX, BIG_HW)}
          y={P_CY}
          length={ARROW_LEN}
        />
        <ResultLabel x={resultX(P2_CX)} y={P_CY} text="12" />

        {/* ── Divider 2 ── */}
        <VerticalDivider x={242} y1={divTop} y2={divBot} />

        {/* ── Panel 3 ── */}
        {/* outer big triangle labelled "6" */}
        <LabeledTriangle cx={P3_CX} cy={P_CY} halfW={BIG_HW} label="6" strokeWidth={2} />
        {/* middle single-outline triangle labelled "5" (lower-left) */}
        <LabeledTriangle cx={p3MidCX} cy={p3MidCY} halfW={p3MidHW} label="5" strokeWidth={1.6} />
        {/* innermost double-outlined triangle labelled "2" (top-centre) */}
        <LabeledTriangle cx={p3InnCX} cy={p3InnCY} halfW={p3InnHW} label="2" outlines={2} strokeWidth={1.4} />
        <PurpleArrow
          x={triRight(P3_CX, BIG_HW)}
          y={P_CY}
          length={ARROW_LEN}
        />
        {/* Show "?" — never reveal the answer (256) */}
        <ResultLabel x={resultX(P3_CX)} y={P_CY} text="?" isQuestion />
      </svg>
    </div>
  )
}
