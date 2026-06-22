// IKMC-23-PE-Q9 — storyboard for the park / line-of-sight animation.
//
// Question: 5 trees in a park; a beaver sees exactly 2 trees (3 are hidden
// behind others). At which of the marked points A–E is it standing? → Answer D.
//
// Teaching walk, one idea per beat:
//   0. intro   — show the static park map; state the given facts.
//   1. scan-a  — try point A (top-left): draw sight lines → sees 4 trees, ✗.
//   2. scan-b  — try point B (top): draw sight lines → sees 3 or more trees, ✗.
//   3. scan-c  — try point C (top-right): still sees more than 2, ✗.
//   4. scan-d  — try point D (right): 3 trees cluster along the same line of
//               sight → only 2 visible (T4 + T5), ✓.
//   5. result  — point D confirmed; answer D.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'scan-a' | 'scan-b' | 'scan-c' | 'scan-d' | 'result'

export interface ParkBeat {
  phase: PhaseId
  /** Which candidate point is being tested (null = none highlighted). */
  testPoint: 'A' | 'B' | 'C' | 'D' | null
  /** Whether to draw sight-lines from the test point to all 5 trees. */
  showLines: boolean
  /** Trees hidden from the current test point (used to draw an X on them). */
  hiddenTrees: number[]
  /** Whether the current candidate is the correct answer (green tick). */
  correct: boolean
  /** Caption text for the explanation box. */
  caption: string
  /** Equation / verdict chip text; '' to hide. */
  equation: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface ParkStoryboard {
  steps: ParkBeat[]
  finalIndex: number
}

export function buildPark9PESteps(lang: Lang): ParkStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ParkBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      testPoint: null,
      showLines: false,
      hiddenTrees: [],
      correct: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        '5 trees in the park. The beaver can see only 2 trees — 3 must be hidden behind other trees. Try each marked point.',
        '5 pohon di taman. Berang-berang hanya bisa melihat 2 pohon — 3 tersembunyi di balik pohon lain. Coba setiap titik.',
      ),
    },

    // Beat 1 — try point A (top-left)
    {
      phase: 'scan-a',
      testPoint: 'A',
      showLines: true,
      hiddenTrees: [2],        // from A only T2 hides behind T1 — sees 4, not 2
      correct: false,
      equation: t('From A: 4 visible ✗', 'Dari A: 4 terlihat ✗'),
      hold: 2000,
      result: false,
      caption: t(
        'From point A, sight lines spread out — 4 trees are clearly visible. Not the answer.',
        'Dari titik A, garis pandang menyebar luas — 4 pohon terlihat jelas. Bukan jawabannya.',
      ),
    },

    // Beat 2 — try point B (top)
    {
      phase: 'scan-b',
      testPoint: 'B',
      showLines: true,
      hiddenTrees: [4],       // from B, T3 may hide T4 — sees 4, still not 2
      correct: false,
      equation: t('From B: 4 visible ✗', 'Dari B: 4 terlihat ✗'),
      hold: 2000,
      result: false,
      caption: t(
        'From point B, most trees are still visible. Still more than 2. Not the answer.',
        'Dari titik B, sebagian besar pohon masih terlihat. Masih lebih dari 2. Bukan jawabannya.',
      ),
    },

    // Beat 3 — try point C (top-right)
    {
      phase: 'scan-c',
      testPoint: 'C',
      showLines: true,
      hiddenTrees: [2],       // from C, a small cluster hide — still sees 4
      correct: false,
      equation: t('From C: 4 visible ✗', 'Dari C: 4 terlihat ✗'),
      hold: 2000,
      result: false,
      caption: t(
        'From point C, the trees spread out to the left — 4 trees visible. Not the answer.',
        'Dari titik C, pohon-pohon tersebar ke kiri — 4 pohon terlihat. Bukan jawabannya.',
      ),
    },

    // Beat 4 — try point D (right): the correct point
    {
      phase: 'scan-d',
      testPoint: 'D',
      showLines: true,
      hiddenTrees: [1, 2, 3],  // T1, T2, T3 line up behind T4 from point D → 3 hidden
      correct: true,
      equation: t('From D: 2 visible ✓', 'Dari D: 2 terlihat ✓'),
      hold: 2400,
      result: false,
      caption: t(
        'From point D, three trees line up behind the large tree — only 2 trees are visible!',
        'Dari titik D, tiga pohon berjajar di balik pohon besar — hanya 2 pohon yang terlihat!',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      testPoint: 'D',
      showLines: true,
      hiddenTrees: [1, 2, 3],
      correct: true,
      equation: t('Answer: D', 'Jawaban: D'),
      hold: 0,
      result: true,
      caption: t(
        'The beaver stands at point D. From there, exactly 3 trees are hidden behind the large tree — only 2 are visible. Answer D.',
        'Berang-berang berdiri di titik D. Dari sana, tepat 3 pohon tersembunyi di balik pohon besar — hanya 2 yang terlihat. Jawaban D.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
