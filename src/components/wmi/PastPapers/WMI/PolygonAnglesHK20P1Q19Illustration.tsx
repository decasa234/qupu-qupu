// PolygonAnglesHK20P1Q19Illustration — HKIMO 2020 Heat Primary-1 Q19
//
// "How many interior angle(s) is / are there in the polygon below?" → 7
//
// OCR source: docs/reference/ocr-res/hkimo/heat/primary-1/2020.md Q19,
// image crop:  2020.imgs/007.jpg  (same image as Q18)
//
// The figure is an irregular concave heptagon with 7 vertices.
// Two reflex angles: V4 (staircase step) and V7 (bottom V-notch).
// No existing primitive covers a bare irregular polygon → fresh SVG.
// SSR-safe — no hooks, no framer-motion, pure SVG.

// ── shared layout constants (re-exported for the explainer) ──────────────────

export const SVG_W = 220
export const SVG_H = 170

// 7 vertices, clockwise from bottom-left:
// V1 = far bottom-left
// V2 = upper-left (top of long left diagonal)
// V3 = right end of top step (short horizontal)
// V4 = step corner going diagonal up-right  [REFLEX]
// V5 = far top-right
// V6 = far bottom-right
// V7 = bottom V-notch, pointing upward      [REFLEX]
export const V1 = { x: 12,  y: 158 }
export const V2 = { x: 65,  y: 18  }
export const V3 = { x: 118, y: 18  }
export const V4 = { x: 130, y: 48  }
export const V5 = { x: 208, y: 14  }
export const V6 = { x: 208, y: 154 }
export const V7 = { x: 120, y: 106 }

export const VERTICES = [V1, V2, V3, V4, V5, V6, V7] as const

export const POLYGON_POINTS = VERTICES
  .map(({ x, y }) => `${x},${y}`)
  .join(' ')

export const COLOR = {
  FILL:   '#EFF6FF',
  STROKE: '#1E40AF',
  LABEL:  '#1E293B',
}

// Shared sub-component reused by the explainer
export function HeptagonShape({ opacity = 1 }: { opacity?: number }) {
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

export default function PolygonAnglesHK20P1Q19Illustration() {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      height={SVG_H}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Irregular heptagon with 7 interior angles"
    >
      <HeptagonShape />
    </svg>
  )
}
