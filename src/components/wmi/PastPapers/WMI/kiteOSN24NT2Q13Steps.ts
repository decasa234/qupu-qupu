// kiteOSN24NT2Q13Steps.ts — OSN-24-SD-NAS-TEORI2-Q13
//
// "Suppose that ABCD is a kite with AD = 5 cm, CD = 12 cm,
//  ∠BAD = 134,8° and ∠BCD = 45,2°. Determine the length of BD."
// Answer: BD = 10·cos(22,6°) ≈ 9,23 cm
//
// METHOD (isosceles triangle + law of sines):
//   1. Kite property: AB = AD = 5 cm and CB = CD = 12 cm.
//   2. Triangle ABD is isosceles (AB = AD = 5); apex angle ∠BAD = 134,8°.
//   3. Base angles: ∠ABD = ∠ADB = (180° − 134,8°) / 2 = 22,6°.
//   4. Law of sines: BD / sin(134,8°) = 5 / sin(22,6°).
//   5. sin(134,8°) = sin(45,2°) = 2·sin(22,6°)·cos(22,6°)
//      → BD = 5 × 2·cos(22,6°) = 10·cos(22,6°) ≈ 9,23 cm.

import type { KiteHighlight } from './KiteOSN24NT2Q13Illustration'

export type Lang = 'en' | 'id'

export interface KiteStep {
  highlight: KiteHighlight
  showAnswer: boolean
  equationLine: string | null
  caption: string
  hold: number
  result: boolean
}

export interface KiteStoryboard {
  steps: KiteStep[]
  finalIndex: number
}

export function buildKiteOSN24NT2Q13Steps(lang: Lang): KiteStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: KiteStep[] = [
    // 1. Introduce the kite
    {
      highlight: null,
      showAnswer: false,
      equationLine: null,
      hold: 2400,
      result: false,
      caption: t(
        'Kite ABCD has AD = 5 cm, CD = 12 cm, ∠BAD = 134.8°, and ∠BCD = 45.2°. Find BD.',
        'Layang-layang ABCD: AD = 5 cm, CD = 12 cm, ∠BAD = 134,8°, ∠BCD = 45,2°. Cari BD.',
      ),
    },
    // 2. Kite property — short pair AB = AD = 5
    {
      highlight: 'equal-short',
      showAnswer: false,
      equationLine: t('AB = AD = 5 cm  (kite property)', 'AB = AD = 5 cm  (sifat layang-layang)'),
      hold: 2600,
      result: false,
      caption: t(
        'In a kite the two pairs of adjacent sides are equal: the short pair AB = AD = 5 cm.',
        'Pada layang-layang, dua pasang sisi yang berdekatan sama panjang: pasangan pendek AB = AD = 5 cm.',
      ),
    },
    // 3. Focus on triangle ABD (isosceles)
    {
      highlight: 'triangle-ABD',
      showAnswer: false,
      equationLine: t('△ABD is isosceles:  AB = AD = 5 cm', '△ABD sama kaki:  AB = AD = 5 cm'),
      hold: 2800,
      result: false,
      caption: t(
        'Triangle ABD is isosceles with AB = AD = 5 cm and apex angle ∠BAD = 134.8°.',
        'Segitiga ABD adalah sama kaki dengan AB = AD = 5 cm dan sudut puncak ∠BAD = 134,8°.',
      ),
    },
    // 4. Base angles = 22.6°
    {
      highlight: 'base-angles',
      showAnswer: false,
      equationLine: t(
        '∠ABD = ∠ADB = (180° − 134.8°) / 2 = 22.6°',
        '∠ABD = ∠ADB = (180° − 134,8°) / 2 = 22,6°',
      ),
      hold: 2800,
      result: false,
      caption: t(
        'The two equal base angles are each (180° − 134.8°) ÷ 2 = 22.6°.',
        'Dua sudut alas yang sama besar masing-masing (180° − 134,8°) ÷ 2 = 22,6°.',
      ),
    },
    // 5. Apply law of sines → BD = 10·cos(22.6°)
    {
      highlight: 'BD',
      showAnswer: true,
      equationLine: t(
        'BD = 10·cos(22.6°) ≈ 9.23 cm',
        'BD = 10·cos(22,6°) ≈ 9,23 cm',
      ),
      hold: 0,
      result: true,
      caption: t(
        'By the law of sines: BD / sin(134.8°) = 5 / sin(22.6°). Since sin(134.8°) = 2 sin(22.6°)cos(22.6°), BD = 10·cos(22.6°) ≈ 9.23 cm.',
        'Aturan sinus: BD / sin(134,8°) = 5 / sin(22,6°). Karena sin(134,8°) = 2 sin(22,6°)cos(22,6°), diperoleh BD = 10·cos(22,6°) ≈ 9,23 cm.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
