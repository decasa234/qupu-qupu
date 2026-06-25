// CrossPatternHK18P2Q5Illustration.tsx
// HKIMO-18-P2H-Q5 stem illustration.
// "According to the pattern shown below, how many ⊗ are there in the 12th group?"
//
// Shows groups 1–4 of a cross/plus pattern made of ⊗ (circled-X) symbols.
// Group n: center cell + (n−1) arms in each of 4 directions → 4n−3 cells.
// Answer (group 12 = 45) is NOT shown here.
//
// No primitive match; fresh SVG — cross-shaped polyomino with ⊗ glyphs.
// SSR-safe: no hooks, no framer-motion.

const CS = 20           // cell size px
const CY = 84           // shared vertical centre for all crosses
const R = 7.4           // ⊗ circle radius  (CS * 0.37)
const D = 4.8           // ⊗ diagonal half  (CS * 0.24)

// Centre X of each group (precomputed; CS=20, GAP=24, PAD=14)
// G1 span=20  → cx=24   G2 span=60 → cx=88
// G3 span=100 → cx=192  G4 span=140 → cx=336
const GROUP_CX: [number, number, number, number] = [24, 88, 192, 336]
const GROUP_LABELS = ['1st Group', '2nd Group', '3rd Group', '4th Group']

function crossCells(n: number): [number, number][] {
  const cells: [number, number][] = [[0, 0]]
  for (let k = 1; k < n; k++) {
    cells.push([-k, 0], [k, 0], [0, -k], [0, k])
  }
  return cells
}

export default function CrossPatternHK18P2Q5Illustration() {
  return (
    <div
      className="mx-auto w-full max-w-[440px]"
      role="img"
      aria-label="Cross patterns of ⊗ symbols for groups 1 through 4"
    >
      <svg viewBox="0 0 420 188" width="100%" aria-hidden="true">
        {[1, 2, 3, 4].map((n, gi) => {
          const cx = GROUP_CX[gi]
          return (
            <g key={n}>
              {crossCells(n).map(([row, col]) => {
                const px = cx + col * CS
                const py = CY + row * CS
                return (
                  <g key={`${row},${col}`}>
                    <rect
                      x={px - CS / 2} y={py - CS / 2}
                      width={CS} height={CS}
                      fill="white" stroke="#374151" strokeWidth={0.9}
                    />
                    <circle cx={px} cy={py} r={R} fill="none" stroke="#374151" strokeWidth={1.1} />
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
                x={cx} y={176}
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
