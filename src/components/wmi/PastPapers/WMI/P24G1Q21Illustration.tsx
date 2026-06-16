// Cube-net figure for WMI-24P1A-Q21 (2024 Grade 1 Semifinal, Paper A).
//
// "The net shown is folded into a cube. Which option shows the resulting cube?"
//
// Recovered from db/seed/wmi/figures/2024-semifinal-g1-a-q21.jpg — a 6-face net
// on a 4-col × 3-row grid (yellow squares, joined by dotted fold lines):
//
//   col:    0        1        2        3
//   row 0:  diamond  .        .        .
//   row 1:  circle   circle   circle   plain
//   row 2:  .        .        .        diamond
//
//   • 3 faces carry a RED CIRCLE
//   • 2 faces carry a BLUE DIAMOND
//   • 1 face is PLAIN YELLOW
//
// Folding (verified by a roll-the-cube BFS):
//   diamond ↔ diamond   (the two diamonds land on OPPOSITE faces)
//   circle  ↔ circle    (two circles are opposite)
//   plain   ↔ circle    (the plain face is opposite the third circle)
//
// So on the folded cube the two diamonds are never adjacent — they sit on facing
// sides. The option whose three visible faces respect that arrangement (a circle,
// the plain face, and a single diamond meeting at a corner) is option C.
//
// The choice images (A–E) are not reproducible here, so the static figure draws
// ONLY the net (the problem). The explainer folds it and derives option C.
//
// Pure render — no window/document/Math.random/Date. SSR-safe & deterministic.

export type FaceKind = 'circle' | 'diamond' | 'plain'

export interface NetFace {
  row: number
  col: number
  kind: FaceKind
}

/** The six net faces in their grid positions, as recovered from the scan. */
export const NET_FACES: NetFace[] = [
  { row: 0, col: 0, kind: 'diamond' },
  { row: 1, col: 0, kind: 'circle' },
  { row: 1, col: 1, kind: 'circle' },
  { row: 1, col: 2, kind: 'circle' },
  { row: 1, col: 3, kind: 'plain' },
  { row: 2, col: 3, kind: 'diamond' },
]

export const COUNT_CIRCLE = 3
export const COUNT_DIAMOND = 2
export const COUNT_PLAIN = 1
export const ANSWER_LETTER = 'C'

// ---------------------------------------------------------------------------
// Colours (qupu-ish tokens; raw hex permitted per the figure brief)
// ---------------------------------------------------------------------------

const FACE_FILL = '#FCD34D' // yellow square
const FACE_STROKE = '#1F2937'
const CIRCLE_FILL = '#EF4444' // red
const DIAMOND_FILL = '#3DB6E8' // blue
const FOLD_STROKE = '#1F2937'

export const CELL = 60

// ---------------------------------------------------------------------------
// Glyphs drawn on a face, in a unit (0..1) coordinate box.
// ---------------------------------------------------------------------------

function FaceGlyph({ kind, x, y, cell }: { kind: FaceKind; x: number; y: number; cell: number }) {
  if (kind === 'circle') {
    return <circle cx={x + cell / 2} cy={y + cell / 2} r={cell * 0.3} fill={CIRCLE_FILL} stroke={FACE_STROKE} strokeWidth={1.4} />
  }
  if (kind === 'diamond') {
    const cx = x + cell / 2
    const cy = y + cell / 2
    const d = cell * 0.34
    return (
      <polygon
        points={`${cx},${cy - d} ${cx + d},${cy} ${cx},${cy + d} ${cx - d},${cy}`}
        fill={DIAMOND_FILL}
        stroke={FACE_STROKE}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    )
  }
  return null // plain
}

/** A single net face: yellow square frame + its glyph. */
function Face({ face, cell }: { face: NetFace; cell: number }) {
  const x = face.col * cell
  const y = face.row * cell
  return (
    <g>
      <rect x={x} y={y} width={cell} height={cell} fill={FACE_FILL} stroke={FACE_STROKE} strokeWidth={2} />
      <FaceGlyph kind={face.kind} x={x} y={y} cell={cell} />
    </g>
  )
}

/** Dotted fold lines along every shared interior edge. */
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
        <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={FOLD_STROKE} strokeWidth={1.4} strokeDasharray="4 4" />
      ))}
    </g>
  )
}

export interface CubeNetQ21Props {
  /** Net-face indices (0..5) to dim to ~35% (used while the explainer highlights a subset). */
  dimExcept?: number[] | null
  cell?: number
}

/** Reusable primitive: the bare cube net. Shared with the explainer. */
export function CubeNetQ21({ dimExcept = null, cell = CELL }: CubeNetQ21Props) {
  const keep = dimExcept == null ? null : new Set(dimExcept)
  return (
    <g>
      <FoldLines faces={NET_FACES} cell={cell} />
      {NET_FACES.map((face, i) => (
        <g key={i} opacity={keep && !keep.has(i) ? 0.32 : 1}>
          <Face face={face} cell={cell} />
        </g>
      ))}
    </g>
  )
}

// ---------------------------------------------------------------------------
// A folded-cube corner view (top / left / right faces meeting at a corner).
// Used by the explainer to show the resulting cube; the static figure never
// renders it (no answer leak).
// ---------------------------------------------------------------------------

export interface FoldedCubeQ21Props {
  top: FaceKind
  left: FaceKind
  right: FaceKind
  x?: number
  y?: number
  s?: number
}

/** Draws a glyph centred on a parallelogram face. */
function ParaGlyph({ kind, cx, cy, r, color }: { kind: FaceKind; cx: number; cy: number; r: number; color: string }) {
  if (kind === 'circle') {
    return <circle cx={cx} cy={cy} r={r} fill={CIRCLE_FILL} stroke={FACE_STROKE} strokeWidth={1.2} />
  }
  if (kind === 'diamond') {
    return (
      <polygon
        points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`}
        fill={DIAMOND_FILL}
        stroke={FACE_STROKE}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
    )
  }
  // plain — show nothing; `color` keeps the face fill readable
  void color
  return null
}

export function FoldedCubeQ21({ top, left, right, x = 0, y = 0, s = 60 }: FoldedCubeQ21Props) {
  // Isometric box: half-width cx, half-depth cy.
  const cx = s * 0.5
  const cy = s * 0.26
  const apex = { x: x + cx, y } // top vertex of the top rhombus
  // Top rhombus vertices.
  const tTop = apex
  const tRight = { x: x + 2 * cx, y: y + cy }
  const tBottom = { x: x + cx, y: y + 2 * cy }
  const tLeft = { x, y: y + cy }
  // Vertical drop for the front faces.
  const drop = s
  return (
    <g>
      {/* top face */}
      <polygon
        points={`${tTop.x},${tTop.y} ${tRight.x},${tRight.y} ${tBottom.x},${tBottom.y} ${tLeft.x},${tLeft.y}`}
        fill={FACE_FILL}
        stroke={FACE_STROKE}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <ParaGlyph kind={top} cx={x + cx} cy={y + cy} r={s * 0.2} color={FACE_FILL} />

      {/* left face */}
      <polygon
        points={`${tLeft.x},${tLeft.y} ${tBottom.x},${tBottom.y} ${tBottom.x},${tBottom.y + drop} ${tLeft.x},${tLeft.y + drop}`}
        fill="#F6C12B"
        stroke={FACE_STROKE}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <ParaGlyph kind={left} cx={(tLeft.x + tBottom.x) / 2} cy={(tLeft.y + tBottom.y) / 2 + drop / 2} r={s * 0.18} color="#F6C12B" />

      {/* right face */}
      <polygon
        points={`${tBottom.x},${tBottom.y} ${tRight.x},${tRight.y} ${tRight.x},${tRight.y + drop} ${tBottom.x},${tBottom.y + drop}`}
        fill="#EBB117"
        stroke={FACE_STROKE}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <ParaGlyph kind={right} cx={(tBottom.x + tRight.x) / 2} cy={(tBottom.y + tRight.y) / 2 + drop / 2} r={s * 0.18} color="#EBB117" />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Default export — the bare problem net.
// ---------------------------------------------------------------------------

const PAD = 12
const GRID_COLS = 4
const GRID_ROWS = 3
const VIEW_W = GRID_COLS * CELL + PAD * 2
const VIEW_H = GRID_ROWS * CELL + PAD * 2

export default function P24G1Q21Illustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A cube net of six yellow squares joined by dotted fold lines: three squares carry a red circle, two carry a blue diamond, and one is plain. Folded into a cube — which option matches?"
    >
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: VIEW_W, display: 'block' }} aria-hidden="true">
        <g transform={`translate(${PAD}, ${PAD})`}>
          <CubeNetQ21 />
        </g>
      </svg>
    </div>
  )
}
