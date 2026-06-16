// White-and-gray triangle growth pattern for WMI-20P3A-Q17 (2020 Grade 3 Semifinal).
//
// Reconstructed from db/seed/wmi/figures/2020-semifinal-g3-a-q17.jpg:
// picture(n) is a big triangle divided into n rows of small triangles.
//   Row r (1..n, top→bottom) holds r upward (GRAY) triangles and (r-1) downward
//   (WHITE) triangles.  So in picture n:
//     gray  (up)   = 1 + 2 + … + n       = n(n+1)/2
//     white (down) = 0 + 1 + … + (n-1)   = n(n-1)/2
//   total small triangles = n², and  gray - white = n.
// The scan draws pictures 1–4, an ellipsis, then a "?" box.
//
// Question: when |gray - white| = 10, find the number of WHITE triangles.
//   gray - white = n = 10  ->  white = 10·9/2 = 45  -> answer D = 45.
//
// The static figure shows ONLY the growing pictures and the "?" — it does NOT
// reveal n = 10 or the white count; that is the explainer's job.

export const GRAY = '#9CA3AF' // up-pointing (gray) triangles
export const WHITE = '#FFFFFF' // down-pointing (white) triangles
const EDGE = '#1F2937'
const INK = '#1F2937'

/** Gray (up) triangles in picture n: 1+2+…+n = n(n+1)/2. */
export const grayCount = (n: number) => (n * (n + 1)) / 2
/** White (down) triangles in picture n: n(n-1)/2. */
export const whiteCount = (n: number) => (n * (n - 1)) / 2

// Ground truth for the difference puzzle.
export const TARGET_DIFF = 10
export const ANSWER_N = TARGET_DIFF // gray - white = n
export const ANSWER_WHITE = whiteCount(ANSWER_N) // 45

/**
 * One picture: a big triangle of `rows` rows of small triangles. Upward triangles
 * are gray, the inverted ones between them are white. Drawn centred, growing
 * downward from `topY`. `s` is the side of a small triangle.
 */
export function TriPattern({
  rows,
  s = 16,
  topY = 4,
  grayFill = GRAY,
  whiteFill = WHITE,
}: {
  rows: number
  s?: number
  topY?: number
  grayFill?: string
  whiteFill?: string
}) {
  const h = (s * Math.sqrt(3)) / 2 // height of one small triangle
  const baseW = rows * s
  const cx = baseW / 2
  const ups: string[] = []
  const downs: string[] = []

  for (let r = 0; r < rows; r++) {
    const rowY = topY + r * h
    const x0 = cx - ((r + 1) * s) / 2 // left edge of this row, centred under apex
    // (r+1) upward triangles
    for (let i = 0; i <= r; i++) {
      const x = x0 + i * s
      ups.push(`${x + s / 2},${rowY} ${x},${rowY + h} ${x + s},${rowY + h}`)
    }
    // r downward (inverted) triangles nested between the ups
    for (let i = 0; i < r; i++) {
      const x = x0 + i * s
      downs.push(`${x + s},${rowY} ${x + s / 2},${rowY + h} ${x + (3 * s) / 2},${rowY + h}`)
    }
  }

  return (
    <g>
      {ups.map((pts, i) => (
        <polygon key={`u${i}`} points={pts} fill={grayFill} stroke={EDGE} strokeWidth={0.9} strokeLinejoin="round" />
      ))}
      {downs.map((pts, i) => (
        <polygon key={`d${i}`} points={pts} fill={whiteFill} stroke={EDGE} strokeWidth={0.9} strokeLinejoin="round" />
      ))}
    </g>
  )
}

export const CELL_W = 130
export const CELL_H = 150

export interface Q17CellProps {
  /** picture number (n rows). */
  picture: number
  /** Render a "?" box instead of the triangle. */
  unknown?: boolean
  /** Highlight ring around the cell. */
  active?: boolean
  /** Show "gray N / white M" counts under the picture. */
  showCounts?: boolean
}

/** A single labelled picture cell: the triangle (or "?") + "picture N" caption. */
export function Q17Cell({ picture, unknown = false, active = false, showCounts = false }: Q17CellProps) {
  const s = 16
  const h = (s * Math.sqrt(3)) / 2
  const baseW = picture * s
  const stackX = (CELL_W - baseW) / 2
  // vertically centre the triangle in the upper part of the cell
  const triH = picture * h
  const topY = 16 + (Math.max(0, 4 - picture) * h) / 2
  return (
    <g>
      {active && (
        <rect x={2} y={2} width={CELL_W - 4} height={CELL_H - 4} rx={10} fill="none" stroke="#F97316" strokeWidth={3} />
      )}
      {unknown ? (
        <g>
          <rect x={CELL_W / 2 - 28} y={32} width={56} height={56} rx={8} fill="white" stroke="#30598A" strokeWidth={3} />
          <text x={CELL_W / 2} y={62} textAnchor="middle" dominantBaseline="central" fontSize={36} fontWeight={800} fill="#30598A">
            ?
          </text>
        </g>
      ) : (
        <g transform={`translate(${stackX}, 0)`}>
          <TriPattern rows={picture} s={s} topY={topY} />
        </g>
      )}
      {showCounts && !unknown && (
        <text x={CELL_W / 2} y={topY + triH + 18} textAnchor="middle" fontSize={12} fontWeight={800} fill="#374151">
          <tspan fill="#6B7280">▲{grayCount(picture)}</tspan>
          <tspan dx={8} fill="#9CA3AF">▽{whiteCount(picture)}</tspan>
        </text>
      )}
      <text x={CELL_W / 2} y={CELL_H - 8} textAnchor="middle" fontSize={13} fontWeight={700} fontStyle="italic" fill={INK}>
        picture {picture}
      </text>
    </g>
  )
}

export const Q17_VIEW_W = CELL_W * 5 + 50
export const Q17_VIEW_H = CELL_H

export default function P20G3Q17Illustration() {
  const drawn = [1, 2, 3, 4]
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Growing triangles of small gray (up) and white (down) triangles. Picture 1 through 4 are shown, then a question-mark box for the unknown picture."
    >
      <svg
        viewBox={`0 0 ${Q17_VIEW_W} ${Q17_VIEW_H}`}
        width="100%"
        style={{ maxWidth: Q17_VIEW_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {drawn.map((p, i) => (
          <g key={p} transform={`translate(${i * CELL_W}, 0)`}>
            <Q17Cell picture={p} />
          </g>
        ))}
        <text x={CELL_W * 4 + 24} y={CELL_H / 2} textAnchor="middle" dominantBaseline="central" fontSize={26} fontWeight={800} fill={INK}>
          …
        </text>
        <g transform={`translate(${CELL_W * 4 + 46}, 0)`}>
          <Q17Cell picture={5} unknown />
        </g>
      </svg>
    </div>
  )
}
