// IKMC-23-EC-Q23 — grid L-piece validation storyboard.
//
// Holger fills a 10-column grid with 1–50 (row 1: 1–10, row 2: 11–20, …).
// Five L-shaped pieces (4 cells each) are shown; only one is a valid cut.
// Grid rule: right = +1, down = +10. Answer: C.
//
// Shape topology (shared by all options):
//   [ top ]
//   [mid-L][mid-R]
//          [ bot ]
//
// Option numbers:
//   A: 22, 32, 33, 44  — invalid: 33→44 is +11, not +10
//   B: 22, 33, 34, 44  — invalid: 22→33 is +11, not +10
//   C: 22, 32, 33, 43  — VALID: +10, +1, +10 ✓
//   D: 22, 33, 34, 45  — invalid: 22→33 is +11, not +10
//   E: 22, 32, 33, 42  — invalid: 33→42 is +9, not +10 (42 is below 32)
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export interface Beat {
  /** Animation phase identifier. */
  phase: string
  /** Which option label is highlighted on this beat (null for intro). */
  optionLabel: string | null
  /** Equation or check string shown in the pill; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
  /** True when this beat's option is the correct answer. */
  isAnswer: boolean
}

export interface Opts23ECStoryboard {
  steps: Beat[]
  finalIndex: number
}

export function buildOpts23ECSteps(lang: Lang): Opts23ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Beat[] = [
    // Beat 0 — intro: explain the grid rule
    {
      phase: 'intro',
      optionLabel: null,
      equation: '+1 / +10',
      hold: 2200,
      result: false,
      isAnswer: false,
      caption: t(
        'Grid rule: moving right adds 1, moving down adds 10.',
        'Aturan grid: bergerak ke kanan menambah 1, bergerak ke bawah menambah 10.',
      ),
    },

    // Beat 1 — check A
    {
      phase: 'check-A',
      optionLabel: 'A',
      equation: '33 → 44 is +11 ✗',
      hold: 2200,
      result: false,
      isAnswer: false,
      caption: t(
        'A: the bottom cell 44 is not directly below 33 in the grid.',
        'A: sel bawah 44 bukan tepat di bawah 33 dalam grid.',
      ),
    },

    // Beat 2 — check B
    {
      phase: 'check-B',
      optionLabel: 'B',
      equation: '22 → 33 is +11 ✗',
      hold: 2200,
      result: false,
      isAnswer: false,
      caption: t(
        'B: 33 is not directly below 22 — it skips a column.',
        'B: 33 bukan tepat di bawah 22 — melompat satu kolom.',
      ),
    },

    // Beat 3 — check C (the answer)
    {
      phase: 'check-C',
      optionLabel: 'C',
      equation: '22→32→33→43 ✓',
      hold: 2200,
      result: false,
      isAnswer: true,
      caption: t(
        'C: 22 + 10 = 32 ✓, 32 + 1 = 33 ✓, 33 + 10 = 43 ✓ — this piece is valid!',
        'C: 22 + 10 = 32 ✓, 32 + 1 = 33 ✓, 33 + 10 = 43 ✓ — ini potongan yang benar.',
      ),
    },

    // Beat 4 — check D
    {
      phase: 'check-D',
      optionLabel: 'D',
      equation: '22 → 33 is +11 ✗',
      hold: 2200,
      result: false,
      isAnswer: false,
      caption: t(
        'D: same problem as B — 33 is not below 22.',
        'D: Masalah yang sama seperti B — 33 bukan di bawah 22.',
      ),
    },

    // Beat 5 — check E
    {
      phase: 'check-E',
      optionLabel: 'E',
      equation: '33 → 42 is +9 ✗',
      hold: 2200,
      result: false,
      isAnswer: false,
      caption: t(
        'E: 42 is below 32, not below 33 — wrong bottom cell.',
        'E: 42 ada di bawah 32, bukan di bawah 33 — sel bawah salah.',
      ),
    },

    // Beat 6 — result
    {
      phase: 'result',
      optionLabel: 'C',
      equation: 'Answer C',
      hold: 0,
      result: true,
      isAnswer: true,
      caption: t(
        'Only C has valid +10 and +1 steps throughout. Answer C.',
        'Hanya C yang memiliki langkah +10 dan +1 yang valid. Jawaban C.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
