// "How many triangles?" figure for WMI-20P1A-Q8 (2020 WMI Semifinal Grade 1 Paper A).
//
// Reconstructed from db/seed/wmi/figures/2020-semifinal-g1-a-q8.jpg: a "fish"
// built from many outlined shapes. Most are decoys (rectangles, squares, circles);
// only the TRIANGLES are counted. There are exactly 8 triangles (answer C):
//
//   1. left composite triangle (right-triangle, with a decoy circle inside)
//   2. top-centre upward triangle
//   3. bottom-centre downward triangle
//   4. big right-pointing arrowhead (the fish "nose")
//   5,6. two small "play" triangles, top-right (each in front of a bar)
//   7,8. two small "play" triangles, bottom-right
//
// Triangle centroids are exported so the explainer can ring them in order.
export const TRIANGLE_COUNT = 8

export const STROKE = '#111827'

export const TRI_VIEW_W = 420
export const TRI_VIEW_H = 320

/** Centroid (x, y) of each triangle, in counting order 1..8. */
export const TRIANGLE_MARKS: Array<{ cx: number; cy: number }> = [
  { cx: 44, cy: 150 }, // 1 left composite triangle
  { cx: 118, cy: 70 }, // 2 top-centre upward
  { cx: 118, cy: 250 }, // 3 bottom-centre downward
  { cx: 360, cy: 160 }, // 4 right arrowhead
  { cx: 188, cy: 58 }, // 5 top-right play (upper)
  { cx: 188, cy: 92 }, // 6 top-right play (lower)
  { cx: 188, cy: 228 }, // 7 bottom-right play (upper)
  { cx: 188, cy: 262 }, // 8 bottom-right play (lower)
]

/** A small left-pointing "play" triangle with apex pointing right. */
function PlayTriangle({ x, y }: { x: number; y: number }) {
  return <path d={`M ${x} ${y - 9} L ${x} ${y + 9} L ${x + 16} ${y} Z`} fill="#FFFFFF" stroke={STROKE} strokeWidth={2} />
}

/** A horizontal decoy bar. */
function Bar({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return <rect x={x} y={y} width={w} height={h} fill="#FFFFFF" stroke={STROKE} strokeWidth={2} />
}

/** A decoy circle. */
function Dot({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return <circle cx={cx} cy={cy} r={r} fill="#FFFFFF" stroke={STROKE} strokeWidth={2} />
}

export interface FishFigureProps {
  /** Index (0..7) of the triangle currently ringed, or null for none. */
  ringed?: number | null
  /** Triangles already counted get a faint tint. */
  countedUpTo?: number
  ringColor?: string
}

/** The reusable fish-of-shapes primitive. */
export function FishFigure({ ringed = null, countedUpTo = 0, ringColor = '#2f6df0' }: FishFigureProps) {
  const triFill = (i: number) => (countedUpTo > i ? '#DBEAFE' : '#FFFFFF')

  return (
    <svg
      viewBox={`0 0 ${TRI_VIEW_W} ${TRI_VIEW_H}`}
      width="100%"
      style={{ maxWidth: TRI_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ---- TRIANGLE 1: left composite (right-triangle) with decoy circle + decoy bar ---- */}
      <path d="M 18 92 L 18 208 L 78 208 Z" fill={triFill(0)} stroke={STROKE} strokeWidth={2} />
      <Dot cx={42} cy={168} r={17} />
      <Bar x={14} y={214} w={66} h={18} />

      {/* ---- TRIANGLE 2: top-centre upward ---- */}
      <path d="M 118 26 L 92 116 L 144 116 Z" fill={triFill(1)} stroke={STROKE} strokeWidth={2} />

      {/* ---- TRIANGLE 3: bottom-centre downward ---- */}
      <path d="M 92 204 L 144 204 L 118 294 Z" fill={triFill(2)} stroke={STROKE} strokeWidth={2} />

      {/* ---- TRIANGLE 4: big right-pointing arrowhead (fish nose) ---- */}
      <path d="M 332 116 L 332 204 L 404 160 Z" fill={triFill(3)} stroke={STROKE} strokeWidth={2} />

      {/* ---- TRIANGLES 5 & 6: top-right play triangles, each before a bar + circle ---- */}
      <g style={{ opacity: countedUpTo > 4 ? 0.55 : 1 }}>
        <PlayTriangle x={172} y={58} />
      </g>
      <Bar x={196} y={50} w={108} h={16} />
      <Dot cx={328} cy={58} r={11} />
      <g style={{ opacity: countedUpTo > 5 ? 0.55 : 1 }}>
        <PlayTriangle x={172} y={92} />
      </g>
      <Bar x={196} y={84} w={108} h={16} />
      <Dot cx={328} cy={92} r={11} />

      {/* ---- central body: a long bar, a row of decoy squares, another long bar ---- */}
      <Bar x={92} y={128} w={224} h={18} />
      {[0, 1, 2, 3].map((k) => (
        <rect key={k} x={104 + k * 52} y={156} width={36} height={28} fill="#FFFFFF" stroke={STROKE} strokeWidth={2} />
      ))}
      <Bar x={92} y={194} w={224} h={18} />

      {/* ---- TRIANGLES 7 & 8: bottom-right play triangles ---- */}
      <g style={{ opacity: countedUpTo > 6 ? 0.55 : 1 }}>
        <PlayTriangle x={172} y={228} />
      </g>
      <Bar x={196} y={220} w={108} h={16} />
      <Dot cx={328} cy={228} r={11} />
      <g style={{ opacity: countedUpTo > 7 ? 0.55 : 1 }}>
        <PlayTriangle x={172} y={262} />
      </g>
      <Bar x={196} y={254} w={108} h={16} />
      <Dot cx={328} cy={262} r={11} />

      {/* ---- ring on the currently-counted triangle ---- */}
      {ringed != null && TRIANGLE_MARKS[ringed] && (
        <circle
          cx={TRIANGLE_MARKS[ringed].cx}
          cy={TRIANGLE_MARKS[ringed].cy}
          r={22}
          fill="none"
          stroke={ringColor}
          strokeWidth={3.5}
        />
      )}
    </svg>
  )
}

export default function P20G1Q8Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A fish-shaped picture built from outlined triangles, rectangles, squares and circles. Count the triangles."
    >
      <FishFigure />
    </div>
  )
}
