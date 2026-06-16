// Two overlapping triangles figure for WMI-19P3A-Q17 (2019 WMI Semifinal Grade 3).
//
// Reconstructed from db/seed/wmi/figures/2019-semifinal-g3-a-q17.jpg: two arbitrary
// triangles overlap so their intersection (shaded) is a small triangle — a region
// bounded by 3 segments. The question asks: placed differently, what is the GREATEST
// possible number of sides of the overlapping region? Answer C = 6 (a hexagon, the
// Star-of-David overlap). This static figure shows ONLY the given arrangement (a
// 3-sided overlap); it never reveals the 6-sided answer.
//
// Pure render: no window/document, no Math.random/Date — SSR-safe & deterministic.

export const Q17_ANSWER = 'C' // greatest number of sides = 6 (hexagon)

const INK = '#1F2937'
const SHADE = '#9CA3AF'

export const Q17_VIEW_W = 360
export const Q17_VIEW_H = 280

/** A single outlined triangle from three corner points. */
export function Triangle({
  points,
  stroke = INK,
  strokeWidth = 4,
  fill = 'none',
}: {
  points: ReadonlyArray<readonly [number, number]>
  stroke?: string
  strokeWidth?: number
  fill?: string
}) {
  const d = points.map(([x, y]) => `${x},${y}`).join(' ')
  return <polygon points={d} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
}

// The two triangles, traced to match the source arrangement (left triangle leaning,
// right triangle upright), giving a small triangular overlap in the middle.
export const LEFT_TRI: ReadonlyArray<readonly [number, number]> = [
  [118, 26],
  [22, 168],
  [232, 152],
]
export const RIGHT_TRI: ReadonlyArray<readonly [number, number]> = [
  [236, 30],
  [150, 232],
  [330, 250],
]

// The shaded intersection (the example 3-sided overlap), traced from the figure.
export const OVERLAP_TRI: ReadonlyArray<readonly [number, number]> = [
  [196, 116],
  [150, 168],
  [225, 173],
]

export interface TwoTrianglesProps {
  /** Tint + outline the small triangular overlap (the given example). */
  showOverlap?: boolean
}

export function TwoTriangles({ showOverlap = true }: TwoTrianglesProps) {
  return (
    <svg
      viewBox={`0 0 ${Q17_VIEW_W} ${Q17_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {showOverlap && <Triangle points={OVERLAP_TRI} fill={SHADE} stroke="none" />}
      <Triangle points={LEFT_TRI} />
      <Triangle points={RIGHT_TRI} />
    </svg>
  )
}

export default function P19G3Q17Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Two triangles overlap. The shaded part where they cross is a small triangle bounded by three segments."
    >
      <TwoTriangles />
    </div>
  )
}
