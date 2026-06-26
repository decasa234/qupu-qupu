// GrowingHashTIMO22P2Q5Illustration.tsx
// TIMO-22-P2H-Q5 stem illustration.
// "According to the pattern below, how many # are there in the 6th Group?"
//
// Groups 1–4 shown. Each Group n occupies a 2n × 2n grid:
//   · rows 0…2n−2: X/hourglass — two diagonals crossing at centre row (n−1)
//   · row 2n−1:     full bottom row of 2n # symbols
// Count per group = 6n − 3  → 3, 9, 15, 21 for groups 1–4.
// Group 6 answer (33) is NOT shown here — stem only.
//
// Copy-adapted from CrossPatternHK18P2Q5Illustration.
// SSR-safe: no hooks, no framer-motion.

const CS = 15          // cell size (px)
const BOTTOM_Y = 152   // top-left y of the bottom-row cells
const PAD = 14         // left padding
const GAP = 14         // gap between groups

// Left-x for each group (n = 1, 2, 3, 4)
const GROUP_LX = [
  PAD,                          // G1: 14
  PAD + 2 * CS + GAP,          // G2: 58
  PAD + 6 * CS + 2 * GAP,     // G3: 132
  PAD + 12 * CS + 3 * GAP,    // G4: 236
] as const

// All filled cells for group n (row r, col c — 0-indexed)
// · last row: all 2n columns
// · other rows: two diagonal cells (one when row = centre n−1)
function hashCells(n: number): [number, number][] {
  const cells: [number, number][] = []
  const last = 2 * n - 1
  for (let r = 0; r <= last; r++) {
    if (r === last) {
      for (let c = 0; c < 2 * n; c++) cells.push([r, c])
    } else {
      const lo = Math.min(r, last - 1 - r)
      const hi = Math.max(r, last - 1 - r)
      cells.push([r, lo])
      if (hi !== lo) cells.push([r, hi])
    }
  }
  return cells
}

export default function GrowingHashTIMO22P2Q5Illustration() {
  return (
    <div
      className="mx-auto w-full max-w-[420px]"
      role="img"
      aria-label="Pola # yang tumbuh, Kelompok 1 hingga 4"
    >
      <svg viewBox="0 0 390 200" width="100%" aria-hidden="true">
        {([1, 2, 3, 4] as const).map((n, gi) => {
          const lx = GROUP_LX[gi]
          const cx = lx + n * CS   // centre x = lx + half of (2n × CS)
          return (
            <g key={n}>
              {hashCells(n).map(([r, c]) => {
                const px = lx + c * CS
                const py = BOTTOM_Y - (2 * n - 1 - r) * CS
                return (
                  <g key={`${r},${c}`}>
                    <rect
                      x={px} y={py}
                      width={CS} height={CS}
                      fill="#DBEAFE" stroke="#1E40AF" strokeWidth={0.75}
                    />
                    <text
                      x={px + CS / 2}
                      y={py + CS * 0.74}
                      textAnchor="middle"
                      fontSize={CS * 0.72}
                      fill="#1E40AF"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      #
                    </text>
                  </g>
                )
              })}
              <text
                x={cx} y={181}
                textAnchor="middle"
                fontSize={9.5}
                fill="#6B7280"
                fontFamily="sans-serif"
              >
                {`Kelompok ${n}`}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
