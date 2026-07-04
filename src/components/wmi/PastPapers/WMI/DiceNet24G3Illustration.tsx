/**
 * DiceNet24G3Illustration — WMI-24F3A-Q14 (2024 Grade 3 Final, HARD)
 *
 * "Given 7 dice and an unfolded net of a die (as shown). How many of the 7
 *  dice at most can have the same unfolded view as shown?"  → answer B = 4.
 *
 * The source scan (db/seed/wmi/figures/2024-final-g3-a-q14.jpg) is a single
 * isometric die — the REFERENCE die the seven candidates are compared against.
 * Its three visible faces, read straight off the scan, are:
 *
 *   top   = 6   (two slanted columns of three pips)
 *   left  = 2   (front-left face, the diagonal two)
 *   right = 4   (front-right face, the four corners)
 *
 * A standard Western die pairs opposite faces 1↔6, 2↔5, 3↔4, so the three
 * hidden faces are bottom = 1, back-right = 3, back-left = 5. Unfolding a
 * standard cube gives the plus-shaped net drawn below: a horizontal band of
 * four side faces (3, 5, 4, 2) with the 6-cap above the 5 and the 1-cap below
 * it. The net's opposite-face pairs are 6↔1, 5↔2 and 3↔4 — exactly the
 * reference die's pairs, so the net and the die agree by construction.
 *
 * The crux of the problem (chirality: folding a net yields two mirror cubes,
 * and a candidate die only matches when both its faces AND its turning sense
 * line up) is NOT shown here — that is the animator's job, post-answer. The
 * static figure draws ONLY the problem setup: the reference die plus its
 * unfolded net. It never marks which of the seven candidates match, and the
 * five answer choices (3, 4, 5, 6, 7) are plain counts, so no CHOICE_RENDERER
 * is required.
 *
 * Pure render — no Math.random, no Date, no side effects. SSR-safe &
 * deterministic. No params: this is a single fixed paper figure.
 */

// ---------------------------------------------------------------------------
// Data — the reference die and its unfolded net.
// ---------------------------------------------------------------------------

/** The three visible faces of the reference die, exactly as in the scan. */
export const DIE_VISIBLE: { top: number; left: number; right: number } = {
  top: 6,
  left: 2,
  right: 4,
}

export interface NetFace {
  /** grid row, 0 = top */
  row: number
  /** grid col, 0 = left */
  col: number
  /** number of dots (pips) on this face */
  pips: number
  /** stable id 0..5 so an animator can address faces / pairs */
  id: number
}

/**
 * The unfolded net of the reference die, as a plus (cross) on a 3-row × 4-col
 * grid. The four side faces sit in a band (3, 5, 4, 2); the 6-cap is above the
 * 5 and the 1-cap below it. Ids are stable.
 *
 *   col:   0    1    2    3
 *   row 0:       6
 *   row 1:  3    5    4    2
 *   row 2:       1
 */
export const NET_FACES: NetFace[] = [
  { id: 0, row: 0, col: 1, pips: 6 },
  { id: 1, row: 1, col: 0, pips: 3 },
  { id: 2, row: 1, col: 1, pips: 5 },
  { id: 3, row: 1, col: 2, pips: 4 },
  { id: 4, row: 1, col: 3, pips: 2 },
  { id: 5, row: 2, col: 1, pips: 1 },
]

/**
 * The three opposite-face pairs after folding, by face id, with the sum of
 * each pair (always 7 for a standard die). Used ONLY by the animator — the
 * static default export never consults this, so no answer ever leaks.
 *   pair 0:  6 (id0) ↔ 1 (id5)
 *   pair 1:  5 (id2) ↔ 2 (id4)
 *   pair 2:  3 (id1) ↔ 4 (id3)
 */
export const OPPOSITE_PAIRS: { a: number; b: number; sum: number }[] = [
  { a: 0, b: 5, sum: 7 },
  { a: 2, b: 4, sum: 7 },
  { a: 1, b: 3, sum: 7 },
]

/** Total candidate dice the question compares against the net. */
export const DICE_COUNT = 7

// ---------------------------------------------------------------------------
// Layout + style constants (raw hex mirrors the qupu tokens, as in the
// sibling DiceNet24G1Illustration — permitted when matching a token).
// ---------------------------------------------------------------------------

/** Net face side length in SVG units. */
export const CELL = 46
/** Frame stroke width. */
const BORDER_W = 1.6
/** Pip (dot) radius, relative to CELL. */
const PIP_R = 3.8

const FACE_FILL = '#FFF2DF' // qupu-cream
const FACE_STROKE = '#30598A' // qupu-brand-blue
const FOLD_STROKE = '#30598A' // qupu-brand-blue (dotted interior fold lines)
const PIP_FILL = '#263B55' // qupu-brand-blue-shadow (near-black dots)

const DIE_TOP_FILL = '#FFD3B1' // qupu-peach (lit top face)
const DIE_LEFT_FILL = '#FFF2DF' // qupu-cream
const DIE_RIGHT_FILL = '#FFE9D2' // warm cream (between cream and peach)
const DIE_STROKE = '#30598A' // qupu-brand-blue

// ---------------------------------------------------------------------------
// Pip placement — dot patterns for each count 1..6 on a unit (0..1) square.
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
}

function pipsFor(count: number): [number, number][] {
  return PIP_LAYOUTS[count] ?? PIP_LAYOUTS[1]
}

// ---------------------------------------------------------------------------
// Primitive: a single flat net face (frame + pips), shared with the animator.
// ---------------------------------------------------------------------------

export function NetFaceCell({
  face,
  cell = CELL,
  lit = false,
}: {
  face: NetFace
  cell?: number
  lit?: boolean
}) {
  const x = face.col * cell
  const y = face.row * cell
  const r = (PIP_R / CELL) * cell
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={cell}
        height={cell}
        fill={lit ? DIE_TOP_FILL : FACE_FILL}
        stroke={lit ? '#f0853a' : FACE_STROKE}
        strokeWidth={lit ? BORDER_W + 0.8 : BORDER_W}
      />
      {pipsFor(face.pips).map(([ux, uy], i) => (
        <circle key={i} cx={x + ux * cell} cy={y + uy * cell} r={r} fill={PIP_FILL} />
      ))}
    </g>
  )
}

/**
 * Interior fold lines: dotted segments along every edge shared by two faces,
 * so the net's creases read as fold lines.
 */
function FoldLines({ faces, cell }: { faces: NetFace[]; cell: number }) {
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

/** Draws the full unfolded net (all six faces + creases) at (0,0). */
export function DiceNet24G3({ cell = CELL }: { cell?: number }) {
  return (
    <g>
      <FoldLines faces={NET_FACES} cell={cell} />
      {NET_FACES.map((face) => (
        <NetFaceCell key={face.id} face={face} cell={cell} />
      ))}
    </g>
  )
}

// ---------------------------------------------------------------------------
// Primitive: the reference die drawn in isometric 3D (top / left / right).
// ---------------------------------------------------------------------------

/**
 * Isometric die. Three visible faces are quadrilaterals; pips are placed on a
 * unit square then mapped onto each face's parallelogram so they sit on the
 * face plane. `size` is the cube edge length in SVG units; the die is drawn so
 * its left-most point sits at x=0 and its top-most at y=0.
 */
export function ReferenceDie({
  top = DIE_VISIBLE.top,
  left = DIE_VISIBLE.left,
  right = DIE_VISIBLE.right,
  size = 70,
}: {
  top?: number
  left?: number
  right?: number
  size?: number
}) {
  // Isometric projection: half-width and quarter-height offsets.
  const hw = size * 0.5 // horizontal half-step
  const qh = size * 0.28 // vertical step for the top rhombus
  const vh = size * 0.86 // vertical edge length of the side faces

  // Cube corner points (projected). Origin chosen so nothing is negative.
  const cx = hw // centre x of the top apex column
  const topY = 0
  // Top rhombus corners.
  const T = { x: cx, y: topY } // back-top apex
  const Tl = { x: 0, y: topY + qh } // left-top
  const Tr = { x: 2 * hw, y: topY + qh } // right-top
  const Tf = { x: cx, y: topY + 2 * qh } // front-top (shared edge of L/R faces)
  // Bottom corners of the two front faces.
  const Bl = { x: 0, y: Tl.y + vh } // left-bottom
  const Bf = { x: cx, y: Tf.y + vh } // front-bottom apex
  const Br = { x: 2 * hw, y: Tr.y + vh } // right-bottom

  // Place pips on a parallelogram face given by corner `o` and its two
  // edge-vectors `u`, `v` (toward the two ADJACENT corners). Pips live on a
  // unit square that is shrunk about its centre by `scale` so they sit clear
  // of the face's edges.
  function facePips(
    count: number,
    o: { x: number; y: number },
    u: { x: number; y: number },
    v: { x: number; y: number },
    r: number,
    key: string,
    scale: number,
  ) {
    return pipsFor(count).map(([ux, uy], i) => {
      const sx = 0.5 + (ux - 0.5) * scale
      const sy = 0.5 + (uy - 0.5) * scale
      return (
        <circle
          key={`${key}-${i}`}
          cx={o.x + sx * u.x + sy * v.x}
          cy={o.y + sx * u.y + sy * v.y}
          r={r}
          fill={PIP_FILL}
        />
      )
    })
  }

  const pipR = size * 0.06

  // Each face is a parallelogram; the unit-square axes map to its two edges
  // from corner `o` toward the two ADJACENT corners.
  // Top face (T, Tr, Tf, Tl): from Tl toward T and Tf.
  const topO = Tl
  const topU = { x: T.x - Tl.x, y: T.y - Tl.y }
  const topV = { x: Tf.x - Tl.x, y: Tf.y - Tl.y }
  // Left face (Tl, Tf, Bf, Bl): from Tl toward Tf (front) and Bl (down).
  const leftO = Tl
  const leftU = { x: Tf.x - Tl.x, y: Tf.y - Tl.y }
  const leftV = { x: Bl.x - Tl.x, y: Bl.y - Tl.y }
  // Right face (Tf, Tr, Br, Bf): from Tf toward Tr and Bf (down).
  const rightO = Tf
  const rightU = { x: Tr.x - Tf.x, y: Tr.y - Tf.y }
  const rightV = { x: Bf.x - Tf.x, y: Bf.y - Tf.y }

  return (
    <g>
      {/* Top face */}
      <polygon
        points={`${T.x},${T.y} ${Tr.x},${Tr.y} ${Tf.x},${Tf.y} ${Tl.x},${Tl.y}`}
        fill={DIE_TOP_FILL}
        stroke={DIE_STROKE}
        strokeWidth={BORDER_W}
        strokeLinejoin="round"
      />
      {/* Left face */}
      <polygon
        points={`${Tl.x},${Tl.y} ${Tf.x},${Tf.y} ${Bf.x},${Bf.y} ${Bl.x},${Bl.y}`}
        fill={DIE_LEFT_FILL}
        stroke={DIE_STROKE}
        strokeWidth={BORDER_W}
        strokeLinejoin="round"
      />
      {/* Right face */}
      <polygon
        points={`${Tf.x},${Tf.y} ${Tr.x},${Tr.y} ${Br.x},${Br.y} ${Bf.x},${Bf.y}`}
        fill={DIE_RIGHT_FILL}
        stroke={DIE_STROKE}
        strokeWidth={BORDER_W}
        strokeLinejoin="round"
      />
      {/* Pips, shrunk about each face centre so they sit clear of the edges */}
      {facePips(top, topO, topU, topV, pipR, 'top', 0.62)}
      {facePips(left, leftO, leftU, leftV, pipR, 'left', 0.66)}
      {facePips(right, rightO, rightU, rightV, pipR, 'right', 0.66)}
    </g>
  )
}

// ---------------------------------------------------------------------------
// Default export — the bare problem figure: reference die + its unfolded net.
// ---------------------------------------------------------------------------

const PAD = 12
const GAP = 34 // gap between the die and the net

// Die block size.
const DIE_SIZE = 76
const DIE_W = DIE_SIZE // isometric width ≈ edge length (2 * half-step)
const DIE_H = DIE_SIZE * 0.28 * 2 + DIE_SIZE * 0.86 // top rhombus + side height

// Net block size: cols 0–3 wide, rows 0–2 tall.
const NET_W = 4 * CELL
const NET_H = 3 * CELL

const VIEW_W = PAD * 2 + DIE_W + GAP + NET_W
const VIEW_H = PAD * 2 + Math.max(DIE_H, NET_H)
const DISPLAY_W = Math.min(280, VIEW_W)

// Vertical centring offsets for each block.
const DIE_DY = PAD + (Math.max(DIE_H, NET_H) - DIE_H) / 2
const NET_DY = PAD + (Math.max(DIE_H, NET_H) - NET_H) / 2

export default function DiceNet24G3Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Soal membandingkan dadu dengan jaring-jaring. Di kiri sebuah dadu tiga dimensi: sisi atas 6 titik, sisi depan-kiri 2 titik, sisi depan-kanan 4 titik. Di kanan jaring-jaring kubus berbentuk tanda tambah dengan enam sisi, dihubungkan garis lipat putus-putus: di tengah sebaris empat sisi 3, 5, 4, dan 2, dengan sisi 6 di atas sisi 5 dan sisi 1 di bawahnya. Berapa banyak dari 7 dadu yang paling banyak dapat memiliki jaring-jaring yang sama seperti gambar?"
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width={DISPLAY_W}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <g transform={`translate(${PAD}, ${DIE_DY})`}>
          <ReferenceDie size={DIE_SIZE} />
        </g>
        <g transform={`translate(${PAD + DIE_W + GAP}, ${NET_DY})`}>
          <DiceNet24G3 />
        </g>
      </svg>
    </div>
  )
}
