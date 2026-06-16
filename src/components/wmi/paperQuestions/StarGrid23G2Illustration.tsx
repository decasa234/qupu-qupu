// Star-grid illustration for WMI-23F2A-Q17.
// A 6×6 grid with six ★ placed on the anti-diagonal (top-right → bottom-left).
// The question asks: how many axis-aligned squares of any size contain exactly
// one ★? (Answer = 18, but this figure never shows the answer.)
//
// Exports:
//   STAR_GRID23         — grid size + star coords (data contract for explainer)
//   StarGrid23G2        — primitive the explainer drives (accepts highlightSquares)
//   StarGrid23G2Illustration — the in-card figure (default export shape)

const INK = '#1F2937'

// ---- data contract ---------------------------------------------------------

export interface StarGridParams {
  /** number of rows = number of columns */
  gridSize: number
  /** [row, col] pairs that hold a ★, 0-indexed from top-left */
  stars: Array<[number, number]>
}

/** Canonical grid for WMI-23F2A-Q17 */
export const STAR_GRID23: StarGridParams = {
  gridSize: 6,
  stars: [
    [0, 5],
    [1, 4],
    [2, 3],
    [3, 2],
    [4, 1],
    [5, 0],
  ],
}

// ---- primitive -------------------------------------------------------------

/**
 * Draws the 6×6 grid with ★ glyphs.
 * `highlightSquares` — optional list of axis-aligned squares
 * `{ r, c, size }` (top-left cell + side length in cells) that the
 * explainer wants to outline in orange; ignored in the default figure.
 */
export function StarGrid23G2({
  gridSize = STAR_GRID23.gridSize,
  stars = STAR_GRID23.stars,
  highlightSquares,
}: {
  gridSize?: number
  stars?: Array<[number, number]>
  highlightSquares?: Array<{ r: number; c: number; size: number }>
}) {
  const CELL = 44
  const PAD = 12
  const svgW = PAD * 2 + gridSize * CELL
  const svgH = PAD * 2 + gridSize * CELL

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      width="100%"
      style={{ maxWidth: Math.min(svgW, 300), display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* grid cells */}
      {Array.from({ length: gridSize }, (_, r) =>
        Array.from({ length: gridSize }, (__, c) => (
          <rect
            key={`${r}-${c}`}
            x={PAD + c * CELL}
            y={PAD + r * CELL}
            width={CELL}
            height={CELL}
            fill="white"
            stroke={INK}
            strokeWidth={1.8}
          />
        )),
      )}

      {/* highlight outlines (explainer phase only) */}
      {highlightSquares?.map(({ r, c, size }, i) => (
        <rect
          key={`hl-${i}`}
          x={PAD + c * CELL + 2}
          y={PAD + r * CELL + 2}
          width={size * CELL - 4}
          height={size * CELL - 4}
          fill="rgba(234,88,12,0.08)"
          stroke="#EA580C"
          strokeWidth={2.5}
          rx={3}
        />
      ))}

      {/* ★ glyphs */}
      {stars.map(([r, c]) => (
        <text
          key={`star-${r}-${c}`}
          x={PAD + c * CELL + CELL / 2}
          y={PAD + r * CELL + CELL / 2 + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={22}
          fill={INK}
        >
          {'★'}
        </text>
      ))}
    </svg>
  )
}

// ---- in-card illustration --------------------------------------------------

interface Params {
  gridSize?: number
  stars?: Array<[number, number]>
}

function isValidParams(p: unknown): p is Params {
  if (typeof p !== 'object' || p === null) return false
  const q = p as Record<string, unknown>
  if (q.gridSize !== undefined && typeof q.gridSize !== 'number') return false
  if (q.stars !== undefined) {
    if (!Array.isArray(q.stars)) return false
    if (
      !q.stars.every(
        (s) =>
          Array.isArray(s) &&
          s.length === 2 &&
          typeof s[0] === 'number' &&
          typeof s[1] === 'number',
      )
    )
      return false
  }
  return true
}

/**
 * WMI-23F2A-Q17 — in-card figure.
 * Shows a 6×6 grid with six ★ on the anti-diagonal. Never reveals the answer.
 */
export default function StarGrid23G2Illustration({ params }: { params: unknown }) {
  const p = isValidParams(params) ? params : {}
  const gridSize = p.gridSize ?? STAR_GRID23.gridSize
  const stars = p.stars ?? STAR_GRID23.stars

  const starList = stars
    .map(([r, c]: [number, number]) => `baris ${r + 1} kolom ${c + 1}`)
    .join('; ')

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={`Kotak ${gridSize}×${gridSize} berisi enam bintang (★) di posisi: ${starList}. Berapa banyak kotak (berbagai ukuran) yang hanya memuat tepat satu bintang?`}
    >
      <StarGrid23G2 gridSize={gridSize} stars={stars} />
    </div>
  )
}
