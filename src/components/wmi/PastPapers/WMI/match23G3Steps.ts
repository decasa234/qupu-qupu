// WMI-23F3A-Q22 (2023 Grade 3 Final) — matchstick blocks of squares (G3 variant).
//
// "The same x matchsticks can form a 1×a, a 2×b, or a 4×c block of unit squares,
// with x < 100. Find the SUM of the largest and smallest possible x."  Answer 89.
//
// METHOD (deduce, then collect every x < 100). An m×n block of unit squares uses
// sticks(m, n) = 2·m·n + m + n. So:
//     1×a = 3a + 1,   2×b = 5b + 2,   4×c = 9c + 4.
// We need ONE x that is simultaneously a 1×a, a 2×b AND a 4×c total, with x < 100.
// The 4-row block grows fastest (9 sticks per extra column), so its totals are
// sparsest — we walk x = 9c+4 = 13, 22, 31, … and for each ask whether the SAME x
// can also tile as a 1×a (is (x−1)/3 a whole ≥ 1?) and a 2×b ((x−2)/5 a whole ≥ 1?).
//
//   c=1 → x=13:  1×a? (13−1)/3 = 4 ✓   2×b? (13−2)/5 = 2.2 ✗  → reject.
//   c=2 → x=22:  1×7 ✓, 2×4 ✓, 4×2 ✓                          → keep 22.
//   c=3 → x=31:  1×10 ✓, 2×b? (31−2)/5 = 5.8 ✗               → reject.
//   c=4 → x=40:  1×13 ✓, 2×b? (40−2)/5 = 7.6 ✗               → reject.
//   c=5 → x=49:  1×16 ✓, 2×b? (49−2)/5 = 9.4 ✗               → reject.
//   c=6 → x=58:  1×19 ✓, 2×b? (58−2)/5 = 11.2 ✗              → reject.
//   c=7 → x=67:  1×22 ✓, 2×13 ✓, 4×7 ✓                       → keep 67.
//   c=8 → x=76:  … ✗ ;  c=9 → x=85: … ✗ ;  c=10 → x=94: … ✗ .
//   c=11 → x=112 ≥ 100 → over budget, stop.
// Valid x under 100: {22, 67}. Smallest 22, largest 67 → 22 + 67 = 89.
//
// (Solutions of the system x ≡ 1 mod 3, x ≡ 2 mod 5, x ≡ 4 mod 9 are x ≡ 22 mod 45,
// i.e. 22, 67, 112, … — the animation just walks the 4-row totals and tests them.)
//
// Pure builder: (lang) => storyboard. No Math.random, no Date — SSR-safe and
// deterministic. stickCount + solved column counts come from the illustration's
// exports, never re-asserted here.

import type { Lang } from '../concepts/explainers/makeTenSteps'
import { stickCount } from './MatchSquares23G1Illustration'

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

export interface Match23G3Step {
  /** The candidate total x being tested this beat (null on intro / sum beat). */
  candidate: number | null
  /** Which c-value (4-row columns) produced this candidate. */
  c: number | null
  /** Solved blocks to draw this beat (the 4×c, plus 1×a / 2×b once confirmed). */
  blocks: BlockView[]
  /** True on a kept candidate (a valid x under 100) and on the final sum beat. */
  result: boolean
  /** True on a beat that rejects the candidate (over-restrictive linger). */
  reject: boolean
  /** True only on the final sum beat (22 + 67 = 89). */
  isSum: boolean
  /** The kept-so-far valid totals, shown as a running tally chip row. */
  found: number[]
  caption: string
  hold: number
}

export interface Match23G3Storyboard {
  answer: number
  smallest: number
  largest: number
  /** The two kept totals: 22 and 67. */
  keepers: number[]
  steps: Match23G3Step[]
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

const LIMIT = 100

export function buildMatch23G3Steps(lang: Lang): Match23G3Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Match23G3Step[] = []
  const found: number[] = []

  // Intro: the goal + the three stick-count formulas.
  steps.push({
    candidate: null,
    c: null,
    blocks: [],
    result: false,
    reject: false,
    isSum: false,
    found: [],
    hold: 2800,
    caption: t(
      'Same x sticks must build a 1×a, 2×b and 4×c block, with x < 100. Sticks: 1×a = 3a+1, 2×b = 5b+2, 4×c = 9c+4. The 4-row block is rarest — start there.',
      'Batang x sama harus membuat blok 1×a, 2×b, dan 4×c, dengan x < 100. Batang: 1×a = 3a+1, 2×b = 5b+2, 4×c = 9c+4. Blok 4 baris paling jarang — mulai dari situ.',
    ),
  })

  // Walk c = 1, 2, … as long as 9c+4 < 100, testing each 4-row total.
  let c = 0
  while (true) {
    const next = c + 1
    const x = stickCount(4, next) // = 9·next + 4
    if (x >= LIMIT) {
      // Over budget — the running total stops growing. Linger so it reads.
      steps.push({
        candidate: x,
        c: next,
        blocks: [makeView('4xc', next)],
        result: false,
        reject: true,
        isSum: false,
        found: [...found],
        hold: 2300,
        caption: t(
          `Next is 4×${next} = ${x} sticks — that's ≥ 100, over budget. So x = ${x} is too big. Stop.`,
          `Berikutnya 4×${next} = ${x} batang — itu ≥ 100, lewat batas. Jadi x = ${x} terlalu besar. Berhenti.`,
        ),
      })
      break
    }
    c = next
    const fourView = makeView('4xc', c)

    const aCols = solveCols('1xa', x)
    const bCols = solveCols('2xb', x)

    if (aCols == null) {
      // 1×a fails — reject. (Doesn't occur for these totals, but kept for safety.)
      steps.push({
        candidate: x,
        c,
        blocks: [fourView],
        result: false,
        reject: true,
        isSum: false,
        found: [...found],
        hold: 2100,
        caption: t(
          `4×${c} = ${x}. But 1×a needs (${x} − 1) ÷ 3 — not whole ✗. Reject ${x}.`,
          `4×${c} = ${x}. Tapi 1×a perlu (${x} − 1) ÷ 3 — tak bulat ✗. Tolak ${x}.`,
        ),
      })
      continue
    }

    if (bCols == null) {
      // 1×a works but 2×b fails — reject, showing the 1×a we found.
      steps.push({
        candidate: x,
        c,
        blocks: [fourView, makeView('1xa', aCols)],
        result: false,
        reject: true,
        isSum: false,
        found: [...found],
        hold: 2100,
        caption: t(
          `4×${c} = ${x}: 1×${aCols} ✓, but 2×b needs (${x} − 2) ÷ 5 — not whole ✗. Reject ${x}.`,
          `4×${c} = ${x}: 1×${aCols} ✓, tapi 2×b perlu (${x} − 2) ÷ 5 — tak bulat ✗. Tolak ${x}.`,
        ),
      })
      continue
    }

    // All three confirmed — keep this x.
    found.push(x)
    steps.push({
      candidate: x,
      c,
      blocks: [makeView('1xa', aCols), makeView('2xb', bCols), fourView],
      result: true,
      reject: false,
      isSum: false,
      found: [...found],
      hold: 2600,
      caption: t(
        `4×${c} = ${x}: 1×${aCols} ✓, 2×${bCols} ✓, 4×${c} ✓ — all three use ${x}. Keep ${x}!`,
        `4×${c} = ${x}: 1×${aCols} ✓, 2×${bCols} ✓, 4×${c} ✓ — ketiganya pakai ${x}. Simpan ${x}!`,
      ),
    })
  }

  const smallest = found[0]
  const largest = found[found.length - 1]
  const answer = smallest + largest

  // Final beat: the two keepers, summed.
  steps.push({
    candidate: null,
    c: null,
    blocks: [],
    result: true,
    reject: false,
    isSum: true,
    found: [...found],
    hold: 0,
    caption: t(
      `Only ${smallest} and ${largest} work under 100. Largest + smallest = ${largest} + ${smallest} = ${answer}.`,
      `Hanya ${smallest} dan ${largest} yang cocok di bawah 100. Terbesar + terkecil = ${largest} + ${smallest} = ${answer}.`,
    ),
  })

  return {
    answer,
    smallest,
    largest,
    keepers: [...found],
    steps,
    finalIndex: steps.length - 1,
  }
}
