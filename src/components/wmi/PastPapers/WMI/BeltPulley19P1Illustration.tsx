// Belt-and-pulley figure for WMI-19P1A-Q14
// (2019 WMI Semifinal Grade 1 Paper A, question 14).
//
// Reconstructed from the scan (db/seed/wmi/figures/2019-semifinal-g1-a-q14.jpg):
//
//   Four pulley wheels (concentric circles) inside a rounded frame:
//     W1  top-left      — MARKED, a curved arrow shows it spins counter-clockwise.
//     W2  lower-middle  (below-right of W1)
//     W3  upper-right   (right of W2)
//     W4  lower-right   — this is wheel A (labelled "A").
//   The wheels are joined in a chain by CROSSED belts (each belt makes a
//   figure-8 between two wheels):  W1 ✗ W2 ✗ W3 ✗ W4(A).
//
//   Rule: a CROSSED belt reverses the spin direction between the two wheels it
//   joins (an uncrossed belt keeps it the same). Three crossed belts from the
//   marked wheel:  CCW → CW → CCW → CW, so wheel A spins CLOCKWISE.
//
// PROBLEM-ONLY: the static figure shows the four wheels, the crossed belts, the
// "A" label and ONLY the marked wheel's spin arrow. It never shows wheel A's
// direction or which choice is correct.
//
// Pure render — SSR-safe, deterministic (no window/Date/random at module top).

// ---------------------------------------------------------------------------
// Wheel layout (exported so the explainer reuses identical coordinates)
// ---------------------------------------------------------------------------

export type Spin = 'cw' | 'ccw'

export interface WheelDef {
  id: 'W1' | 'W2' | 'W3' | 'A'
  cx: number
  cy: number
  r: number
}

/** The four pulleys in chain order W1 → W2 → W3 → A. */
export const BP_WHEELS: WheelDef[] = [
  { id: 'W1', cx: 80, cy: 78, r: 30 },
  { id: 'W2', cx: 165, cy: 150, r: 36 },
  { id: 'W3', cx: 270, cy: 96, r: 36 },
  { id: 'A', cx: 350, cy: 170, r: 32 },
]

/**
 * Belt links in chain order. Every belt here is CROSSED (figure-8), so each one
 * flips the spin direction.
 */
export const BP_LINKS: Array<{ from: number; to: number; crossed: boolean }> = [
  { from: 0, to: 1, crossed: true },
  { from: 1, to: 2, crossed: true },
  { from: 2, to: 3, crossed: true },
]

/** The marked (driving) wheel index and its spin. */
export const BP_MARKED_INDEX = 0
export const BP_MARKED_SPIN: Spin = 'ccw'

/**
 * Propagate the spin from the marked wheel along the chain, flipping on each
 * crossed belt. Returns the spin of every wheel by index.
 */
export function bpSpins(): Spin[] {
  const spins: Spin[] = new Array(BP_WHEELS.length).fill('cw')
  spins[BP_MARKED_INDEX] = BP_MARKED_SPIN
  for (const link of BP_LINKS) {
    const prev = spins[link.from]
    spins[link.to] = link.crossed ? flip(prev) : prev
  }
  return spins
}

function flip(s: Spin): Spin {
  return s === 'cw' ? 'ccw' : 'cw'
}

export const BP_VIEW_W = 440
export const BP_VIEW_H = 250

const INK = '#1F2937'

// ---------------------------------------------------------------------------
// Reusable primitives
// ---------------------------------------------------------------------------

/** A pulley wheel: three concentric rings + a hub, matching the scan. */
export function Pulley({ cx, cy, r, accent }: { cx: number; cy: number; r: number; accent?: string }) {
  const stroke = accent ?? INK
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#FFFFFF" stroke={stroke} strokeWidth={2.5} />
      <circle cx={cx} cy={cy} r={r * 0.66} fill="none" stroke={stroke} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={r * 0.34} fill="none" stroke={stroke} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={r * 0.12} fill={stroke} />
    </g>
  )
}

/**
 * A curved spin arrow encircling a wheel, indicating its rotation.
 * `spin` = 'cw' draws a clockwise arc-arrow, 'ccw' counter-clockwise.
 */
export function SpinArrow({ cx, cy, r, spin, color = INK }: { cx: number; cy: number; r: number; spin: Spin; color?: string }) {
  // Arc spans ~210° around the top of the wheel; arrowhead at the leading end.
  const rr = r + 10
  // Start / end angles in degrees (0 = +x, CCW positive in math but SVG y is down).
  // We draw a top arc from upper-right to upper-left.
  const startDeg = spin === 'ccw' ? -35 : 215
  const endDeg = spin === 'ccw' ? 215 : -35
  const toXY = (deg: number): [number, number] => {
    const rad = (deg * Math.PI) / 180
    return [cx + rr * Math.cos(rad), cy - rr * Math.sin(rad)]
  }
  const [sx, sy] = toXY(startDeg)
  const [ex, ey] = toXY(endDeg)
  // sweep flag: for CCW (math positive) going start→end increasing angle, sweep=0 in SVG (y-down)
  const sweep = spin === 'ccw' ? 0 : 1
  const largeArc = 1
  // Arrowhead at the end, tangent to the circle.
  const headAngle = endDeg + (spin === 'ccw' ? -1 : 1) * 18
  const [hx, hy] = toXY(headAngle)
  const tipDeg = endDeg + (spin === 'ccw' ? 8 : -8)
  const [tx, ty] = toXY(tipDeg)

  return (
    <g stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={`M ${sx} ${sy} A ${rr} ${rr} 0 ${largeArc} ${sweep} ${ex} ${ey}`} />
      {/* arrowhead */}
      <path d={`M ${hx} ${hy} L ${tx} ${ty} L ${ex + (ex - hx) * 0.2} ${ey + (ey - hy) * 0.2} `} fill={color} stroke="none" />
      <path d={`M ${ex} ${ey} L ${hx} ${hy}`} />
    </g>
  )
}

/** Compute the two tangent attach points on a wheel toward another point. */
function attach(cx: number, cy: number, r: number, tx: number, ty: number, side: 1 | -1): [number, number] {
  const dx = tx - cx
  const dy = ty - cy
  const len = Math.hypot(dx, dy) || 1
  // perpendicular unit vector
  const px = (-dy / len) * side
  const py = (dx / len) * side
  return [cx + px * r, cy + py * r]
}

/** A crossed belt (figure-8) between two wheels. */
export function CrossedBelt({ a, b }: { a: WheelDef; b: WheelDef }) {
  // Crossed belt: connect top of A to bottom of B and bottom of A to top of B.
  const [a1x, a1y] = attach(a.cx, a.cy, a.r, b.cx, b.cy, 1)
  const [a2x, a2y] = attach(a.cx, a.cy, a.r, b.cx, b.cy, -1)
  const [b1x, b1y] = attach(b.cx, b.cy, b.r, a.cx, a.cy, 1)
  const [b2x, b2y] = attach(b.cx, b.cy, b.r, a.cx, a.cy, -1)
  // cross the strands: a1→b1 and a2→b2 give the figure-8
  return (
    <g stroke={INK} strokeWidth={2} fill="none">
      <line x1={a1x} y1={a1y} x2={b1x} y2={b1y} />
      <line x1={a2x} y1={a2y} x2={b2x} y2={b2y} />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Main export — static problem figure
// ---------------------------------------------------------------------------

export default function BeltPulley19P1Illustration() {
  const marked = BP_WHEELS[BP_MARKED_INDEX]
  const aWheel = BP_WHEELS[BP_WHEELS.length - 1]

  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={
        'Belt and pulley system: four wheels joined in a chain by crossed belts. ' +
        'The top-left wheel is marked with a counter-clockwise spin arrow. Wheel A is the bottom-right wheel.'
      }
    >
      <svg
        viewBox={`0 0 ${BP_VIEW_W} ${BP_VIEW_H}`}
        width="100%"
        style={{ maxWidth: 420, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        <rect x={2} y={2} width={BP_VIEW_W - 4} height={BP_VIEW_H - 4} rx={20} fill="#FFFFFF" stroke="#9CA3AF" strokeWidth={2} />

        {/* belts behind the wheels */}
        {BP_LINKS.map((lnk, i) => (
          <CrossedBelt key={`belt${i}`} a={BP_WHEELS[lnk.from]} b={BP_WHEELS[lnk.to]} />
        ))}

        {/* wheels */}
        {BP_WHEELS.map((w) => (
          <Pulley key={w.id} cx={w.cx} cy={w.cy} r={w.r} />
        ))}

        {/* marked wheel's spin arrow (the only direction shown) */}
        <SpinArrow cx={marked.cx} cy={marked.cy} r={marked.r} spin={BP_MARKED_SPIN} />

        {/* "A" label beside the bottom-right wheel */}
        <text x={aWheel.cx + aWheel.r + 18} y={aWheel.cy + 8} textAnchor="middle" fontSize={24} fontWeight={800} fill={INK}>
          A
        </text>
      </svg>
    </div>
  )
}
