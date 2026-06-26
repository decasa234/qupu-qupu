// IsoscelesAltitudeOSN25NFQ3Illustration — OSN-25-SD-NAS-FINAL-Q3
//
// "Segitiga sama kaki ACB: AC = BC = 10 cm, AB = 12 cm.
//  D pada BC sehingga AD tegak lurus BC. Hitung luas △ABD."
//  Jawaban: 864/25 cm²
//
// Figure: C at top, A bottom-left, B bottom-right.
// D on BC at t=18/25 from B (BD=36/5, verified by t·BC=7.2<10 ✓).
// Coordinate derivation (scale 20 px/cm, origin padded):
//   A=(40,200), B=(280,200), C=(160,40) → AB=240px, height=160px ✓
//   t_D = 18/25  →  D ≈ (193.6, 84.8)
//   e1 = D→B unit = (0.6,  0.8)  (along BC toward B)
//   e2 = D→A unit = (-0.8, 0.6)  (along DA toward A)
//   Right-angle box size SQ=10: P1=(199.6,92.8) P2=(191.6,98.8) P3=(185.6,90.8)
//
// Pure SVG — no hooks, no framer-motion — SSR-safe.
// Co-exports IsoscelesAltitudeOSN25NFQ3Figure (used by explainer).

type Pt = [number, number]

export const VA: Pt = [40, 200]
export const VB: Pt = [280, 200]
export const VC: Pt = [160, 40]
// t = 18/25 from B toward C (AD ⊥ BC)
export const VD: Pt = [
  VB[0] + (18 / 25) * (VC[0] - VB[0]),
  VB[1] + (18 / 25) * (VC[1] - VB[1]),
]

// Unit vectors at D for right-angle box
const E1: Pt = [0.6, 0.8]   // D → B (along BC)
const E2: Pt = [-0.8, 0.6]  // D → A
const SQ = 10
const RA_P1: Pt = [VD[0] + SQ * E1[0], VD[1] + SQ * E1[1]] // (199.6, 92.8)
const RA_P2: Pt = [RA_P1[0] + SQ * E2[0], RA_P1[1] + SQ * E2[1]] // (191.6, 98.8)
const RA_P3: Pt = [VD[0] + SQ * E2[0], VD[1] + SQ * E2[1]] // (185.6, 90.8)

// Foot of height from C to AB (H, midpoint of AB since isosceles)
const VH: Pt = [VC[0], VA[1]] // (160, 200)

const INK    = '#1F2937'
const BLUE   = '#30598A'
const ORANGE = '#f0853a'

export type AltitudeHighlight = 'altitude' | 'height-c' | 'area-whole' | 'sub-tri' | null

export interface IsoscelesAltitudeFigureProps {
  highlight?: AltitudeHighlight
  showAnswer?: boolean
}

export function IsoscelesAltitudeOSN25NFQ3Figure({
  highlight = null,
  showAnswer = false,
}: IsoscelesAltitudeFigureProps = {}) {
  const isAlt   = highlight === 'altitude'
  const isSub   = highlight === 'sub-tri'
  const isWhole = highlight === 'area-whole'
  const isH     = highlight === 'height-c'

  const altStroke = isAlt ? ORANGE : BLUE
  const altWidth  = isAlt ? 2.6 : 1.8

  const shadeSub   = isSub || showAnswer
  const subFill    = showAnswer ? '#D1FAE5' : '#FED7AA'

  // Tick midpoints on equal sides
  const acMid: Pt = [(VA[0] + VC[0]) / 2, (VA[1] + VC[1]) / 2] // (100, 120)
  const bcMid: Pt = [(VB[0] + VC[0]) / 2, (VB[1] + VC[1]) / 2] // (220, 120)

  const poly = (pts: Pt[]) => pts.map(([x, y]) => `${x},${y}`).join(' ')
  const pts  = (pts: Pt[]) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

  return (
    <svg viewBox="0 0 320 230" width={300} aria-hidden="true">
      {/* Shade whole triangle (area-whole beat) */}
      {isWhole && (
        <polygon points={poly([VA, VB, VC])} fill="#93C5FD" fillOpacity={0.35} />
      )}
      {/* Shade sub-triangle ABD */}
      {shadeSub && (
        <polygon points={poly([VA, VB, VD])} fill={subFill} fillOpacity={0.55} />
      )}

      {/* Main triangle ACB */}
      <polygon
        points={poly([VA, VB, VC])}
        fill="none"
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Altitude line A→D */}
      <line
        x1={VA[0]} y1={VA[1]} x2={VD[0]} y2={VD[1]}
        stroke={altStroke} strokeWidth={altWidth} strokeLinecap="round"
      />

      {/* Right-angle box at D */}
      <polyline
        points={pts([RA_P3, RA_P2, RA_P1])}
        fill="none"
        stroke={altStroke}
        strokeWidth={1.5}
      />

      {/* Dashed height C→H (height-c beat only) */}
      {isH && (
        <>
          <line
            x1={VC[0]} y1={VC[1]} x2={VH[0]} y2={VH[1]}
            stroke={ORANGE} strokeWidth={2} strokeDasharray="5,4" strokeLinecap="round"
          />
          {/* Right-angle box at H: goes right (+x) and up (-y from H) */}
          <path
            d={`M ${VH[0]},${VH[1]} l 0,-6 l 6,0`}
            fill="none"
            stroke={ORANGE}
            strokeWidth={1.5}
          />
          <text
            x={VH[0] - 8} y={(VC[1] + VH[1]) / 2 + 4}
            fontSize={12} fontWeight={700}
            fill={ORANGE} textAnchor="end"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            h=8
          </text>
        </>
      )}

      {/* Equal-side tick marks */}
      {/* AC tick */}
      <line
        x1={acMid[0] - 4 * 0.8} y1={acMid[1] - 4 * 0.6}
        x2={acMid[0] + 4 * 0.8} y2={acMid[1] + 4 * 0.6}
        stroke={BLUE} strokeWidth={2}
      />
      {/* BC tick */}
      <line
        x1={bcMid[0] - 4 * 0.8} y1={bcMid[1] + 4 * 0.6}
        x2={bcMid[0] + 4 * 0.8} y2={bcMid[1] - 4 * 0.6}
        stroke={BLUE} strokeWidth={2}
      />

      {/* Vertex labels */}
      <text x={VA[0] - 16} y={VA[1] + 6}
        fontSize={16} fontWeight={700}
        fontFamily="ui-sans-serif, system-ui, sans-serif" fill={INK}>A</text>
      <text x={VB[0] + 6} y={VB[1] + 6}
        fontSize={16} fontWeight={700}
        fontFamily="ui-sans-serif, system-ui, sans-serif" fill={INK}>B</text>
      <text x={VC[0] - 7} y={VC[1] - 10}
        fontSize={16} fontWeight={700}
        fontFamily="ui-sans-serif, system-ui, sans-serif" fill={INK}>C</text>
      <text x={VD[0] + 8} y={VD[1] - 8}
        fontSize={14} fontWeight={700}
        fontFamily="ui-sans-serif, system-ui, sans-serif" fill={altStroke}>D</text>

      {/* Dimension labels */}
      <text x={78} y={123}
        fontSize={13} fontWeight={600} textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif" fill={BLUE}>10</text>
      <text x={244} y={123}
        fontSize={13} fontWeight={600} textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif" fill={BLUE}>10</text>
      <text x={160} y={220}
        fontSize={13} fontWeight={600} textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif" fill={BLUE}>12</text>

      {/* Answer label inside △ABD */}
      {showAnswer && (
        <text
          x={(VA[0] + VB[0] + VD[0]) / 3}
          y={(VA[1] + VB[1] + VD[1]) / 3}
          fontSize={12} fontWeight={800}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fill="#065F46" textAnchor="middle" dominantBaseline="central"
        >
          864/25 cm²
        </text>
      )}
    </svg>
  )
}

const ARIA =
  'Segitiga sama kaki ACB: AC = BC = 10 cm, AB = 12 cm. C di atas, A di bawah kiri, B di bawah kanan. ' +
  'D terletak pada BC dengan tanda siku-siku: AD tegak lurus BC.'

export default function IsoscelesAltitudeOSN25NFQ3Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <IsoscelesAltitudeOSN25NFQ3Figure />
    </div>
  )
}
