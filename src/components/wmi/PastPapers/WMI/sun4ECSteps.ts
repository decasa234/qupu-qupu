/**
 * IKMC-21-EC-Q4 — animation storyboard for "Alaya's sun" visual-matching question.
 *
 * Question: Alaya draws a picture of the sun. Which answer figure is part of her picture?
 * Answer: B — a fan of 3 even rays that matches a section of the sun's ray ring.
 *
 * Teaching walk, one idea per beat:
 *   0. intro      — show the full sun; state the task: find which option fits.
 *   1. scan-rays  — highlight the ray ring; count: ~13 rays, spaced evenly.
 *   2. test-b     — overlay option B fan on a matching section; it fits exactly.
 *   3. result     — confirm: answer B.
 *
 * Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.
 */

export type Lang = 'en' | 'id'

export type PhaseId = 'intro' | 'scan-rays' | 'test-b' | 'result'

export interface AnimBeat {
  phase: PhaseId
  /** Highlight the sun's full ray ring. */
  highlightRays: boolean
  /** Show the "B fits" overlay fan on the sun. */
  showBOverlay: boolean
  /** Show the result badge (answer B). */
  showResult: boolean
  /** Equation / label shown in the chip row. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the final result beat. */
  result: boolean
}

export interface Sun4ECStoryboard {
  steps: AnimBeat[]
  finalIndex: number
}

export function buildSun4ECSteps(lang: Lang): Sun4ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: AnimBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlightRays: false,
      showBOverlay: false,
      showResult: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        "Alaya's sun has a smiling circle with spiky rays all around. Which answer figure is a part of this drawing?",
        'Matahari Alaya berupa lingkaran tersenyum dengan sinar-sinar runcing di sekelilingnya. Gambar pilihan mana yang merupakan bagian dari gambar ini?',
      ),
    },

    // Beat 1 — scan the ray ring
    {
      phase: 'scan-rays',
      highlightRays: true,
      showBOverlay: false,
      showResult: false,
      equation: t('~13 rays, evenly spaced', '~13 sinar, berjarak rata'),
      hold: 2400,
      result: false,
      caption: t(
        'Look at the ray ring: about 13 spiky rays, evenly spread around the circle. Each neighbouring pair forms a fan of 3 equal rays.',
        'Perhatikan cincin sinar: sekitar 13 sinar runcing, tersebar merata mengelilingi lingkaran. Setiap pasangan tetangga membentuk kipas dari 3 sinar rata.',
      ),
    },

    // Beat 2 — test option B
    {
      phase: 'test-b',
      highlightRays: false,
      showBOverlay: true,
      showResult: false,
      equation: t('Option B fits!', 'Pilihan B cocok!'),
      hold: 2400,
      result: false,
      caption: t(
        'Option B shows 3 rays in an even fan — exactly matching any 3 neighbouring rays on the sun. Fit!',
        'Pilihan B menunjukkan 3 sinar dalam kipas rata — persis cocok dengan 3 sinar tetangga mana pun di matahari. Cocok!',
      ),
    },

    // Beat 3 — result
    {
      phase: 'result',
      highlightRays: false,
      showBOverlay: true,
      showResult: true,
      equation: t('Answer B', 'Jawaban B'),
      hold: 0,
      result: true,
      caption: t(
        "Option B — a fan of 3 even spiky rays — is the piece that fits inside Alaya's sun drawing. Answer B.",
        'Pilihan B — kipas 3 sinar runcing rata — adalah potongan yang cocok dalam gambar matahari Alaya. Jawaban B.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
