// Fruit-maze "follow the arrows" figure for WMI-20F1A-Q15.
//
// Reconstructed from the real figure
// (wmiPastPaper/2020 WMI Final G01 Paper A/images/e538d966…1df.jpg):
// a lattice of thick light blue-gray roads connecting fruit stops, a car at
// START on the left of row 2, and a strip of 8 purple arrows below.
//
// Canonical map (col, row; row 1 = top):
//   r1:           grapes(c2)  strawberry(c3)  banana(c4)
//   r2: CAR(c1)   banana(c2)  grapes(c3)      apple(c4)   strawberry(c5)
//   r3:           apple(c2)   banana(c3)      strawberry(c4)  grapes(c5)
//   r4:           strawberry(c2)  apple(c3)   banana(c4)
//
// Moves → ↑ → ↓ ← ↓ → ↓ from START (c1,r2):
//   → banana(c2,r2), ↑ grapes(c2,r1), → strawberry(c3,r1), ↓ grapes(c3,r2),
//   ← banana(c2,r2), ↓ apple(c2,r3), → banana(c3,r3), ↓ apple(c3,r4)
// ⇒ the car ends on the GREEN APPLE (answer D).

export type FruitKind = 'grapes' | 'strawberry' | 'banana' | 'apple' | 'car'
export type Dir = 'right' | 'up' | 'left' | 'down'

export interface Stop {
  c: number
  r: number
  kind: FruitKind
}

/** All stops in the maze (col 1..5, row 1..4). */
export const STOPS: ReadonlyArray<Stop> = [
  { c: 2, r: 1, kind: 'grapes' },
  { c: 3, r: 1, kind: 'strawberry' },
  { c: 4, r: 1, kind: 'banana' },
  { c: 1, r: 2, kind: 'car' },
  { c: 2, r: 2, kind: 'banana' },
  { c: 3, r: 2, kind: 'grapes' },
  { c: 4, r: 2, kind: 'apple' },
  { c: 5, r: 2, kind: 'strawberry' },
  { c: 2, r: 3, kind: 'apple' },
  { c: 3, r: 3, kind: 'banana' },
  { c: 4, r: 3, kind: 'strawberry' },
  { c: 5, r: 3, kind: 'grapes' },
  { c: 2, r: 4, kind: 'strawberry' },
  { c: 3, r: 4, kind: 'apple' },
  { c: 4, r: 4, kind: 'banana' },
]

/** The eight arrow moves, in order. */
export const MOVES: ReadonlyArray<Dir> = ['right', 'up', 'right', 'down', 'left', 'down', 'right', 'down']

const DELTA: Record<Dir, [number, number]> = {
  right: [1, 0],
  left: [-1, 0],
  up: [0, -1],
  down: [0, 1],
}

/** Stops visited, START first; PATH[i] = position after i moves (length 9). */
export const PATH: ReadonlyArray<[number, number]> = (() => {
  const cells: Array<[number, number]> = [[1, 2]]
  for (const dir of MOVES) {
    const [dc, dr] = DELTA[dir]
    const [c, r] = cells[cells.length - 1]
    cells.push([c + dc, r + dr])
  }
  return cells
})()

export function stopAt(c: number, r: number): Stop | undefined {
  return STOPS.find((s) => s.c === c && s.r === r)
}

// ---------------------------------------------------------------- layout ---

export const FM_VIEW_W = 420
export const FM_VIEW_H = 384
export const STOP_R = 26
const SX = 84 // column spacing
const SY = 78 // row spacing
const X0 = 42 // x of column 1 (centres the 5 columns in the 420 view)
const Y0 = 44 // y of row 1 (headroom above the top stop circles)

export const sx = (c: number) => X0 + (c - 1) * SX
export const sy = (r: number) => Y0 + (r - 1) * SY

const ROAD = '#B7C9D6'
const OUTLINE = '#1F2937'
const TRAIL = '#F59E0B'
const ARROW_PURPLE = '#9333EA'
const CAR_BLUE = '#3B82F6'
const START_RED = '#DC2626'

// ---------------------------------------------------------------- glyphs ---

/** A single stop glyph (white outlined circle + stylized fruit), centred at (cx, cy). */
export function FruitGlyph({ kind, cx, cy, r }: { kind: FruitKind; cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#FFFFFF" stroke={OUTLINE} strokeWidth={2.5} />
      <FruitArt kind={kind} cx={cx} cy={cy} r={r} />
    </g>
  )
}

function FruitArt({ kind, cx, cy, r }: { kind: FruitKind; cx: number; cy: number; r: number }) {
  if (kind === 'grapes') {
    // Cluster of 7 small purple circles + tiny stem.
    const g = r * 0.17
    const dots: Array<[number, number]> = [
      [-0.34, -0.12],
      [0, -0.12],
      [0.34, -0.12],
      [-0.17, 0.16],
      [0.17, 0.16],
      [0, 0.44],
      [0, -0.4],
    ]
    return (
      <g>
        <line x1={cx} y1={cy - r * 0.5} x2={cx + r * 0.14} y2={cy - r * 0.78} stroke="#92400E" strokeWidth={2} strokeLinecap="round" />
        {dots.map(([dx, dy], i) => (
          <circle key={i} cx={cx + dx * r} cy={cy + dy * r} r={g} fill="#7C3AED" stroke="#5B21B6" strokeWidth={1} />
        ))}
      </g>
    )
  }
  if (kind === 'strawberry') {
    // Red rounded-triangle with white dots + green leaf.
    const d = [
      `M ${cx - r * 0.46} ${cy - r * 0.1}`,
      `Q ${cx} ${cy - r * 0.52} ${cx + r * 0.46} ${cy - r * 0.1}`,
      `Q ${cx + r * 0.42} ${cy + r * 0.3} ${cx} ${cy + r * 0.6}`,
      `Q ${cx - r * 0.42} ${cy + r * 0.3} ${cx - r * 0.46} ${cy - r * 0.1}`,
      'Z',
    ].join(' ')
    const dots: Array<[number, number]> = [
      [-0.2, 0.02],
      [0.2, 0.02],
      [0, 0.22],
      [-0.1, -0.16],
      [0.12, -0.16],
    ]
    const leaf = `${cx - r * 0.26},${cy - r * 0.36} ${cx},${cy - r * 0.7} ${cx + r * 0.26},${cy - r * 0.36} ${cx},${cy - r * 0.26}`
    return (
      <g>
        <path d={d} fill="#EF4444" stroke="#B91C1C" strokeWidth={1.5} />
        {dots.map(([dx, dy], i) => (
          <circle key={i} cx={cx + dx * r} cy={cy + dy * r} r={r * 0.05} fill="#FFFFFF" />
        ))}
        <polygon points={leaf} fill="#16A34A" stroke="#15803D" strokeWidth={1} strokeLinejoin="round" />
      </g>
    )
  }
  if (kind === 'banana') {
    // Yellow curved crescent.
    const d = [
      `M ${cx - r * 0.56} ${cy - r * 0.22}`,
      `Q ${cx} ${cy + r * 0.72} ${cx + r * 0.56} ${cy - r * 0.22}`,
      `Q ${cx + r * 0.4} ${cy + r * 0.18} ${cx} ${cy + r * 0.32}`,
      `Q ${cx - r * 0.4} ${cy + r * 0.18} ${cx - r * 0.56} ${cy - r * 0.22}`,
      'Z',
    ].join(' ')
    return <path d={d} fill="#FACC15" stroke="#CA8A04" strokeWidth={1.5} strokeLinejoin="round" />
  }
  if (kind === 'apple') {
    // Green circle with stem + leaf.
    return (
      <g>
        <circle cx={cx} cy={cy + r * 0.1} r={r * 0.48} fill="#84CC16" stroke="#4D7C0F" strokeWidth={1.5} />
        <line x1={cx} y1={cy - r * 0.36} x2={cx} y2={cy - r * 0.66} stroke="#92400E" strokeWidth={2} strokeLinecap="round" />
        <ellipse cx={cx + r * 0.22} cy={cy - r * 0.54} rx={r * 0.18} ry={r * 0.09} fill="#16A34A" transform={`rotate(-28 ${cx + r * 0.22} ${cy - r * 0.54})`} />
      </g>
    )
  }
  // car (with START label inside the circle, as in the source figure)
  return (
    <g>
      <CarArt cx={cx} cy={cy - r * 0.22} s={r * 0.85} />
      <text x={cx} y={cy + r * 0.52} textAnchor="middle" dominantBaseline="central" fontSize={r * 0.34} fontWeight={900} fill={START_RED}>
        START
      </text>
    </g>
  )
}

/** Small blue car silhouette, body width ≈ 1.2·s, centred at (cx, cy). */
export function CarArt({ cx, cy, s }: { cx: number; cy: number; s: number }) {
  return (
    <g>
      <rect x={cx - s * 0.32} y={cy - s * 0.34} width={s * 0.6} height={s * 0.32} rx={s * 0.12} fill={CAR_BLUE} />
      <rect x={cx - s * 0.6} y={cy - s * 0.12} width={s * 1.2} height={s * 0.38} rx={s * 0.13} fill={CAR_BLUE} />
      <circle cx={cx - s * 0.32} cy={cy + s * 0.3} r={s * 0.14} fill={OUTLINE} />
      <circle cx={cx + s * 0.32} cy={cy + s * 0.3} r={s * 0.14} fill={OUTLINE} />
      <rect x={cx - s * 0.24} y={cy - s * 0.28} width={s * 0.2} height={s * 0.18} rx={s * 0.04} fill="#DBEAFE" />
    </g>
  )
}

/** A chunky purple direction arrow, centred at (cx, cy). */
export function ArrowGlyph({ dir, cx, cy, size = 11, dim = false }: { dir: Dir; cx: number; cy: number; size?: number; dim?: boolean }) {
  const s = size
  // Right-pointing arrow around the origin, rotated per direction.
  const pts = [
    [-s, -s * 0.42],
    [s * 0.05, -s * 0.42],
    [s * 0.05, -s * 0.95],
    [s, 0],
    [s * 0.05, s * 0.95],
    [s * 0.05, s * 0.42],
    [-s, s * 0.42],
  ]
    .map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`)
    .join(' ')
  const rot = { right: 0, down: 90, left: 180, up: 270 }[dir]
  return (
    <g transform={`translate(${cx}, ${cy}) rotate(${rot})`} opacity={dim ? 0.22 : 1}>
      <polygon points={pts} fill={ARROW_PURPLE} />
    </g>
  )
}

// --------------------------------------------------------------- diagram ---

export interface MazeDiagramProps {
  /** How many of the 8 moves have been taken (0..8). Drives trail + car position. */
  visitedCount?: number
  /** Draw the highlighted trail over the first `visitedCount` moves. */
  showTrail?: boolean
}

export function MazeDiagram({ visitedCount = 0, showTrail = false }: MazeDiagramProps) {
  const n = Math.max(0, Math.min(visitedCount, MOVES.length))
  const [curC, curR] = PATH[n]

  // Roads: connect every orthogonally adjacent pair of stops.
  const roads: Array<[Stop, Stop]> = []
  for (const a of STOPS) {
    const right = stopAt(a.c + 1, a.r)
    const below = stopAt(a.c, a.r + 1)
    if (right) roads.push([a, right])
    if (below) roads.push([a, below])
  }

  const trailPoints = PATH.slice(0, n + 1)
    .map(([c, r]) => `${sx(c)},${sy(r)}`)
    .join(' ')

  // Arrow strip layout (rounded box under the maze).
  const stripY = 342
  const arrowX = (i: number) => 88 + i * 34

  return (
    <svg
      viewBox={`0 0 ${FM_VIEW_W} ${FM_VIEW_H}`}
      width="100%"
      style={{ maxWidth: 420, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* roads */}
      {roads.map(([a, b], i) => (
        <line key={`road-${i}`} x1={sx(a.c)} y1={sy(a.r)} x2={sx(b.c)} y2={sy(b.r)} stroke={ROAD} strokeWidth={16} strokeLinecap="round" />
      ))}

      {/* walked trail over the roads */}
      {showTrail && n > 0 && (
        <polyline points={trailPoints} fill="none" stroke={TRAIL} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
      )}

      {/* the little black "go" wedge next to START (as in the source figure) */}
      <polygon
        points={`${sx(1) + STOP_R + 2},${sy(2) - 7} ${sx(1) + STOP_R + 13},${sy(2)} ${sx(1) + STOP_R + 2},${sy(2) + 7}`}
        fill={OUTLINE}
      />

      {/* stops */}
      {STOPS.map((s) => (
        <FruitGlyph key={`${s.c}-${s.r}`} kind={s.kind} cx={sx(s.c)} cy={sy(s.r)} r={STOP_R} />
      ))}

      {/* current-stop highlight + relocated car badge */}
      {showTrail && n > 0 && (
        <g>
          <circle cx={sx(curC)} cy={sy(curR)} r={STOP_R + 4} fill="none" stroke={TRAIL} strokeWidth={4} />
          <g>
            <circle cx={sx(curC) + STOP_R * 0.85} cy={sy(curR) - STOP_R * 0.85} r={13} fill="#FFFFFF" stroke={TRAIL} strokeWidth={2.5} />
            <CarArt cx={sx(curC) + STOP_R * 0.85} cy={sy(curR) - STOP_R * 0.85} s={13} />
          </g>
        </g>
      )}

      {/* move strip: car, 8 arrows, ? */}
      <rect x={14} y={stripY - 26} width={FM_VIEW_W - 28} height={52} rx={14} fill="#FFFFFF" stroke="#CBD5E1" strokeWidth={2} />
      <CarArt cx={46} cy={stripY} s={18} />
      {MOVES.map((dir, i) => (
        <g key={`mv-${i}`}>
          <ArrowGlyph dir={dir} cx={arrowX(i)} cy={stripY} size={11} dim={i < n} />
          {i < n && (
            <path
              d={`M ${arrowX(i) - 5} ${stripY + 1} l 4 4 l 7 -9`}
              fill="none"
              stroke="#10B981"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </g>
      ))}
      <circle cx={FM_VIEW_W - 46} cy={stripY} r={16} fill="#FFFFFF" stroke={OUTLINE} strokeWidth={2.5} />
      {showTrail && n === MOVES.length ? (
        <FruitArt kind="apple" cx={FM_VIEW_W - 46} cy={stripY} r={16} />
      ) : (
        <text x={FM_VIEW_W - 46} y={stripY} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={900} fill={OUTLINE}>
          ?
        </text>
      )}
    </svg>
  )
}

// ---------------------------------------------------------------- example ---

/**
 * Compact "worked example" inset matching the dotted box in the source paper:
 * a mini maze (top row: apple, strawberry; bottom row: car START, banana,
 * grapes; roads form a loop) plus a strip showing car → → ↑ = strawberry.
 * Only the question-card figure renders this — the explainer does not.
 */
function ExampleInset() {
  const R = 16 // mini stop radius
  const cx = [38, 98, 158] // columns 1..3
  const yTop = 38
  const yBot = 92
  const stripY = 152
  return (
    <svg viewBox="0 0 220 184" width="100%" style={{ maxWidth: 215, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {/* dotted example border */}
      <rect x={2} y={2} width={216} height={180} rx={10} fill="#FFFFFF" stroke="#9CA3AF" strokeWidth={1.5} strokeDasharray="3 4" />
      <text x={12} y={17} fontSize={10} fontStyle="italic" fontWeight={700} fill="#6B7280">
        e.g.
      </text>

      {/* roads: loop apple—strawberry—grapes—banana—apple, plus car—banana */}
      <line x1={cx[1]} y1={yTop} x2={cx[2]} y2={yTop} stroke={ROAD} strokeWidth={10} strokeLinecap="round" />
      <line x1={cx[1]} y1={yTop} x2={cx[1]} y2={yBot} stroke={ROAD} strokeWidth={10} strokeLinecap="round" />
      <line x1={cx[2]} y1={yTop} x2={cx[2]} y2={yBot} stroke={ROAD} strokeWidth={10} strokeLinecap="round" />
      <line x1={cx[0]} y1={yBot} x2={cx[2]} y2={yBot} stroke={ROAD} strokeWidth={10} strokeLinecap="round" />

      {/* "go" wedge next to START */}
      <polygon points={`${cx[0] + R + 2},${yBot - 5} ${cx[0] + R + 10},${yBot} ${cx[0] + R + 2},${yBot + 5}`} fill={OUTLINE} />

      {/* stops */}
      <FruitGlyph kind="apple" cx={cx[1]} cy={yTop} r={R} />
      <FruitGlyph kind="strawberry" cx={cx[2]} cy={yTop} r={R} />
      <FruitGlyph kind="car" cx={cx[0]} cy={yBot} r={R} />
      <FruitGlyph kind="banana" cx={cx[1]} cy={yBot} r={R} />
      <FruitGlyph kind="grapes" cx={cx[2]} cy={yBot} r={R} />

      {/* example move strip: car → → ↑ = circled strawberry */}
      <rect x={16} y={stripY - 19} width={188} height={38} rx={11} fill="#FFFFFF" stroke="#CBD5E1" strokeWidth={1.5} />
      <CarArt cx={42} cy={stripY} s={12} />
      <ArrowGlyph dir="right" cx={74} cy={stripY} size={8} />
      <ArrowGlyph dir="right" cx={102} cy={stripY} size={8} />
      <ArrowGlyph dir="up" cx={130} cy={stripY} size={8} />
      <FruitGlyph kind="strawberry" cx={172} cy={stripY} r={13} />
    </svg>
  )
}

export default function FruitMaze20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A road maze of fruit stops. A car at START follows the arrows right, up, right, down, left, down, right, down. Which fruit does it reach?"
    >
      <ExampleInset />
      <MazeDiagram />
    </div>
  )
}
