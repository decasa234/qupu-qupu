// "Link four dots into a square" for WMI-19F3A-Q19.
// Reconstructed from db/seed/wmi/figures/2019-final-g3-a-q19.jpg: a 5×5 dot
// lattice with the four CORNERS and the CENTER removed (20 dots).
// Squares (axis-aligned AND tilted) with all four corners present total 29 —
// enumerated below, never asserted.

export const DS_N = 5
const MISSING = new Set(['0,0', '4,0', '0,4', '4,4', '2,2'])
export const DOTS: ReadonlyArray<[number, number]> = (() => {
  const out: Array<[number, number]> = []
  for (let y = 0; y < DS_N; y++) for (let x = 0; x < DS_N; x++) if (!MISSING.has(`${x},${y}`)) out.push([x, y])
  return out
})()

export interface DotSquare {
  corners: Array<[number, number]>
  /** Bounding-box size s and tilt t (t = 0 → axis-aligned). */
  s: number
  t: number
}

const present = (x: number, y: number) => x >= 0 && y >= 0 && x < DS_N && y < DS_N && !MISSING.has(`${x},${y}`)

/** Every square whose four corners are all drawn dots. */
export function allDotSquares(): DotSquare[] {
  const out: DotSquare[] = []
  for (let s = 1; s < DS_N; s++) {
    for (let t = 0; t < s; t++) {
      for (let x = 0; x + s < DS_N; x++) {
        for (let y = 0; y + s < DS_N; y++) {
          const c: Array<[number, number]> = [
            [x + t, y],
            [x + s, y + t],
            [x + s - t, y + s],
            [x, y + s - t],
          ]
          if (c.every(([cx, cy]) => present(cx, cy))) out.push({ corners: c, s, t })
        }
      }
    }
  }
  return out
}

export const DOT_SQUARES = allDotSquares()
export const DS_TOTAL = DOT_SQUARES.length // 29

/** Squares grouped into kid-friendly classes for the counting story. */
export const DS_CLASSES: ReadonlyArray<{ key: string; squares: DotSquare[] }> = [
  { key: 'unit', squares: DOT_SQUARES.filter((q) => q.s === 1) }, // small straight (8)
  { key: 'two', squares: DOT_SQUARES.filter((q) => q.s === 2 && q.t === 0) }, // 2×2 straight (5)
  { key: 'bigAxis', squares: DOT_SQUARES.filter((q) => q.s >= 3 && q.t === 0) }, // 3×3 / 4×4 (0!)
  { key: 'diamond', squares: DOT_SQUARES.filter((q) => q.s === 2 && q.t === 1) }, // small diamonds (5)
  { key: 'slant3', squares: DOT_SQUARES.filter((q) => q.s === 3 && q.t > 0) }, // slanted, size 3 (8)
  { key: 'slant4', squares: DOT_SQUARES.filter((q) => q.s === 4 && q.t > 0) }, // big slanted (3)
]

export const DS_VIEW = 260
const PAD = 30
const CELL = (DS_VIEW - PAD * 2) / (DS_N - 1)
const gx = (x: number) => PAD + x * CELL
const gy = (y: number) => PAD + y * CELL

const INK = '#1F2937'
const COLORS = ['#2563EB', '#7C3AED', '#DC2626', '#D97706', '#059669', '#DB2777']

export interface DotSquaresFigureProps {
  /** Index into DS_CLASSES to outline, or null for dots only. */
  highlightClass?: number | null
  /** Show only the first `upto` squares of the class (the latest one bold). Omit for all. */
  upto?: number
}

export function DotSquaresFigure({ highlightClass = null, upto }: DotSquaresFigureProps) {
  const cls = highlightClass != null ? DS_CLASSES[highlightClass] : null
  const shown = cls ? (upto != null ? cls.squares.slice(0, upto) : cls.squares) : []
  const lastIdx = upto != null ? shown.length - 1 : -1
  return (
    <svg viewBox={`0 0 ${DS_VIEW} ${DS_VIEW}`} width="100%" style={{ maxWidth: 270, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {shown.map((q, i) => (
        <polygon
          key={i}
          points={q.corners.map(([x, y]) => `${gx(x)},${gy(y)}`).join(' ')}
          fill={i === lastIdx ? 'rgba(37,99,235,0.12)' : 'none'}
          stroke={COLORS[(highlightClass ?? 0) % COLORS.length]}
          strokeWidth={i === lastIdx ? 3.2 : 1.8}
          opacity={i === lastIdx ? 1 : 0.4}
        />
      ))}
      {DOTS.map(([x, y]) => (
        <circle key={`${x},${y}`} cx={gx(x)} cy={gy(y)} r={5} fill={INK} />
      ))}
    </svg>
  )
}

export default function DotSquaresG3Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`Twenty dots: a five-by-five grid missing its four corners and centre. Linking any four dots into squares (straight or tilted) gives ${DS_TOTAL} squares in total.`}
    >
      <DotSquaresFigure />
    </div>
  )
}
