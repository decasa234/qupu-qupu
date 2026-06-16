/**
 * WMI-24F2A-Q19 — "Triangles of different sizes in the figure; find
 * (number of triangles) + (minimum matchsticks to remove so no triangle remains)."
 * Answer: 8 triangles + 4 sticks = 12.
 *
 * The figure is a 2 × 2 parallelogram in an isometric (equilateral-triangle) grid,
 * oriented to lean LEFT (upper-right to lower-left), faithfully reconstructed from
 * db/seed/wmi/figures/2024-final-g2-a-q19.jpg.
 *
 * Grid layout: 9 nodes in a 3 × 3 isometric arrangement.
 * Each successive row shifts LEFT by S/2.
 *
 *   Row 0 (top, leans right):  N[0][0]  N[0][1]  N[0][2]
 *   Row 1 (middle):              N[1][0]  N[1][1]  N[1][2]
 *   Row 2 (bottom, leans left): N[2][0]  N[2][1]  N[2][2]
 *
 * Screen coordinates:
 *   x(r, c) = PAD + (ROWS-1-r) * (S/2) + c * S
 *   y(r, c) = PAD + r * H
 * where ROWS=3, S=STICK_SIDE, H=S*√3/2.
 *
 * This gives the left-leaning parallelogram visible in the source photo.
 *
 * Triangle count (all sizes):
 *   4 unit upward-pointing △  +  4 unit downward-pointing ▽  =  8 total.
 *   (No composite/size-2 triangles exist in this grid — each pair of adjacent
 *    unit triangles combines into a rhombus, not a larger equilateral triangle.)
 *   The 4 "left-down" diagonal edges (one per inner column) are each shared by
 *   exactly 2 triangles, so removing all 4 destroys all 8.
 *
 * Edges: 16 total (6 horizontal + 4 left-down diagonals + 6 right-down diagonals).
 *   Wait — let me recount:
 *   Horizontal: (r,c)-(r,c+1) for r=0..2, c=0..1 → 3 rows × 2 per row = 6
 *   Right-down: (r,c)-(r+1,c) for r=0..1, c=0..2 → 2 inter-rows × 3 per row = 6
 *   Left-down:  (r,c)-(r+1,c+1) for r=0..1, c=0..1 → 2 inter-rows × 2 per row = 4
 *   Total: 6+6+4 = 16 ✓
 *
 * Wait — the "left-down" edge goes from (r,c) to (r+1,c+1) which in screen coords goes:
 *   Δx = (2-r-1)*S/2 + (c+1)*S − [(2-r)*S/2 + c*S] = S - S/2 = S/2  (right by S/2)
 *   Δy = H  (down by H)
 * And "right-down" goes from (r,c) to (r+1,c):
 *   Δx = (2-r-1)*S/2 + c*S − [(2-r)*S/2 + c*S] = -S/2  (left by S/2)
 *   Δy = H  (down by H)
 *
 * So "right-down" actually goes left-down on screen and "left-down" goes right-down.
 * The naming is relative to grid indices; screen direction is opposite because of the
 * left-lean. The unit upward triangles (△) are:
 *   apex (r+1, c)  — lower-left on screen → leftmost vertex at bottom row
 *   Wait: with left-lean, node (r+1, c) is to the LEFT of (r, c).
 *   An upward △ in screen coordinates (apex at TOP = small y) is:
 *     (r, c), (r, c+1), (r+1, c+1)  — two on top row (small y), one below them.
 *   Checking: (r,c) at x=(2-r)*S/2+c*S, (r,c+1) at x=(2-r)*S/2+(c+1)*S,
 *   (r+1,c+1) at x=(2-r-1)*S/2+(c+1)*S = (2-r)*S/2-S/2+(c+1)*S.
 *   For (r+1,c+1) to be BETWEEN (r,c) and (r,c+1) horizontally:
 *   (2-r)*S/2-S/2+(c+1)*S = (2-r)*S/2+c*S+S/2 = x(r,c)+S/2  ← between x(r,c) and x(r,c+1) ✓
 *   And y(r+1,c+1) = PAD+(r+1)*H > PAD+r*H = y(r,c). ✓  So apex is BELOW = downward △.
 *   The UPWARD △ is: (r+1,c), (r+1,c+1), (r,c+1) — two nodes on bottom row, one above.
 *
 * For the static problem figure we just draw all 16 edges and all 9 nodes as matchsticks.
 * The figure does NOT mark or label any triangle.
 *
 * Pure render — no Math.random, no Date, no useState/useEffect side effects.
 * SSR-safe and deterministic.
 *
 * Co-exports:
 *   STICK_SIDE       — unit triangle side length (SVG user units)
 *   TRI_NODES        — 3×3 array of {x,y} node positions
 *   STICK_EDGES      — every edge as [[r0,c0],[r1,c1]] (16 total)
 *   TriSticksMatchFigure — inner <svg> (usable by the animator)
 */

// ─── colour tokens ────────────────────────────────────────────────────────────
const STICK_COLOR = '#C8956C'   // matchstick body — warm tan
const HEAD_COLOR  = '#3B2B20'   // matchstick head — dark brown
const HEAD_R      = 5.0         // head radius (visible at card width)
const STICK_W     = 4.5         // stroke width

// ─── geometry ─────────────────────────────────────────────────────────────────
export const STICK_SIDE = 68    // equilateral triangle side in SVG units

const S    = STICK_SIDE
const SQ3  = Math.sqrt(3)
const H    = S * SQ3 / 2        // row-to-row height ≈ 59
const NROW = 3                  // 3 rows of nodes (2 triangle rows)
const NCOL = 3                  // 3 columns of nodes (2 triangle columns)
const PAD  = 22                 // outer padding

// Left-leaning parallelogram: row r shifts LEFT by S/2 relative to row r-1.
// Screen coordinate of node (r, c):
//   x = PAD + (NROW-1-r) * (S/2) + c * S
//   y = PAD + r * H
export type NodePos = { x: number; y: number }

function buildNodes(): NodePos[][] {
  return Array.from({ length: NROW }, (_, r) =>
    Array.from({ length: NCOL }, (__, c) => ({
      x: PAD + (NROW - 1 - r) * (S / 2) + c * S,
      y: PAD + r * H,
    })),
  )
}

export const TRI_NODES: NodePos[][] = buildNodes()

// ─── edges ───────────────────────────────────────────────────────────────────
// 16 edges = 6 horizontal + 6 right-down + 4 left-down.
// "Right-down" (in grid index): (r,c) → (r+1,c)   [goes LEFT on screen due to left-lean]
// "Left-down"  (in grid index): (r,c) → (r+1,c+1) [goes RIGHT on screen]
// Both diagonal types together form the unit equilateral triangles.
type EdgeIdx = [[number, number], [number, number]]

function buildEdges(): EdgeIdx[] {
  const edges: EdgeIdx[] = []
  for (let r = 0; r < NROW; r++) {
    // Horizontal edges within row r
    for (let c = 0; c < NCOL - 1; c++) {
      edges.push([[r, c], [r, c + 1]])
    }
    if (r < NROW - 1) {
      // Right-down (goes left on screen): (r,c) → (r+1,c), for all c
      for (let c = 0; c < NCOL; c++) {
        edges.push([[r, c], [r + 1, c]])
      }
      // Left-down (goes right on screen): (r,c) → (r+1,c+1), for c < NCOL-1
      for (let c = 0; c < NCOL - 1; c++) {
        edges.push([[r, c], [r + 1, c + 1]])
      }
    }
  }
  return edges
}

export const STICK_EDGES: EdgeIdx[] = buildEdges()

// ─── viewBox sizing ──────────────────────────────────────────────────────────
// Leftmost node: (NROW-1, 0) → x = PAD + 0*(S/2) + 0 = PAD
// Rightmost node: (0, NCOL-1) → x = PAD + (NROW-1)*(S/2) + (NCOL-1)*S = PAD + S + 2S = PAD + 3S
// Bottom node: (NROW-1, *) → y = PAD + (NROW-1)*H
const VB_W = Math.ceil(PAD * 2 + (NCOL - 1) * S + (NROW - 1) * (S / 2) + HEAD_R * 2)
const VB_H = Math.ceil(PAD * 2 + (NROW - 1) * H + HEAD_R * 2)

// ─── drawing primitive ───────────────────────────────────────────────────────

/**
 * The inner <svg> for WMI-24F2A-Q19.
 * SSR-safe and aria-hidden (the outer wrapper carries the accessible label).
 * The optional `highlightEdges` prop lets the animator dim/colour specific sticks.
 */
export function TriSticksMatchFigure({
  highlightEdges,
  dimEdges,
}: {
  highlightEdges?: EdgeIdx[]
  dimEdges?: EdgeIdx[]
} = {}) {
  const nodes = TRI_NODES

  function canonKey([[r0, c0], [r1, c1]]: EdgeIdx): string {
    return r0 < r1 || (r0 === r1 && c0 < c1)
      ? `${r0},${c0}-${r1},${c1}`
      : `${r1},${c1}-${r0},${c0}`
  }

  const hiSet  = new Set((highlightEdges ?? []).map(canonKey))
  const dimSet = new Set((dimEdges ?? []).map(canonKey))

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={Math.min(320, VB_W)}
      style={{ display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Matchstick sticks */}
      {STICK_EDGES.map((edge, i) => {
        const [[r0, c0], [r1, c1]] = edge
        const a = nodes[r0][c0]
        const b = nodes[r1][c1]
        const key = canonKey(edge)
        const isHi  = hiSet.has(key)
        const isDim = dimSet.has(key)
        return (
          <line
            key={`e-${i}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={isHi ? '#E05A00' : STICK_COLOR}
            strokeWidth={STICK_W}
            strokeLinecap="round"
            opacity={isDim ? 0.25 : 1}
          />
        )
      })}

      {/* Matchstick heads (nodes) */}
      {nodes.flat().map((n, i) => (
        <circle key={`n-${i}`} cx={n.x} cy={n.y} r={HEAD_R} fill={HEAD_COLOR} />
      ))}
    </svg>
  )
}

// ─── default export ───────────────────────────────────────────────────────────

/**
 * In-card illustration for WMI-24F2A-Q19.
 *
 * Draws the matchstick triangle arrangement — a 2×2 left-leaning isometric
 * parallelogram with 8 triangles (4 pointing up, 4 pointing down).  The static
 * figure shows ONLY the problem setup: never which sticks to remove, never which
 * triangles are which size, never the answer.
 *
 * The `params` argument is accepted but ignored; the geometry is fully determined
 * by the problem statement (no runtime parameters needed).
 */
export default function TriSticks24G2Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Susunan batang korek api membentuk jajaran segitiga sama sisi — dua baris dua kolom segitiga kecil, membentuk total 8 segitiga dari berbagai ukuran. Tentukan berapa minimal batang korek api yang harus diambil agar tidak ada segitiga yang tersisa."
    >
      <TriSticksMatchFigure />
    </div>
  )
}
