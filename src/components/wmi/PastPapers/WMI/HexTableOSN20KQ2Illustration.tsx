/**
 * OSN-20-SD-KAB-Q2
 * Meja segienam (hexagonal tables) in a row with chairs.
 * 1 table → 6 chairs; each added table in the row adds 4 (two shared-side
 * chairs are lost per join).
 *
 * Hexagon orientation: pointy-top (vertices at top & bottom, flat vertical
 * sides on left/right). Adjacent tables share the right flat side of table k
 * with the left flat side of table k+1, removing 1 chair from each.
 *
 * Primitives used: none (fresh SVG — hexagon + chair circles pattern)
 */

const HEX_R = 28          // circumradius
const CHAIR_R = 6         // chair circle radius
const GAP = 3             // gap between hex face and chair rim
const INRADIUS = HEX_R * Math.sqrt(3) / 2   // ≈ 24.25
const CHAIR_D = INRADIUS + GAP + CHAIR_R     // ≈ 33.25 (hex-center → chair-center)
export const TABLE_SPACING = HEX_R * Math.sqrt(3)  // ≈ 48.5 (center-to-center when merged)

/**
 * Outward unit vectors for each of the 6 sides of a pointy-top hexagon.
 * Index: 0=upper-right, 1=right (flat), 2=lower-right,
 *        3=lower-left,  4=left (flat),  5=upper-left
 */
export const SIDE_DIRS: [number, number][] = [
  [0.5, -Math.sqrt(3) / 2],  // 0 upper-right
  [1, 0],                     // 1 right   ← removed when table has a right neighbour
  [0.5, Math.sqrt(3) / 2],   // 2 lower-right
  [-0.5, Math.sqrt(3) / 2],  // 3 lower-left
  [-1, 0],                    // 4 left    ← removed when table has a left neighbour
  [-0.5, -Math.sqrt(3) / 2], // 5 upper-left
]

/** Pointy-top hexagon polygon points string. */
function hexPts(cx: number, cy: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const a = Math.PI / 2 - i * (Math.PI / 3)
    return `${(cx + HEX_R * Math.cos(a)).toFixed(1)},${(cy - HEX_R * Math.sin(a)).toFixed(1)}`
  }).join(' ')
}

export interface TableGroupProps {
  cx: number
  cy: number
  /** 0-indexed position within the row. */
  idx: number
  /** Total tables in this row. */
  total: number
  /** Per-side colour override (null = default blue). */
  sideColor?: (sideIdx: number) => string | null
}

/** One hexagonal table with chairs rendered around it. */
export function TableGroup({ cx, cy, idx, total, sideColor }: TableGroupProps) {
  const skip = new Set<number>()
  if (idx < total - 1) skip.add(1) // right side shared with next
  if (idx > 0) skip.add(4)          // left side shared with prev

  return (
    <g>
      <polygon points={hexPts(cx, cy)} fill="#DBEAFE" stroke="#2563EB" strokeWidth={1.5} />
      {SIDE_DIRS.map(([dx, dy], s) => {
        if (skip.has(s)) return null
        const cx2 = cx + dx * CHAIR_D
        const cy2 = cy + dy * CHAIR_D
        const color = sideColor ? (sideColor(s) ?? '#2563EB') : '#2563EB'
        return (
          <circle
            key={s}
            cx={cx2.toFixed(1)}
            cy={cy2.toFixed(1)}
            r={CHAIR_R}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
          />
        )
      })}
    </g>
  )
}

/** A row of `n` tables pushed together, horizontally centred on `cx`. */
export function HexTableRow({
  n,
  cx,
  cy,
  sideColor,
}: {
  n: number
  cx: number
  cy: number
  sideColor?: (tableIdx: number, sideIdx: number) => string | null
}) {
  const offset = (n - 1) / 2
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <TableGroup
          key={i}
          cx={cx + (i - offset) * TABLE_SPACING}
          cy={cy}
          idx={i}
          total={n}
          sideColor={sideColor ? (s) => sideColor(i, s) : undefined}
        />
      ))}
    </g>
  )
}

/** Count of chairs for n tables in a row: 6 + 4(n−1). */
export function chairCount(n: number) {
  return 6 + 4 * (n - 1)
}

/**
 * Static illustration: three rows showing 1, 2, and 3 tables with chair
 * counts labelled, matching the OCR figures 002–004.
 */
export default function HexTableOSN20KQ2Illustration() {
  const CX = 120
  const rows = [
    { n: 1, cy: 52 },
    { n: 2, cy: 160 },
    { n: 3, cy: 268 },
  ]

  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Tiga konfigurasi meja segienam: 1 meja dipasang 6 kursi, 2 meja dipasang 10 kursi, 3 meja dipasang 14 kursi."
    >
      <svg
        viewBox="0 0 240 318"
        width="100%"
        style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {rows.map(({ n, cy }) => (
          <g key={n}>
            <HexTableRow n={n} cx={CX} cy={cy} />
            <text x={CX} y={cy + 42} textAnchor="middle" fontSize={11} fontWeight="600" fill="#1E3A5F">
              {n} meja → {chairCount(n)} kursi
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
