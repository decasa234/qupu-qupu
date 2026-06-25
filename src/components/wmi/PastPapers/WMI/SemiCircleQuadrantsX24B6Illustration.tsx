// SEAMOX-24-B-Q6 — Square/semicircle/quadrant shaded-area puzzle (SEAMO X 2024 Paper B Q6).
//
// "The figure shows a square of side length 50 cm. Inscribed inside the square
//  is a shaded semi-circle. The other shaded region is outside the quadrants
//  shown. Find the total shaded area."
//
// SOURCE FIGURE (docs/reference/ocr-res/seamo-x/contest/paper-b/2024.imgs/003.jpg):
//   Square with a right-opening semi-circle (diameter = left edge, r = 25 cm).
//   A dashed vertical centre line divides the square in half.
//   Two quarter-circle arcs (dashed) are centred at the TOP-RIGHT corner (50,0) and
//   BOTTOM-RIGHT corner (50,50), radius 25 cm, curving inward to meet at the right
//   edge midpoint. Their interiors (the two corner areas) are UN-shaded; the
//   remaining middle strip of the right half is shaded.
//
// ANSWER DERIVATION (bound to seed breakdown.quantities):
//   Semi-circle area          = π × 25² / 2 = 625π/2
//   Two corner quadrant areas = 2 × (π × 25² / 4) = 625π/2   ← equal!
//   Shaded outside quadrants  = right-half − 625π/2 = 1250 − 625π/2
//   Total shaded              = 625π/2 + (1250 − 625π/2) = 1250 cm²
//
// The illustration shows the PROBLEM state only — shaded regions visible,
// dashed arcs visible, no area labels, answer never revealed.
//
// Co-exports `SquareArcScene` so the explainer can reuse the primitive with
// progressive shading state.
//
// SSR-safe: no hooks, no window/document, no framer-motion. Pure render.

const SHADE = '#60A5FA'  // shaded fill — medium blue matching source figure
const STROKE = '#374151' // boundary stroke — dark gray
const HILIGHT = '#FEF08A' // quadrant highlight overlay — amber-yellow for explainer

// ViewBox: 200 × 200 (1 px ≡ 0.25 cm; side = 200 px ≡ 50 cm, radius = 100 px ≡ 25 cm)
const W = 200
const H = 200
const R = 100  // circle radius in viewBox coords
const MX = W / 2 // centre x = 100

export interface SquareArcSceneProps {
  /** Show the left-half semi-circle shaded. Default true. */
  shadeSemi?: boolean
  /** Show the right-half outside-quadrant strip shaded. Default true. */
  shadeMiddle?: boolean
  /** Overlay the two corner quadrant areas in amber (explainer beat 2). Default false. */
  highlightQuadrants?: boolean
}

/**
 * Shared SVG primitive — the square/semicircle/quadrant figure.
 * Reused by the illustration (full shading) and the explainer (progressive reveal).
 * Root `<svg>`, SSR-safe.
 */
export function SquareArcScene({
  shadeSemi = true,
  shadeMiddle = true,
  highlightQuadrants = false,
}: SquareArcSceneProps) {
  // All arc directions verified against viewBox centre (0,100) for the semi-circle
  // and corner centres (200,0) / (200,200) for the two quadrants.
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: 240, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* White background */}
      <rect x={0} y={0} width={W} height={H} fill="white" />

      {/* ── Shaded semi-circle ─────────────────────────────────────────────────
          Centre (0,100), r=100. Diameter along left edge (0→0,200).
          sweep=1 (CW in SVG screen) curves the arc to the RIGHT. */}
      {shadeSemi && (
        <path
          d={`M 0,0 A ${R},${R} 0 0 1 0,${H} Z`}
          fill={SHADE}
        />
      )}

      {/* ── Shaded outside-quadrant strip (right half minus two corner areas) ──
          Uses fill-rule=evenodd:
            Outer sub-path  = full right half (always "inside 1 path" → filled).
            Hole sub-path 1 = top-right corner quadrant (inside 2 paths → not filled).
            Hole sub-path 2 = bottom-right corner quadrant (inside 2 paths → not filled).

          Top-right quadrant (centre (W,0)=corner, r=R):
            Arc from (W,R) back to (MX,0): sweep=1 CW, small 90° arc ✓
          Bottom-right quadrant (centre (W,H)=corner, r=R):
            Arc from (W,R) back to (MX,H): sweep=0 CCW, small 90° arc ✓ */}
      {shadeMiddle && (
        <path
          fillRule="evenodd"
          d={[
            // outer: right half
            `M ${MX},0 L ${W},0 L ${W},${H} L ${MX},${H} Z`,
            // hole 1: top-right corner quadrant
            `M ${MX},0 L ${W},0 L ${W},${R} A ${R},${R} 0 0 1 ${MX},0 Z`,
            // hole 2: bottom-right corner quadrant
            `M ${MX},${H} L ${W},${H} L ${W},${R} A ${R},${R} 0 0 0 ${MX},${H} Z`,
          ].join(' ')}
          fill={SHADE}
        />
      )}

      {/* ── Quadrant highlight overlay (explainer beat 2: show the equal areas) ── */}
      {highlightQuadrants && (
        <>
          <path
            d={`M ${MX},0 L ${W},0 L ${W},${R} A ${R},${R} 0 0 1 ${MX},0 Z`}
            fill={HILIGHT}
            opacity={0.7}
          />
          <path
            d={`M ${MX},${H} L ${W},${H} L ${W},${R} A ${R},${R} 0 0 0 ${MX},${H} Z`}
            fill={HILIGHT}
            opacity={0.7}
          />
        </>
      )}

      {/* ── Square border ───────────────────────────────────────────────────── */}
      <rect x={0} y={0} width={W} height={H} fill="none" stroke={STROKE} strokeWidth={2} />

      {/* ── Dashed vertical centre line ─────────────────────────────────────── */}
      <line
        x1={MX} y1={0} x2={MX} y2={H}
        stroke={STROKE} strokeWidth={1.2} strokeDasharray="5 4"
      />

      {/* ── Semi-circle arc border (solid) ──────────────────────────────────── */}
      <path
        d={`M 0,0 A ${R},${R} 0 0 1 0,${H}`}
        fill="none" stroke={STROKE} strokeWidth={1.5}
      />

      {/* ── Top-right quadrant arc (dashed): centre (W,0), r=R
          From (MX,0) to (W,R), sweep=0 CCW, small 90° arc curving inward ── */}
      <path
        d={`M ${MX},0 A ${R},${R} 0 0 0 ${W},${R}`}
        fill="none" stroke={STROKE} strokeWidth={1.5} strokeDasharray="5 4"
      />

      {/* ── Bottom-right quadrant arc (dashed): centre (W,H), r=R
          From (MX,H) to (W,R), sweep=1 CW, small 90° arc curving inward ── */}
      <path
        d={`M ${MX},${H} A ${R},${R} 0 0 1 ${W},${R}`}
        fill="none" stroke={STROKE} strokeWidth={1.5} strokeDasharray="5 4"
      />
    </svg>
  )
}

/** Default export — static problem illustration (both shaded regions, no labels). */
export default function SemiCircleQuadrantsX24B6Illustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Persegi sisi 50 cm dengan setengah lingkaran berarsir di sisi kiri, dan daerah berarsir di luar dua kuadran di sisi kanan."
    >
      <SquareArcScene />
    </div>
  )
}
