// ChainedTriOSN25NFQ25Illustration — OSN-25-SD-NAS-FINAL-Q25
//
// Three right triangles ABC, CDE, ECF chained along a horizontal baseline B–C–D:
//   • △ABC: right angle at B, AB = 12 cm, BC = 5 cm → AC = 13 cm
//   • △CDE: right angle at D, CD = 9 cm → DE = 15/4 cm, CE = 39/4 cm
//             (similar to △ABC with scale 3/4; same angle at C)
//   • △ECF: right angle at C (CE ⊥ CF); F lies on segment AC
//   FE ∥ BD (horizontal). Find FE.
//
// Geometry (1 cm = 16 px):
//   A=(70,60), B=(70,252), C=(150,252), D=(294,252), E=(294,192), F=(125,192)
//   FE = 294 − 125 = 169 px = 169/16 cm.
//   Note: seed value 25/16 is flagged "verify-answer" — geometry confirms 169/16.
//
// Co-exports ChainedTriFigure for the explainer to reuse with highlight props.
// SSR-safe: no hooks, no framer-motion.

type Pt = readonly [number, number]

// ── Coordinate constants ──────────────────────────────────────────────────────
const SCALE = 16          // 1 cm → 16 px

const bx = 70, by = 252
export const PA: Pt = [bx,                    by - 12 * SCALE] // (70, 60)
export const PB: Pt = [bx,                    by]              // (70, 252)
export const PC: Pt = [bx + 5  * SCALE,       by]              // (150, 252)
export const PD: Pt = [bx + 14 * SCALE,       by]              // (294, 252)
const DE_PX = (15 / 4) * SCALE                                 // 60 px
export const PE: Pt = [PD[0],                 by - DE_PX]      // (294, 192)
export const PF: Pt = [bx + (55 / 16) * SCALE, by - DE_PX]    // (125, 192)

// ── Right-angle square helpers ────────────────────────────────────────────────

// At B: arms rightward (+x) and upward (−y)
function sqB(s = 11): string {
  const [bx2, by2] = PB
  return `M ${bx2},${by2 - s} L ${bx2 + s},${by2 - s} L ${bx2 + s},${by2}`
}

// At D: arms leftward (−x) and upward (−y)
function sqD(s = 11): string {
  const [dx, dy] = PD
  return `M ${dx},${dy - s} L ${dx - s},${dy - s} L ${dx - s},${dy}`
}

// At C in △ECF: arms along CE unit (12/13, −5/13) and CF unit (−5/13, −12/13)
function sqC(s = 12): string {
  const [cx, cy] = PC
  const u1x =  12 / 13, u1y = -5  / 13  // toward E
  const u2x = -5  / 13, u2y = -12 / 13  // toward F
  const p1x = cx + s * u1x, p1y = cy + s * u1y
  const p2x = cx + s * u2x, p2y = cy + s * u2y
  const p3x = p1x + s * u2x, p3y = p1y + s * u2y
  return (
    `M ${p1x.toFixed(1)},${p1y.toFixed(1)} ` +
    `L ${p3x.toFixed(1)},${p3y.toFixed(1)} ` +
    `L ${p2x.toFixed(1)},${p2y.toFixed(1)}`
  )
}

// ── Arrow on FE (rightward, midpoint) ────────────────────────────────────────

function ArrowFE() {
  const mx = (PF[0] + PE[0]) / 2
  const my = PF[1]
  return (
    <polygon
      points={`${mx - 1},${my - 5} ${mx + 8},${my} ${mx - 1},${my + 5}`}
      fill="#374151"
    />
  )
}

// ── Shared figure component ───────────────────────────────────────────────────

export interface ChainedTriFigureProps {
  /** Highlight FE in blue (final answer reveal) */
  highlightFE?: boolean
  /** Highlight CE in amber */
  highlightCE?: boolean
  /** Highlight CF in green */
  highlightCF?: boolean
  /** Optional FE length label */
  feLabel?: string
}

export function ChainedTriFigure({
  highlightFE = false,
  highlightCE = false,
  highlightCF = false,
  feLabel,
}: ChainedTriFigureProps = {}) {
  const neutral   = '#374151'
  const feColor   = highlightFE ? '#2563EB' : neutral
  const ceColor   = highlightCE ? '#D97706' : neutral
  const cfColor   = highlightCF ? '#16A34A' : neutral
  const feW       = highlightFE ? 2.8 : 1.8
  const ceW       = highlightCE ? 2.8 : 1.8
  const cfW       = highlightCF ? 2.8 : 1.8
  const dotFill   = '#111827'
  const sqStroke  = '#2E7D32'

  return (
    <svg
      viewBox="0 0 380 280"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: '100%', maxWidth: 380, height: 'auto', display: 'block' }}
    >
      {/* ── △ABC sides ─────────────────────────────────────────────────────── */}
      {/* AB (vertical left) */}
      <line x1={PA[0]} y1={PA[1]} x2={PB[0]} y2={PB[1]} stroke={neutral} strokeWidth={1.8} />
      {/* BC (horizontal bottom, left segment) */}
      <line x1={PB[0]} y1={PB[1]} x2={PC[0]} y2={PC[1]} stroke={neutral} strokeWidth={1.8} />
      {/* AC (hypotenuse of △ABC, also side CF of △ECF) */}
      <line x1={PA[0]} y1={PA[1]} x2={PC[0]} y2={PC[1]} stroke={neutral}  strokeWidth={1.8} />

      {/* ── △CDE sides ─────────────────────────────────────────────────────── */}
      {/* CD (horizontal bottom, right segment) */}
      <line x1={PC[0]} y1={PC[1]} x2={PD[0]} y2={PD[1]} stroke={neutral} strokeWidth={1.8} />
      {/* DE (vertical right) */}
      <line x1={PD[0]} y1={PD[1]} x2={PE[0]} y2={PE[1]} stroke={neutral} strokeWidth={1.8} />
      {/* CE (hypotenuse of △CDE, also leg of △ECF) */}
      <line x1={PC[0]} y1={PC[1]} x2={PE[0]} y2={PE[1]} stroke={ceColor} strokeWidth={ceW} />

      {/* ── △ECF extra sides ───────────────────────────────────────────────── */}
      {/* FE (horizontal, the segment to find) */}
      <line x1={PF[0]} y1={PF[1]} x2={PE[0]} y2={PE[1]} stroke={feColor} strokeWidth={feW} />
      {/* CF (leg of △ECF; F is on AC so this overlaps part of AC) */}
      <line x1={PF[0]} y1={PF[1]} x2={PC[0]} y2={PC[1]} stroke={cfColor} strokeWidth={cfW} />

      {/* Arrow on FE → shows FE ∥ BD */}
      <ArrowFE />

      {/* ── Right-angle squares ─────────────────────────────────────────────── */}
      <path d={sqB()} fill="none" stroke={sqStroke} strokeWidth={1.5} />
      <path d={sqD()} fill="none" stroke={sqStroke} strokeWidth={1.5} />
      <path d={sqC()} fill="none" stroke={sqStroke} strokeWidth={1.5} />

      {/* ── Vertex dots ─────────────────────────────────────────────────────── */}
      {([PA, PB, PC, PD, PE, PF] as Pt[]).map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.5} fill={dotFill} />
      ))}

      {/* ── Vertex labels ───────────────────────────────────────────────────── */}
      <text x={PA[0] - 15} y={PA[1] + 6}  fontSize={14} fontWeight="700" fill={dotFill} fontFamily="sans-serif" textAnchor="middle">A</text>
      <text x={PB[0] - 15} y={PB[1] + 6}  fontSize={14} fontWeight="700" fill={dotFill} fontFamily="sans-serif" textAnchor="middle">B</text>
      <text x={PC[0]}      y={PC[1] + 18}  fontSize={14} fontWeight="700" fill={dotFill} fontFamily="sans-serif" textAnchor="middle">C</text>
      <text x={PD[0] + 15} y={PD[1] + 6}  fontSize={14} fontWeight="700" fill={dotFill} fontFamily="sans-serif" textAnchor="middle">D</text>
      <text x={PE[0] + 15} y={PE[1] + 6}  fontSize={14} fontWeight="700" fill={dotFill} fontFamily="sans-serif" textAnchor="middle">E</text>
      <text x={PF[0]}      y={PF[1] - 14} fontSize={14} fontWeight="700" fill={dotFill} fontFamily="sans-serif" textAnchor="middle">F</text>

      {/* ── Side dimension labels ────────────────────────────────────────────── */}
      {/* AB = 12 (left edge, centered vertically) */}
      <text
        x={PA[0] - 24} y={(PA[1] + PB[1]) / 2}
        fontSize={13} fontWeight="600" fill={neutral} fontFamily="sans-serif"
        textAnchor="middle" dominantBaseline="central"
      >12</text>
      {/* BC = 5 (bottom, first segment) */}
      <text
        x={(PB[0] + PC[0]) / 2} y={PB[1] + 18}
        fontSize={13} fontWeight="600" fill={neutral} fontFamily="sans-serif" textAnchor="middle"
      >5</text>
      {/* CD = 9 (bottom, second segment) */}
      <text
        x={(PC[0] + PD[0]) / 2} y={PC[1] + 18}
        fontSize={13} fontWeight="600" fill={neutral} fontFamily="sans-serif" textAnchor="middle"
      >9</text>

      {/* FE length label — shown only in explainer result beat */}
      {feLabel && (
        <text
          x={(PF[0] + PE[0]) / 2} y={PF[1] - 14}
          fontSize={13} fontWeight="700" fill="#2563EB" fontFamily="sans-serif" textAnchor="middle"
        >{feLabel}</text>
      )}
    </svg>
  )
}

// ── Default export: stem illustration (problem only, no FE length) ────────────

export default function ChainedTriOSN25NFQ25Illustration() {
  return (
    <div
      className="mx-auto w-full max-w-[380px]"
      role="img"
      aria-label={
        'Tiga segitiga siku-siku berurutan ABC, CDE, dan ECF. ' +
        'AB = 12 cm (vertikal), BC = 5 cm, CD = 9 cm (keduanya horizontal). ' +
        'FE sejajar BD. Cari panjang FE.'
      }
    >
      <ChainedTriFigure />
    </div>
  )
}
