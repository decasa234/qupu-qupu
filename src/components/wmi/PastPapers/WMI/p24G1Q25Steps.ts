// Storyboard for WMI-24P1A-Q25 (2024 Semifinal Grade 1 Paper A).
//
// Question: a robot moves only LEFT, RIGHT, or DOWN through a grid of digits
// from the top-left entrance to the bottom-right exit. Find the smallest sum
// of the digits along the way.
//
// Method taught (build the cheapest route, don't just assert): the route is
// revealed one cell at a time, growing a running total, so the kid sees the
// sum accumulate to 24. The traced cells come straight from the DP-verified
// unique minimum path (Q25_MIN_PATH); the running total is computed from the
// grid so the captions can never drift from the figure.
//
//   2 (+1=3) (+2=5) (+2=7) (+6=13) (+2=15) (+3=18) (+1=19) (+3=22) (+2=24)
//   → smallest sum = 24, choice A.
//
// Pure (lang) => storyboard. Deterministic: no Math.random / Date. SSR-safe.

import type { Lang } from '../concepts/explainers/makeTenSteps'
import { Q25_GRID, Q25_MIN_PATH, Q25_MIN_SUM, Q25_ANSWER_LETTER } from './P24G1Q25Illustration'

export type Q25Phase = 'intro' | 'walk' | 'result'

export interface Q25Step {
  phase: Q25Phase
  /** How many cells of the min path are revealed at this beat. */
  litCount: number
  /** Running digit sum over the revealed cells. */
  runningSum: number
  caption: string
  hold: number
  result: boolean
}

export interface Q25Storyboard {
  minSum: number
  answerLetter: string
  steps: Q25Step[]
  finalIndex: number
}

export function buildP24G1Q25Steps(lang: Lang): Q25Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const digitAt = (i: number) => {
    const [r, c] = Q25_MIN_PATH[i]
    return Q25_GRID[r][c]
  }

  const steps: Q25Step[] = []

  // 1) Intro — rules + goal. No route yet.
  steps.push({
    phase: 'intro',
    litCount: 0,
    runningSum: 0,
    hold: 2000,
    result: false,
    caption: t(
      'The robot can only go left, right or down. Find the route whose digits add up to the least.',
      'Robot hanya boleh ke kiri, kanan, atau turun. Cari rute yang jumlah angkanya paling kecil.',
    ),
  })

  // 2) Walk — reveal the cheapest route one cell at a time, summing as we go.
  let running = 0
  for (let i = 0; i < Q25_MIN_PATH.length; i++) {
    const d = digitAt(i)
    running += d
    const first = i === 0
    const caption = first
      ? t(`Enter at the top: start on ${d}.`, `Masuk dari atas: mulai di ${d}.`)
      : t(`Step onto ${d} → running total ${running}.`, `Melangkah ke ${d} → total berjalan ${running}.`)
    steps.push({
      phase: 'walk',
      litCount: i + 1,
      runningSum: running,
      hold: first ? 1600 : 1400,
      result: false,
      caption,
    })
  }

  // 3) Result — the full cheapest route lands on 24.
  steps.push({
    phase: 'result',
    litCount: Q25_MIN_PATH.length,
    runningSum: Q25_MIN_SUM,
    hold: 0,
    result: true,
    caption: t(
      `This is the cheapest route: the digits add to ${Q25_MIN_SUM}. No route is smaller — answer ${Q25_ANSWER_LETTER}.`,
      `Ini rute termurah: angkanya berjumlah ${Q25_MIN_SUM}. Tidak ada yang lebih kecil — jawaban ${Q25_ANSWER_LETTER}.`,
    ),
  })

  return {
    minSum: Q25_MIN_SUM,
    answerLetter: Q25_ANSWER_LETTER,
    steps,
    finalIndex: steps.length - 1,
  }
}
