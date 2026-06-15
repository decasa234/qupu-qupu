import type { WmiChoice } from '../../../types/wmi'

// Choice renderer for WMI-22F1A-Q11 (Grade 1). Each option A–D is a picture of
// four balls, where every ball has a colour (black/white) and a size
// (large/small). The puzzle: Kiki has more BLACK than WHITE balls AND more
// LARGE than SMALL balls — option B is the unique set satisfying both.
//
// The four sets are read off the source paper's option images and hardcoded
// below, keyed by the choice label (A/B/C/D), so the rendering can never drift.
// `BallSet` is also exported as a reusable primitive for the explainer, with an
// optional `mark` that rings the balls matching a given attribute (e.g. the
// black ones) so the explainer can highlight one condition at a time.

export type BallColor = 'black' | 'white'
export type BallSize = 'large' | 'small'
export interface Ball {
  color: BallColor
  size: BallSize
}

export type BallMark = 'black' | 'white' | 'large' | 'small'

// Read directly from the option images in
// wmiPastPaper/2022 WMI Final G01 Paper A/images/:
//   A: black/large, black/large, white/large, white/small  -> 2B/2W, 3L/1S
//   B: black/large, white/large, black/large, black/small   -> 3B/1W, 3L/1S  (answer)
//   C: white/large, black/large, black/small, black/small   -> 3B/1W, 2L/2S
//   D: white/large, black/small, white/large, white/small   -> 1B/3W, 2L/2S
export const BALL_SETS: Record<'A' | 'B' | 'C' | 'D', Ball[]> = {
  A: [
    { color: 'black', size: 'large' },
    { color: 'black', size: 'large' },
    { color: 'white', size: 'large' },
    { color: 'white', size: 'small' },
  ],
  B: [
    { color: 'black', size: 'large' },
    { color: 'white', size: 'large' },
    { color: 'black', size: 'large' },
    { color: 'black', size: 'small' },
  ],
  C: [
    { color: 'white', size: 'large' },
    { color: 'black', size: 'large' },
    { color: 'black', size: 'small' },
    { color: 'black', size: 'small' },
  ],
  D: [
    { color: 'white', size: 'large' },
    { color: 'black', size: 'small' },
    { color: 'white', size: 'large' },
    { color: 'white', size: 'small' },
  ],
}

const N = 4
const CELL_W = 46
const CELL_H = 44
const PAD = 3
const W = N * CELL_W + 2 * PAD
const H = CELL_H + 2 * PAD

const R_LARGE = 17
const R_SMALL = 11
const BLACK_FILL = '#3F3F46'
const WHITE_FILL = '#FFFFFF'
const OUTLINE = '#1F2937'
const MARK_RING = '#F97316' // qupu brand orange

function matchesMark(ball: Ball, mark?: BallMark): boolean {
  if (!mark) return false
  if (mark === 'black' || mark === 'white') return ball.color === mark
  return ball.size === mark
}

function ariaForBall(ball: Ball): string {
  const size = ball.size === 'large' ? 'besar' : 'kecil'
  const color = ball.color === 'black' ? 'hitam' : 'putih'
  return `bola ${color} ${size}`
}

/**
 * Draws one set of four balls in a row. `mark` optionally rings every ball
 * matching that attribute (used by the explainer to highlight "the black ones",
 * "the large ones", etc.). Pure render — SSR-safe and deterministic.
 */
export function BallSet({ balls, mark }: { balls: Ball[]; mark?: BallMark }) {
  const safe = Array.isArray(balls) && balls.length === N ? balls : BALL_SETS.A
  const aria = safe.map(ariaForBall).join(', ')

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: 184, display: 'block' }}
      role="img"
      aria-label={`Empat bola: ${aria}`}
    >
      {safe.map((ball, i) => {
        const cx = PAD + i * CELL_W + CELL_W / 2
        const cy = PAD + CELL_H / 2
        const r = ball.size === 'large' ? R_LARGE : R_SMALL
        const fill = ball.color === 'black' ? BLACK_FILL : WHITE_FILL
        const ringed = matchesMark(ball, mark)
        return (
          <g key={i}>
            {ringed && (
              <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke={MARK_RING} strokeWidth={2.5} />
            )}
            <circle cx={cx} cy={cy} r={r} fill={fill} stroke={OUTLINE} strokeWidth={2} />
          </g>
        )
      })}
    </svg>
  )
}

export default function Balls22G1Option({ choice }: { choice: WmiChoice }) {
  const key = (choice.label ?? '').trim().toUpperCase()
  const balls = key === 'A' || key === 'B' || key === 'C' || key === 'D' ? BALL_SETS[key] : null
  // Fallback to plain text if the label isn't one of the four known options.
  if (!balls) return <span>{choice.text}</span>
  return <BallSet balls={balls} />
}
