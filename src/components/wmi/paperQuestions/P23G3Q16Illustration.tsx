// Tulip leaf-pair figure for WMI-23P3A-Q16.
//
// Recovered from db/seed/wmi/figures/2023-semifinal-g3-a-q16.jpg:
// a red tulip on a green stem with four pairs of leaves. Each left+right leaf
// pair sums to the flower's number, 3800.
//   row 1:  A      | 183
//   row 2:  1268   | B
//   row 3:  2066   | 1734
//   row 4:  289×7  | C
// Solve: A = 3800 − 183 = 3617; B = 3800 − 1268 = 2532;
//        289×7 = 2023, so C = 3800 − 2023 = 1777.
//        A + B + C = 3617 + 2532 + 1777 = 7926  (answer D)
export const FLOWER = 3800
export const PAIRS: Array<{ left: string; right: string }> = [
  { left: 'A', right: '183' },
  { left: '1268', right: 'B' },
  { left: '2066', right: '1734' },
  { left: '289×7', right: 'C' },
]
export const A_VAL = FLOWER - 183 // 3617
export const B_VAL = FLOWER - 1268 // 2532
export const C_LEAF = 289 * 7 // 2023
export const C_VAL = FLOWER - C_LEAF // 1777
export const ABC_SUM = A_VAL + B_VAL + C_VAL // 7926

const PETAL = '#C8473B'
const PETAL_DK = '#A8392F'
const LEAF = '#3F9B4A'
const LEAF_DK = '#2F7A38'
const STEM = '#2F7A38'
const TEXT = '#FFFFFF'

export const Q16_VIEW_W = 320
export const Q16_VIEW_H = 430

// Stem geometry.
const CX = 160
const STEM_TOP = 96
const STEM_BOT = 410

// Leaf row y-positions.
const ROW_Y = [150, 210, 270, 330]
const LEAF_DX = 78 // horizontal reach of each leaf tip from the stem

/** A single ellipse leaf with a centred label, attached to the stem. */
function Leaf({
  y,
  side,
  label,
  highlight = false,
  solved = false,
}: {
  y: number
  side: 'L' | 'R'
  label: string
  highlight?: boolean
  solved?: boolean
}) {
  const dir = side === 'L' ? -1 : 1
  const midX = CX + dir * (LEAF_DX / 2)
  // ellipse centred between stem and tip, tilted up-and-out
  const rot = side === 'L' ? -28 : 28
  const fill = highlight ? '#F4C542' : LEAF
  const stroke = highlight ? '#B7860B' : LEAF_DK
  const txtFill = highlight ? '#5C3D00' : TEXT
  return (
    <g>
      {/* leaf vein from stem to leaf */}
      <line x1={CX} y1={y + 6} x2={midX} y2={y - 2} stroke={STEM} strokeWidth={4} strokeLinecap="round" />
      <g transform={`rotate(${rot} ${midX} ${y - 6})`}>
        <ellipse cx={midX} cy={y - 6} rx={42} ry={20} fill={fill} stroke={stroke} strokeWidth={highlight ? 3 : 2} />
      </g>
      <text
        x={midX}
        y={y - 6}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={solved ? 16 : 18}
        fontWeight={800}
        fontStyle={/^[A-C]$/.test(label) ? 'italic' : 'normal'}
        fill={txtFill}
      >
        {label}
      </text>
    </g>
  )
}

export interface TulipDiagramProps {
  /** Override leaf labels (e.g. reveal A = 3617). Falls back to PAIRS text. */
  leftLabels?: string[]
  rightLabels?: string[]
  /** Highlight one row's pair (0..3). */
  highlightRow?: number
  /** Rows whose unknown leaf has been solved (shows its value). */
  solvedRows?: number[]
}

/** The tulip with four leaf pairs. */
export function TulipDiagram({
  leftLabels,
  rightLabels,
  highlightRow = -1,
  solvedRows = [],
}: TulipDiagramProps) {
  const lefts = leftLabels ?? PAIRS.map((p) => p.left)
  const rights = rightLabels ?? PAIRS.map((p) => p.right)

  return (
    <svg
      viewBox={`0 0 ${Q16_VIEW_W} ${Q16_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 300, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* stem */}
      <line x1={CX} y1={STEM_TOP} x2={CX} y2={STEM_BOT} stroke={STEM} strokeWidth={9} strokeLinecap="round" />

      {/* leaves (drawn before flower so the flower sits on top of the stem top) */}
      {ROW_Y.map((y, i) => (
        <g key={`row${i}`}>
          <Leaf y={y} side="L" label={lefts[i]} highlight={highlightRow === i} solved={solvedRows.includes(i)} />
          <Leaf y={y} side="R" label={rights[i]} highlight={highlightRow === i} solved={solvedRows.includes(i)} />
        </g>
      ))}

      {/* tulip flower */}
      <g>
        {/* back petals */}
        <path d={`M ${CX - 46} 86 Q ${CX - 52} 36 ${CX - 18} 30 L ${CX - 18} 92 Z`} fill={PETAL_DK} />
        <path d={`M ${CX + 46} 86 Q ${CX + 52} 36 ${CX + 18} 30 L ${CX + 18} 92 Z`} fill={PETAL_DK} />
        {/* main cup */}
        <path
          d={`M ${CX - 46} 64 Q ${CX - 50} 100 ${CX} 100 Q ${CX + 50} 100 ${CX + 46} 64 Q ${CX + 30} 92 ${CX} 88 Q ${CX - 30} 92 ${CX - 46} 64 Z`}
          fill={PETAL}
        />
        {/* front petal */}
        <path d={`M ${CX} 26 Q ${CX - 30} 40 ${CX - 28} 90 Q ${CX} 76 ${CX + 28} 90 Q ${CX + 30} 40 ${CX} 26 Z`} fill={PETAL} stroke={PETAL_DK} strokeWidth={2} />
        <text x={CX} y={68} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={900} fill={TEXT}>
          {FLOWER}
        </text>
      </g>
    </svg>
  )
}

export default function P23G3Q16Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A red tulip showing 3800, on a stem with four pairs of leaves. Left leaves: A, 1268, 2066, 289 times 7. Right leaves: 183, B, 1734, C. Each left-and-right leaf pair sums to 3800."
    >
      <TulipDiagram />
    </div>
  )
}
