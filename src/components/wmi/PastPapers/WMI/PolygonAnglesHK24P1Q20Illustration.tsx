// PolygonAnglesHK24P1Q20Illustration — HKIMO 2024 Heat Primary-1 Q20
//
// "How many interior angle(s) is / are there in the polygon below?" → 12
//
// OCR source: docs/reference/ocr-res/hkimo/heat/primary-1/2024.md Q20,
// image crop:  2024.imgs/009.jpg
//
// The figure is an irregular concave 12-gon with two reflex angles:
//   V5  (right-side V-notch tip, pointing inward/left)
//   V10 (lower-left Z-step inner corner)
// No existing primitive covers a bare freeform polygon → fresh SVG,
// copy-adapted from PolygonAnglesHK20P1Q19Illustration.
// SSR-safe — no hooks, no framer-motion, pure SVG.

// ── shared layout constants (re-exported for the explainer) ──────────────────

export const SVG_W = 260
export const SVG_H = 190

// 12 vertices, clockwise from upper-left:
// V1  = upper-left (top of left diagonal)
// V2  = top (left shoulder of horizontal top edge)
// V3  = top-right
// V4  = before V-notch (step down from top-right)
// V5  = right V-notch tip           [REFLEX — pointing inward/left]
// V6  = after V-notch
// V7  = far right tip (arrow point)
// V8  = lower-right returning left
// V9  = bottom centre
// V10 = Z-step inner corner         [REFLEX — turning left from going-up]
// V11 = Z-step left end
// V12 = lower-left (going up back to V1)

export const VERTICES = [
  { x: 28,  y: 70  }, // V1
  { x: 108, y: 20  }, // V2
  { x: 178, y: 20  }, // V3
  { x: 192, y: 54  }, // V4
  { x: 150, y: 74  }, // V5  REFLEX
  { x: 196, y: 94  }, // V6
  { x: 236, y: 118 }, // V7
  { x: 176, y: 168 }, // V8
  { x: 102, y: 168 }, // V9
  { x: 102, y: 130 }, // V10 REFLEX
  { x:  54, y: 146 }, // V11
  { x:  28, y: 104 }, // V12
] as const

export const POLYGON_POINTS = VERTICES
  .map(({ x, y }) => `${x},${y}`)
  .join(' ')

export const COLOR = {
  FILL:   '#EFF6FF',
  STROKE: '#1E40AF',
  LABEL:  '#1E293B',
}

// Shared sub-component reused by the explainer
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

// ── Default export: static illustration ──────────────────────────────────────

export default function PolygonAnglesHK24P1Q20Illustration() {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      height={SVG_H}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Irregular 12-sided polygon with 12 interior angles"
    >
      <PolygonShape />
    </svg>
  )
}
