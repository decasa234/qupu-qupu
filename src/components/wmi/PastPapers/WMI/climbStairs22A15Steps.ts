// SEAMO-22-A-Q15 — animation storyboard.
//
// Question: 5-step staircase; Chatdanai takes 1 or 2 steps at a time.
// How many ways? Answer: B (8)
//
// Solution: Fibonacci recurrence
//   ways(1) = 1
//   ways(2) = 2
//   ways(3) = ways(2) + ways(1) = 3
//   ways(4) = ways(3) + ways(2) = 5
//   ways(5) = ways(4) + ways(3) = 8
//
// Beat-by-beat storyboard:
//   0. intro   — static staircase, no highlights.
//   1. base1   — highlight step 1: ways(1) = 1.
//   2. base2   — highlight steps 1–2: ways(2) = 2.
//   3. step3   — highlight steps 1–3: ways(3) = 1 + 2 = 3.
//   4. step4   — highlight steps 1–4: ways(4) = 2 + 3 = 5.
//   5. step5   — highlight all 5: ways(5) = 3 + 5 = 8.
//   6. result  — highlight step 5 green; answer B.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type ClimbPhase = 'intro' | 'base1' | 'base2' | 'step3' | 'step4' | 'step5' | 'result'

export interface ClimbBeat {
  phase: ClimbPhase
  /** Steps to highlight (1-indexed). */
  highlightSteps: number[]
  /** Equation shown below the figure. */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  result: boolean
}

export interface ClimbStoryboard {
  steps: ClimbBeat[]
  finalIndex: number
}

export function buildClimbStairs22A15Steps(lang: Lang): ClimbStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ClimbBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlightSteps: [],
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'Chatdanai can take 1 or 2 steps at a time. Let ways(n) = number of ways to reach step n.',
        'Chatdanai dapat naik 1 atau 2 anak tangga sekaligus. Misalkan cara(n) = banyak cara mencapai anak tangga n.',
      ),
    },

    // Beat 1 — base case: step 1
    {
      phase: 'base1',
      highlightSteps: [1],
      equation: t('ways(1) = 1', 'cara(1) = 1'),
      hold: 2200,
      result: false,
      caption: t(
        'Step 1: only one way to reach it — take a single step. ways(1) = 1.',
        'Anak tangga 1: hanya satu cara — ambil 1 langkah. cara(1) = 1.',
      ),
    },

    // Beat 2 — base case: step 2
    {
      phase: 'base2',
      highlightSteps: [1, 2],
      equation: t('ways(2) = 2  (1+1 or 2)', 'cara(2) = 2  (1+1 atau 2)'),
      hold: 2400,
      result: false,
      caption: t(
        'Step 2: two ways — "1 then 1" or "jump 2 at once". ways(2) = 2.',
        'Anak tangga 2: dua cara — "1 lalu 1" atau "loncat 2 sekaligus". cara(2) = 2.',
      ),
    },

    // Beat 3 — step 3
    {
      phase: 'step3',
      highlightSteps: [1, 2, 3],
      equation: t('ways(3) = ways(2) + ways(1) = 2 + 1 = 3', 'cara(3) = cara(2) + cara(1) = 2 + 1 = 3'),
      hold: 2600,
      result: false,
      caption: t(
        'To reach step 3, arrive from step 2 (take 1) or step 1 (jump 2). ways(3) = 2 + 1 = 3.',
        'Untuk mencapai anak tangga 3, bisa dari anak tangga 2 (ambil 1) atau anak tangga 1 (loncat 2). cara(3) = 2 + 1 = 3.',
      ),
    },

    // Beat 4 — step 4
    {
      phase: 'step4',
      highlightSteps: [1, 2, 3, 4],
      equation: t('ways(4) = ways(3) + ways(2) = 3 + 2 = 5', 'cara(4) = cara(3) + cara(2) = 3 + 2 = 5'),
      hold: 2600,
      result: false,
      caption: t(
        'Step 4: arrive from step 3 (take 1) or step 2 (jump 2). ways(4) = 3 + 2 = 5.',
        'Anak tangga 4: dari anak tangga 3 (ambil 1) atau anak tangga 2 (loncat 2). cara(4) = 3 + 2 = 5.',
      ),
    },

    // Beat 5 — step 5
    {
      phase: 'step5',
      highlightSteps: [1, 2, 3, 4, 5],
      equation: t('ways(5) = ways(4) + ways(3) = 5 + 3 = 8', 'cara(5) = cara(4) + cara(3) = 5 + 3 = 8'),
      hold: 2800,
      result: false,
      caption: t(
        'Step 5: arrive from step 4 (take 1) or step 3 (jump 2). ways(5) = 5 + 3 = 8.',
        'Anak tangga 5: dari anak tangga 4 (ambil 1) atau anak tangga 3 (loncat 2). cara(5) = 5 + 3 = 8.',
      ),
    },

    // Beat 6 — result
    {
      phase: 'result',
      highlightSteps: [5],
      equation: t('8 ways → Answer B', '8 cara → Jawaban B'),
      hold: 0,
      result: true,
      caption: t(
        'There are 8 ways for Chatdanai to climb 5 steps — answer B.',
        'Ada 8 cara bagi Chatdanai untuk menaiki 5 anak tangga — jawaban B.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
