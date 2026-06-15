// WMI-23F3A-Q11 (2023 Grade 3 Final) — a clock face broken into 4 sector pieces.
//
// "A complete clock face has the 12 numbers. It is broken into 4 sector-shaped
// pieces. The numbers on two of the pieces each add up to 26. Find the
// difference between the sums of the other two pieces."  Answer: D = 12.
//
// MATH (for reference only — the static figure must NOT reveal any sums or the
// answer): total 1..12 = 78. The two 26-pieces are the only consecutive arcs
// that sum to 26: {11,12,1,2} (top) and {5,6,7,8} (bottom). The other two are
// {3,4} = 7 (right) and {9,10} = 19 (left). Difference = 19 − 7 = 12.
//
// The clock is cut by 4 RADIAL cuts between the number pairs 2|3, 4|5, 8|9,
// 10|11, giving four pie slices:
//   top    {11,12,1,2}   arc 315° → 75°  (through 0°)
//   right  {3,4}         arc  75° → 135°
//   bottom {5,6,7,8}     arc 135° → 255°
//   left   {9,10}        arc 255° → 315°
// Each slice is drawn slightly exploded along its bisector so it reads as
// "broken into 4 pieces", carrying its own numbers, with a light pastel tint.
// The default figure labels NO sums and never reveals the answer.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

export type PieceKey = 'top' | 'right' | 'bottom' | 'left'

// Each piece: the inclusive arc of clock numbers it carries, plus the cut
// angles (degrees clockwise from 12 o'clock) that bound the slice.
interface PieceDef {
  key: PieceKey
  numbers: number[]
  startDeg: number // leading cut (clockwise)
  endDeg: number // trailing cut (clockwise)
  sum: number // animator-only (showSums)
}

// startDeg → endDeg always traversed clockwise (increasing angle, mod 360).
const PIECES: PieceDef[] = [
  { key: 'top', numbers: [11, 12, 1, 2], startDeg: 315, endDeg: 75 + 360, sum: 26 },
  { key: 'right', numbers: [3, 4], startDeg: 75, endDeg: 135, sum: 7 },
  { key: 'bottom', numbers: [5, 6, 7, 8], startDeg: 135, endDeg: 255, sum: 26 },
  { key: 'left', numbers: [9, 10], startDeg: 255, endDeg: 315, sum: 19 },
]

// ---- geometry --------------------------------------------------------------
const CX = 110 // face centre x (in user units, before explode)
const CY = 110 // face centre y
const R = 84 // clock radius
const NUM_R = 64 // radius at which numbers sit
const EXPLODE = 9 // how far each slice slides outward along its bisector

/** Clock angle (deg clockwise from 12) + length → point about a given centre. */
function polar(angleDeg: number, length: number, cx = CX, cy = CY): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + length * Math.sin(rad), y: cy - length * Math.cos(rad) }
}

/** SVG path for a pie slice (centre → arc start → arc → centre) about (cx,cy). */
function slicePath(startDeg: number, endDeg: number, cx: number, cy: number): string {
  const a = polar(startDeg, R, cx, cy)
  const b = polar(endDeg, R, cx, cy)
  const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${a.x} ${a.y} A ${R} ${R} 0 ${largeArc} 1 ${b.x} ${b.y} Z`
}

// Light pastel tints per piece so the four slices read as distinct, none
// implying an answer. Plain fills only — no sum labels in the default figure.
const TINTS: Record<PieceKey, string> = {
  top: 'fill-qupu-cream',
  right: 'fill-qupu-peach',
  bottom: 'fill-qupu-sky',
  left: 'fill-qupu-shell',
}

export interface ClockPieces23G3Props {
  /** Emphasize these pieces (thicker orange edge + lift). Default = none. */
  highlightPieces?: PieceKey[] | null
  /** Animator-only: reveal each piece's number-sum. Default = hidden. */
  showSums?: boolean
}

/**
 * Primitive. Draws the broken clock as four exploded pie slices carrying their
 * numbers. `highlightPieces` emphasizes given pieces; `showSums` reveals each
 * piece's number-sum (top=26, bottom=26, right=7, left=19) — for the animator
 * only. With both defaults it is the plain broken-clock problem figure.
 */
export function ClockPieces23G3({ highlightPieces = null, showSums = false }: ClockPieces23G3Props = {}) {
  const highlight = new Set(highlightPieces ?? [])

  // viewBox with headroom so exploded slices + sum chips never clip.
  const margin = EXPLODE + 24
  const size = R * 2 + margin * 2
  const minX = CX - R - margin
  const minY = CY - R - margin

  return (
    <svg
      viewBox={`${minX} ${minY} ${size} ${size}`}
      width={Math.min(260, size)}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      {PIECES.map((piece) => {
        const isHi = highlight.has(piece.key)
        // bisector direction → explode offset along it
        const mid = (piece.startDeg + piece.endDeg) / 2
        const lift = isHi ? EXPLODE + 4 : EXPLODE
        const off = polar(mid, lift, 0, 0) // offset vector from origin
        const cx = CX + off.x
        const cy = CY + off.y

        return (
          <g key={piece.key}>
            {/* the sector slice */}
            <path
              d={slicePath(piece.startDeg, piece.endDeg, cx, cy)}
              className={`${TINTS[piece.key]} ${isHi ? 'stroke-qupu-brand-orange' : 'stroke-qupu-brand-blue'}`}
              strokeWidth={isHi ? 4 : 2.5}
              strokeLinejoin="round"
            />

            {/* the clock numbers carried by this slice */}
            {piece.numbers.map((n) => {
              const a = (n % 12) * 30
              const pos = polar(a, NUM_R, cx, cy)
              return (
                <text
                  key={n}
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={15}
                  fontWeight={800}
                  className="fill-qupu-brand-blue"
                >
                  {n}
                </text>
              )
            })}

            {/* animator-only: the piece's number-sum, on a chip near its tip */}
            {showSums &&
              (() => {
                const chip = polar(mid, R + 16, cx, cy)
                return (
                  <g>
                    <rect
                      x={chip.x - 15}
                      y={chip.y - 11}
                      width={30}
                      height={22}
                      rx={7}
                      className="fill-qupu-brand-orange stroke-qupu-shell"
                      strokeWidth={1.5}
                    />
                    <text
                      x={chip.x}
                      y={chip.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={13}
                      fontWeight={800}
                      className="fill-qupu-shell"
                    >
                      {piece.sum}
                    </text>
                  </g>
                )
              })()}
          </g>
        )
      })}
    </svg>
  )
}

/**
 * Default export: the plain broken-clock figure — four exploded sector pieces,
 * each carrying its clock numbers, with light pastel tints. No sums, no answer.
 */
export default function ClockPieces23G3Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Sebuah jam dengan angka 1 sampai 12 dipecah menjadi empat potongan berbentuk juring: potongan atas berisi angka 11, 12, 1, 2; potongan kanan berisi 3, 4; potongan bawah berisi 5, 6, 7, 8; potongan kiri berisi 9, 10."
    >
      <ClockPieces23G3 />
    </div>
  )
}
