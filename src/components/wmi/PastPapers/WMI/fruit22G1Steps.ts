import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { FRUIT_SETS } from './Fruit22G1Option'

export const FRUIT22G1_ANSWER = 'D'

/**
 * WMI-22F1A-Q5 — fruit counting rule (Grade 1).
 *
 * Rule (from the stem):
 *   bananas = 2 × strawberries   ("twice as many bananas as strawberries")
 *   apples  = bananas + 1        ("one more apple than bananas")
 *
 * Strategy taught: BUILD the smallest set that follows the rule, then CHECK
 * each option picture against it. Option counts are read from the illustrator's
 * FRUIT_SETS (transcribed from the paper images), so the captions describe what
 * is actually drawn — never the seed text, which can drift from the figures:
 *   A {2,2,3}: 2 strawberries → should be 4 bananas, but A shows 2 ✗
 *   B {1,2,4}: 1 strawberry, 2 bananas (good) → should be 3 apples, B shows 4 ✗
 *   C {1,4,2}: 1 strawberry → should be 2 bananas, but C shows 4 ✗
 *   D {1,2,3}: 1 strawberry, 2 bananas, 3 apples — matches! ✓
 *
 * Beats:
 *   1. Start small — 1 strawberry.
 *   2. Bananas = 2 × 1 = 2 bananas.
 *   3. Apples = 2 + 1 = 3 apples → the correct set is 1 / 2 / 3.
 *   4–6. Check A, B, C against the rule and reject each (with the arithmetic).
 *   7. Check D — it matches → answer D (winning beat).
 *
 * Beats that reject an option linger a touch longer so the mismatch reads.
 */

export type FruitPhase = 'goal' | 'banana' | 'apple' | 'check' | 'result'

export type OptionLabel = 'A' | 'B' | 'C' | 'D'

export interface FruitCounts {
  strawberry: number
  banana: number
  apple: number
}

export interface FruitStep {
  phase: FruitPhase
  /** Counts to render in the figure this beat (the set we are building or the option we are checking). */
  counts: FruitCounts
  /** When checking an option, which one (drives the heading + highlight). */
  optionLabel?: OptionLabel
  /** When checking, whether this option PASSES the rule. */
  pass?: boolean
  caption: string
  /** ms to hold this beat before advancing (0 = final/winning beat, lingers). */
  hold: number
  /** True only on the winning beat — flips the caption box + chip to green. */
  result: boolean
}

export interface FruitStoryboard {
  answer: string
  /** The smallest correct set we build from the rule. */
  target: FruitCounts
  steps: FruitStep[]
  finalIndex: number
}

export function buildFruit22G1Steps(lang: Lang): FruitStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // The smallest set that follows the rule: 1 → 2 → 3.
  const target: FruitCounts = { strawberry: 1, banana: 2, apple: 3 }

  const steps: FruitStep[] = [
    {
      phase: 'goal',
      counts: { strawberry: 1, banana: 0, apple: 0 },
      hold: 2600,
      result: false,
      caption: t(
        'Rule: 2 bananas for every 1 strawberry, and 1 more apple than bananas. Start SMALL — just 1 strawberry.',
        'Aturan: 2 pisang untuk setiap 1 stroberi, dan apel 1 lebih banyak daripada pisang. Mulai dari yang KECIL — 1 stroberi saja.',
      ),
    },
    {
      phase: 'banana',
      counts: { strawberry: 1, banana: 2, apple: 0 },
      hold: 2400,
      result: false,
      caption: t(
        'Bananas = 2 × strawberries = 2 × 1 = 2 bananas.',
        'Pisang = 2 × stroberi = 2 × 1 = 2 pisang.',
      ),
    },
    {
      phase: 'apple',
      counts: target,
      hold: 2600,
      result: false,
      caption: t(
        'Apples = bananas + 1 = 2 + 1 = 3 apples. So the right set is 1 strawberry, 2 bananas, 3 apples.',
        'Apel = pisang + 1 = 2 + 1 = 3 apel. Jadi kelompok yang benar: 1 stroberi, 2 pisang, 3 apel.',
      ),
    },
    {
      phase: 'check',
      counts: FRUIT_SETS.A,
      optionLabel: 'A',
      pass: false,
      hold: 2100,
      result: false,
      caption: t(
        `Check A: ${FRUIT_SETS.A.strawberry} strawberries → that needs ${FRUIT_SETS.A.strawberry * 2} bananas, but A shows only ${FRUIT_SETS.A.banana}. ✗`,
        `Cek A: ${FRUIT_SETS.A.strawberry} stroberi → butuh ${FRUIT_SETS.A.strawberry * 2} pisang, tapi A hanya ${FRUIT_SETS.A.banana}. ✗`,
      ),
    },
    {
      phase: 'check',
      counts: FRUIT_SETS.B,
      optionLabel: 'B',
      pass: false,
      hold: 2100,
      result: false,
      caption: t(
        `Check B: 1 strawberry and 2 bananas are right, but bananas + 1 = 3 apples — B shows ${FRUIT_SETS.B.apple}. ✗`,
        `Cek B: 1 stroberi dan 2 pisang sudah benar, tapi pisang + 1 = 3 apel — B menunjukkan ${FRUIT_SETS.B.apple}. ✗`,
      ),
    },
    {
      phase: 'check',
      counts: FRUIT_SETS.C,
      optionLabel: 'C',
      pass: false,
      hold: 2100,
      result: false,
      caption: t(
        `Check C: 1 strawberry needs 2 × 1 = 2 bananas, but C shows ${FRUIT_SETS.C.banana} bananas — too many. ✗`,
        `Cek C: 1 stroberi butuh 2 × 1 = 2 pisang, tapi C menunjukkan ${FRUIT_SETS.C.banana} pisang — terlalu banyak. ✗`,
      ),
    },
    {
      phase: 'result',
      counts: FRUIT_SETS.D,
      optionLabel: 'D',
      pass: true,
      hold: 0,
      result: true,
      caption: t(
        `Check D: 1 strawberry, 2 bananas, 3 apples — it matches! The answer is ${FRUIT22G1_ANSWER}.`,
        'Cek D: 1 stroberi, 2 pisang, 3 apel — cocok! Jawabannya D.',
      ),
    },
  ]

  return {
    answer: FRUIT22G1_ANSWER,
    target,
    steps,
    finalIndex: steps.length - 1,
  }
}
