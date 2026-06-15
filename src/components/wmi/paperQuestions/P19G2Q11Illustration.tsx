// WMI-19P2A-Q11 (2019 Semifinal Grade 2 Paper A) — "A system of linked wheels and
// belts. If the wheel marked with the arrow turns in the direction shown, how does
// wheel A roll?"  Answer: B.
//
// Reconstructed from db/seed/wmi/figures/2019-semifinal-g2-a-q11.jpg (the JPG is
// NOT embedded). The scan shows a left-to-right chain of six pulley wheels:
//   - the LEFT-TOP wheel carries a curved arrow → it spins counter-clockwise (CCW);
//   - it drives a wheel below it through a CROSSED belt (the belt makes an X);
//   - that wheel drives the next up through an OPEN belt, and so on along the chain;
//   - one inner pair is joined by a rigid AXLE bar (a direct coupling, no belt);
//   - the RIGHT-TOP wheel is labelled A.
//
// The static figure shows ONLY the problem — the wheels, their links, and the start
// arrow on the first wheel. It NEVER shows which way wheel A ends up turning (that
// is the answer, revealed by the explainer link by link).
//
// Link rule (taught by the explainer):
//   • OPEN belt  → next wheel spins the SAME way.
//   • CROSSED belt → next wheel spins the OPPOSITE way.
//   • rigid AXLE (shared shaft) → SAME way (the two wheels are one piece).
//
// Pure render, SSR-safe, deterministic — no window/document/random/dates.

const INK = '#1F2937'
const BELT = '#1F2937'
const RIM = '#374151'
const HUB = '#9CA3AF'

export type Spin = 'cw' | 'ccw'

export interface Wheel {
  id: string
  cx: number
  cy: number
  r: number
}

/** How wheel i+1 is driven from wheel i. */
export type LinkKind = 'open' | 'crossed' | 'axle'

export interface Link {
  from: number
  to: number
  kind: LinkKind
}

// Six wheels, left → right, laid out in a shallow zigzag like the scan.
export const WHEELS: Wheel[] = [
  { id: 'start', cx: 70, cy: 70, r: 30 }, // 0 — arrow wheel (top-left)
  { id: 'w2', cx: 130, cy: 120, r: 26 }, // 1 — bottom-left
  { id: 'w3', cx: 205, cy: 60, r: 30 }, // 2 — top-middle
  { id: 'w4', cx: 255, cy: 118, r: 24 }, // 3 — bottom-middle
  { id: 'w5', cx: 330, cy: 118, r: 24 }, // 4 — bottom-middle-right (axle-coupled to w4)
  { id: 'A', cx: 400, cy: 66, r: 24 }, // 5 — top-right, wheel A
]

export const LINKS: Link[] = [
  { from: 0, to: 1, kind: 'crossed' }, // start → w2 : crossed belt (flip)
  { from: 1, to: 2, kind: 'open' }, // w2 → w3 : open belt (same)
  { from: 2, to: 3, kind: 'open' }, // w3 → w4 : open belt (same)
  { from: 3, to: 4, kind: 'axle' }, // w4 → w5 : rigid axle (same)
  { from: 4, to: 5, kind: 'crossed' }, // w5 → A  : crossed belt (flip)
]

export const START_SPIN: Spin = 'ccw'

/** Apply one link to a spin direction. open / axle keep it; crossed flips it. */
export function applyLink(spin: Spin, kind: LinkKind): Spin {
  if (kind === 'crossed') return spin === 'cw' ? 'ccw' : 'cw'
  return spin
}

/** Spin of every wheel, traced from the start arrow along the links. */
export function traceSpins(): Spin[] {
  const spins: Spin[] = new Array(WHEELS.length)
  spins[0] = START_SPIN
  for (const { from, to, kind } of LINKS) {
    spins[to] = applyLink(spins[from], kind)
  }
  return spins
}

/** The resolved spin of wheel A (the answer mechanic). */
export const ANSWER_SPIN: Spin = traceSpins()[WHEELS.length - 1]

/** A concentric pulley wheel centred at (cx, cy). */
export function PulleyWheel({ cx, cy, r, highlight }: { cx: number; cy: number; r: number; highlight?: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#FFFFFF" stroke={highlight ?? RIM} strokeWidth={highlight ? 3.5 : 2.4} />
      <circle cx={cx} cy={cy} r={r * 0.62} fill="none" stroke={RIM} strokeWidth={1.8} />
      <circle cx={cx} cy={cy} r={r * 0.22} fill={HUB} stroke={INK} strokeWidth={1.4} />
    </g>
  )
}

/** A curved rotation arrow around a wheel, showing `spin`. */
export function SpinArrow({ cx, cy, r, spin, color = INK }: { cx: number; cy: number; r: number; spin: Spin; color?: string }) {
  const rr = r + 9
  // Arc sweeps about 270° so the arrowhead reads clearly.
  const start = spin === 'ccw' ? -40 : 220
  const end = spin === 'ccw' ? 220 : -40
  const a0 = (start * Math.PI) / 180
  const a1 = (end * Math.PI) / 180
  const x0 = cx + rr * Math.cos(a0)
  const y0 = cy + rr * Math.sin(a0)
  const x1 = cx + rr * Math.cos(a1)
  const y1 = cy + rr * Math.sin(a1)
  const sweep = spin === 'ccw' ? 1 : 0
  // Arrowhead at the END of the arc, tangent to the circle.
  const tang = spin === 'ccw' ? a1 + Math.PI / 2 : a1 - Math.PI / 2
  const hx = Math.cos(tang)
  const hy = Math.sin(tang)
  const px = Math.cos(tang + Math.PI / 2)
  const py = Math.sin(tang + Math.PI / 2)
  const h = 8
  return (
    <g>
      <path
        d={`M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${rr} ${rr} 0 1 ${sweep} ${x1.toFixed(1)} ${y1.toFixed(1)}`}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <polygon
        points={`${(x1 + hx * h).toFixed(1)},${(y1 + hy * h).toFixed(1)} ${(x1 - hx * 3 + px * h * 0.7).toFixed(1)},${(
          y1 -
          hy * 3 +
          py * h * 0.7
        ).toFixed(1)} ${(x1 - hx * 3 - px * h * 0.7).toFixed(1)},${(y1 - hy * 3 - py * h * 0.7).toFixed(1)}`}
        fill={color}
      />
    </g>
  )
}

/** The belt(s) / axle joining two wheels. Open = two outer tangents; crossed = an X; axle = a rigid bar. */
function LinkDraw({ a, b, kind }: { a: Wheel; b: Wheel; kind: LinkKind }) {
  if (kind === 'axle') {
    // Rigid shared shaft: a short double bar between the hubs.
    return (
      <g>
        <line x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy} stroke={INK} strokeWidth={5} strokeLinecap="round" />
        <line x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy} stroke="#FFFFFF" strokeWidth={1.6} strokeLinecap="round" />
      </g>
    )
  }
  // Belt: draw the two connecting strands. Crossed strands swap which side they meet.
  const dx = b.cx - a.cx
  const dy = b.cy - a.cy
  const d = Math.hypot(dx, dy) || 1
  // unit normal
  const nx = -dy / d
  const ny = dx / d
  const strand = (s1: number, s2: number) => (
    <line
      x1={a.cx + nx * a.r * s1}
      y1={a.cy + ny * a.r * s1}
      x2={b.cx + nx * b.r * s2}
      y2={b.cy + ny * b.r * s2}
      stroke={BELT}
      strokeWidth={2}
    />
  )
  if (kind === 'crossed') {
    return (
      <g>
        {strand(1, -1)}
        {strand(-1, 1)}
      </g>
    )
  }
  return (
    <g>
      {strand(1, 1)}
      {strand(-1, -1)}
    </g>
  )
}

export interface WheelChainProps {
  /** When set, draw a spin arrow on each wheel up to and including this index (trace progress). */
  tracedTo?: number
  /** Index of the wheel to ring-highlight (the one currently being reasoned about). */
  focus?: number
  /** Override colour for the traced spin arrows. */
  arrowColor?: string
}

/**
 * The wheel-and-belt chain. At its defaults (tracedTo = -1) it is the pristine
 * question figure: six wheels, their links, and the start arrow on wheel 0 only.
 * The explainer passes `tracedTo` to reveal each wheel's spin one link at a time.
 */
export function WheelChain({ tracedTo = -1, focus, arrowColor = '#2563EB' }: WheelChainProps) {
  const spins = traceSpins()
  return (
    <svg viewBox="0 0 460 170" width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {/* links behind the wheels */}
      {LINKS.map((l, i) => (
        <LinkDraw key={i} a={WHEELS[l.from]} b={WHEELS[l.to]} kind={l.kind} />
      ))}
      {/* wheels */}
      {WHEELS.map((w, i) => (
        <PulleyWheel key={w.id} cx={w.cx} cy={w.cy} r={w.r} highlight={focus === i ? '#F59E0B' : undefined} />
      ))}
      {/* the start arrow is always shown (it is given in the problem) */}
      <SpinArrow cx={WHEELS[0].cx} cy={WHEELS[0].cy} r={WHEELS[0].r} spin={spins[0]} color={INK} />
      {/* traced spin arrows revealed by the explainer */}
      {WHEELS.map((w, i) =>
        i > 0 && i <= tracedTo ? (
          <SpinArrow key={`arr-${w.id}`} cx={w.cx} cy={w.cy} r={w.r} spin={spins[i]} color={arrowColor} />
        ) : null,
      )}
      {/* the A label */}
      <text x={WHEELS[5].cx + WHEELS[5].r + 14} y={WHEELS[5].cy + 5} fontSize={20} fontWeight={900} fill={INK}>
        A
      </text>
    </svg>
  )
}

export default function P19G2Q11Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Six pulley wheels in a left-to-right zigzag joined by belts, with one inner pair joined by a rigid axle bar. The top-left wheel has a curved arrow showing it turns counter-clockwise. The top-right wheel is labelled A. How does wheel A roll?"
    >
      <WheelChain />
    </div>
  )
}
