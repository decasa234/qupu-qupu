// HKIMO-20-P2H-Q19 — "How many interior angles does the polygon have?" (answer: 12)
//
// Source figure: docs/reference/ocr-res/hkimo/heat/primary-2/2020.imgs/007.jpg
// A 12-sided pinwheel polygon. Faithfully reconstructed as a 4-fold-symmetric
// 12-gon with 4 diagonal arms (NW/SW/SE/NE) connected by 4 inner notch vertices.
//
// Anti-drift: bound to seed breakdown.quantities → {value:"12"}.
// Answer derivation: each vertex = one interior angle → 12 vertices → 12 angles.
//
// Co-exports PinwheelPolygon for use by the explainer.
// SSR-safe: no hooks, no framer-motion, no window/document/random/Date.

// ---------------------------------------------------------------------------
// Polygon geometry
// ---------------------------------------------------------------------------

/**
 * 12 vertices of the pinwheel 12-gon, clockwise in SVG coordinates.
 * Pattern: (arm-side, arm-tip, notch) × 4, giving 12 vertices.
 * Tips (most distant from center 100,100): V2, V5, V8, V11 at r≈97.
 * Notches (reflex, closest to center): V3, V6, V9, V12 at r≈68.
 */
export const VERTS: readonly [number, number][] = [
  [105, 12],  // V1  — NW arm, leading edge
  [82, 5],    // V2  — NW arm tip (northernmost)
  [40, 68],   // V3  — notch between NW and SW arms (reflex)
  [12, 95],   // V4  — SW arm, leading edge
  [5, 118],   // V5  — SW arm tip (westernmost)
  [68, 160],  // V6  — notch between SW and SE arms (reflex)
  [95, 188],  // V7  — SE arm, leading edge
  [118, 195], // V8  — SE arm tip (southernmost)
  [160, 132], // V9  — notch between SE and NE arms (reflex)
  [188, 105], // V10 — NE arm, leading edge
  [195, 82],  // V11 — NE arm tip (easternmost)
  [132, 40],  // V12 — notch between NE and NW arms (reflex)
]

const POLY_POINTS = VERTS.map(([x, y]) => `${x},${y}`).join(' ')

const VIEW = 200
const FILL = '#EEF2FF'    // light indigo fill (problem-state)
const STROKE = '#1E293B'  // near-black outline
const SW = 3              // polygon stroke-width

// ---------------------------------------------------------------------------
// PinwheelPolygon — shared primitive reused by both illustration and explainer
// ---------------------------------------------------------------------------

export interface PinwheelPolygonProps {
  /**
   * How many vertices to highlight (1-based).
   * When undefined: plain polygon — the static problem figure.
   * When n: vertices 1..n shown with coloured dots; vertex n is amber (current),
   * vertices 1..n-1 are green (already counted).
   */
  countedUpTo?: number
}

export function PinwheelPolygon({ countedUpTo }: PinwheelPolygonProps) {
  return (
    <svg
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      width="100%"
      style={{ maxWidth: 240, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <rect width={VIEW} height={VIEW} fill="#fff" />
      <polygon
        points={POLY_POINTS}
        fill={FILL}
        stroke={STROKE}
        strokeWidth={SW}
        strokeLinejoin="miter"
      />
      {countedUpTo !== undefined &&
        VERTS.slice(0, countedUpTo).map(([x, y], i) => {
          const isActive = i === countedUpTo - 1
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={7}
              fill={isActive ? '#F59E0B' : '#10B981'}
              stroke="#fff"
              strokeWidth={1.5}
            />
          )
        })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Default export — static problem illustration (no labels, no answer)
// ---------------------------------------------------------------------------

export default function PolygonHK20P2Q19Illustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="A 12-sided polygon shaped like a pinwheel with four diagonal arms."
    >
      <PinwheelPolygon />
    </div>
  )
}
