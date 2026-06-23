// DiamondPattern16B1Illustration.tsx
//
// Stem illustration for SEAMO-16-B-Q1:
//   "Find the missing number in the number pattern below."
//
// The figure (002.jpg) shows THREE diamond-shaped groups side by side.
// Each diamond has 4 circles: top (green), left (gold), right (gold), bottom (green),
// connected by four diagonal lines forming a diamond/rhombus.
//
//   Group 1: top=5  left=4  right=6  bottom=14
//   Group 2: top=4  left=3  right=5  bottom=7
//   Group 3: top=?  left=2  right=4  bottom=12
//
// Pattern: each column decreases by 1 across the three groups:
//   top: 5 → 4 → ? = 3   (not among A=4, B=5, C=6, D=7 → answer E)
//   left: 4 → 3 → 2
//   right: 6 → 5 → 4
//   bottom: 14, 7, 12 (given)
//
// Co-exported primitive: DiamondGroups (accepts revealAnswer prop).
// Default export: static illustration div. SSR-safe, no hooks.

// ── palette (matches source image) ────────────────────────────────────────────
const GREEN  = '#4CAF50'   // top + bottom circles (green fill)
const GOLD   = '#F9A825'   // left + right circles (gold/amber fill)
const WHITE  = '#FFFFFF'
const INK    = '#1F2937'   // number labels
const EDGE   = '#374151'   // connecting lines
const SHADE  = '#D1FAE5'   // tint for the ? circle (light green)
const ANSWER_COLOR = '#10B981'  // green for revealed answer

// ── figure data ────────────────────────────────────────────────────────────────
export const GROUPS: Array<{
  top: number | null   // null = the unknown (?)
  left: number
  right: number
  bottom: number
}> = [
  { top: 5,    left: 4, right: 6, bottom: 14 },
  { top: 4,    left: 3, right: 5, bottom: 7  },
  { top: null, left: 2, right: 4, bottom: 12 },
]

// The missing top value, derived from the -1 sequence pattern
export const ANSWER_VALUE = 3

// ── geometry constants ─────────────────────────────────────────────────────────
const R      = 22   // circle radius
const PAD    = 14   // outer padding
const GAP    = 18   // horizontal gap between groups

// Diamond positions (relative to group centre)
// The diamond has side-to-side width = DW, height = DH
const DW = 60   // half-width of diamond (left/right offset from centre)
const DH = 50   // half-height of diamond (top/bottom offset from centre)

// Each group fits in a bounding box of 2*DW + 2*R wide, 2*DH + 2*R tall
const GROUP_W = 2 * DW + 2 * R
const GROUP_H = 2 * DH + 2 * R

// Group centres (horizontal layout)
const GROUP_CENTRES = GROUPS.map((_, i) => ({
  cx: PAD + R + DW + i * (GROUP_W + GAP),
  cy: PAD + R + DH,
}))

const VB_W = PAD + GROUPS.length * (GROUP_W + GAP) - GAP + PAD
const VB_H = GROUP_H + PAD * 2

// ── helpers ────────────────────────────────────────────────────────────────────
/** Returns the (x, y) centre of each node in a diamond group */
function nodeCentres(gx: number, gy: number) {
  return {
    top:    { x: gx,      y: gy - DH },
    left:   { x: gx - DW, y: gy      },
    right:  { x: gx + DW, y: gy      },
    bottom: { x: gx,      y: gy + DH },
  }
}

// ── primitive ──────────────────────────────────────────────────────────────────
export interface DiamondGroupsProps {
  /** When true, shows the answer (3) in the third group's top circle. */
  revealAnswer?: boolean
  /**
   * Which node in which group to highlight.
   * Format: [groupIndex, position] where position is 'top'|'left'|'right'|'bottom'.
   */
  highlight?: [number, 'top' | 'left' | 'right' | 'bottom'] | null
}

/**
 * DiamondGroups — shared primitive for the three diamond groups.
 *
 * Each group draws 4 coloured circles in a diamond/rhombus arrangement
 * connected by straight lines. The top circle of Group 3 is the unknown (?).
 */
export function DiamondGroups({
  revealAnswer = false,
  highlight = null,
}: DiamondGroupsProps = {}) {
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width="100%"
      style={{ maxWidth: VB_W * 1.4, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* white background */}
      <rect x={0} y={0} width={VB_W} height={VB_H} fill={WHITE} />

      {GROUPS.map((grp, g) => {
        const { cx, cy } = GROUP_CENTRES[g]
        const pos = nodeCentres(cx, cy)

        const isUnknown = grp.top === null
        const topLabel  = isUnknown
          ? revealAnswer ? String(ANSWER_VALUE) : '?'
          : String(grp.top)
        const topFill   = isUnknown ? SHADE : GREEN
        const topStroke = isUnknown && !revealAnswer ? '#059669' : GREEN

        // Helper to check if a node is highlighted
        const isHL = (pos: 'top' | 'left' | 'right' | 'bottom') =>
          highlight !== null && highlight[0] === g && highlight[1] === pos

        return (
          <g key={`g${g}`}>
            {/* ── connecting lines ── */}
            {/* top → left */}
            <line
              x1={pos.top.x}    y1={pos.top.y}
              x2={pos.left.x}   y2={pos.left.y}
              stroke={EDGE} strokeWidth={2}
            />
            {/* top → right */}
            <line
              x1={pos.top.x}    y1={pos.top.y}
              x2={pos.right.x}  y2={pos.right.y}
              stroke={EDGE} strokeWidth={2}
            />
            {/* left → bottom */}
            <line
              x1={pos.left.x}   y1={pos.left.y}
              x2={pos.bottom.x} y2={pos.bottom.y}
              stroke={EDGE} strokeWidth={2}
            />
            {/* right → bottom */}
            <line
              x1={pos.right.x}  y1={pos.right.y}
              x2={pos.bottom.x} y2={pos.bottom.y}
              stroke={EDGE} strokeWidth={2}
            />

            {/* ── TOP circle ── */}
            <circle
              cx={pos.top.x}
              cy={pos.top.y}
              r={R}
              fill={isUnknown && revealAnswer ? GREEN : topFill}
              stroke={isHL('top') ? '#D97706' : topStroke}
              strokeWidth={isHL('top') ? 3 : 2}
            />
            <text
              x={pos.top.x}
              y={pos.top.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={isUnknown && !revealAnswer ? 18 : 16}
              fontWeight={700}
              fill={isUnknown && revealAnswer ? WHITE : INK}
            >
              {topLabel}
            </text>

            {/* ── LEFT circle ── */}
            <circle
              cx={pos.left.x}
              cy={pos.left.y}
              r={R}
              fill={GOLD}
              stroke={isHL('left') ? '#D97706' : GOLD}
              strokeWidth={isHL('left') ? 3 : 2}
            />
            <text
              x={pos.left.x}
              y={pos.left.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={16}
              fontWeight={700}
              fill={INK}
            >
              {grp.left}
            </text>

            {/* ── RIGHT circle ── */}
            <circle
              cx={pos.right.x}
              cy={pos.right.y}
              r={R}
              fill={GOLD}
              stroke={isHL('right') ? '#D97706' : GOLD}
              strokeWidth={isHL('right') ? 3 : 2}
            />
            <text
              x={pos.right.x}
              y={pos.right.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={16}
              fontWeight={700}
              fill={INK}
            >
              {grp.right}
            </text>

            {/* ── BOTTOM circle ── */}
            <circle
              cx={pos.bottom.x}
              cy={pos.bottom.y}
              r={R}
              fill={GREEN}
              stroke={isHL('bottom') ? '#D97706' : GREEN}
              strokeWidth={isHL('bottom') ? 3 : 2}
            />
            <text
              x={pos.bottom.x}
              y={pos.bottom.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={16}
              fontWeight={700}
              fill={WHITE}
            >
              {grp.bottom}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── default export ─────────────────────────────────────────────────────────────

/**
 * DiamondPattern16B1Illustration
 *
 * Static, problem-only figure for SEAMO-16-B-Q1.
 * Shows three diamond groups with coloured circles; the top circle of Group 3
 * is left blank (?). Students identify the -1 sequence and find the answer is 3.
 */
export default function DiamondPattern16B1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Tiga kelompok berlian: masing-masing berisi empat lingkaran (atas, kiri, kanan, bawah) yang terhubung dengan garis. ' +
        'Kelompok 1: atas=5 (hijau), kiri=4 (kuning), kanan=6 (kuning), bawah=14 (hijau). ' +
        'Kelompok 2: atas=4, kiri=3, kanan=5, bawah=7. ' +
        'Kelompok 3: atas=? (kosong), kiri=2, kanan=4, bawah=12. ' +
        'Temukan nilai yang hilang.'
      }
    >
      <DiamondGroups />
    </div>
  )
}

// ── Registry wiring ────────────────────────────────────────────────────────────
//
//   'SEAMO-16-B-Q1': {
//     illustration: () => import('./DiamondPattern16B1Illustration'),
//     explainer:    () => import('./DiamondPattern16B1Explainer'),
//   },
//
// Set figure_url to null in the seed/DB.
