// PolygonSidesTIMO22P1Q18Illustration — TIMO 2022 Heat Primary-1 Q18
//
// "How many side(s) is / are there in the polygon below?" → 18
//
// Source image: docs/reference/ocr-res/timo/bundle/primary-1/2020-2022.imgs/098.jpg
// Shape: rectangular body with 2 beveled top corners + 3 rectangular notches cut
// from the bottom (bus-silhouette style). 18 vertices = 18 sides.
//
// No primitive matches a bare irregular 18-gon → fresh SVG.
// SSR-safe: no hooks, no framer-motion.

export const SVG_W = 500
export const SVG_H = 330

// 18 vertices, clockwise from V1 (top-left bevel end).
// Base coords: x ∈ [0,440], y ∈ [0,270]; padded 30 on each side → 500×330.
export const VERTICES = [
  { x: 98,  y: 30  }, // V1  top-left bevel end
  { x: 426, y: 30  }, // V2  top-right bevel start
  { x: 470, y: 110 }, // V3  top-right bevel end
  { x: 470, y: 200 }, // V4  right wall bottom
  { x: 437, y: 200 }, // V5  right of right notch
  { x: 437, y: 280 }, // V6  bottom-right of right notch
  { x: 371, y: 280 }, // V7  bottom-left of right notch
  { x: 371, y: 200 }, // V8  top-left of right notch
  { x: 294, y: 200 }, // V9  right of middle notch
  { x: 294, y: 280 }, // V10 bottom-right of middle notch
  { x: 206, y: 280 }, // V11 bottom-left of middle notch
  { x: 206, y: 200 }, // V12 top-left of middle notch
  { x: 129, y: 200 }, // V13 right of left notch
  { x: 129, y: 280 }, // V14 bottom-right of left notch
  { x: 63,  y: 280 }, // V15 bottom-left of left notch
  { x: 63,  y: 200 }, // V16 top-left of left notch
  { x: 30,  y: 200 }, // V17 left wall bottom
  { x: 30,  y: 110 }, // V18 top-left bevel start
] as const

export const POLYGON_POINTS = VERTICES.map(({ x, y }) => `${x},${y}`).join(' ')

export const COLOR = {
  FILL:   '#EFF6FF',
  STROKE: '#1E40AF',
  LABEL:  '#1E293B',
}

/** Shared polygon shape — imported by the explainer to avoid re-rendering. */
export function PolygonShape({ opacity = 1 }: { opacity?: number }) {
  return (
    <polygon
      points={POLYGON_POINTS}
      fill={COLOR.FILL}
      stroke={COLOR.STROKE}
      strokeWidth={2.5}
      strokeLinejoin="round"
      opacity={opacity}
    />
  )
}

/** Static illustration — shows the problem polygon with no answer markings. */
export default function PolygonSidesTIMO22P1Q18Illustration() {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      height={SVG_H}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Irregular 18-sided polygon with beveled top corners and 3 rectangular bottom notches"
    >
      <PolygonShape />
    </svg>
  )
}
