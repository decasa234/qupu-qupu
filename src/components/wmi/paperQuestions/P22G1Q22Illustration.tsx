// WMI-22P1A-Q22 (2022 Semifinal Grade 1, Paper A) — the patterned ring.
//
// Recovered from db/seed/wmi/figures/2022-semifinal-g1-a-q22.jpg: a regular
// OCTAGON cut into 8 triangular wedges that meet at the centre. Some wedges are
// blue, the rest white. A red curved arrow at the lower-left sweeps CLOCKWISE,
// showing the direction in which to read the ring.
//
// Reading the wedges CLOCKWISE starting at the top wedge gives the colour cycle
//   white, blue, blue, white, blue, white, blue, white
// (4 blue, 4 white). The question asks which straight colour strip (A–D) has the
// same colour order. The strip's ends may be joined into a ring and the whole
// strip may be ROTATED, but it may NOT be flipped over — so only the strip whose
// cyclic order matches the ring read in THIS direction is correct. Answer: A.
//
// The choice strips A–D were images in the original paper (seed choices read
// "Figure A".."Figure D"); this card draws the STEM ring + arrow only and the
// explainer derives and names the correct option (A).
//
// Pure render: no Math.random / Date / window — SSR-safe & deterministic.

export const ANSWER_LETTER = 'A'

// Wedge colours, CLOCKWISE from the top wedge. true = blue, false = white.
export const RING_BLUE: boolean[] = [false, true, true, false, true, false, true, false]
export const WEDGE_COUNT = RING_BLUE.length // 8

const BLUE = '#9FD2EE' // wedge blue (matches the scan)
const WHITE = '#FFFFFF'
const STROKE = '#2B2B2B'
const RED = '#E0383B'

// ---- geometry (viewBox units) ---------------------------------------------
const CX = 150
const CY = 150
const R = 110 // octagon circumradius

export const Q22_VIEW_W = 340
export const Q22_VIEW_H = 330

/**
 * Vertex angle (degrees clockwise from straight up) for octagon corner k.
 * Corners are offset by half a step so that wedge 0 sits symmetric at the TOP.
 */
function cornerAngle(k: number): number {
  return (360 / WEDGE_COUNT) * k - 360 / WEDGE_COUNT / 2
}

function polar(angleDeg: number, len: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180
  return { x: CX + len * Math.sin(rad), y: CY - len * Math.cos(rad) }
}

/** Triangular wedge i: centre → corner i → corner i+1. */
function wedgePath(i: number): string {
  const a = polar(cornerAngle(i), R)
  const b = polar(cornerAngle(i + 1), R)
  return `M ${CX} ${CY} L ${a.x.toFixed(2)} ${a.y.toFixed(2)} L ${b.x.toFixed(2)} ${b.y.toFixed(2)} Z`
}

export interface PatternRingProps {
  /** Ring this wedge index (0..7) with an orange outline (explainer focus). */
  focusWedge?: number | null
  /** Show small clockwise reading numbers 1..8 on the wedges. */
  showOrder?: boolean
  /** Hide the clockwise reading arrow (default shows it). */
  hideArrow?: boolean
}

/**
 * Reusable primitive: the octagonal patterned ring (8 blue/white wedges) plus the
 * clockwise reading arrow. `focusWedge` rings one wedge; `showOrder` numbers the
 * wedges 1..8 in reading order. Defaults draw the plain stem figure.
 */
export function PatternRing({ focusWedge = null, showOrder = false, hideArrow = false }: PatternRingProps) {
  return (
    <svg
      viewBox={`0 0 ${Q22_VIEW_W} ${Q22_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 300, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* wedges */}
      {RING_BLUE.map((isBlue, i) => (
        <path
          key={i}
          d={wedgePath(i)}
          fill={isBlue ? BLUE : WHITE}
          stroke={focusWedge === i ? '#F59E0B' : STROKE}
          strokeWidth={focusWedge === i ? 4.5 : 2.5}
          strokeLinejoin="round"
        />
      ))}

      {/* reading-order numbers, just inside each wedge along its bisector */}
      {showOrder &&
        RING_BLUE.map((_, i) => {
          const mid = (cornerAngle(i) + cornerAngle(i + 1)) / 2
          const p = polar(mid, R * 0.66)
          return (
            <text
              key={`o${i}`}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={15}
              fontWeight={900}
              fill="#B45309"
            >
              {i + 1}
            </text>
          )
        })}

      {/* clockwise reading arrow, lower-left */}
      {!hideArrow && (
        <g>
          <path
            d={`M 44 168 A 96 96 0 0 0 118 ${CY + R + 8}`}
            fill="none"
            stroke={RED}
            strokeWidth={5}
            strokeLinecap="round"
          />
          <polygon points={`118,${CY + R + 8} 104,${CY + R - 2} 122,${CY + R - 6}`} fill={RED} />
        </g>
      )}
    </svg>
  )
}

export default function P22G1Q22Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A ring shaped like an octagon, split into eight triangular wedges that are coloured blue or white. A red curved arrow at the lower left shows the clockwise direction to read the pattern. Which colour strip below matches the ring?"
    >
      <PatternRing />
    </div>
  )
}
