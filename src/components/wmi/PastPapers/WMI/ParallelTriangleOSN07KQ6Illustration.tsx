// ParallelTriangleOSN07KQ6Illustration — OSN-07-SD-KAB-Q6
//
// "Triangle BEF is equilateral. AB ∥ DC. Find ∠DCE + ∠DAF."  Answer: 150°
//
// Figure: two parallel horizontal lines (top = DC, bottom = AB).
// DA is a vertical segment on the left (right angles at D and A).
// Equilateral triangle BEF: B and F on the bottom line, E is the apex.
// Line CE connects C (on the top line) to E (apex of triangle).
// C is collinear with E and B — so CE is the extension of EB beyond E.
// ∠DAF = 90° (right angle at A).
// ∠DCE = 60° (angle that line CE makes with DC, on the lower interior side).
// Sum = 150°.
//
// Coordinate system (SVG: y increases downward):
//   Top line y = 60, Bottom line y = 230
//   D = (40, 60)   A = (40, 230)
//   B = (390, 230) F = (250, 230)  [BF = 140]
//   E = (320, 230 − 70√3) ≈ (320, 109)  [equilateral apex]
//   C = intersection of line EB extended upward with y = 60
//
// Pure SVG — no hooks, no framer-motion — SSR-safe.
// Co-exports ParallelTriangleOSN07KQ6Figure for the explainer.

type Pt = [number, number]

// ── Key points ────────────────────────────────────────────────────────────────

const TOP_Y  = 60
const BOT_Y  = 230
const LEFT_X = 40

export const PD: Pt = [LEFT_X, TOP_Y]        // D  (top-left right-angle)
export const PA: Pt = [LEFT_X, BOT_Y]        // A  (bottom-left right-angle)
export const PB: Pt = [390, BOT_Y]           // B  (bottom-right)
export const PF: Pt = [250, BOT_Y]           // F  (bottom, base of equilateral triangle)

// Equilateral triangle BEF — E is the apex above BF midpoint
const BF_LEN = PB[0] - PF[0]                 // 140
const TRI_H  = (BF_LEN * Math.sqrt(3)) / 2   // 70√3 ≈ 121.24
export const PE: Pt = [(PF[0] + PB[0]) / 2, BOT_Y - TRI_H]  // ≈ (320, 108.76)

// C = intersection of line through E and B, extended upward to TOP_Y
// Direction from B to E: (PE[0]-PB[0], PE[1]-PB[1]) = (-70, -121.24)
// Parametric from B: P = B + t*(E-B)
// TOP_Y = BOT_Y + t*(PE[1]-BOT_Y)  → t = (TOP_Y - BOT_Y) / (PE[1] - BOT_Y)
const tC = (TOP_Y - BOT_Y) / (PE[1] - BOT_Y)
export const PC: Pt = [PB[0] + tC * (PE[0] - PB[0]), TOP_Y]  // ≈ (313.6, 60)

// ── Helpers ───────────────────────────────────────────────────────────────────

function deg2rad(d: number) { return d * Math.PI / 180 }

/** Arc path from angle a0→a1 (degrees, SVG-frame) around vertex at radius r. */
function arcPath(vertex: Pt, fromDeg: number, toDeg: number, r: number, largeArc = 0): string {
  const a0 = deg2rad(fromDeg)
  const a1 = deg2rad(toDeg)
  const x0 = vertex[0] + r * Math.cos(a0)
  const y0 = vertex[1] + r * Math.sin(a0)
  const x1 = vertex[0] + r * Math.cos(a1)
  const y1 = vertex[1] + r * Math.sin(a1)
  const sweep = toDeg > fromDeg ? 1 : 0
  return `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${largeArc} ${sweep} ${x1.toFixed(1)} ${y1.toFixed(1)}`
}

/** Angle (SVG-frame, degrees) of direction from vertex toward target. */
function angleTo(vertex: Pt, target: Pt): number {
  return Math.atan2(target[1] - vertex[1], target[0] - vertex[0]) * 180 / Math.PI
}

/** Point at `dist` from vertex along the bisector of two directions. */
function bisector(vertex: Pt, p1: Pt, p2: Pt, dist: number): Pt {
  const a1 = angleTo(vertex, p1) * Math.PI / 180
  const a2 = angleTo(vertex, p2) * Math.PI / 180
  let da = a2 - a1
  while (da < -Math.PI) da += 2 * Math.PI
  while (da > Math.PI) da -= 2 * Math.PI
  const mid = a1 + da / 2
  return [vertex[0] + dist * Math.cos(mid), vertex[1] + dist * Math.sin(mid)]
}

// ── Colours ───────────────────────────────────────────────────────────────────

const INK     = '#1F2937'
const BLUE    = '#30598A'
const ORANGE  = '#E07020'
const GRAY    = '#6B7280'

// Right-angle square (3 lines = 2 sides + diagonal brace)
function RightAngleSquare({ at, size = 12, facing }: {
  at: Pt
  size?: number
  /** 'dr' = right-angle opens down-right (at D), 'ur' = opens up-right (at A) */
  facing: 'dr' | 'ur'
}) {
  const [cx, cy] = at
  const s = size
  // 'dr': corner at top-left, square extends right and down
  // 'ur': corner at bottom-left, square extends right and up
  const points: [Pt, Pt, Pt] = facing === 'dr'
    ? [[cx + s, cy], [cx + s, cy + s], [cx, cy + s]]
    : [[cx + s, cy], [cx + s, cy - s], [cx, cy - s]]
  const d = points.map(([x, y]) => `${x},${y}`).join(' ')
  return <polyline points={d} fill="none" stroke={INK} strokeWidth={1.4} />
}

// ── Figure primitive ──────────────────────────────────────────────────────────

export type ParallelTriangleHighlight = 'daf' | 'dce' | 'triangle' | 'all' | null

export interface ParallelTriangleFigureProps {
  highlight?: ParallelTriangleHighlight
  showAnswer?: boolean
  width?: number
}

/**
 * Core SVG figure — reused by the explainer.
 */
export function ParallelTriangleOSN07KQ6Figure({
  highlight = null,
  showAnswer = false,
  width = 340,
}: ParallelTriangleFigureProps = {}) {
  const hi = (which: ParallelTriangleHighlight) =>
    highlight === which || highlight === 'all'

  const lineCol = (which: 'triangle' | 'ce') =>
    hi(which === 'triangle' ? 'triangle' : 'dce') ? ORANGE : BLUE

  // ∠DAF arc: at A, from direction toward D (up) to direction toward F (right)
  const angToD = angleTo(PA, PD)   // ≈ -90° (up in SVG = negative)
  const angToF = angleTo(PA, PF)   // ≈ 0° (right)
  const arcDAF = arcPath(PA, angToD, angToF, 28)
  const lblDAF = bisector(PA, PD, PF, 46)

  // ∠DCE arc: at C, from direction toward D (left ≈ 180°) to direction toward E
  // The "problem angle" is the lower interior angle = from extension-DC-right to CE
  // We draw the arc between ray CD (left) and ray CE, going clockwise = interior
  const angCtoD = angleTo(PC, PD)  // ≈ 180° (left)
  const angCtoE = angleTo(PC, PE)  // downward, angle depends on coords
  const arcDCE = arcPath(PC, angCtoD, angCtoE, 28)
  const lblDCE = bisector(PC, PD, PE, 48)

  const vb = `0 0 430 280`

  return (
    <svg viewBox={vb} width={width} aria-hidden="true">
      {/* ── Parallel lines (with arrows/extensions) ── */}
      {/* Top line — extends past D on left and past C on right */}
      <line x1={10} y1={TOP_Y} x2={420} y2={TOP_Y}
        stroke={INK} strokeWidth={1.8} strokeDasharray="none" />
      {/* Bottom line — extends full width */}
      <line x1={10} y1={BOT_Y} x2={420} y2={BOT_Y}
        stroke={INK} strokeWidth={1.8} />

      {/* ── DA vertical segment ── */}
      <line x1={PA[0]} y1={PA[1]} x2={PD[0]} y2={PD[1]}
        stroke={INK} strokeWidth={2} strokeLinecap="round" />

      {/* Right-angle marks */}
      <RightAngleSquare at={PD} facing="dr" />
      <RightAngleSquare at={PA} facing="ur" />

      {/* ── Equilateral triangle BEF ── */}
      {(['BF','FE','EB'] as const).map((side) => {
        const [p1, p2] = side === 'BF' ? [PB, PF] : side === 'FE' ? [PF, PE] : [PE, PB]
        return (
          <line key={side}
            x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]}
            stroke={lineCol('triangle')}
            strokeWidth={hi('triangle') ? 2.6 : 2}
            strokeLinecap="round" />
        )
      })}

      {/* ── Line CE ── */}
      <line x1={PC[0]} y1={PC[1]} x2={PE[0]} y2={PE[1]}
        stroke={lineCol('ce')}
        strokeWidth={hi('dce') ? 2.6 : 2}
        strokeLinecap="round" />

      {/* ── Angle arcs ── */}
      {/* ∠DAF at A */}
      <path d={arcDAF} fill="none"
        stroke={hi('daf') ? ORANGE : GRAY}
        strokeWidth={hi('daf') ? 2.4 : 1.6}
        strokeLinecap="round" />
      {showAnswer || hi('daf') ? (
        <text x={lblDAF[0]} y={lblDAF[1]}
          textAnchor="middle" dominantBaseline="central"
          fontSize={12} fontWeight={700} fill={hi('daf') ? ORANGE : GRAY}
          fontFamily="ui-sans-serif, system-ui, sans-serif">
          90°
        </text>
      ) : null}

      {/* ∠DCE at C */}
      <path d={arcDCE} fill="none"
        stroke={hi('dce') ? ORANGE : GRAY}
        strokeWidth={hi('dce') ? 2.4 : 1.6}
        strokeLinecap="round" />
      {showAnswer || hi('dce') ? (
        <text x={lblDCE[0]} y={lblDCE[1]}
          textAnchor="middle" dominantBaseline="central"
          fontSize={12} fontWeight={700} fill={hi('dce') ? ORANGE : GRAY}
          fontFamily="ui-sans-serif, system-ui, sans-serif">
          60°
        </text>
      ) : null}

      {/* ── Vertex labels ── */}
      {([
        { pt: PD, label: 'D', dx: -14, dy: -4 },
        { pt: PC, label: 'C', dx:   8, dy: -4 },
        { pt: PA, label: 'A', dx: -14, dy:  4 },
        { pt: PF, label: 'F', dx:   0, dy:  16 },
        { pt: PB, label: 'B', dx:  10, dy:   4 },
        { pt: PE, label: 'E', dx:  10, dy:  -4 },
      ] as const).map(({ pt, label, dx, dy }) => (
        <text key={label}
          x={pt[0] + dx} y={pt[1] + dy}
          textAnchor="middle" dominantBaseline="central"
          fontSize={14} fontWeight={700} fill={INK}
          fontFamily="ui-sans-serif, system-ui, sans-serif">
          {label}
        </text>
      ))}
    </svg>
  )
}

// ── Default export — illustration wrapper ─────────────────────────────────────

const ARIA =
  'Dua garis horizontal sejajar: DC di atas, AB di bawah. ' +
  'DA tegak lurus di sisi kiri (sudut siku-siku di D dan A). ' +
  'Segitiga sama sisi BEF dengan B dan F di garis bawah, E puncak di tengah. ' +
  'Garis CE ditarik dari C di garis atas ke E. Cari ∠DCE + ∠DAF.'

export default function ParallelTriangleOSN07KQ6Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <ParallelTriangleOSN07KQ6Figure />
    </div>
  )
}
