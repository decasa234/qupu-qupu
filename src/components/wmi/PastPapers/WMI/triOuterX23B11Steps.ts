// SEAMO-X 2023 Paper B Q11 — storyboard for the outer-triangle explainer.
//
// Question: △ABC has area 10 cm². Points D, E, F are formed by extending each
// side of △ABC by its own length (AB=BD, CA=AF, BC=CE). Find area of △DEF.
//
// Teaching walk:
//   0. intro     — show the full figure; state the given area 10 cm².
//   1. extend    — highlight the three extension segments; note midpoints B, A, C.
//   2. one-flap  — shade outer △DAF; show it equals 2 × 10 = 20 cm².
//   3. all-flaps — shade all three outer regions; each is 20 cm².
//   4. calc      — show the addition: 10 + 20 + 20 + 20 = 70.
//   5. result    — △DEF = 70 cm² (answer).
//
// Pure builder: (lang) → storyboard.  No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type OuterPhase = 'intro' | 'extend' | 'one-flap' | 'all-flaps' | 'calc' | 'result'

export interface OuterBeat {
  phase: OuterPhase
  /** Highlight the three extension lines in amber. */
  highlightExt: boolean
  /** Highlight the inner triangle in green. */
  highlightInner: boolean
  /** Which outer regions to shade (light blue). */
  shadeRegions: Array<'daf' | 'fce' | 'dbe'>
  /** Equation shown below the figure. */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final/manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface OuterStoryboard {
  steps: OuterBeat[]
  finalIndex: number
}

export function buildTriOuterX23B11Steps(lang: Lang): OuterStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: OuterBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlightExt: false,
      highlightInner: false,
      shadeRegions: [],
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Triangle ABC (shaded) has area 10 cm². Points D, E, F lie outside △ABC — each is formed by extending one side of △ABC by its own length.',
        'Segitiga ABC (diarsir) mempunyai luas 10 cm². Titik D, E, F berada di luar △ABC — masing-masing dibentuk dengan memperpanjang satu sisi △ABC sepanjang sisinya sendiri.',
      ),
    },

    // Beat 1 — highlight extensions
    {
      phase: 'extend',
      highlightExt: true,
      highlightInner: false,
      shadeRegions: [],
      equation: '',
      hold: 2400,
      result: false,
      caption: t(
        'AB = BD (so B is the midpoint of AD); CA = AF (A is the midpoint of FC); BC = CE (C is the midpoint of BE). Each side is doubled.',
        'AB = BD (jadi B adalah titik tengah AD); CA = AF (A adalah titik tengah FC); BC = CE (C adalah titik tengah BE). Setiap sisi digandakan.',
      ),
    },

    // Beat 2 — one outer flap
    {
      phase: 'one-flap',
      highlightExt: false,
      highlightInner: false,
      shadeRegions: ['daf'],
      equation: '20 cm²',
      hold: 2400,
      result: false,
      caption: t(
        'Outer triangle △DAF (blue) — its base DA = 2 × AB while sharing the same height from F as △FAB, giving area △DAF = 2 × area △ABC = 20 cm².',
        'Segitiga luar △DAF (biru) — alasnya DA = 2 × AB dengan tinggi yang sama dari F seperti △FAB, sehingga luas △DAF = 2 × luas △ABC = 20 cm².',
      ),
    },

    // Beat 3 — all three outer flaps
    {
      phase: 'all-flaps',
      highlightExt: false,
      highlightInner: false,
      shadeRegions: ['daf', 'fce', 'dbe'],
      equation: '3 × 20 cm²',
      hold: 2400,
      result: false,
      caption: t(
        'By the same argument, △FCE and △DBE each also equal 20 cm². The three outer triangles together cover 3 × 20 = 60 cm².',
        'Dengan argumen yang sama, △FCE dan △DBE masing-masing juga sama dengan 20 cm². Ketiga segitiga luar bersama-sama mencakup 3 × 20 = 60 cm².',
      ),
    },

    // Beat 4 — calculation
    {
      phase: 'calc',
      highlightExt: false,
      highlightInner: true,
      shadeRegions: ['daf', 'fce', 'dbe'],
      equation: '10 + 20 + 20 + 20',
      hold: 2400,
      result: false,
      caption: t(
        'Area △DEF = area △ABC + three outer triangles = 10 + 20 + 20 + 20 = 70 cm².',
        'Luas △DEF = luas △ABC + tiga segitiga luar = 10 + 20 + 20 + 20 = 70 cm².',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      highlightExt: false,
      highlightInner: true,
      shadeRegions: ['daf', 'fce', 'dbe'],
      equation: '△DEF = 70 cm²',
      hold: 0,
      result: true,
      caption: t(
        'The area of △DEF is 70 cm².',
        'Luas △DEF adalah 70 cm².',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
