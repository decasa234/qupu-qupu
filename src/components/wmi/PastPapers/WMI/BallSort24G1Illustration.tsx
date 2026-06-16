// WMI-24F1A-Q24 (2024 Grade 1 Final) — answer = 6 (fill-in).
//
// "Maria plays a ball-elimination game. Moving 1 ball to another bottle is ONE
//  step. Each bottle holds at most 3 balls. When 3 balls of the SAME colour are
//  together in one bottle, those 3 are eliminated. At the start there are four
//  bottles, three of which each hold 3 balls (in 3 colours). What is the MINIMUM
//  number of steps to eliminate every ball?"
//
// COLOURS recovered from the scan (db/seed/wmi/figures/2024-final-g1-a-q24.jpg),
// read bottom -> top inside each U-shaped bottle:
//   Bottle 1 (left)  : white, white, yellow  -> "WWY"
//   Bottle 2         : yellow, red,   red     -> "YRR"
//   Bottle 3         : white,  red,   yellow  -> "WRY"
//   Bottle 4         : empty                  -> ""
// Totals: yellow 3, red 3, white 3  (3 of each — consistent).
//
// SOLVER-FIRST CONFIRMATION (throwaway BFS over game states, since deleted):
//   A move takes the TOP ball of one bottle and drops it onto another bottle
//   (only if that bottle holds < 3); each move costs 1 step; any bottle that
//   reaches 3 same-colour balls is emptied. BFS over canonicalised states gives
//   MINIMUM = 6 steps. One optimal sequence (1-based bottle ids):
//     1. red    : bottle 2 -> bottle 4        B2=YR  B4=R
//     2. red    : bottle 2 -> bottle 4        B2=Y   B4=RR
//     3. yellow : bottle 1 -> bottle 2        B1=WW  B2=YY
//     4. yellow : bottle 3 -> bottle 2        B3=WR  B2=YYY -> eliminated (B2=[])
//     5. red    : bottle 3 -> bottle 4        B3=W   B4=RRR -> eliminated (B4=[])
//     6. white  : bottle 3 -> bottle 1        B3=[]  B1=WWW -> eliminated (B1=[])
//   After step 6 all four bottles are empty -> all balls eliminated in 6 steps.
//
// This FIGURE draws ONLY the starting setup (four bottles with their balls). It
// never draws a move or which triple is eliminated — that is the animator's job
// via the co-exported BallSort24G1 primitive (pass `state` / `step`).
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic. Raw hex is
// allowed for the three ball colours (no exact qupu token); qupu tokens drive
// the bottle glass / ink where one exists.

// ---- colours ----------------------------------------------------------------
const INK = '#1F2937' // bottle outlines + ball rims
const GLASS = '#EAF2F8' // faint glass tint inside each bottle

// The three ball colours, each with a fill + a darker rim so the white ball is
// still legible on the cream card.
const BALL_FILL: Record<BallColor, string> = {
  Y: '#ffdd55', // qupu-brand-yellow
  R: '#E23B3B', // red (matches the scan's solid red balls)
  W: '#FFFFFF', // white
}
const BALL_RIM: Record<BallColor, string> = {
  Y: '#C9A200',
  R: '#A11E1E',
  W: '#B7C2CC',
}

export type BallColor = 'Y' | 'R' | 'W'

/** A board state: one entry per bottle, each a bottom->top colour string. */
export type BallSortState = string[]

/** The verified starting configuration (bottom -> top per bottle). */
export const START_STATE: BallSortState = ['WWY', 'YRR', 'WRY', '']

// ---- geometry ---------------------------------------------------------------
const CAP = 3 // balls per bottle
const BALL_R = 16 // ball radius
const BALL_GAP = 2 // vertical gap between stacked balls
const PITCH = BALL_R * 2 + BALL_GAP // centre-to-centre stack pitch

const WALL = 3 // glass wall stroke width
const INNER_PAD = 4 // gap between ball edge and glass wall
const BOTTLE_W = BALL_R * 2 + INNER_PAD * 2 // inner clear width
const NECK = 6 // straight lip above the top ball
const BOTTLE_INNER_H = CAP * PITCH - BALL_GAP + INNER_PAD * 2
const BOTTLE_H = BOTTLE_INNER_H + NECK
const RADIUS = BOTTLE_W / 2 + INNER_PAD * 0.6 // rounding of the U base

const BOTTLE_GAP = 26 // gap between adjacent bottles
const PAD_X = 18
const PAD_TOP = 16
const PAD_BOTTOM = 16

const N_BOTTLES = 4
const CONTENT_W = N_BOTTLES * BOTTLE_W + (N_BOTTLES - 1) * BOTTLE_GAP
const VIEW_W = CONTENT_W + PAD_X * 2 + WALL // + wall so strokes don't clip
const VIEW_H = BOTTLE_H + PAD_TOP + PAD_BOTTOM

/** Left x of bottle i's inner clear area. */
function bottleX(i: number): number {
  return PAD_X + WALL / 2 + i * (BOTTLE_W + BOTTLE_GAP)
}

/** Centre y of the ball at stack position `pos` (0 = bottom) in a bottle. */
function ballCy(pos: number): number {
  // Bottom ball sits just above the U base; stack upward.
  const bottomCy = PAD_TOP + BOTTLE_H - INNER_PAD - BALL_R
  return bottomCy - pos * PITCH
}

/** A single U-shaped bottle outline (open top), as a stroked path. */
function BottleGlass({ x }: { x: number }) {
  const left = x
  const right = x + BOTTLE_W
  const top = PAD_TOP
  const bottom = PAD_TOP + BOTTLE_H
  const baseTop = bottom - RADIUS
  // Open-top U: down the left wall, round the base, up the right wall.
  const d = `M ${left} ${top}
             L ${left} ${baseTop}
             Q ${left} ${bottom} ${left + RADIUS} ${bottom}
             L ${right - RADIUS} ${bottom}
             Q ${right} ${bottom} ${right} ${baseTop}
             L ${right} ${top}`
  return (
    <>
      {/* faint glass body fill (clipped to the U via the same path, filled) */}
      <path d={`${d} Z`} fill={GLASS} opacity={0.55} />
      <path d={d} fill="none" stroke={INK} strokeWidth={WALL} strokeLinejoin="round" strokeLinecap="round" />
    </>
  )
}

/** One coloured ball with a soft top highlight, drawn inside a bottle. */
function Ball({ cx, cy, color }: { cx: number; cy: number; color: BallColor }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={BALL_R} fill={BALL_FILL[color]} stroke={BALL_RIM[color]} strokeWidth={2} />
      {/* glossy highlight */}
      <ellipse cx={cx - BALL_R * 0.32} cy={cy - BALL_R * 0.38} rx={BALL_R * 0.34} ry={BALL_R * 0.22} fill="#FFFFFF" opacity={0.5} />
    </g>
  )
}

export interface BallSort24G1Props {
  /**
   * Board to draw — one bottom->top colour string per bottle. Defaults to the
   * verified starting configuration. The animator passes successive states to
   * replay the 6-move solution.
   */
  state?: BallSortState
  /**
   * Optional 0-based step label for the animator's overlay (e.g. "Step 3").
   * Purely cosmetic; when omitted no label is drawn. Does NOT change the board —
   * pass the matching `state` for the balls.
   */
  step?: number
}

/** Narrow + sanitise an arbitrary board into 4 bottles of valid colours. */
function normalize(state: BallSortState | undefined): BallSortState {
  if (!Array.isArray(state) || state.length !== N_BOTTLES) return START_STATE
  const ok = state.every(
    (b) => typeof b === 'string' && b.length <= CAP && [...b].every((c) => c === 'Y' || c === 'R' || c === 'W'),
  )
  return ok ? state : START_STATE
}

/**
 * Primitive board: four U-shaped bottles with their balls. With no props it is
 * the pristine starting setup (the question state). The animator drives it with
 * `state` (and an optional `step` label) to replay moves. It NEVER marks which
 * triple gets eliminated — that reveal is layered on top by the animator.
 */
export function BallSort24G1({ state, step }: BallSort24G1Props = {}) {
  const board = normalize(state)
  const showStep = typeof step === 'number'
  // Reserve a thin strip at the top for the optional step label.
  const labelH = showStep ? 18 : 0
  const h = VIEW_H + labelH

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${h}`} width={Math.min(320, VIEW_W)} aria-hidden="true">
      <g transform={`translate(0, ${labelH})`}>
        {board.map((bottle, i) => {
          const x = bottleX(i)
          const cx = x + BOTTLE_W / 2
          return (
            <g key={i}>
              <BottleGlass x={x} />
              {[...bottle].map((c, pos) => (
                <Ball key={pos} cx={cx} cy={ballCy(pos)} color={c as BallColor} />
              ))}
            </g>
          )
        })}
      </g>
      {showStep && (
        <text x={VIEW_W / 2} y={13} textAnchor="middle" fontSize={13} fontWeight={700} fill={INK}>
          {`Langkah ${step}`}
        </text>
      )}
    </svg>
  )
}

// Indonesian aria description — states the rules and the starting bottles, but
// never the minimum number of steps (the answer).
const ARIA =
  'Permainan eliminasi bola: empat botol, masing-masing memuat paling banyak 3 bola. ' +
  'Memindahkan 1 bola ke botol lain dihitung 1 langkah, dan jika 3 bola sewarna berkumpul ' +
  'dalam satu botol, ketiganya hilang. Pada awalnya tiga botol terisi penuh dengan 3 bola ' +
  '(tiga warna: kuning, merah, putih) dan satu botol kosong. Berapa langkah minimum untuk ' +
  'menghilangkan semua bola?'

/**
 * Question figure — the four starting bottles with their balls as recovered from
 * the scan. Answer-free: it shows the setup only, never a move or the minimum
 * step count.
 */
export default function BallSort24G1Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <BallSort24G1 />
    </div>
  )
}
