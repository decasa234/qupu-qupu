// HKIMO-18-P1H-Q18 — "How many sides is / are there in the polygon below?"
//
// PROBLEM ONLY: renders the irregular hexagon from the paper.
// The polygon is a right-pointing arrow shape with a short lower-right
// vertical edge — 6 distinct straight sides (answer = 6).
//
// Does NOT show: side numbers or the answer.
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── shared layout constants (re-exported for the explainer) ──────────────────

export const SVG_W = 220
export const SVG_H = 180

// 6 vertices of the hexagon, clockwise from top-left:
// V0 = top-left
// V1 = top-right
// V2 = arrow tip (rightmost)
// V3 = arrow lower-right (where lower diagonal meets the body's right edge)
// V4 = bottom-right
// V5 = bottom-left
export const V0 = { x: 20,  y: 25  }   // top-left
export const V1 = { x: 145, y: 25  }   // top-right
export const V2 = { x: 198, y: 88  }   // arrow tip
export const V3 = { x: 145, y: 118 }   // arrow lower-right junction
export const V4 = { x: 145, y: 155 }   // bottom-right
export const V5 = { x: 20,  y: 155 }   // bottom-left

// The 6 sides as ordered pairs of vertices [from, to]:
// Side 1: V0→V1 (top)
// Side 2: V1→V2 (upper diagonal)
// Side 3: V2→V3 (lower diagonal)
// Side 4: V3→V4 (right-lower vertical)
// Side 5: V4→V5 (bottom horizontal)
// Side 6: V5→V0 (left vertical)

export const SIDES = [
  [V0, V1],
  [V1, V2],
  [V2, V3],
  [V3, V4],
  [V4, V5],
  [V5, V0],
] as const

/** Polygon point string for <polygon points="…"> */
export const POLYGON_POINTS = [V0, V1, V2, V3, V4, V5]
  .map(({ x, y }) => `${x},${y}`)
  .join(' ')

/** Colour tokens */
export const COLOR = {
  FILL:   '#EFF6FF',
  STROKE: '#1E40AF',
  LABEL:  '#1E293B',
}

// ── The hexagon polygon (shared sub-component used by explainer) ──────────────

export function HexagonShape({ opacity = 1 }: { opacity?: number }) {
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

// ── Default export: static illustration ──────────────────────────────────────

export default function PolygonHK18P1Q18Illustration() {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      height={SVG_H}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Irregular hexagon polygon"
    >
      <HexagonShape />
    </svg>
  )
}
