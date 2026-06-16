// C-shaped (notched-rectangle) perimeter figure for WMI-19P3A-Q13.
//
// Reconstructed from db/seed/wmi/figures/2019-semifinal-g3-a-q13.jpg:
// an outer rectangle 14 cm wide and 13 cm tall, with a rectangular notch
// cut into the RIGHT side (the figure looks like a block letter "C").
//
// Walking the boundary clockwise from the top-left corner, the labelled edges
// are: top 14, right-top down 6, notch-in 7, notch-wall down 3, notch-out 7,
// right-bottom down 4, bottom 14, left up 13.
//   vertical check: 6 + 3 + 4 = 13  (= left side) ✓
//   horizontal check: in 7, out 7 cancel; top 14 = bottom 14 ✓
//
// Perimeter = 14 + 6 + 7 + 3 + 7 + 4 + 14 + 13 = 68 (answer C).
// The notch adds 2 × 7 = 14 to the plain rectangle's 2 × (14 + 13) = 54.
//
// The static figure shows ONLY the problem (edge labels in cm); it never shows
// the perimeter total.

export const Q13_W = 14 // outer width
export const Q13_H = 13 // outer height
export const Q13_TOP_RIGHT = 6 // right edge above the notch
export const Q13_NOTCH_DEPTH = 7 // how far the notch cuts in
export const Q13_NOTCH_WALL = 3 // inner vertical wall of the notch
export const Q13_BOT_RIGHT = 4 // right edge below the notch

/** All boundary edges in walking order; their sum is the perimeter. */
export const Q13_EDGES = [Q13_W, Q13_TOP_RIGHT, Q13_NOTCH_DEPTH, Q13_NOTCH_WALL, Q13_NOTCH_DEPTH, Q13_BOT_RIGHT, Q13_W, Q13_H]
export const Q13_PERIMETER = Q13_EDGES.reduce((a, b) => a + b, 0) // 68

const INK = '#1F2937'
const FILL = '#FFFFFF'

const PX = 18 // px per cm
const PAD_L = 48
const PAD_R = 56
const PAD_T = 34
const PAD_B = 34

export const Q13_VIEW_W = PAD_L + Q13_W * PX + PAD_R
export const Q13_VIEW_H = PAD_T + Q13_H * PX + PAD_B

// Corner coordinates of the C-shape (clockwise from top-left).
const ox = PAD_L
const oy = PAD_T
const P = {
  topLeft: { x: ox, y: oy },
  topRight: { x: ox + Q13_W * PX, y: oy },
  notchTopRight: { x: ox + Q13_W * PX, y: oy + Q13_TOP_RIGHT * PX },
  notchTopLeft: { x: ox + (Q13_W - Q13_NOTCH_DEPTH) * PX, y: oy + Q13_TOP_RIGHT * PX },
  notchBotLeft: { x: ox + (Q13_W - Q13_NOTCH_DEPTH) * PX, y: oy + (Q13_TOP_RIGHT + Q13_NOTCH_WALL) * PX },
  notchBotRight: { x: ox + Q13_W * PX, y: oy + (Q13_TOP_RIGHT + Q13_NOTCH_WALL) * PX },
  botRight: { x: ox + Q13_W * PX, y: oy + Q13_H * PX },
  botLeft: { x: ox, y: oy + Q13_H * PX },
}

const PATH = [
  P.topLeft,
  P.topRight,
  P.notchTopRight,
  P.notchTopLeft,
  P.notchBotLeft,
  P.notchBotRight,
  P.botRight,
  P.botLeft,
]

export type Q13EdgeKey =
  | 'top'
  | 'rightTop'
  | 'notchIn'
  | 'notchWall'
  | 'notchOut'
  | 'rightBot'
  | 'bottom'
  | 'left'

// Edge geometry + label anchor for each labelled edge.
const EDGE_GEOM: Record<Q13EdgeKey, { a: { x: number; y: number }; b: { x: number; y: number }; lx: number; ly: number; cm: number }> = {
  top: { a: P.topLeft, b: P.topRight, lx: (P.topLeft.x + P.topRight.x) / 2, ly: P.topLeft.y - 16, cm: Q13_W },
  rightTop: { a: P.topRight, b: P.notchTopRight, lx: P.topRight.x + 20, ly: (P.topRight.y + P.notchTopRight.y) / 2, cm: Q13_TOP_RIGHT },
  notchIn: { a: P.notchTopRight, b: P.notchTopLeft, lx: (P.notchTopRight.x + P.notchTopLeft.x) / 2, ly: P.notchTopRight.y - 14, cm: Q13_NOTCH_DEPTH },
  notchWall: { a: P.notchTopLeft, b: P.notchBotLeft, lx: P.notchTopLeft.x - 22, ly: (P.notchTopLeft.y + P.notchBotLeft.y) / 2, cm: Q13_NOTCH_WALL },
  notchOut: { a: P.notchBotLeft, b: P.notchBotRight, lx: (P.notchBotLeft.x + P.notchBotRight.x) / 2, ly: P.notchBotLeft.y + 14, cm: Q13_NOTCH_DEPTH },
  rightBot: { a: P.notchBotRight, b: P.botRight, lx: P.botRight.x + 20, ly: (P.notchBotRight.y + P.botRight.y) / 2, cm: Q13_BOT_RIGHT },
  bottom: { a: P.botRight, b: P.botLeft, lx: (P.botRight.x + P.botLeft.x) / 2, ly: P.botRight.y + 18, cm: Q13_W },
  left: { a: P.botLeft, b: P.topLeft, lx: P.botLeft.x - 22, ly: (P.botLeft.y + P.topLeft.y) / 2, cm: Q13_H },
}

export const Q13_EDGE_ORDER: Q13EdgeKey[] = ['top', 'rightTop', 'notchIn', 'notchWall', 'notchOut', 'rightBot', 'bottom', 'left']

export interface Q13FigureProps {
  /** Edge keys to highlight (active in the walk), or empty. */
  highlight?: Q13EdgeKey[]
}

export function Q13Figure({ highlight = [] }: Q13FigureProps) {
  const ptsStr = PATH.map((p) => `${p.x},${p.y}`).join(' ')
  return (
    <svg
      viewBox={`0 0 ${Q13_VIEW_W} ${Q13_VIEW_H}`}
      width="100%"
      style={{ maxWidth: Q13_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <polygon points={ptsStr} fill={FILL} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />

      {/* highlight overlays */}
      {highlight.map((k) => {
        const g = EDGE_GEOM[k]
        return <line key={k} x1={g.a.x} y1={g.a.y} x2={g.b.x} y2={g.b.y} stroke="#F59E0B" strokeWidth={6} strokeLinecap="round" />
      })}

      {/* edge labels */}
      {Q13_EDGE_ORDER.map((k) => {
        const g = EDGE_GEOM[k]
        return (
          <text key={k} x={g.lx} y={g.ly} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={800} fill={INK}>
            {`${g.cm}cm`}
          </text>
        )
      })}
    </svg>
  )
}

export default function P19G3Q13Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A block letter C shape: a 14 cm by 13 cm rectangle with a rectangular notch cut into the right side. Edge labels in cm: top 14, right-top 6, notch-in 7, notch-wall 3, notch-out 7, right-bottom 4, bottom 14, left 13."
    >
      <Q13Figure />
    </div>
  )
}
