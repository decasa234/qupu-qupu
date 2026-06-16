// WMI-24F1A-Q20 (2024 Grade 1 Final) — answer = 3 (fill-in).
//
// "When a black ball ● passes through a colored tube, its number goes up or
//  down by a fixed amount for that color. Based on the equation shown, how many
//  yellow tubes does the ball pass through?"
//
// Two source scans, both reproduced here:
//
//   (1) RULE KEY — three definition panels, each a ball entering a coloured tube
//       and leaving with a shifted number:
//         Yellow  +2   (1 → 3)
//         Blue    −2   (3 → 1)
//         Red     −1   (3 → 2)
//       The deltas are GIVEN in the problem, so the legend prints them.
//
//   (2) THE EQUATION / PATH — the ball starts at 5, snakes through nine tubes
//       (top row left→right, then down, bottom row right→left) and ends at 5:
//         START 5 → [?] → [?] → 6 → [Blue] → [?] → [?] → [Red] → [?] → END 5
//       The known boxes (5, 6, 5) are drawn as the paper draws them — dot
//       arrangements, not numerals. Two tubes are named (Blue, Red); the rest
//       are "?".
//
// SOLVER (for the breakdown, NOT drawn here):
//   Segment A  5 → 6 through the two "?" before the 6-box:
//     deltas must sum to +1 → only {+2, −1} = {Yellow, Red} works → 1 yellow.
//   Segment B  6 → 5 through Blue(−2), two "?", Red(−1), one "?":
//     6 − 2 + (Σ of the three "?") − 1 = 5  ⇒  Σ of the three "?" = +2.
//     From {+2,−2,−1} the only multiset summing to +2 is {+2,+2,−2}
//     = {Yellow, Yellow, Blue} → 2 yellow.
//   Total yellow = 1 + 2 = 3. The individual unknown colours are ambiguous
//   (6 assignments fit) but EVERY one has exactly 3 yellow tubes — the answer
//   is forced and invariant. This FIGURE shows the setup only; it never marks
//   which tubes are yellow.
//
// The co-exported primitive BallTubes24G1({ litStep }) lets the animator walk
// the PATH one step at a time, tracking the ball's running number; litStep
// indexes the path nodes 0..8 (each tube/box along the snake). By default
// nothing is lit and the board is the pristine question state.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic. Raw hex is
// allowed here (no qupu token for the red/yellow tubes); qupu tokens are used
// where one exists.

const INK = '#1F2937' // ball fill + tube outlines + arrows
const HILITE = '#f0853a' // qupu-brand-orange — glow ring on the lit step

// Soft pastel tube fills + darker rims, matching the scan's coloured cylinders.
const TUBES = {
  yellow: { label: 'Yellow', delta: '+2', fill: '#FFF3B0', rim: '#E0B400', inFill: '#FFE680' },
  blue: { label: 'Blue', delta: '−2', fill: '#D7E9F7', rim: '#30598A', inFill: '#B7D6EF' },
  red: { label: 'Red', delta: '−1', fill: '#F7D9DE', rim: '#C0506A', inFill: '#EFBDC6' },
  // a "?" tube — colourless, an unknown the solver must place.
  unknown: { label: '?', delta: '', fill: '#FFFFFF', rim: '#6B7280', inFill: '#E5E7EB' },
} as const

type TubeKey = keyof typeof TUBES

// ---- the equation path ------------------------------------------------------
// The ball snakes through these nodes in order. A node is either a numbered
// BOX (a black-dot arrangement) or a TUBE (named colour or unknown "?").
type PathNode =
  | { kind: 'box'; n: number }
  | { kind: 'tube'; tube: TubeKey }

/** START 5 → ? → ? → 6 → Blue → ? → ? → Red → ? → END 5 (recovered from scan). */
export const PATH: PathNode[] = [
  { kind: 'box', n: 5 }, // START
  { kind: 'tube', tube: 'unknown' },
  { kind: 'tube', tube: 'unknown' },
  { kind: 'box', n: 6 }, // mid checkpoint
  { kind: 'tube', tube: 'blue' },
  { kind: 'tube', tube: 'unknown' },
  { kind: 'tube', tube: 'unknown' },
  { kind: 'tube', tube: 'red' },
  { kind: 'tube', tube: 'unknown' },
  { kind: 'box', n: 5 }, // END
]

// ---- geometry primitives ----------------------------------------------------
const BALL_R = 4.5 // radius of one black dot inside a box

/** Dot arrangements that mirror how the paper draws each small count. */
function dotOffsets(n: number, w: number, h: number): Array<[number, number]> {
  const cx = w / 2
  const cy = h / 2
  const dx = w * 0.26
  const dy = h * 0.26
  if (n === 5) {
    // dice-5: four corners + centre
    return [
      [cx - dx, cy - dy],
      [cx + dx, cy - dy],
      [cx, cy],
      [cx - dx, cy + dy],
      [cx + dx, cy + dy],
    ]
  }
  if (n === 6) {
    // 2 columns x 3 rows
    return [
      [cx - dx, cy - dy],
      [cx + dx, cy - dy],
      [cx - dx, cy],
      [cx + dx, cy],
      [cx - dx, cy + dy],
      [cx + dx, cy + dy],
    ]
  }
  // generic fallback: single centred dot per unit, capped
  return Array.from({ length: n }, (_, i) => [cx, cy + (i - (n - 1) / 2) * (BALL_R * 2.4)] as [number, number])
}

/** A numbered box: an outlined rectangle holding `n` black dots. */
function NumberBox({ x, y, n, lit }: { x: number; y: number; n: number; lit: boolean }) {
  const w = 56
  const h = 48
  return (
    <g>
      {lit && (
        <rect x={x - 4} y={y - 4} width={w + 8} height={h + 8} rx={8} fill="none" stroke={HILITE} strokeWidth={3} />
      )}
      <rect x={x} y={y} width={w} height={h} fill="#FFFFFF" stroke={INK} strokeWidth={1.75} />
      {dotOffsets(n, w, h).map(([ox, oy], i) => (
        <circle key={i} cx={x + ox} cy={y + oy} r={BALL_R} fill={INK} />
      ))}
    </g>
  )
}

/** A horizontal cylinder ("tube"): coloured body, dark back mouth, front rim. */
function Tube({
  x,
  y,
  w,
  h,
  tube,
  lit,
}: {
  x: number
  y: number
  w: number
  h: number
  tube: (typeof TUBES)[TubeKey]
  lit: boolean
}) {
  const ex = 6 // half-width of the elliptical ends
  const midY = y + h / 2
  const rightCx = x + w
  const ry = h / 2
  return (
    <g>
      {lit && (
        <rect x={x - ex - 4} y={y - 4} width={w + 2 * ex + 8} height={h + 8} rx={10} fill="none" stroke={HILITE} strokeWidth={3} />
      )}
      <rect x={x} y={y} width={w} height={h} fill={tube.fill} stroke={tube.rim} strokeWidth={1.75} />
      {/* back (left) opening — dark mouth the ball enters */}
      <ellipse cx={x} cy={midY} rx={ex} ry={ry} fill="#9CA3AF" stroke={tube.rim} strokeWidth={1.75} />
      <ellipse cx={x} cy={midY} rx={ex * 0.5} ry={ry * 0.55} fill="#6B7280" />
      {/* front (right) rim — the ball leaves here */}
      <ellipse cx={rightCx} cy={midY} rx={ex} ry={ry} fill={tube.inFill} stroke={tube.rim} strokeWidth={1.75} />
      <text
        x={x + w / 2}
        y={midY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={tube.label === '?' ? 16 : 11}
        fontWeight={700}
        fill={INK}
      >
        {tube.label}
      </text>
    </g>
  )
}

/** A short arrow between two points (used to connect path nodes). */
function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const ang = Math.atan2(y2 - y1, x2 - x1)
  const head = 5
  const hx1 = x2 - head * Math.cos(ang - Math.PI / 6)
  const hy1 = y2 - head * Math.sin(ang - Math.PI / 6)
  const hx2 = x2 - head * Math.cos(ang + Math.PI / 6)
  const hy2 = y2 - head * Math.sin(ang + Math.PI / 6)
  return (
    <g stroke={INK} strokeWidth={1.75} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <line x1={x2} y1={y2} x2={hx1} y2={hy1} />
      <line x1={x2} y1={y2} x2={hx2} y2={hy2} />
    </g>
  )
}

// ---- legend (rule key) ------------------------------------------------------
const LEGEND_KEYS: TubeKey[] = ['yellow', 'blue', 'red']

/** One compact legend chip: a small coloured tube + its named delta. */
function LegendChip({ x, y, tube }: { x: number; y: number; tube: (typeof TUBES)[TubeKey] }) {
  const tw = 46
  const th = 18
  return (
    <g>
      <Tube x={x} y={y} w={tw} h={th} tube={tube} lit={false} />
      <text x={x + tw + 12} y={y + th / 2} dominantBaseline="central" fontSize={14} fontWeight={700} fill={INK}>
        {tube.delta}
      </text>
    </g>
  )
}

// ---- path layout ------------------------------------------------------------
// Node slots sit on a snake: top row L→R for indices 0..3, then the path turns
// DOWN below the last top node, and the bottom row runs R→L for indices 4..9.
// The bottom row holds 6 nodes and the top row 4, so the BOTTOM row sets the
// usable width; the top row is right-aligned so its last node (box 6) sits
// directly above the first bottom node (Blue) where the path turns.
const NODE_PITCH = 62 // centre-to-centre spacing of adjacent slots within a row
const ROW_GAP = 66 // vertical distance between the two snake rows

// indices 0..3 on the top row, 4..9 on the bottom row.
const TOP_COUNT = 4
const BOT_COUNT = PATH.length - TOP_COUNT // 6

const LEFT = 36 // x of the leftmost slot's centre (bottom row's first node)
const TOP_Y = 30 // top row content baseline (top edge of the box)
const BOT_Y = TOP_Y + ROW_GAP

// The turn column: top node 3 and bottom node 4 share this x.
const TURN_CX = LEFT + (BOT_COUNT - 1) * NODE_PITCH

/** Centre x for the snake slot of a given path index. */
function slotCx(i: number): number {
  if (i < TOP_COUNT) {
    // Right-align the top row so node TOP_COUNT-1 lands on the turn column.
    return TURN_CX - (TOP_COUNT - 1 - i) * NODE_PITCH
  }
  // Bottom row flows R→L: index TOP_COUNT sits at the turn column (rightmost).
  const fromRight = i - TOP_COUNT // 0 at the turn, growing leftward
  return TURN_CX - fromRight * NODE_PITCH
}

function slotTopY(i: number): number {
  return i < TOP_COUNT ? TOP_Y : BOT_Y
}

/** Heights differ: boxes are taller than tubes; centre them on a common axis. */
const TUBE_H = 26
const TUBE_BODY_W = 44
const BOX_W = 56
const BOX_H = 48
const ROW_AXIS_TOP = TOP_Y + BOX_H / 2 // common vertical axis for top row
const ROW_AXIS_BOT = BOT_Y + BOX_H / 2

function nodeAxisY(i: number): number {
  return i < TOP_COUNT ? ROW_AXIS_TOP : ROW_AXIS_BOT
}

export interface BallTubes24G1Props {
  /**
   * Highlight one node along the equation path (0 = START box, then each tube /
   * checkpoint in path order, up to the END box). null / undefined leaves the
   * board pristine — the question's default state. Lets the animator walk the
   * path step by step while a separate layer tracks the running number.
   */
  litStep?: number | null
}

// ---- view box ---------------------------------------------------------------
// Bottom row spans the full width: from the leftmost node centre (LEFT) to the
// turn column (TURN_CX). Add half a box + the down-elbow headroom on the right.
const ELBOW_OUT = 18 // how far the turn elbow bows out past the turn column
const CONTENT_R = TURN_CX + BOX_W / 2 + ELBOW_OUT
const SIDE_PAD = 12
const LEGEND_H = 32 // band above the path for the rule-key chips
const PATH_BOTTOM = BOT_Y + BOX_H + 14
const VIEW_W = Math.max(CONTENT_R + SIDE_PAD, 360)
const VIEW_H = LEGEND_H + PATH_BOTTOM + 12

/**
 * Primitive board: the full ball-and-tubes problem — the rule-key legend
 * (Yellow +2, Blue −2, Red −1) plus the snaking equation path from 5 to 5 with
 * its named and "?" tubes. With no props it is the pristine question; the
 * animator passes `litStep` to glow one path node at a time. It NEVER marks
 * which tubes are yellow (the answer).
 */
export function BallTubes24G1({ litStep = null }: BallTubes24G1Props = {}) {
  const lit = typeof litStep === 'number' ? litStep : -1
  const legendY = 10
  const pathOffsetY = LEGEND_H

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={Math.min(360, VIEW_W)} aria-hidden="true">
      {/* outer frame */}
      <rect x={1} y={1} width={VIEW_W - 2} height={VIEW_H - 2} rx={10} fill="#FFF9F4" stroke={INK} strokeWidth={1.5} />

      {/* --- rule-key legend (deltas ARE given in the problem) --- */}
      <text x={14} y={legendY + 13} fontSize={11} fontWeight={700} fill={INK}>
        Rule
      </text>
      {LEGEND_KEYS.map((k, i) => {
        // Evenly distribute the three chips across the width after the "Rule"
        // label; each chip is a 46-wide tube + a delta label to its right.
        const start = 48
        const span = VIEW_W - start - 16
        const x = start + (i * span) / LEGEND_KEYS.length
        return <LegendChip key={k} x={x} y={legendY} tube={TUBES[k]} />
      })}
      {/* divider under the legend */}
      <line x1={10} y1={LEGEND_H - 2} x2={VIEW_W - 10} y2={LEGEND_H - 2} stroke={INK} strokeWidth={1} strokeDasharray="2 4" />

      {/* --- the equation path --- */}
      <g transform={`translate(0, ${pathOffsetY})`}>
        {/* connecting arrows between consecutive nodes */}
        {PATH.slice(0, -1).map((node, i) => {
          const cx1 = slotCx(i)
          const cx2 = slotCx(i + 1)
          const ay1 = nodeAxisY(i)
          const ay2 = nodeAxisY(i + 1)
          const halfA = PATH[i].kind === 'box' ? BOX_W / 2 : TUBE_BODY_W / 2 + 6
          const halfB = PATH[i + 1].kind === 'box' ? BOX_W / 2 : TUBE_BODY_W / 2 + 6

          // The turn happens between the last top node (box 6, top-right) and
          // the first bottom node (Blue): they share the turn column, so draw a
          // right-out / down / left-in elbow that drops between the two rows.
          if (i === TOP_COUNT - 1) {
            const startX = cx1 + halfA + 2 // right edge of box 6
            const elbowX = TURN_CX + BOX_W / 2 + ELBOW_OUT // bow out to the right
            return (
              <g key={i} stroke={INK} strokeWidth={1.75} fill="none" strokeLinecap="round" strokeLinejoin="round">
                <line x1={startX} y1={ay1} x2={elbowX} y2={ay1} />
                <line x1={elbowX} y1={ay1} x2={elbowX} y2={ay2} />
                <Arrow x1={elbowX} y1={ay2} x2={cx2 + halfB + 2} y2={ay2} />
              </g>
            )
          }

          // Top row flows L→R; bottom row flows R→L. Arrow points toward node i+1.
          if (i < TOP_COUNT - 1) {
            return <Arrow key={i} x1={cx1 + halfA + 2} y1={ay1} x2={cx2 - halfB - 2} y2={ay2} />
          }
          return <Arrow key={i} x1={cx1 - halfA - 2} y1={ay1} x2={cx2 + halfB + 2} y2={ay2} />
        })}

        {/* the nodes themselves (drawn on top of the arrows) */}
        {PATH.map((node, i) => {
          const cx = slotCx(i)
          const topY = slotTopY(i)
          const isLit = i === lit
          if (node.kind === 'box') {
            return <NumberBox key={i} x={cx - BOX_W / 2} y={topY} n={node.n} lit={isLit} />
          }
          const t = TUBES[node.tube]
          const ty = nodeAxisY(i) - TUBE_H / 2
          return <Tube key={i} x={cx - TUBE_BODY_W / 2} y={ty} w={TUBE_BODY_W} h={TUBE_H} tube={t} lit={isLit} />
        })}
      </g>
    </svg>
  )
}

// Indonesian aria description — names the rule key and the equation path, but
// never states how many tubes are yellow (the answer).
const ARIA =
  'Bola hitam melewati tabung berwarna dan bilangannya berubah sebesar jumlah ' +
  'tetap: kuning naik 2, biru turun 2, merah turun 1. Persamaan menunjukkan ' +
  'bola mulai dari 5, melewati beberapa tabung (sebagian berwarna, sebagian ' +
  'bertanda tanya), dan berakhir di 5. Berapa banyak tabung kuning yang dilewati?'

/**
 * Question figure — the rule-key legend (yellow +2, blue −2, red −1) plus the
 * snaking equation path from 5 to 5 with its named and "?" tubes. Answer-free:
 * it never reveals which unknown tubes are yellow.
 */
export default function BallTubes24G1Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <BallTubes24G1 />
    </div>
  )
}
