// SEAMOX-24-B-Q7 — "In the figure below, find the value of x."
// Answer: x = 82°
//
// Figure: outer triangle with apex x°; two cevians from the base corners
// meet at interior point P with inner angle 129°. The outer slices of the
// base angles are 29° (bottom-left) and 18° (bottom-right).
//
// METHOD (nested-triangle angle sum):
//   1. Inner triangle BPC: α + β + 129° = 180° → α + β = 51°.
//   2. The full base angles of the outer triangle are (29°+α) at B and (β+18°) at C.
//   3. Outer triangle angle sum: x + (29°+α) + (β+18°) = 180°
//                                x + 47° + 51°        = 180°
//                                x                    = 82°.

import type { AngleHighlight } from './AngleNestedX24B7Illustration'

export type Lang = 'en' | 'id'

export interface NestedAngleStep {
  highlight: AngleHighlight
  showAnswer: boolean
  equationLine: string | null
  caption: string
  hold: number
  result: boolean
}

export interface NestedAngleStoryboard {
  steps: NestedAngleStep[]
  finalIndex: number
}

export function buildAngleNestedX24B7Steps(lang: Lang): NestedAngleStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: NestedAngleStep[] = [
    // 1. Introduce the figure
    {
      highlight: null,
      showAnswer: false,
      equationLine: null,
      hold: 2600,
      result: false,
      caption: t(
        'Two cevians from the base of the outer triangle meet at P inside, splitting each base angle into two parts. Find x°.',
        'Dua garis dari dasar segitiga luar bertemu di P dalam, membagi setiap sudut dasar menjadi dua bagian. Cari x°.',
      ),
    },
    // 2. Focus inner triangle (129°)
    {
      highlight: '129',
      showAnswer: false,
      equationLine: 'α + β = 180° − 129° = 51°',
      hold: 2800,
      result: false,
      caption: t(
        'In the inner triangle BPC, the three angles sum to 180°. The apex is 129°, so the two base angles (α and β) sum to 51°.',
        'Dalam segitiga dalam BPC, ketiga sudut berjumlah 180°. Sudut puncaknya 129°, jadi dua sudut dasar (α dan β) berjumlah 51°.',
      ),
    },
    // 3. Focus outer base corners
    {
      highlight: 'outer',
      showAnswer: false,
      equationLine: '∠B = 29° + α,   ∠C = β + 18°',
      hold: 2800,
      result: false,
      caption: t(
        'Each cevian splits a base corner: at B the full angle is 29° + α; at C it is β + 18°.',
        'Setiap garis membagi sudut dasar: di B sudut penuh adalah 29° + α; di C adalah β + 18°.',
      ),
    },
    // 4. Apply outer triangle angle sum
    {
      highlight: 'x',
      showAnswer: false,
      equationLine: 'x + (29° + α) + (β + 18°) = 180°',
      hold: 2600,
      result: false,
      caption: t(
        'The outer triangle\'s three angles also sum to 180°: x + (29° + α) + (β + 18°) = 180°.',
        'Ketiga sudut segitiga luar juga berjumlah 180°: x + (29° + α) + (β + 18°) = 180°.',
      ),
    },
    // 5. Substitute α + β = 51° and solve
    {
      highlight: 'x',
      showAnswer: true,
      equationLine: 'x + 47° + 51° = 180°  →  x = 82°',
      hold: 0,
      result: true,
      caption: t(
        'Substitute: x + 47° + 51° = 180°, so x = 180° − 98° = 82°.',
        'Substitusikan: x + 47° + 51° = 180°, jadi x = 180° − 98° = 82°.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
