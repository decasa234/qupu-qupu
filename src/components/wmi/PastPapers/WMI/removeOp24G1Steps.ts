import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-24F1A-Q23 (2024 Grade 1 final). The printed expression is FIXED:
//   9 + 8 + 7 + 6 − 5 − 4 + 3 + 2 − 1
// made of 9 number cards and 8 operator cards. Removing exactly ONE operator
// card lets its two neighbour digits join into a single 2-digit number; the rest
// of the expression is computed unchanged. If the whole expression then equals a
// 2-digit number, find the LARGEST such result.
//
// Ground-truth results per removed operator k (literal-string evaluation, the
// only trustworthy source — see the IMPORTANT note below):
//   k0 → 98+7+6−5−4+3+2−1   = 106   (3-digit → not allowed ✗)
//   k1 → 9+87+6−5−4+3+2−1   =  97   ✓  ← largest valid 2-digit result (ANSWER)
//   k2 → 9+8+76−5−4+3+2−1   =  88   ✓
//   k3 → 9+8+7+65−4+3+2−1   =  89   ✓
//   k4 → 9+8+7+6−54+3+2−1   = −20
//   k5 → 9+8+7+6−5−43+2−1   = −17
//   k6 → 9+8+7+6−5−4+32−1   =  52   ✓
//   k7 → 9+8+7+6−5−4+3+21   =  45   ✓
// Valid 2-digit results {97, 88, 89, 52, 45} → the largest is 97 (remove op 1).
//
// METHOD (try-and-eliminate from the left): joining the earliest, biggest digits
// pushes the result up, so try the leftmost merges first.
//   • Op 0 joins 9,8 → 98… but the whole thing is 106, a 3-digit number → ✗.
//   • Op 1 joins 8,7 → 87 → the expression is 97, a valid 2-digit number ✓.
//   • Confirm with a couple of the next merges (op 2 → 88, op 3 → 89): both are
//     valid 2-digit numbers but smaller than 97, so 97 stays the winner.
// Result beat lands on 97.
//
// IMPORTANT — RemoveOp24G1 primitive bug: its internal evaluate() mishandles the
// running sign right after a merge, so its printed "= value" is WRONG for several
// indices (op2 shows 98 not 88, op4 shows −26 not −20, op6 shows 54 not 52). It
// IS correct for the winning op 1 (= 97). So this storyboard only ever asks the
// primitive to print a result on the WINNER beat (op 1); every other candidate's
// arithmetic is stated in our own caption from the ground-truth table above. We
// never let the buggy "= value" surface, and we never assert anything the figure
// would contradict.
//
// Pure builder — no random, no dates, SSR-safe & deterministic.

export type RemoveOp24Phase = 'intro' | 'try' | 'result'

export interface RemoveOp24Step {
  phase: RemoveOp24Phase
  /** Operator card to lift this beat (0..7); null on the intro beat. */
  removeOpIndex: number | null
  /** When true, let the primitive print "= value" — ONLY on the winner beat. */
  showResult: boolean
  /** The two digits joined this beat, e.g. [8, 7]. */
  join: [number, number] | null
  /** The merged 2-digit number, e.g. 87. */
  merged: number | null
  /** The whole-expression total for this try (ground-truth). */
  total: number | null
  /** Is this total a valid 2-digit number (10..99)? */
  twoDigit: boolean | null
  /** Did this try win (largest valid 2-digit result)? */
  win: boolean
  caption: string
  hold: number
  result: boolean
}

export interface RemoveOp24Storyboard {
  /** The fixed printed expression as a display string. */
  expression: string
  /** Operator index that wins (merges 8,7 → 87). */
  winnerOpIndex: number
  answer: number
  steps: RemoveOp24Step[]
  finalIndex: number
}

// Ground-truth merged value + total for a removed operator k (NOT the primitive's
// buggy evaluate — see header). Computed once here, deterministically.
const NUMBERS = [9, 8, 7, 6, 5, 4, 3, 2, 1] as const
const OPS = ['+', '+', '+', '-', '-', '+', '+', '-'] as const

function mergedValue(k: number): number {
  return NUMBERS[k] * 10 + NUMBERS[k + 1]
}

/** Honest evaluation: build the literal expression and fold it left-to-right. */
function totalAfterRemoving(k: number): number {
  let total = 0
  let sign = 1 // sign applied to the NEXT term; first term is positive
  for (let i = 0; i < NUMBERS.length; i++) {
    let term: number
    if (i === k) {
      term = mergedValue(k)
      i++ // the right neighbour is folded into the merged number
    } else {
      term = NUMBERS[i]
    }
    total += sign * term
    // The operator that governs the FOLLOWING term is the one printed after the
    // current position i (after any i++ from a merge). OPS[i] is '+' → +1, '-' → −1.
    if (i < OPS.length) sign = OPS[i] === '+' ? 1 : -1
  }
  return total
}

export function buildRemoveOp24Steps(lang: Lang): RemoveOp24Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const expression = '9 + 8 + 7 + 6 − 5 − 4 + 3 + 2 − 1'

  // Winner: remove op 1 → join 8,7 → 87 → 97.
  const winnerOpIndex = 1
  const answer = totalAfterRemoving(winnerOpIndex) // 97

  const join = (k: number): [number, number] => [NUMBERS[k], NUMBERS[k + 1]]

  const steps: RemoveOp24Step[] = [
    {
      phase: 'intro',
      removeOpIndex: null,
      showResult: false,
      join: null,
      merged: null,
      total: null,
      twoDigit: null,
      win: false,
      hold: 2000,
      result: false,
      caption: t(
        'Pull out ONE plus/minus so two side-by-side digits join. We want the biggest 2-digit answer.',
        'Cabut SATU tanda + atau − supaya dua angka bersebelahan menyatu. Kita mau jawaban 2 angka terbesar.',
      ),
    },
    {
      phase: 'try',
      removeOpIndex: 0,
      showResult: false,
      join: join(0),
      merged: mergedValue(0), // 98
      total: totalAfterRemoving(0), // 106
      twoDigit: false,
      win: false,
      hold: 2200,
      result: false,
      caption: t(
        'Joining the biggest digits first: 9 and 8 → 98 makes the whole thing 106 — 3 digits, too big ✗.',
        'Mulai dari angka terbesar: 9 dan 8 → 98 membuat hasilnya 106 — 3 angka, terlalu besar ✗.',
      ),
    },
    {
      phase: 'try',
      removeOpIndex: 1,
      showResult: false,
      join: join(1),
      merged: mergedValue(1), // 87
      total: totalAfterRemoving(1), // 97
      twoDigit: true,
      win: false,
      hold: 2300,
      result: false,
      caption: t(
        'Next, join 8 and 7 → 87: 9 + 87 + 6 − 5 − 4 + 3 + 2 − 1 = 97 — a 2-digit number ✓.',
        'Lalu satukan 8 dan 7 → 87: 9 + 87 + 6 − 5 − 4 + 3 + 2 − 1 = 97 — bilangan 2 angka ✓.',
      ),
    },
    {
      phase: 'try',
      removeOpIndex: 2,
      showResult: false,
      join: join(2),
      merged: mergedValue(2), // 76
      total: totalAfterRemoving(2), // 88
      twoDigit: true,
      win: false,
      hold: 2200,
      result: false,
      caption: t(
        'Join 7 and 6 → 76 instead: the total is 88 — 2 digits, but smaller than 97.',
        'Coba satukan 7 dan 6 → 76: hasilnya 88 — 2 angka, tapi lebih kecil dari 97.',
      ),
    },
    {
      phase: 'try',
      removeOpIndex: 3,
      showResult: false,
      join: join(3),
      merged: mergedValue(3), // 65
      total: totalAfterRemoving(3), // 89
      twoDigit: true,
      win: false,
      hold: 2200,
      result: false,
      caption: t(
        'Join 6 and 5 → 65: the total is 89 — still 2 digits, still below 97. Later joins only shrink it.',
        'Satukan 6 dan 5 → 65: hasilnya 89 — masih 2 angka, masih di bawah 97. Penggabungan berikutnya makin kecil.',
      ),
    },
    {
      phase: 'result',
      removeOpIndex: winnerOpIndex,
      showResult: true, // primitive's evaluate IS correct for op 1 (= 97)
      join: join(winnerOpIndex),
      merged: mergedValue(winnerOpIndex), // 87
      total: answer, // 97
      twoDigit: true,
      win: true,
      hold: 0,
      result: true,
      caption: t(
        `So joining 8 and 7 wins: the biggest 2-digit answer is ${answer}.`,
        `Jadi menyatukan 8 dan 7 menang: jawaban 2 angka terbesar adalah ${answer}.`,
      ),
    },
  ]

  return {
    expression,
    winnerOpIndex,
    answer,
    steps,
    finalIndex: steps.length - 1,
  }
}
