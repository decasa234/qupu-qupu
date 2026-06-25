// HKIMO-20-P1H-Q17 — "How many square(s) is/are there in the figure below?"
//
// The figure: 4 equal squares arranged in a staircase (diagonal), each shifted
// S/4 right and S/4 down from the previous. This creates nested overlaps:
//   - 4 original large squares (side = S)
//   - 3 pairwise-overlap squares (side = 3S/4)
//   - 2 triple-overlap squares (side = 2S/4 = S/2)
//   - 1 quadruple-overlap square (side = S/4)
// Total = 4 + 3 + 2 + 1 = 10 ✓
//
// PROBLEM ONLY: shows the 4 staircase squares as outlines. Does NOT reveal
// the count or highlight any sub-squares.
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

/** Side length of each large square (px). */
export const S = 120

/** Step offset in x and y between consecutive squares (= S/4 = 30 px). */
export const STEP = S / 4   // 30

/** Total viewBox extent. */
export const VB_SIZE = S + 3 * STEP   // 210

/** Stroke colour for the square outlines. */
export const STROKE = '#334155'   // slate-700

/** Stroke width. */
export const SW = 2.5

/** Square definitions: top-left corner (x, y) for each of the 4 squares. */
export const SQUARES = [
  { x: 0,        y: 0 },
  { x: STEP,     y: STEP },
  { x: 2 * STEP, y: 2 * STEP },
  { x: 3 * STEP, y: 3 * STEP },
] as const

export default function OverlapSquaresHK20P1Q17Illustration() {
  return (
    <svg
      viewBox={`0 0 ${VB_SIZE} ${VB_SIZE}`}
      width={VB_SIZE}
      height={VB_SIZE}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Four squares arranged in a diagonal staircase, each overlapping the next"
    >
      {SQUARES.map((sq, i) => (
        <rect
          key={i}
          x={sq.x + SW / 2}
          y={sq.y + SW / 2}
          width={S - SW}
          height={S - SW}
          fill="none"
          stroke={STROKE}
          strokeWidth={SW}
        />
      ))}
    </svg>
  )
}
