// IKMC-20-PE-Q1 — storyboard for the staircase animation.
//
// Question: The kangaroo goes up 3 steps each time the rabbit goes down 2 steps.
// Kangaroo starts at step 1 (bottom), rabbit at step 9 (top). Answer: D (step 6).
//
// The paths cross between turn 1 and turn 2. We simulate both turns and show
// that turn 2 produces a cross (kangaroo overtook the rabbit), revealing step 6
// as the meeting point.
//
// Teaching walk, one idea per beat:
//   0. intro      — static scene: kangaroo at step 1, rabbit at step 9.
//   1. turn-1     — kangaroo → step 4, rabbit → step 7. Still apart.
//   2. turn-2     — kangaroo → step 7, rabbit → step 5. They crossed!
//   3. crossing   — the crossing is between steps 6 and 7. Meeting at step 6.
//   4. result     — step 6 → answer D (green).
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type StaircasePhase = 'intro' | 'turn-1' | 'turn-2' | 'crossing' | 'result'

export interface StaircaseBeat {
  /** Animation phase identifier. */
  phase: StaircasePhase
  /** Current kangaroo step position (1-indexed). */
  kangarooStep: number
  /** Current rabbit step position (1-indexed). */
  rabbitStep: number
  /** Steps to highlight (e.g. the meeting step). */
  highlightSteps: number[]
  /** Equation / maths to display below the figure; '' to hide. */
  equation: string
  /** Caption for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface StaircaseStoryboard {
  steps: StaircaseBeat[]
  finalIndex: number
}

export function buildStaircase1PESteps(lang: Lang): StaircaseStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: StaircaseBeat[] = [
    // Beat 0 — intro: static scene
    {
      phase: 'intro',
      kangarooStep: 1,
      rabbitStep: 9,
      highlightSteps: [],
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Kangaroo starts at step 1 (bottom). Rabbit starts at step 9 (top). Each turn: kangaroo goes up 3, rabbit goes down 2.',
        'Kanguru mulai di anak tangga 1 (bawah). Kelinci mulai di anak tangga 9 (atas). Setiap giliran: kanguru naik 3, kelinci turun 2.',
      ),
    },

    // Beat 1 — after turn 1
    {
      phase: 'turn-1',
      kangarooStep: 4,
      rabbitStep: 7,
      highlightSteps: [4, 7],
      equation: t('Kangaroo: 1 + 3 = 4 | Rabbit: 9 − 2 = 7', 'Kanguru: 1 + 3 = 4 | Kelinci: 9 − 2 = 7'),
      hold: 2400,
      result: false,
      caption: t(
        'After turn 1: kangaroo is at step 4, rabbit is at step 7. They have not met yet.',
        'Setelah giliran 1: kanguru di anak tangga 4, kelinci di anak tangga 7. Belum bertemu.',
      ),
    },

    // Beat 2 — after turn 2
    {
      phase: 'turn-2',
      kangarooStep: 7,
      rabbitStep: 5,
      highlightSteps: [5, 7],
      equation: t('Kangaroo: 4 + 3 = 7 | Rabbit: 7 − 2 = 5', 'Kanguru: 4 + 3 = 7 | Kelinci: 7 − 2 = 5'),
      hold: 2400,
      result: false,
      caption: t(
        'After turn 2: kangaroo at step 7, rabbit at step 5. They have crossed — the kangaroo overtook the rabbit!',
        'Setelah giliran 2: kanguru di anak tangga 7, kelinci di anak tangga 5. Mereka bersilangan — kanguru melewati kelinci!',
      ),
    },

    // Beat 3 — locate the crossing = step 6
    {
      phase: 'crossing',
      kangarooStep: 7,
      rabbitStep: 5,
      highlightSteps: [6],
      equation: t('Crossing at step 6', 'Persilangan di anak tangga 6'),
      hold: 2400,
      result: false,
      caption: t(
        'Between turn 1 and turn 2 both animals passed through step 6 at the same moment — that is the meeting step.',
        'Di antara giliran 1 dan 2, kedua hewan melewati anak tangga 6 pada saat yang sama — itulah anak tangga pertemuan.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      kangarooStep: 6,
      rabbitStep: 6,
      highlightSteps: [6],
      equation: t('Step 6 → D', 'Anak tangga 6 → D'),
      hold: 0,
      result: true,
      caption: t(
        'They meet at step 6 — answer D.',
        'Mereka bertemu di anak tangga 6 — jawaban D.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
