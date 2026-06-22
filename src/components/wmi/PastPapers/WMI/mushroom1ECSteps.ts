// IKMC-20-EC-Q1 — storyboard for the "mushroom growing order" animation.
//
// The question: Mary photographs a mushroom Mon–Fri (5 photos). Which photo
// was taken on Tuesday? Answer: E (second-smallest mushroom).
//
// Size ranking from source paper:
//   B (tiny sprout)  < E (small, 2nd-smallest)  < C (medium)
//   < D (medium-large)  < A (tall, widest cap)
//   Mon=B,  Tue=E ← answer,  Wed=C,  Thu=D,  Fri=A
//
// Teaching walk, one idea per beat:
//   0. intro    — mushroom grows each day; 5 days = 5 photos.
//   1. order    — rank the 5 photos smallest → largest.
//   2. tuesday  — Tuesday = day 2 = second-smallest → option E.
//   3. result   — highlight E as the answer.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'order' | 'tuesday' | 'result'

export interface MushroomBeat {
  /** Which animation phase this beat belongs to. */
  phase: PhaseId
  /**
   * Which option letter is currently spotlit ('A'–'E' or null).
   * During 'order' phase all panels show their rank labels.
   */
  spotlit: 'A' | 'B' | 'C' | 'D' | 'E' | null
  /** Whether to show the size-rank row beneath each panel. */
  showRanks: boolean
  /** Whether to spotlight (green) the answer E. */
  showAnswer: boolean
  /** Equation or key line shown in the equation chip; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = manual / final). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface MushroomStoryboard {
  steps: MushroomBeat[]
  finalIndex: number
}

export function buildMushroom1ECSteps(lang: Lang): MushroomStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: MushroomBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      spotlit: null,
      showRanks: false,
      showAnswer: false,
      equation: '',
      hold: 2400,
      result: false,
      caption: t(
        'The mushroom grows a little every day. Mary takes one photo per day, Monday to Friday — 5 photos in total.',
        'Jamur tumbuh sedikit setiap hari. Mary mengambil satu foto per hari, Senin hingga Jumat — 5 foto total.',
      ),
    },

    // Beat 1 — rank by size
    {
      phase: 'order',
      spotlit: null,
      showRanks: true,
      showAnswer: false,
      equation: t('Day 1 (smallest) → Day 5 (largest)', 'Hari 1 (terkecil) → Hari 5 (terbesar)'),
      hold: 2600,
      result: false,
      caption: t(
        'Sort the five photos from smallest to largest: B → E → C → D → A. Each rank = one day.',
        'Urutkan lima foto dari terkecil ke terbesar: B → E → C → D → A. Setiap peringkat = satu hari.',
      ),
    },

    // Beat 2 — identify Tuesday
    {
      phase: 'tuesday',
      spotlit: 'E',
      showRanks: true,
      showAnswer: false,
      equation: t('Tuesday = Day 2 = 2nd-smallest', 'Selasa = Hari 2 = terkecil ke-2'),
      hold: 2400,
      result: false,
      caption: t(
        'Tuesday is the 2nd day, so we need the 2nd-smallest mushroom. That is photo E.',
        'Selasa adalah hari ke-2, jadi kita butuh jamur terkecil kedua. Itu adalah foto E.',
      ),
    },

    // Beat 3 — result
    {
      phase: 'result',
      spotlit: 'E',
      showRanks: true,
      showAnswer: true,
      equation: t('Day 2 = E → Answer E', 'Hari 2 = E → Jawaban E'),
      hold: 0,
      result: true,
      caption: t(
        'Photo E is the second-smallest mushroom — it was taken on Tuesday. Answer: E.',
        'Foto E adalah jamur terkecil kedua — diambil pada hari Selasa. Jawaban: E.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
