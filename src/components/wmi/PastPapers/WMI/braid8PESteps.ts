// IKMC-20-PE-Q8 — storyboard for the three-strand braid animation.
//
// The question: A braid is made of three threads (green, blue, red).
// Threads are numbered 1, 2, 3 at the right end. Trace each thread back
// through the braid to its colour. Answer D: 1=green, 2=blue, 3=red.
//
// Teaching walk, one idea per beat:
//   0. intro     — show the full braid; state the task (trace each numbered tail).
//   1. trace-1   — highlight thread 1's path back to the green strand → 1 = green.
//   2. trace-2   — highlight thread 2's path back to the blue strand  → 2 = blue.
//   3. trace-3   — highlight thread 3's path back to the red strand   → 3 = red.
//   4. result    — show full braid (colours revealed); announce answer D.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type BraidPhase = 'intro' | 'trace-1' | 'trace-2' | 'trace-3' | 'result'

export interface BraidBeat {
  /** Which animation phase this beat belongs to. */
  phase: BraidPhase
  /**
   * Which strand to highlight (dim the others). null = show all at full opacity.
   * 'G' | 'B' | 'R'
   */
  highlight: 'G' | 'B' | 'R' | null
  /** Equation / label to display below the figure; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface BraidStoryboard {
  steps: BraidBeat[]
  finalIndex: number
}

export function buildBraid8PESteps(lang: Lang): BraidStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BraidBeat[] = [
    // Beat 0 — intro: show the braid, state the goal.
    {
      phase: 'intro',
      highlight: null,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Three threads are braided together. Trace each numbered tail back to find its colour.',
        'Tiga benang dianyam bersama. Telusuri setiap ekor bernomor untuk menemukan warnanya.',
      ),
    },

    // Beat 1 — trace thread 1: green strand.
    {
      phase: 'trace-1',
      highlight: 'G',
      equation: t('Thread 1 → green', 'Benang 1 → hijau'),
      hold: 2400,
      result: false,
      caption: t(
        'Thread 1 (top-right tail) — follow it through the crossings. It connects to the green thread on the left.',
        'Benang 1 (ekor kanan atas) — ikuti melalui setiap persilangan. Terhubung ke benang hijau di kiri.',
      ),
    },

    // Beat 2 — trace thread 2: blue strand.
    {
      phase: 'trace-2',
      highlight: 'B',
      equation: t('Thread 2 → blue', 'Benang 2 → biru'),
      hold: 2400,
      result: false,
      caption: t(
        'Thread 2 (middle-right tail) — trace back through each crossing. It connects to the blue thread on the left.',
        'Benang 2 (ekor kanan tengah) — telusuri melalui setiap persilangan. Terhubung ke benang biru di kiri.',
      ),
    },

    // Beat 3 — trace thread 3: red strand.
    {
      phase: 'trace-3',
      highlight: 'R',
      equation: t('Thread 3 → red', 'Benang 3 → merah'),
      hold: 2400,
      result: false,
      caption: t(
        'Thread 3 (bottom-right tail) — trace back through each crossing. It connects to the red thread on the left.',
        'Benang 3 (ekor kanan bawah) — telusuri melalui setiap persilangan. Terhubung ke benang merah di kiri.',
      ),
    },

    // Beat 4 — result: full braid, announce answer.
    {
      phase: 'result',
      highlight: null,
      equation: t('1=green, 2=blue, 3=red → D', '1=hijau, 2=biru, 3=merah → D'),
      hold: 0,
      result: true,
      caption: t(
        'Thread 1 is green, thread 2 is blue, thread 3 is red — answer D.',
        'Benang 1 berwarna hijau, benang 2 berwarna biru, benang 3 berwarna merah — jawaban D.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
