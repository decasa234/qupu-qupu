export const STAR_ROWS = [22, 22, 4] as const
export const STAR_TOTAL = STAR_ROWS.reduce((s, n) => s + n, 0) // 48

const STAR_COLOR = '#F59E0B'
const PAD_X = 24
const GAP = 24
const R = 9
const ROW_Y = [46, 96, 146]
export const VIEW_W = PAD_X * 2 + (Math.max(...STAR_ROWS) - 1) * GAP + R * 2
export const VIEW_H = 192

export interface StarPos {
  row: number
  cx: number
  cy: number
  color: string
  tilt: number
}

export function starPositions(rows: readonly number[] = STAR_ROWS): StarPos[] {
  const out: StarPos[] = []
  let n = 0
  rows.forEach((count, row) => {
    for (let i = 0; i < count; i++) {
      out.push({
        row,
        cx: PAD_X + R + i * GAP,
        cy: ROW_Y[row] ?? ROW_Y[ROW_Y.length - 1],
        color: STAR_COLOR,
        tilt: 0,
      })
      n++
    }
  })
  return out
}

function starPoints(cx: number, cy: number, r: number): string {
  const inner = r * 0.42
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rad = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 === 0 ? r : inner
    pts.push(`${(cx + rr * Math.cos(rad)).toFixed(2)},${(cy + rr * Math.sin(rad)).toFixed(2)}`)
  }
  return pts.join(' ')
}

// A 5-point star, optionally tilted.
export function Star({ cx, cy, color, tilt = 0, opacity = 1 }: { cx: number; cy: number; color: string; tilt?: number; opacity?: number }) {
  return (
    <g opacity={opacity} transform={`rotate(${tilt} ${cx} ${cy})`}>
      <polygon points={starPoints(cx, cy, R)} fill={color} />
    </g>
  )
}
