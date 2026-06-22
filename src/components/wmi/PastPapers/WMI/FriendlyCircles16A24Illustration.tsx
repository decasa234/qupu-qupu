// SEAMO-16-A-Q24 — "How many 'friendly pairs' are there in the figure?"
//
// OCR source: docs/reference/ocr-res/seamo/contest/paper-a/2016.md Q24,
// crops: 2016.imgs/022.jpg (example touching pair) and 023.jpg (10-circle triangle).
//
// FIGURE: 10 circles arranged in a bowling-pin equilateral-triangle layout:
//   Row 1 (top):    1 circle  — node T1
//   Row 2:          2 circles — nodes M1, M2
//   Row 3:          3 circles — nodes L1, L2, L3
//   Row 4 (bottom): 4 circles — nodes B1, B2, B3, B4
//
// Two circles are "friendly" if they TOUCH each other (share exactly one point).
// In this layout every adjacent pair in the same row, and every adjacent pair
// in neighbouring rows (diagonal), are touching — exactly 18 pairs.
//
// Breakdown quantities (from seed):
//   Horizontal pairs: 3 + 2 + 1 + 0 = 6
//   Diagonal pairs:   6 + 4 + 2     = 12
//   Total:            18
//
// The static illustration shows the 10-circle triangle; NO pair highlighting.
// The explainer animates the count row-by-row.
//
// Co-exported primitive: FriendlyCircles16A24
//   Props: highlightEdges? (for explainer), revealCount? (show running total)
//
// Default export: plain Illustration div. SSR-safe & deterministic (no hooks, no Date).

// ── palette ───────────────────────────────────────────────────────────────────
const INK      = '#1F2937'   // text
const BLUE     = '#30598A'   // node stroke / default edges
const FILL     = '#F5F0E8'   // node fill (qupu shell-white)
const GREEN    = '#10B981'   // highlighted edge (friendly pair found)
const AMBER    = '#F59E0B'   // highlighted node during animation
const WHITE    = '#FFFFFF'

// ── geometry ──────────────────────────────────────────────────────────────────
// 10-circle equilateral-triangle layout.
// R = circle radius; dx = horizontal spacing (2R → circles touch side-by-side);
// dy = vertical spacing (R*√3 → circles touch diagonally in equilateral packing).
const R   = 22
const DX  = R * 2          // 44
const DY  = Math.round(R * Math.sqrt(3))  // 38

// Anchor: bottom-left circle of row 4.
const PAD = 14
const B1X = PAD + R        // 36
const B1Y = PAD + R + DY * 3  // 36 + 38*3 = 150

// Node positions: (cx, cy) in viewBox pixels.
export const NODES = {
  B1: { x: B1X,           y: B1Y },
  B2: { x: B1X + DX,      y: B1Y },
  B3: { x: B1X + DX * 2,  y: B1Y },
  B4: { x: B1X + DX * 3,  y: B1Y },
  L1: { x: B1X + R,       y: B1Y - DY },
  L2: { x: B1X + R + DX,  y: B1Y - DY },
  L3: { x: B1X + R + DX * 2, y: B1Y - DY },
  M1: { x: B1X + R * 2,   y: B1Y - DY * 2 },
  M2: { x: B1X + R * 2 + DX, y: B1Y - DY * 2 },
  T1: { x: B1X + R * 3,   y: B1Y - DY * 3 },
} as const

export type NodeId = keyof typeof NODES

// SVG viewBox dimensions.
export const VB_W = PAD * 2 + DX * 3 + R * 2   // 196
export const VB_H = PAD * 2 + DY * 3 + R * 2   // 162

// ── edges ─────────────────────────────────────────────────────────────────────
// All 18 friendly pairs: horizontal (same row) + diagonal (adjacent rows).
// Label each edge so the explainer can highlight groups.

export type EdgeGroup =
  | 'horiz-row4'   // 3 pairs in row 4 (bottom)
  | 'horiz-row3'   // 2 pairs in row 3
  | 'horiz-row2'   // 1 pair in row 2
  | 'diag-34'      // 6 diagonal pairs between row3 and row4
  | 'diag-23'      // 4 diagonal pairs between row2 and row3
  | 'diag-12'      // 2 diagonal pairs between row1 and row2

export interface FriendlyEdge {
  a: NodeId
  b: NodeId
  group: EdgeGroup
}

export const EDGES: FriendlyEdge[] = [
  // Row 4 horizontal (3)
  { a: 'B1', b: 'B2', group: 'horiz-row4' },
  { a: 'B2', b: 'B3', group: 'horiz-row4' },
  { a: 'B3', b: 'B4', group: 'horiz-row4' },
  // Row 3 horizontal (2)
  { a: 'L1', b: 'L2', group: 'horiz-row3' },
  { a: 'L2', b: 'L3', group: 'horiz-row3' },
  // Row 2 horizontal (1)
  { a: 'M1', b: 'M2', group: 'horiz-row2' },
  // Diagonal row3→row4 (6)
  { a: 'L1', b: 'B1', group: 'diag-34' },
  { a: 'L1', b: 'B2', group: 'diag-34' },
  { a: 'L2', b: 'B2', group: 'diag-34' },
  { a: 'L2', b: 'B3', group: 'diag-34' },
  { a: 'L3', b: 'B3', group: 'diag-34' },
  { a: 'L3', b: 'B4', group: 'diag-34' },
  // Diagonal row2→row3 (4)
  { a: 'M1', b: 'L1', group: 'diag-23' },
  { a: 'M1', b: 'L2', group: 'diag-23' },
  { a: 'M2', b: 'L2', group: 'diag-23' },
  { a: 'M2', b: 'L3', group: 'diag-23' },
  // Diagonal row1→row2 (2)
  { a: 'T1', b: 'M1', group: 'diag-12' },
  { a: 'T1', b: 'M2', group: 'diag-12' },
]

// Sanity: 3+2+1+6+4+2 = 18 ✓
export const TOTAL_PAIRS = EDGES.length  // 18

// ── primitive ─────────────────────────────────────────────────────────────────

export interface FriendlyCircles16A24Props {
  /**
   * Set of edge groups to highlight in green.
   * Default: none (all edges shown in blue).
   */
  highlightGroups?: Set<EdgeGroup>
  /**
   * Nodes to tint amber (for beat animation focus).
   */
  highlightNodes?: Set<NodeId>
  /**
   * Running count of friendly pairs found so far.
   * When set, shows a small badge at bottom-right.
   */
  runningCount?: number | null
}

/**
 * Shared primitive — the 10-circle triangular arrangement.
 *
 * Static by default (no highlighted groups). The explainer passes
 * `highlightGroups` and `highlightNodes` to animate the count.
 */
export function FriendlyCircles16A24({
  highlightGroups = new Set(),
  highlightNodes  = new Set(),
  runningCount    = null,
}: FriendlyCircles16A24Props = {}) {
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={Math.min(VB_W, 300)}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {/* ── edges ─────────────────────────────────────────────────────────── */}
      {EDGES.map((edge, i) => {
        const na = NODES[edge.a]
        const nb = NODES[edge.b]
        const lit = highlightGroups.has(edge.group)
        return (
          <line
            key={`e${i}`}
            x1={na.x} y1={na.y}
            x2={nb.x} y2={nb.y}
            stroke={lit ? GREEN : BLUE}
            strokeWidth={lit ? 3.2 : 1.8}
            strokeLinecap="round"
            opacity={lit ? 1 : 0.35}
          />
        )
      })}

      {/* ── nodes ─────────────────────────────────────────────────────────── */}
      {(Object.keys(NODES) as NodeId[]).map((id) => {
        const n = NODES[id]
        const lit = highlightNodes.has(id)
        return (
          <circle
            key={id}
            cx={n.x}
            cy={n.y}
            r={R}
            fill={lit ? AMBER : FILL}
            stroke={lit ? '#D97706' : BLUE}
            strokeWidth={lit ? 3 : 2.4}
          />
        )
      })}

      {/* ── running count badge ───────────────────────────────────────────── */}
      {runningCount != null && (
        <g>
          <rect
            x={VB_W - 46} y={VB_H - 28}
            width={40} height={22}
            rx={6}
            fill={GREEN}
          />
          <text
            x={VB_W - 26} y={VB_H - 17}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={13}
            fontWeight={700}
            fill={WHITE}
          >
            {runningCount}
          </text>
        </g>
      )}
    </svg>
  )
}

// ── default export ─────────────────────────────────────────────────────────────

/**
 * FriendlyCircles16A24Illustration
 *
 * Static, problem-only figure for SEAMO-16-A-Q24.
 * Shows: 10 circles in a triangular arrangement — no pair highlighting, no answer.
 */
export default function FriendlyCircles16A24Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        '10 lingkaran tersusun dalam pola segitiga (seperti pin bowling): ' +
        '4 di baris bawah, 3 di atasnya, 2 lagi di atasnya, dan 1 di puncak. ' +
        'Setiap dua lingkaran yang bersentuhan disebut pasangan bersahabat.'
      }
    >
      <FriendlyCircles16A24 />
    </div>
  )
}
