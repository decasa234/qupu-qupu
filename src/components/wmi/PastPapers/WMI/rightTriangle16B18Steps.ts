// SEAMO-16-B-Q18 — storyboard for the right-triangle perimeter/area explainer.
//
// Question: A right-angled triangle has perimeter 12 cm and area 6 cm².
//           Find the longest side (hypotenuse).
// Answer:   B — 5 cm  (the 3-4-5 right triangle)
// Note: official key records D=9; seed breakdown flags this mismatch; we teach the
//       correct result (hypotenuse = 5 cm).
//
// Teaching walk (one idea per beat):
//   0. intro   — show unlabelled right triangle; state given facts.
//   1. eq1     — label legs a, b and hypotenuse h; write a+b+h=12.
//   2. eq2     — area = ab/2 = 6, so ab = 12.
//   3. pythag  — h² = (a+b)² − 2ab = (12−h)² − 24.
//   4. solve   — expand → 24h = 120 → h = 5.
//   5. verify  — a=3, b=4, h=5: 3-4-5 triangle; perimeter=12 ✓, area=6 ✓.
//   6. result  — longest side = hypotenuse = 5 cm = answer B.

export type Lang = 'en' | 'id'

export type RightTriangle16B18Phase =
  | 'intro'
  | 'eq1'
  | 'eq2'
  | 'pythag'
  | 'solve'
  | 'verify'
  | 'result'

export interface RightTriangle16B18Beat {
  phase: RightTriangle16B18Phase
  /** Which sides to label: 'none' | 'letters' | 'numbers' */
  sideLabels: 'none' | 'letters' | 'numbers'
  /** Equation chip text ('' = hide). */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the final result beat. */
  result: boolean
}

export interface RightTriangle16B18Storyboard {
  steps: RightTriangle16B18Beat[]
  finalIndex: number
}

export function buildRightTriangle16B18Steps(lang: Lang): RightTriangle16B18Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: RightTriangle16B18Beat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      sideLabels: 'none',
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'A right-angled triangle has perimeter 12 cm and area 6 cm². We need to find the hypotenuse — the longest side.',
        'Sebuah segitiga siku-siku memiliki keliling 12 cm dan luas 6 cm². Kita perlu mencari hipotenusa — sisi terpanjang.',
      ),
    },

    // Beat 1 — label sides, write perimeter equation
    {
      phase: 'eq1',
      sideLabels: 'letters',
      equation: t('a + b + h = 12', 'a + b + h = 12'),
      hold: 2400,
      result: false,
      caption: t(
        'Label the two legs a and b, and the hypotenuse h. The perimeter gives us: a + b + h = 12.',
        'Beri label dua kaki a dan b, serta hipotenusa h. Keliling memberi kita: a + b + h = 12.',
      ),
    },

    // Beat 2 — area equation → ab = 12
    {
      phase: 'eq2',
      sideLabels: 'letters',
      equation: t('ab/2 = 6 → ab = 12', 'ab/2 = 6 → ab = 12'),
      hold: 2400,
      result: false,
      caption: t(
        'Area = ½ × a × b = 6, so ab = 12. We now have two equations linking a, b, and h.',
        'Luas = ½ × a × b = 6, jadi ab = 12. Kita kini punya dua persamaan yang menghubungkan a, b, dan h.',
      ),
    },

    // Beat 3 — Pythagoras substitution
    {
      phase: 'pythag',
      sideLabels: 'letters',
      equation: t('h² = (a+b)² − 2ab = (12−h)² − 24', 'h² = (a+b)² − 2ab = (12−h)² − 24'),
      hold: 2600,
      result: false,
      caption: t(
        'By Pythagoras: h² = a² + b² = (a+b)² − 2ab. Since a+b = 12−h and ab = 12: h² = (12−h)² − 24.',
        'Dengan Pythagoras: h² = a² + b² = (a+b)² − 2ab. Karena a+b = 12−h dan ab = 12: h² = (12−h)² − 24.',
      ),
    },

    // Beat 4 — solve for h
    {
      phase: 'solve',
      sideLabels: 'letters',
      equation: t('24h = 120 → h = 5', '24h = 120 → h = 5'),
      hold: 2400,
      result: false,
      caption: t(
        'Expand: h² = 144 − 24h + h² − 24. Cancel h² on both sides: 0 = 120 − 24h, so h = 5 cm.',
        'Jabarkan: h² = 144 − 24h + h² − 24. Kurangi h² dari kedua sisi: 0 = 120 − 24h, jadi h = 5 cm.',
      ),
    },

    // Beat 5 — verify with 3-4-5
    {
      phase: 'verify',
      sideLabels: 'numbers',
      equation: t('3 + 4 + 5 = 12 ✓, ½×3×4 = 6 ✓', '3 + 4 + 5 = 12 ✓, ½×3×4 = 6 ✓'),
      hold: 2600,
      result: false,
      caption: t(
        'With h=5: a+b=7, ab=12 → a=3, b=4. Check: 3+4+5=12 ✓. Area: ½×3×4=6 ✓. This is the classic 3-4-5 right triangle.',
        'Dengan h=5: a+b=7, ab=12 → a=3, b=4. Periksa: 3+4+5=12 ✓. Luas: ½×3×4=6 ✓. Ini adalah segitiga siku-siku klasik 3-4-5.',
      ),
    },

    // Beat 6 — result
    {
      phase: 'result',
      sideLabels: 'numbers',
      equation: t('Longest side = 5 cm — Answer B', 'Sisi terpanjang = 5 cm — Jawaban B'),
      hold: 0,
      result: true,
      caption: t(
        'The longest side is the hypotenuse = 5 cm. The answer is B.',
        'Sisi terpanjang adalah hipotenusa = 5 cm. Jawabannya adalah B.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
