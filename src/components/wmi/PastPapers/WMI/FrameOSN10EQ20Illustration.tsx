// OSN-10-SD-KEC-Q20 — Stick frame: equilateral triangle (sides 10 cm) sharing
// one side with a right triangle (legs 6 cm & 8 cm; hypotenuse = shared side).
// Total stick length = 3×10 + 6 + 8 = 44 cm.
//
// Geometry (10 SVG units per cm; viewBox 0 0 185 135):
//   T = (90, 10)   — top shared vertex
//   B = (90, 110)  — bottom shared vertex
//   L = (3, 60)    — left vertex (equilateral only)
//   R = (138, 74)  — right-angle vertex (right triangle only)
//   T-B = 100u = 10 cm (shared side = hypotenuse of right △)
//   B-R =  60u =  6 cm  |  T-R = 80u = 8 cm
//   Verified: RB⃗ · RT⃗ = (−48)(−48) + (36)(−64) = 2304 − 2304 = 0 ✓
//
// SSR-safe: no hooks, no random, no Date.

export const W = 185
export const H = 135

type Pt = { x: number; y: number }

export const PTS = {
  T: { x: 90,  y: 10  } as Pt,
  B: { x: 90,  y: 110 } as Pt,
  L: { x: 3,   y: 60  } as Pt,
  R: { x: 138, y: 74  } as Pt,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function TickMark({ p1, p2, size = 8 }: { p1: Pt; p2: Pt; size?: number }) {
  const mx = (p1.x + p2.x) / 2
  const my = (p1.y + p2.y) / 2
  const d  = Math.hypot(p2.x - p1.x, p2.y - p1.y)
  const px = -(p2.y - p1.y) / d
  const py =  (p2.x - p1.x) / d
  return (
    <line
      x1={mx + px * size} y1={my + py * size}
      x2={mx - px * size} y2={my - py * size}
      stroke="#374151" strokeWidth={2}
    />
  )
}

function RightAngleMark({ v, legA, legB, sz = 9 }: { v: Pt; legA: Pt; legB: Pt; sz?: number }) {
  const da = Math.hypot(legA.x - v.x, legA.y - v.y)
  const db = Math.hypot(legB.x - v.x, legB.y - v.y)
  const ua = { x: (legA.x - v.x) / da, y: (legA.y - v.y) / da }
  const ub = { x: (legB.x - v.x) / db, y: (legB.y - v.y) / db }
  const p1 = { x: v.x + ua.x * sz,               y: v.y + ua.y * sz }
  const p2 = { x: v.x + ua.x * sz + ub.x * sz,   y: v.y + ua.y * sz + ub.y * sz }
  const p3 = { x: v.x + ub.x * sz,               y: v.y + ub.y * sz }
  return (
    <polyline
      points={`${p1.x.toFixed(1)},${p1.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)} ${p3.x.toFixed(1)},${p3.y.toFixed(1)}`}
      fill="none" stroke="#374151" strokeWidth={1.5}
    />
  )
}

// ── Shared figure primitive ───────────────────────────────────────────────────

export interface FrameFigureProps {
  /** Colour for the two unique equilateral sides (T-L, L-B). */
  equilColor?: string
  /** Colour for the shared side T-B (equilateral side = right-triangle hypotenuse). */
  sharedColor?: string
  /** Colour for the two unique right-triangle sides (B-R, T-R). */
  rightColor?: string
  /** Show the derived "8 cm" label on T-R (explainer only). */
  showHypoLabel?: boolean
}

/**
 * FrameOSN10EQ20Figure — shared SVG primitive for illustration + explainer.
 * Emits a root `<svg>`. Pure render, SSR-safe, no hooks.
 */
export function FrameOSN10EQ20Figure({
  equilColor  = '#374151',
  sharedColor,
  rightColor  = '#374151',
  showHypoLabel = false,
}: FrameFigureProps) {
  const sc = sharedColor ?? equilColor
  const { T, B, L, R } = PTS

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Equilateral unique sides */}
      <line x1={T.x} y1={T.y} x2={L.x} y2={L.y} stroke={equilColor}  strokeWidth={2.5} strokeLinecap="round" />
      <line x1={L.x} y1={L.y} x2={B.x} y2={B.y} stroke={equilColor}  strokeWidth={2.5} strokeLinecap="round" />
      {/* Shared side */}
      <line x1={T.x} y1={T.y} x2={B.x} y2={B.y} stroke={sc}          strokeWidth={2.5} strokeLinecap="round" />
      {/* Right-triangle unique sides */}
      <line x1={B.x} y1={B.y} x2={R.x} y2={R.y} stroke={rightColor}  strokeWidth={2.5} strokeLinecap="round" />
      <line x1={T.x} y1={T.y} x2={R.x} y2={R.y} stroke={rightColor}  strokeWidth={2.5} strokeLinecap="round" />

      {/* Tick marks — all 3 equilateral sides equal 10 cm */}
      <TickMark p1={T} p2={L} />
      <TickMark p1={L} p2={B} />
      <TickMark p1={T} p2={B} />

      {/* Right-angle mark at R */}
      <RightAngleMark v={R} legA={B} legB={T} sz={9} />

      {/* "10 cm" label — alongside T-L side, upper-left */}
      <text x="28" y="20" textAnchor="middle" fontSize={11} fontFamily="sans-serif" fill="#374151">
        10 cm
      </text>

      {/* "6 cm" label — below B-R segment, lower-right */}
      <text x="118" y="123" textAnchor="middle" fontSize={11} fontFamily="sans-serif" fill="#374151">
        6 cm
      </text>

      {/* "8 cm" label on T-R — explainer only, upper-right of segment */}
      {showHypoLabel && (
        <text x="130" y="34" textAnchor="middle" fontSize={11} fontFamily="sans-serif"
          fill="#2563EB" fontWeight="bold">
          8 cm
        </text>
      )}
    </svg>
  )
}

// ── Default export: static stem illustration ──────────────────────────────────

/**
 * FrameOSN10EQ20Illustration
 *
 * Faithful to OSN 2010 SD Kecamatan Q20: equilateral triangle (10 cm sides)
 * sharing one side with a right triangle (6 cm base, right angle at vertex R).
 * Does NOT reveal the answer (missing leg 8 cm or total 44 cm).
 */
export default function FrameOSN10EQ20Illustration({ params }: { params?: unknown }) {
  void params
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Kerangka yang terdiri dari segitiga sama sisi (sisi 10 cm) dan segitiga siku-siku (satu kaki 6 cm, sudut siku-siku di R) yang berbagi satu sisi. Tentukan total panjang tongkat kayu."
    >
      <FrameOSN10EQ20Figure />
    </div>
  )
}
