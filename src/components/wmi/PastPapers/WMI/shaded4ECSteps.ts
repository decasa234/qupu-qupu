// IKMC-20-EC-Q4 — storyboard for the shaded-fraction comparison animation.
//
// The question: five 4×4 grids, which has the largest shaded fraction?
// Answer: A (14/16 = 87.5%).
//
// Teaching walk, one idea per beat:
//   0. intro   — introduce the task: count the shaded cells.
//   1. testE   — E: 11/16 — eliminated.
//   2. testD   — D: 11.5/16 — eliminated.
//   3. testC   — C: 12.5/16 — eliminated.
//   4. testB   — B: 13.5/16 — closer but not the most.
//   5. testA   — A: 14/16 ✓ — the largest!
//   6. result  — A is the answer.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type Shaded4ECPhase =
  | 'intro'
  | 'testE'
  | 'testD'
  | 'testC'
  | 'testB'
  | 'testA'
  | 'result'

export interface Shaded4ECBeat {
  phase: Shaded4ECPhase
  /** Which choice label is currently being highlighted (null for non-option beats). */
  activeChoice: 'A' | 'B' | 'C' | 'D' | 'E' | null
  /** Result of the active choice being tested. */
  activeResult: 'correct' | 'wrong' | null
  /** Set of choices already eliminated. */
  eliminated: ReadonlySet<string>
  /** Fraction chip text; '' to hide. */
  fraction: string
  /** Caption for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface Shaded4ECStoryboard {
  steps: Shaded4ECBeat[]
  finalIndex: number
}

export function buildShaded4ECSteps(lang: Lang): Shaded4ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Shaded4ECBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      activeChoice: null,
      activeResult: null,
      eliminated: new Set(),
      fraction: '',
      hold: 2000,
      result: false,
      caption: t(
        'For each figure, count how many cells (or half-cells) are shaded green. The figure with the largest fraction wins.',
        'Untuk setiap gambar, hitung berapa sel (atau setengah sel) yang diarsir hijau. Gambar dengan pecahan terbesar yang menang.',
      ),
    },

    // Beat 1 — test E
    {
      phase: 'testE',
      activeChoice: 'E',
      activeResult: 'wrong',
      eliminated: new Set(['E']),
      fraction: '11/16',
      hold: 2000,
      result: false,
      caption: t(
        'E: 11 cells shaded out of 16 (68.8%) — not the most.',
        'E: 11 sel diarsir dari 16 (68,8%) — bukan yang terbanyak.',
      ),
    },

    // Beat 2 — test D
    {
      phase: 'testD',
      activeChoice: 'D',
      activeResult: 'wrong',
      eliminated: new Set(['E', 'D']),
      fraction: '11.5/16',
      hold: 2000,
      result: false,
      caption: t(
        'D: 11.5 cells shaded out of 16 (71.9%) — still not the most.',
        'D: 11,5 sel diarsir dari 16 (71,9%) — masih bukan yang terbanyak.',
      ),
    },

    // Beat 3 — test C
    {
      phase: 'testC',
      activeChoice: 'C',
      activeResult: 'wrong',
      eliminated: new Set(['E', 'D', 'C']),
      fraction: '12.5/16',
      hold: 2000,
      result: false,
      caption: t(
        'C: 12.5 cells shaded out of 16 (78.1%) — getting closer, but not the most.',
        'C: 12,5 sel diarsir dari 16 (78,1%) — semakin dekat, tapi bukan yang terbanyak.',
      ),
    },

    // Beat 4 — test B
    {
      phase: 'testB',
      activeChoice: 'B',
      activeResult: 'wrong',
      eliminated: new Set(['E', 'D', 'C', 'B']),
      fraction: '13.5/16',
      hold: 2000,
      result: false,
      caption: t(
        'B: 13.5 cells shaded out of 16 (84.4%) — very close, but A is even more.',
        'B: 13,5 sel diarsir dari 16 (84,4%) — hampir, tapi A bahkan lebih banyak.',
      ),
    },

    // Beat 5 — test A (the answer)
    {
      phase: 'testA',
      activeChoice: 'A',
      activeResult: 'correct',
      eliminated: new Set(['E', 'D', 'C', 'B']),
      fraction: '14/16',
      hold: 2400,
      result: false,
      caption: t(
        'A: 14 cells shaded out of 16 (87.5%) — the most shaded of all!',
        'A: 14 sel diarsir dari 16 (87,5%) — yang paling banyak diarsir!',
      ),
    },

    // Beat 6 — result
    {
      phase: 'result',
      activeChoice: 'A',
      activeResult: 'correct',
      eliminated: new Set(['E', 'D', 'C', 'B']),
      fraction: '14/16 = 87.5%',
      hold: 0,
      result: true,
      caption: t(
        'Figure A has the largest shaded fraction (14/16). Answer: A.',
        'Gambar A memiliki bagian yang diarsir paling besar (14/16). Jawaban: A.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
