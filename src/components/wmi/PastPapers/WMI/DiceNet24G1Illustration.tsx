/**
 * DiceNet24G1Illustration — WMI-24F1A-Q5 (2024 Grade 1 Final)
 *
 * "Fold the net along the dotted lines to make a cube. Find the sum of the
 * differences between the numbers of dots on the three pairs of opposite faces."
 *
 * The source figure is a 6-face hexomino net (staircase shape, NOT a symmetric
 * cross) on a 4-column × 3-row grid. Each face carries a dot count (its "pips"),
 * drawn as filled circles exactly as recovered from the scan:
 *
 *   col:    0    1    2    3
 *   row 0:  .    .    9    .
 *   row 1:  .    6    2    4
 *   row 2:  1    3    .    .
 *
 * Folding the net into a cube gives three opposite-face pairs:
 *   9 ↔ 3  → |9 − 3| = 6
 *   6 ↔ 4  → |6 − 4| = 2
 *   1 ↔ 2  → |1 − 2| = 1
 *   sum of differences = 6 + 2 + 1 = 9  (answer E)
 *
 * The static figure draws ONLY the problem: the six pip-faces in their net
 * layout, joined by dotted fold lines. It NEVER marks which faces are opposite
 * or reveals the answer — that is the animator's job (via `litPair`).
 *
 * Pure render — no Math.random, no Date, no side effects. SSR-safe & deterministic.
 */

// ---------------------------------------------------------------------------
// Data: the net as recovered from the scan
// ---------------------------------------------------------------------------

export interface NetFace {
  /** grid row, 0 = top */
  row: number
  /** grid col, 0 = left */
  col: number
  /** number of dots (pips) on this face */
  pips: number
  /** stable id 0..5, used by the animator to address faces / pairs */
  id: number
}

/**
 * The six faces, in reading order. Ids are stable so the animator can key off
 * them. The three opposite-face pairs (see OPPOSITE_PAIRS) share an index.
 */
export const NET_FACES: NetFace[] = [
  { id: 0, row: 0, col: 2, pips: 9 },
  { id: 1, row: 1, col: 1, pips: 6 },
  { id: 2, row: 1, col: 2, pips: 2 },
  { id: 3, row: 1, col: 3, pips: 4 },
  { id: 4, row: 2, col: 0, pips: 1 },
  { id: 5, row: 2, col: 1, pips: 3 },
]

/**
 * The three opposite-face pairs after folding, by face id. Each entry also
 * carries the absolute difference of its pips. Used ONLY by the animator —
 * the static default export never consults this.
 *   pair 0:  9 (id0) ↔ 3 (id5)  → 6
 *   pair 1:  6 (id1) ↔ 4 (id3)  → 2
 *   pair 2:  2 (id2) ↔ 1 (id4)  → 1
 */
export const OPPOSITE_PAIRS: { a: number; b: number; diff: number }[] = [
  { a: 0, b: 5, diff: 6 },
  { a: 1, b: 3, diff: 2 },
  { a: 2, b: 4, diff: 1 },
]

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

/** Face side length in SVG units. */
export const CELL = 54
/** Frame stroke width. */
const BORDER_W = 1.6
/** Pip (dot) radius. */
const PIP_R = 4.4

// Source colours (qupu tokens; raw hex permitted per the brief).
const FACE_FILL = '#FFF2DF' // qupu-cream
const FACE_STROKE = '#30598A' // qupu-brand-blue
const FOLD_STROKE = '#30598A' // qupu-brand-blue (dotted interior fold lines)
const PIP_FILL = '#263B55' // qupu-brand-blue-shadow (near-black dots)
const LIT_FILL = '#FFD3B1' // qupu-peach (animator highlight tint)
const LIT_STROKE = '#f0853a' // qupu-brand-orange
const LIT_PIP = '#30598A' // qupu-brand-blue

// ---------------------------------------------------------------------------
// Pip placement — dot patterns for each count 1..9, on a unit (0..1) grid.
// ---------------------------------------------------------------------------

const PIP_LAYOUTS: Record<number, [number, number][]> = {
  1: [[0.5, 0.5]],
  2: [
    [0.3, 0.3],
    [0.7, 0.7],
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
  // 7..9 use a 3-column grid so high counts still read cleanly.
  7: [
    [0.27, 0.27],
    [0.5, 0.27],
    [0.73, 0.27],
    [0.5, 0.5],
    [0.27, 0.73],
    [0.5, 0.73],
    [0.73, 0.73],
  ],
  8: [
    [0.27, 0.27],
    [0.5, 0.27],
    [0.73, 0.27],
    [0.27, 0.5],
    [0.73, 0.5],
    [0.27, 0.73],
    [0.5, 0.73],
    [0.73, 0.73],
  ],
  9: [
    [0.27, 0.27],
    [0.5, 0.27],
    [0.73, 0.27],
    [0.27, 0.5],
    [0.5, 0.5],
    [0.73, 0.5],
    [0.27, 0.73],
    [0.5, 0.73],
    [0.73, 0.73],
  ],
}

function pipsFor(count: number): [number, number][] {
  return PIP_LAYOUTS[count] ?? PIP_LAYOUTS[1]
}

// ---------------------------------------------------------------------------
// DiceNet24G1 — primitive shared with the animator.
// ---------------------------------------------------------------------------

export interface DiceNet24G1Props {
  /**
   * Index into OPPOSITE_PAIRS (0,1,2) to highlight that opposite-face pair, or
   * null/undefined for the bare net (default). The static problem figure passes
   * nothing, so no answer ever leaks.
   */
  litPair?: number | null
  /**
   * When true, render a small folded-cube glyph beside the net (used by the
   * animator after the answer to show the faces meeting). Default false.
   */
  showFolded?: boolean
  /** Face size override. */
  cell?: number
}

/** Draws a single net face: frame + its pips, optionally lit. */
function Face({ face, cell, lit }: { face: NetFace; cell: number; lit: boolean }) {
  const x = face.col * cell
  const y = face.row * cell
  const fill = lit ? LIT_FILL : FACE_FILL
  const stroke = lit ? LIT_STROKE : FACE_STROKE
  const pipColor = lit ? LIT_PIP : PIP_FILL
  const r = (PIP_R / 54) * cell
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
      {pipsFor(face.pips).map(([ux, uy], i) => (
        <circle key={i} cx={x + ux * cell} cy={y + uy * cell} r={r} fill={pipColor} />
      ))}
    </g>
  )
}

/**
 * Interior fold lines: dotted segments between edge-adjacent faces, matching the
 * "fold along the dotted lines" wording. Derived from the face layout so the
 * net's shared edges read as creases.
 */
function FoldLines({ faces, cell }: { faces: NetFace[]; cell: number }) {
  const present = new Set(faces.map((f) => `${f.row},${f.col}`))
  const segs: { x1: number; y1: number; x2: number; y2: number }[] = []
  for (const f of faces) {
    const right = `${f.row},${f.col + 1}`
    const below = `${f.row + 1},${f.col}`
    if (present.has(right)) {
      const x = (f.col + 1) * cell
      segs.push({ x1: x, y1: f.row * cell, x2: x, y2: (f.row + 1) * cell })
    }
    if (present.has(below)) {
      const y = (f.row + 1) * cell
      segs.push({ x1: f.col * cell, y1: y, x2: (f.col + 1) * cell, y2: y })
    }
  }
  return (
    <g>
      {segs.map((s, i) => (
        <line
          key={i}
          x1={s.x1}
          y1={s.y1}
          x2={s.x2}
          y2={s.y2}
          stroke={FOLD_STROKE}
          strokeWidth={1.4}
          strokeDasharray="3 3"
        />
      ))}
    </g>
  )
}

/** A tiny isometric cube glyph, for the animator's post-answer "folded" view. */
function FoldedCube({ x, y, s }: { x: number; y: number; s: number }) {
  // simple 3-face isometric box
  const top = `${x},${y + s * 0.3} ${x + s * 0.5},${y} ${x + s},${y + s * 0.3} ${x + s * 0.5},${y + s * 0.6}`
  const left = `${x},${y + s * 0.3} ${x + s * 0.5},${y + s * 0.6} ${x + s * 0.5},${y + s * 1.1} ${x},${y + s * 0.8}`
  const right = `${x + s},${y + s * 0.3} ${x + s * 0.5},${y + s * 0.6} ${x + s * 0.5},${y + s * 1.1} ${x + s},${y + s * 0.8}`
  return (
    <g>
      <polygon points={top} fill="#FFD3B1" stroke={FACE_STROKE} strokeWidth={1.4} />
      <polygon points={left} fill="#FFF2DF" stroke={FACE_STROKE} strokeWidth={1.4} />
      <polygon points={right} fill="#FFE9D2" stroke={FACE_STROKE} strokeWidth={1.4} />
    </g>
  )
}

export function DiceNet24G1({ litPair = null, showFolded = false, cell = CELL }: DiceNet24G1Props) {
  const litIds = new Set<number>()
  if (litPair != null && OPPOSITE_PAIRS[litPair]) {
    litIds.add(OPPOSITE_PAIRS[litPair].a)
    litIds.add(OPPOSITE_PAIRS[litPair].b)
  }
  return (
    <g>
      <FoldLines faces={NET_FACES} cell={cell} />
      {NET_FACES.map((face) => (
        <Face key={face.id} face={face} cell={cell} lit={litIds.has(face.id)} />
      ))}
      {showFolded && <FoldedCube x={4 * cell + cell * 0.4} y={cell * 0.4} s={cell * 1.1} />}
    </g>
  )
}

// ---------------------------------------------------------------------------
// Default export — the bare problem net.
// ---------------------------------------------------------------------------

// Grid spans cols 0–3 (4 wide) and rows 0–2 (3 tall). Pad so frames + lit
// strokes never clip at the edges.
const PAD = 10
const GRID_COLS = 4
const GRID_ROWS = 3
const VIEW_W = GRID_COLS * CELL + PAD * 2
const VIEW_H = GRID_ROWS * CELL + PAD * 2
const DISPLAY_W = Math.min(280, VIEW_W)

export default function DiceNet24G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Jaring kubus berbentuk tangga dengan enam sisi dadu, dihubungkan garis lipat putus-putus. Jumlah titik tiap sisi: sisi atas 9, lalu sebaris tiga sisi 6, 2, dan 4, lalu di bawahnya 1 dan 3. Lipat jaring menjadi kubus, lalu cari jumlah selisih titik pada tiga pasang sisi yang berhadapan."
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width={DISPLAY_W}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <g transform={`translate(${PAD}, ${PAD})`}>
          <DiceNet24G1 />
        </g>
      </svg>
    </div>
  )
}
