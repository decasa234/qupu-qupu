// Number-pyramid figure for WMI-24P1A-Q19 (2024 Grade 1 Semifinal, Paper A).
//
// Recovered from db/seed/wmi/figures/2024-semifinal-g1-a-q19.jpg: a tiny
// 2-row "addition pyramid". The TOP row shows two numbers, 15 and 12; each is
// the sum of the two squares directly below it. The BOTTOM row is three EMPTY
// squares (left, middle, right) joined to the tops by slanted lines:
//
//        15        12
//       /  \      /  \
//   [   ] [   ] [   ]        (left)(middle)(right)
//          ^shared^
//
// So:  left + middle = 15   and   middle + right = 12.
//
// Each bottom square holds a different 1-digit number. The largest valid 3-digit
// number read left→right is 875 (left=8, middle=7, right=5); its units digit is
// 5  → answer B.  (Setting left=9 forces middle=6 then right=6, a repeat — the
// trap.)
//
// The static figure draws ONLY the problem: the two top sums and three blank
// bottom squares. It never fills the squares or reveals the answer — that is the
// explainer's job (via the `values` / `connectors` props).
//
// Pure render — no window/document/Math.random/Date. SSR-safe & deterministic.

export const TOP_LEFT_SUM = 15 // left + middle
export const TOP_RIGHT_SUM = 12 // middle + right

/** The verified largest-valid bottom row, left→right. */
export const BOTTOM_SOLUTION: [number, number, number] = [8, 7, 5]
export const LARGEST_NUMBER = 875
export const UNITS_DIGIT = 5 // answer B

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export const PYR_VIEW_W = 360
export const PYR_VIEW_H = 226

const BOX = 64 // bottom square side
const BOX_GAP = 14 // gap between bottom squares
const BOTTOM_Y = 150 // top edge of the bottom squares
const TOP_Y = 30 // baseline-ish y for the two top sums

// Bottom-square left edges, centred in the viewBox.
const ROW_W = 3 * BOX + 2 * BOX_GAP
const FIRST_X = (PYR_VIEW_W - ROW_W) / 2
const BX = [0, 1, 2].map((i) => FIRST_X + i * (BOX + BOX_GAP))
const BCX = BX.map((x) => x + BOX / 2) // bottom-square centres

// The two top sums sit above the shared seams: the left sum (15) over the gap
// between squares 0 & 1, the right sum (12) over the gap between squares 1 & 2.
const TOP_CX = [(BCX[0] + BCX[1]) / 2, (BCX[1] + BCX[2]) / 2]

const INK = '#1F2937'
const BOX_STROKE = '#64748B'
const BOX_FILL = '#F8FAFC'
const LINE = '#64748B'
const ACTIVE_FILL = '#D1FAE5'
const ACTIVE_STROKE = '#10B981'
const ANSWER_INK = '#047857'

export interface PyramidQ19Props {
  /**
   * Optional bottom-square values, left→middle→right. `null` (or a missing
   * entry) leaves that square blank. The static problem passes nothing.
   */
  values?: Array<number | null>
  /** Bottom-square indices (0,1,2) to tint green (cells under discussion). */
  activeBoxes?: number[]
  /** Top-sum indices (0 = 15, 1 = 12) to tint green. */
  activeSums?: number[]
  /** Show the final "= 875" number strip beneath the row. */
  showNumber?: boolean
}

/** Reusable primitive: the addition-pyramid. Shared with the explainer. */
export function PyramidQ19({
  values = [],
  activeBoxes = [],
  activeSums = [],
  showNumber = false,
}: PyramidQ19Props) {
  const activeB = new Set(activeBoxes)
  const activeS = new Set(activeSums)

  // Slanted connectors: each top sum links to the two squares below it.
  // sum 0 (15) → squares 0 & 1 ; sum 1 (12) → squares 1 & 2.
  const connectors: Array<{ sx: number; sumIdx: number; boxIdx: number }> = [
    { sx: TOP_CX[0], sumIdx: 0, boxIdx: 0 },
    { sx: TOP_CX[0], sumIdx: 0, boxIdx: 1 },
    { sx: TOP_CX[1], sumIdx: 1, boxIdx: 1 },
    { sx: TOP_CX[1], sumIdx: 1, boxIdx: 2 },
  ]

  return (
    <svg
      viewBox={`0 0 ${PYR_VIEW_W} ${PYR_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* slanted connector lines (drawn first, behind the boxes) */}
      {connectors.map((c, i) => (
        <line
          key={`ln${i}`}
          x1={c.sx}
          y1={TOP_Y + 12}
          x2={BCX[c.boxIdx]}
          y2={BOTTOM_Y - 4}
          stroke={LINE}
          strokeWidth={2.4}
          strokeLinecap="round"
        />
      ))}

      {/* top sums (15 and 12) */}
      {[TOP_LEFT_SUM, TOP_RIGHT_SUM].map((sum, i) => (
        <text
          key={`sum${i}`}
          x={TOP_CX[i]}
          y={TOP_Y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={30}
          fontWeight={900}
          fill={activeS.has(i) ? ANSWER_INK : INK}
        >
          {sum}
        </text>
      ))}

      {/* three bottom squares */}
      {[0, 1, 2].map((i) => {
        const v = values[i]
        const isActive = activeB.has(i)
        return (
          <g key={`box${i}`}>
            <rect
              x={BX[i]}
              y={BOTTOM_Y}
              width={BOX}
              height={BOX}
              rx={8}
              fill={isActive ? ACTIVE_FILL : BOX_FILL}
              stroke={isActive ? ACTIVE_STROKE : BOX_STROKE}
              strokeWidth={isActive ? 3 : 2.4}
            />
            {v != null && (
              <text
                x={BCX[i]}
                y={BOTTOM_Y + BOX / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={30}
                fontWeight={900}
                fill={ANSWER_INK}
              >
                {v}
              </text>
            )}
          </g>
        )
      })}

      {/* optional "= 875" number strip */}
      {showNumber && (
        <text
          x={PYR_VIEW_W / 2}
          y={BOTTOM_Y + BOX + 24}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={20}
          fontWeight={900}
          fill={ANSWER_INK}
        >
          {`${BOTTOM_SOLUTION.join('')} → satuan ${UNITS_DIGIT}`}
        </text>
      )}
    </svg>
  )
}

export default function P24G1Q19Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A small addition pyramid. The top row shows 15 and 12, each the sum of the two squares below it. The bottom row is three empty squares: left, middle, right, where left plus middle is 15 and middle plus right is 12."
    >
      <PyramidQ19 />
    </div>
  )
}
