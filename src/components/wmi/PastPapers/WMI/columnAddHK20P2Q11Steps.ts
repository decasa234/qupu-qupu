import type { Lang } from '../../concepts/explainers/makeTenSteps'

type ColHighlight = 'units' | 'tens' | 'none'

export interface ColumnAddHK20P2Q11Step {
  highlightCol: ColHighlight
  showCarry: boolean
  caption: string
  hold: number
  result: boolean
}

export interface ColumnAddHK20P2Q11Storyboard {
  steps: ColumnAddHK20P2Q11Step[]
  finalIndex: number
}

// Bound to seed quantities (HKIMO-20-P2H-Q11)
// AB + AA = 1C4; B + A = 14 (carry 1); 2A + 1 always odd → C is Odd.

export function buildColumnAddHK20P2Q11Steps(lang: Lang): ColumnAddHK20P2Q11Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ColumnAddHK20P2Q11Step[] = [
    {
      highlightCol: 'none',
      showCarry: false,
      caption: t(
        'AB + AA = 1C4. A, B, C are different digits. Is C odd or even?',
        'AB + AA = 1C4. A, B, C adalah angka berbeda. Apakah C ganjil atau genap?',
      ),
      hold: 2000,
      result: false,
    },
    {
      highlightCol: 'units',
      showCarry: false,
      caption: t(
        'Units: B + A ends in 4 → B + A = 4 or 14. If B + A = 4: tens needs carry → A ≥ 5, but B = 4 − A < 0. Impossible!',
        'Satuan: B + A berakhir 4 → B + A = 4 atau 14. Jika B + A = 4: puluhan perlu simpan → A ≥ 5, tapi B = 4 − A < 0. Mustahil!',
      ),
      hold: 3000,
      result: false,
    },
    {
      highlightCol: 'units',
      showCarry: true,
      caption: t(
        'So B + A = 14 — carry 1 passes to the tens column.',
        'Jadi B + A = 14 — simpan 1 masuk ke kolom puluhan.',
      ),
      hold: 2500,
      result: false,
    },
    {
      highlightCol: 'tens',
      showCarry: false,
      caption: t(
        'Tens: A + A + 1 (carry) = 2A + 1. For carry to hundreds: 2A + 1 ≥ 10 → A ≥ 5 ✓. C = (2A + 1) mod 10.',
        'Puluhan: A + A + 1 (simpan) = 2A + 1. Agar ada simpan ke ratusan: 2A + 1 ≥ 10 → A ≥ 5 ✓. C = (2A + 1) mod 10.',
      ),
      hold: 3000,
      result: false,
    },
    {
      highlightCol: 'tens',
      showCarry: false,
      caption: t(
        '2A is always even → 2A + 1 is always ODD. C is Odd!',
        '2A selalu genap → 2A + 1 selalu GANJIL. C adalah Ganjil!',
      ),
      hold: 3000,
      result: true,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
