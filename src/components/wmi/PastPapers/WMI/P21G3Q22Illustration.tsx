/**
 * P21G3Q22Illustration — WMI-21P3A-Q22 (2021 Grade 3 Semifinal, Paper A)
 *
 * "An unfolded die (its net) is shown below. Suppose the sum of the numbers on
 *  the two opposite faces is 7. Which option below is correct?"
 *
 * Source figure (db/seed/wmi/figures/2021-semifinal-g3-a-q22.jpg): a 6-square
 * hexomino net laid on a 4-col × 3-row grid. Three faces carry pips, three are
 * blank, and a red ★ marks ONE blank face (the one whose value the options ask
 * about). Reading the scan edge-by-edge:
 *
 *   col:   0      1       2       3
 *   r0:    .      .       [2]     [4]
 *   r1:    .      [★]     [1]     .
 *   r2:    [_]    [_]     .       .
 *
 * The ★ sits on the blank face at (r1,c1). Faces with pips: 2 at (r0,c2),
 * 4 at (r0,c3), 1 at (r1,c2). The other two blanks are (r2,c0) and (r2,c1).
 *
 * The static figure draws ONLY the problem — the net with its given pips and the
 * ★ on its blank face. It NEVER fills the ★ face or marks opposite pairs; that
 * is the explainer's job (folding shows ★ is opposite the 4, so ★ = 7 − 4 = 3,
 * answer B).
 *
 * Pure render — no Math.random, no Date, no window/document. SSR-safe & deterministic.
 */

// ---------------------------------------------------------------------------
// Net data, recovered from the scan
// ---------------------------------------------------------------------------

export interface Q22Face {
  /** grid row, 0 = top */
  row: number
  /** grid col, 0 = left */
  col: number
  /** pip count, or null for a blank face */
  pips: number | null
  /** true for the ★-marked face (the one the options ask about) */
  star?: boolean
  /** stable id 0..5 so the explainer can address faces */
  id: number
}

export const Q22_FACES: Q22Face[] = [
  { id: 0, row: 0, col: 2, pips: 2 },
  { id: 1, row: 0, col: 3, pips: 4 },
  { id: 2, row: 1, col: 1, pips: null, star: true },
  { id: 3, row: 1, col: 2, pips: 1 },
  { id: 4, row: 2, col: 0, pips: null },
  { id: 5, row: 2, col: 1, pips: null },
]

/**
 * Opposite-face pairs after folding (face id ↔ face id), verified by a cube-fold
 * of the net. Used ONLY by the explainer.
 *   ★ (id2) ↔ 4 (id1)   → ★ = 7 − 4 = 3
 *   blank (id4) ↔ 1 (id3) → 6
 *   blank (id5) ↔ 2 (id0) → 5
 */
export const Q22_OPPOSITE: { a: number; b: number }[] = [
  { a: 2, b: 1 },
  { a: 4, b: 3 },
  { a: 5, b: 0 },
]

/** The number that belongs on the ★ face (7 − 4). The answer option is B. */
export const Q22_STAR_VALUE = 3
export const Q22_ANSWER = 'B'

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export const Q22_CELL = 56
const BORDER_W = 2
const PIP_R = 5

// qupu tokens (raw hex echoes permitted per the brief)
const FACE_FILL = '#FFF2DF' // qupu-cream
const FACE_STROKE = '#30598A' // qupu-brand-blue
const FOLD_STROKE = '#30598A'
const PIP_FILL = '#263B55'
const STAR_FILL = '#E23B3B' // bright red star (matches the scan)
const STAR_STROKE = '#B11E1E'
const LIT_FILL = '#FFD3B1' // qupu-peach (explainer highlight)
const LIT_STROKE = '#f0853a' // qupu-brand-orange

// Dot patterns on a unit (0..1) face.
const PIP_LAYOUTS: Record<number, [number, number][]> = {
  1: [[0.5, 0.5]],
  2: [
    [0.32, 0.32],
    [0.68, 0.68],
  ],
  3: [
    [0.28, 0.28],
    [0.5, 0.5],
    [0.72, 0.72],
  ],
  4: [
    [0.32, 0.32],
    [0.68, 0.32],
    [0.32, 0.68],
    [0.68, 0.68],
  ],
  5: [
    [0.3, 0.3],
    [0.7, 0.3],
    [0.5, 0.5],
    [0.3, 0.7],
    [0.7, 0.7],
  ],
  6: [
    [0.32, 0.27],
    [0.68, 0.27],
    [0.32, 0.5],
    [0.68, 0.5],
    [0.32, 0.73],
    [0.68, 0.73],
  ],
}

function pipsFor(count: number): [number, number][] {
  return PIP_LAYOUTS[count] ?? PIP_LAYOUTS[1]
}

/** A small 5-point star centred at (cx, cy) with outer radius r. */
function StarGlyph({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 5
    const rad = i % 2 === 0 ? r : r * 0.42
    pts.push(`${(cx + rad * Math.cos(ang)).toFixed(2)},${(cy + rad * Math.sin(ang)).toFixed(2)}`)
  }
  return <polygon points={pts.join(' ')} fill={STAR_FILL} stroke={STAR_STROKE} strokeWidth={1} strokeLinejoin="round" />
}

// ---------------------------------------------------------------------------
// DiceNetP21G3Q22 — primitive shared with the explainer
// ---------------------------------------------------------------------------

export interface DiceNetP21G3Q22Props {
  /**
   * Index into Q22_OPPOSITE to highlight that opposite-face pair (peach tint),
   * or null/undefined for none. The static figure passes nothing.
   */
  litPair?: number | null
  /** When set, fill the ★ face with this pip count (explainer reveal). */
  revealStarPips?: number | null
  cell?: number
}

function Face({
  face,
  cell,
  lit,
  revealStarPips,
}: {
  face: Q22Face
  cell: number
  lit: boolean
  revealStarPips: number | null
}) {
  const x = face.col * cell
  const y = face.row * cell
  const fill = lit ? LIT_FILL : FACE_FILL
  const stroke = lit ? LIT_STROKE : FACE_STROKE
  const r = (PIP_R / 56) * cell
  // What to draw inside: a star (problem), revealed pips (explainer), or fixed pips.
  const showStar = face.star && (revealStarPips == null || revealStarPips <= 0)
  const pipCount = face.star ? (revealStarPips && revealStarPips > 0 ? revealStarPips : null) : face.pips
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={cell}
        height={cell}
        fill={fill}
        stroke={stroke}
        strokeWidth={lit ? BORDER_W + 0.8 : BORDER_W}
      />
      {showStar && <StarGlyph cx={x + cell / 2} cy={y + cell / 2} r={cell * 0.26} />}
      {pipCount != null &&
        pipsFor(pipCount).map(([ux, uy], i) => (
          <circle key={i} cx={x + ux * cell} cy={y + uy * cell} r={r} fill={PIP_FILL} />
        ))}
    </g>
  )
}

function FoldLines({ faces, cell }: { faces: Q22Face[]; cell: number }) {
  const present = new Set(faces.map((f) => `${f.row},${f.col}`))
  const segs: { x1: number; y1: number; x2: number; y2: number }[] = []
  for (const f of faces) {
    if (present.has(`${f.row},${f.col + 1}`)) {
      const x = (f.col + 1) * cell
      segs.push({ x1: x, y1: f.row * cell, x2: x, y2: (f.row + 1) * cell })
    }
    if (present.has(`${f.row + 1},${f.col}`)) {
      const y = (f.row + 1) * cell
      segs.push({ x1: f.col * cell, y1: y, x2: (f.col + 1) * cell, y2: y })
    }
  }
  return (
    <g>
      {segs.map((s, i) => (
        <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={FOLD_STROKE} strokeWidth={1.4} strokeDasharray="3 3" />
      ))}
    </g>
  )
}

export function DiceNetP21G3Q22({ litPair = null, revealStarPips = null, cell = Q22_CELL }: DiceNetP21G3Q22Props) {
  const litIds = new Set<number>()
  if (litPair != null && Q22_OPPOSITE[litPair]) {
    litIds.add(Q22_OPPOSITE[litPair].a)
    litIds.add(Q22_OPPOSITE[litPair].b)
  }
  return (
    <g>
      <FoldLines faces={Q22_FACES} cell={cell} />
      {Q22_FACES.map((face) => (
        <Face key={face.id} face={face} cell={cell} lit={litIds.has(face.id)} revealStarPips={revealStarPips} />
      ))}
    </g>
  )
}

// ---------------------------------------------------------------------------
// Default export — the bare problem net
// ---------------------------------------------------------------------------

const PAD = 12
const GRID_COLS = 4
const GRID_ROWS = 3
const VIEW_W = GRID_COLS * Q22_CELL + PAD * 2
const VIEW_H = GRID_ROWS * Q22_CELL + PAD * 2
const DISPLAY_W = Math.min(300, VIEW_W)

export default function P21G3Q22Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Jaring sebuah dadu: enam persegi yang dihubungkan garis lipat putus-putus. Tiga sisi bertitik (2, 4, dan 1) dan tiga sisi kosong; sebuah bintang merah menandai salah satu sisi kosong. Jumlah titik pada dua sisi yang berhadapan adalah 7."
    >
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={DISPLAY_W} style={{ display: 'block' }} aria-hidden="true">
        <g transform={`translate(${PAD}, ${PAD})`}>
          <DiceNetP21G3Q22 />
        </g>
      </svg>
    </div>
  )
}
