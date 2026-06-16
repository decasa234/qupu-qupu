// "Which figure comes next in the sequence?" figure for WMI-21P3A-Q14
// (2021 WMI Semifinal Grade 3, Paper A).
//
// The scan db/seed/wmi/figures/2021-semifinal-g3-a-q14.jpg shows ONE 3×3 grid
// with a vertical pair of shaded cells in the left column (top two cells). In the
// original paper the sequence ran across several such grids and the four answer
// choices were separate grid images (now stubbed as "(see option figure A..D)").
//
// The pattern is a shaded DOMINO sweeping clockwise around the 3×3 border, one
// quarter-turn per step. We render the visible run of the sequence ending in a "?"
// box. The explainer derives the next frame; the answer is D.
//
// Cells are (row, col), 0-based, top-left origin. The scan's frame is the LEFT
// edge / upper domino: {(0,0),(1,0)} — we use it as the FIRST frame so the static
// figure matches the paper exactly, then sweep clockwise.

const AMBER = '#F2B705'
const AMBER_EDGE = '#B8860B'
const GRID = '#1F2937'
const INK = '#1F2937'

export type Cell = [number, number] // [row, col]

// One quarter-turn clockwise of a domino travelling around the 3×3 border.
// Frame 0 = the scan (left edge, upper). Then it rotates 90° CW each step:
//   left-upper  → top-left   → top-right corner pair … we keep it as edge dominoes
// To stay clean and unambiguous we sweep the domino around the four edges:
export const SEQUENCE: Cell[][] = [
  [
    [0, 0],
    [1, 0],
  ], // left edge, upper  (matches the scan)
  [
    [0, 1],
    [0, 2],
  ], // top edge, right
  [
    [1, 2],
    [2, 2],
  ], // right edge, lower
  [
    [2, 0],
    [2, 1],
  ], // bottom edge, left  ← the NEXT one (answer D)
]
// The visible stem shows the first three frames; the fourth is the unknown "?".
export const STEM_FRAMES = SEQUENCE.slice(0, 3)
export const NEXT_FRAME = SEQUENCE[3]

// The four answer options. D is the correct continuation; the distractors are
// other border dominoes that do NOT continue the clockwise sweep.
export const OPTIONS: Record<'A' | 'B' | 'C' | 'D', Cell[]> = {
  A: [
    [0, 0],
    [0, 1],
  ], // top edge, left — would jump backwards
  B: [
    [1, 0],
    [2, 0],
  ], // left edge, lower — wrong side
  C: [
    [0, 2],
    [1, 2],
  ], // right edge, upper — already passed
  D: [
    [2, 0],
    [2, 1],
  ], // bottom edge, left — the correct next frame
}
export const ANSWER: 'A' | 'B' | 'C' | 'D' = 'D'

function cellKey(c: Cell) {
  return `${c[0]}-${c[1]}`
}

export interface SequenceGridProps {
  /** Shaded cells. */
  shaded: Cell[]
  /** Render a "?" overlay instead of any shading (unknown frame). */
  unknown?: boolean
  /** Pixel size of the whole grid square. */
  size?: number
  /** Outline the grid in an accent colour (used to mark the chosen option). */
  accent?: string
}

/** A single 3×3 grid with the given cells shaded amber. */
export function SequenceGrid({ shaded, unknown = false, size = 96, accent }: SequenceGridProps) {
  const cell = size / 3
  const on = new Set(shaded.map(cellKey))
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {/* shaded cells */}
      {!unknown &&
        [0, 1, 2].map((r) =>
          [0, 1, 2].map((c) =>
            on.has(`${r}-${c}`) ? (
              <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill={AMBER} stroke={AMBER_EDGE} strokeWidth={1} />
            ) : null,
          ),
        )}
      {/* grid lines */}
      {[0, 1, 2, 3].map((i) => (
        <line key={`v${i}`} x1={i * cell} y1={0} x2={i * cell} y2={size} stroke={GRID} strokeWidth={1.5} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <line key={`h${i}`} x1={0} y1={i * cell} x2={size} y2={i * cell} stroke={GRID} strokeWidth={1.5} />
      ))}
      {/* outer accent outline (chosen option) */}
      {accent && <rect x={1} y={1} width={size - 2} height={size - 2} fill="none" stroke={accent} strokeWidth={3} />}
      {/* unknown overlay */}
      {unknown && (
        <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central" fontSize={size * 0.5} fontWeight={900} fill="#9CA3AF">
          ?
        </text>
      )}
    </svg>
  )
}

const GAP = 26
const CELL = 96
const ARROW_W = 18

/** The stem: the visible frames followed by an arrow into a "?" box. */
export function SequenceStrip({ size = CELL }: { size?: number }) {
  const frames = STEM_FRAMES
  const n = frames.length + 1 // + the unknown box
  const stepW = size + GAP
  const totalW = n * size + (n - 1) * GAP
  const VH = size + 24
  return (
    <svg
      viewBox={`0 0 ${totalW + 8} ${VH}`}
      width="100%"
      style={{ maxWidth: totalW + 8, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {frames.map((f, i) => (
        <g key={i} transform={`translate(${4 + i * stepW}, 12)`}>
          <SequenceGrid shaded={f} size={size} />
        </g>
      ))}
      {/* unknown frame at the end */}
      <g transform={`translate(${4 + frames.length * stepW}, 12)`}>
        <SequenceGrid shaded={[]} unknown size={size} />
      </g>
      {/* arrows between frames (in the gaps) */}
      {Array.from({ length: n - 1 }).map((_, i) => {
        const ax = 4 + i * stepW + size + (GAP - ARROW_W) / 2
        const ay = 12 + size / 2
        return (
          <g key={`a${i}`}>
            <line x1={ax} y1={ay} x2={ax + ARROW_W - 5} y2={ay} stroke={INK} strokeWidth={2} />
            <polygon points={`${ax + ARROW_W},${ay} ${ax + ARROW_W - 6},${ay - 4} ${ax + ARROW_W - 6},${ay + 4}`} fill={INK} />
          </g>
        )
      })}
    </svg>
  )
}

export default function P21G3Q14Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A sequence of 3 by 3 grids; a shaded pair of cells sweeps clockwise around the border. The last grid is unknown."
    >
      <SequenceStrip />
    </div>
  )
}
