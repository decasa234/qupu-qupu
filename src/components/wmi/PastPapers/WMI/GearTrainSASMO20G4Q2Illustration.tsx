// SASMO-20-G4-Q2 — Gear-train stem illustration (no rotation arrows).
// Six meshed gears A–F in a horizontal chain.
// Source: docs/reference/ocr-res/sasmo/contest/g4/2019-2020.imgs/018.jpg
// Answer: D — Roda Gigi C berputar berlawanan jarum jam.
// Exports: GEARS, GearDef, gearPath, RotationArrow, CY, VW, VH (for explainer).
// Default export: GearTrainSASMO20G4Q2Illustration

// ── palette ───────────────────────────────────────────────────────────────────
const FILL   = '#4BBFCF'
const STROKE = '#0E6B7C'
const HOLE   = '#E8FAFB'
const SW     = 1.4

// ── types ─────────────────────────────────────────────────────────────────────
export interface GearDef {
  id: string
  cx: number
  cy: number
  outerR: number
  innerR: number
  holeR: number
  teeth: number
  offset?: number   // radians – angular phase offset for tooth alignment
}

// ── gear-path generator ───────────────────────────────────────────────────────
export function gearPath({ cx, cy, outerR, innerR, teeth, offset = 0 }: GearDef): string {
  const ta = (2 * Math.PI) / teeth
  const seg: string[] = []
  for (let i = 0; i < teeth; i++) {
    const base = offset + i * ta
    const a0 = base - ta * 0.45
    const a1 = base - ta * 0.18
    const a2 = base + ta * 0.18
    const a3 = base + ta * 0.45
    const p = (r: number, a: number) =>
      `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`
    seg.push(p(innerR, a0), p(outerR, a1), p(outerR, a2), p(innerR, a3))
  }
  return `M${seg.join(' L')} Z`
}

// ── layout ────────────────────────────────────────────────────────────────────
// All gears share the same centre-Y; mesh distance = innerR[i] + innerR[i+1].
export const CY = 66

const SPECS = [
  { id: 'A', outerR: 37, innerR: 29, holeR: 9,  teeth: 14 },
  { id: 'B', outerR: 19, innerR: 15, holeR: 5,  teeth: 8  },
  { id: 'C', outerR: 24, innerR: 19, holeR: 6,  teeth: 10 },
  { id: 'D', outerR: 19, innerR: 15, holeR: 5,  teeth: 8  },
  { id: 'E', outerR: 31, innerR: 25, holeR: 8,  teeth: 12 },
  { id: 'F', outerR: 22, innerR: 17, holeR: 5,  teeth: 8  },
]

export const GEARS: GearDef[] = (() => {
  const gs: GearDef[] = []
  let cx = SPECS[0].outerR + 5        // left pad so A's teeth don't clip
  for (let i = 0; i < SPECS.length; i++) {
    if (i > 0) cx += SPECS[i - 1].innerR + SPECS[i].innerR
    gs.push({ ...SPECS[i], cx, cy: CY })
  }
  return gs
})()

export const VW = GEARS[GEARS.length - 1].cx + GEARS[GEARS.length - 1].outerR + 5
export const VH = 115

// ── RotationArrow (exported for explainer) ───────────────────────────────────
// 270° arc with arrowhead, placed around the centre of the gear.
// dir='ccw': counterclockwise on screen (anti-clockwise, gear top moves left).
// dir='cw' : clockwise on screen.
export function RotationArrow({
  cx, cy, arcR, dir, color,
}: {
  cx: number; cy: number; arcR: number; dir: 'cw' | 'ccw'; color: string
}) {
  // Arc spans 270°, leaving a gap at the right side (between 315° and 45°).
  // CCW: from 315° to 45°, sweep=0 (counterclockwise in SVG = CCW on screen).
  // CW:  from  45° to 315°, sweep=1 (clockwise on screen).
  const startDeg = dir === 'ccw' ? 315 : 45
  const endDeg   = dir === 'ccw' ? 45  : 315
  const sweep    = dir === 'ccw' ? 0   : 1

  const sA = (startDeg * Math.PI) / 180
  const eA = (endDeg   * Math.PI) / 180

  const sx = cx + arcR * Math.cos(sA)
  const sy = cy + arcR * Math.sin(sA)
  const ex = cx + arcR * Math.cos(eA)
  const ey = cy + arcR * Math.sin(eA)

  // always large-arc (= 1) so the 270° path is taken
  const d = `M${sx.toFixed(2)},${sy.toFixed(2)} A${arcR},${arcR} 0 1,${sweep} ${ex.toFixed(2)},${ey.toFixed(2)}`

  // Velocity direction at endpoint:
  // CCW (θ decreasing): vel = ( sin(eA), −cos(eA))
  // CW  (θ increasing): vel = (−sin(eA),  cos(eA))
  const velX = dir === 'ccw' ?  Math.sin(eA) : -Math.sin(eA)
  const velY = dir === 'ccw' ? -Math.cos(eA) :  Math.cos(eA)
  const velA = Math.atan2(velY, velX)

  const HL = 6.0          // arrowhead leg length
  const SP = 0.42         // half-angle spread (radians)

  const hx1 = ex + HL * Math.cos(velA + Math.PI + SP)
  const hy1 = ey + HL * Math.sin(velA + Math.PI + SP)
  const hx2 = ex + HL * Math.cos(velA + Math.PI - SP)
  const hy2 = ey + HL * Math.sin(velA + Math.PI - SP)

  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <polygon
        points={`${ex.toFixed(2)},${ey.toFixed(2)} ${hx1.toFixed(2)},${hy1.toFixed(2)} ${hx2.toFixed(2)},${hy2.toFixed(2)}`}
        fill={color}
      />
    </g>
  )
}

// ── GearShape helper ──────────────────────────────────────────────────────────
function GearShape({ g, bodyFill = FILL, strokeColor = STROKE }: {
  g: GearDef; bodyFill?: string; strokeColor?: string
}) {
  return (
    <g>
      {/* teeth */}
      <path d={gearPath(g)} fill={bodyFill} stroke={strokeColor} strokeWidth={SW} strokeLinejoin="round" />
      {/* inner body disc */}
      <circle cx={g.cx} cy={g.cy} r={g.innerR * 0.92}
        fill={bodyFill} stroke={strokeColor} strokeWidth={SW * 0.75} />
      {/* decorative ring */}
      <circle cx={g.cx} cy={g.cy} r={g.innerR * 0.60}
        fill="none" stroke={strokeColor} strokeWidth={SW * 0.65} />
      {/* centre hole */}
      <circle cx={g.cx} cy={g.cy} r={g.holeR}
        fill={HOLE} stroke={strokeColor} strokeWidth={SW * 0.65} />
    </g>
  )
}

// ── aria ──────────────────────────────────────────────────────────────────────
const ARIA_EN =
  'Six meshed gears labelled A through F arranged in a horizontal chain. ' +
  'Gear A is the largest on the left. Gears are meshed sequentially: A–B–C–D–E–F.'
const ARIA_ID =
  'Enam roda gigi berlabel A hingga F tersusun dalam rantai horizontal. ' +
  'Roda Gigi A adalah yang terbesar di sebelah kiri. Roda gigi saling bersentuhan: A–B–C–D–E–F.'

// ── default export ────────────────────────────────────────────────────────────
export default function GearTrainSASMO20G4Q2Illustration({
  lang = 'id',
}: {
  lang?: string
} = {}) {
  const aria = lang === 'id' ? ARIA_ID : ARIA_EN

  return (
    <div
      className="my-4 flex justify-center overflow-x-auto"
      role="img"
      aria-label={aria}
    >
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width={Math.min(640, VW * 2.2)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {GEARS.map((g) => (
          <g key={g.id}>
            <GearShape g={g} />
            {/* label above each gear */}
            <text
              x={g.cx}
              y={g.cy - g.outerR - 5}
              textAnchor="middle"
              fontSize={11}
              fontWeight={700}
              fill={STROKE}
              className="font-display"
            >
              {g.id}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
