// In-card SVG illustration for WMI-25P2A-Q17 (2025 Grade-2 Semifinal).
//
// Problem: a round fish tank is split by boards into 7 wedge-shaped areas around a
// central hub.  Each area holds ONE kind of fish; neighbouring areas hold DIFFERENT
// kinds; the number in each area is how many fish live there.  Three kinds of fish
// share 12 fish in all.  Find the largest possible difference between the totals of
// two kinds.
//
// Reconstructed from db/seed/wmi/figures/2025-semifinal-g2-a-q17.jpg:
//   a circle rim, a hub at the centre, seven grey "board" spokes, and inside the
//   wedges the printed counts (clockwise from top): 2, 3, 1, 1, 3, 1, 1  (sum 12),
//   with little fish glyphs decorating three of the wedges.
//
// The figure shows the SETUP only.  It does NOT colour the wedges by kind and it
// does NOT reveal the grouping that maximises the gap — that is the explainer's job.
//
// Pure render: no Math.random, no Date, no window/document at module load. SSR-safe.

const RIM = '#1F2937' // tank outline
const WATER = '#D6EAF7' // pale blue water
const BOARD = '#9CA3AF' // grey dividing board
const HUB = '#FFFFFF'
const NUM = '#1F2937' // printed count colour

// Seven wedge counts, clockwise starting from the top wedge.  Sum = 12.
// Order chosen to match the scan AND so the best legal kind-grouping gives a gap of
// exactly 6 (verified by backtracking over all proper 3-colourings of the 7-cycle).
export const TANK_COUNTS = [2, 3, 1, 1, 3, 1, 1] as const
export const TANK_TOTAL = TANK_COUNTS.reduce((a, b) => a + b, 0) // 12
export const TANK_KINDS = 3

// A few wedges carry a fish glyph in the scan; index → emoji (single codepoint).
const FISH_AT: Record<number, string> = {
  0: '\u{1F420}', // tropical fish, top wedge
  4: '\u{1F41F}', // fish, lower-left wedge
  6: '\u{1F421}', // blowfish, lower-right wedge
}

export const TANK_VIEW = 320
const CX = TANK_VIEW / 2
const CY = TANK_VIEW / 2
const R = 132 // rim radius
const HUB_R = 9
const N = 7

// Angle (degrees, SVG: 0 = +x/right, clockwise positive because +y is down) of the
// i-th board spoke.  Spoke 0 points straight up; the wedges sit BETWEEN spokes.
function spokeAngle(i: number): number {
  // -90 puts spoke 0 at the top; advance clockwise.
  return -90 + (i * 360) / N
}

function pointOnRim(angleDeg: number, radius: number): [number, number] {
  const a = (angleDeg * Math.PI) / 180
  return [CX + radius * Math.cos(a), CY + radius * Math.sin(a)]
}

// Centre angle of wedge i (between spoke i and spoke i+1).
function wedgeAngle(i: number): number {
  return spokeAngle(i) + 360 / N / 2
}

/**
 * The round tank with its 7 boards and printed counts.  `highlight` optionally
 * tints each wedge by kind (0/1/2) — used ONLY by the explainer; the static
 * problem figure leaves it undefined so every wedge stays plain water.
 */
export function FishTankWheel({
  highlight,
  dimUngrouped = false,
}: {
  /** Per-wedge kind index (0,1,2) or null; tints the wedge when present. */
  highlight?: Array<number | null>
  /** When true, wedges without a kind are drawn paler (focus effect). */
  dimUngrouped?: boolean
}) {
  const KIND_FILL = ['#FDE2C7', '#CDEBD3', '#D9D2F0'] // soft, distinct, non-answer-y
  return (
    <svg
      viewBox={`0 0 ${TANK_VIEW} ${TANK_VIEW}`}
      width="100%"
      style={{ maxWidth: 340, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* water disc */}
      <circle cx={CX} cy={CY} r={R} fill={WATER} stroke={RIM} strokeWidth={4} />

      {/* optional per-wedge kind tint (explainer only) */}
      {highlight &&
        TANK_COUNTS.map((_, i) => {
          const k = highlight[i]
          const a0 = spokeAngle(i)
          const a1 = spokeAngle(i + 1)
          const [x0, y0] = pointOnRim(a0, R)
          const [x1, y1] = pointOnRim(a1, R)
          const fill = k == null ? (dimUngrouped ? '#EAF3FB' : WATER) : KIND_FILL[k]
          return (
            <path
              key={`w${i}`}
              d={`M ${CX} ${CY} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${R} ${R} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`}
              fill={fill}
              opacity={k == null ? 1 : 0.95}
            />
          )
        })}

      {/* rim drawn again on top so tints never spill over the outline */}
      <circle cx={CX} cy={CY} r={R} fill="none" stroke={RIM} strokeWidth={4} />

      {/* seven boards (spokes) from hub to rim */}
      {Array.from({ length: N }, (_, i) => {
        const [x, y] = pointOnRim(spokeAngle(i), R)
        return (
          <line
            key={`s${i}`}
            x1={CX}
            y1={CY}
            x2={x.toFixed(2)}
            y2={y.toFixed(2)}
            stroke={BOARD}
            strokeWidth={6}
            strokeLinecap="round"
          />
        )
      })}

      {/* central hub */}
      <circle cx={CX} cy={CY} r={HUB_R} fill={HUB} stroke={RIM} strokeWidth={3} />

      {/* printed counts + fish glyphs inside each wedge */}
      {TANK_COUNTS.map((count, i) => {
        const a = wedgeAngle(i)
        const [nx, ny] = pointOnRim(a, R * 0.66)
        const [fx, fy] = pointOnRim(a, R * 0.42)
        const fish = FISH_AT[i]
        return (
          <g key={`c${i}`}>
            <text
              x={nx.toFixed(2)}
              y={ny.toFixed(2)}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={26}
              fontWeight={900}
              fill={NUM}
            >
              {count}
            </text>
            {fish && (
              <text
                x={fx.toFixed(2)}
                y={fy.toFixed(2)}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={22}
              >
                {fish}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function P25G2Q17Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Akuarium bulat dibagi oleh tujuh sekat menjadi tujuh wilayah. Angka tiap wilayah, searah jarum jam dari atas: 2, 3, 1, 1, 3, 1, 1. Total 12 ikan dari tiga jenis; wilayah bersebelahan berbeda jenis."
    >
      <FishTankWheel />
    </div>
  )
}
