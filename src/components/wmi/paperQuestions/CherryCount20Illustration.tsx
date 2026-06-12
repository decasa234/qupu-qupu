// Cherry-counting picture for WMI-20F1A-Q10.
//
// Recovered from "wmiPastPaper/2020 WMI Final G01 Paper A/images/
// af451696cdc2808a66b592965747fee9492f7d566e1b4614654383d4e540bdd6.jpg":
// two rows of cherry bunches —
//   top row:    2, 3, 2, 3 cherries
//   bottom row: 3, 2, 2, 2 cherries
// Total = 10 + 9 = 19 (answer B).
export const TOP_BUNCHES = [2, 3, 2, 3]
export const BOTTOM_BUNCHES = [3, 2, 2, 2]
export const TOP_TOTAL = TOP_BUNCHES.reduce((a, b) => a + b, 0) // 10
export const BOTTOM_TOTAL = BOTTOM_BUNCHES.reduce((a, b) => a + b, 0) // 9
export const TOTAL_CHERRIES = TOP_TOTAL + BOTTOM_TOTAL // 19

const CHERRY = '#F43F5E'
const LEAF = '#65A30D'
const STEM = '#1F2937'

const R = 11 // cherry radius

/** Cherry-centre offsets (relative to the bunch apex) for a 2- or 3-cherry bunch. */
const OFFSETS: Record<number, Array<[number, number]>> = {
  2: [
    [-15, 40],
    [15, 40],
  ],
  3: [
    [-23, 36],
    [0, 47],
    [23, 36],
  ],
}

/**
 * One cherry bunch: stems fan out from an apex at (x, y), a leaf at the apex,
 * `count` cherries below. When `counted`, a badge with the bunch count appears
 * underneath.
 */
export function CherryBunch({ x, y, count, counted = false }: { x: number; y: number; count: number; counted?: boolean }) {
  const offsets = OFFSETS[count] ?? OFFSETS[2]
  return (
    <g>
      {/* stems: curve from the apex to the top of each cherry */}
      {offsets.map(([dx, dy], i) => (
        <path
          key={`st${i}`}
          d={`M ${x} ${y} Q ${x + dx * 0.7} ${y + dy * 0.35} ${x + dx} ${y + dy - R}`}
          fill="none"
          stroke={STEM}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      ))}
      {/* leaf at the apex */}
      <ellipse cx={x + 11} cy={y - 4} rx={11} ry={5} fill={LEAF} transform={`rotate(-24 ${x + 11} ${y - 4})`} />
      {/* cherries */}
      {offsets.map(([dx, dy], i) => (
        <g key={`c${i}`}>
          <circle cx={x + dx} cy={y + dy} r={R} fill={CHERRY} />
          <path
            d={`M ${x + dx - 5} ${y + dy + 2} Q ${x + dx - 2} ${y + dy + 7} ${x + dx + 3} ${y + dy + 7}`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.7}
          />
        </g>
      ))}
      {/* per-bunch count badge */}
      {counted && (
        <g>
          <circle cx={x} cy={y + 68} r={11} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={2} />
          <text x={x} y={y + 68} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={900} fill="#92400E">
            {count}
          </text>
        </g>
      )}
    </g>
  )
}

export const CHERRY_VIEW_W = 432
export const CHERRY_VIEW_H = 232

const TOP_Y = 26
const BOTTOM_Y = 126
const FIRST_X = 52
const GAP_X = 86
const TOTAL_X = 392 // row-total badge column

export interface CherryDiagramProps {
  /** How many bunches have been counted so far (0..8, reading order: top row then bottom row). */
  countedBunches?: number
  /** Show "= 10" beside the top row. */
  showTopTotal?: boolean
  /** Show "= 9" beside the bottom row. */
  showBottomTotal?: boolean
}

export function CherryDiagram({ countedBunches = 0, showTopTotal = false, showBottomTotal = false }: CherryDiagramProps) {
  return (
    <svg
      viewBox={`0 0 ${CHERRY_VIEW_W} ${CHERRY_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 432, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {TOP_BUNCHES.map((count, i) => (
        <CherryBunch key={`t${i}`} x={FIRST_X + i * GAP_X} y={TOP_Y} count={count} counted={countedBunches > i} />
      ))}
      {BOTTOM_BUNCHES.map((count, i) => (
        <CherryBunch
          key={`b${i}`}
          x={FIRST_X + i * GAP_X}
          y={BOTTOM_Y}
          count={count}
          counted={countedBunches > TOP_BUNCHES.length + i}
        />
      ))}

      {showTopTotal && (
        <text x={TOTAL_X} y={TOP_Y + 40} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={900} fill="#2f6df0">
          {`= ${TOP_TOTAL}`}
        </text>
      )}
      {showBottomTotal && (
        <text x={TOTAL_X} y={BOTTOM_Y + 40} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={900} fill="#2f6df0">
          {`= ${BOTTOM_TOTAL}`}
        </text>
      )}
    </svg>
  )
}

export default function CherryCount20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Two rows of cherry bunches. Top row: bunches of 2, 3, 2 and 3 cherries. Bottom row: bunches of 3, 2, 2 and 2 cherries."
    >
      <CherryDiagram />
    </div>
  )
}
