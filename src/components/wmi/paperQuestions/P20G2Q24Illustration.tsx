/**
 * P20G2Q24Illustration — WMI-20P2A-Q24 (2020 Grade 2 Semifinal, Paper A)
 *
 * "Four stacked dice. The two opposite faces of each die sum to 7. Find the sum
 *  of the numbers on the DOWN-facing surfaces of the 4 dice."
 *  Choices: A 21, B 20, C 19, D 17 — answer A (21).
 *
 * Recovered from db/seed/wmi/figures/2020-semifinal-g2-a-q24.jpg: a vertical
 * pillar of four dice resting on a table, drawn isometrically. The very top face
 * of the top die shows a single pip (1). Each die also shows two front side
 * faces; those side pips are decorative — the load-bearing facts are the visible
 * top = 1 and the given rule "opposite faces sum to 7".
 *
 * The static figure draws ONLY the problem: the four-die pillar on the table.
 * It NEVER marks the down faces or reveals the answer — that is the explainer's
 * job (via `upTotal` / `downTotal` chips).
 *
 * Pure render — no Math.random, no Date, no window/document at module scope.
 * SSR-safe & deterministic.
 */

// ── qupu colour tokens ─────────────────────────────────────────────────────
const FACE_TOP = '#FFFFFF'
const FACE_LEFT = '#F1F1F1'
const FACE_RIGHT = '#E2E2E2'
const EDGE = '#1f2937'
const PIP = '#1f2937'
const TABLE = '#9aa3b2'
const UP_TINT = '#FFD3B1' // qupu-peach — used to flag an "up" face
const DOWN_TINT = '#BFE3CF' // soft green — used to flag a "down" face

// ── Isometric geometry ─────────────────────────────────────────────────────
// A cube is drawn from its top-front corner. dx/dy give the screen offset of the
// "depth" axis; the cube side length is S in screen units.
const S = 56 // cube edge (front face)
const DX = 24 // depth x-offset
const DY = -14 // depth y-offset (negative: depth goes up-right)

/** Pip dot positions on a unit (0..1) face, for counts used here. */
const PIPS: Record<number, [number, number][]> = {
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
    [0.3, 0.3],
    [0.7, 0.3],
    [0.3, 0.7],
    [0.7, 0.7],
  ],
  5: [
    [0.28, 0.28],
    [0.72, 0.28],
    [0.5, 0.5],
    [0.28, 0.72],
    [0.72, 0.72],
  ],
  6: [
    [0.3, 0.25],
    [0.7, 0.25],
    [0.3, 0.5],
    [0.7, 0.5],
    [0.3, 0.75],
    [0.7, 0.75],
  ],
}

/** Pips on the TOP rhombus of a cube whose top-front corner is (x, y). */
function topPips(x: number, y: number, count: number, r: number) {
  return (PIPS[count] ?? PIPS[1]).map(([u, v], i) => {
    // bilinear map over the top parallelogram: u along front-right edge, v along depth
    const px = x + u * S + v * DX
    const py = y + v * DY + u * 0 // top face: front edge horizontal, depth slants up
    return <circle key={`t${i}`} cx={px} cy={py + 0} r={r} fill={PIP} />
  })
}

/** Pips on the LEFT (front) face of a cube whose top-front corner is (x, y). */
function leftPips(x: number, y: number, count: number, r: number) {
  return (PIPS[count] ?? PIPS[1]).map(([u, v], i) => {
    const px = x + u * S
    const py = y + v * S
    return <circle key={`l${i}`} cx={px} cy={py} r={r} fill={PIP} />
  })
}

/** Pips on the RIGHT (side) face — the parallelogram going back-right. */
function rightPips(x: number, y: number, count: number, r: number) {
  const bx = x + S // top-right-front corner
  return (PIPS[count] ?? PIPS[1]).map(([u, v], i) => {
    const px = bx + u * DX
    const py = y + u * DY + v * S
    return <circle key={`r${i}`} cx={px} cy={py} r={r} fill={PIP} />
  })
}

interface DieSpec {
  top: number
  left: number
  right: number
}

/** One isometric die; top-front corner at (x, y). `tint` shades the top face. */
function Die({ x, y, spec, tintTop }: { x: number; y: number; spec: DieSpec; tintTop?: string }) {
  const topFill = tintTop ?? FACE_TOP
  const r = 4.2
  // corners
  const A = `${x},${y}` // top-front-left
  const B = `${x + S},${y}` // top-front-right
  const C = `${x + S + DX},${y + DY}` // top-back-right
  const D = `${x + DX},${y + DY}` // top-back-left
  const E = `${x},${y + S}` // bottom-front-left
  const F = `${x + S},${y + S}` // bottom-front-right
  const G = `${x + S + DX},${y + S + DY}` // bottom-back-right
  return (
    <g>
      {/* left/front face */}
      <polygon points={`${A} ${B} ${F} ${E}`} fill={FACE_LEFT} stroke={EDGE} strokeWidth={1.6} />
      {/* right/side face */}
      <polygon points={`${B} ${C} ${G} ${F}`} fill={FACE_RIGHT} stroke={EDGE} strokeWidth={1.6} />
      {/* top face */}
      <polygon points={`${A} ${B} ${C} ${D}`} fill={topFill} stroke={EDGE} strokeWidth={1.6} />
      {leftPips(x, y, spec.left, r)}
      {rightPips(x, y, spec.right, r)}
      {topPips(x, y, spec.top, r)}
    </g>
  )
}

// Visible faces per die (top of stack first). Side pips are decorative; the only
// load-bearing visible value is the very top face = 1.
const DICE: DieSpec[] = [
  { top: 1, left: 3, right: 2 }, // die 4 (top) — top pip = 1
  { top: 0, left: 4, right: 5 }, // die 3
  { top: 0, left: 6, right: 6 }, // die 2
  { top: 0, left: 5, right: 4 }, // die 1 (bottom)
]

const VIEW_W = 300
const VIEW_H = 360
const STACK_X = 110
const STACK_TOP_Y = 36

export interface DiceStackProps {
  /** Reveal a chip with the sum of the four UP faces (default hidden). */
  upTotal?: number | null
  /** Reveal a chip with the sum of the four DOWN faces (the answer). */
  downTotal?: number | null
  /** Tint the top (up) face of the top die peach. */
  markTopUp?: boolean
}

/** The four-die pillar on a table, with optional up/down sum chips. */
export function DiceStack({ upTotal = null, downTotal = null, markTopUp = false }: DiceStackProps) {
  // table top: a parallelogram under the bottom die
  const baseY = STACK_TOP_Y + 4 * S
  const tx = STACK_X - 64
  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ display: 'block', margin: '0 auto', maxWidth: 300 }} aria-hidden="true">
      {/* table */}
      <polygon
        points={`${tx},${baseY + 18} ${tx + 150},${baseY + 18} ${tx + 196},${baseY - 6} ${tx + 46},${baseY - 6}`}
        fill="#F3EFE6"
        stroke={TABLE}
        strokeWidth={2}
      />
      <line x1={tx + 8} y1={baseY + 18} x2={tx + 8} y2={baseY + 70} stroke={TABLE} strokeWidth={2.5} />
      <line x1={tx + 150} y1={baseY + 18} x2={tx + 150} y2={baseY + 70} stroke={TABLE} strokeWidth={2.5} />
      <line x1={tx + 196} y1={baseY - 6} x2={tx + 196} y2={baseY + 46} stroke={TABLE} strokeWidth={2.5} />

      {/* dice, drawn bottom-up so upper dice overlap lower ones */}
      {[3, 2, 1, 0].map((stackIdx) => {
        const y = STACK_TOP_Y + stackIdx * S
        const isTop = stackIdx === 0
        return <Die key={stackIdx} x={STACK_X} y={y} spec={DICE[stackIdx]} tintTop={isTop && markTopUp ? UP_TINT : undefined} />
      })}

      {/* up / down chips */}
      {upTotal != null && (
        <g>
          <rect x={20} y={40} width={70} height={30} rx={8} fill={UP_TINT} stroke="#f0853a" strokeWidth={2} />
          <text x={55} y={47} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#7c3a12">UP faces</text>
          <text x={55} y={62} textAnchor="middle" fontSize={14} fontWeight={900} fill="#7c3a12">{upTotal}</text>
        </g>
      )}
      {downTotal != null && (
        <g>
          <rect x={20} y={VIEW_H - 70} width={70} height={32} rx={8} fill={DOWN_TINT} stroke="#10B981" strokeWidth={2} />
          <text x={55} y={VIEW_H - 56} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#065F46">DOWN faces</text>
          <text x={55} y={VIEW_H - 40} textAnchor="middle" fontSize={15} fontWeight={900} fill="#065F46">{downTotal}</text>
        </g>
      )}
    </svg>
  )
}

export default function P20G2Q24Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Four dice stacked into a pillar on a table. The top face of the top die shows a single dot. Opposite faces of every die sum to 7."
    >
      <DiceStack />
    </div>
  )
}
