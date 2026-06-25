// BlockGridHK18P3Q5Illustration.tsx
// HKIMO-18-P3H-Q5 stem illustration.
// "According to the pattern shown below, how many ⊗ are there in the 10th group?"
//
// Shows groups 1–3 of a growing block-grid pattern made of ⊗ (circled-X) symbols.
// Group n has 2n²−1 ⊗ in a (2n−1)×(2n−1) grid (centre cross empty except centre).
// Answer (group 10 = 181) is NOT shown here.
//
// Copy-adapted from CrossPatternHK18P2Q5Illustration.tsx.
// SSR-safe: no hooks, no framer-motion.

const CS = 22           // cell size px
const CY = 80           // shared vertical centre for all groups
const R = 7.7           // ⊗ circle radius  (CS * 0.35)
const D = 5.0           // ⊗ diagonal half  (CS * 0.23)

// Horizontal centre of each group (left-pad=10, gaps=20)
// G1: 1×1 → cx=21   G2: 3×3 → cx=85   G3: 5×5 → cx=193
const GROUP_CX = [21, 85, 193] as const
const GROUP_LABELS = ['1st Group', '2nd Group', '3rd Group'] as const

/**
 * Returns [row, col] offsets from centre for a group-n pattern.
 * Count = 2n²−1:
 *   n=1 → 1   n=2 → 7   n=3 → 17
 *
 * Rule: centre cell always filled; for n≥3 the full centre cross
 * (row 0 and col 0 except centre) is empty; for n≤2 only the
 * centre column (col 0, non-centre) is empty (centre row stays full).
 */
function blockCells(n: number): [number, number][] {
  const cells: [number, number][] = []
  const half = n - 1
  for (let r = -half; r <= half; r++) {
    for (let c = -half; c <= half; c++) {
      if (r === 0 && c === 0) {
        cells.push([r, c])               // centre always filled
      } else if (n >= 3) {
        if (r !== 0 && c !== 0) cells.push([r, c])   // cross empty
      } else {
        if (c !== 0) cells.push([r, c])              // n≤2: only col-0 empty
      }
    }
  }
  return cells
}

export default function BlockGridHK18P3Q5Illustration() {
  return (
    <div
      className="mx-auto w-full max-w-[320px]"
      role="img"
      aria-label="Block-grid patterns of ⊗ symbols for groups 1 through 3"
    >
      <svg viewBox="0 0 270 165" width="100%" aria-hidden="true">
        {([1, 2, 3] as const).map((n, gi) => {
          const cx = GROUP_CX[gi]
          return (
            <g key={n}>
              {blockCells(n).map(([row, col]) => {
                const px = cx + col * CS
                const py = CY + row * CS
                return (
                  <g key={`${row},${col}`}>
                    <rect
                      x={px - CS / 2} y={py - CS / 2}
                      width={CS} height={CS}
                      fill="white" stroke="#374151" strokeWidth={0.9}
                    />
                    <circle
                      cx={px} cy={py} r={R}
                      fill="none" stroke="#374151" strokeWidth={1.1}
                    />
                    <line
                      x1={px - D} y1={py - D} x2={px + D} y2={py + D}
                      stroke="#374151" strokeWidth={1.1} strokeLinecap="round"
                    />
                    <line
                      x1={px + D} y1={py - D} x2={px - D} y2={py + D}
                      stroke="#374151" strokeWidth={1.1} strokeLinecap="round"
                    />
                  </g>
                )
              })}
              <text
                x={cx} y={153}
                textAnchor="middle"
                fontSize={10.5}
                fill="#6B7280"
                fontFamily="sans-serif"
              >
                {GROUP_LABELS[gi]}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
