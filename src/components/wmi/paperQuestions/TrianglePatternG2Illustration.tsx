// WMI-19F2A-Q13 — triangular-stack growth pattern. Answer: C = 28.
//
// picture(n) is a triangle of small ▲'s whose rows (top→bottom) contain
// 1, 2, …, (n+1) small triangles, so the count is the triangular number
// T(n+1) = (n+1)(n+2)/2:  picture 1..6 → 3, 6, 10, 15, 21, 28.
// The drawn scan shows pictures 1–4; picture 6 is the "?" slot.

/** Total small ▲ in picture n: rows of 1,2,…,(n+1) ⇒ (n+1)(n+2)/2. */
export function triangleCount(picture: number): number {
  const rows = picture + 1
  return (rows * (rows + 1)) / 2
}

/** The six counts as ground truth: 3, 6, 10, 15, 21, 28. */
export const TRIANGLE_COUNTS = [1, 2, 3, 4, 5, 6].map(triangleCount)

const UP = '#341857'
const INK = '#1F2937'

/**
 * One picture: a stack of `rows` rows. Row r (0-indexed from the top) holds
 * (r+1) upward triangles and r downward triangles between them — together
 * 1+2+…+rows = T(rows) small triangles, all of unit side `s`.
 * Drawn centred horizontally, growing downward from `topY`.
 */
export function TriangleStack({
  rows,
  s = 14,
  topY = 4,
  color = UP,
}: {
  rows: number
  s?: number
  topY?: number
  color?: string
}) {
  const h = (s * Math.sqrt(3)) / 2 // height of one small triangle
  const baseW = rows * s // width of the bottom row
  const cx = baseW / 2 // centre x to mirror around
  const tris: { pts: string; down: boolean }[] = []

  for (let r = 0; r < rows; r++) {
    const rowY = topY + r * h
    // left edge of this row so it stays centred under the apex
    const x0 = cx - ((r + 1) * s) / 2
    // (r+1) upward triangles
    for (let i = 0; i <= r; i++) {
      const x = x0 + i * s
      tris.push({
        pts: `${x + s / 2},${rowY} ${x},${rowY + h} ${x + s},${rowY + h}`,
        down: false,
      })
    }
    // r downward triangles nested between the upward ones
    for (let i = 0; i < r; i++) {
      const x = x0 + (i + 1) * s
      // apex points down; top edge spans [x - s, x], bottom vertex at x - s/2
      tris.push({
        pts: `${x - s},${rowY} ${x},${rowY} ${x - s / 2},${rowY + h}`,
        down: true,
      })
    }
  }

  return (
    <g>
      {tris.map((t, i) => (
        <polygon
          key={i}
          points={t.pts}
          fill={color}
          fillOpacity={t.down ? 0.55 : 1}
          stroke="white"
          strokeWidth={0.8}
          strokeLinejoin="round"
        />
      ))}
    </g>
  )
}

export interface PictureCellProps {
  /** picture number (1..6); 6 is normally rendered as the "?" slot. */
  picture: number
  /** Force the "?" question slot instead of drawing the stack. */
  unknown?: boolean
  /** Whether to show the count number under the picture. */
  showCount?: boolean
  /** Highlight ring around the cell when true. */
  active?: boolean
  color?: string
}

export const CELL_W = 130
export const CELL_H = 150

/** A single labelled picture cell: the stack (or "?") + "picture (n)" caption. */
export function PictureCell({ picture, unknown = false, showCount = false, active = false, color = UP }: PictureCellProps) {
  const rows = picture + 1
  const count = triangleCount(picture)
  const s = 14
  const baseW = rows * s
  const stackX = (CELL_W - baseW) / 2
  return (
    <g>
      {active && (
        <rect x={2} y={2} width={CELL_W - 4} height={CELL_H - 4} rx={10} fill="none" stroke="#F97316" strokeWidth={3} />
      )}
      {unknown ? (
        <g>
          <rect x={CELL_W / 2 - 26} y={28} width={52} height={52} rx={8} fill="white" stroke="#30598A" strokeWidth={3} />
          <text x={CELL_W / 2} y={56} textAnchor="middle" dominantBaseline="central" fontSize={34} fontWeight={800} fill="#30598A">
            ?
          </text>
        </g>
      ) : (
        <g transform={`translate(${stackX}, 0)`}>
          <TriangleStack rows={rows} s={s} topY={8} color={color} />
        </g>
      )}
      {showCount && !unknown && (
        <text x={CELL_W / 2} y={CELL_H - 30} textAnchor="middle" fontSize={15} fontWeight={800} fill="#065F46">
          {count}
        </text>
      )}
      <text x={CELL_W / 2} y={CELL_H - 8} textAnchor="middle" fontSize={13} fontWeight={700} fontStyle="italic" fill={INK}>
        picture ({picture})
      </text>
    </g>
  )
}

export const TRI_VIEW_W = CELL_W * 4 + 60
export const TRI_VIEW_H = CELL_H

export default function TrianglePatternG2Illustration() {
  // Static figure: pictures 1–4 drawn, an ellipsis, then "picture (6) = ?".
  const drawn = [1, 2, 3, 4]
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Growing triangular stacks: picture 1 has 3 small triangles, picture 2 has 6, picture 3 has 10, picture 4 has 15, then picture 6 is unknown."
    >
      <svg
        viewBox={`0 0 ${CELL_W * 5 + 40} ${TRI_VIEW_H}`}
        width="100%"
        style={{ maxWidth: CELL_W * 5 + 40, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {drawn.map((p, i) => (
          <g key={p} transform={`translate(${i * CELL_W}, 0)`}>
            <PictureCell picture={p} />
          </g>
        ))}
        <text x={CELL_W * 4 + 22} y={CELL_H / 2} textAnchor="middle" dominantBaseline="central" fontSize={26} fontWeight={800} fill={INK}>
          …
        </text>
        <g transform={`translate(${CELL_W * 4 + 40}, 0)`}>
          <PictureCell picture={6} unknown />
        </g>
      </svg>
    </div>
  )
}
