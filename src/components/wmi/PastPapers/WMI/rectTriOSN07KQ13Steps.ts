// OSN-07-SD-KAB-Q13 storyboard — rectangle area minus three corner right triangles.
//
// ABCD rectangle: width 10 cm (AB = AF + FB = 6 + 4), height 8 cm (DA = DE + EA = 4 + 4).
// E on side DA (midpoint), F on side AB (AF = 6 from A).
// Shaded region: triangle ECF.
//
// Strategy: ECF area = rectangle − (△EAF + △FBC + △DCE)
//   Rectangle ABCD = 10 × 8 = 80 cm²
//   △EAF (right angle at A) = ½ × 6 × 4 = 12 cm²
//   △FBC (right angle at B) = ½ × 4 × 8 = 16 cm²
//   △DCE (right angle at D) = ½ × 10 × 4 = 20 cm²
//   △ECF = 80 − (12 + 16 + 20) = 80 − 48 = 32 cm²

export type Lang = 'en' | 'id'

export interface RectTriBeat {
  showEAF: boolean
  showFBC: boolean
  showDCE: boolean
  showResult: boolean
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface RectTriStoryboard {
  steps: RectTriBeat[]
  finalIndex: number
}

export function buildRectTriOSN07KQ13Steps(lang: Lang): RectTriStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: RectTriBeat[] = [
    // Beat 0 — intro: label the rectangle
    {
      showEAF: false,
      showFBC: false,
      showDCE: false,
      showResult: false,
      equation: '10 × 8 = 80 cm²',
      hold: 2200,
      result: false,
      caption: t(
        'Rectangle ABCD: AB = AF + FB = 6 + 4 = 10 cm; DA = DE + EA = 4 + 4 = 8 cm → total area = 80 cm².',
        'Persegi panjang ABCD: AB = AF + FB = 6 + 4 = 10 cm; DA = DE + EA = 4 + 4 = 8 cm → luas total = 80 cm².',
      ),
    },

    // Beat 1 — remove △EAF (bottom-left corner)
    {
      showEAF: true,
      showFBC: false,
      showDCE: false,
      showResult: false,
      equation: '½ × 6 × 4 = 12 cm²',
      hold: 2200,
      result: false,
      caption: t(
        'Subtract △EAF (right angle at A, base AF = 6 cm, height EA = 4 cm): ½ × 6 × 4 = 12 cm².',
        'Kurangi △EAF (siku-siku di A, alas AF = 6 cm, tinggi EA = 4 cm): ½ × 6 × 4 = 12 cm².',
      ),
    },

    // Beat 2 — remove △FBC (bottom-right corner)
    {
      showEAF: true,
      showFBC: true,
      showDCE: false,
      showResult: false,
      equation: '½ × 4 × 8 = 16 cm²',
      hold: 2200,
      result: false,
      caption: t(
        'Subtract △FBC (right angle at B, base FB = 4 cm, height BC = 8 cm): ½ × 4 × 8 = 16 cm².',
        'Kurangi △FBC (siku-siku di B, alas FB = 4 cm, tinggi BC = 8 cm): ½ × 4 × 8 = 16 cm².',
      ),
    },

    // Beat 3 — remove △DCE (top corner)
    {
      showEAF: true,
      showFBC: true,
      showDCE: true,
      showResult: false,
      equation: '½ × 10 × 4 = 20 cm²',
      hold: 2200,
      result: false,
      caption: t(
        'Subtract △DCE (right angle at D, base DC = 10 cm, height DE = 4 cm): ½ × 10 × 4 = 20 cm².',
        'Kurangi △DCE (siku-siku di D, alas DC = 10 cm, tinggi DE = 4 cm): ½ × 10 × 4 = 20 cm².',
      ),
    },

    // Beat 4 — result
    {
      showEAF: false,
      showFBC: false,
      showDCE: false,
      showResult: true,
      equation: '80 − 48 = 32 cm²',
      hold: 0,
      result: true,
      caption: t(
        'Shaded △ECF = 80 − (12 + 16 + 20) = 80 − 48 = 32 cm².',
        'Segitiga ECF yang diarsir = 80 − (12 + 16 + 20) = 80 − 48 = 32 cm².',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
