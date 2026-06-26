// OSN-24-SD-NAS-TEORI1-Q19 — Triangle DEFG area steps
//
// Method: subtract three corner triangles from ABC.
//   BDE ~ BAC (ratio 1:2) → area = ¼ × 12 = 3 cm²
//   CEF: CE = BC/2, CF = AC/3  → area = (1/6) × 12 = 2 cm²
//   AGD: AG = AC/3, AD = AB/2  → area = (1/6) × 12 = 2 cm²
//   DEFG = 12 − 3 − 2 − 2 = 5 cm²

import type { HighlightRegion } from './TriangleDEFGOSN24NT1Q19Illustration'

export type Lang = 'en' | 'id'

export interface DefgStep {
  highlight: HighlightRegion
  equationLine: string | null
  caption: string
  hold: number
  result: boolean
}

export interface DefgStoryboard {
  steps: DefgStep[]
  finalIndex: number
}

export function buildTriangleDEFGSteps(lang: Lang): DefgStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: DefgStep[] = [
    {
      highlight: null,
      equationLine: null,
      hold: 2400,
      result: false,
      caption: t(
        'Triangle ABC has area 12 cm². D and E are midpoints; F and G trisect AC from C. Find area of DEFG.',
        'Segitiga ABC luas 12 cm². D dan E titik tengah; F dan G membagi tiga AC dari C. Cari luas DEFG.',
      ),
    },
    {
      highlight: 'bde',
      equationLine: 'Area(BDE) = (½)² × 12 = 3 cm²',
      hold: 2800,
      result: false,
      caption: t(
        'Triangle BDE shares the same angle at B as ABC, with BD = AB/2 and BE = BC/2 (midsegment). It is similar to BAC with ratio 1:2, so its area is ¼ × 12 = 3 cm².',
        'Segitiga BDE berbagi sudut yang sama di B dengan ABC; BD = AB/2 dan BE = BC/2. Sebangun dengan BAC rasio 1:2, luasnya = ¼ × 12 = 3 cm².',
      ),
    },
    {
      highlight: 'cef',
      equationLine: 'Area(CEF) = ½ × ⅓ × 12 = 2 cm²',
      hold: 2800,
      result: false,
      caption: t(
        'Triangle CEF has CE = BC/2 (E is midpoint) and CF = AC/3 (trisection). Area(CEF)/Area(ABC) = (CE/BC)×(CF/AC) = ½ × ⅓ = ⅙ → 2 cm².',
        'Segitiga CEF: CE = BC/2 (E titik tengah) dan CF = AC/3 (triseksi). Luas(CEF)/Luas(ABC) = (CE/BC)×(CF/AC) = ½ × ⅓ = ⅙ → 2 cm².',
      ),
    },
    {
      highlight: 'agd',
      equationLine: 'Area(AGD) = ⅓ × ½ × 12 = 2 cm²',
      hold: 2800,
      result: false,
      caption: t(
        'Triangle AGD has AG = AC/3 (G is one-third from A) and AD = AB/2 (D is midpoint). Area ratio = ⅓ × ½ = ⅙ → 2 cm².',
        'Segitiga AGD: AG = AC/3 (G sepertiga dari A) dan AD = AB/2 (D titik tengah). Rasio luas = ⅓ × ½ = ⅙ → 2 cm².',
      ),
    },
    {
      highlight: 'defg',
      equationLine: '12 − 3 − 2 − 2 = 5 cm²',
      hold: 0,
      result: true,
      caption: t(
        'DEFG = Area(ABC) − Area(BDE) − Area(CEF) − Area(AGD) = 12 − 3 − 2 − 2 = 5 cm².',
        'DEFG = Luas(ABC) − Luas(BDE) − Luas(CEF) − Luas(AGD) = 12 − 3 − 2 − 2 = 5 cm².',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
