// WMI-25F1A-Q15 (2025 Grade 1 Final) — storyboard for the post-answer animation.
//
// QUESTION: a 4x4 grid of 16 small squares; draw one straight line — at most how
// many squares can it pass through?  ANSWER: 7 (choice D).
//
// METHOD (one idea per beat): a straight line starts inside ONE cell, and the only
// way it can enter a NEW cell is to cross a gridline. A 4x4 grid has 3 interior
// vertical + 3 interior horizontal gridlines. A near-diagonal line that dodges
// every corner crosses all 6 -> 1 start cell + 6 crossings = 7 cells.
// That is the formula 2n - 1 = 2(4) - 1 = 7.
//
// Beats: bare grid (goal) -> draw the line -> "starts in 1 cell" -> count the 3
// vertical crossings -> count the 3 horizontal crossings -> shade all 7 (result).
//
// Pure builder: (lang) => storyboard. No Math.random, no Date — SSR-safe.

import type { Lang } from '../concepts/explainers/makeTenSteps'
import { GRID_N, ANSWER } from './LineSquares25G1Illustration'

export type LineSquaresPhase = 'goal' | 'line' | 'start' | 'vert' | 'horiz' | 'result'

export interface LineSquaresStep {
  phase: LineSquaresPhase
  /** Draw the optimal near-diagonal line on the grid. */
  showLine: boolean
  /** Shade the 7 crossed cells. */
  shadeCrossed: boolean
  /** Running cell count to show in the tally (0 = hide the tally). */
  running: number
  /** Number of crossings being highlighted on this beat (for the badge). */
  crossings: number | null
  caption: string
  hold: number
  result: boolean
}

export interface LineSquaresStoryboard {
  answer: number
  /** Interior gridlines of one orientation = GRID_N - 1 = 3. */
  interior: number
  steps: LineSquaresStep[]
  finalIndex: number
}

export function buildLineSquares25G1Steps(lang: Lang): LineSquaresStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const interior = GRID_N - 1 // 3 vertical, 3 horizontal interior lines

  const steps: LineSquaresStep[] = [
    {
      phase: 'goal',
      showLine: false,
      shadeCrossed: false,
      running: 0,
      crossings: null,
      hold: 1700,
      result: false,
      caption: t(
        'One straight line across the grid — how many squares can it touch?',
        'Satu garis lurus melintasi kisi — berapa kotak yang bisa dilewati?',
      ),
    },
    {
      phase: 'line',
      showLine: true,
      shadeCrossed: false,
      running: 0,
      crossings: null,
      hold: 1700,
      result: false,
      caption: t(
        'Slant the line so it just misses every corner.',
        'Miringkan garis agar nyaris melewati setiap sudut.',
      ),
    },
    {
      phase: 'start',
      showLine: true,
      shadeCrossed: false,
      running: 1,
      crossings: null,
      hold: 1700,
      result: false,
      caption: t(
        'It begins inside 1 square. A new square is reached only by crossing a line.',
        'Mulai di dalam 1 kotak. Kotak baru hanya didapat saat melewati garis.',
      ),
    },
    {
      phase: 'vert',
      showLine: true,
      shadeCrossed: false,
      running: 1 + interior, // 4
      crossings: interior,
      hold: 1800,
      result: false,
      caption: t(
        `Cross all ${interior} up-and-down lines: 1 + ${interior} = ${1 + interior} squares.`,
        `Lewati ${interior} garis tegak: 1 + ${interior} = ${1 + interior} kotak.`,
      ),
    },
    {
      phase: 'horiz',
      showLine: true,
      shadeCrossed: false,
      running: 1 + interior * 2, // 7
      crossings: interior,
      hold: 1800,
      result: false,
      caption: t(
        `Cross all ${interior} side-to-side lines too: ${1 + interior} + ${interior} = ${1 + interior * 2}.`,
        `Lewati ${interior} garis mendatar juga: ${1 + interior} + ${interior} = ${1 + interior * 2}.`,
      ),
    },
    {
      phase: 'result',
      showLine: true,
      shadeCrossed: true,
      running: ANSWER, // 7
      crossings: null,
      hold: 0,
      result: true,
      caption: t(
        `1 start + 6 crossings = ${ANSWER} squares. (2 x ${GRID_N} - 1 = ${ANSWER}.)`,
        `1 awal + 6 lintasan = ${ANSWER} kotak. (2 x ${GRID_N} - 1 = ${ANSWER}.)`,
      ),
    },
  ]

  return { answer: ANSWER, interior, steps, finalIndex: steps.length - 1 }
}
