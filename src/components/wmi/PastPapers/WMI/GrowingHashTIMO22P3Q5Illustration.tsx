// GrowingHashTIMO22P3Q5Illustration.tsx
// TIMO-22-P3H-Q5 stem illustration.
// "According to the pattern below, how many # are there in the 7th Group?"
//
// Shows Groups 1–4 plus Group 7 (with "…" between 4 and 7).
// Each Group n occupies a 2n × 2n grid:
//   · rows 0…2n−2: full X — two diagonals; each row always has exactly 2 cells
//     at columns [rr, 2n−1−rr] where rr = min(r, 2n−2−r)
//   · row 2n−1:    full bottom row of 2n # symbols
// Count per group = 6n − 2 → 4, 10, 16, 22, …, 40 for Group 7.
// Group 7 count (40) is NOT shown here — stem only.
//
// Copy-adapted from GrowingHashTIMO22P2Q5Illustration.
// SSR-safe: no hooks, no framer-motion.

const CS = 9           // cell size (px)
const PAD = 10         // left padding
const GAP = 6          // gap between consecutive groups 1–4
const DOT_GAP = 22     // gap before Group 7 (space for "…")
const BOTTOM_Y = 148   // y of top of the bottom-row cells (all groups bottom-aligned)

// Left-x for each rendered group
// Groups 1, 2, 3, 4 are consecutive; Group 7 is after the "…"
const GROUP_LX = [
  PAD,                                       // G1: 10
  PAD + 2 * CS + GAP,                       // G2: 34
  PAD + 2 * CS + GAP + 4 * CS + GAP,       // G3: 76
  PAD + 2 * CS + GAP + 4 * CS + GAP + 6 * CS + GAP, // G4: 136
  PAD + 2 * CS + GAP + 4 * CS + GAP + 6 * CS + GAP + 8 * CS + DOT_GAP, // G7: 230
] as const
// G7 LX = 10+18+6+36+6+54+6+72+22 = 230

// Filled cells for group n (row r, col c — 0-indexed).
// · Bottom row: all 2n cells.
// · Other rows: 2 cells at [rr, 2n−1−rr], rr = min(r, 2n−2−r).
function hashCells(n: number): [number, number][] {
  const cells: [number, number][] = []
  const last = 2 * n - 1
  for (let r = 0; r <= last; r++) {
    if (r === last) {
      for (let c = 0; c < 2 * n; c++) cells.push([r, c])
    } else {
      const rr = Math.min(r, 2 * n - 2 - r)
      cells.push([r, rr])
      cells.push([r, 2 * n - 1 - rr])
    }
  }
  return cells
}

// Groups to display: indices 0-3 → G1-G4, index 4 → G7
const DISPLAY_GROUPS = [1, 2, 3, 4, 7] as const

export default function GrowingHashTIMO22P3Q5Illustration() {
  return (
    <div
      className="mx-auto w-full max-w-[420px]"
      role="img"
      aria-label="Pola # yang tumbuh, Kelompok 1 hingga 4 dan Kelompok 7"
    >
      <svg viewBox="0 0 370 190" width="100%" aria-hidden="true">
        {DISPLAY_GROUPS.map((n, gi) => {
          const lx = GROUP_LX[gi]
          const cx = lx + n * CS   // horizontal centre of this group
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
                      y={py + CS * 0.76}
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
                x={cx}
                y={174}
                textAnchor="middle"
                fontSize={8.5}
                fill="#6B7280"
                fontFamily="sans-serif"
              >
                {`Kelompok ${n}`}
              </text>
            </g>
          )
        })}

        {/* "…" separator between G4 and G7 */}
        <text
          x={219}
          y={BOTTOM_Y - 3 * CS}
          textAnchor="middle"
          fontSize={14}
          fill="#6B7280"
          fontFamily="sans-serif"
        >
          …
        </text>
      </svg>
    </div>
  )
}
