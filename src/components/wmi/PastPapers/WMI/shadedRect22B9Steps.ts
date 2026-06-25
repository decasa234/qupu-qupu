// SEAMO-22-B-Q9 — animation storyboard for the shaded-rectangle area problem.
//
// Rectangle ABCD, area = 40 cm². E, F, G are midpoints of AB, BC, CD.
// H is a point on AD. Shaded = triangles AHE + HDG.
// Proof that shaded = 20 cm²:
//   Split ABCD with the horizontal mid-line EG.
//   Top half (A–H–E and H–D–G) covers the entire top half = 20 cm².
//   The two shaded triangles together ARE the top half.
//   ∴ shaded = 40 ÷ 2 = 20 cm²  → answer B.
//
// Teaching beats (one idea per beat):
//   0. intro   — show the problem figure with shaded triangles; state the area.
//   1. midline — draw the horizontal mid-line E–G; top half = 20 cm².
//   2. top     — the entire top rectangle half is covered by the two shaded triangles.
//   3. result  — shaded area = 20 cm² → B.

export type Lang = 'en' | 'id'

export type ShadedRectPhaseId = 'intro' | 'midline' | 'top' | 'result'

export interface ShadedRectBeat {
  phase: ShadedRectPhaseId
  /** Show the horizontal midline E–G */
  showMidline: boolean
  /** Highlight the entire top half in amber */
  highlightTop: boolean
  /** Show arithmetic equation below the figure */
  equation: string
  /** Caption text */
  caption: string
  /** Auto-advance hold in ms (0 = final/manual) */
  hold: number
  /** True only on the last beat */
  result: boolean
}

export interface ShadedRectStoryboard {
  steps: ShadedRectBeat[]
  finalIndex: number
}

export function buildShadedRect22B9Steps(lang: Lang): ShadedRectStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ShadedRectBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      showMidline: false,
      highlightTop: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Rectangle ABCD has area 40 cm². E, F, G are midpoints. H is on AD. Find the shaded area.',
        'Persegi panjang ABCD luas 40 cm². E, F, G titik tengah. H di AD. Temukan luas arsiran.',
      ),
    },

    // Beat 1 — draw midline E–G (horizontal)
    {
      phase: 'midline',
      showMidline: true,
      highlightTop: false,
      equation: '40 ÷ 2 = 20 cm²',
      hold: 2400,
      result: false,
      caption: t(
        'Join E to G: the horizontal mid-line splits ABCD into two equal halves, each 20 cm².',
        'Hubungkan E ke G: garis tengah horizontal membagi ABCD menjadi dua bagian sama, masing-masing 20 cm².',
      ),
    },

    // Beat 2 — show that the two shaded triangles fill the top half exactly
    {
      phase: 'top',
      showMidline: true,
      highlightTop: true,
      equation: '△AHE + △HDG = top half',
      hold: 2400,
      result: false,
      caption: t(
        'Triangles AHE and HDG together cover the entire top half — no overlap, no gap.',
        'Segitiga AHE dan HDG bersama menutupi tepat seluruh setengah atas — tanpa tumpang tindih.',
      ),
    },

    // Beat 3 — result
    {
      phase: 'result',
      showMidline: true,
      highlightTop: false,
      equation: 'Shaded = 20 cm²',
      hold: 0,
      result: true,
      caption: t(
        'Shaded area = 20 cm² — answer B.',
        'Luas arsiran = 20 cm² — jawaban B.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
