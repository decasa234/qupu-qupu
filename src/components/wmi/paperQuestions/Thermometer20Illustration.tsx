// Thermometer-reading figure for WMI-20F1A-Q7.
//
// Recovered from db/seed/wmi/figures/2020-final-g1-a-q7.jpg: a vertical
// thermometer with a 0..100 scale labeled every 10 (small halfway ticks
// between), teal liquid filled to exactly halfway between 40 and 50, and a
// "°F" label at the bottom. Answer B = 45 °F.

export const TEMP_ANSWER = 45

const VIEW_W = 240
const VIEW_H = 404

// Tube geometry
const TUBE_X = 90
const TUBE_W = 28
const TUBE_TOP = 30
const TUBE_BOTTOM = 340
const BULB_CX = TUBE_X + TUBE_W / 2 // 104
const BULB_CY = 358
const BULB_R = 26

// Scale: temp t (°F) -> y. 0 at y=324, each degree 2.6px, so 100 at y=64.
const Y0 = 324
const PER_DEG = 2.6
export function tempToY(t: number): number {
  return Y0 - t * PER_DEG
}

const TEAL = '#5EEAD4'
const TEAL_DARK = '#14B8A6'
const DARK = '#1F2937'
const BLUE = '#2f6df0'
const RED = '#EF4444'
const GREEN = '#10B981'

export type ThermometerHighlight = 'none' | 'scale' | 'between' | 'half' | 'answer'

export interface ThermometerDiagramProps {
  /** Which part of the reading process to emphasise. */
  highlight?: ThermometerHighlight
}

export function ThermometerDiagram({ highlight = 'none' }: ThermometerDiagramProps) {
  const liquidY = tempToY(TEMP_ANSWER) // 207
  const showArrow = highlight === 'between' || highlight === 'half' || highlight === 'answer'
  const arrowColor = highlight === 'answer' ? GREEN : RED

  const majors: number[] = []
  for (let t = 0; t <= 100; t += 10) majors.push(t)
  const minors: number[] = []
  for (let t = 5; t < 100; t += 10) minors.push(t)

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 250, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* tube */}
      <rect
        x={TUBE_X}
        y={TUBE_TOP}
        width={TUBE_W}
        height={TUBE_BOTTOM - TUBE_TOP}
        rx={TUBE_W / 2}
        fill="#FFFFFF"
        stroke={DARK}
        strokeWidth={3}
      />
      {/* bulb */}
      <circle cx={BULB_CX} cy={BULB_CY} r={BULB_R} fill={TEAL} stroke={DARK} strokeWidth={3} />
      {/* liquid column (drawn after the bulb so the joint is seamless) */}
      <rect x={TUBE_X + 2} y={liquidY} width={TUBE_W - 4} height={BULB_CY - liquidY} fill={TEAL} />
      {/* liquid top edge */}
      <line x1={TUBE_X + 2} y1={liquidY} x2={TUBE_X + TUBE_W - 2} y2={liquidY} stroke={TEAL_DARK} strokeWidth={2.5} />

      {/* major ticks (every 10) + labels on the right */}
      {majors.map((t) => {
        const y = tempToY(t)
        const hot = highlight === 'between' && (t === 40 || t === 50)
        return (
          <g key={`M${t}`}>
            <line
              x1={TUBE_X + 2}
              y1={y}
              x2={TUBE_X + 20}
              y2={y}
              stroke={hot ? RED : DARK}
              strokeWidth={hot ? 3.5 : 2}
            />
            <text
              x={TUBE_X + TUBE_W + 10}
              y={y}
              dominantBaseline="central"
              fontSize={16}
              fontWeight={highlight === 'scale' || hot ? 900 : 600}
              fill={hot ? RED : highlight === 'scale' ? BLUE : DARK}
            >
              {t}
            </text>
          </g>
        )
      })}

      {/* minor halfway ticks (5, 15, ... 95) */}
      {minors.map((t) => {
        const y = tempToY(t)
        const hot = (highlight === 'half' || highlight === 'answer') && t === TEMP_ANSWER
        return (
          <line
            key={`m${t}`}
            x1={TUBE_X + 2}
            y1={y}
            x2={hot ? TUBE_X + TUBE_W - 2 : TUBE_X + 11}
            y2={y}
            stroke={hot ? arrowColor : DARK}
            strokeWidth={hot ? 3.5 : 1.5}
          />
        )
      })}

      {/* pointer arrow at the liquid top */}
      {showArrow && (
        <g>
          <line x1={44} y1={liquidY} x2={72} y2={liquidY} stroke={arrowColor} strokeWidth={3.5} strokeLinecap="round" />
          <polygon points={`${84},${liquidY} ${72},${liquidY - 6.5} ${72},${liquidY + 6.5}`} fill={arrowColor} />
        </g>
      )}

      {/* answer badge */}
      {highlight === 'answer' && (
        <text x={58} y={liquidY - 18} textAnchor="middle" fontSize={20} fontWeight={900} fill={GREEN}>
          {`${TEMP_ANSWER} °F`}
        </text>
      )}

      {/* unit label, bottom right of the bulb */}
      <text x={TUBE_X + TUBE_W + 10} y={BULB_CY + 22} fontSize={17} fontWeight={700} fill={DARK}>
        °F
      </text>
    </svg>
  )
}

export default function Thermometer20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A vertical thermometer with a scale from 0 to 100 marked every 10 degrees Fahrenheit. The teal liquid stops exactly halfway between 40 and 50."
    >
      <ThermometerDiagram />
    </div>
  )
}
