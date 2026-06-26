// GrowingHashTIMO22P4Q5Illustration.tsx
// TIMO-22-P4H-Q5 stem illustration (body Indonesian).
// "Berdasarkan pola di bawah ini, ada berapa banyak simbol # pada kelompok ke-9?"
//
// Groups 1–4 are shown alongside Group 9 (the target group).
// Each Group n occupies a 2n×2n grid:
//   · Outer border frame  (all cells where r=0, r=2n−1, c=0, or c=2n−1)
//   · Anti-diagonal in the interior: cells (r, c) where r+c = 2n−1, 1 ≤ r,c ≤ 2n−2
// Counts: G1=4, G2=14, G3=24, G4=34 (+10 each); G9=84.
//
// Copy-adapted from GrowingHashTIMO22P2Q5Illustration.
// SSR-safe: no hooks, no framer-motion.

const CS1 = 10   // cell size (px) for Groups 1–4
const CS9 = 6    // cell size (px) for Group 9
const BL  = 128  // common bottom-baseline y

// Left-x for Groups 1–4 (n = 1, 2, 3, 4)
const LX1 = [8, 40, 92, 164] as const
const LX9 = 252  // left-x for Group 9

// All filled [row, col] cells for group n (0-indexed inside 2n×2n grid).
function groupCells(n: number): Array<[number, number]> {
  const cells: Array<[number, number]> = []
  const max = 2 * n - 1
  for (let r = 0; r <= max; r++) {
    for (let c = 0; c <= max; c++) {
      const frame = r === 0 || r === max || c === 0 || c === max
      const diag  = r >= 1 && r <= max - 1 && r + c === max
      if (frame || diag) cells.push([r, c])
    }
  }
  return cells
}

interface GroupGridProps {
  n: number
  lx: number
  cs: number
  /** Show the # glyph inside each filled cell (skip when cells are too small) */
  showText: boolean
}

function GroupGrid({ n, lx, cs, showText }: GroupGridProps) {
  const dim = 2 * n
  const top = BL - dim * cs
  const max = dim - 1
  const filled = new Set<string>()
  groupCells(n).forEach(([r, c]) => filled.add(`${r},${c}`))

  const allCells: Array<{ r: number; c: number }> = []
  for (let r = 0; r <= max; r++)
    for (let c = 0; c <= max; c++)
      allCells.push({ r, c })

  return (
    <>
      {allCells.map(({ r, c }) => {
        const isFilled = filled.has(`${r},${c}`)
        return (
          <rect
            key={`${r},${c}`}
            x={lx + c * cs}
            y={top + r * cs}
            width={cs}
            height={cs}
            fill={isFilled ? '#DBEAFE' : '#F9FAFB'}
            stroke={isFilled ? '#1E40AF' : '#D1D5DB'}
            strokeWidth={isFilled ? 0.6 : 0.3}
          />
        )
      })}
      {showText && groupCells(n).map(([r, c]) => (
        <text
          key={`t${r},${c}`}
          x={lx + c * cs + cs / 2}
          y={top + r * cs + cs * 0.74}
          textAnchor="middle"
          fontSize={cs * 0.68}
          fill="#1E40AF"
          fontFamily="monospace"
          fontWeight="bold"
        >
          #
        </text>
      ))}
    </>
  )
}

export default function GrowingHashTIMO22P4Q5Illustration() {
  return (
    <div
      className="mx-auto w-full max-w-[440px]"
      role="img"
      aria-label="Pola # kelompok 1 sampai 4 dan kelompok 9"
    >
      <svg viewBox="0 0 375 148" width="100%" aria-hidden="true">

        {/* Groups 1–4 */}
        {([1, 2, 3, 4] as const).map((n, i) => (
          <g key={n}>
            <GroupGrid n={n} lx={LX1[i]} cs={CS1} showText />
            <text
              x={LX1[i] + n * CS1}
              y={141}
              textAnchor="middle"
              fontSize={8.5}
              fill="#6B7280"
              fontFamily="sans-serif"
            >
              {`Kelompok ${n}`}
            </text>
          </g>
        ))}

        {/* Ellipsis separator */}
        <text
          x={247}
          y={86}
          textAnchor="middle"
          fontSize={14}
          fill="#9CA3AF"
          fontFamily="sans-serif"
        >
          …
        </text>

        {/* Group 9 — cells shown without text (too small at CS=6) */}
        <g>
          <GroupGrid n={9} lx={LX9} cs={CS9} showText={false} />
          <text
            x={LX9 + 9 * CS9}
            y={141}
            textAnchor="middle"
            fontSize={8.5}
            fill="#6B7280"
            fontFamily="sans-serif"
          >
            Kelompok 9
          </text>
        </g>

      </svg>
    </div>
  )
}
