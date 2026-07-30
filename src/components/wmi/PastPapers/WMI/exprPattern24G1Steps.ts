// Storyboard for WMI-24F1A-Q16 (2024 Grade 1 Final) — answer = 9.
//
// "28 − 1, 27 − 3, 26 − 5, … find the 7th result (★)."
// The n-th expression is (29 − n) − (2n − 1) = 30 − 3n, so the results run
//   n: 1  2  3  4  5  6  7
//   r: 27 24 21 18 15 12  9
// The 7th expression is 22 − 13 = 9, so ★ = 9.
//
// The figure is a single LEFT-TO-RIGHT row of seven chips, so ★ is the seventh
// CHIP — not a row of its own.
//
// This builder is a PURE function of `lang`: no Math.random, no Date. It walks
// the *method* one idea per beat — name the goal, expose the two rules that
// drive the chips (minuend −1, subtrahend +2), then reveal results along the
// row until the ★ chip lands on 9. The winning beat is the last beat (hold 0).

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import {
  EXPR_COUNT,
  GIVEN_COUNT,
  EXPR_ROWS,
  exprMinuend,
  exprSubtrahend,
  exprResult,
} from './ExprPattern24G1Illustration'

export type ExprPatternPhase = 'goal' | 'ruleMinuend' | 'ruleSubtrahend' | 'count' | 'result'

export interface ExprPatternStep {
  phase: ExprPatternPhase
  /** Chips 1..revealUpTo whose expressions are filled in on this beat. */
  revealUpTo: number
  /** Print each visible chip's "= r" result pill on this beat. */
  showResults: boolean
  /** The chip (1-based) this beat is focused on, or null for goal/rule beats. */
  focus: number | null
  caption: string
  hold: number
  result: boolean
}

export interface ExprPatternStoryboard {
  /** The ★ answer (7th result). */
  answer: number
  steps: ExprPatternStep[]
  finalIndex: number
}

/** The ★ chip's solved expression as a string, e.g. "22 − 13". */
const STAR_EXPR = `${exprMinuend(EXPR_COUNT)} − ${exprSubtrahend(EXPR_COUNT)}`

export function buildExprPattern24G1Steps(lang: Lang): ExprPatternStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const answer = exprResult(EXPR_COUNT)
  const steps: ExprPatternStep[] = []

  // 1) Name the goal — only the given chips are showing, ★ still a mystery.
  steps.push({
    phase: 'goal',
    revealUpTo: GIVEN_COUNT,
    showResults: false,
    focus: null,
    hold: 2000,
    result: false,
    caption: t(
      'Three sums are given. We want the 7th one — the ★ chip.',
      'Tiga pengurangan diberi. Kita cari yang ke-7 — kotak ★.',
    ),
  })

  // 2) Rule for the first number (minuend): 28, 27, 26 … goes DOWN by 1 per chip.
  steps.push({
    phase: 'ruleMinuend',
    revealUpTo: GIVEN_COUNT,
    showResults: false,
    focus: null,
    hold: 2100,
    result: false,
    caption: t(
      'First number: 28, 27, 26 … it drops by 1 each chip.',
      'Angka depan: 28, 27, 26 … turun 1 tiap kotak.',
    ),
  })

  // 3) Rule for the second number (subtrahend): 1, 3, 5 … goes UP by 2 per chip.
  steps.push({
    phase: 'ruleSubtrahend',
    revealUpTo: GIVEN_COUNT,
    showResults: false,
    focus: null,
    hold: 2100,
    result: false,
    caption: t(
      'Second number: 1, 3, 5 … it climbs by 2 each chip.',
      'Angka belakang: 1, 3, 5 … naik 2 tiap kotak.',
    ),
  })

  // 4) Reveal results along the row, one chip per beat: 27, 24, 21, 18, 15, 12.
  for (let n = 1; n < EXPR_COUNT; n++) {
    const chip = EXPR_ROWS[n - 1]
    const r = exprResult(n)
    steps.push({
      phase: 'count',
      revealUpTo: n,
      showResults: true,
      focus: n,
      hold: 1500,
      result: false,
      caption: t(
        `${chip.minuend} − ${chip.subtrahend} = ${r}.`,
        `${chip.minuend} − ${chip.subtrahend} = ${r}.`,
      ),
    })
  }

  // 5) The ★ chip lands: fill the 7th expression (22 − 13) and read off 9.
  steps.push({
    phase: 'result',
    revealUpTo: EXPR_COUNT,
    showResults: true,
    focus: EXPR_COUNT,
    hold: 0,
    result: true,
    caption: t(
      `The ★ chip is ${STAR_EXPR} = ${answer}.`,
      `Kotak ★ adalah ${STAR_EXPR} = ${answer}.`,
    ),
  })

  return { answer, steps, finalIndex: steps.length - 1 }
}
