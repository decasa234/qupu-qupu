// KiteOSN24NT2Q13Illustration — OSN-24-SD-NAS-TEORI2-Q13
//
// "Suppose that ABCD is a kite with AD = 5 cm, CD = 12 cm,
//  ∠BAD = 134.8° and ∠BCD = 45.2°. Determine the length of BD."
// Answer: BD = 10·cos(22,6°) ≈ 9,23 cm
//
// Kite ABCD: AB = AD = 5 cm, CB = CD = 12 cm; axis of symmetry = diagonal AC.
// Computed coordinates (scale ≈ 14 px/cm):
//   AM = AB·cos(67.4°) ≈ 27 px,  BM = AB·sin(67.4°) ≈ 65 px
//   CM = CB·cos(22.6°) ≈ 155 px
//   A = (120, 25), M = (120, 52), B = (185, 52), D = (55, 52), C = (120, 207)
//
// Pure SVG — no hooks, no framer-motion — SSR-safe.
// Co-exports KiteOSN24NT2Q13Figure (reused by the explainer).

type Pt = [number, number]

// ── Vertices ──────────────────────────────────────────────────────────────────
export const VA: Pt = [120, 25]   // top vertex A (∠BAD = 134.8°)
export const VB: Pt = [185, 52]   // right vertex B
export const VC: Pt = [120, 207]  // bottom vertex C (∠BCD = 45.2°)
export const VD: Pt = [55, 52]    // left vertex D
export const VM: Pt = [120, 52]   // midpoint of BD (intersection of diagonals)

// ── Geometry helpers ──────────────────────────────────────────────────────────

function angleDeg(vertex: Pt, p1: Pt, p2: Pt): string {
  const ang = (p: Pt) => Math.atan2(p[1] - vertex[1], p[0] - vertex[0])
  const a0 = ang(p1)
  let a1 = ang(p2)
  let d = a1 - a0
  while (d <= -Math.PI) d += 2 * Math.PI
  while (d > Math.PI) d -= 2 * Math.PI
  a1 = a0 + d
  const sweep = d >= 0 ? 1 : 0
  const r = vertex === VA ? 16 : 20
  const x0 = vertex[0] + r * Math.cos(a0)
  const y0 = vertex[1] + r * Math.sin(a0)
  const x1 = vertex[0] + r * Math.cos(a1)
  const y1 = vertex[1] + r * Math.sin(a1)
  return `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 0 ${sweep} ${x1.toFixed(1)} ${y1.toFixed(1)}`
}

function bisectorPt(vertex: Pt, p1: Pt, p2: Pt, dist: number): Pt {
  const ang = (p: Pt) => Math.atan2(p[1] - vertex[1], p[0] - vertex[0])
  const a0 = ang(p1)
  let a1 = ang(p2)
  let d = a1 - a0
  while (d <= -Math.PI) d += 2 * Math.PI
  while (d > Math.PI) d -= 2 * Math.PI
  const mid = a0 + d / 2
  return [vertex[0] + dist * Math.cos(mid), vertex[1] + dist * Math.sin(mid)]
}

function midpt(a: Pt, b: Pt): Pt {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
}

// ── Colours ───────────────────────────────────────────────────────────────────
const INK    = '#1F2937'
const BLUE   = '#30598A'
const ORANGE = '#D97706'
const GREEN  = '#059669'
const MUTED  = '#9CA3AF'

// ── Figure highlight type ─────────────────────────────────────────────────────
export type KiteHighlight =
  | null
  | 'equal-short'   // AB = AD = 5
  | 'equal-long'    // CB = CD = 12
  | 'triangle-ABD'  // focus on upper triangle
  | 'base-angles'   // ∠ABD = ∠ADB = 22.6°
  | 'BD'            // reveal BD with answer

export interface KiteFigureProps {
  highlight?: KiteHighlight
  showAnswer?: boolean
  lang?: 'en' | 'id'
}

/**
 * Core SVG figure reused by the explainer.
 */
export function KiteOSN24NT2Q13Figure({
  highlight = null,
  showAnswer = false,
}: KiteFigureProps = {}) {
  const poly = (pts: Pt[]) => pts.map(([x, y]) => `${x},${y}`).join(' ')

  const sideAB = highlight === 'equal-short' || highlight === 'triangle-ABD'
  const sideAD = highlight === 'equal-short' || highlight === 'triangle-ABD'
  const sideCB = highlight === 'equal-long'
  const sideCD = highlight === 'equal-long'
  const showBD = highlight === 'triangle-ABD' || highlight === 'base-angles' || highlight === 'BD'
  const showTriABD = highlight === 'triangle-ABD' || highlight === 'base-angles'

  const arcA  = angleDeg(VA, VD, VB)
  const lblA  = bisectorPt(VA, VD, VB, 36)
  const arcC  = angleDeg(VC, VB, VD)
  const lblC  = bisectorPt(VC, VB, VD, 46)

  // base-angle arcs for explainer (∠ABD and ∠ADB = 22.6°)
  const arcABD = angleDeg(VB, VA, VD)
  const lblABD = bisectorPt(VB, VA, VD, 38)
  const arcADB = angleDeg(VD, VB, VA)
  const lblADB = bisectorPt(VD, VB, VA, 38)

  const midAD = midpt(VA, VD)
  const midCD = midpt(VC, VD)
  const midAB = midpt(VA, VB)
  const midCB = midpt(VC, VB)

  return (
    <svg viewBox="0 0 240 235" width={260} aria-hidden="true">
      {/* Kite outline A-B-C-D */}
      <polygon
        points={poly([VA, VB, VC, VD])}
        fill="#F0F7FF"
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Highlight equal short sides AB = AD */}
      {sideAB && (
        <line x1={VA[0]} y1={VA[1]} x2={VB[0]} y2={VB[1]}
          stroke={ORANGE} strokeWidth={3.5} strokeLinecap="round" />
      )}
      {sideAD && (
        <line x1={VA[0]} y1={VA[1]} x2={VD[0]} y2={VD[1]}
          stroke={ORANGE} strokeWidth={3.5} strokeLinecap="round" />
      )}
      {sideCB && (
        <line x1={VC[0]} y1={VC[1]} x2={VB[0]} y2={VB[1]}
          stroke={BLUE} strokeWidth={3.5} strokeLinecap="round" />
      )}
      {sideCD && (
        <line x1={VC[0]} y1={VC[1]} x2={VD[0]} y2={VD[1]}
          stroke={BLUE} strokeWidth={3.5} strokeLinecap="round" />
      )}

      {/* Triangle ABD shading */}
      {showTriABD && (
        <polygon
          points={poly([VA, VB, VD])}
          fill="#FEF3C7"
          stroke={ORANGE}
          strokeWidth={2.2}
          strokeLinejoin="round"
          opacity={0.8}
        />
      )}

      {/* BD diagonal */}
      {showBD && (
        <line x1={VD[0]} y1={VD[1]} x2={VB[0]} y2={VB[1]}
          stroke={highlight === 'BD' ? GREEN : ORANGE}
          strokeWidth={highlight === 'BD' ? 3 : 2.5}
          strokeDasharray={highlight === 'BD' ? '0' : '6 3'}
          strokeLinecap="round" />
      )}
      {/* BD question marker in stem (always shown dashed, no value) */}
      {!showBD && (
        <line x1={VD[0]} y1={VD[1]} x2={VB[0]} y2={VB[1]}
          stroke={MUTED} strokeWidth={1.5} strokeDasharray="5 4" strokeLinecap="round" />
      )}

      {/* Angle arc at A */}
      <path d={arcA} fill="none" stroke={BLUE} strokeWidth={1.8} strokeLinecap="round" />
      <text x={lblA[0]} y={lblA[1]}
        textAnchor="middle" dominantBaseline="central"
        fontSize={11} fontWeight={600} fill={BLUE}
        fontFamily="ui-sans-serif, system-ui, sans-serif">
        134,8°
      </text>

      {/* Angle arc at C */}
      <path d={arcC} fill="none" stroke={BLUE} strokeWidth={1.8} strokeLinecap="round" />
      <text x={lblC[0]} y={lblC[1]}
        textAnchor="middle" dominantBaseline="central"
        fontSize={11} fontWeight={600} fill={BLUE}
        fontFamily="ui-sans-serif, system-ui, sans-serif">
        45,2°
      </text>

      {/* Base-angle arcs for explainer */}
      {highlight === 'base-angles' && (
        <>
          <path d={arcABD} fill="none" stroke={ORANGE} strokeWidth={2} strokeLinecap="round" />
          <text x={lblABD[0]} y={lblABD[1]}
            textAnchor="middle" dominantBaseline="central"
            fontSize={10.5} fontWeight={700} fill={ORANGE}
            fontFamily="ui-sans-serif, system-ui, sans-serif">
            22,6°
          </text>
          <path d={arcADB} fill="none" stroke={ORANGE} strokeWidth={2} strokeLinecap="round" />
          <text x={lblADB[0]} y={lblADB[1]}
            textAnchor="middle" dominantBaseline="central"
            fontSize={10.5} fontWeight={700} fill={ORANGE}
            fontFamily="ui-sans-serif, system-ui, sans-serif">
            22,6°
          </text>
        </>
      )}

      {/* Right-angle mark at M (perpendicular diagonals) */}
      {(highlight === 'BD' || highlight === 'base-angles') && (
        <g transform={`translate(${VM[0]}, ${VM[1]})`}>
          <rect x={2} y={-8} width={8} height={8} fill="none" stroke={MUTED} strokeWidth={1.2} />
        </g>
      )}

      {/* Side labels */}
      <text x={midAD[0] - 8} y={midAD[1]}
        textAnchor="end" dominantBaseline="central"
        fontSize={11.5} fontWeight={600}
        fill={sideAD ? ORANGE : '#374151'}
        fontFamily="ui-sans-serif, system-ui, sans-serif">
        5 cm
      </text>
      <text x={midCD[0] - 8} y={midCD[1]}
        textAnchor="end" dominantBaseline="central"
        fontSize={11.5} fontWeight={600}
        fill={sideCD ? BLUE : '#374151'}
        fontFamily="ui-sans-serif, system-ui, sans-serif">
        12 cm
      </text>

      {/* BD label */}
      <text x={VM[0]} y={VM[1] - 10}
        textAnchor="middle" dominantBaseline="auto"
        fontSize={12} fontWeight={700}
        fill={highlight === 'BD' ? GREEN : MUTED}
        fontFamily="ui-sans-serif, system-ui, sans-serif">
        {showAnswer ? 'BD ≈ 9,23 cm' : 'BD = ?'}
      </text>

      {/* Vertex labels */}
      <text x={VA[0]} y={VA[1] - 10}
        textAnchor="middle" dominantBaseline="auto"
        fontSize={14} fontWeight={700} fill={INK}
        fontFamily="ui-sans-serif, system-ui, sans-serif">
        A
      </text>
      <text x={VB[0] + 8} y={VB[1]}
        textAnchor="start" dominantBaseline="central"
        fontSize={14} fontWeight={700} fill={INK}
        fontFamily="ui-sans-serif, system-ui, sans-serif">
        B
      </text>
      <text x={VC[0]} y={VC[1] + 16}
        textAnchor="middle" dominantBaseline="auto"
        fontSize={14} fontWeight={700} fill={INK}
        fontFamily="ui-sans-serif, system-ui, sans-serif">
        C
      </text>
      <text x={VD[0] - 8} y={VD[1]}
        textAnchor="end" dominantBaseline="central"
        fontSize={14} fontWeight={700} fill={INK}
        fontFamily="ui-sans-serif, system-ui, sans-serif">
        D
      </text>
    </svg>
  )
}

// ── Default export ─────────────────────────────────────────────────────────────

const ARIA =
  'Layang-layang ABCD dengan AD = 5 cm, CD = 12 cm, sudut BAD = 134,8° dan sudut BCD = 45,2°. ' +
  'Tentukan panjang BD.'

export default function KiteOSN24NT2Q13Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <KiteOSN24NT2Q13Figure />
    </div>
  )
}
