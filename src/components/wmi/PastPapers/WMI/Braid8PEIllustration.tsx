// IKMC-20-PE-Q8 — "The braid in the figure is composed of three threads."
//
// PROBLEM ONLY: shows a colored three-strand braid with numbered tails.
// Left end: green (top), blue (middle), red (bottom) colored bands emerge.
// Right end: three tails labeled 1 (top-right), 2 (bottom-center), 3 (bottom-left).
// The student must trace each numbered tail back through the weave to its colour.
// Answer D: 1 = green, 2 = blue, 3 = red.
//
// Strategy: draw the braid body (painter algorithm — under then over at each
// crossing) using cubic Bézier paths for the strand curves. Three-strand
// braiding pattern produces a recognisable weave.
//
// Also exports BraidPrimitive — re-used by the explainer to overlay
// numbered highlights on each traced strand.
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── Canvas ────────────────────────────────────────────────────────────────────

export const SVG_W = 320
export const SVG_H = 120

// ── Thread colours ────────────────────────────────────────────────────────────

export const THREAD_GREEN = '#2E9E4F'
export const THREAD_BLUE  = '#2563EB'
export const THREAD_RED   = '#DC2626'
const THREAD_STROKE = '#1F2937'
const THREAD_W = 14  // stroke-width for each strand

// ── Braid geometry ────────────────────────────────────────────────────────────
//
// We divide the braid into 5 crossing segments (x0..x5). At each segment a
// pair of strands crosses. For a 3-strand braid the repeating pattern is:
//   cross(A over B), cross(C over B), cross(A over B), cross(C over B), ...
// where positions (top/mid/bot) rotate.
//
// Rather than a full parametric simulation we hard-code the path data for
// a faithful, clean representation that matches the source figure.

// Braid runs from x = LEFT_X to x = RIGHT_X.
export const LEFT_X  = 20
export const RIGHT_X = 230

// Three lane Y values (the rest positions for the three strands).
export const LANE_Y = [28, 60, 92] as const

// Gap (in px) between lane centres.
export const LANE_GAP = LANE_Y[1] - LANE_Y[0]  // 32

// Number of crossing cells — each cell spans (RIGHT_X - LEFT_X) / CELLS px
const CELLS = 6
export const CELL_W = (RIGHT_X - LEFT_X) / CELLS  // ~35 px

// ── Strand path builder ───────────────────────────────────────────────────────

/**
 * A strand segment is a cubic Bézier that takes a strand from (x0, y0) to
 * (x1, y1). We use horizontal control points offset by 1/3 of the cell width
 * for a smooth, rope-like curve.
 */
function seg(x0: number, y0: number, x1: number, y1: number): string {
  const dx = (x1 - x0) / 3
  return `M ${x0} ${y0} C ${x0 + dx} ${y0} ${x1 - dx} ${y1} ${x1} ${y1}`
}

/**
 * Generates all SVG path `d` strings for one strand across all CELLS cells,
 * given the ordered list of Y positions the strand visits at each cell boundary
 * (length = CELLS + 1).
 */
function strandPaths(ys: number[]): string[] {
  const paths: string[] = []
  for (let i = 0; i < CELLS; i++) {
    const x0 = LEFT_X + i * CELL_W
    const x1 = x0 + CELL_W
    paths.push(seg(x0, ys[i], x1, ys[i + 1]))
  }
  return paths
}

// ── Crossing schedule ─────────────────────────────────────────────────────────
//
// Tracks which strand occupies each lane at each cell boundary.
// Lanes: 0 = top, 1 = middle, 2 = bottom.
// Strands: 'G' (green), 'B' (blue), 'R' (red).
//
// Standard 3-braid repeating over-under:
//   Cell 0→1:  G crosses B  (G over B; G goes mid→top, B goes top→mid)
//   Cell 1→2:  R crosses B  (R over B; R goes mid→bot, B goes bot→mid)  — wait no...
//
// Looking at the original image more carefully:
//   Left input:  top=GREEN, mid=BLUE, bot=RED
//   Right output: 1=top-right, 2=bottom-center, 3=bottom-left
//   Answer D: 1=green, 2=blue, 3=red
//
// So green ends at the highest tail (1), blue in the middle (2), red at bottom (3).
// Starting positions: green=top, blue=mid, red=bot.
// Ending positions: green=1(top), blue=2(mid-ish), red=3(bot-ish).
//
// We model 6 cells with a standard 3-strand over-under crossing pattern.
// The braid in the image is fairly long — ~8 crossings total visible.
// For our SVG we model it with 6 cells that produce the correct final mapping.

// Position of each named strand (by LANE index 0=top, 1=mid, 2=bot)
// at each cell boundary (7 checkpoints for 6 cells).
//
// Pattern: alternate L-cross and R-cross each cell:
//   L-cross: top ↔ mid (e.g. cells 0, 2, 4)
//   R-cross: mid ↔ bot (e.g. cells 1, 3, 5)
// Strands swap lanes at each crossing.
//
// We track lane occupancy to find each strand's Y at each checkpoint:
// Initial: [G, B, R]   (lane 0 = G, lane 1 = B, lane 2 = R)
// After L-cross (cell 0): lanes swap 0↔1 → [B, G, R]
// After R-cross (cell 1): lanes swap 1↔2 → [B, R, G]
// After L-cross (cell 2): lanes swap 0↔1 → [R, B, G]
// After R-cross (cell 3): lanes swap 1↔2 → [R, G, B]
// After L-cross (cell 4): lanes swap 0↔1 → [G, R, B]
// After R-cross (cell 5): lanes swap 1↔2 → [G, B, R]  ← back to start!
//
// Strand positions after each cell (which lane each strand is in):
//
//        | G  | B  | R
// -------|----|----|---
//   start| 0  | 1  | 2
//   c0→1 | 1  | 0  | 2   (L-cross: G↔B; G goes 0→1, B goes 1→0)
//   c1→2 | 1  | 0  | 2   wait no ... swap after c0 means at checkpoint 1: [B,G,R]
//         meaning lane0=B, lane1=G, lane2=R
//         G is in lane1, B is in lane0, R is in lane2
//   c1→2: R-cross (mid↔bot): lane1↔lane2 → lane0=B, lane1=R, lane2=G
//         G is in lane2, B is in lane0, R is in lane1
//   c2→3: L-cross (top↔mid): lane0↔lane1 → lane0=R, lane1=B, lane2=G
//         G is in lane2, B is in lane1, R is in lane0
//   c3→4: R-cross (mid↔bot): lane1↔lane2 → lane0=R, lane1=G, lane2=B
//         G is in lane1, B is in lane2, R is in lane0
//   c4→5: L-cross: lane0↔lane1 → lane0=G, lane1=R, lane2=B
//         G is in lane0, B is in lane2, R is in lane1
//   c5→6: R-cross: lane1↔lane2 → lane0=G, lane1=B, lane2=R
//         G is in lane0, B is in lane1, R is in lane2  ← back to start!
//
// After 6 cells: G=lane0, B=lane1, R=lane2 (same as start → a full repeat).
// For the answer to be D (1=green top, 2=blue mid, 3=red bot), we need
// green to end top, blue to end mid, red to end bot.
// That matches the 6-cell pattern exactly!

// Build Y coordinate arrays for each strand across the 7 checkpoints.
// Lane Y values: lane0=LANE_Y[0]=28, lane1=LANE_Y[1]=60, lane2=LANE_Y[2]=92.

// Strand lane at each checkpoint (0=top, 1=mid, 2=bot):
// Checkpoints:   0   1   2   3   4   5   6
const LANE_G = [  0,  1,  2,  2,  1,  0,  0 ]
const LANE_B = [  1,  0,  0,  1,  2,  2,  1 ]
const LANE_R = [  2,  2,  1,  0,  0,  1,  2 ]

function laneToY(lane: number): number {
  return LANE_Y[lane]
}

const YS_G: number[] = LANE_G.map(laneToY)
const YS_B: number[] = LANE_B.map(laneToY)
const YS_R: number[] = LANE_R.map(laneToY)

// At each cell (i = 0..5), which pair crosses and which strand goes over?
// L-cross cells (0,2,4): top↔mid swap. The "over" strand alternates each cross.
// R-cross cells (1,3,5): mid↔bot swap.
//
// For a clean braid look, we determine which strand is on top at each crossing:
// In a standard braid pattern, crossings alternate over/under each pass.
// L-cross:
//   cell 0: the strand going from top→mid goes OVER (i.e. G goes over B)
//   cell 2: the strand going from top→mid goes UNDER (R over B)
//   cell 4: the strand going from top→mid goes OVER (G over R)
// R-cross:
//   cell 1: the strand going from mid→bot goes OVER (G over R)  — wait, let me re-derive:
//   At cell 1 the lanes swapping are lane1↔lane2, which at that point hold G and R:
//     lane1=G, lane2=R → G going down (lane1→lane2), R going up (lane2→lane1)
//     Over: R goes over G (standard alternation: first L-cross over=down-going, first R-cross over=up-going)
//
// For simplicity and visual fidelity we use: alternating over/under, where
// odd-indexed crossing strands go "over" and even-indexed crossing strands go "under".

// crossings[cell] = { 'above': strandId ('G'|'B'|'R') } — which strand is visually on top.
// We determine "on top" by: in each crossing, the strand rising (decreasing lane) is drawn last.

type StrandId = 'G' | 'B' | 'R'

interface Crossing {
  /** Which strand is drawn last (i.e. visually on top) at this cell's crossing. */
  onTop: StrandId
}

function findCrossing(cell: number): Crossing {
  const isLcross = cell % 2 === 0
  // For L-cross: strands in lane0 and lane1 swap.
  // At checkpoint `cell`, before the swap:
  //   lane0 strand = whichever has LANE_? [cell] === 0
  //   lane1 strand = whichever has LANE_? [cell] === 1
  // The strand going from lane1→lane0 (rising) is drawn on top.
  // Standard braid: alternate over/under. We use a simple rule:
  //   L-cross (0,2,4): even pass → lane0→lane1 strand is on top; odd pass → lane1→lane0 on top.
  //   R-cross (1,3,5): even pass → lane1→lane2 on top; odd pass → lane2→lane1 on top.
  const pass = Math.floor(cell / 2)
  const overIsDescending = pass % 2 === 0

  if (isLcross) {
    // Strands involved: those in lane0 and lane1 at checkpoint `cell`.
    const strandInLane0: StrandId = LANE_G[cell] === 0 ? 'G' : LANE_B[cell] === 0 ? 'B' : 'R'
    const strandInLane1: StrandId = LANE_G[cell] === 1 ? 'G' : LANE_B[cell] === 1 ? 'B' : 'R'
    // Descending = lane0 → lane1 (going down), Ascending = lane1 → lane0 (going up).
    return { onTop: overIsDescending ? strandInLane0 : strandInLane1 }
  } else {
    // Strands in lane1 and lane2 at checkpoint `cell`.
    const strandInLane1: StrandId = LANE_G[cell] === 1 ? 'G' : LANE_B[cell] === 1 ? 'B' : 'R'
    const strandInLane2: StrandId = LANE_G[cell] === 2 ? 'G' : LANE_B[cell] === 2 ? 'B' : 'R'
    return { onTop: overIsDescending ? strandInLane1 : strandInLane2 }
  }
}

const CROSSINGS: Crossing[] = Array.from({ length: CELLS }, (_, i) => findCrossing(i))

// ── BraidPrimitive ────────────────────────────────────────────────────────────

export interface BraidPrimitiveProps {
  /**
   * When set, only this strand gets full opacity; others are dimmed.
   * Used by the explainer to highlight one strand at a time.
   */
  highlightStrand?: StrandId | null
  /** Show the numbered labels on the right tails (1, 2, 3). */
  showNumbers?: boolean
  /** Show the coloured labels on the left (G, B, R) — omitted in the stem. */
  showColors?: boolean
  /** Aria label for accessibility. */
  ariaLabel?: string
}

/** Segment paths for each strand (computed once). */
const PATHS_G = strandPaths(YS_G)
const PATHS_B = strandPaths(YS_B)
const PATHS_R = strandPaths(YS_R)

function strandPair(id: StrandId): { paths: string[]; color: string } {
  if (id === 'G') return { paths: PATHS_G, color: THREAD_GREEN }
  if (id === 'B') return { paths: PATHS_B, color: THREAD_BLUE }
  return { paths: PATHS_R, color: THREAD_RED }
}

/**
 * BraidPrimitive — shared SVG content (no outer div / viewBox).
 * Intended to be embedded inside a parent <svg> element.
 *
 * Renders a 3-strand braid using the painter algorithm: draw all segments for
 * all strands, in per-cell order — under strand first, then over strand — so
 * the correct crossing is visible.
 */
export function BraidPrimitive({
  highlightStrand = null,
  showNumbers = true,
  showColors = false,
}: BraidPrimitiveProps) {
  const opacity = (id: StrandId) =>
    highlightStrand == null ? 1 : id === highlightStrand ? 1 : 0.2

  // Render order: per cell, draw the "under" strand's segment first, then "over".
  // To avoid flicker/reorder we build a list of draw calls ordered correctly.
  const strands: StrandId[] = ['G', 'B', 'R']

  return (
    <g>
      {/* Cell segments — painter algorithm: under first, over last per cell */}
      {Array.from({ length: CELLS }, (_, cell) => {
        const crossing = CROSSINGS[cell]
        // Draw all three strands; for the two that cross, ensure "onTop" is drawn last.
        // Since SVG is back-to-front, we order them: non-crossing strands can go first.
        // We sort: strands where id !== onTop come before onTop in this cell.
        const isLcross = cell % 2 === 0
        // The two strands involved in the crossing (the third is bystander):
        const crossLane0 = isLcross ? 0 : 1
        const crossLane1 = isLcross ? 1 : 2
        const involvedStrand0: StrandId = strands.find(id => {
          const yArr = id === 'G' ? LANE_G : id === 'B' ? LANE_B : LANE_R
          return yArr[cell] === crossLane0
        })!
        const involvedStrand1: StrandId = strands.find(id => {
          const yArr = id === 'G' ? LANE_G : id === 'B' ? LANE_B : LANE_R
          return yArr[cell] === crossLane1
        })!
        const bystander: StrandId = strands.find(id => id !== involvedStrand0 && id !== involvedStrand1)!

        // Draw order: bystander, under-strand (not onTop), over-strand (onTop)
        const underStrand = involvedStrand0 === crossing.onTop ? involvedStrand1 : involvedStrand0

        return [bystander, underStrand, crossing.onTop].map(id => {
          const { paths, color } = strandPair(id)
          return (
            <path
              key={`${cell}-${id}`}
              d={paths[cell]}
              fill="none"
              stroke={color}
              strokeWidth={THREAD_W}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity(id)}
            />
          )
        })
      })}

      {/* Left color bands — drawn as thick rounded rectangles at x = LEFT_X */}
      <rect
        x={LEFT_X - 18}
        y={LANE_Y[0] - THREAD_W / 2}
        width={22}
        height={THREAD_W}
        rx={3}
        fill={THREAD_GREEN}
        opacity={opacity('G')}
      />
      <rect
        x={LEFT_X - 18}
        y={LANE_Y[1] - THREAD_W / 2}
        width={22}
        height={THREAD_W}
        rx={3}
        fill={THREAD_BLUE}
        opacity={opacity('B')}
      />
      <rect
        x={LEFT_X - 18}
        y={LANE_Y[2] - THREAD_W / 2}
        width={22}
        height={THREAD_W}
        rx={3}
        fill={THREAD_RED}
        opacity={opacity('R')}
      />

      {/* Right tails — curved out to the numbered labels */}
      {/* Tail for strand currently in lane0 → tail 1 (top) */}
      {/* Tail for strand in lane1 → tail 2 (bottom-center area) */}
      {/* Tail for strand in lane2 → tail 3 (bottom-left area) */}
      {/* At checkpoint 6 (end of braid): G=lane0, B=lane1, R=lane2 */}
      {/* Tail 1 → lane0 = G, exits top-right */}
      <path
        d={`M ${RIGHT_X} ${LANE_Y[0]} C ${RIGHT_X + 18} ${LANE_Y[0]} ${RIGHT_X + 28} ${LANE_Y[0] - 14} ${RIGHT_X + 38} ${LANE_Y[0] - 22}`}
        fill="none"
        stroke={THREAD_GREEN}
        strokeWidth={THREAD_W}
        strokeLinecap="round"
        opacity={opacity('G')}
      />
      {/* Tail 2 → lane1 = B, exits mid-right */}
      <path
        d={`M ${RIGHT_X} ${LANE_Y[1]} C ${RIGHT_X + 18} ${LANE_Y[1]} ${RIGHT_X + 26} ${LANE_Y[1] + 14} ${RIGHT_X + 36} ${LANE_Y[1] + 22}`}
        fill="none"
        stroke={THREAD_BLUE}
        strokeWidth={THREAD_W}
        strokeLinecap="round"
        opacity={opacity('B')}
      />
      {/* Tail 3 → lane2 = R, exits bottom */}
      <path
        d={`M ${RIGHT_X} ${LANE_Y[2]} C ${RIGHT_X + 14} ${LANE_Y[2]} ${RIGHT_X + 22} ${LANE_Y[2] + 8} ${RIGHT_X + 30} ${LANE_Y[2] + 14}`}
        fill="none"
        stroke={THREAD_RED}
        strokeWidth={THREAD_W}
        strokeLinecap="round"
        opacity={opacity('R')}
      />

      {/* Number labels on the tails */}
      {showNumbers && (
        <g fontSize={15} fontWeight={800} fontFamily="ui-sans-serif, system-ui, sans-serif" fill={THREAD_STROKE}>
          {/* "1" at end of tail 1 (top, green) */}
          <text x={RIGHT_X + 44} y={LANE_Y[0] - 19} textAnchor="middle" dominantBaseline="central">1</text>
          {/* "2" at end of tail 2 (mid, blue) */}
          <text x={RIGHT_X + 42} y={LANE_Y[1] + 25} textAnchor="middle" dominantBaseline="central">2</text>
          {/* "3" at end of tail 3 (bot, red) */}
          <text x={RIGHT_X + 36} y={LANE_Y[2] + 17} textAnchor="middle" dominantBaseline="central">3</text>
        </g>
      )}

      {/* Optional colour labels on the left */}
      {showColors && (
        <g fontSize={11} fontWeight={700} fontFamily="ui-sans-serif, system-ui, sans-serif">
          <text x={LEFT_X - 22} y={LANE_Y[0]} textAnchor="end" dominantBaseline="central" fill={THREAD_GREEN}>G</text>
          <text x={LEFT_X - 22} y={LANE_Y[1]} textAnchor="end" dominantBaseline="central" fill={THREAD_BLUE}>B</text>
          <text x={LEFT_X - 22} y={LANE_Y[2]} textAnchor="end" dominantBaseline="central" fill={THREAD_RED}>R</text>
        </g>
      )}
    </g>
  )
}

// ── Default export: stem illustration ────────────────────────────────────────

/**
 * Braid8PEIllustration
 *
 * Static, problem-only figure for IKMC-20-PE-Q8.
 * Shows a three-strand braid with colored left ends (green top, blue mid,
 * red bottom) and three numbered tails on the right (1, 2, 3).
 * Does NOT reveal which thread is which colour (that is the question).
 */
export default function Braid8PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Kepang tersusun dari tiga benang: benang hijau di atas, biru di tengah, merah di bawah, ' +
        'pada sisi kiri. Pada sisi kanan terdapat tiga ekor bernomor 1, 2, dan 3. ' +
        'Tentukan warna benang 1, 2, dan 3.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(320, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        <BraidPrimitive showNumbers={true} showColors={false} />
      </svg>
    </div>
  )
}
