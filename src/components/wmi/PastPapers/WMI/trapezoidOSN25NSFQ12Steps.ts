// OSN-25-SD-NAS-SEMIFINAL-Q12 storyboard — Trapesium ABCD.
//
// Diketahui: AD = 21 cm, BC = 7 cm (parallel), AB = 13 cm, DC = 15 cm.
// Cari: Luas ABCD.
//
// Strategi: turunkan tegak lurus dari B dan C ke DA.
//   Misalkan AM = a. Maka ND = 14 − a, MN = BC = 7, h = BM (tinggi).
//   AB² = a² + h² = 169  ... (1)
//   DC² = (14−a)² + h² = 225  ... (2)
//   (2) − (1): (14−a)² − a² = 56 → 196 − 28a = 56 → a = 5 → h = 12.
//   Luas = (1/2)(AD + BC) × h = (1/2)(21 + 7) × 12 = 168 cm².
//   (Kunci resmi: 84 cm².)
//
// Beat:
//   0. intro      — tampilkan trapesium, label semua sisi.
//   1. drop-perp  — turunkan tegak lurus BM dan CN; beri nama a dan (14−a).
//   2. eq-ab      — sorot AB; tulis persamaan a² + h² = 169.
//   3. eq-dc      — sorot DC; tulis persamaan (14−a)² + h² = 225.
//   4. solve      — kurangkan; a = 5, h = 12.
//   5. area       — isi trapesium; Luas = (1/2)(28)(12) = 168 cm² (kunci resmi: 84).

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type TrapPhase = 'intro' | 'drop-perp' | 'eq-ab' | 'eq-dc' | 'solve' | 'area'

export interface TrapStep {
  phase: TrapPhase
  showPerp: boolean
  highlightAB: boolean
  highlightDC: boolean
  highlightH: boolean
  fillArea: boolean
  heightLabel?: string
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface TrapStoryboard {
  steps: TrapStep[]
  finalIndex: number
}

export function buildTrapezoidOSN25NSFQ12Steps(lang: Lang): TrapStoryboard {
  const id = lang === 'id'

  const steps: TrapStep[] = [
    {
      phase: 'intro',
      showPerp: false, highlightAB: false, highlightDC: false, highlightH: false, fillArea: false,
      equation: 'AD = 21 cm,  BC = 7 cm,  AB = 13 cm,  DC = 15 cm',
      caption: id
        ? 'Trapesium ABCD dengan AD ∥ BC. Dua sisi sejajar: AD = 21 cm dan BC = 7 cm.'
        : 'Trapezium ABCD with AD ∥ BC. The two parallel sides are AD = 21 cm and BC = 7 cm.',
      hold: 2000,
      result: false,
    },
    {
      phase: 'drop-perp',
      showPerp: true, highlightAB: false, highlightDC: false, highlightH: false, fillArea: false,
      equation: 'AD − BC = 21 − 7 = 14 cm  →  AM = a,  ND = 14 − a',
      caption: id
        ? 'Turunkan tegak lurus BM dan CN ke DA. Selisih alas = 14 cm, sehingga AM + ND = 14.'
        : 'Drop perpendiculars from B and C to DA. Base difference = 14 cm, so AM + ND = 14.',
      hold: 2500,
      result: false,
    },
    {
      phase: 'eq-ab',
      showPerp: true, highlightAB: true, highlightDC: false, highlightH: false, fillArea: false,
      equation: 'AB² = a² + h²  →  13² = a² + h²  →  169 = a² + h²',
      caption: id
        ? 'Segitiga ABM: AB = 13, AM = a, BM = h → Pythagoras: a² + h² = 169.'
        : 'Triangle ABM: AB = 13, AM = a, BM = h → Pythagoras: a² + h² = 169.',
      hold: 2500,
      result: false,
    },
    {
      phase: 'eq-dc',
      showPerp: true, highlightAB: false, highlightDC: true, highlightH: false, fillArea: false,
      equation: 'DC² = (14−a)² + h²  →  225 = (14−a)² + h²',
      caption: id
        ? 'Segitiga DCN: DC = 15, DN = 14−a, CN = h → Pythagoras: (14−a)² + h² = 225.'
        : 'Triangle DCN: DC = 15, DN = 14−a, CN = h → Pythagoras: (14−a)² + h² = 225.',
      hold: 2500,
      result: false,
    },
    {
      phase: 'solve',
      showPerp: true, highlightAB: false, highlightDC: false, highlightH: true, fillArea: false,
      heightLabel: 'h=12',
      equation: '225 − 169 = (14−a)² − a²  →  56 = 196 − 28a  →  a = 5,  h = 12',
      caption: id
        ? 'Kurangkan persamaan: 196 − 28a = 56 → a = 5. Lalu h² = 169 − 25 = 144 → h = 12 cm.'
        : 'Subtract equations: 196 − 28a = 56 → a = 5. Then h² = 169 − 25 = 144 → h = 12 cm.',
      hold: 3000,
      result: false,
    },
    {
      phase: 'area',
      showPerp: false, highlightAB: false, highlightDC: false, highlightH: false, fillArea: true,
      equation: 'Luas = ½(AD + BC) × h = ½ × 28 × 12 = 168 cm²',
      caption: id
        ? 'Luas ABCD = ½(21 + 7) × 12 = 168 cm². (Kunci resmi: 84 cm².)'
        : 'Area ABCD = ½(21 + 7) × 12 = 168 cm². (Official key: 84 cm².)',
      hold: 3000,
      result: true,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
