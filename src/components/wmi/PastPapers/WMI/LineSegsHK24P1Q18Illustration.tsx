// HKIMO-24-P1H-Q18 — "How many line segments are there in the figure?"
//
// PROBLEM ONLY (no answer): shows the two-shape compound figure from the paper.
//   LEFT  : pentagon A-B-C-D-E with 2 crossing diagonals (A-D, C-E) → 7 segments
//   RIGHT : hexagon  D-F-G-H-I-J with 2 internal lines (D-H, D-I)  → 8 segments
//   Total : 15 line segments
//
// SSR-safe & deterministic — no hooks, no framer-motion.

export const VB_W = 510
export const VB_H = 330

// ── LEFT PENTAGON vertices ────────────────────────────────────────────────────
export const A = { x: 40,  y: 165 }  // far-left spike
export const B = { x: 118, y: 120 }  // upper-left
export const C = { x: 255, y: 52  }  // upper
export const D = { x: 290, y: 162 }  // junction (shared with right hexagon)
export const E = { x: 118, y: 210 }  // lower-left

// ── RIGHT HEXAGON vertices (D is the leftmost / shared vertex) ────────────────
export const F = { x: 325, y: 98  }  // upper-left of hexagon
export const G = { x: 398, y: 72  }  // top
export const H = { x: 463, y: 115 }  // upper-right
export const I = { x: 465, y: 220 }  // lower-right
export const J = { x: 352, y: 268 }  // bottom

// ── helpers ───────────────────────────────────────────────────────────────────
export function pts(...vs: { x: number; y: number }[]) {
  return vs.map((v) => `${v.x},${v.y}`).join(' ')
}

const STROKE = '#1a1a1a'
const SW = 2.5

export default function LineSegsHK24P1Q18Illustration() {
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto', maxWidth: VB_W }}
    >
      {/* left pentagon outer boundary — edges A-B, B-C, C-D, D-E, E-A */}
      <polygon
        points={pts(A, B, C, D, E)}
        fill="none"
        stroke={STROKE}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      {/* left pentagon diagonal 1: A → D (spike to junction) */}
      <line x1={A.x} y1={A.y} x2={D.x} y2={D.y} stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      {/* left pentagon diagonal 2: C → E (upper to lower-left) */}
      <line x1={C.x} y1={C.y} x2={E.x} y2={E.y} stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      {/* right hexagon outer boundary — edges D-F, F-G, G-H, H-I, I-J, J-D */}
      <polygon
        points={pts(D, F, G, H, I, J)}
        fill="none"
        stroke={STROKE}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      {/* right hexagon internal line 1: D → H */}
      <line x1={D.x} y1={D.y} x2={H.x} y2={H.y} stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
      {/* right hexagon internal line 2: D → I */}
      <line x1={D.x} y1={D.y} x2={I.x} y2={I.y} stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
    </svg>
  )
}
