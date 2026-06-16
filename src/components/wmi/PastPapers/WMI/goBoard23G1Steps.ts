// Storyboard for WMI-23F1A-Q1 (2023 Grade 1 Final).
//
// Question: "How many MORE black go stones are there than white go stones?"
// Answer: 5 (18 black − 13 white).
//
// Method taught (deduce, don't assert): we DON'T just announce 18 − 13. We pair
// up stones — one white together with one black, a matched pair, 13 times — so 13
// blacks are "used up" cancelling the 13 whites. Whatever black is left over is
// the extra. Then the remaining 5 black stones light up with a running counter
// 1..5, landing on the answer.
//
// Pure (lang) => storyboard. Deterministic: pairing reads stones in board order,
// no Math.random / Date. SSR-safe.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { GO_STONES, stoneId } from './GoBoard23G1Illustration'

export type GoBoardPhase = 'intro' | 'pair' | 'extra' | 'result'

export interface GoBoardStep {
  phase: GoBoardPhase
  /** White stone ringed this beat (matched-pair partner), or null. */
  white: string | null
  /** Black stone ringed this beat (the pair's black, or an extra black). */
  black: string | null
  /** Every white id ringed so far (cumulative, stays on screen). */
  whitesSoFar: string[]
  /** Every black id ringed so far (cumulative, stays on screen). */
  blacksSoFar: string[]
  /** Pairs completed so far (the matched count). */
  pairs: number
  /** Extra (leftover) black stones revealed so far — this is the running answer. */
  extra: number
  caption: string
  hold: number
  result: boolean
}

export interface GoBoardStoryboard {
  blackTotal: number
  whiteTotal: number
  answer: number
  /** Black ids matched into pairs, in pairing order. */
  pairedBlacks: string[]
  /** White ids, in pairing order. */
  whites: string[]
  /** The leftover black ids (the extras that make the answer). */
  extraBlacks: string[]
  steps: GoBoardStep[]
  finalIndex: number
}

export function buildGoBoard23G1Steps(lang: Lang): GoBoardStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Read the board in row-major order so the pairing is deterministic and the
  // lit stones march across the board in a natural reading sweep.
  const ordered = [...GO_STONES].sort((a, b) => (a.row - b.row) || (a.col - b.col))
  const whites = ordered.filter((s) => s.color === 'white').map((s) => stoneId(s.row, s.col))
  const blacks = ordered.filter((s) => s.color === 'black').map((s) => stoneId(s.row, s.col))

  const whiteTotal = whites.length // 13
  const blackTotal = blacks.length // 18
  const pairedBlacks = blacks.slice(0, whiteTotal) // first 13 blacks pair off the 13 whites
  const extraBlacks = blacks.slice(whiteTotal) // 5 leftover blacks = the answer
  const answer = extraBlacks.length

  const steps: GoBoardStep[] = []

  // 1) Goal beat — state the strategy, no answer yet.
  steps.push({
    phase: 'intro',
    white: null,
    black: null,
    whitesSoFar: [],
    blacksSoFar: [],
    pairs: 0,
    extra: 0,
    hold: 1900,
    result: false,
    caption: t(
      'How many MORE black than white? Pair up one white with one black.',
      'Berapa LEBIH banyak hitam daripada putih? Pasangkan satu putih dengan satu hitam.',
    ),
  })

  // 2) Pairing beats — ring one white + one black each beat (a matched pair).
  const whitesSoFar: string[] = []
  const blacksSoFar: string[] = []
  for (let i = 0; i < whiteTotal; i++) {
    whitesSoFar.push(whites[i])
    blacksSoFar.push(pairedBlacks[i])
    const pairs = i + 1
    steps.push({
      phase: 'pair',
      white: whites[i],
      black: pairedBlacks[i],
      whitesSoFar: [...whitesSoFar],
      blacksSoFar: [...blacksSoFar],
      pairs,
      extra: 0,
      hold: 1300,
      result: false,
      caption: t(
        `Pair ${pairs}: one white, one black. ${pairs} of ${whiteTotal} whites matched.`,
        `Pasangan ${pairs}: satu putih, satu hitam. ${pairs} dari ${whiteTotal} putih cocok.`,
      ),
    })
  }

  // 3) Bridge beat — all whites are matched; the leftover blacks are the extra.
  steps.push({
    phase: 'pair',
    white: null,
    black: null,
    whitesSoFar: [...whitesSoFar],
    blacksSoFar: [...blacksSoFar],
    pairs: whiteTotal,
    extra: 0,
    hold: 1900,
    result: false,
    caption: t(
      `All ${whiteTotal} whites are paired. The black stones left over are the extras.`,
      `Semua ${whiteTotal} putih sudah berpasangan. Batu hitam yang tersisa adalah kelebihannya.`,
    ),
  })

  // 4) Extra beats — the leftover blacks light up one at a time, counter 1..5.
  for (let k = 0; k < extraBlacks.length; k++) {
    blacksSoFar.push(extraBlacks[k])
    const extra = k + 1
    const last = k === extraBlacks.length - 1
    steps.push({
      phase: 'extra',
      white: null,
      black: extraBlacks[k],
      whitesSoFar: [...whitesSoFar],
      blacksSoFar: [...blacksSoFar],
      pairs: whiteTotal,
      extra,
      hold: 1500,
      result: false,
      caption: last
        ? t(`Leftover black ${extra}. That makes ${extra} extra blacks.`, `Hitam sisa ${extra}. Jadi ada ${extra} hitam berlebih.`)
        : t(`Leftover black ${extra}…`, `Hitam sisa ${extra}…`),
    })
  }

  // 5) Result beat — the answer, with the subtraction shown. Holds (hold = 0).
  steps.push({
    phase: 'result',
    white: null,
    black: null,
    whitesSoFar: [...whitesSoFar],
    blacksSoFar: [...blacksSoFar],
    pairs: whiteTotal,
    extra: answer,
    hold: 0,
    result: true,
    caption: t(
      `${blackTotal} black − ${whiteTotal} white = ${answer} more black stones.`,
      `${blackTotal} hitam − ${whiteTotal} putih = ${answer} batu hitam lebih banyak.`,
    ),
  })

  return {
    blackTotal,
    whiteTotal,
    answer,
    pairedBlacks,
    whites,
    extraBlacks,
    steps,
    finalIndex: steps.length - 1,
  }
}
