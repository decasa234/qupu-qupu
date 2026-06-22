// IKMC-19-EC-Q18 — storyboard for the framed-picture animation.
//
// The question: Anna used 32 small white squares to frame a 7×7 picture.
// How many squares does she need to frame a 10×10 picture? → Answer C (44).
//
// Teaching walk, one idea per beat:
//   0. intro    — show the 7×7 framed picture; name the 32-square frame.
//   1. top-side — highlight the top row of 9 border cells; count them.
//   2. sides    — highlight two full side columns (9 each); count them.
//   3. formula  — reveal border formula 4(n+2)−4; verify with n=7.
//   4. apply    — compute for n=10: 4×12−4 = 44.
//   5. result   — 44 → answer C (green).
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type FramePhaseId =
  | 'intro'
  | 'top-side'
  | 'sides'
  | 'formula'
  | 'apply'
  | 'result'

export interface FrameBeat {
  /** Which animation phase this beat belongs to. */
  phase: FramePhaseId
  /** Show dim overlay on all 32 border cells (intro pulse). */
  showFrame: boolean
  /** Highlight the top border row orange. */
  highlightTop: boolean
  /** Highlight all four sides with the running-sum overlay. */
  highlightAll: boolean
  /** Show the formula chip beneath the grid. */
  showFormula: boolean
  /** Show the n=10 derivation (replaces the 7×7 scene). */
  showApply: boolean
  /** Equation / maths line to display below the figure; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface FrameStoryboard {
  steps: FrameBeat[]
  finalIndex: number
}

export function buildFramedPic18ECSteps(lang: Lang): FrameStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: FrameBeat[] = [
    // Beat 0 — intro: show the framed picture, name the frame
    {
      phase: 'intro',
      showFrame: true,
      highlightTop: false,
      highlightAll: false,
      showFormula: false,
      showApply: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Anna uses 32 small white squares to frame a 7×7 picture. The outer grid is 9×9.',
        'Anna menggunakan 32 kotak kecil putih untuk membingkai gambar 7×7. Grid luar berukuran 9×9.',
      ),
    },

    // Beat 1 — count the top border row: 9 cells
    {
      phase: 'top-side',
      showFrame: true,
      highlightTop: true,
      highlightAll: false,
      showFormula: false,
      showApply: false,
      equation: 'top row = 9',
      hold: 2200,
      result: false,
      caption: t(
        'The top row of the frame has 9 white squares (= 7 + 2). Each of the four sides has 9.',
        'Baris atas bingkai memiliki 9 kotak putih (= 7 + 2). Setiap sisi punya 9 kotak.',
      ),
    },

    // Beat 2 — count all four sides, subtract 4 corners counted twice
    {
      phase: 'sides',
      showFrame: true,
      highlightTop: false,
      highlightAll: true,
      showFormula: false,
      showApply: false,
      equation: '4 × 9 − 4 = 32',
      hold: 2200,
      result: false,
      caption: t(
        '4 sides × 9 squares each = 36, but the 4 corners are counted twice: 36 − 4 = 32. ✓',
        '4 sisi × 9 kotak = 36, tetapi 4 sudut dihitung dua kali: 36 − 4 = 32. ✓',
      ),
    },

    // Beat 3 — reveal formula: 4(n+2)−4
    {
      phase: 'formula',
      showFrame: true,
      highlightTop: false,
      highlightAll: false,
      showFormula: true,
      showApply: false,
      equation: 'frame = 4(n+2) − 4',
      hold: 2200,
      result: false,
      caption: t(
        'General rule: frame = 4×(n+2) − 4. For n=7: 4×9 − 4 = 32. ✓',
        'Aturan umum: bingkai = 4×(n+2) − 4. Untuk n=7: 4×9 − 4 = 32. ✓',
      ),
    },

    // Beat 4 — apply to n=10
    {
      phase: 'apply',
      showFrame: false,
      highlightTop: false,
      highlightAll: false,
      showFormula: true,
      showApply: true,
      equation: '4 × 12 − 4 = 44',
      hold: 2200,
      result: false,
      caption: t(
        'For n=10: outer side = 10 + 2 = 12. Frame = 4 × 12 − 4 = 48 − 4 = 44.',
        'Untuk n=10: sisi luar = 10 + 2 = 12. Bingkai = 4 × 12 − 4 = 48 − 4 = 44.',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      showFrame: false,
      highlightTop: false,
      highlightAll: false,
      showFormula: false,
      showApply: true,
      equation: '44 → C',
      hold: 0,
      result: true,
      caption: t(
        'Anna needs 44 small white squares to frame a 10×10 picture — answer C.',
        'Anna membutuhkan 44 kotak kecil putih untuk membingkai gambar 10×10 — jawaban C.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
