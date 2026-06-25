// SEAMO-X 2022 Paper B Q11 — storyboard for the cevian inner-triangle explainer.
//
// Question: △ABC has area 21 cm². D, E, F are the intersections of three cevians
// that each divide the opposite side in ratio 2:1 (rotating). Find area △DEF.
//
// Teaching walk:
//   0. intro    — show the full figure; state the given area 21 cm².
//   1. cevians  — highlight the three cevians; note each divides in 2:1.
//   2. inner    — focus on inner triangle DEF; introduce the 1/7 ratio.
//   3. calc     — show the multiplication: 21 × (1/7) = 3.
//   4. result   — △DEF = 3 cm² (answer).
//
// Pure builder: (lang) → storyboard.  No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type CevianPhase = 'intro' | 'cevians' | 'inner' | 'calc' | 'result'

export interface CevianBeat {
  phase: CevianPhase
  /** Highlight the cevian lines in amber. */
  highlightCevians: boolean
  /** Highlight the inner triangle DEF in green. */
  highlightInner: boolean
  /** Show the 1/7 ratio badge near DEF. */
  showRatio: boolean
  /** Equation shown below the figure. */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final/manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface CevianStoryboard {
  steps: CevianBeat[]
  finalIndex: number
}

export function buildCevianX22B11Steps(lang: Lang): CevianStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CevianBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlightCevians: false,
      highlightInner: false,
      showRatio: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Triangle ABC has area 21 cm². Three lines are drawn from each vertex to the opposite side — they form a small inner triangle DEF (shaded).',
        'Segitiga ABC mempunyai luas 21 cm². Tiga garis ditarik dari tiap sudut ke sisi yang berhadapan — membentuk segitiga dalam DEF yang lebih kecil (diarsir).',
      ),
    },

    // Beat 1 — highlight cevians
    {
      phase: 'cevians',
      highlightCevians: true,
      highlightInner: false,
      showRatio: false,
      equation: '',
      hold: 2400,
      result: false,
      caption: t(
        'Each cevian divides its opposite side in ratio 2:1 — so the foot is always ²⁄₃ of the way along the side.',
        'Setiap garis cevian membagi sisi berhadapan dengan perbandingan 2:1 — sehingga titik kaki selalu berada ²⁄₃ jalan di sepanjang sisi.',
      ),
    },

    // Beat 2 — inner triangle
    {
      phase: 'inner',
      highlightCevians: true,
      highlightInner: true,
      showRatio: false,
      equation: '',
      hold: 2400,
      result: false,
      caption: t(
        'The three cevians intersect in pairs to form △DEF. By Routh\'s theorem, when the ratio is 2:1, the inner triangle has area = ¹⁄₇ of the outer triangle.',
        'Ketiga garis cevian berpotongan berpasangan membentuk △DEF. Menurut teorema Routh, ketika perbandingannya 2:1, luas segitiga dalam = ¹⁄₇ luas segitiga luar.',
      ),
    },

    // Beat 3 — calculation
    {
      phase: 'calc',
      highlightCevians: false,
      highlightInner: true,
      showRatio: true,
      equation: '21 × ¹⁄₇ = 3',
      hold: 2400,
      result: false,
      caption: t(
        'Area △DEF = (1/7) × area △ABC = (1/7) × 21 = 3 cm².',
        'Luas △DEF = (1/7) × luas △ABC = (1/7) × 21 = 3 cm².',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      highlightCevians: false,
      highlightInner: true,
      showRatio: true,
      equation: '△DEF = 3 cm²',
      hold: 0,
      result: true,
      caption: t(
        'The area of △DEF is 3 cm².',
        'Luas △DEF adalah 3 cm².',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
