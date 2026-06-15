// WMI-24F1A-Q24 (2024 Grade 1 Final) — answer = 6 (fill-in).
//
// Ball-elimination game storyboard. The figure (BallSort24G1Illustration) draws
// only the starting setup; this builder walks the verified 6-move optimal
// solution one move per beat so the animation TEACHES the method instead of
// asserting "6". Each beat carries the board state AFTER its move (a 4-string
// bottom->top board for the BallSort24G1 primitive) plus a kid-voice caption.
//
// Verified optimal sequence (board AFTER each move):
//   start            ['WWY','YRR','WRY','']
//   1. red  2 -> 4   ['WWY','YR','WRY','R']
//   2. red  2 -> 4   ['WWY','Y','WRY','RR']
//   3. yel  1 -> 2   ['WW','YY','WRY','RR']
//   4. yel  3 -> 2   bottle 2 = YYY -> cleared  ['WW','','WR','RR']
//   5. red  3 -> 4   bottle 4 = RRR -> cleared  ['WW','','W','']
//   6. wht  3 -> 1   bottle 1 = WWW -> cleared  ['','','','']
// After move 6 every bottle is empty -> 6 steps.
//
// Pure: no Math.random, no Date. (board, lang) -> storyboard. SSR-safe.

import type { Lang } from '../concepts/explainers/makeTenSteps'
import type { BallColor, BallSortState } from './BallSort24G1Illustration'
import { START_STATE } from './BallSort24G1Illustration'

export type BallSortPhase = 'intro' | 'move' | 'result'

export interface BallSortStep {
  phase: BallSortPhase
  /** The board to draw on this beat (after this beat's move). */
  state: BallSortState
  /** 1-based move number (null on intro/result). */
  move: number | null
  /** Whether this move completed a same-colour triple that cleared. */
  cleared: boolean
  /** Running step count to display (0 on intro). */
  count: number
  /** Accent colour key for the caption chip (the ball that moved). */
  color: BallColor | null
  caption: string
  /** Hold in ms; cleared moves linger a touch longer, the win beat holds (0). */
  hold: number
  result: boolean
}

export interface BallSortStoryboard {
  answer: number
  steps: BallSortStep[]
  finalIndex: number
}

/** One scripted move in the optimal solution. */
interface Move {
  color: BallColor
  from: number // 1-based bottle the top ball leaves
  to: number // 1-based bottle it lands in
  state: BallSortState // board AFTER the move
  cleared: boolean // did this move complete a triple?
}

// The verified 6-move sequence (1-based bottle ids).
const MOVES: Move[] = [
  { color: 'R', from: 2, to: 4, state: ['WWY', 'YR', 'WRY', 'R'], cleared: false },
  { color: 'R', from: 2, to: 4, state: ['WWY', 'Y', 'WRY', 'RR'], cleared: false },
  { color: 'Y', from: 1, to: 2, state: ['WW', 'YY', 'WRY', 'RR'], cleared: false },
  { color: 'Y', from: 3, to: 2, state: ['WW', '', 'WR', 'RR'], cleared: true },
  { color: 'R', from: 3, to: 4, state: ['WW', '', 'W', ''], cleared: true },
  { color: 'W', from: 3, to: 1, state: ['', '', '', ''], cleared: true },
]

const COLOR_NAME = (c: BallColor, lang: Lang): string => {
  if (lang === 'id') return c === 'R' ? 'merah' : c === 'Y' ? 'kuning' : 'putih'
  return c === 'R' ? 'red' : c === 'Y' ? 'yellow' : 'white'
}

export function buildBallSort24G1Steps(lang: Lang): BallSortStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const answer = MOVES.length // 6

  const steps: BallSortStep[] = [
    {
      phase: 'intro',
      state: START_STATE,
      move: null,
      cleared: false,
      count: 0,
      color: null,
      hold: 2200,
      result: false,
      caption: t(
        'Move the top ball to another bottle (it needs room). 3 same-colour balls pop. Use the fewest moves.',
        'Pindah bola paling atas ke botol lain (harus ada ruang). 3 bola sewarna meledak. Pakai langkah paling sedikit.',
      ),
    },
  ]

  MOVES.forEach((mv, i) => {
    const move = i + 1
    const name = COLOR_NAME(mv.color, lang)
    const caption = mv.cleared
      ? t(
          `Move ${move}: ${name} ball, bottle ${mv.from} → bottle ${mv.to}. That makes 3 ${name} — they pop!`,
          `Langkah ${move}: bola ${name}, botol ${mv.from} → botol ${mv.to}. Jadi 3 ${name} — meledak!`,
        )
      : t(
          `Move ${move}: ${name} ball, bottle ${mv.from} → bottle ${mv.to}.`,
          `Langkah ${move}: bola ${name}, botol ${mv.from} → botol ${mv.to}.`,
        )
    steps.push({
      phase: 'move',
      state: mv.state,
      move,
      cleared: mv.cleared,
      count: move,
      color: mv.color,
      // Clearing moves linger a beat longer so the "pop" reads clearly.
      hold: mv.cleared ? 2400 : 1900,
      result: false,
      caption,
    })
  })

  steps.push({
    phase: 'result',
    state: ['', '', '', ''],
    move: null,
    cleared: false,
    count: answer,
    color: null,
    hold: 0,
    result: true,
    caption: t(
      `All bottles empty in ${answer} moves. The fewest is ${answer}.`,
      `Semua botol kosong dalam ${answer} langkah. Paling sedikit ${answer}.`,
    ),
  })

  return { answer, steps, finalIndex: steps.length - 1 }
}
