// SquareRect19B4Illustration — SEAMO-19-B-Q4
//
// Square ABCD (teal) with a tilted rectangle EFGH (dark navy) overlaid.
// Points E, F, G, H lie on the sides of ABCD with the ratios:
//   AF = 2, FB = 4  (A–B top side; square side = 6 cm)
//   BG = 4, GC = 2  (B–C right side)
//   DH = 4, HC = 2  → H = (4,0) on C–D (bottom side, reading left D to C)
//   AE = 2, ED = 4  → E = (0,4) on A–D (left side, reading top A to bottom D)
//
// Coordinate system (0,0) at D, y up:
//   D=(0,0)  C=(6,0)  B=(6,6)  A=(0,6)
//   E=(0,4)  F=(2,6)  G=(6,2)  H=(4,0)
//
// The static figure shows ONLY the problem: the outer square (teal) + the
// inner tilted rectangle (dark navy, semi-transparent) with vertex labels
// A–H and the printed length FB=4. It never reveals the area (16 cm²).
//
// Co-exported primitive SquareRect19B4 lets the explainer re-use the figure
// with progressive reveal: showCoords / showArea flags (animator only).
//
// SSR-safe — no hooks, no Math.random, no Date.

// ---- palette ---------------------------------------------------------------
const SQUARE_FILL = '#4ECDC4'    // teal square ABCD (matches source image)
const SQUARE_STROKE = '#1A7A74'  // darker teal border
const RECT_FILL = '#2D4159'      // dark navy rectangle EFGH (matches source)
const RECT_OPACITY = 0.80        // slight transparency so square shows beneath
const LABEL_COLOR = '#1F2937'    // dark ink for vertex labels
const DIM_COLOR = '#D97706'      // amber — derived coordinates (animator only)
const AREA_COLOR = '#10B981'     // green — area result (animator only)
const INK = '#1F2937'

// ---- geometry (SVG space: 1 unit = 1 cm, y increasing DOWN) ----------------
// Map (x, y) from math-coords (0,0)=D, y-up to SVG coords (y-down):
//   svgX = x,  svgY = SIDE - y   (flip y)

const SIDE = 6                   // square side in cm
const PAD = 32                   // padding around the geometry (pixels/units)
const SCALE = 48                 // px per cm

function toSVG(mx: number, my: number): [number, number] {
  return [PAD + mx * SCALE, PAD + (SIDE - my) * SCALE]
}

// Square vertices (math-coords)
const A = { label: 'A', mx: 0, my: 6 }
const B = { label: 'B', mx: 6, my: 6 }
const C = { label: 'C', mx: 6, my: 0 }
const D = { label: 'D', mx: 0, my: 0 }

// Rectangle vertices (math-coords)
const E = { label: 'E', mx: 0, my: 4 }
const F = { label: 'F', mx: 2, my: 6 }
const G = { label: 'G', mx: 6, my: 2 }
const H = { label: 'H', mx: 4, my: 0 }

const ALL = [A, B, C, D, E, F, G, H]

// Convert to SVG px
const pts = Object.fromEntries(
  ALL.map((v) => [v.label, toSVG(v.mx, v.my)])
) as Record<string, [number, number]>

const VBW = PAD * 2 + SIDE * SCALE
const VBH = PAD * 2 + SIDE * SCALE

// Polygon point strings
const squarePts = ['A', 'B', 'C', 'D'].map((k) => pts[k].join(',')).join(' ')
const rectPts   = ['E', 'F', 'G', 'H'].map((k) => pts[k].join(',')).join(' ')

// Label offsets (nudge labels away from vertices)
const LABEL_OFFSETS: Record<string, [number, number]> = {
  A: [-14, -12],
  B: [+10, -12],
  C: [+10, +16],
  D: [-14, +16],
  E: [-16, +0],
  F: [  0, -16],
  G: [+14, +0],
  H: [  0, +16],
}

// ---- FB dimension line -------------------------------------------------------
// FB runs from F=(2,6) to B=(6,6) in math-coords → horizontal top edge segment
// We'll draw a small brace above the square top edge between F and B.
const [fX, fY] = pts['F']
const [bX, bY] = pts['B']
const BRACE_Y = fY - 14   // above the top edge

export interface SquareRect19B4Props {
  /** Show coordinate labels at E, F, G, H (animator step 2). */
  showCoords?: boolean
  /** Shade + label the EFGH area result (animator final beat). */
  showArea?: boolean
}

/**
 * Primitive reused by both the illustration and the explainer.
 * Default props = plain problem figure (no solution info).
 */
export function SquareRect19B4({ showCoords = false, showArea = false }: SquareRect19B4Props = {}) {
  return (
    <svg
      viewBox={`0 0 ${VBW} ${VBH}`}
      width={Math.min(280, VBW)}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      {/* outer square ABCD (teal) */}
      <polygon
        points={squarePts}
        fill={SQUARE_FILL}
        stroke={SQUARE_STROKE}
        strokeWidth={2.2}
        strokeLinejoin="round"
      />

      {/* inner tilted rectangle EFGH (dark navy, semi-transparent) */}
      <polygon
        points={rectPts}
        fill={RECT_FILL}
        fillOpacity={RECT_OPACITY}
        stroke={RECT_FILL}
        strokeWidth={2.0}
        strokeLinejoin="round"
      />

      {/* vertex labels A B C D */}
      {[A, B, C, D].map((v) => {
        const [sx, sy] = pts[v.label]
        const [dx, dy] = LABEL_OFFSETS[v.label]
        return (
          <text
            key={v.label}
            x={sx + dx}
            y={sy + dy}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={14}
            fontWeight={700}
            fill={LABEL_COLOR}
          >
            {v.label}
          </text>
        )
      })}

      {/* vertex labels E F G H */}
      {[E, F, G, H].map((v) => {
        const [sx, sy] = pts[v.label]
        const [dx, dy] = LABEL_OFFSETS[v.label]
        return (
          <text
            key={v.label}
            x={sx + dx}
            y={sy + dy}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={14}
            fontWeight={700}
            fill="#E2E8F0"
          >
            {v.label}
          </text>
        )
      })}

      {/* FB = 4 cm brace (printed problem dimension) */}
      <line x1={fX} y1={BRACE_Y} x2={bX} y2={BRACE_Y} stroke={INK} strokeWidth={1.4} />
      <line x1={fX} y1={BRACE_Y - 4} x2={fX} y2={BRACE_Y + 4} stroke={INK} strokeWidth={1.4} />
      <line x1={bX} y1={BRACE_Y - 4} x2={bX} y2={BRACE_Y + 4} stroke={INK} strokeWidth={1.4} />
      <text
        x={(fX + bX) / 2}
        y={BRACE_Y - 10}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={800}
        fill={INK}
      >
        FB = 4 cm
      </text>

      {/* animator: coordinate annotations at E F G H */}
      {showCoords && (
        <g>
          {[
            { v: 'E', label: '(0,4)' },
            { v: 'F', label: '(2,6)' },
            { v: 'G', label: '(6,2)' },
            { v: 'H', label: '(4,0)' },
          ].map(({ v, label }) => {
            const [sx, sy] = pts[v]
            const [dx, dy] = LABEL_OFFSETS[v]
            return (
              <text
                key={v + '-coord'}
                x={sx + dx}
                y={sy + dy + 14}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={10}
                fontWeight={700}
                fill={DIM_COLOR}
              >
                {label}
              </text>
            )
          })}
        </g>
      )}

      {/* animator: area label in the centre of EFGH */}
      {showArea && (() => {
        // centroid of EFGH
        const cx = (pts['E'][0] + pts['F'][0] + pts['G'][0] + pts['H'][0]) / 4
        const cy = (pts['E'][1] + pts['F'][1] + pts['G'][1] + pts['H'][1]) / 4
        return (
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={18}
            fontWeight={900}
            fill={AREA_COLOR}
          >
            16 cm²
          </text>
        )
      })()}
    </svg>
  )
}

/**
 * Default export: plain problem figure — square ABCD (teal) + tilted rectangle
 * EFGH (dark navy) with vertex labels and FB = 4 cm. Never reveals the area.
 */
export default function SquareRect19B4Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Square ABCD (teal) with tilted rectangle EFGH (dark navy) overlaid. Points E and F on the left and top sides, G and H on the right and bottom sides. FB = 4 cm is labelled. Find the area of EFGH."
    >
      <SquareRect19B4 />
    </div>
  )
}
