// IKMC-19-EC-Q9 — storyboard for the pinned-photos animation.
//
// The question: Linda pinned 3 photos in a row using 8 pins (shared corner pins).
// Peter wants to pin 7 photos the same way. How many pins does he need?
// Answer B (16 pins).
//
// Teaching walk, one idea per beat:
//   0. intro       — show Linda's 3 photos with 8 pins; state the given fact.
//   1. columns     — highlight the 4 pin columns; "for 3 photos → 4 columns".
//   2. formula     — show formula: pins = (n + 1) × 2; verify with n = 3.
//   3. apply       — show 7 photos (compressed), (7 + 1) × 2 = 16.
//   4. result      — 16 → answer B.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type PinPhaseId = 'intro' | 'columns' | 'formula' | 'apply' | 'result'

export interface PinBeat {
  /** Which animation phase this beat belongs to. */
  phase: PinPhaseId
  /** Number of photos to render in the SVG (3 in beats 0–2, 7 in beats 3–4). */
  photoCount: 3 | 7
  /** Whether to highlight the pin-column lines. */
  showColumns: boolean
  /** Whether to show the formula chip below the figure. */
  showFormula: boolean
  /** Equation / maths line to display; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface PinStoryboard {
  steps: PinBeat[]
  finalIndex: number
}

export function buildPinnedPhotos9ECSteps(lang: Lang): PinStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PinBeat[] = [
    // Beat 0 — intro: show Linda's 3 photos with 8 pins
    {
      phase: 'intro',
      photoCount: 3,
      showColumns: false,
      showFormula: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Linda pinned 3 photos in a row using 8 pins. Adjacent photos share corner pins.',
        'Linda menempel 3 foto berjajar menggunakan 8 paku. Foto yang berdekatan berbagi paku sudut.',
      ),
    },

    // Beat 1 — highlight pin columns
    {
      phase: 'columns',
      photoCount: 3,
      showColumns: true,
      showFormula: false,
      equation: '3 photos → 4 columns',
      hold: 2200,
      result: false,
      caption: t(
        '3 photos have 4 pin columns (left edge + 2 shared + right edge), each with 2 pins.',
        '3 foto memiliki 4 kolom paku (tepi kiri + 2 bersama + tepi kanan), masing-masing 2 paku.',
      ),
    },

    // Beat 2 — show formula, verify
    {
      phase: 'formula',
      photoCount: 3,
      showColumns: true,
      showFormula: true,
      equation: '(3 + 1) × 2 = 8 ✓',
      hold: 2200,
      result: false,
      caption: t(
        'Pattern: for n photos → (n + 1) columns × 2 pins. Check: (3 + 1) × 2 = 8 ✓',
        'Pola: untuk n foto → (n + 1) kolom × 2 paku. Cek: (3 + 1) × 2 = 8 ✓',
      ),
    },

    // Beat 3 — apply to 7 photos
    {
      phase: 'apply',
      photoCount: 7,
      showColumns: true,
      showFormula: true,
      equation: '(7 + 1) × 2 = 16',
      hold: 2200,
      result: false,
      caption: t(
        '7 photos → (7 + 1) = 8 columns × 2 pins = 16 pins.',
        '7 foto → (7 + 1) = 8 kolom × 2 paku = 16 paku.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      photoCount: 7,
      showColumns: false,
      showFormula: true,
      equation: '16 → B',
      hold: 0,
      result: true,
      caption: t(
        'Peter needs 16 pins — answer B.',
        'Peter membutuhkan 16 paku — jawaban B.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
