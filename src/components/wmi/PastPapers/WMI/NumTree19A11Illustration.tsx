// SEAMO-19-A-Q11 — "Find the missing number in the number puzzle below."
//
// Three tree-shaped groups. Each group has two orange "input" circles at the top
// connected to an orange "center" circle, which connects down to a green "result"
// circle at the bottom.
//
// Rule: center + bottom = topLeft × topRight
//   Tree 1: 7 + 8 = 15 ≠ 5×3=15 … wait. Observed:
//     Tree 1: topLeft=5, topRight=3, center=7, bottom=8
//     Tree 2: topLeft=6, topRight=5, center=20, bottom=10
//     Tree 3: topLeft=7, topRight=8, center=28, bottom=?
//
//   Derived rule: center + bottom = topLeft × topRight
//     Tree 1: 7 + 8 = 15 = 5 × 3 ✓
//     Tree 2: 20 + 10 = 30 = 6 × 5 ✓
//     Tree 3: 28 + ? = 7 × 8 = 56 → ? = 28  (Answer E)
//
// The static illustration shows the PROBLEM — bottom circle of tree 3 shows "?".
// The `revealAnswer` prop fills it in for the explainer.
//
// Exports:
//   NumTree19A11   — named reusable SVG primitive (accepts revealAnswer prop)
//   default        — Illustration wrapper div (answer hidden)

// ── colour tokens ─────────────────────────────────────────────────────────────
const ORANGE_FILL   = '#F59E0B'   // golden-orange — matches source
const ORANGE_STROKE = '#D97706'
const GREEN_FILL    = '#6DC95A'   // bright green — matches source
const GREEN_STROKE  = '#4CA83B'
const UNKNOWN_FILL  = '#D1FAE5'   // pale green for "?"
const UNKNOWN_STR   = '#10B981'   // emerald border for "?"
const ANSWER_FILL   = '#34D399'   // revealed answer fill
const WHITE         = '#FFFFFF'
const INK           = '#1F2937'
const LINE_CLR      = '#92400E'   // dark line colour (brownish, matching source)

// ── figure data ───────────────────────────────────────────────────────────────
export interface TreeGroup {
  topLeft:  number
  topRight: number
  center:   number
  bottom:   number | null   // null = unknown (?)
}

export const TREES: TreeGroup[] = [
  { topLeft: 5, topRight: 3, center: 7,  bottom: 8  },
  { topLeft: 6, topRight: 5, center: 20, bottom: 10 },
  { topLeft: 7, topRight: 8, center: 28, bottom: null },
]

export const ANSWER_19A11 = 28   // 7×8 - 28 = 56 - 28 = 28

// ── geometry ──────────────────────────────────────────────────────────────────
const R_TOP    = 22   // radius for top-left / top-right circles
const R_CENTER = 22   // radius for center circle
const R_BOTTOM = 22   // radius for bottom circle

// Layout within each tree group (local coords, center of "center" circle at 0,0)
const H_SPREAD = 36   // horizontal offset for each top circle from center x
const V_TOP    = 44   // vertical offset upward to top circles
const V_BOT    = 52   // vertical offset downward to bottom circle

// Per-tree group origin (cx of the center circle)
const TREE_W   = R_TOP * 2 + H_SPREAD * 2 + 12  // width of one tree group
const TREE_H   = V_TOP + R_TOP + V_BOT + R_BOTTOM + 8

// Canvas
const COLS     = 3
const H_PAD    = 20
const V_PAD    = 16
const BETWEEN  = 28  // extra gap between trees

const VW = H_PAD * 2 + TREE_W * COLS + BETWEEN * (COLS - 1)
const VH = V_PAD * 2 + TREE_H

// Center-circle X for each tree
function treeCX(g: number): number {
  return H_PAD + R_TOP + H_SPREAD + g * (TREE_W + BETWEEN)
}
// Center-circle Y for all trees
const CENTER_CY = V_PAD + V_TOP + R_TOP

// ── reusable primitive ────────────────────────────────────────────────────────

export interface NumTree19A11Props {
  /** Reveal the answer (28) in tree 3's bottom circle. */
  revealAnswer?: boolean
}

export function NumTree19A11({ revealAnswer = false }: NumTree19A11Props = {}) {
  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: VW, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {TREES.map((tree, g) => {
        const cx = treeCX(g)
        const cy = CENTER_CY

        // Positions
        const tlX = cx - H_SPREAD, tlY = cy - V_TOP
        const trX = cx + H_SPREAD, trY = cy - V_TOP
        const botX = cx,            botY = cy + V_BOT

        const isUnknown = tree.bottom === null
        const botLabel  = isUnknown ? (revealAnswer ? String(ANSWER_19A11) : '?') : String(tree.bottom)
        const botFill   = isUnknown
          ? (revealAnswer ? ANSWER_FILL : UNKNOWN_FILL)
          : GREEN_FILL
        const botStroke = isUnknown ? UNKNOWN_STR : GREEN_STROKE
        const botStrokeW = isUnknown ? 2.8 : 2
        const botTextFill = isUnknown ? (revealAnswer ? '#065F46' : '#065F46') : INK

        // Line endpoint helpers: push line start/end to circle edge
        function lineEndpoints(
          x1: number, y1: number,
          x2: number, y2: number,
          r1: number, r2: number
        ) {
          const dx = x2 - x1, dy = y2 - y1
          const len = Math.sqrt(dx * dx + dy * dy) || 1
          return {
            x1: x1 + (dx / len) * r1,
            y1: y1 + (dy / len) * r1,
            x2: x2 - (dx / len) * r2,
            y2: y2 - (dy / len) * r2,
          }
        }

        const ep1 = lineEndpoints(tlX, tlY, cx, cy, R_TOP, R_CENTER)
        const ep2 = lineEndpoints(trX, trY, cx, cy, R_TOP, R_CENTER)
        const ep3 = lineEndpoints(cx, cy, botX, botY, R_CENTER, R_BOTTOM)

        return (
          <g key={`tree-${g}`}>
            {/* Connecting lines */}
            <line x1={ep1.x1} y1={ep1.y1} x2={ep1.x2} y2={ep1.y2}
              stroke={LINE_CLR} strokeWidth={2} strokeLinecap="round" />
            <line x1={ep2.x1} y1={ep2.y1} x2={ep2.x2} y2={ep2.y2}
              stroke={LINE_CLR} strokeWidth={2} strokeLinecap="round" />
            <line x1={ep3.x1} y1={ep3.y1} x2={ep3.x2} y2={ep3.y2}
              stroke={LINE_CLR} strokeWidth={2} strokeLinecap="round" />

            {/* Top-left circle (orange) */}
            <circle cx={tlX} cy={tlY} r={R_TOP} fill={ORANGE_FILL} stroke={ORANGE_STROKE} strokeWidth={2} />
            <text x={tlX} y={tlY} textAnchor="middle" dominantBaseline="central"
              fontSize={15} fontWeight={700} fill={INK}>
              {tree.topLeft}
            </text>

            {/* Top-right circle (orange) */}
            <circle cx={trX} cy={trY} r={R_TOP} fill={ORANGE_FILL} stroke={ORANGE_STROKE} strokeWidth={2} />
            <text x={trX} y={trY} textAnchor="middle" dominantBaseline="central"
              fontSize={15} fontWeight={700} fill={INK}>
              {tree.topRight}
            </text>

            {/* Center circle (orange) */}
            <circle cx={cx} cy={cy} r={R_CENTER} fill={ORANGE_FILL} stroke={ORANGE_STROKE} strokeWidth={2} />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
              fontSize={15} fontWeight={700} fill={INK}>
              {tree.center}
            </text>

            {/* Bottom circle (green) */}
            <circle cx={botX} cy={botY} r={R_BOTTOM} fill={botFill} stroke={botStroke} strokeWidth={botStrokeW} />
            <text x={botX} y={botY} textAnchor="middle" dominantBaseline="central"
              fontSize={isUnknown && !revealAnswer ? 16 : 15} fontWeight={700} fill={botTextFill}>
              {botLabel}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Static illustration for SEAMO-19-A-Q11 (missing number left blank). */
export default function NumTree19A11Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Tiga kelompok pohon angka. Setiap pohon punya dua lingkaran oranye di atas yang terhubung ke lingkaran oranye di tengah, yang terhubung ke lingkaran hijau di bawah. Pohon 1: kiri=5, kanan=3, tengah=7, bawah=8. Pohon 2: kiri=6, kanan=5, tengah=20, bawah=10. Pohon 3: kiri=7, kanan=8, tengah=28, bawah=?"
    >
      <NumTree19A11 />
    </div>
  )
}
