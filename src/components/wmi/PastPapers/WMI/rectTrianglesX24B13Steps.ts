// Steps storyboard for SEAMOX-24-B-Q13 explainer.
//
// Rectangle ABCD. DE:EC = 4:5, AF:FD = 7:5. Area △BEC = 60 cm². Find area △AFB.
// Solution: EC = 5w/9, so area △BEC = 5hw/18 = 60 → hw = 216.
//           AF = 7h/12, so area △AFB = 7hw/24 = 7×216/24 = 63 cm².

export type Lang = 'en' | 'id'

export type Phase =
  | 'intro'   // present the problem
  | 'bec'     // focus △BEC, derive hw = 216
  | 'rect'    // announce rectangle area
  | 'afb'     // focus △AFB, set up formula
  | 'result'  // reveal 63 cm²

export interface RectTriStep {
  phase: Phase
  highlightBEC: boolean
  highlightAFB: boolean
  afbArea: number | null        // when set, show this in △AFB instead of "?"
  equationLine: string | null   // formula shown below the figure
  caption: string
  hold: number                  // ms before auto-advancing
  result: boolean
}

export interface RectTriStoryboard {
  steps: RectTriStep[]
  finalIndex: number
}

export function buildRectTrianglesX24B13Steps(lang: Lang): RectTriStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: RectTriStep[] = [
    {
      phase: 'intro',
      highlightBEC: true,
      highlightAFB: true,
      afbArea: null,
      equationLine: null,
      hold: 2400,
      result: false,
      caption: t(
        'Rectangle ABCD. E splits DC (4:5); F splits AD (7:5). Area of △BEC = 60 cm². Find area of △AFB.',
        'Persegi panjang ABCD. E membagi DC (4:5); F membagi AD (7:5). Luas △BEC = 60 cm². Cari luas △AFB.',
      ),
    },
    {
      phase: 'bec',
      highlightBEC: true,
      highlightAFB: false,
      afbArea: null,
      equationLine: '½ × h × (5w/9) = 5hw/18 = 60',
      hold: 2800,
      result: false,
      caption: t(
        '△BEC has base EC = 5/9 × w and height BC = h. Area = 5hw/18 = 60, so hw = 216 cm².',
        '△BEC punya alas EC = 5/9 × w dan tinggi BC = h. Luas = 5hw/18 = 60, jadi hw = 216 cm².',
      ),
    },
    {
      phase: 'rect',
      highlightBEC: true,
      highlightAFB: true,
      afbArea: null,
      equationLine: 'hw = 216 cm²',
      hold: 2200,
      result: false,
      caption: t(
        'Rectangle area w × h = 216 cm². Now use AF to find △AFB.',
        'Luas persegi panjang w × h = 216 cm². Sekarang gunakan AF untuk mencari △AFB.',
      ),
    },
    {
      phase: 'afb',
      highlightBEC: false,
      highlightAFB: true,
      afbArea: null,
      equationLine: '½ × w × (7h/12) = 7hw/24',
      hold: 2800,
      result: false,
      caption: t(
        '△AFB has base AB = w and height AF = 7/12 × h. Area = 7hw/24.',
        '△AFB punya alas AB = w dan tinggi AF = 7/12 × h. Luas = 7hw/24.',
      ),
    },
    {
      phase: 'result',
      highlightBEC: false,
      highlightAFB: true,
      afbArea: 63,
      equationLine: '7 × 216 ÷ 24 = 63 cm²',
      hold: 0,
      result: true,
      caption: t(
        'Area of △AFB = 7 × 216 / 24 = 1512 / 24 = 63 cm².',
        'Luas △AFB = 7 × 216 / 24 = 1512 / 24 = 63 cm².',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
