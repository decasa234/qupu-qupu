// IKMC-20-EC-Q12 — storyboard for the fence-pole animation.
//
// The question: A 4 m fence uses 1 m poles (2 horizontal rails, vertical posts).
// Count the 4 m fence → 18 poles = 4×4+2. Pattern: each extra 1 m adds 4 poles,
// +2 for the closing post. For 10 m: 10×4+2 = 42 → answer E.
//
// Teaching walk, one idea per beat:
//   0. intro     — show the 4 m fence; "count the poles".
//   1. per-sect  — highlight one section's 4 poles; 1 m section = 4 poles.
//   2. count4    — count all 18 poles in the 4 m fence; 4×4+2=18.
//   3. pattern   — each 1 m adds 4 poles; +2 for the far-end post.
//   4. scale10   — apply formula to 10 m; 10×4+2=42.
//   5. result    — answer E (42).
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type FencePhaseId =
  | 'intro'
  | 'per-sect'
  | 'count4'
  | 'pattern'
  | 'scale10'
  | 'result'

export interface FenceBeat {
  /** Which animation phase this beat belongs to. */
  phase: FencePhaseId
  /**
   * Which section (0-indexed) to highlight as a single unit. -1 = none.
   * The explainer colours that section's 4 poles distinctly.
   */
  highlightSection: number
  /**
   * Show the running pole-count badge above the fence.
   * 0 = hidden.
   */
  poleCount: number
  /** Show the "4 m = 18 poles" full annotation. */
  showTotal4: boolean
  /** Show the formula label (n×4+2). */
  showFormula: boolean
  /** Show the 10 m result row. */
  showResult10: boolean
  /** Equation / maths line to display below the figure; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface FenceStoryboard {
  steps: FenceBeat[]
  finalIndex: number
}

export function buildFence12ECSteps(lang: Lang): FenceStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: FenceBeat[] = [
    // Beat 0 — intro: show the 4 m fence, ask student to count
    {
      phase: 'intro',
      highlightSection: -1,
      poleCount: 0,
      showTotal4: false,
      showFormula: false,
      showResult10: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'The picture shows a 4 m fence built from 1 m poles. Let\'s count how many poles it uses.',
        'Gambar menunjukkan pagar 4 m yang dibuat dari tiang 1 m. Mari hitung berapa tiang yang digunakan.',
      ),
    },

    // Beat 1 — highlight one section's 4 poles
    {
      phase: 'per-sect',
      highlightSection: 1,
      poleCount: 0,
      showTotal4: false,
      showFormula: false,
      showResult10: false,
      equation: '1 section = 4 poles',
      hold: 2400,
      result: false,
      caption: t(
        'Each 1 m section uses 4 poles: 1 left post + 1 top rail + 1 bottom rail + 1 right post (shared with next section).',
        'Setiap bagian 1 m menggunakan 4 tiang: 1 tiang kiri + 1 rel atas + 1 rel bawah + 1 tiang kanan (berbagi dengan bagian berikutnya).',
      ),
    },

    // Beat 2 — count all poles in 4 m fence
    {
      phase: 'count4',
      highlightSection: -1,
      poleCount: 18,
      showTotal4: true,
      showFormula: false,
      showResult10: false,
      equation: '4 × 4 + 2 = 18',
      hold: 2400,
      result: false,
      caption: t(
        '4 sections × 4 poles each = 16, plus 2 for the closing right-end post → 18 poles total.',
        '4 bagian × 4 tiang masing-masing = 16, ditambah 2 untuk tiang penutup ujung kanan → 18 tiang total.',
      ),
    },

    // Beat 3 — show the pattern
    {
      phase: 'pattern',
      highlightSection: -1,
      poleCount: 0,
      showTotal4: true,
      showFormula: true,
      showResult10: false,
      equation: 'poles = n × 4 + 2',
      hold: 2400,
      result: false,
      caption: t(
        'Pattern: every extra 1 m adds 4 poles. The far end always needs +2. Formula: poles = n × 4 + 2.',
        'Pola: setiap 1 m tambahan menambahkan 4 tiang. Ujung jauh selalu perlu +2. Rumus: tiang = n × 4 + 2.',
      ),
    },

    // Beat 4 — scale to 10 m
    {
      phase: 'scale10',
      highlightSection: -1,
      poleCount: 0,
      showTotal4: false,
      showFormula: true,
      showResult10: true,
      equation: '10 × 4 + 2 = 42',
      hold: 2400,
      result: false,
      caption: t(
        'For a 10 m fence: 10 × 4 + 2 = 42 poles.',
        'Untuk pagar 10 m: 10 × 4 + 2 = 42 tiang.',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      highlightSection: -1,
      poleCount: 0,
      showTotal4: false,
      showFormula: false,
      showResult10: true,
      equation: '42 → E',
      hold: 0,
      result: true,
      caption: t(
        'Lonneke needs 42 poles for a 10 m fence — answer E.',
        'Lonneke membutuhkan 42 tiang untuk pagar 10 m — jawaban E.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
