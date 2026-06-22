// IKMC-22-PE-Q9 — storyboard for the "covered number" digit-logic animation.
//
// Problem: Kanga wrote a 5-digit number and covered each digit with a shape.
//   Shape row: Heart, Diamond, Diamond, Club, Spade
//   Rule: same shape = same digit; different shapes = different digits.
//   Which of A–E could be the number?
//     A: 34426   B: 34526   C: 34423   D: 34424   E: 32446
//   Answer: A (34426) — positions 2 and 3 both have digit 4 (the diamond pair).
//
// Animation beats:
//   0. intro       — show the 5 shapes; state the rule.
//   1. same-shape  — highlight that positions 2 and 3 are BOTH diamonds → equal digits.
//   2. check-B     — 34526: all 5 digits different, no repeat → fails.
//   3. check-C     — 34423: TWO pairs repeat (3 and 4) → fails.
//   4. check-D     — 34424: digit 4 appears THREE times → fails.
//   5. check-E     — 32446: repeat is at pos 3,4 not pos 2,3 → fails.
//   6. result      — 34426: only pos 2 and 3 repeat (digit 4) → correct, answer A.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type CoveredNumPhase =
  | 'intro'
  | 'same-shape'
  | 'check-B'
  | 'check-C'
  | 'check-D'
  | 'check-E'
  | 'result'

export interface CoveredNumBeat {
  phase: CoveredNumPhase
  /** Digit candidate being examined, or '' for intro/same-shape. */
  candidate: string
  /** Whether this candidate is correct (green) or wrong (red/none). */
  verdict: 'ok' | 'fail' | 'none'
  /** Which position index (0-based) to reveal in the shape row (-1 = none). */
  revealIndex: number
  /** The digits to show when revealing (5 chars). */
  revealDigits: string[]
  /** Caption text. */
  caption: string
  /** Equation / logic line; '' = hidden. */
  equation: string
  /** Auto-hold ms (0 = final). */
  hold: number
}

export interface CoveredNumStoryboard {
  steps: CoveredNumBeat[]
  finalIndex: number
}

export function buildCoveredNum9PESteps(lang: Lang): CoveredNumStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // The answer digits (for the final reveal)
  const ANSWER_DIGITS = ['3', '4', '4', '2', '6']

  const steps: CoveredNumBeat[] = [
    // Beat 0 — intro: show the shape row, state the rule
    {
      phase: 'intro',
      candidate: '',
      verdict: 'none',
      revealIndex: -1,
      revealDigits: [],
      equation: '',
      hold: 2600,
      caption: t(
        'Kanga wrote a 5-digit number and covered each digit with a shape. The rule: same shape → same digit; different shapes → different digits.',
        'Kanga menuliskan angka 5 digit dan menutup setiap digit dengan sebuah bentuk. Aturannya: bentuk sama → digit sama; bentuk berbeda → digit berbeda.',
      ),
    },

    // Beat 1 — same-shape: spotlight the diamond pair
    {
      phase: 'same-shape',
      candidate: '',
      verdict: 'none',
      revealIndex: -1,
      revealDigits: [],
      equation: t('pos 2 = pos 3  (both ◆)', 'pos 2 = pos 3  (keduanya ◆)'),
      hold: 2400,
      caption: t(
        'Positions 2 and 3 are both covered by a diamond. So the digits at positions 2 and 3 must be equal — exactly one repeated digit, and the rest all different.',
        'Posisi 2 dan 3 keduanya ditutupi berlian. Jadi digit di posisi 2 dan 3 harus sama — tepat satu pasang digit berulang, sisanya semua berbeda.',
      ),
    },

    // Beat 2 — check B: 34526
    {
      phase: 'check-B',
      candidate: '34526',
      verdict: 'fail',
      revealIndex: -1,
      revealDigits: [],
      equation: '3-4-5-2-6  →  all different ✗',
      hold: 2000,
      caption: t(
        'B: 34526 — all five digits are different. But the diamond pair at positions 2 and 3 requires exactly one repeat. ✗',
        'B: 34526 — semua lima digit berbeda. Tetapi pasangan berlian di posisi 2 dan 3 memerlukan tepat satu pengulangan. ✗',
      ),
    },

    // Beat 3 — check C: 34423
    {
      phase: 'check-C',
      candidate: '34423',
      verdict: 'fail',
      revealIndex: -1,
      revealDigits: [],
      equation: '3-4-4-2-3  →  two pairs repeat ✗',
      hold: 2000,
      caption: t(
        'C: 34423 — digit 4 repeats (pos 2, 3) AND digit 3 repeats (pos 1, 5). Two repeated pairs, but only one pair of shapes match. ✗',
        'C: 34423 — digit 4 berulang (pos 2, 3) DAN digit 3 berulang (pos 1, 5). Dua pasang berulang, tetapi hanya satu pasang bentuk yang cocok. ✗',
      ),
    },

    // Beat 4 — check D: 34424
    {
      phase: 'check-D',
      candidate: '34424',
      verdict: 'fail',
      revealIndex: -1,
      revealDigits: [],
      equation: '3-4-4-2-4  →  digit 4 three times ✗',
      hold: 2000,
      caption: t(
        'D: 34424 — digit 4 appears three times (pos 2, 3, 5). That would need three shapes to be identical, but only two shapes match. ✗',
        'D: 34424 — digit 4 muncul tiga kali (pos 2, 3, 5). Itu memerlukan tiga bentuk yang identik, tetapi hanya dua bentuk yang cocok. ✗',
      ),
    },

    // Beat 5 — check E: 32446
    {
      phase: 'check-E',
      candidate: '32446',
      verdict: 'fail',
      revealIndex: -1,
      revealDigits: [],
      equation: '3-2-4-4-6  →  repeat at pos 3,4 not 2,3 ✗',
      hold: 2000,
      caption: t(
        'E: 32446 — digit 4 repeats at positions 3 and 4, but the diamond pair is at positions 2 and 3. Wrong positions. ✗',
        'E: 32446 — digit 4 berulang di posisi 3 dan 4, tetapi pasangan berlian ada di posisi 2 dan 3. Posisi salah. ✗',
      ),
    },

    // Beat 6 — result: 34426 is correct
    {
      phase: 'result',
      candidate: '34426',
      verdict: 'ok',
      revealIndex: 1,   // reveal position 2 (0-based index 1) for the diamond pair
      revealDigits: ANSWER_DIGITS,
      equation: '3-4-4-2-6  →  pos 2 = pos 3 = 4 ✓',
      hold: 0,
      caption: t(
        'A: 34426 — digit 4 at positions 2 and 3 only, all other digits different. Matches the shape pattern exactly. Answer A.',
        'A: 34426 — digit 4 hanya di posisi 2 dan 3, semua digit lain berbeda. Cocok dengan pola bentuk dengan tepat. Jawaban A.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
