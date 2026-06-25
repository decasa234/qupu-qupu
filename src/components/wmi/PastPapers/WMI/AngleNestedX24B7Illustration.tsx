// AngleNestedX24B7Illustration — SEAMOX-24-B-Q7
//
// "In the figure below, find the value of x."  Answer: x = 82°
//
// Figure: outer triangle A (top, apex x°) – B (bottom-left) – C (bottom-right),
// with two cevians from B and C meeting at an interior point P (inner apex 129°).
// The outer slices of the base angles are 29° at B and 18° at C.
//
// Derived coordinates (angle ABP = 29°, angle PCA = 18°, angle BPC ≈ 129°):
//   A = (200, 43), B = (20, 250), C = (380, 250), P = (244, 168)
//
// Pure SVG — no hooks, no framer-motion — SSR-safe.
// Co-exports AngleNestedX24B7Figure (used by the explainer).

type Pt = [number, number]

export const VA: Pt = [200, 43]   // outer apex (angle x°)
export const VB: Pt = [20, 250]   // outer bottom-left (29° outer slice)
export const VC: Pt = [380, 250]  // outer bottom-right (18° outer slice)
export const VP: Pt = [244, 168]  // inner apex (129°)

// ── Geometry helpers ──────────────────────────────────────────────────────────

function angleArc(vertex: Pt, a: Pt, b: Pt, r: number): string {
  const ang = (p: Pt) => Math.atan2(p[1] - vertex[1], p[0] - vertex[0])
  const a0 = ang(a)
  let a1 = ang(b)
  let d = a1 - a0
  while (d <= -Math.PI) d += 2 * Math.PI
  while (d > Math.PI) d -= 2 * Math.PI
  a1 = a0 + d
  const sweep = d >= 0 ? 1 : 0
  const x0 = vertex[0] + r * Math.cos(a0)
  const y0 = vertex[1] + r * Math.sin(a0)
  const x1 = vertex[0] + r * Math.cos(a1)
  const y1 = vertex[1] + r * Math.sin(a1)
  return `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 0 ${sweep} ${x1.toFixed(1)} ${y1.toFixed(1)}`
}

function bisectorPt(vertex: Pt, a: Pt, b: Pt, dist: number): Pt {
  const ang = (p: Pt) => Math.atan2(p[1] - vertex[1], p[0] - vertex[0])
  const a0 = ang(a)
  let a1 = ang(b)
  let d = a1 - a0
  while (d <= -Math.PI) d += 2 * Math.PI
  while (d > Math.PI) d -= 2 * Math.PI
  const mid = a0 + d / 2
  return [vertex[0] + dist * Math.cos(mid), vertex[1] + dist * Math.sin(mid)]
}

// ── Colours ───────────────────────────────────────────────────────────────────

const INK    = '#1F2937'
const BLUE   = '#30598A'
const ORANGE = '#f0853a'

// ── Figure primitive ──────────────────────────────────────────────────────────

export type AngleHighlight = 'x' | '29' | '18' | '129' | 'outer' | null

export interface AngleNestedFigureProps {
  highlight?: AngleHighlight
  /** Replace "x°" with "82°" at the apex (explainer final beat). */
  showAnswer?: boolean
}

/**
 * Core SVG figure reused by the explainer.
 * highlight='outer' spotlights the 29° and 18° marks together.
 */
export function AngleNestedX24B7Figure({
  highlight = null,
  showAnswer = false,
}: AngleNestedFigureProps = {}) {
  const isOuter = highlight === 'outer'
  const col = (which: '29' | '18' | '129' | 'x') =>
    highlight === which || (isOuter && (which === '29' || which === '18'))
      ? ORANGE : BLUE
  const sw = (which: '29' | '18' | '129' | 'x') =>
    highlight === which || (isOuter && (which === '29' || which === '18'))
      ? 2.6 : 1.8

  // Pre-compute arcs and label positions
  const arcX   = angleArc(VA, VB, VC, 22)
  const lblX   = bisectorPt(VA, VB, VC, 38)

  const arc29  = angleArc(VB, VA, VP, 28)
  const lbl29  = bisectorPt(VB, VA, VP, 46)

  const arc18  = angleArc(VC, VP, VA, 28)
  const lbl18  = bisectorPt(VC, VP, VA, 46)

  const arc129 = angleArc(VP, VB, VC, 22)
  const lbl129 = bisectorPt(VP, VB, VC, 40)

  const poly = (pts: Pt[]) => pts.map(([x, y]) => `${x},${y}`).join(' ')

  return (
    <svg viewBox="0 20 400 250" width={320} aria-hidden="true">
      {/* Outer triangle */}
      <polygon
        points={poly([VA, VB, VC])}
        fill="none"
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Cevians B→P and C→P */}
      <line x1={VB[0]} y1={VB[1]} x2={VP[0]} y2={VP[1]} stroke={INK} strokeWidth={2} strokeLinecap="round" />
      <line x1={VC[0]} y1={VC[1]} x2={VP[0]} y2={VP[1]} stroke={INK} strokeWidth={2} strokeLinecap="round" />

      {/* x° at A */}
      <path d={arcX} fill="none" stroke={col('x')} strokeWidth={sw('x')} strokeLinecap="round" />
      <text x={lblX[0]} y={lblX[1]}
        textAnchor="middle" dominantBaseline="central"
        fontSize={15} fontStyle="italic" fontWeight={700}
        fill={col('x')}
        fontFamily="ui-sans-serif, system-ui, sans-serif">
        {showAnswer ? '82°' : 'x°'}
      </text>

      {/* 29° at B */}
      <path d={arc29} fill="none" stroke={col('29')} strokeWidth={sw('29')} strokeLinecap="round" />
      <text x={lbl29[0]} y={lbl29[1]}
        textAnchor="middle" dominantBaseline="central"
        fontSize={14} fontWeight={600}
        fill={col('29')}
        fontFamily="ui-sans-serif, system-ui, sans-serif">
        29°
      </text>

      {/* 18° at C */}
      <path d={arc18} fill="none" stroke={col('18')} strokeWidth={sw('18')} strokeLinecap="round" />
      <text x={lbl18[0]} y={lbl18[1]}
        textAnchor="middle" dominantBaseline="central"
        fontSize={14} fontWeight={600}
        fill={col('18')}
        fontFamily="ui-sans-serif, system-ui, sans-serif">
        18°
      </text>

      {/* 129° at P */}
      <path d={arc129} fill="none" stroke={col('129')} strokeWidth={sw('129')} strokeLinecap="round" />
      <text x={lbl129[0]} y={lbl129[1]}
        textAnchor="middle" dominantBaseline="central"
        fontSize={14} fontWeight={600}
        fill={col('129')}
        fontFamily="ui-sans-serif, system-ui, sans-serif">
        129°
      </text>
    </svg>
  )
}

const ARIA =
  'Outer triangle: apex angle x at top, bottom-left corner has outer slice 29 degrees, ' +
  'bottom-right corner has outer slice 18 degrees. Two cevians from the base corners ' +
  'meet at interior point P where the inner angle is 129 degrees. Find x.'

export default function AngleNestedX24B7Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <AngleNestedX24B7Figure />
    </div>
  )
}
