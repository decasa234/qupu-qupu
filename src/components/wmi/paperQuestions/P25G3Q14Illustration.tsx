// Stepped-squares perimeter figure for WMI-25P3A-Q14 (2025 Grade-3 Semifinal).
//
// "Put 4 squares together, as shown. Find the perimeter of this figure."
//  Answer: E = 54.
//
// Reading db/seed/wmi/figures/2025-semifinal-g3-a-q14.jpg: four squares of
// decreasing size sit on a common baseline, left to right, forming a descending
// staircase. The bottom is labelled with each square's side: 9, 5, 3, 1.
//
// Perimeter by tracing the outline (start bottom-left, go counter-clockwise):
//   up left side       9
//   top of sq1         9   then drop 9−5 = 4
//   top of sq2         5   then drop 5−3 = 2
//   top of sq3         3   then drop 3−1 = 2
//   top of sq4         1   then drop 1
//   bottom (full)      9+5+3+1 = 18
//   total = 9 + 9 + 4 + 5 + 2 + 3 + 2 + 1 + 1 + 18 = 54
//
// The staircase's rises (the vertical drops between tops) together equal the
// tallest square's height (4+2+2+1 = 9), so the outline = 2×(left height) +
// 2×(total width) = 2×9 + 2×18 = 54. The static figure draws ONLY the problem
// (the four squares + side labels). It never states the perimeter. The
// co-exported SteppedSquares primitive lets the explainer light the outline.
//
// Pure render, SSR-safe, deterministic — no random / dates / window / state.

const INK = '#2E3A30' // outline
const FILL = '#CFE6D2' // pale green (matches the scan)
const TRACE = '#2C7BE5' // explainer-only outline trace
const LABEL = '#1F2937'

export const SIDES = [9, 5, 3, 1] as const
export const TOTAL_WIDTH = SIDES.reduce((a, b) => a + b, 0) // 18
export const TALL = Math.max(...SIDES) // 9
export const PERIMETER = 2 * TALL + 2 * TOTAL_WIDTH // 54

const UNIT = 14 // px per cm
const PAD = 30 // viewBox padding (headroom for labels + traces)
const LABEL_H = 30 // space below the baseline for side labels
export const Q14_VIEW_W = TOTAL_WIDTH * UNIT + PAD * 2
export const Q14_VIEW_H = TALL * UNIT + PAD + LABEL_H

const BASE_Y = PAD + TALL * UNIT // baseline y (all squares rest here)

/** x of the left edge of square i, and its top y. */
function squareBox(i: number) {
  const left = PAD + SIDES.slice(0, i).reduce((a, b) => a + b, 0) * UNIT
  const side = SIDES[i] * UNIT
  return { left, top: BASE_Y - side, side }
}

export interface SteppedSquaresProps {
  /** Highlight the traced outer border (the perimeter). */
  showOutline?: boolean
  /** Show the running perimeter total badge. */
  showTotal?: boolean
}

export function SteppedSquares({ showOutline = false, showTotal = false }: SteppedSquaresProps) {
  // outline path, counter-clockwise from bottom-left
  const pts: Array<[number, number]> = []
  pts.push([PAD, BASE_Y]) // bottom-left
  // up the left edge + across each top + drop between tops (staircase)
  for (let i = 0; i < SIDES.length; i++) {
    const { left, top, side } = squareBox(i)
    if (i === 0) pts.push([left, top]) // up the tall left edge
    pts.push([left + side, top]) // across this top
    // drop to next square's top (or to baseline after the last)
  }
  // after the last top, drop straight to baseline at the right edge
  const lastRight = PAD + TOTAL_WIDTH * UNIT
  pts.push([lastRight, BASE_Y])
  // baseline back to start is implicit (closed polygon)

  const outlinePoints = pts.map((p) => p.join(',')).join(' ')

  return (
    <svg
      viewBox={`0 0 ${Q14_VIEW_W} ${Q14_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* filled squares */}
      {SIDES.map((_, i) => {
        const { left, top, side } = squareBox(i)
        return <rect key={i} x={left} y={top} width={side} height={side} fill={FILL} stroke={INK} strokeWidth={2} />
      })}

      {/* highlighted outer outline (perimeter) */}
      {showOutline && (
        <polygon points={outlinePoints} fill="none" stroke={TRACE} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />
      )}

      {/* side labels under the baseline */}
      {SIDES.map((s, i) => {
        const { left, side } = squareBox(i)
        return (
          <text
            key={`l${i}`}
            x={left + side / 2}
            y={BASE_Y + 18}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={16}
            fontStyle="italic"
            fontWeight={700}
            fill={LABEL}
          >
            {s}
          </text>
        )
      })}

      {/* perimeter total badge */}
      {showTotal && (
        <g>
          <rect x={Q14_VIEW_W / 2 - 34} y={6} width={68} height={24} rx={12} fill="#FFFFFF" stroke={TRACE} strokeWidth={2} />
          <text x={Q14_VIEW_W / 2} y={18} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={900} fill={TRACE}>
            {`= ${PERIMETER}`}
          </text>
        </g>
      )}
    </svg>
  )
}

const ARIA =
  'Empat persegi dengan sisi 9, 5, 3, dan 1 disusun pada satu garis alas, ' +
  'mengecil dari kiri ke kanan membentuk tangga menurun. Tentukan keliling bangun ini.'

export default function P25G3Q14Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={ARIA}
    >
      <SteppedSquares />
    </div>
  )
}
