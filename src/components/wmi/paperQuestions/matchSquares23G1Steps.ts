// WMI-23F1A-Q23 (2023 Grade 1 Final) — matchstick blocks of squares.
//
// "The same number of matchsticks, x, can form a 1×a, a 2×b, or a 4×c block of
// unit squares. Find the smallest x."  Answer: x = 22 (a=7, b=4, c=2).
//
// METHOD (try-and-eliminate, one candidate per beat). An m×n block of unit
// squares uses sticks(m, n) = 2·m·n + m + n. So:
//     1×a = 3a + 1,   2×b = 5b + 2,   4×c = 9c + 4.
// The 4-row block grows fastest (9 sticks per extra column), so it is the most
// restrictive — its values are the sparsest. We walk those candidate totals
// x = 9c+4 = 13, 22, 31, … in order, and for each ask whether the SAME x can
// also tile as a 1×a (is (x−1) a positive multiple of 3?) and a 2×b (is (x−2)
// a positive multiple of 5?). The first x that clears BOTH is the smallest.
//
//   c=1 → x=13: 1×a? (13−1)/3 = 4 ✓   2×b? (13−2)/5 = 2.2 ✗  → reject.
//   c=2 → x=22: 1×7 ✓, 2×4 ✓, 4×2 ✓  → x = 22.
//
// Pure builder: (lang) => storyboard. No Math.random, no Date — SSR-safe and
// deterministic. stickCount + the solved column counts come from the
// illustration's exports, never re-asserted here.

import type { Lang } from '../concepts/explainers/makeTenSteps'
import { stickCount, ANSWER, SOLVED } from './MatchSquares23G1Illustration'

export type BlockConfig = '1xa' | '2xb' | '4xc'

/** One solved block to show on a beat: which arrangement + how many columns. */
export interface BlockView {
  config: BlockConfig
  cols: number
  /** Matchstick count for this block, from stickCount (rows·cols). */
  count: number
  /** "1×7", "2×4", "4×2" — for captions. */
  label: string
}

export interface MatchStep {
  /** The candidate total x being tested this beat (null on intro). */
  candidate: number | null
  /** Which c-value (4-row columns) produced this candidate. */
  c: number | null
  /**
   * Solved blocks to draw this beat. On a tested candidate we show the 4×c
   * block that generated x; on a surviving candidate we add the 1×a and 2×b
   * blocks once they're confirmed to also use x sticks.
   */
  blocks: BlockView[]
  /** True only on the final winning beat. */
  result: boolean
  /** True on a beat that rejects the candidate (over-restrictive linger). */
  reject: boolean
  caption: string
  hold: number
}

export interface MatchStoryboard {
  answer: number
  /** The three winning blocks: 1×7, 2×4, 4×2. */
  winners: BlockView[]
  steps: MatchStep[]
  finalIndex: number
}

const ROWS: Record<BlockConfig, number> = { '1xa': 1, '2xb': 2, '4xc': 4 }

function makeView(config: BlockConfig, cols: number): BlockView {
  return {
    config,
    cols,
    count: stickCount(ROWS[config], cols),
    label: `${ROWS[config]}×${cols}`,
  }
}

// Solve for the column count of a 1×a (a = (x−1)/3) or 2×b (b = (x−2)/5) block
// that uses exactly x sticks, or null when x doesn't divide evenly into one.
function solveCols(config: '1xa' | '2xb', x: number): number | null {
  if (config === '1xa') {
    const a = (x - 1) / 3
    return Number.isInteger(a) && a >= 1 ? a : null
  }
  const b = (x - 2) / 5
  return Number.isInteger(b) && b >= 1 ? b : null
}

export function buildMatchSquaresSteps(lang: Lang): MatchStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const winners: BlockView[] = [
    makeView('1xa', SOLVED['1xa'].cols),
    makeView('2xb', SOLVED['2xb'].cols),
    makeView('4xc', SOLVED['4xc'].cols),
  ]

  const steps: MatchStep[] = [
    {
      candidate: null,
      c: null,
      blocks: [],
      result: false,
      reject: false,
      hold: 2600,
      caption: t(
        'The same x sticks must build all three blocks. The 4-row block grows fastest, so its totals are rarest — start there.',
        'Jumlah batang x yang sama harus membuat ketiga susunan. Blok 4 baris tumbuh paling cepat, jadi totalnya paling jarang — mulai dari situ.',
      ),
    },
  ]

  // Walk c = 1, 2, … testing each 4-row total against the 1×a and 2×b blocks.
  // c=2 is the winner; we stop there.
  let c = 0
  let winnerC = 0
  while (winnerC === 0 && c < 6) {
    c += 1
    const x = stickCount(4, c) // = 9c + 4
    const fourView = makeView('4xc', c)

    // Beat: announce this 4-row candidate.
    steps.push({
      candidate: x,
      c,
      blocks: [fourView],
      result: false,
      reject: false,
      hold: 2200,
      caption: t(
        `Try 4×${c}: that uses ${x} sticks. Can ${x} also build a 1×a and a 2×b?`,
        `Coba 4×${c}: itu pakai ${x} batang. Bisakah ${x} juga membuat 1×a dan 2×b?`,
      ),
    })

    const aCols = solveCols('1xa', x)
    const bCols = solveCols('2xb', x)

    if (aCols == null) {
      // 1×a fails — reject and move on.
      steps.push({
        candidate: x,
        c,
        blocks: [fourView],
        result: false,
        reject: true,
        hold: 2100,
        caption: t(
          `1×a needs (${x} − 1) ÷ 3 — not a whole number ✗. ${x} can't be a 1-row block. Reject.`,
          `1×a perlu (${x} − 1) ÷ 3 — bukan bilangan bulat ✗. ${x} tak bisa jadi blok 1 baris. Tolak.`,
        ),
      })
      continue
    }

    const oneView = makeView('1xa', aCols)
    // 1×a works — show it.
    steps.push({
      candidate: x,
      c,
      blocks: [fourView, oneView],
      result: false,
      reject: false,
      hold: 1900,
      caption: t(
        `1×${aCols}: (${x} − 1) ÷ 3 = ${aCols} ✓ — that's a 1-row block of ${x} sticks.`,
        `1×${aCols}: (${x} − 1) ÷ 3 = ${aCols} ✓ — blok 1 baris dengan ${x} batang.`,
      ),
    })

    if (bCols == null) {
      // 2×b fails — reject.
      steps.push({
        candidate: x,
        c,
        blocks: [fourView, oneView],
        result: false,
        reject: true,
        hold: 2100,
        caption: t(
          `But 2×b needs (${x} − 2) ÷ 5 — not whole ✗. ${x} fails the 2-row block. Reject ${x}.`,
          `Tapi 2×b perlu (${x} − 2) ÷ 5 — tak bulat ✗. ${x} gagal di blok 2 baris. Tolak ${x}.`,
        ),
      })
      continue
    }

    const twoView = makeView('2xb', bCols)
    // 2×b works too — all three confirmed. This c is the winner.
    steps.push({
      candidate: x,
      c,
      blocks: [oneView, twoView, fourView],
      result: false,
      reject: false,
      hold: 2000,
      caption: t(
        `2×${bCols}: (${x} − 2) ÷ 5 = ${bCols} ✓ — and the 4×${c} too. All three use ${x}!`,
        `2×${bCols}: (${x} − 2) ÷ 5 = ${bCols} ✓ — dan 4×${c} juga. Ketiganya pakai ${x}!`,
      ),
    })
    winnerC = c
  }

  // Result beat: land on the answer with all three winning blocks.
  steps.push({
    candidate: ANSWER,
    c: winnerC,
    blocks: winners,
    result: true,
    reject: false,
    hold: 0,
    caption: t(
      `Smallest x = ${ANSWER}: it builds 1×7, 2×4 and 4×2, each with ${ANSWER} sticks.`,
      `x terkecil = ${ANSWER}: membuat 1×7, 2×4, dan 4×2, masing-masing ${ANSWER} batang.`,
    ),
  })

  return { answer: ANSWER, winners, steps, finalIndex: steps.length - 1 }
}
