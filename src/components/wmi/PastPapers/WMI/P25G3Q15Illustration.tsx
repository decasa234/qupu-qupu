// In-card figure for WMI-25P3A-Q15 (2025 Grade 3 Semifinal).
//
// Source: db/seed/wmi/figures/2025-semifinal-g3-a-q15.jpg — a cube drawn in
// cabinet/isometric projection. The top face shows "5" (on a white face), the
// front-left face shows "2" and the right face shows "6" (both pale-yellow).
//
// The static figure shows ONLY the three given numbers — never the three hidden
// faces or the answer. The explainer imports the `CubeFigure` primitive below.

const INK = '#1F2937'
const FACE_YELLOW = '#FBEFA6' // pale yellow front/right faces (matches scan)
const FACE_WHITE = '#FFFFFF' // top face

export const CUBE_VIEW_W = 240
export const CUBE_VIEW_H = 230

// --- isometric cube geometry --------------------------------------------------
// Three visible faces share the front-top vertex F. Corners laid out so nothing
// clips inside the viewBox.
const CX = CUBE_VIEW_W / 2
const TOP = 30 // y of the back-top corner
const S = 70 // half-width of the cube footprint
const H = 34 // vertical half-step of the (foreshortened) top face
const DH = 92 // body height (front faces)

// top face (a rhombus): back T, right R, front F, left L
const T: [number, number] = [CX, TOP]
const L: [number, number] = [CX - S, TOP + H]
const R: [number, number] = [CX + S, TOP + H]
const F: [number, number] = [CX, TOP + 2 * H]
// bottom front corners
const Lb: [number, number] = [CX - S, TOP + H + DH]
const Rb: [number, number] = [CX + S, TOP + H + DH]
const Fb: [number, number] = [CX, TOP + 2 * H + DH]

const pts = (arr: Array<[number, number]>) => arr.map(([x, y]) => `${x},${y}`).join(' ')

/** Centroid of a polygon's vertices (good enough for face-label placement). */
function centroid(arr: Array<[number, number]>): [number, number] {
  const n = arr.length
  const sx = arr.reduce((a, [x]) => a + x, 0)
  const sy = arr.reduce((a, [, y]) => a + y, 0)
  return [sx / n, sy / n]
}

const TOP_FACE = [T, R, F, L] as Array<[number, number]>
const LEFT_FACE = [L, F, Fb, Lb] as Array<[number, number]>
const RIGHT_FACE = [F, R, Rb, Fb] as Array<[number, number]>

/** Where each face's number sits, with a per-face skew so it "lies" on the face. */
const TOP_C = centroid(TOP_FACE)
const LEFT_C = centroid(LEFT_FACE)
const RIGHT_C = centroid(RIGHT_FACE)

export interface CubeFigureProps {
  /** Number drawn on the white top face (null hides it). */
  top?: number | null
  /** Number drawn on the pale-yellow front-left face. */
  left?: number | null
  /** Number drawn on the pale-yellow right face. */
  right?: number | null
  /** Optional faint "?" badges on the three hidden faces (explainer use). */
  showHidden?: boolean
}

/**
 * One cube seen from a top-front-right corner, showing three faces. Numbers are
 * skewed to sit flat on each face. Reused by the explainer.
 */
export function CubeFigure({ top = 5, left = 2, right = 6, showHidden = false }: CubeFigureProps) {
  return (
    <svg
      viewBox={`0 0 ${CUBE_VIEW_W} ${CUBE_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 240, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* faces (draw back-to-front so edges read cleanly) */}
      <polygon points={pts(TOP_FACE)} fill={FACE_WHITE} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      <polygon points={pts(LEFT_FACE)} fill={FACE_YELLOW} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      <polygon points={pts(RIGHT_FACE)} fill={FACE_YELLOW} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />

      {/* top number — slanted to lie on the top rhombus */}
      {top != null && (
        <text
          x={TOP_C[0]}
          y={TOP_C[1]}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={40}
          fontWeight={800}
          fontStyle="italic"
          fill={INK}
          transform={`skewX(-26) translate(${TOP_C[1] * Math.tan((26 * Math.PI) / 180)}, 0)`}
        >
          {top}
        </text>
      )}

      {/* left-face number */}
      {left != null && (
        <text
          x={LEFT_C[0]}
          y={LEFT_C[1] + 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={48}
          fontWeight={800}
          fontStyle="italic"
          fill={INK}
        >
          {left}
        </text>
      )}

      {/* right-face number */}
      {right != null && (
        <text
          x={RIGHT_C[0]}
          y={RIGHT_C[1] + 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={44}
          fontWeight={800}
          fontStyle="italic"
          fill={INK}
        >
          {right}
        </text>
      )}

      {/* faint "?" on the three hidden faces (only when asked) */}
      {showHidden && (
        <text
          x={CX}
          y={TOP + H + DH + 26}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={15}
          fontWeight={700}
          fill="#94A3B8"
        >
          3 faces hidden
        </text>
      )}
    </svg>
  )
}

export default function P25G3Q15Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A cube seen at an angle showing three faces: 5 on the top face, 2 on the front face, and 6 on the right face."
    >
      <CubeFigure top={5} left={2} right={6} />
    </div>
  )
}
