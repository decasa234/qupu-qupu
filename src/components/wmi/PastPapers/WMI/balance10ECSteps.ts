// IKMC-23-EC-Q10 — balance scales, weight set aside.
// Six weights: 1,2,3,4,5,6 kg.  Total = 21 kg.
// 5 weights go on the scale (balanced); 1 is set aside.
// For balance: (21 − aside) must be even → aside must be odd: 1, 3, or 5.
// 5 is already on the scale, so aside ≠ 5.
// aside = 1: remaining 20 → each side 10 → {5,2,3} left, {6,4} right ✓
// aside = 3: remaining 18 → each side 9 → left needs 5 + two from {1,2,4,6} summing to 4
//            → only 2+2 but no repeats, or 1+3 but 3 aside → impossible ✗
// So the weight put aside is 1 kg. Answer A.
//
// Beats:
//   0 — Intro: show scale + aside weight, neutral
//   1 — Total all 6: sum = 21
//   2 — Parity rule: aside must be odd to leave even sum
//   3 — Eliminate 5 (already on scale) and 3 (can't split)
//   4 — Confirm aside=1: left={5,2,3}=10, right={6,4}=10
//   5 — Result: aside = 1 kg, answer A

import type { Lang } from '../../concepts/explainers/makeTenSteps'

// Problem constants (bound to seed quantities)
export const TOTAL_ALL = 21          // 1+2+3+4+5+6
export const ASIDE_WEIGHT = 1        // the weight put aside (answer)
export const EACH_SIDE = 10          // (21−1)÷2
export const LEFT_SUM = '5+2+3=10'
export const RIGHT_SUM = '6+4=10'

export type Balance10ECPhase = 'intro' | 'total' | 'parity' | 'eliminate' | 'check' | 'result'

export interface Balance10ECStep {
  phase: Balance10ECPhase
  /** Highlight left pan of the scale. */
  highlightLeft: boolean
  /** Highlight right pan of the scale. */
  highlightRight: boolean
  /** Highlight the aside weight. */
  highlightAside: boolean
  /** Key equation or running total displayed as a badge. */
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface Balance10ECStoryboard {
  aside: number
  eachSide: number
  steps: Balance10ECStep[]
  finalIndex: number
}

export function buildBalance10ECSteps(lang: Lang): Balance10ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Balance10ECStep[] = [
    // Beat 0 — Intro
    {
      phase: 'intro',
      highlightLeft: false,
      highlightRight: false,
      highlightAside: false,
      equation: '',
      hold: 1800,
      result: false,
      caption: t(
        'Six weights: 1–6 kg. Five go on the balanced scale; one is set aside. Which one?',
        'Enam beban: 1–6 kg. Lima dipasang di timbangan yang seimbang; satu disisihkan. Yang mana?',
      ),
    },
    // Beat 1 — Total all 6
    {
      phase: 'total',
      highlightLeft: false,
      highlightRight: false,
      highlightAside: false,
      equation: t('1+2+3+4+5+6 = 21', '1+2+3+4+5+6 = 21'),
      hold: 2200,
      result: false,
      caption: t(
        'Add all six weights: 1+2+3+4+5+6 = 21 kg.',
        'Jumlahkan keenam beban: 1+2+3+4+5+6 = 21 kg.',
      ),
    },
    // Beat 2 — Parity rule
    {
      phase: 'parity',
      highlightLeft: false,
      highlightRight: false,
      highlightAside: true,
      equation: t('21 − aside must be even', '21 − disisihkan harus genap'),
      hold: 2400,
      result: false,
      caption: t(
        'For the scale to balance, the remaining 5 weights must split equally. So (21 − aside) must be even — aside must be ODD: 1, 3, or 5.',
        'Agar timbangan seimbang, 5 beban sisanya harus terbagi rata. Jadi (21 − disisihkan) harus genap — disisihkan harus GANJIL: 1, 3, atau 5.',
      ),
    },
    // Beat 3 — Eliminate
    {
      phase: 'eliminate',
      highlightLeft: false,
      highlightRight: false,
      highlightAside: true,
      equation: t('5 is on the scale → aside ≠ 5', '5 ada di timbangan → bukan 5'),
      hold: 2400,
      result: false,
      caption: t(
        'The 5 kg weight is already on the left pan — so aside ≠ 5. Try aside = 3: remaining = 18, each side = 9, but left needs 5 plus two others summing to 4 — impossible. So aside = 1.',
        'Beban 5 kg sudah ada di sisi kiri — jadi bukan 5. Coba sisihkan 3: sisa = 18, setiap sisi = 9, tapi kiri butuh 5 ditambah dua lainnya berjumlah 4 — tidak mungkin. Jadi yang disisihkan = 1.',
      ),
    },
    // Beat 4 — Check aside=1
    {
      phase: 'check',
      highlightLeft: true,
      highlightRight: true,
      highlightAside: false,
      equation: `${LEFT_SUM}  |  ${RIGHT_SUM}`,
      hold: 2600,
      result: false,
      caption: t(
        `Aside = 1 kg: remaining sum = 20, each side = 10. Left: 5+2+3 = 10 ✓  Right: 6+4 = 10 ✓`,
        `Disisihkan = 1 kg: sisa = 20, setiap sisi = 10. Kiri: 5+2+3 = 10 ✓  Kanan: 6+4 = 10 ✓`,
      ),
    },
    // Beat 5 — Result
    {
      phase: 'result',
      highlightLeft: false,
      highlightRight: false,
      highlightAside: true,
      equation: t('Aside = 1 kg ✓', 'Disisihkan = 1 kg ✓'),
      hold: 0,
      result: true,
      caption: t(
        'The weight put aside is 1 kg — answer A.',
        'Beban yang disisihkan adalah 1 kg — jawaban A.',
      ),
    },
  ]

  return { aside: ASIDE_WEIGHT, eachSide: EACH_SIDE, steps, finalIndex: steps.length - 1 }
}
