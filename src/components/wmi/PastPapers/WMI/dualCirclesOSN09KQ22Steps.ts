// OSN-09-SD-KAB-Q22 — Two congruent circles, shaded area = half of one circle.
//
// "Gambar di bawah adalah dua lingkaran kongruen berdiameter 20 cm.
//  Luas daerah yang diarsir adalah … cm² (π = 3,14)."
// Answer: 157 cm²
//
// Strategy: recognise the shaded region = half of one circle's area.
//   r = 20 ÷ 2 = 10 cm
//   Area of one circle = π × r² = 3.14 × 100 = 314 cm²
//   Shaded area        = 314 ÷ 2 = 157 cm²
//
// Beat sequence (3 beats):
//   1. Identify the circles: state radius r = 10 cm, area one circle = 314 cm².
//   2. Spot the shortcut: the shaded region = exactly half of one circle.
//   3. Calculate: 314 ÷ 2 = 157 cm² — the answer lands with hold=0.

export type Lang = 'en' | 'id'

export interface DualCirclesStep {
  /** Which beat (1-based). */
  beat: number
  /** Highlight the shaded dome in the figure. */
  highlightShade: boolean
  /** Show the area annotation next to the shaded region. */
  showArea: boolean
  /** Caption text for this beat. */
  caption: { en: string; id: string }
  /** Whether this is the final answer beat (hold = 0 after). */
  isResult: boolean
}

export function buildDualCirclesOSN09KQ22Steps(_lang: Lang): DualCirclesStep[] {
  return [
    {
      beat: 1,
      highlightShade: false,
      showArea: false,
      caption: {
        en: 'Each circle has diameter 20 cm → radius r = 10 cm. Area of one circle = π × r² = 3.14 × 100 = 314 cm².',
        id: 'Setiap lingkaran berdiameter 20 cm → jari-jari r = 10 cm. Luas satu lingkaran = π × r² = 3,14 × 100 = 314 cm².',
      },
      isResult: false,
    },
    {
      beat: 2,
      highlightShade: true,
      showArea: false,
      caption: {
        en: 'The shaded region is exactly half of one circle (a semicircle). So its area = 314 ÷ 2.',
        id: 'Daerah yang diarsir adalah tepat setengah dari satu lingkaran (setengah lingkaran). Maka luasnya = 314 ÷ 2.',
      },
      isResult: false,
    },
    {
      beat: 3,
      highlightShade: true,
      showArea: true,
      caption: {
        en: 'Shaded area = 314 ÷ 2 = 157 cm².',
        id: 'Luas daerah arsiran = 314 ÷ 2 = 157 cm².',
      },
      isResult: true,
    },
  ]
}
