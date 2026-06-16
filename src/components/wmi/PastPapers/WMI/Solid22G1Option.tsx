import type { WmiChoice } from '../../../../types/wmi'

// CHOICE renderer for WMI-22F1A-Q7 (Grade 1): "which 3D solid is different?"
// Each option A–D is a picture of a small solid built from unit cubes, drawn in
// standard isometric projection (front-right facing). The cube layouts are read
// straight from the scanned option images so the drawn solid can never drift
// from the printed question.
//
// Coordinate convention (matches the IsoStack reference in
// puzzles21G1Illustrations.tsx):
//   x = right  (screen: toward lower-right)
//   y = depth  (screen: toward upper-right, i.e. "back")
//   z = up     (screen: straight up)
//   projection: sx = (x + y) * cx,  sy = (x - y) * cy - z * size
//
// THE PUZZLE (answer = D):
//   A, B, C are the SAME solid — an L-tetromino (a straight bar of three cubes
//   with one extra cube on top of an end) shown in three different rotations,
//   so all three are flat: every cube of each shares one plane.
//   D is the ODD ONE OUT — a skew / "screw" tetromino. It is NOT flat: its four
//   cubes do not lie in a single plane (it bends in two perpendicular planes),
//   so no rotation of D can match A/B/C.
export type Voxel = [number, number, number]

export const SOLID_SETS: Record<'A' | 'B' | 'C' | 'D', Voxel[]> = {
  // A — L lying flat in the x-z plane (y = 0): a 3-long row + 1 on top of the
  // far-right end.
  A: [
    [0, 0, 0],
    [1, 0, 0],
    [2, 0, 0],
    [2, 0, 1],
  ],
  // B — the same L, rotated so the long arm stands up (x-z plane, y = 0): a
  // vertical bar of 3 on the left + 1 cube to its right at the floor.
  B: [
    [0, 0, 0],
    [0, 0, 1],
    [0, 0, 2],
    [1, 0, 0],
  ],
  // C — the same L again, rotated into the y-z plane (x = 0): a vertical pair on
  // the near-left + a 2-long bar running back; still flat (all cubes share the
  // x = 0 plane).
  C: [
    [0, 0, 0],
    [0, 0, 1],
    [0, 1, 0],
    [0, 2, 0],
  ],
  // D — skew / "screw" tetromino: a 2-long bar at the floor (front), one cube
  // stacked on the BACK of that bar, then one cube stepping out sideways and
  // down at the front. The four cubes do NOT lie in one plane — this is what
  // makes D different from A/B/C.
  D: [
    [0, 1, 1],
    [1, 1, 1],
    [0, 0, 1],
    [1, 0, 0],
  ],
}

export const SOLID_ARIA: Record<'A' | 'B' | 'C' | 'D', string> = {
  A: 'tiga kubus berderet dengan satu kubus di atas ujungnya',
  B: 'tiga kubus bertumpuk tegak dengan satu kubus di sampingnya',
  C: 'dua kubus bertumpuk dengan dua kubus memanjang ke belakang',
  D: 'kubus-kubus yang berbelok di dua arah, tidak datar',
}

const INK = '#1F2937'

// Highlight modes used post-answer by the explainer:
//   'match' — one of the three congruent solids (brand-orange tint)
//   'odd'   — the differing solid D (red tint)
// The static option renderer passes nothing, so it keeps the default blue.
export type SolidHighlight = 'match' | 'odd' | undefined

/**
 * Draws an isometric stack of unit cubes (front-right facing). Cubes are sorted
 * back-to-front so nearer cubes correctly overdraw farther ones. `highlight`
 * tints the solid (used post-answer by an explainer); the static option uses the
 * default blue palette.
 */
export function CubeSolid({
  cubes,
  highlight,
  size = 18,
}: {
  cubes: Array<[number, number, number]>
  highlight?: SolidHighlight
  size?: number
}) {
  const safeCubes =
    Array.isArray(cubes) && cubes.length > 0 ? (cubes as Voxel[]) : SOLID_SETS.A
  const cx = size * 0.86
  const cy = size * 0.5
  const proj = ([x, y, z]: Voxel) => ({ sx: (x + y) * cx, sy: (x - y) * cy - z * size })

  // Back-to-front painter's order: larger depth (y) first, then lower z, then
  // smaller x — so the front-right cubes are drawn last and stay on top.
  const order = [...safeCubes.keys()].sort((a, b) => {
    const [ax, ay, az] = safeCubes[a]
    const [bx, by, bz] = safeCubes[b]
    return by - ay || az - bz || ax - bx
  })

  const pts = safeCubes.map(proj)
  const pad = 6
  const minX = Math.min(...pts.map((p) => p.sx)) - pad
  const maxX = Math.max(...pts.map((p) => p.sx)) + cx * 2 + pad
  const minY = Math.min(...pts.map((p) => p.sy)) - cy - pad
  const maxY = Math.max(...pts.map((p) => p.sy)) + cy + size + pad
  const w = maxX - minX
  const h = maxY - minY

  // Blue (default) → orange ('match') → red ('odd'). Top / left / right faces of
  // each cube get progressively darker shades of the chosen hue.
  const palette =
    highlight === 'odd'
      ? { top: '#FBD3D3', left: '#EC9A9A', right: '#DC2626' }
      : highlight === 'match'
        ? { top: '#FFE3B0', left: '#F4B86A', right: '#E89A3C' }
        : { top: '#D6EBF7', left: '#8FC6E8', right: '#5BA8D4' }
  const fillTop = palette.top
  const fillLeft = palette.left
  const fillRight = palette.right

  return (
    <svg
      viewBox={`${minX} ${minY} ${w} ${h}`}
      width={Math.min(112, w * 1.6)}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {order.map((idx) => {
        const { sx, sy } = pts[idx]
        const top = `${sx},${sy} ${sx + cx},${sy - cy} ${sx + 2 * cx},${sy} ${sx + cx},${sy + cy}`
        const leftF = `${sx},${sy} ${sx + cx},${sy + cy} ${sx + cx},${sy + cy + size} ${sx},${sy + size}`
        const rightF = `${sx + cx},${sy + cy} ${sx + 2 * cx},${sy} ${sx + 2 * cx},${sy + size} ${sx + cx},${sy + cy + size}`
        return (
          <g key={idx}>
            <polygon points={top} fill={fillTop} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
            <polygon points={leftF} fill={fillLeft} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
            <polygon points={rightF} fill={fillRight} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
          </g>
        )
      })}
    </svg>
  )
}

export default function Solid22G1Option({ choice }: { choice: WmiChoice }) {
  const label = (choice?.label ?? '') as 'A' | 'B' | 'C' | 'D'
  const cubes = SOLID_SETS[label]
  if (!cubes) return <span>{choice?.text}</span>

  return (
    <span
      role="img"
      aria-label={`Pilihan ${label}: bangun dari empat kubus, ${SOLID_ARIA[label]}.`}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <CubeSolid cubes={cubes} />
    </span>
  )
}
