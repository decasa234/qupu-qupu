export const CANDY_ROWS = [22, 22, 4] as const
export const CANDY_TOTAL = CANDY_ROWS.reduce((s, n) => s + n, 0) // 48

const COLORS = ['#F97316', '#2f6df0', '#EC4899', '#10B981', '#A855F7']
const PAD_X = 22
const GAP = 20
const R = 7
const ROW_Y = [40, 84, 128]
export const VIEW_W = PAD_X * 2 + (Math.max(...CANDY_ROWS) - 1) * GAP + R * 2
export const VIEW_H = 168

export interface CandyPos {
  row: number
  cx: number
  cy: number
  color: string
}

export function candyPositions(rows: readonly number[] = CANDY_ROWS): CandyPos[] {
  const out: CandyPos[] = []
  let n = 0
  rows.forEach((count, row) => {
    for (let i = 0; i < count; i++) {
      out.push({ row, cx: PAD_X + R + i * GAP, cy: ROW_Y[row] ?? ROW_Y[ROW_Y.length - 1], color: COLORS[n % COLORS.length] })
      n++
    }
  })
  return out
}

// A small wrapped candy: oval body + two triangular wrapper ends.
export function Candy({ cx, cy, color, opacity = 1 }: { cx: number; cy: number; color: string; opacity?: number }) {
  return (
    <g opacity={opacity}>
      <polygon points={`${cx - R - 6},${cy - 5} ${cx - R - 6},${cy + 5} ${cx - R},${cy}`} fill={color} />
      <polygon points={`${cx + R + 6},${cy - 5} ${cx + R + 6},${cy + 5} ${cx + R},${cy}`} fill={color} />
      <ellipse cx={cx} cy={cy} rx={R} ry={R * 0.78} fill={color} />
      <ellipse cx={cx - 2} cy={cy - 2} rx={2} ry={1.4} fill="#ffffff" opacity={0.6} />
    </g>
  )
}
