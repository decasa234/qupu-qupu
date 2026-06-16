// Illustration for WMI-24F3A-Q24 (2024 Grade-3 Final) — the rabbit jump-grid.
//
// A 5×5 grid of dirt tiles. Eight stones are labelled A–H, the rabbit starts in
// the bottom-left tile, and a carrot sits in the top-right tile. The rabbit may
// only skip *forward* over a stone in a straight line (horizontal, vertical, or
// diagonal), landing on the empty tile beyond. It must clear every stone once
// and finish at the carrot. The single full path is E, F, H, G, B, A, C, D, so
// the visit order of A,C,E,G is 6,7,1,4 → ACEG = 6714.
//
// Grid read from the scan, using (row, col) with row 0 = top, col 0 = left:
//   row 0: A at col 1; carrot at col 4
//   row 1: B at col 1; C at col 3; D at col 4
//   row 2: (empty)
//   row 3: E at col 0; F at col 1; G at col 3
//   row 4: rabbit start at col 0; H at col 3
//
// Data + a render primitive are exported so the explainer binds to the same
// values (the anti-drift glue). The static figure shows ONLY the setup — never
// the jump path or the answer.

const INK = '#1F2937'

/** Grid dimensions (5×5). */
export const GRID24G3 = { rows: 5, cols: 5 } as const

/** Labelled stone positions, keyed A–H, as [row, col] (row 0 = top, col 0 = left). */
export const STONES_24G3: Record<string, [number, number]> = {
  A: [0, 1],
  B: [1, 1],
  C: [1, 3],
  D: [1, 4],
  E: [3, 0],
  F: [3, 1],
  G: [3, 3],
  H: [4, 3],
}

/** Where the rabbit begins (bottom-left). */
export const RABBIT_START_24G3: [number, number] = [4, 0]

/** Where the carrot sits (top-right). */
export const CARROT_24G3: [number, number] = [0, 4]

/**
 * The single full jump path, as the order in which stones are skipped.
 * The rabbit jumps over each stone, landing on the empty tile beyond; the last
 * jump (over D) lands on the carrot tile.
 */
export const JUMP_ORDER_24G3 = ['E', 'F', 'H', 'G', 'B', 'A', 'C', 'D'] as const

/** Visit number (1-based) of each labelled stone along the path. */
export const VISIT_ORDER_24G3: Record<string, number> = JUMP_ORDER_24G3.reduce(
  (acc, label, i) => ({ ...acc, [label]: i + 1 }),
  {} as Record<string, number>,
)

/** The landing tile after each jump, including the start tile at index 0. */
export const PATH_TILES_24G3: Array<[number, number]> = (() => {
  const tiles: Array<[number, number]> = [RABBIT_START_24G3]
  let cur = RABBIT_START_24G3
  for (const label of JUMP_ORDER_24G3) {
    const [sr, sc] = STONES_24G3[label]
    const [cr, cc] = cur
    const land: [number, number] = [sr + (sr - cr), sc + (sc - cc)]
    tiles.push(land)
    cur = land
  }
  return tiles
})()

/** The 4-digit answer: visit numbers of A, C, E, G concatenated → 6714. */
export const ACEG_24G3 = `${VISIT_ORDER_24G3.A}${VISIT_ORDER_24G3.C}${VISIT_ORDER_24G3.E}${VISIT_ORDER_24G3.G}`

const CELL = 56
const PAD = 12

const cx = (col: number) => PAD + col * CELL + CELL / 2
const cy = (row: number) => PAD + row * CELL + CELL / 2

/** A drawn stone glyph (rounded grey mound) with its label letter. */
function Stone({ row, col, label, lit }: { row: number; col: number; label: string; lit?: boolean }) {
  const x = cx(col)
  const y = cy(row)
  return (
    <g>
      {/* mound base */}
      <path
        d={`M ${x - 19} ${y + 13} Q ${x - 22} ${y + 1} ${x - 12} ${y - 1} Q ${x - 9} ${y - 11} ${x + 2} ${y - 8} Q ${x + 14} ${y - 12} ${x + 16} ${y - 1} Q ${x + 23} ${y + 1} ${x + 19} ${y + 13} Z`}
        fill="#C7CDD6"
        stroke="#8A929E"
        strokeWidth={1.4}
      />
      {/* label disc */}
      <circle cx={x} cy={y - 8} r={11.5} fill="#FFFFFF" stroke={lit ? '#f0853a' : '#8A929E'} strokeWidth={lit ? 2.6 : 1.6} />
      <text x={x} y={y - 7} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={900} fill={INK} className="font-display">
        {label}
      </text>
    </g>
  )
}

/** A drawn rabbit (head + ears) seated on its tile. */
function Rabbit({ row, col }: { row: number; col: number }) {
  const x = cx(col)
  const y = cy(row)
  return (
    <g>
      {/* ears */}
      <ellipse cx={x - 6} cy={y - 16} rx={4} ry={11} fill="#FFFFFF" stroke="#8A929E" strokeWidth={1.4} />
      <ellipse cx={x + 6} cy={y - 16} rx={4} ry={11} fill="#FFFFFF" stroke="#8A929E" strokeWidth={1.4} />
      <ellipse cx={x - 6} cy={y - 16} rx={1.8} ry={6} fill="#FFD3B1" />
      <ellipse cx={x + 6} cy={y - 16} rx={1.8} ry={6} fill="#FFD3B1" />
      {/* head */}
      <circle cx={x} cy={y + 1} r={13} fill="#FFFFFF" stroke="#8A929E" strokeWidth={1.4} />
      {/* eyes + nose */}
      <circle cx={x - 4.5} cy={y - 1} r={1.6} fill={INK} />
      <circle cx={x + 4.5} cy={y - 1} r={1.6} fill={INK} />
      <path d={`M ${x - 3} ${y + 4} Q ${x} ${y + 7} ${x + 3} ${y + 4}`} fill="none" stroke={INK} strokeWidth={1.3} strokeLinecap="round" />
      <circle cx={x} cy={y + 3.5} r={1.6} fill="#f0853a" />
    </g>
  )
}

/** A drawn carrot (orange tapering body + green tops) on its tile. */
function Carrot({ row, col }: { row: number; col: number }) {
  const x = cx(col)
  const y = cy(row)
  return (
    <g>
      {/* leaves */}
      <path d={`M ${x} ${y - 8} L ${x - 7} ${y - 18}`} stroke="#3F8F4F" strokeWidth={3} strokeLinecap="round" />
      <path d={`M ${x} ${y - 8} L ${x} ${y - 20}`} stroke="#3F8F4F" strokeWidth={3} strokeLinecap="round" />
      <path d={`M ${x} ${y - 8} L ${x + 7} ${y - 18}`} stroke="#3F8F4F" strokeWidth={3} strokeLinecap="round" />
      {/* body */}
      <path d={`M ${x - 8} ${y - 8} L ${x + 8} ${y - 8} L ${x} ${y + 15} Z`} fill="#f0853a" stroke="#C2611F" strokeWidth={1.4} strokeLinejoin="round" />
      {/* ridges */}
      <line x1={x - 4} y1={y - 4} x2={x - 2.5} y2={y - 1} stroke="#C2611F" strokeWidth={1} strokeLinecap="round" />
      <line x1={x + 3} y1={y - 3} x2={x + 1.5} y2={y} stroke="#C2611F" strokeWidth={1} strokeLinecap="round" />
    </g>
  )
}

/**
 * The render primitive. The static problem figure passes nothing. The explainer
 * may pass `litStone` to outline the stone being discussed, or `pathUpto` to
 * trace the jump path up to a given step (the post-answer reveal only).
 */
export function RabbitGridFigure({ litStone, pathUpto }: { litStone?: string | null; pathUpto?: number }) {
  const width = PAD * 2 + GRID24G3.cols * CELL
  const height = PAD * 2 + GRID24G3.rows * CELL
  const upto = pathUpto ?? -1
  const trail = upto >= 0 ? PATH_TILES_24G3.slice(0, Math.min(PATH_TILES_24G3.length, upto + 1)) : []
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* dirt tiles */}
      {Array.from({ length: GRID24G3.rows }, (_, r) =>
        Array.from({ length: GRID24G3.cols }, (__, c) => (
          <rect
            key={`${r}-${c}`}
            x={PAD + c * CELL}
            y={PAD + r * CELL}
            width={CELL}
            height={CELL}
            className="fill-qupu-peach"
            stroke="#B97A4A"
            strokeWidth={2}
          />
        )),
      )}

      {/* optional jump trail (reveal only) */}
      {trail.length > 1 && (
        <polyline
          points={trail.map(([r, c]) => `${cx(c)},${cy(r)}`).join(' ')}
          fill="none"
          stroke="#f0853a"
          strokeWidth={6}
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={0.55}
        />
      )}

      {/* carrot + stones + rabbit */}
      <Carrot row={CARROT_24G3[0]} col={CARROT_24G3[1]} />
      {Object.entries(STONES_24G3).map(([label, [r, c]]) => (
        <Stone key={label} row={r} col={c} label={label} lit={litStone === label} />
      ))}
      <Rabbit row={RABBIT_START_24G3[0]} col={RABBIT_START_24G3[1]} />
    </svg>
  )
}

const ARIA =
  'Kisi 5 kali 5 berisi ubin tanah. Delapan batu berlabel A sampai H tersebar di kisi: ' +
  'A dan B di kolom kedua bagian atas, C dan G di kolom keempat, D di pojok kanan baris kedua, ' +
  'E dan F di baris keempat sebelah kiri, dan H di baris bawah. Kelinci mulai di ubin kiri bawah ' +
  'dan wortel berada di ubin kanan atas. Kelinci melompat maju melewati batu secara lurus.'

export function RabbitGrid24G3Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <RabbitGridFigure />
    </div>
  )
}

export default RabbitGrid24G3Illustration
