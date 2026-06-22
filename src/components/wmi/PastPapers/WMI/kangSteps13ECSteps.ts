// IKMC-20-EC-Q13 — storyboard for the staircase animation.
//
// Question: Every time the kangaroo goes up 7 steps, the rabbit goes down 3 steps.
// Kangaroo starts at step 1 (bottom), rabbit starts at step 100 (top). Answer: D (step 70).
//
// Strategy: After each round n, kangaroo is at 1 + 7n, rabbit is at 100 − 3n.
// After 9 rounds: K=64, R=73 — still apart.
// After 10 rounds: K=71, R=70 — kangaroo just passed rabbit → crossing at step 70.
//
// Teaching walk, one idea per beat:
//   0. intro      — static scene: kangaroo at step 1, rabbit at step 100.
//   1. formula    — show the two formulas: K = 1+7n, R = 100−3n.
//   2. round-9    — after 9 rounds: K=64, R=73. Still apart (K < R).
//   3. round-10   — after 10 rounds: K=71, R=70. Kangaroo just overtook rabbit!
//   4. crossing   — they crossed between K=64→71 and R=73→70 → meeting at 70.
//   5. result     — step 70 → answer D (green).
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type KangStepsPhase = 'intro' | 'formula' | 'round-9' | 'round-10' | 'crossing' | 'result'

export interface KangStepsBeat {
  /** Animation phase identifier. */
  phase: KangStepsPhase
  /** Current kangaroo step (1-indexed, 1–100). */
  kangarooStep: number
  /** Current rabbit step (1-indexed, 1–100). */
  rabbitStep: number
  /**
   * Whether to show the animals in the "gap" (middle of staircase) position
   * rather than the visible end clusters. Used for rounds 9/10 where positions
   * are in the hidden range.
   */
  showMidState: boolean
  /** Steps to highlight at the bottom cluster end (e.g. step 1 in intro). */
  highlightBottom: number[]
  /** Steps to highlight at the top cluster end (e.g. step 100 in intro). */
  highlightTop: number[]
  /** Equation / maths to display; '' to hide. */
  equation: string
  /** Caption for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface KangStepsStoryboard {
  steps: KangStepsBeat[]
  finalIndex: number
}

export function buildKangSteps13ECSteps(lang: Lang): KangStepsStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: KangStepsBeat[] = [
    // Beat 0 — intro: static scene
    {
      phase: 'intro',
      kangarooStep: 1,
      rabbitStep: 100,
      showMidState: false,
      highlightBottom: [1],
      highlightTop: [100],
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Kangaroo starts at step 1 (bottom). Rabbit starts at step 100 (top). Each round: kangaroo goes up 7, rabbit goes down 3.',
        'Kanguru mulai di anak tangga 1 (bawah). Kelinci mulai di anak tangga 100 (atas). Setiap putaran: kanguru naik 7, kelinci turun 3.',
      ),
    },

    // Beat 1 — show the formulas
    {
      phase: 'formula',
      kangarooStep: 1,
      rabbitStep: 100,
      showMidState: false,
      highlightBottom: [],
      highlightTop: [],
      equation: t('K = 1 + 7n   |   R = 100 − 3n', 'K = 1 + 7n   |   R = 100 − 3n'),
      hold: 2800,
      result: false,
      caption: t(
        'After n rounds: Kangaroo = 1 + 7n, Rabbit = 100 − 3n. They meet when K ≥ R.',
        'Setelah n putaran: Kanguru = 1 + 7n, Kelinci = 100 − 3n. Mereka bertemu saat K ≥ R.',
      ),
    },

    // Beat 2 — after round 9: K=64, R=73
    {
      phase: 'round-9',
      kangarooStep: 64,
      rabbitStep: 73,
      showMidState: true,
      highlightBottom: [],
      highlightTop: [],
      equation: t('n=9: K = 1+63 = 64,  R = 100−27 = 73', 'n=9: K = 1+63 = 64,  R = 100−27 = 73'),
      hold: 2600,
      result: false,
      caption: t(
        'After 9 rounds: kangaroo is at step 64, rabbit is at step 73. Kangaroo (64) is still below rabbit (73) — not yet met.',
        'Setelah 9 putaran: kanguru di anak tangga 64, kelinci di anak tangga 73. Kanguru (64) masih di bawah kelinci (73) — belum bertemu.',
      ),
    },

    // Beat 3 — after round 10: K=71, R=70
    {
      phase: 'round-10',
      kangarooStep: 71,
      rabbitStep: 70,
      showMidState: true,
      highlightBottom: [],
      highlightTop: [],
      equation: t('n=10: K = 1+70 = 71,  R = 100−30 = 70', 'n=10: K = 1+70 = 71,  R = 100−30 = 70'),
      hold: 2600,
      result: false,
      caption: t(
        'After 10 rounds: kangaroo reaches step 71, rabbit drops to step 70. Kangaroo (71) overtook rabbit (70)! They crossed.',
        'Setelah 10 putaran: kanguru mencapai anak tangga 71, kelinci turun ke anak tangga 70. Kanguru (71) melewati kelinci (70)! Mereka bersilangan.',
      ),
    },

    // Beat 4 — crossing: they met at step 70
    {
      phase: 'crossing',
      kangarooStep: 70,
      rabbitStep: 70,
      showMidState: true,
      highlightBottom: [],
      highlightTop: [],
      equation: t('Crossing at step 70', 'Persilangan di anak tangga 70'),
      hold: 2400,
      result: false,
      caption: t(
        'The rabbit landed on step 70 just as the kangaroo jumped past it to 71. They met at step 70.',
        'Kelinci mendarat di anak tangga 70 tepat saat kanguru melompat melewatinya ke 71. Mereka bertemu di anak tangga 70.',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      kangarooStep: 70,
      rabbitStep: 70,
      showMidState: true,
      highlightBottom: [],
      highlightTop: [],
      equation: t('Step 70 → D', 'Anak tangga 70 → D'),
      hold: 0,
      result: true,
      caption: t(
        'They meet at step 70 — answer D.',
        'Mereka bertemu di anak tangga 70 — jawaban D.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
