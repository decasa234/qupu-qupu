// WMI-21P2A-Q14 (2021 Grade 2 Semifinal) — "The side length of each of the four
// shaded small squares is 2 cm, and the perimeter of each shaded small square is
// 8 cm. Find the perimeter of the large square in cm." (answer D = 32).
//
// Reconstructed from db/seed/wmi/figures/2021-semifinal-g2-a-q14.jpg: a large
// square containing four small hatched squares placed corner-to-corner along the
// main diagonal — square 1 at the top-left corner, then each next square steps one
// square-width right and one square-width down, the last sitting in the
// bottom-right corner. The four squares exactly span the diagonal, so the big
// square is 4 small-squares wide:
//   side  = 4 × 2 cm = 8 cm
//   perim = 4 × 8 cm = 32 cm   (answer D)
//
// This file draws ONLY the problem (the big square + the four shaded squares, with
// the 2 cm label on one small square as in the scan). It never shows the answer.
//
// Pure render, SSR-safe & deterministic (no Math.random / Date, no state).

export const SMALL_SIDE_CM = 2
export const SMALL_PERIM_CM = SMALL_SIDE_CM * 4 // 8
export const SQUARES_ALONG_DIAGONAL = 4
export const BIG_SIDE_CM = SMALL_SIDE_CM * SQUARES_ALONG_DIAGONAL // 8
export const BIG_PERIM_CM = BIG_SIDE_CM * 4 // 32

// The grid is 4 cells per side; the four shaded squares occupy the diagonal cells
// (col, row) = (0,0), (1,1), (2,2), (3,3) reading from the top-left.
export const SHADED_CELLS: ReadonlyArray<[number, number]> = [
  [0, 0],
  [1, 1],
  [2, 2],
  [3, 3],
]

const INK = '#1F2937'
const HATCH = '#1F2937'
const SHADE_FILL = '#FFFFFF'

export const Q14_VIEW = 240
const PAD = 24
export const CELL = (Q14_VIEW - PAD * 2) / SQUARES_ALONG_DIAGONAL

const gx = (c: number) => PAD + c * CELL
const gy = (r: number) => PAD + r * CELL

const HIGHLIGHT = '#2563EB'
const HIGHLIGHT_FILL = 'rgba(37,99,235,0.16)'

export interface Q14FigureProps {
  /** Draw a thick coloured outline along the top + left sides (the measured side). */
  traceSide?: boolean
  /** Highlight the shaded squares' diagonal run (the "4 squares span the side" idea). */
  highlightDiagonal?: boolean
  /** Show the "2 cm" label on the first small square (matches the scan). */
  showSmallLabel?: boolean
  /** Show the "8 cm" big-side measurement bracket along the top edge. */
  showBigSide?: boolean
}

export function Q14Figure({
  traceSide = false,
  highlightDiagonal = false,
  showSmallLabel = true,
  showBigSide = false,
}: Q14FigureProps) {
  const hatchId = 'p21g2q14-hatch'
  return (
    <svg
      viewBox={`0 0 ${Q14_VIEW} ${Q14_VIEW + 8}`}
      width="100%"
      style={{ maxWidth: 240, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <defs>
        <pattern id={hatchId} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke={HATCH} strokeWidth={1.2} />
        </pattern>
      </defs>

      {/* Optional diagonal band behind the shaded squares */}
      {highlightDiagonal &&
        SHADED_CELLS.map(([c, r], i) => (
          <rect
            key={`dh-${i}`}
            x={gx(c)}
            y={gy(r)}
            width={CELL}
            height={CELL}
            fill={HIGHLIGHT_FILL}
            stroke={HIGHLIGHT}
            strokeWidth={2.5}
          />
        ))}

      {/* Big square */}
      <rect
        x={gx(0)}
        y={gy(0)}
        width={CELL * SQUARES_ALONG_DIAGONAL}
        height={CELL * SQUARES_ALONG_DIAGONAL}
        fill="none"
        stroke={INK}
        strokeWidth={2.6}
      />

      {/* Four hatched small squares on the diagonal */}
      {SHADED_CELLS.map(([c, r], i) => (
        <g key={`sq-${i}`}>
          <rect x={gx(c)} y={gy(r)} width={CELL} height={CELL} fill={SHADE_FILL} stroke={INK} strokeWidth={2.2} />
          <rect x={gx(c)} y={gy(r)} width={CELL} height={CELL} fill={`url(#${hatchId})`} stroke="none" />
        </g>
      ))}

      {/* "2 cm" label on the first small square (top-left), as in the scan */}
      {showSmallLabel && (
        <text
          x={gx(0) + CELL / 2}
          y={gy(0) - 8}
          textAnchor="middle"
          fontSize={13}
          fontWeight={800}
          fill="#475569"
        >
          2 cm
        </text>
      )}

      {/* Optional trace of one full side (top + left) */}
      {traceSide && (
        <>
          <line x1={gx(0)} y1={gy(0)} x2={gx(SQUARES_ALONG_DIAGONAL)} y2={gy(0)} stroke={HIGHLIGHT} strokeWidth={5} strokeLinecap="round" />
        </>
      )}

      {/* Optional big-side measurement along the top */}
      {showBigSide && (
        <text
          x={gx(0) + (CELL * SQUARES_ALONG_DIAGONAL) / 2}
          y={Q14_VIEW + 4}
          textAnchor="middle"
          fontSize={14}
          fontWeight={900}
          fill={HIGHLIGHT}
        >
          {`${BIG_SIDE_CM} cm`}
        </text>
      )}
    </svg>
  )
}

export default function P21G2Q14Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A large square with four shaded small squares placed corner to corner along its diagonal, from the top-left corner down to the bottom-right corner. Each small square is 2 cm on a side."
    >
      <Q14Figure showSmallLabel />
    </div>
  )
}
