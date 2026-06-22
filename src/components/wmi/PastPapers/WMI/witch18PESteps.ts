// IKMC-21-PE-Q18 — storyboard for the witch apple↔banana transformation.
//
// The question: a witch has 2 rules:
//   Rule 1: 3 apples → 1 banana   (consumes 3A, produces 1B)
//   Rule 2: 3 bananas → 1 apple   (consumes 3B, produces 1A)
//
// Starting state: 4 apples, 5 bananas.
// Simulation (from breakdown.hints in the seed):
//   Start:  4A, 5B
//   Step 1: apply Rule 1 — 3A → 1B:  1A, 6B
//   Step 2: apply Rule 2 — 3B → 1A:  2A, 3B
//   Step 3: apply Rule 2 — 3B → 1A:  3A, 0B
//   Step 4: apply Rule 1 — 3A → 1B:  0A, 1B   ← done (answer A = 1 banana)
//
// Teaching walk (one idea per beat):
//   0. intro  — show starting state; explain the two rules.
//   1–4.      — simulate each step, highlighting consumed + produced fruits.
//   5. result — final state 0A, 1B; answer is A (1 banana).
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'step' | 'result'

export interface WitchBeat {
  phase: PhaseId
  /** Apples remaining after this beat. */
  apples: number
  /** Bananas remaining after this beat. */
  bananas: number
  /**
   * Which rule fired this beat (1 = 3A→1B, 2 = 3B→1A), or null if no rule fired.
   * Drives the arrow highlight in the illustration primitive.
   */
  ruleUsed: 1 | 2 | null
  /** Caption text for the explanation box. */
  caption: string
  /** Equation / step to display; '' hides it. */
  equation: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface Witch18Storyboard {
  steps: WitchBeat[]
  finalIndex: number
}

export function buildWitch18PESteps(lang: Lang): Witch18Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: WitchBeat[] = [
    // Beat 0 — intro: show starting state
    {
      phase: 'intro',
      apples: 4,
      bananas: 5,
      ruleUsed: null,
      hold: 2400,
      result: false,
      equation: '',
      caption: t(
        'Start: 4 apples and 5 bananas. The witch keeps applying her rules until no rule fits.',
        'Mulai: 4 apel dan 5 pisang. Penyihir terus menerapkan aturannya hingga tidak ada aturan yang bisa dipakai.',
      ),
    },

    // Beat 1 — Step 1: 3A → 1B (4A,5B → 1A,6B)
    {
      phase: 'step',
      apples: 1,
      bananas: 6,
      ruleUsed: 1,
      hold: 2200,
      result: false,
      equation: '3A → 1B',
      caption: t(
        'She has 3 apples — use Rule 1: 3 apples become 1 banana. Now: 1 apple, 6 bananas.',
        'Ia punya 3 apel — pakai Aturan 1: 3 apel menjadi 1 pisang. Sekarang: 1 apel, 6 pisang.',
      ),
    },

    // Beat 2 — Step 2: 3B → 1A (1A,6B → 2A,3B)
    {
      phase: 'step',
      apples: 2,
      bananas: 3,
      ruleUsed: 2,
      hold: 2200,
      result: false,
      equation: '3B → 1A',
      caption: t(
        'She has 3 bananas — use Rule 2: 3 bananas become 1 apple. Now: 2 apples, 3 bananas.',
        'Ia punya 3 pisang — pakai Aturan 2: 3 pisang menjadi 1 apel. Sekarang: 2 apel, 3 pisang.',
      ),
    },

    // Beat 3 — Step 3: 3B → 1A (2A,3B → 3A,0B)
    {
      phase: 'step',
      apples: 3,
      bananas: 0,
      ruleUsed: 2,
      hold: 2200,
      result: false,
      equation: '3B → 1A',
      caption: t(
        'Still 3 bananas — use Rule 2 again: 3 bananas become 1 apple. Now: 3 apples, 0 bananas.',
        'Masih 3 pisang — pakai Aturan 2 lagi: 3 pisang menjadi 1 apel. Sekarang: 3 apel, 0 pisang.',
      ),
    },

    // Beat 4 — Step 4: 3A → 1B (3A,0B → 0A,1B)
    {
      phase: 'step',
      apples: 0,
      bananas: 1,
      ruleUsed: 1,
      hold: 2200,
      result: false,
      equation: '3A → 1B',
      caption: t(
        'She has 3 apples — use Rule 1: 3 apples become 1 banana. Now: 0 apples, 1 banana.',
        'Ia punya 3 apel — pakai Aturan 1: 3 apel menjadi 1 pisang. Sekarang: 0 apel, 1 pisang.',
      ),
    },

    // Beat 5 — result: 0A, 1B → answer A
    {
      phase: 'result',
      apples: 0,
      bananas: 1,
      ruleUsed: null,
      hold: 0,
      result: true,
      equation: '0A + 1B → Answer A',
      caption: t(
        'No rule can fire: fewer than 3 of each fruit. She finishes with 1 banana. Answer A.',
        'Tidak ada aturan yang bisa digunakan: kurang dari 3 dari masing-masing buah. Penyihir berakhir dengan 1 pisang. Jawaban A.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
